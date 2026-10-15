import { migrate } from '../db/migrate.js';
import { getPool } from '../db/pool.js';

/**
 * Brings the test database to the latest schema, then empties every table except
 * schema_migrations. Call it in beforeEach of database tests.
 */
export async function resetDb(): Promise<void> {
  const pool = getPool();
  await migrate(pool);
  const { rows } = await pool.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables
      WHERE schemaname = current_schema() AND tablename <> 'schema_migrations'`,
  );
  if (rows.length === 0) return;
  const tables = rows.map((r) => `"${r.tablename.replace(/"/g, '""')}"`).join(', ');
  await pool.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}
