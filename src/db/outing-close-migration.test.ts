import { cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../config.js';
import { migrate } from './migrate.js';

const SCHEMA = 'outing_close_migration_test';

describe('migration 0007_outing_close', () => {
  let admin: pg.Pool;
  let pool: pg.Pool;
  let dir: string;

  beforeAll(async () => {
    admin = new pg.Pool({ connectionString: config.databaseUrl });
    await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin.query(`CREATE SCHEMA ${SCHEMA}`);
    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      options: `-c search_path=${SCHEMA}`,
    });
    // Only the M1 migrations first.
    dir = await mkdtemp(join(tmpdir(), 'migrations-0007-'));
    const source = resolve('migrations');
    for (const f of (await readdir(source)).filter((n) => n < '0007')) {
      await cp(join(source, f), join(dir, f));
    }
  });

  afterAll(async () => {
    await pool.end();
    await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin.end();
    await rm(dir, { recursive: true, force: true });
  });

  it('keeps existing M1 outings valid and open', async () => {
    await migrate(pool, dir);
    await pool.query(`
      INSERT INTO participants (id, display_name) VALUES ('00000000-0000-4000-8000-000000000001', 'Lan');
      INSERT INTO outings (id, outing_date, sit_time, close_time, organizer_id)
        VALUES ('00000000-0000-4000-8000-000000000002', '2026-01-01', '18:30', '16:00',
                '00000000-0000-4000-8000-000000000001')`);

    const applied = await migrate(pool, resolve('migrations'));
    expect(applied.slice(0, 1)).toEqual(['0007_outing_close.sql']);

    const { rows } = await pool.query(
      'SELECT closed_at, cancelled, winner_venue_id FROM outings',
    );
    expect(rows).toEqual([{ closed_at: null, cancelled: false, winner_venue_id: null }]);
  });
});
