import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { getAnswer, getAttendance, setAnswer } from './attendance.js';
import { createOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { createVenue } from './venues.js';

const UNKNOWN = '00000000-0000-4000-8000-000000000000';

async function newOuting(organizerId: string): Promise<string> {
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  return createOuting({
    date: '2026-12-31',
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
});
