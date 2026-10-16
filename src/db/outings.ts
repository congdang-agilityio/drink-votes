import { getPool } from './pool.js';
import type { Venue } from './venues.js';

export interface NewOuting {
  /** Calendar day, `YYYY-MM-DD` (Vietnam time, NFR-06). */
  date: string;
  /** Sitting time, `HH:mm`. */
  sitTime: string;
  /** Close time, `HH:mm`. */
  closeTime: string;
  /** Venues in the order the organizer chose them. */
  venueIds: string[];
  organizerId: string;
}

export interface Outing {
  id: string;
  date: string;
  sitTime: string;
  closeTime: string;
  organizerId: string;
  /** When the outing closed; null while it is open. */
  closedAt: Date | null;
  cancelled: boolean;
  winnerVenueId: string | null;
  /** Organizer's visit answer: true went, false did not go, null not answered. */
  visited: boolean | null;
  venues: Venue[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OutingRow {
  id: string;
  date: string;
  sit_time: string;
  close_time: string;
  organizer_id: string;
  closed_at: Date | null;
  cancelled: boolean;
  winner_venue_id: string | null;
  visited: boolean | null;
}

interface VenueRow {
  id: string;
  name: string;
  address: string;
  maps_url: string | null;
  notes: string | null;
}

/**
 * Inserts the outing and its venues in one transaction (all or nothing) and returns its id.
 * Business checks (venue count, past date, time order) live in services/outing-rules.
 */
export async function createOuting(input: NewOuting): Promise<string> {
  const client = await getPool().connect();
  let failure: Error | undefined;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO outings (outing_date, sit_time, close_time, organizer_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [input.date, input.sitTime, input.closeTime, input.organizerId],
    );
    const id = rows[0].id;
    await client.query(
      `INSERT INTO outing_venues (outing_id, venue_id, position)
       SELECT $1, v.venue_id, v.position
         FROM unnest($2::uuid[]) WITH ORDINALITY AS v(venue_id, position)`,
      [id, input.venueIds],
    );
    await client.query('COMMIT');
    return id;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    failure = err instanceof Error ? err : new Error(String(err));
    throw err;
  } finally {
    // A failed client may hold a broken connection: passing the error makes pg discard it.
    client.release(failure);
  }
}

/** The outing with its venues in chosen order, or null for an unknown or malformed id. */
export async function getOuting(id: string): Promise<Outing | null> {
  if (typeof id !== 'string' || !UUID_RE.test(id)) return null;
  const pool = getPool();
  // to_char keeps the formats fixed: date and time columns carry no time zone.
  const { rows } = await pool.query<OutingRow>(
    `SELECT id, to_char(outing_date, 'YYYY-MM-DD') AS date,
            to_char(sit_time, 'HH24:MI') AS sit_time,
            to_char(close_time, 'HH24:MI') AS close_time, organizer_id,
            closed_at, cancelled, winner_venue_id, visited
       FROM outings WHERE id = $1`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  const venues = await pool.query<VenueRow>(
    `SELECT v.id, v.name, v.address, v.maps_url, v.notes
       FROM outing_venues ov JOIN venues v ON v.id = ov.venue_id
      WHERE ov.outing_id = $1 ORDER BY ov.position`,
    [id],
  );
  return {
    id: row.id,
    date: row.date,
    sitTime: row.sit_time,
    closeTime: row.close_time,
    organizerId: row.organizer_id,
    closedAt: row.closed_at,
    cancelled: row.cancelled,
    winnerVenueId: row.winner_venue_id,
    visited: row.visited,
    venues: venues.rows.map((v) => ({
      id: v.id,
      name: v.name,
      address: v.address,
      mapsUrl: v.maps_url,
      notes: v.notes,
    })),
  };
}
