import { getPool } from './pool.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records the organizer's visit answer once. Only a closed outing with a winner and no answer
 * yet changes; returns whether a row changed (a second answer, or an open, cancelled or waiting
 * outing, changes nothing). Who may answer, and when, is checked by the caller.
 */
export async function recordVisit(outingId: string, visited: boolean): Promise<boolean> {
  if (typeof outingId !== 'string' || !UUID_RE.test(outingId)) return false;
  const result = await getPool().query(
    `UPDATE outings SET visited = $2
      WHERE id = $1 AND closed_at IS NOT NULL AND winner_venue_id IS NOT NULL
        AND visited IS NULL`,
    [outingId, visited],
  );
  return (result.rowCount ?? 0) > 0;
}
