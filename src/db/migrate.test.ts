import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../config.js';
import { migrate } from './migrate.js';

const SCHEMA = 'migrate_test';

describe('migrate', () => {
  let admin: pg.Pool;
  let pool: pg.Pool;
  let dir: string;

  beforeAll(async () => {
    admin = new pg.Pool({ connectionString: config.databaseUrl });
    await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin.query(`CREATE SCHEMA ${SCHEMA}`);
    // Every connection of this pool works inside the dedicated schema only.
    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      options: `-c search_path=${SCHEMA}`,
    });
    dir = await mkdtemp(join(tmpdir(), 'migrations-'));
    await writeFile(join(dir, '0001_a.sql'), 'CREATE TABLE a (id int PRIMARY KEY);');
    await writeFile(join(dir, '0002_b.sql'), 'CREATE TABLE b (id int REFERENCES a(id));');
    await writeFile(join(dir, 'README.md'), 'not a migration');
  });

  afterAll(async () => {
    await pool.end();
    await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await admin.end();
    await rm(dir, { recursive: true, force: true });
  });

  const recorded = async () =>
    (await pool.query('SELECT name FROM schema_migrations ORDER BY applied_at, name')).rows.map(
      (r) => r.name,
    );

  it('applies every .sql file in name order and records it', async () => {
    const applied = await migrate(pool, dir);
    expect(applied).toEqual(['0001_a.sql', '0002_b.sql']);
    expect(await recorded()).toEqual(['0001_a.sql', '0002_b.sql']);
    await pool.query('INSERT INTO a VALUES (1); INSERT INTO b VALUES (1);');
  });

  it('applies nothing on a second run', async () => {
    expect(await migrate(pool, dir)).toEqual([]);
    expect(await recorded()).toEqual(['0001_a.sql', '0002_b.sql']);
  });

  it('rolls back a failing file, does not record it, and names it in the error', async () => {
    await writeFile(
      join(dir, '0003_broken.sql'),
      'CREATE TABLE c (id int); INSERT INTO missing_table VALUES (1);',
    );
    await expect(migrate(pool, dir)).rejects.toThrow(/0003_broken\.sql/);
    expect(await recorded()).toEqual(['0001_a.sql', '0002_b.sql']);
    const { rows } = await pool.query("SELECT to_regclass('c') AS t");
    expect(rows[0].t).toBeNull();
  });
});
