import type { Queryable } from './attendance.js';
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

/**
 * Last visit date (`YYYY-MM-DD`) per venue: the latest outing_date of an outing the venue won
 * and the organizer confirmed with "Đã đi" (visited = true), or null when never visited.
 * "Không đi", unanswered, waiting and cancelled outings never count. Pass the caller's client
 * to read inside its transaction. Throws on a malformed id.
 */
export async function lastVisitDates(
  venueIds: string[],
  db: Queryable = getPool(),
): Promise<Record<string, string | null>> {
  if (!Array.isArray(venueIds) || !venueIds.every((id) => typeof id === 'string' && UUID_RE.test(id))) {
    throw new Error('invalid id');
  }
  if (venueIds.length === 0) return {};
  const { rows } = await db.query<{ venue_id: string; last: string | null }>(
    `SELECT v.venue_id, to_char(max(o.outing_date), 'YYYY-MM-DD') AS last
       FROM unnest($1::uuid[]) AS v(venue_id)
       LEFT JOIN outings o
         ON o.winner_venue_id = v.venue_id AND o.visited AND NOT o.cancelled
      GROUP BY v.venue_id`,
    [venueIds],
  );
  const result: Record<string, string | null> = {};
  for (const id of venueIds) result[id] = null;
  for (const r of rows) {
    const key = venueIds.find((id) => id.toLowerCase() === r.venue_id) ?? r.venue_id;
    result[key] = r.last;
  }
  return result;
}
