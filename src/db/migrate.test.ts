import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
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

  it('releases the client of a failed file as broken so the pool discards it', async () => {
    const released: unknown[] = [];
    const failing = new Error('connection lost');
    const fake = {
      query: async (sql: string) => (sql.startsWith('SELECT') ? { rows: [] } : {}),
      connect: async () => ({
        query: async (sql: string) => {
          if (sql === 'BEGIN' || sql === 'ROLLBACK') return {};
          throw failing;
        },
        release: (err?: unknown) => released.push(err),
      }),
    } as unknown as pg.Pool;
    await expect(migrate(fake, dir)).rejects.toThrow(/0001_a\.sql/);
    expect(released).toEqual([failing]);
  });
});

describe('migrate as a script', () => {
  const SCRIPT_SCHEMA = 'migrate_script_test';
  const script = resolve('src/db/migrate.ts');
  // Absolute loader URL: the child runs in a temp dir where `tsx` cannot be resolved by name.
  const tsx = pathToFileURL(resolve('node_modules/tsx/dist/loader.mjs')).href;
  let admin: pg.Pool;
  let dir: string;
  // Migrations without an outings table: the close step after them fails.
  let noOutingsDir: string;

  // Runs the entry point the way `npm run migrate` does, inside a dedicated schema.
  const run = (entry: string, cwd = dir) =>
    spawnSync(process.execPath, ['--import', tsx, entry], {
      cwd,
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: config.databaseUrl,
        PGOPTIONS: `-c search_path=${SCRIPT_SCHEMA}`,
      },
    });

  const recorded = async () =>
    (
      await admin.query(`SELECT name FROM ${SCRIPT_SCHEMA}.schema_migrations ORDER BY name`)
    ).rows.map((r) => r.name);

  beforeAll(async () => {
    admin = new pg.Pool({ connectionString: config.databaseUrl });
    dir = await mkdtemp(join(tmpdir(), 'migrate-script-'));
    await mkdir(join(dir, 'migrations'));
    // The release step closes due outings after migrating: it needs the columns it reads.
    await writeFile(
      join(dir, 'migrations', '0001_ok.sql'),
      `CREATE TABLE ok (id int);
       CREATE TABLE outings (id uuid PRIMARY KEY, outing_date date NOT NULL,
                             close_time time NOT NULL, closed_at timestamptz);`,
    );
    noOutingsDir = await mkdtemp(join(tmpdir(), 'migrate-script-'));
    await mkdir(join(noOutingsDir, 'migrations'));
    await writeFile(join(noOutingsDir, 'migrations', '0001_ok.sql'), 'CREATE TABLE ok (id int);');
  });

  beforeEach(async () => {
    await admin.query(`DROP SCHEMA IF EXISTS ${SCRIPT_SCHEMA} CASCADE`);
    await admin.query(`CREATE SCHEMA ${SCRIPT_SCHEMA}`);
  });

  afterAll(async () => {
    await admin.query(`DROP SCHEMA IF EXISTS ${SCRIPT_SCHEMA} CASCADE`);
    await admin.end();
    await rm(dir, { recursive: true, force: true });
    await rm(noOutingsDir, { recursive: true, force: true });
  });

  it('migrates DATABASE_URL, closes due outings and exits 0', async () => {
    const res = run(script);
    expect(res.stderr).toBe('');
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Applied: 0001_ok.sql');
    expect(res.stdout).toContain('Closed 0 past-due outings.');
    expect(await recorded()).toEqual(['0001_ok.sql']);
  });

  it('with the real migrations: closes a past-due outing once and logs the count', async () => {
    const real = await mkdtemp(join(tmpdir(), 'migrate-script-'));
    try {
      await symlink(resolve('migrations'), join(real, 'migrations'));
      expect(run(script, real).status).toBe(0);
      const s = SCRIPT_SCHEMA;
      await admin.query(
        `WITH p AS (INSERT INTO ${s}.participants (display_name) VALUES ('Minh') RETURNING id)
         INSERT INTO ${s}.outings (outing_date, sit_time, close_time, organizer_id)
         SELECT '2024-03-01', '18:30', '16:00', id FROM p`,
      );
      const first = run(script, real);
      expect(first.stderr).toBe('');
      expect(first.status).toBe(0);
      expect(first.stdout).toContain('No new migrations.');
      expect(first.stdout).toContain('Closed 1 past-due outing.');
      const { rows } = await admin.query(`SELECT closed_at, cancelled FROM ${s}.outings`);
      expect(rows[0].closed_at).not.toBeNull();
      expect(rows[0].cancelled).toBe(true);

      const second = run(script, real);
      expect(second.status).toBe(0);
      expect(second.stdout).toContain('Closed 0 past-due outings.');
    } finally {
      await rm(real, { recursive: true, force: true });
    }
  });

  it('exits 1 when closing due outings fails after migrating', async () => {
    const res = run(script, noOutingsDir);
    expect(res.status).toBe(1);
    expect(res.stdout).toContain('Applied: 0001_ok.sql');
    expect(res.stderr).toContain('outings');
    expect(await recorded()).toEqual(['0001_ok.sql']);
  });

  it('still runs when started through a symlinked path', async () => {
    const link = join(dir, 'migrate-link.ts');
    await symlink(script, link);
    try {
      const res = run(link);
      expect(res.status).toBe(0);
      expect(res.stdout).toContain('Applied: 0001_ok.sql');
      expect(await recorded()).toEqual(['0001_ok.sql']);
    } finally {
      await rm(link, { force: true });
    }
  });

  it('exits 1 naming the failing file and keeps earlier files recorded', async () => {
    const broken = join(dir, 'migrations', '0002_broken.sql');
    await writeFile(broken, 'INSERT INTO missing_table VALUES (1);');
    try {
      const res = run(script);
      expect(res.status).toBe(1);
      expect(res.stderr).toContain('0002_broken.sql');
      expect(await recorded()).toEqual(['0001_ok.sql']);
    } finally {
      await rm(broken, { force: true });
    }
  });
});
