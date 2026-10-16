import type { Pool, PoolClient } from 'pg';
import { getPool } from './pool.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);

/**
 * Stores the venues still tied when an outing closes without a winner. Runs on the caller's
 * client so it can share the closing transaction. Every venue must be offered in the outing
 * (the foreign key enforces it); repeated ids are stored once.
 */
export async function recordTies(
  db: Pick<Pool | PoolClient, 'query'>,
  outingId: string,
  venueIds: string[],
): Promise<void> {
  if (!isUuid(outingId) || !venueIds.every(isUuid)) throw new Error('invalid id');
  if (venueIds.length === 0) return;
  await db.query(
    `INSERT INTO outing_tied_venues (outing_id, venue_id)
     SELECT $1, v FROM unnest($2::uuid[]) AS v
     ON CONFLICT DO NOTHING`,
    [outingId, venueIds],
  );
}

/** The tied venue ids of an outing, in the order they were offered. */
export async function getTiedVenues(outingId: string): Promise<string[]> {
  if (!isUuid(outingId)) return [];
  const { rows } = await getPool().query<{ venue_id: string }>(
    `SELECT t.venue_id
       FROM outing_tied_venues t
       JOIN outing_venues ov ON ov.outing_id = t.outing_id AND ov.venue_id = t.venue_id
      WHERE t.outing_id = $1
      ORDER BY ov.position`,
    [outingId],
  );
  return rows.map((r) => r.venue_id);
}

/**
 * Sets the winner once, only among the tied venues of a closed, not cancelled outing that has
 * no winner yet. One statement; returns whether a row changed. Who may choose is checked by
 * the caller.
 */
export async function chooseWinner(outingId: string, venueId: string): Promise<boolean> {
  if (!isUuid(outingId) || !isUuid(venueId)) return false;
  const result = await getPool().query(
    `UPDATE outings SET winner_venue_id = $2
      WHERE id = $1 AND closed_at IS NOT NULL AND NOT cancelled
        AND winner_venue_id IS NULL
        AND EXISTS (SELECT 1 FROM outing_tied_venues t
                     WHERE t.outing_id = outings.id AND t.venue_id = $2)`,
    [outingId, venueId],
  );
  return (result.rowCount ?? 0) > 0;
}
