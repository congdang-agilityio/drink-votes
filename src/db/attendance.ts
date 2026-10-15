import type pg from 'pg';
import { getPool } from './pool.js';

/** Going headcount and names of an outing, in first-answer order. */
export interface Attendance {
  goingCount: number;
  goingNames: string[];
}

/** Anything that runs a query: the shared pool or a client inside a transaction. */
export type Queryable = Pick<pg.Pool | pg.PoolClient, 'query'>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id: unknown): id is string => typeof id === 'string' && UUID_RE.test(id);

/**
 * Records the answer as one upsert: a person has exactly one row per outing. A change keeps
 * answered_at (first answer) and moves updated_at. Pass `db` to run inside a transaction.
 */
export async function setAnswer(
  outingId: string,
  participantId: string,
  going: boolean,
  db: Queryable = getPool(),
): Promise<void> {
  if (!isUuid(outingId) || !isUuid(participantId)) {
    throw new Error('Invalid outing or participant id');
  }
  if (typeof going !== 'boolean') throw new Error('Invalid answer');
  await db.query(
    `INSERT INTO attendance (outing_id, participant_id, going)
     VALUES ($1, $2, $3)
     ON CONFLICT (outing_id, participant_id)
     DO UPDATE SET going = EXCLUDED.going, updated_at = now()`,
    [outingId, participantId, going],
  );
}

/** true = Going, false = Not going, null = not answered (or a malformed id). */
export async function getAnswer(outingId: string, participantId: string): Promise<boolean | null> {
  if (!isUuid(outingId) || !isUuid(participantId)) return null;
  const { rows } = await getPool().query<{ going: boolean }>(
    'SELECT going FROM attendance WHERE outing_id = $1 AND participant_id = $2',
    [outingId, participantId],
  );
  return rows[0] ? rows[0].going : null;
}

/** Only Going rows count; names are the participants' current names (BR-17). */
export async function getAttendance(outingId: string): Promise<Attendance> {
  if (!isUuid(outingId)) return { goingCount: 0, goingNames: [] };
  const { rows } = await getPool().query<{ display_name: string }>(
    `SELECT p.display_name
       FROM attendance a JOIN participants p ON p.id = a.participant_id
      WHERE a.outing_id = $1 AND a.going
      ORDER BY a.answered_at, a.participant_id`,
    [outingId],
  );
  return { goingCount: rows.length, goingNames: rows.map((r) => r.display_name) };
}
