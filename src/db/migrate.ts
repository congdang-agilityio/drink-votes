import { realpathSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';
import { closeDueOutings, type CloseOptions } from '../services/closing.js';
import { closePool, getPool } from './pool.js';

/**
 * Applies every `*.sql` file in `dir` not yet recorded in `schema_migrations`, in file-name
 * order, each in its own transaction. Returns the names of the files applied by this run.
 * Migration files must not contain their own BEGIN/COMMIT: the runner wraps each file.
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
    let failure: Error | undefined;
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      const reason = err instanceof Error ? err.message : String(err);
      failure = err instanceof Error ? err : new Error(reason);
      throw new Error(`Migration ${name} failed: ${reason}`, { cause: err });
    } finally {
      // A failed client may hold a broken connection: passing the error makes pg discard it.
      client.release(failure);
    }
    applied.push(name);
  }
  return applied;
}

/**
 * The release (pre-deploy) step: applies pending migrations on the shared pool, then closes
 * every open outing already past its close time with the M2 rules, so outings created before
 * M2 get a result before anyone opens the app. Closing is final and skips closed outings, so a
 * second run closes nothing. Nothing is closed when a migration fails.
 */
export async function runReleaseStep({
  log = () => undefined,
  ...closeOptions
}: CloseOptions & { log?: (line: string) => void } = {}): Promise<{
  applied: string[];
  closed: string[];
}> {
  const applied = await migrate(getPool());
  // Logged before closing so a failing close still shows which migrations were applied.
  log(applied.length ? `Applied: ${applied.join(', ')}` : 'No new migrations.');
  const closed = await closeDueOutings(closeOptions);
  log(`Closed ${closed.length} past-due outing${closed.length === 1 ? '' : 's'}.`);
  return { applied, closed };
}

async function main(): Promise<void> {
  try {
    await runReleaseStep({ log: (line) => console.log(line) });
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

/** True when this module is the entry point; real paths so a symlinked argv[1] still matches. */
function isEntryPoint(): boolean {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  void main();
}
