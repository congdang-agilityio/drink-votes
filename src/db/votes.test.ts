import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { setAnswer } from './attendance.js';
import { createOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { createVenue } from './venues.js';
import { castVote, getVote, getVoteCounts } from './votes.js';

const UNKNOWN = '00000000-0000-4000-8000-000000000000';

interface Setup {
  outingId: string;
  a: string;
  b: string;
  c: string;
  organizerId: string;
}

/** An outing offering venues A, B, C in that order. */
async function newOuting(): Promise<Setup> {
  const organizer = await createParticipant('Minh');
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  const c = await createVenue({ name: `C ${Math.random()}`, address: 'c' });
  const outingId = await createOuting({
    date: '2026-12-31',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id, c.id],
    organizerId: organizer.id,
  });
  return { outingId, a: a.id, b: b.id, c: c.id, organizerId: organizer.id };
}

const voteRows = async (outingId: string, participantId: string) =>
  (
    await getPool().query(
      'SELECT count(*)::int AS n FROM votes WHERE outing_id = $1 AND participant_id = $2',
      [outingId, participantId],
    )
  ).rows[0].n;

describe('vote store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('a Going person votes A: A = 1', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    await setAnswer(s.outingId, lan.id, true);
    expect(await castVote(s.outingId, lan.id, s.a)).toBe('ok');
    expect(await getVote(s.outingId, lan.id)).toBe(s.a);
    expect(await getVoteCounts(s.outingId)).toEqual([
      { venueId: s.a, count: 1 },
      { venueId: s.b, count: 0 },
      { venueId: s.c, count: 0 },
    ]);
  });

  it('changing the vote to B moves it: A = 0, B = 1, one row', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    await setAnswer(s.outingId, lan.id, true);
    await castVote(s.outingId, lan.id, s.a);
    expect(await castVote(s.outingId, lan.id, s.b)).toBe('ok');
    expect(await getVote(s.outingId, lan.id)).toBe(s.b);
    expect(await voteRows(s.outingId, lan.id)).toBe(1);
    expect(await getVoteCounts(s.outingId)).toEqual([
      { venueId: s.a, count: 0 },
      { venueId: s.b, count: 1 },
      { venueId: s.c, count: 0 },
    ]);
  });

  it('a Not going person gets not_going and no row', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    await setAnswer(s.outingId, lan.id, false);
    expect(await castVote(s.outingId, lan.id, s.a)).toBe('not_going');
    expect(await voteRows(s.outingId, lan.id)).toBe(0);
    expect(await getVote(s.outingId, lan.id)).toBeNull();
  });

  it('an unanswered person (including the organizer) gets not_going and no row', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    expect(await castVote(s.outingId, lan.id, s.a)).toBe('not_going');
    expect(await castVote(s.outingId, s.organizerId, s.a)).toBe('not_going');
    expect(await voteRows(s.outingId, lan.id)).toBe(0);
    expect(await voteRows(s.outingId, s.organizerId)).toBe(0);
  });

  it('a venue outside the outing gives unknown_venue and no row', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    const other = await createVenue({ name: `Other ${Math.random()}`, address: 'o' });
    await setAnswer(s.outingId, lan.id, true);
    expect(await castVote(s.outingId, lan.id, other.id)).toBe('unknown_venue');
    expect(await castVote(s.outingId, lan.id, UNKNOWN)).toBe('unknown_venue');
    expect(await voteRows(s.outingId, lan.id)).toBe(0);
  });

  it('counts include zero-vote venues in outing order across several voters', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    const hoa = await createParticipant('Hoa');
    const tuan = await createParticipant('Tuan');
    for (const p of [lan, hoa, tuan]) await setAnswer(s.outingId, p.id, true);
    await castVote(s.outingId, lan.id, s.c);
    await castVote(s.outingId, hoa.id, s.c);
    await castVote(s.outingId, tuan.id, s.a);
    expect(await getVoteCounts(s.outingId)).toEqual([
      { venueId: s.a, count: 1 },
      { venueId: s.b, count: 0 },
      { venueId: s.c, count: 2 },
    ]);
  });

  it('concurrent votes from one person leave exactly one row', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    await setAnswer(s.outingId, lan.id, true);
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) => castVote(s.outingId, lan.id, i % 2 ? s.a : s.b)),
    );
    expect(results.every((r) => r === 'ok')).toBe(true);
    expect(await voteRows(s.outingId, lan.id)).toBe(1);
  });

  it('a vote racing with Not going never leaves a vote behind', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    await setAnswer(s.outingId, lan.id, true);
    await Promise.all([
      castVote(s.outingId, lan.id, s.a),
      setAnswer(s.outingId, lan.id, false),
      castVote(s.outingId, lan.id, s.b),
    ]);
    expect(await voteRows(s.outingId, lan.id)).toBe(0);
  });

  it('handles malformed and unknown ids without throwing', async () => {
    const s = await newOuting();
    expect(await castVote('not-a-uuid', UNKNOWN, s.a)).toBe('not_going');
    expect(await castVote(s.outingId, 'nope', s.a)).toBe('not_going');
    const lan = await createParticipant('Lan');
    await setAnswer(s.outingId, lan.id, true);
    expect(await castVote(s.outingId, lan.id, 'bad')).toBe('unknown_venue');
    expect(await getVote('not-a-uuid', lan.id)).toBeNull();
    expect(await getVote(s.outingId, UNKNOWN)).toBeNull();
    expect(await getVoteCounts('not-a-uuid')).toEqual([]);
    expect(await getVoteCounts(UNKNOWN)).toEqual([]);
  });

  it('the votes table rejects a vote without an attendance row', async () => {
    const s = await newOuting();
    const lan = await createParticipant('Lan');
    await expect(
      getPool().query(
        'INSERT INTO votes (outing_id, participant_id, venue_id) VALUES ($1, $2, $3)',
        [s.outingId, lan.id, s.a],
      ),
    ).rejects.toThrow();
  });
});
