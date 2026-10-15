import { afterAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../db/pool.js';
import { resetDb } from './db.js';

describe('resetDb', () => {
  afterAll(async () => {
    await getPool().query('DROP TABLE IF EXISTS reset_db_probe');
    await closePool();
  });

  it('empties application tables, restarts identities, and keeps schema_migrations', async () => {
    const pool = getPool();
    await pool.query('CREATE TABLE IF NOT EXISTS reset_db_probe (id serial PRIMARY KEY, v text)');
    await pool.query("INSERT INTO reset_db_probe (v) VALUES ('x'), ('y')");
    await resetDb();
    expect((await pool.query('SELECT count(*)::int AS n FROM reset_db_probe')).rows[0].n).toBe(0);
    const { rows } = await pool.query("INSERT INTO reset_db_probe (v) VALUES ('z') RETURNING id");
    expect(rows[0].id).toBe(1);
    expect((await pool.query("SELECT to_regclass('schema_migrations') AS t")).rows[0].t).not.toBeNull();
  });
});
