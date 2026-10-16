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
import { chooseWinner, getTiedVenues, recordTies } from './ties.js';
import { createVenue } from './venues.js';

async function setup() {
  const organizer = await createParticipant('Lan');
  const a = await createVenue({ name: 'Quán A', address: '1 A' });
  const b = await createVenue({ name: 'Quán B', address: '2 B' });
  const c = await createVenue({ name: 'Quán C', address: '3 C' });
  const id = await createOuting({
    date: '2026-12-31',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id, c.id],
    organizerId: organizer.id,
  });
  return { id, a, b, c };
}

const sql = (text: string, params: unknown[]) => getPool().query(text, params);

async function closeWithTies(id: string, venueIds: string[]) {
  await sql('UPDATE outings SET closed_at = now() WHERE id = $1', [id]);
  await recordTies(getPool(), id, venueIds);
}

describe('tied venues store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('records ties and returns them in outing order', async () => {
    const { id, a, c } = await setup();
    await recordTies(getPool(), id, [c.id, a.id]);
    expect(await getTiedVenues(id)).toEqual([a.id, c.id]);
  });

  it('records ties on the caller transaction and rolls back with it', async () => {
    const { id, a } = await setup();
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await recordTies(client, id, [a.id]);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    expect(await getTiedVenues(id)).toEqual([]);
  });

  it('rejects a venue that is not offered in the outing', async () => {
    const { id } = await setup();
    const other = await createVenue({ name: 'Quán D', address: '4 D' });
    await expect(recordTies(getPool(), id, [other.id])).rejects.toThrow();
  });

  it('lets the organizer choose a tied venue once', async () => {
    const { id, a, b } = await setup();
    await closeWithTies(id, [a.id, b.id]);

    expect(await chooseWinner(id, b.id)).toBe(true);
    expect((await getOuting(id))?.winnerVenueId).toBe(b.id);

    expect(await chooseWinner(id, a.id)).toBe(false);
    expect((await getOuting(id))?.winnerVenueId).toBe(b.id);
  });

  it('refuses a venue that is not tied', async () => {
    const { id, a, b, c } = await setup();
    await closeWithTies(id, [a.id, b.id]);
    expect(await chooseWinner(id, c.id)).toBe(false);
    expect((await getOuting(id))?.winnerVenueId ?? null).toBeNull();
  });

  it('refuses an open outing', async () => {
    const { id, a } = await setup();
    await recordTies(getPool(), id, [a.id]);
    expect(await chooseWinner(id, a.id)).toBe(false);
    expect((await getOuting(id))?.winnerVenueId ?? null).toBeNull();
  });

  it('refuses a cancelled outing', async () => {
    const { id, a } = await setup();
    await closeWithTies(id, [a.id]);
    await sql('UPDATE outings SET cancelled = true WHERE id = $1', [id]);
    expect(await chooseWinner(id, a.id)).toBe(false);
    expect((await getOuting(id))?.winnerVenueId ?? null).toBeNull();
  });

  it('refuses a malformed id', async () => {
    expect(await chooseWinner('nope', 'nope')).toBe(false);
    expect(await getTiedVenues('nope')).toEqual([]);
  });
});

describe('migration 0009_outing_ties', () => {
  const SCHEMA = 'outing_ties_migration_test';
  let admin: pg.Pool;
  let pool: pg.Pool;
  let dir: string;

  afterAll(async () => {
    await pool?.end();
    await admin?.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin?.end();
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it('applies on existing data and keeps it', async () => {
    admin = new pg.Pool({ connectionString: config.databaseUrl });
    await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin.query(`CREATE SCHEMA ${SCHEMA}`);
    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      options: `-c search_path=${SCHEMA}`,
    });
    dir = await mkdtemp(join(tmpdir(), 'migrations-0009-'));
    const source = resolve('migrations');
    for (const f of (await readdir(source)).filter((n) => n < '0009')) {
      await cp(join(source, f), join(dir, f));
    }
    await migrate(pool, dir);
    await pool.query(`
      INSERT INTO participants (id, display_name) VALUES ('00000000-0000-4000-8000-000000000001', 'Lan');
      INSERT INTO outings (id, outing_date, sit_time, close_time, organizer_id)
        VALUES ('00000000-0000-4000-8000-000000000002', '2026-01-01', '18:30', '16:00',
                '00000000-0000-4000-8000-000000000001')`);

    expect(await migrate(pool, resolve('migrations'))).toEqual(['0009_outing_ties.sql']);
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM outings');
    expect(rows).toEqual([{ n: 1 }]);
    const tied = await pool.query('SELECT count(*)::int AS n FROM outing_tied_venues');
    expect(tied.rows).toEqual([{ n: 0 }]);
  });
});
