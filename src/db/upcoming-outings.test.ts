import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { setAnswer } from './attendance.js';
import { createOuting, getOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { listUpcomingOutings } from './upcoming-outings.js';
import { createVenue } from './venues.js';

async function outing(organizerId: string, date: string, sitTime = '18:30'): Promise<string> {
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  return createOuting({ date, sitTime, closeTime: '16:00', venueIds: [a.id, b.id], organizerId });
}

describe('listUpcomingOutings', () => {
  beforeEach(async () => {
    await resetDb();
  });
  afterAll(async () => {
    await closePool();
  });

  it('returns outings from today on, soonest first, hiding older ones', async () => {
    const o = await createParticipant('Minh');
    const d17 = await outing(o.id, '2026-10-17');
    const d15 = await outing(o.id, '2026-10-15');
    const d16 = await outing(o.id, '2026-10-16');
    await outing(o.id, '2026-10-14');
    const list = await listUpcomingOutings('2026-10-15');
    expect(list.map((r) => r.id)).toEqual([d15, d16, d17]);
    expect(list[0]).toEqual({ id: d15, date: '2026-10-15', sitTime: '18:30', goingCount: 0 });
  });

  it('orders the same day by sitting time', async () => {
    const o = await createParticipant('Minh');
    const late = await outing(o.id, '2026-10-16', '20:00');
    const early = await outing(o.id, '2026-10-16', '18:30');
    const list = await listUpcomingOutings('2026-10-15');
    expect(list.map((r) => [r.id, r.sitTime])).toEqual([
      [early, '18:30'],
      [late, '20:00'],
    ]);
  });

  it('counts only Going answers', async () => {
    const o = await createParticipant('Minh');
    const lan = await createParticipant('Lan');
    const bao = await createParticipant('Bao');
    // Dated in the future: answers are refused once the close time has passed.
    const id = await outing(o.id, '2030-10-16');
    await setAnswer(id, o.id, true);
    await setAnswer(id, lan.id, true);
    await setAnswer(id, bao.id, false);
    expect((await listUpcomingOutings('2026-10-15'))[0].goingCount).toBe(2);
  });

  it('returns an empty array when nothing is upcoming', async () => {
    const o = await createParticipant('Minh');
    await outing(o.id, '2026-10-14');
    expect(await listUpcomingOutings('2026-10-15')).toEqual([]);
  });

  it('hides closed (with or without a winner) and cancelled outings dated today', async () => {
    const o = await createParticipant('Minh');
    const open = await outing(o.id, '2026-10-15');
    const won = await outing(o.id, '2026-10-15');
    const waiting = await outing(o.id, '2026-10-15');
    const cancelled = await outing(o.id, '2026-10-15');
    const pool = getPool();
    const venue = (await getOuting(won))!.venues[0].id;
    await pool.query('UPDATE outings SET closed_at = now(), winner_venue_id = $2 WHERE id = $1', [
      won,
      venue,
    ]);
    await pool.query('UPDATE outings SET closed_at = now() WHERE id = $1', [waiting]);
    await pool.query('UPDATE outings SET closed_at = now(), cancelled = true WHERE id = $1', [
      cancelled,
    ]);
    expect((await listUpcomingOutings('2026-10-15')).map((r) => r.id)).toEqual([open]);
  });

  it('rejects a malformed day', async () => {
    await expect(listUpcomingOutings('tomorrow')).rejects.toThrow('Invalid day');
  });
});
