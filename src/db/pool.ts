import pg from 'pg';
import { config } from '../config.js';

const DATE_OID = 1082;

// Return DATE columns as the raw 'YYYY-MM-DD' string: building a JS Date would shift the
// day by the server time zone.
pg.types.setTypeParser(DATE_OID, (value: string) => value);

let pool: pg.Pool | undefined;

/** The shared pool, created on first use from DATABASE_URL. */
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({ connectionString: config.databaseUrl });
  }
  return pool;
}

/** Closes the shared pool; the next getPool() creates a new one. */
export async function closePool(): Promise<void> {
  const current = pool;
  pool = undefined;
  if (current) await current.end();
}
