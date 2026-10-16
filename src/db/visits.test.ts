import { cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../config.js';
import { resetDb } from '../test/db.js';
import { migrate } from './migrate.js';
import { createOuting, getOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { createVenue } from './venues.js';
import { lastVisitDates, recordVisit } from './visits.js';

async function setup() {
  const organizer = await createParticipant('Lan');
  const a = await createVenue({ name: 'Quán A', address: '1 A' });
  const b = await createVenue({ name: 'Quán B', address: '2 B' });
  const id = await createOuting({
    date: '2026-12-31',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId: organizer.id,
  });
  return { id, a, b };
}

const sql = (text: string, params: unknown[]) => getPool().query(text, params);

describe('visit store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('records the first answer once and refuses a second one', async () => {
    const { id, a } = await setup();
    await sql('UPDATE outings SET closed_at = now(), winner_venue_id = $2 WHERE id = $1', [id, a.id]);
    expect((await getOuting(id))?.visited).toBeNull();

    expect(await recordVisit(id, true)).toBe(true);
    expect((await getOuting(id))?.visited).toBe(true);

    expect(await recordVisit(id, false)).toBe(false);
    expect((await getOuting(id))?.visited).toBe(true);
  });

  it('records "not visited" as false, distinct from not answered', async () => {
    const { id, a } = await setup();
    await sql('UPDATE outings SET closed_at = now(), winner_venue_id = $2 WHERE id = $1', [id, a.id]);
    expect(await recordVisit(id, false)).toBe(true);
    expect((await getOuting(id))?.visited).toBe(false);
  });

  it('refuses an open, cancelled, or waiting outing', async () => {
    const open = await setup();
    expect(await recordVisit(open.id, true)).toBe(false);

    await sql('UPDATE outings SET closed_at = now(), cancelled = true WHERE id = $1', [open.id]);
    expect(await recordVisit(open.id, true)).toBe(false);

    await resetDb();
    const waiting = await setup();
    await sql('UPDATE outings SET closed_at = now() WHERE id = $1', [waiting.id]);
    expect(await recordVisit(waiting.id, true)).toBe(false);
    expect((await getOuting(waiting.id))?.visited).toBeNull();
  });

  it('returns false for an unknown or malformed id', async () => {
    expect(await recordVisit('00000000-0000-4000-8000-000000000000', true)).toBe(false);
    expect(await recordVisit('nope', true)).toBe(false);
  });

  it('rejects visited without a winner at the database level', async () => {
    const { id } = await setup();
    await expect(sql('UPDATE outings SET visited = true WHERE id = $1', [id])).rejects.toThrow(
      /outings_visited_needs_winner_check/,
    );
  });

  describe('lastVisitDates', () => {
    /** A closed outing on `date` offering a and b, won by `winner`, with the visit answer. */
    async function won(
      date: string,
      venues: [string, string],
      winner: string,
      visited: boolean | null,
    ): Promise<string> {
      const organizer = await createParticipant('Lan');
      const id = await createOuting({
        date,
        sitTime: '18:30',
        closeTime: '16:00',
        venueIds: venues,
        organizerId: organizer.id,
      });
      await sql(
        'UPDATE outings SET closed_at = now(), winner_venue_id = $2, visited = $3 WHERE id = $1',
        [id, winner, visited],
      );
      return id;
    }

    it('returns the latest "Đã đi" date per venue, or null', async () => {
      const a = (await createVenue({ name: 'A', address: 'a' })).id;
      const b = (await createVenue({ name: 'B', address: 'b' })).id;
      await won('2026-09-01', [a, b], a, true);
      await won('2026-10-01', [a, b], a, true);
      expect(await lastVisitDates([a, b], getPool())).toEqual({ [a]: '2026-10-01', [b]: null });
    });

    it('ignores "Không đi", unanswered, waiting and cancelled outings', async () => {
      const a = (await createVenue({ name: 'A', address: 'a' })).id;
      const b = (await createVenue({ name: 'B', address: 'b' })).id;
      await won('2026-09-01', [a, b], a, true);
      await won('2026-10-01', [a, b], a, false);
      await won('2026-10-02', [a, b], b, false);
      await won('2026-10-03', [a, b], b, null);
      const waiting = await createOuting({
        date: '2026-10-04',
        sitTime: '18:30',
        closeTime: '16:00',
        venueIds: [a, b],
        organizerId: (await createParticipant('Lan')).id,
      });
      await sql('UPDATE outings SET closed_at = now() WHERE id = $1', [waiting]);
      const cancelled = await createOuting({
        date: '2026-10-05',
        sitTime: '18:30',
        closeTime: '16:00',
        venueIds: [a, b],
        organizerId: (await createParticipant('Lan')).id,
      });
      await sql('UPDATE outings SET closed_at = now(), cancelled = true WHERE id = $1', [cancelled]);
      expect(await lastVisitDates([a, b], getPool())).toEqual({ [a]: '2026-09-01', [b]: null });
    });

    it('returns {} for no venues and rejects a malformed id', async () => {
      expect(await lastVisitDates([], getPool())).toEqual({});
      await expect(lastVisitDates(['nope'], getPool())).rejects.toThrow('invalid id');
    });
  });
});

describe('migration 0008_outing_visit', () => {
  const SCHEMA = 'outing_visit_migration_test';
  let dir: string | undefined;
  let admin: pg.Pool | undefined;
  let pool: pg.Pool | undefined;

  afterAll(async () => {
    await pool?.end();
    await admin?.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin?.end();
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it('applies on existing data and leaves visited unanswered', async () => {
    admin = new pg.Pool({ connectionString: config.databaseUrl });
    await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin.query(`CREATE SCHEMA ${SCHEMA}`);
    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      options: `-c search_path=${SCHEMA}`,
    });
    dir = await mkdtemp(join(tmpdir(), 'migrations-0008-'));
    const source = resolve('migrations');
    for (const f of (await readdir(source)).filter((n) => n < '0008')) {
      await cp(join(source, f), join(dir, f));
    }
    await migrate(pool, dir);
    await pool.query(`
      INSERT INTO participants (id, display_name) VALUES ('00000000-0000-4000-8000-000000000001', 'Lan');
      INSERT INTO outings (id, outing_date, sit_time, close_time, organizer_id)
        VALUES ('00000000-0000-4000-8000-000000000002', '2026-01-01', '18:30', '16:00',
                '00000000-0000-4000-8000-000000000001')`);

    expect(await migrate(pool, resolve('migrations'))).toEqual([
      '0008_outing_visit.sql',
      '0009_outing_ties.sql',
    ]);
    const { rows } = await pool.query('SELECT visited FROM outings');
    expect(rows).toEqual([{ visited: null }]);
  });
});
