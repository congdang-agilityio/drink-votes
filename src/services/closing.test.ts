import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../config.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting, getOuting } from '../db/outings.js';
import { createParticipant } from '../db/participants.js';
import { closePool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { castVote } from '../db/votes.js';
import { resetDb } from '../test/db.js';
import { closeDueOutings, closeOuting } from './closing.js';

const TZ = 'Asia/Ho_Chi_Minh';
// Existing scenarios predate the headcount rule: they run with no minimum.
const NO_MIN = 0;
// Headcount scenarios pin the threshold so an ambient MIN_PEOPLE cannot change them.
const MIN = 3;
// 20/10/2026 16:00 in Asia/Ho_Chi_Minh (UTC+7).
const CLOSE_INSTANT = new Date('2026-10-20T09:00:00Z');
const AT_1559 = new Date('2026-10-20T08:59:00Z');
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

interface Setup {
  outingId: string;
  a: string;
  b: string;
}

/** An outing on `date` closing at 16:00 that offers venues A and B. */
async function newOuting(date = '2026-10-20'): Promise<Setup> {
  const organizer = await createParticipant('Minh');
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  const outingId = await createOuting({
    date,
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId: organizer.id,
  });
  return { outingId, a: a.id, b: b.id };
}

/** Each venue id gets one Going voter per occurrence. */
async function vote(outingId: string, venueIds: string[]): Promise<void> {
  for (const venueId of venueIds) {
    const p = await createParticipant(`P ${Math.random()}`);
    await setAnswer(outingId, p.id, true);
    expect(await castVote(outingId, p.id, venueId)).toBe('ok');
  }
}

describe('closing service', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('does not close an outing at 15:59 on its date', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.a]);
    expect(await closeDueOutings({ now: AT_1559, tz: TZ, minPeople: NO_MIN })).toEqual([]);
    const outing = await getOuting(s.outingId);
    expect(outing?.closedAt).toBeNull();
    expect(outing?.winnerVenueId).toBeNull();
  });

  it('closes at 16:00 with the leader as winner and the close instant as closed_at', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.a, s.b, s.b]);
    expect(await closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN })).toEqual([s.outingId]);
    const outing = await getOuting(s.outingId);
    expect(outing?.closedAt).toEqual(CLOSE_INSTANT);
    expect(outing?.winnerVenueId).toBe(s.b);
    expect(outing?.cancelled).toBe(false);
  });

  it('records the close instant, not now, when the sweep runs late', async () => {
    const s = await newOuting();
    await closeDueOutings({ now: new Date('2026-10-21T02:00:00Z'), tz: TZ, minPeople: NO_MIN });
    expect((await getOuting(s.outingId))?.closedAt).toEqual(CLOSE_INSTANT);
  });

  it('closes with no winner on a tie or with no votes', async () => {
    const tie = await newOuting();
    await vote(tie.outingId, [tie.a, tie.b]);
    const none = await newOuting();
    const closed = await closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN });
    expect(closed.sort()).toEqual([tie.outingId, none.outingId].sort());
    expect((await getOuting(tie.outingId))?.winnerVenueId).toBeNull();
    expect((await getOuting(none.outingId))?.winnerVenueId).toBeNull();
    expect((await getOuting(none.outingId))?.closedAt).toEqual(CLOSE_INSTANT);
  });

  it('cancels a due outing with 2 Going, with no winner', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.a, s.a]);
    expect(await closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: MIN })).toEqual([
      s.outingId,
    ]);
    const outing = await getOuting(s.outingId);
    expect(outing?.cancelled).toBe(true);
    expect(outing?.winnerVenueId).toBeNull();
    expect(outing?.closedAt).toEqual(CLOSE_INSTANT);
  });

  it('does not cancel with exactly 3 Going', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.a, s.a, s.b]);
    await closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: MIN });
    const outing = await getOuting(s.outingId);
    expect(outing?.cancelled).toBe(false);
    expect(outing?.winnerVenueId).toBe(s.a);
  });

  it('cancels with nobody Going, and closeOuting reports it', async () => {
    const s = await newOuting();
    const state = await closeOuting(s.outingId, { now: CLOSE_INSTANT, tz: TZ, minPeople: MIN });
    expect(state).toMatchObject({
      cancelled: true,
      winnerVenueId: null,
      changed: true,
    });
  });

  it('defaults minPeople to config.minPeople', async () => {
    const s = await newOuting();
    const goingCount = config.minPeople - 1;
    await vote(s.outingId, Array.from({ length: goingCount }, () => s.a));
    const state = await closeOuting(s.outingId, { now: CLOSE_INSTANT, tz: TZ });
    expect(state?.cancelled).toBe(true);
  });

  it('uses minPeople 5: 4 Going cancels', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.a, s.a, s.a, s.b]);
    const state = await closeOuting(s.outingId, { now: CLOSE_INSTANT, tz: TZ, minPeople: 5 });
    expect(state?.cancelled).toBe(true);
  });

  it('keeps an outing dated tomorrow open', async () => {
    const s = await newOuting('2026-10-21');
    expect(await closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN })).toEqual([]);
    expect((await getOuting(s.outingId))?.closedAt).toBeNull();
  });

  it('returns due outings oldest close first', async () => {
    const later = await newOuting('2026-10-20');
    const earlier = await newOuting('2026-10-19');
    expect(await closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN })).toEqual([
      earlier.outingId,
      later.outingId,
    ]);
  });

  it('a second close changes nothing (closing is final)', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.a]);
    const first = await closeOuting(s.outingId, { now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN });
    expect(first).toMatchObject({
      outingId: s.outingId,
      closedAt: CLOSE_INSTANT,
      winnerVenueId: s.a,
      cancelled: false,
      changed: true,
    });

    // More votes after the close would change the leader if the close ran again.
    await vote(s.outingId, [s.b, s.b]);
    const later = new Date('2026-10-20T10:00:00Z');
    const second = await closeOuting(s.outingId, { now: later, tz: TZ, minPeople: NO_MIN });
    expect(second).toEqual({ ...first, changed: false });
    expect(await closeDueOutings({ now: later, tz: TZ, minPeople: NO_MIN })).toEqual([]);
    const outing = await getOuting(s.outingId);
    expect(outing?.closedAt).toEqual(CLOSE_INSTANT);
    expect(outing?.winnerVenueId).toBe(s.a);
  });

  it('an explicit close before the close instant records now', async () => {
    const s = await newOuting();
    await vote(s.outingId, [s.b]);
    const state = await closeOuting(s.outingId, { now: AT_1559, tz: TZ, minPeople: NO_MIN });
    expect(state).toMatchObject({ closedAt: AT_1559, winnerVenueId: s.b, changed: true });
    expect((await getOuting(s.outingId))?.closedAt).toEqual(AT_1559);
  });

  it('returns null for an unknown or malformed outing id', async () => {
    expect(await closeOuting(UNKNOWN, { now: CLOSE_INSTANT })).toBeNull();
    expect(await closeOuting('not-a-uuid', { now: CLOSE_INSTANT })).toBeNull();
  });

  it('concurrent sweeps close each outing exactly once', async () => {
    const s1 = await newOuting();
    const s2 = await newOuting('2026-10-19');
    const runs = await Promise.all(
      Array.from({ length: 4 }, () => closeDueOutings({ now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN })),
    );
    const all = runs.flat();
    expect(all.sort()).toEqual([s1.outingId, s2.outingId].sort());
  });

  it('concurrent explicit closes report exactly one change', async () => {
    const s = await newOuting();
    const results = await Promise.all(
      Array.from({ length: 4 }, () => closeOuting(s.outingId, { now: CLOSE_INSTANT, tz: TZ, minPeople: NO_MIN })),
    );
    expect(results.filter((r) => r?.changed)).toHaveLength(1);
  });
});
