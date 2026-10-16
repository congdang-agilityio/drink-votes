import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { setAnswer } from './attendance.js';
import { listHistory } from './history.js';
import { createOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { createVenue } from './venues.js';

const sql = (text: string, params: unknown[]) => getPool().query(text, params);

async function setup() {
  const organizer = await createParticipant('Minh');
  const a = await createVenue({ name: 'Quán A', address: 'a' });
  const b = await createVenue({ name: 'Quán B', address: 'b' });
  const make = (date: string, sitTime = '18:30') =>
    createOuting({ date, sitTime, closeTime: '16:00', venueIds: [a.id, b.id], organizerId: organizer.id });
  const close = (id: string, extra = '') =>
    sql(`UPDATE outings SET closed_at = now()${extra} WHERE id = $1`, [id]);
  return { a, make, close };
}

async function going(outingId: string, n: number, notGoing = 0) {
  for (let i = 0; i < n + notGoing; i++) {
    const p = await createParticipant(`P${Math.random()}`);
    await setAnswer(outingId, p.id, i < n);
  }
}

describe('listHistory', () => {
  beforeEach(async () => {
    await resetDb();
  });
  afterAll(async () => {
    await closePool();
  });

  it('lists closed outings newest first and excludes open ones', async () => {
    const { make, close } = await setup();
    const d10 = await make('2026-12-10');
    const d15 = await make('2026-12-15');
    const d12 = await make('2026-12-12');
    await make('2026-12-20');
    for (const id of [d10, d15, d12]) await close(id);
    expect((await listHistory()).map((r) => r.id)).toEqual([d15, d12, d10]);
  });

  it('orders the same day by sitting time, latest first', async () => {
    const { make, close } = await setup();
    const early = await make('2026-12-10', '18:00');
    const late = await make('2026-12-10', '20:00');
    await close(early);
    await close(late);
    expect((await listHistory()).map((r) => r.id)).toEqual([late, early]);
  });

  it('orders the same day and sitting time by creation, latest first', async () => {
    const { make, close } = await setup();
    const older = await make('2026-12-10');
    const newer = await make('2026-12-10');
    await sql(`UPDATE outings SET created_at = now() - interval '1 hour' WHERE id = $1`, [older]);
    await sql(`UPDATE outings SET created_at = now() WHERE id = $1`, [newer]);
    await close(newer);
    await close(older);
    expect((await listHistory()).map((r) => r.id)).toEqual([newer, older]);
  });

  it('returns a won row with winner, headcount and each visited value', async () => {
    const { a, make } = await setup();
    const ids = [await make('2026-12-15'), await make('2026-12-14'), await make('2026-12-13')];
    for (const [i, id] of ids.entries()) {
      await going(id, 4, 2);
      const visited = [true, false, null][i];
      await sql('UPDATE outings SET closed_at = now(), winner_venue_id = $2, visited = $3 WHERE id = $1', [
        id,
        a.id,
        visited,
      ]);
    }
    const rows = await listHistory();
    expect(rows.map((r) => r.visited)).toEqual([true, false, null]);
    expect(rows[0]).toEqual({
      id: ids[0],
      date: '2026-12-15',
      outcome: 'won',
      winnerName: 'Quán A',
      goingCount: 4,
      visited: true,
    });
  });

  it('returns a waiting row without winner and visited', async () => {
    const { make, close } = await setup();
    const id = await make('2026-12-15');
    await going(id, 3);
    await close(id);
    expect(await listHistory()).toEqual([
      { id, date: '2026-12-15', outcome: 'waiting', winnerName: null, goingCount: 3, visited: null },
    ]);
  });

  it('returns a cancelled row with its headcount', async () => {
    const { make, close } = await setup();
    const id = await make('2026-12-15');
    await going(id, 2, 1);
    await close(id, ', cancelled = true');
    expect(await listHistory()).toEqual([
      { id, date: '2026-12-15', outcome: 'cancelled', winnerName: null, goingCount: 2, visited: null },
    ]);
  });

  it('returns an empty list when nothing is closed', async () => {
    const { make } = await setup();
    await make('2026-12-15');
    expect(await listHistory()).toEqual([]);
  });
});
