import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { getAnswer, getAttendance, setAnswer } from './attendance.js';
import { createOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { createVenue } from './venues.js';
import { castVote, getVote, getVoteCounts } from './votes.js';

const UNKNOWN = '00000000-0000-4000-8000-000000000000';

async function newOuting(organizerId: string): Promise<string> {
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  return createOuting({
    date: '2030-12-31',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId,
  });
}

const rowCount = async (outingId: string, participantId: string) =>
  (
    await getPool().query(
      'SELECT count(*)::int AS n FROM attendance WHERE outing_id = $1 AND participant_id = $2',
      [outingId, participantId],
    )
  ).rows[0].n;

describe('attendance store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('a fresh outing has count 0 and an empty list; the organizer has no row', async () => {
    const organizer = await createParticipant('Minh');
    const outingId = await newOuting(organizer.id);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 0, goingNames: [] });
    expect(await getAnswer(outingId, organizer.id)).toBeNull();
    expect(await rowCount(outingId, organizer.id)).toBe(0);
  });

  it('Going adds 1 and the name', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    await setAnswer(outingId, lan.id, true);
    expect(await getAnswer(outingId, lan.id)).toBe(true);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 1, goingNames: ['Lan'] });
  });

  it('Not going adds nothing and is not listed', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    await setAnswer(outingId, lan.id, false);
    expect(await getAnswer(outingId, lan.id)).toBe(false);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 0, goingNames: [] });
  });

  it('switching Going -> Not going -> Going updates count and list with exactly one row', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);

    await setAnswer(outingId, lan.id, true);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 1, goingNames: ['Lan'] });
    expect(await rowCount(outingId, lan.id)).toBe(1);

    await setAnswer(outingId, lan.id, false);
    expect(await getAnswer(outingId, lan.id)).toBe(false);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 0, goingNames: [] });
    expect(await rowCount(outingId, lan.id)).toBe(1);

    await setAnswer(outingId, lan.id, true);
    expect(await getAnswer(outingId, lan.id)).toBe(true);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 1, goingNames: ['Lan'] });
    expect(await rowCount(outingId, lan.id)).toBe(1);
  });

  it('concurrent answers from one person leave exactly one row', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    await Promise.all(
      Array.from({ length: 8 }, (_, i) => setAnswer(outingId, lan.id, i % 2 === 0)),
    );
    expect(await rowCount(outingId, lan.id)).toBe(1);
    expect(typeof (await getAnswer(outingId, lan.id))).toBe('boolean');
  });

  it('keeps answered_at and moves updated_at when the answer changes', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    await setAnswer(outingId, lan.id, true);
    const read = async () =>
      (
        await getPool().query(
          'SELECT answered_at, updated_at FROM attendance WHERE outing_id = $1 AND participant_id = $2',
          [outingId, lan.id],
        )
      ).rows[0];
    const before = await read();
    await setAnswer(outingId, lan.id, false);
    const after = await read();
    expect(after.answered_at).toEqual(before.answered_at);
    expect(after.updated_at.getTime()).toBeGreaterThanOrEqual(before.updated_at.getTime());
  });

  it('two participants both named "Lan" give count 2 and two "Lan" entries', async () => {
    const organizer = await createParticipant('Minh');
    const lan1 = await createParticipant('Lan');
    const lan2 = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    await setAnswer(outingId, lan1.id, true);
    await setAnswer(outingId, lan2.id, true);
    expect(await getAttendance(outingId)).toEqual({ goingCount: 2, goingNames: ['Lan', 'Lan'] });
  });

  it('lists Going names by first answer time with the current name', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const hoa = await createParticipant('Hoa');
    const outingId = await newOuting(organizer.id);
    await setAnswer(outingId, hoa.id, true);
    await setAnswer(outingId, lan.id, true);
    // Re-answering keeps the original place in the list.
    await setAnswer(outingId, hoa.id, true);
    await getPool().query("UPDATE participants SET display_name = 'Hoa Mai' WHERE id = $1", [
      hoa.id,
    ]);
    expect(await getAttendance(outingId)).toEqual({
      goingCount: 2,
      goingNames: ['Hoa Mai', 'Lan'],
    });
  });

  it('runs setAnswer on a given client inside its transaction', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await setAnswer(outingId, lan.id, true, client);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    expect(await getAnswer(outingId, lan.id)).toBeNull();
  });

  it('Not going removes the vote; switching back to Going creates none', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const hoa = await createParticipant('Hoa');
    const outingId = await newOuting(organizer.id);
    const [a] = (await getVoteCounts(outingId)).map((c) => c.venueId);
    await setAnswer(outingId, lan.id, true);
    await setAnswer(outingId, hoa.id, true);
    await castVote(outingId, lan.id, a);
    await castVote(outingId, hoa.id, a);
    expect((await getVoteCounts(outingId))[0].count).toBe(2);

    await setAnswer(outingId, lan.id, false);
    expect((await getVoteCounts(outingId))[0].count).toBe(1);
    expect(await getVote(outingId, lan.id)).toBeNull();
    expect(await getVote(outingId, hoa.id)).toBe(a);

    await setAnswer(outingId, lan.id, true);
    expect(await getVote(outingId, lan.id)).toBeNull();
    expect((await getVoteCounts(outingId))[0].count).toBe(1);
  });

  it('Not going on a given client removes the vote only when that transaction commits', async () => {
    const organizer = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const outingId = await newOuting(organizer.id);
    const [a] = (await getVoteCounts(outingId)).map((c) => c.venueId);
    await setAnswer(outingId, lan.id, true);
    await castVote(outingId, lan.id, a);
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await setAnswer(outingId, lan.id, false, client);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    expect(await getAnswer(outingId, lan.id)).toBe(true);
    expect(await getVote(outingId, lan.id)).toBe(a);
  });

  it('returns null / empty for malformed or unknown ids', async () => {
    expect(await getAnswer('not-a-uuid', UNKNOWN)).toBeNull();
    expect(await getAnswer(UNKNOWN, UNKNOWN)).toBeNull();
    expect(await getAttendance('not-a-uuid')).toEqual({ goingCount: 0, goingNames: [] });
  });

  it('rejects an answer for an unknown outing or participant', async () => {
    const organizer = await createParticipant('Minh');
    const outingId = await newOuting(organizer.id);
    await expect(setAnswer(UNKNOWN, organizer.id, true)).rejects.toThrow();
    await expect(setAnswer(outingId, UNKNOWN, true)).rejects.toThrow();
  });

  describe('close check (2030-12-31 16:00 Asia/Ho_Chi_Minh = 09:00Z)', () => {
    const at = (iso: string) => ({ now: new Date(iso) });
    const BEFORE = at('2030-12-31T08:59:00Z');
    const AT_CLOSE = at('2030-12-31T09:00:00Z');
    const AFTER = at('2030-12-31T12:00:00Z');

    it('accepts an answer one minute before the close instant', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      expect(await setAnswer(outingId, lan.id, true, undefined, BEFORE)).toBe('ok');
      expect(await getAnswer(outingId, lan.id)).toBe(true);
    });

    it('refuses a first answer at and after the close instant and writes nothing', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      for (const when of [AT_CLOSE, AFTER]) {
        expect(await setAnswer(outingId, lan.id, true, undefined, when)).toBe('closed');
      }
      expect(await rowCount(outingId, lan.id)).toBe(0);
      expect(await getAttendance(outingId)).toEqual({ goingCount: 0, goingNames: [] });
    });

    it('keeps the answer and the vote after a refused Not going', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      const [a] = (await getVoteCounts(outingId)).map((c) => c.venueId);
      await setAnswer(outingId, lan.id, true, undefined, BEFORE);
      await castVote(outingId, lan.id, a, BEFORE);
      expect(await setAnswer(outingId, lan.id, false, undefined, AT_CLOSE)).toBe('closed');
      expect(await getAnswer(outingId, lan.id)).toBe(true);
      expect(await getVote(outingId, lan.id)).toBe(a);
      expect(await getAttendance(outingId)).toEqual({ goingCount: 1, goingNames: ['Lan'] });
    });

    it('refuses an answer when the outing is marked closed, even before the close time', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      await setAnswer(outingId, lan.id, true, undefined, BEFORE);
      await getPool().query('UPDATE outings SET closed_at = now() WHERE id = $1', [outingId]);
      expect(await setAnswer(outingId, lan.id, false, undefined, BEFORE)).toBe('closed');
      expect(await getAnswer(outingId, lan.id)).toBe(true);
    });

    it('reads the close time in the given time zone', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      // 12:00Z is past 16:00 in Vietnam but before 16:00 UTC.
      const utc = { tz: 'UTC', now: new Date('2030-12-31T12:00:00Z') };
      expect(await setAnswer(outingId, lan.id, true, undefined, utc)).toBe('ok');
      const utcClose = { tz: 'UTC', now: new Date('2030-12-31T16:00:00Z') };
      expect(await setAnswer(outingId, lan.id, false, undefined, utcClose)).toBe('closed');
    });

    it('waits for a concurrent close holding the outing FOR UPDATE, then refuses', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      const [a] = (await getVoteCounts(outingId)).map((c) => c.venueId);
      await setAnswer(outingId, lan.id, true, undefined, BEFORE);
      const closer = await getPool().connect();
      try {
        await closer.query('BEGIN');
        await closer.query('SELECT 1 FROM outings WHERE id = $1 FOR UPDATE', [outingId]);
        const answer = setAnswer(outingId, lan.id, false, undefined, BEFORE);
        const vote = castVote(outingId, lan.id, a, BEFORE);
        await new Promise((r) => setTimeout(r, 200));
        await closer.query('UPDATE outings SET closed_at = now() WHERE id = $1', [outingId]);
        await closer.query('COMMIT');
        expect(await answer).toBe('closed');
        expect(await vote).toBe('closed');
      } finally {
        closer.release();
      }
      expect(await getAnswer(outingId, lan.id)).toBe(true);
      expect(await getVote(outingId, lan.id)).toBeNull();
    });

    it('refuses on a given client inside its transaction', async () => {
      const organizer = await createParticipant('Minh');
      const lan = await createParticipant('Lan');
      const outingId = await newOuting(organizer.id);
      const client = await getPool().connect();
      try {
        await client.query('BEGIN');
        expect(await setAnswer(outingId, lan.id, true, client, AT_CLOSE)).toBe('closed');
        await client.query('COMMIT');
      } finally {
        client.release();
      }
      expect(await getAnswer(outingId, lan.id)).toBeNull();
    });
  });
});
