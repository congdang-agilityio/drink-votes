import type pg from 'pg';
import { config } from '../config.js';
import { getPool } from '../db/pool.js';
import { getVoteCounts } from '../db/votes.js';
import { decideOutcome } from './outcome.js';

/** State of an outing after a close attempt. */
export interface CloseState {
  outingId: string;
  closedAt: Date;
  cancelled: boolean;
  winnerVenueId: string | null;
  /** true when this call closed the outing; false when it was already closed. */
  changed: boolean;
}

export interface CloseOptions {
  now?: Date;
  tz?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface LockedRow {
  closed_at: Date | null;
  cancelled: boolean;
  winner_venue_id: string | null;
  close_instant: Date;
}

/** Runs fn in one transaction on a dedicated client. */
async function inTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  let failure: Error | undefined;
  try {
    await client.query('BEGIN');
    const result = await fn(client);
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
 * Locks the outing row (always first, before attendance and votes) and closes it unless it is
 * already closed. closed_at is the close instant, or now when closing before it (early close).
 * With skipLocked, a row locked by another closer is skipped (returns null).
 */
async function closeLocked(
  client: pg.PoolClient,
  outingId: string,
  now: Date,
  tz: string,
  skipLocked: boolean,
): Promise<CloseState | null> {
  const { rows } = await client.query<LockedRow>(
    `SELECT closed_at, cancelled, winner_venue_id,
            (outing_date + close_time) AT TIME ZONE $2 AS close_instant
       FROM outings WHERE id = $1
        FOR UPDATE${skipLocked ? ' SKIP LOCKED' : ''}`,
    [outingId, tz],
  );
  const row = rows[0];
  if (!row) return null;
  if (row.closed_at) {
    return {
      outingId,
      closedAt: row.closed_at,
      cancelled: row.cancelled,
      winnerVenueId: row.winner_venue_id,
      changed: false,
    };
  }
  const closedAt = now < row.close_instant ? now : row.close_instant;
  const winnerVenueId = decideOutcome({ counts: await getVoteCounts(outingId, client) });
  await client.query(
    'UPDATE outings SET closed_at = $2, winner_venue_id = $3 WHERE id = $1',
    [outingId, closedAt, winnerVenueId],
  );
  return { outingId, closedAt, cancelled: false, winnerVenueId, changed: true };
}

/**
 * Closes the outing in one transaction and returns its resulting state; closing is final, so
 * an already closed outing is returned unchanged. null for an unknown or malformed id.
 */
export async function closeOuting(
  outingId: string,
  { now = new Date(), tz = config.appTz }: CloseOptions = {},
): Promise<CloseState | null> {
  if (typeof outingId !== 'string' || !UUID_RE.test(outingId)) return null;
  return inTransaction((client) => closeLocked(client, outingId, now, tz, false));
}

/**
 * Closes every open outing whose close instant (outing_date + close_time in tz) is at or before
 * now, oldest close first, one transaction per outing. Returns the ids this call closed;
 * concurrent sweeps skip rows another sweep holds and re-check closed_at under the lock, so no
 * outing is closed twice.
 */
export async function closeDueOutings({
  now = new Date(),
  tz = config.appTz,
}: CloseOptions = {}): Promise<string[]> {
  const { rows } = await getPool().query<{ id: string }>(
    `SELECT id FROM outings
      WHERE closed_at IS NULL AND (outing_date + close_time) AT TIME ZONE $2 <= $1
      ORDER BY (outing_date + close_time), id`,
    [now, tz],
  );
  const closed: string[] = [];
  for (const { id } of rows) {
    const state = await inTransaction((client) => closeLocked(client, id, now, tz, true));
    if (state?.changed) closed.push(id);
  }
  return closed;
}
