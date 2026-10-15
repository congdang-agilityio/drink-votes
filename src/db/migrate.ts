import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type pg from 'pg';
import { closePool, getPool } from './pool.js';

/**
 * Applies every `*.sql` file in `dir` not yet recorded in `schema_migrations`, in file-name
 * order, each in its own transaction. Returns the names of the files applied by this run.
 */
export async function migrate(pool: pg.Pool, dir = 'migrations'): Promise<string[]> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name text PRIMARY KEY,
       applied_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM schema_migrations');
  const done = new Set(rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  const applied: string[] = [];
  for (const name of files) {
    if (done.has(name)) continue;
    const sql = await readFile(join(dir, name), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`Migration ${name} failed: ${reason}`, { cause: err });
    } finally {
      client.release();
    }
    applied.push(name);
  }
  return applied;
}

async function main(): Promise<void> {
  try {
    const applied = await migrate(getPool());
    console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'No new migrations.');
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  void main();
}
