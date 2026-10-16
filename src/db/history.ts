import { getPool } from './pool.js';
import type { Queryable } from './attendance.js';

export interface HistoryEntry {
  id: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** won = has a winner; waiting = closed, no winner yet, not cancelled. */
  outcome: 'won' | 'waiting' | 'cancelled';
  winnerName: string | null;
  goingCount: number;
  /** Organizer's visit answer: null = not answered (always null without a winner). */
  visited: boolean | null;
}

interface Row {
  id: string;
  date: string;
  cancelled: boolean;
  winner_name: string | null;
  going_count: number;
  visited: boolean | null;
}

/**
 * Closed and cancelled outings, newest outing date first, with what a History line needs.
 * Open outings are excluded. Pass `db` to run inside a transaction.
 */
export async function listHistory(db: Queryable = getPool()): Promise<HistoryEntry[]> {
  // to_char keeps the date format fixed: date columns carry no time zone.
  const { rows } = await db.query<Row>(
    `SELECT o.id, to_char(o.outing_date, 'YYYY-MM-DD') AS date, o.cancelled,
            v.name AS winner_name, o.visited,
            count(a.participant_id) FILTER (WHERE a.going)::int AS going_count
       FROM outings o
       LEFT JOIN venues v ON v.id = o.winner_venue_id
       LEFT JOIN attendance a ON a.outing_id = o.id
      WHERE o.closed_at IS NOT NULL
      GROUP BY o.id, v.name
      ORDER BY o.outing_date DESC, o.sit_time DESC, o.created_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    outcome: r.cancelled ? 'cancelled' : r.winner_name !== null ? 'won' : 'waiting',
    winnerName: r.winner_name,
    goingCount: r.going_count,
    visited: r.visited,
  }));
}
