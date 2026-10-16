import type pg from 'pg';
import { config } from '../config.js';
import { getPool } from './pool.js';

/** Going headcount and names of an outing, in first-answer order. */
export interface Attendance {
  goingCount: number;
  goingNames: string[];
}

/** Anything that runs a query: the shared pool or a client inside a transaction. */
export type Queryable = Pick<pg.Pool | pg.PoolClient, 'query'>;

/** Outcome of an answer: stored, or refused because the outing is closed. */
export type AnswerResult = 'ok' | 'closed';

/** Clock and zone for the close check; tests pass a fixed `now`. */
export interface CloseCheckOptions {
  now?: Date;
  tz?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id: unknown): id is string => typeof id === 'string' && UUID_RE.test(id);

/**
 * Locks the outing row `FOR SHARE` (the closing service takes it `FOR UPDATE`, so a close
 * waits for in-flight answers and votes, and they wait for it) and tells whether it is closed:
 * marked closed, or `now` at or after its close time on its date in `tz`. The time check
 * freezes changes at the close instant even before the close sweep runs. null = no outing.
 * Call it first inside the transaction, before any attendance or vote row is locked.
 */
export async function lockOutingClosed(
  db: Queryable,
  outingId: string,
  { now = new Date(), tz = config.appTz }: CloseCheckOptions = {},
): Promise<boolean | null> {
  const { rows } = await db.query<{ closed: boolean }>(
    `SELECT closed_at IS NOT NULL
            OR $2::timestamptz >= (outing_date + close_time) AT TIME ZONE $3 AS closed
       FROM outings WHERE id = $1 FOR SHARE`,
    [outingId, now.toISOString(), tz],
  );
  return rows[0] ? rows[0].closed : null;
}

/**
 * Refuses with 'closed' (writing nothing) when the outing is closed (see lockOutingClosed).
 * Otherwise records the answer as one upsert: a person has exactly one row per outing. A change keeps
 * answered_at (first answer) and moves updated_at. Not going also deletes the person's vote
 * (BR-11) in the same transaction; the upsert locks the attendance row first, so a concurrent
 * castVote cannot slip a vote in between. Pass `db` to run inside the caller's transaction;
 * without it the function opens its own.
 */
export async function setAnswer(
  outingId: string,
  participantId: string,
  going: boolean,
  db?: Queryable,
  opts: CloseCheckOptions = {},
): Promise<AnswerResult> {
  if (!isUuid(outingId) || !isUuid(participantId)) {
    throw new Error('Invalid outing or participant id');
  }
  if (typeof going !== 'boolean') throw new Error('Invalid answer');
  if (db) return writeAnswer(db, outingId, participantId, going, opts);

  const client = await getPool().connect();
  let failure: Error | undefined;
  try {
    await client.query('BEGIN');
    const result = await writeAnswer(client, outingId, participantId, going, opts);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    failure = err instanceof Error ? err : new Error(String(err));
    throw err;
  } finally {
    // A failed client may hold a broken connection: passing the error makes pg discard it.
    client.release(failure);
  }
}

async function writeAnswer(
  db: Queryable,
  outingId: string,
  participantId: string,
  going: boolean,
  opts: CloseCheckOptions,
): Promise<AnswerResult> {
  // An unknown outing (null) falls through: the insert's foreign key rejects it.
  if (await lockOutingClosed(db, outingId, opts)) return 'closed';
  await db.query(
    `INSERT INTO attendance (outing_id, participant_id, going)
     VALUES ($1, $2, $3)
     ON CONFLICT (outing_id, participant_id)
     DO UPDATE SET going = EXCLUDED.going, updated_at = now()`,
    [outingId, participantId, going],
  );
  if (!going) {
    await db.query('DELETE FROM votes WHERE outing_id = $1 AND participant_id = $2', [
      outingId,
      participantId,
    ]);
  }
  return 'ok';
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
