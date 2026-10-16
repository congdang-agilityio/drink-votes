import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../config.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting, getOuting } from '../db/outings.js';
import { createParticipant } from '../db/participants.js';
import { closePool, getPool } from '../db/pool.js';
import { getTiedVenues } from '../db/ties.js';
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

/** Each venue id gets one Going voter per occurrence, voting at 15:59 (before the close). */
async function vote(outingId: string, venueIds: string[]): Promise<void> {
  const before = { now: AT_1559, tz: TZ };
  for (const venueId of venueIds) {
    const p = await createParticipant(`P ${Math.random()}`);
    expect(await setAnswer(outingId, p.id, true, undefined, before)).toBe('ok');
    expect(await castVote(outingId, p.id, venueId, before)).toBe('ok');
  }
}

/** Writes Going voters straight to the tables, bypassing the close check of castVote. */
async function forceVotes(outingId: string, venueIds: string[]): Promise<void> {
  for (const venueId of venueIds) {
    const p = await createParticipant(`P ${Math.random()}`);
    await getPool().query(
      'INSERT INTO attendance (outing_id, participant_id, going) VALUES ($1, $2, true)',
      [outingId, p.id],
    );
    await getPool().query(
      'INSERT INTO votes (outing_id, participant_id, venue_id) VALUES ($1, $2, $3)',
      [outingId, p.id, venueId],
    );
  }
}

/** An outing on 20/10 closing at 16:00 offering the given venues (created when not passed). */
async function outingWith(count: number): Promise<{ outingId: string; v: string[] }> {
  const organizer = await createParticipant('Minh');
  const v: string[] = [];
  for (let i = 0; i < count; i++) {
    v.push((await createVenue({ name: `V${i} ${Math.random()}`, address: 'x' })).id);
  }
  const outingId = await createOuting({
    date: '2026-10-20',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: v,
    organizerId: organizer.id,
  });
  return { outingId, v };
}

/** A past outing on `date` won by `venueId`, with the organizer's visit answer. */
async function pastWin(venueId: string, date: string, visited: boolean | null): Promise<void> {
  const organizer = await createParticipant('Minh');
  const id = await createOuting({
    date,
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [venueId],
    organizerId: organizer.id,
  });
  await getPool().query(
    'UPDATE outings SET closed_at = now(), winner_venue_id = $2, visited = $3 WHERE id = $1',
    [id, venueId, visited],
  );
}

/** Going participants who do not vote. */
async function goingOnly(outingId: string, n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    const p = await createParticipant(`G ${Math.random()}`);
    expect(await setAnswer(outingId, p.id, true, undefined, { now: AT_1559, tz: TZ })).toBe('ok');
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
    await forceVotes(s.outingId, [s.b, s.b]);
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
  describe('least-recently-visited tie-break (#90)', () => {
    const opts = { now: CLOSE_INSTANT, tz: TZ, minPeople: MIN };

    it('AC1: a never visited venue beats a visited one', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await pastWin(a, '2026-10-01', true);
      await vote(outingId, [a, b, a, b]);
      expect((await closeOuting(outingId, opts))?.winnerVenueId).toBe(b);
    });

    it('AC2: the oldest last visit wins', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await pastWin(a, '2026-09-01', true);
      await pastWin(b, '2026-10-01', true);
      await vote(outingId, [a, b, a, b]);
      expect((await closeOuting(outingId, opts))?.winnerVenueId).toBe(a);
    });

    it('AC3: a win marked "Không đi" or unanswered ranks as never visited', async () => {
      for (const answer of [false, null]) {
        await resetDb();
        const { outingId, v: [a, b] } = await outingWith(2);
        await pastWin(a, '2026-10-05', answer);
        await pastWin(b, '2026-10-01', true);
        await vote(outingId, [a, b, a, b]);
        expect((await closeOuting(outingId, opts))?.winnerVenueId).toBe(a);
      }
    });

    it('AC4: with no votes every venue is tied and the oldest visit wins', async () => {
      const { outingId, v: [a, b, c] } = await outingWith(3);
      await pastWin(a, '2026-10-01', true);
      await pastWin(b, '2026-09-01', true);
      await pastWin(c, '2026-09-15', true);
      await goingOnly(outingId, MIN);
      const closed = await closeDueOutings(opts);
      expect(closed).toEqual([outingId]);
      const outing = await getOuting(outingId);
      expect(outing?.cancelled).toBe(false);
      expect(outing?.winnerVenueId).toBe(b);
    });

    it('AC5: 3/1/1 votes ignores visits', async () => {
      const { outingId, v: [a, b, c] } = await outingWith(3);
      await pastWin(a, '2026-10-10', true);
      await vote(outingId, [a, a, a, b, c]);
      expect((await closeOuting(outingId, opts))?.winnerVenueId).toBe(a);
    });

    it('two never visited tied venues close with no winner', async () => {
      const { outingId, v: [a, b, c] } = await outingWith(3);
      await pastWin(c, '2026-10-01', true);
      await vote(outingId, [a, b, a, b]);
      const state = await closeOuting(outingId, opts);
      expect(state).toMatchObject({ cancelled: false, winnerVenueId: null, changed: true });
    });

    it('cancels before the tie-break with fewer than MIN_PEOPLE Going', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await pastWin(a, '2026-10-01', true);
      await vote(outingId, [a, b]);
      expect(await closeOuting(outingId, opts)).toMatchObject({
        cancelled: true,
        winnerVenueId: null,
      });
    });
  });

  describe('venues still tied at close (#115)', () => {
    const opts = { now: CLOSE_INSTANT, tz: TZ, minPeople: MIN };

    it('two never visited venues tied: closed, no winner, both stored as tied', async () => {
      const { outingId, v: [a, b, c] } = await outingWith(3);
      await pastWin(c, '2026-10-01', true);
      await vote(outingId, [a, b, a, b]);
      expect(await closeOuting(outingId, opts)).toMatchObject({
        cancelled: false,
        winnerVenueId: null,
        changed: true,
      });
      expect(await getTiedVenues(outingId)).toEqual([a, b]);
    });

    it('same last visit date: both tied (sweep)', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await pastWin(a, '2026-10-01', true);
      await pastWin(b, '2026-10-01', true);
      await vote(outingId, [a, b, a, b]);
      expect(await closeDueOutings(opts)).toEqual([outingId]);
      const outing = await getOuting(outingId);
      expect(outing?.closedAt).toEqual(CLOSE_INSTANT);
      expect(outing?.winnerVenueId).toBeNull();
      expect(await getTiedVenues(outingId)).toEqual([a, b]);
    });

    it('no votes with two never visited venues: both tied', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await goingOnly(outingId, MIN);
      expect(await closeDueOutings(opts)).toEqual([outingId]);
      expect((await getOuting(outingId))?.winnerVenueId).toBeNull();
      expect(await getTiedVenues(outingId)).toEqual([a, b]);
    });

    it('a cancelled outing stores no ties', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await vote(outingId, [a, b]);
      expect((await closeOuting(outingId, opts))?.cancelled).toBe(true);
      expect(await getTiedVenues(outingId)).toEqual([]);
    });

    it('a winner stores no ties', async () => {
      const { outingId, v: [a, b] } = await outingWith(2);
      await vote(outingId, [a, a, b]);
      expect((await closeOuting(outingId, opts))?.winnerVenueId).toBe(a);
      expect(await getTiedVenues(outingId)).toEqual([]);
    });
  });

  it('logs a failing outing and still closes the others', async () => {
    const bad = await newOuting();
    const good = await newOuting('2026-10-21');
    await getPool().query(`
      CREATE OR REPLACE FUNCTION fail_close() RETURNS trigger AS $$
      BEGIN
        IF NEW.id = '${bad.outingId}' THEN RAISE EXCEPTION 'boom'; END IF;
        RETURN NEW;
      END $$ LANGUAGE plpgsql`);
    await getPool().query(
      'CREATE TRIGGER fail_close BEFORE UPDATE ON outings FOR EACH ROW EXECUTE FUNCTION fail_close()',
    );
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const closed = await closeDueOutings({
        now: new Date('2026-10-22T00:00:00Z'),
        tz: TZ,
        minPeople: NO_MIN,
      });
      expect(closed).toEqual([good.outingId]);
      expect(log).toHaveBeenCalledTimes(1);
      expect(String(log.mock.calls[0][0])).toContain(bad.outingId);
      expect((await getOuting(bad.outingId))?.closedAt).toBeNull();
      expect((await getOuting(good.outingId))?.closedAt).not.toBeNull();
    } finally {
      log.mockRestore();
      await getPool().query('DROP TRIGGER fail_close ON outings');
      await getPool().query('DROP FUNCTION fail_close()');
    }
  });
});
