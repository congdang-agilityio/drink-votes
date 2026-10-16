import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { listHistory } from '../db/history.js';
import { runReleaseStep } from '../db/migrate.js';
import { createOuting, getOuting } from '../db/outings.js';
import { closePool } from '../db/pool.js';
import { getTiedVenues } from '../db/ties.js';
import { createVenue } from '../db/venues.js';
import { castVote } from '../db/votes.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

/**
 * The release step (`npm run migrate`) closes the outings created in M1 whose close time has
 * already passed, with the M2 rules (S-25). M1 outings have no close columns set and no visits.
 */

const PAST = '2024-03-01'; // close 16:00, sit 18:30 Vietnam time: long gone
const FUTURE = '2099-03-01';
/** M1 answers and votes were cast before the close time. */
const BEFORE_CLOSE = { now: new Date('2024-03-01T00:00:00Z') };

/** An M1-shaped outing (open, no visit) on `date` offering venues A, B and C. */
async function seedM1(date: string) {
  const org = await asParticipant('Minh');
  const [a, b, c] = await Promise.all(
    ['A', 'B', 'C'].map((n) => createVenue({ name: `${n} ${Math.random()}`, address: n })),
  );
  const id = await createOuting({
    date,
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id, c.id],
    organizerId: org.participant.id,
  });
  return { id, org, a: a.id, b: b.id, c: c.id };
}

/** `n` Going participants. */
async function going(outingId: string, n: number) {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const { participant } = await asParticipant(`P${i}`);
    await setAnswer(outingId, participant.id, true, undefined, BEFORE_CLOSE);
    ids.push(participant.id);
  }
  return ids;
}

const post = (path: string, form: Record<string, string>, headers: Record<string, string>) =>
  createApp().request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams(form),
  });

const historyOf = async (id: string) => (await listHistory()).find((e) => e.id === id);

describe('release step: close past-due M1 outings', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('past-due with 2 Going: cancelled, listed in history as cancelled', async () => {
    const s = await seedM1(PAST);
    await going(s.id, 2);

    const { closed } = await runReleaseStep();

    expect(closed).toEqual([s.id]);
    const after = await getOuting(s.id);
    expect(after?.closedAt).not.toBeNull();
    expect(after?.cancelled).toBe(true);
    expect(after?.winnerVenueId).toBeNull();
    expect((await historyOf(s.id))?.outcome).toBe('cancelled');
  });

  it('past-due with 3 Going and one leader: that winner, history not yet confirmed', async () => {
    const s = await seedM1(PAST);
    const [p1, p2, p3] = await going(s.id, 3);
    await castVote(s.id, p1, s.b, BEFORE_CLOSE);
    await castVote(s.id, p2, s.b, BEFORE_CLOSE);
    await castVote(s.id, p3, s.a, BEFORE_CLOSE);

    await runReleaseStep();

    const after = await getOuting(s.id);
    expect(after?.cancelled).toBe(false);
    expect(after?.winnerVenueId).toBe(s.b);
    const entry = await historyOf(s.id);
    expect(entry?.outcome).toBe('won');
    expect(entry?.visited).toBeNull(); // shown as "Chưa xác nhận"
    expect(entry?.goingCount).toBe(3);
  });

  it('past-due with 3 Going and a tie: waiting with all tied venues recorded', async () => {
    const s = await seedM1(PAST);
    const [p1, p2, p3] = await going(s.id, 3);
    await castVote(s.id, p1, s.a, BEFORE_CLOSE);
    await castVote(s.id, p2, s.b, BEFORE_CLOSE);
    await castVote(s.id, p3, s.c, BEFORE_CLOSE);

    await runReleaseStep();

    const after = await getOuting(s.id);
    expect(after?.closedAt).not.toBeNull();
    expect(after?.cancelled).toBe(false);
    expect(after?.winnerVenueId).toBeNull();
    expect(await getTiedVenues(s.id)).toEqual([s.a, s.b, s.c]);
    expect((await historyOf(s.id))?.outcome).toBe('waiting');
  });

  it('past-due with 3 Going and no votes: waiting with every venue tied', async () => {
    const s = await seedM1(PAST);
    await going(s.id, 3);

    await runReleaseStep();

    const after = await getOuting(s.id);
    expect(after?.closedAt).not.toBeNull();
    expect(after?.winnerVenueId).toBeNull();
    expect(await getTiedVenues(s.id)).toEqual([s.a, s.b, s.c]);
  });

  it('the M1 organizer can choose among the tied venues, then confirm the visit', async () => {
    const s = await seedM1(PAST);
    const [p1, p2] = await going(s.id, 3);
    await castVote(s.id, p1, s.a, BEFORE_CLOSE);
    await castVote(s.id, p2, s.b, BEFORE_CLOSE);

    await runReleaseStep();
    expect(await getTiedVenues(s.id)).toEqual([s.a, s.b]);

    const chose = await post(`/outings/${s.id}/choose`, { venueId: s.b }, s.org.headers);
    expect(chose.status).toBe(303);
    expect((await getOuting(s.id))?.winnerVenueId).toBe(s.b);

    const visited = await post(`/outings/${s.id}/visit`, { visited: 'yes' }, s.org.headers);
    expect(visited.status).toBe(303);
    expect((await getOuting(s.id))?.visited).toBe(true);
    expect((await historyOf(s.id))?.visited).toBe(true);
  });

  it('an outing whose close time is still ahead stays open', async () => {
    const s = await seedM1(FUTURE);
    await going(s.id, 3);

    const { closed } = await runReleaseStep();

    expect(closed).toEqual([]);
    const after = await getOuting(s.id);
    expect(after?.closedAt).toBeNull();
    expect(after?.cancelled).toBe(false);
    expect(await historyOf(s.id)).toBeUndefined();
  });

  it('running it twice closes nothing the second time and keeps the first result', async () => {
    const s = await seedM1(PAST);
    const [p1] = await going(s.id, 3);
    await castVote(s.id, p1, s.c, BEFORE_CLOSE);

    expect((await runReleaseStep()).closed).toEqual([s.id]);
    const first = await getOuting(s.id);

    const second = await runReleaseStep();
    expect(second).toEqual({ applied: [], closed: [], failed: [] });
    const after = await getOuting(s.id);
    expect(after?.closedAt?.getTime()).toBe(first?.closedAt?.getTime());
    expect(after?.winnerVenueId).toBe(s.c);
  });
});
