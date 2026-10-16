import { type CloseCheckOptions, lockOutingClosed, type Queryable } from './attendance.js';
import { getPool } from './pool.js';

/**
 * Outcome of a vote: stored, refused because the outing is closed, the person is not Going,
 * or the venue is not one of the outing's.
 */
export type VoteResult = 'ok' | 'closed' | 'not_going' | 'unknown_venue';

/** Votes for one venue of the outing. Counts only: never who voted (privacy). */
export interface VenueCount {
  venueId: string;
  count: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id: unknown): id is string => typeof id === 'string' && UUID_RE.test(id);

/**
 * Stores the person's single vote for the outing, replacing any earlier one, in one
 * transaction. The outing row is locked first (`FOR SHARE`) and a closed outing refuses with
 * 'closed' (see lockOutingClosed). Then the attendance row is locked (`FOR UPDATE`), so a
 * concurrent switch to Not going either runs before (the vote is refused) or after (it
 * deletes the vote).
 */
export async function castVote(
  outingId: string,
  participantId: string,
  venueId: string,
  opts: CloseCheckOptions = {},
): Promise<VoteResult> {
  if (!isUuid(outingId) || !isUuid(participantId)) return 'not_going';
  const client = await getPool().connect();
  let failure: Error | undefined;
  try {
    await client.query('BEGIN');
    const closed = await lockOutingClosed(client, outingId, opts);
    const going = async () =>
      (
        await client.query<{ going: boolean }>(
          `SELECT going FROM attendance
            WHERE outing_id = $1 AND participant_id = $2 FOR UPDATE`,
          [outingId, participantId],
        )
      ).rows[0]?.going === true;
    let result: VoteResult;
    if (closed) {
      result = 'closed';
    } else if (!(await going())) {
      result = 'not_going';
    } else if (
      !isUuid(venueId) ||
      (
        await client.query(
          'SELECT 1 FROM outing_venues WHERE outing_id = $1 AND venue_id = $2',
          [outingId, venueId],
        )
      ).rowCount === 0
    ) {
      result = 'unknown_venue';
    } else {
      await client.query(
        `INSERT INTO votes (outing_id, participant_id, venue_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (outing_id, participant_id)
         DO UPDATE SET venue_id = EXCLUDED.venue_id, updated_at = now()`,
        [outingId, participantId, venueId],
      );
      result = 'ok';
    }
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

/**
 * Vote count for every venue of the outing (0 included), in outing order. Pass `db` to read
 * inside the caller's transaction.
 */
export async function getVoteCounts(
  outingId: string,
  db: Queryable = getPool(),
): Promise<VenueCount[]> {
  if (!isUuid(outingId)) return [];
  const { rows } = await db.query<{ venue_id: string; count: number }>(
    `SELECT ov.venue_id, count(v.participant_id)::int AS count
       FROM outing_venues ov
       LEFT JOIN votes v ON v.outing_id = ov.outing_id AND v.venue_id = ov.venue_id
      WHERE ov.outing_id = $1
      GROUP BY ov.venue_id, ov.position
      ORDER BY ov.position`,
    [outingId],
  );
  return rows.map((r) => ({ venueId: r.venue_id, count: r.count }));
}

/** The venue id the person voted for in the outing, or null (no vote or a malformed id). */
export async function getVote(outingId: string, participantId: string): Promise<string | null> {
  if (!isUuid(outingId) || !isUuid(participantId)) return null;
  const { rows } = await getPool().query<{ venue_id: string }>(
    'SELECT venue_id FROM votes WHERE outing_id = $1 AND participant_id = $2',
    [outingId, participantId],
  );
  return rows[0]?.venue_id ?? null;
}
