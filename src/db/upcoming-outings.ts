import { getPool } from './pool.js';
import type { Queryable } from './attendance.js';

export interface UpcomingOuting {
  id: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:mm` */
  sitTime: string;
  goingCount: number;
}

interface Row {
  id: string;
  date: string;
  sit_time: string;
  going_count: number;
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Open outings (not closed or cancelled) dated `today` or later (a `YYYY-MM-DD` day computed by the caller, Vietnam time),
 * soonest first, with their Going headcount. Pass `db` to run inside a transaction.
 */
export async function listUpcomingOutings(
  today: string,
  db: Queryable = getPool(),
): Promise<UpcomingOuting[]> {
  if (typeof today !== 'string' || !DAY_RE.test(today)) throw new Error('Invalid day');
  // to_char keeps the formats fixed: date and time columns carry no time zone.
  const { rows } = await db.query<Row>(
    `SELECT o.id, to_char(o.outing_date, 'YYYY-MM-DD') AS date,
            to_char(o.sit_time, 'HH24:MI') AS sit_time,
            count(a.participant_id) FILTER (WHERE a.going)::int AS going_count
       FROM outings o LEFT JOIN attendance a ON a.outing_id = o.id
      WHERE o.outing_date >= $1::date AND o.closed_at IS NULL
      GROUP BY o.id
      ORDER BY o.outing_date, o.sit_time, o.created_at`,
    [today],
  );
  return rows.map((r) => ({ id: r.id, date: r.date, sitTime: r.sit_time, goingCount: r.going_count }));
}
