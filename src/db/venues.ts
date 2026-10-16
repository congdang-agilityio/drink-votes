import { getPool } from './pool.js';

export interface Venue {
  id: string;
  name: string;
  address: string;
  mapsUrl: string | null;
  notes: string | null;
}

export interface NewVenue {
  name: string;
  address: string;
  mapsUrl?: string | null;
  notes?: string | null;
}

interface VenueRow {
  id: string;
  name: string;
  address: string;
  maps_url: string | null;
  notes: string | null;
}

const COLUMNS = 'id, name, address, maps_url, notes';

/** Thrown by createVenue when another venue already has the same name ignoring case. */
export class DuplicateVenueNameError extends Error {
  constructor(name: string, options?: ErrorOptions) {
    super(`A venue named "${name}" already exists`, options);
    this.name = 'DuplicateVenueNameError';
  }
}

/** Name uniqueness key (A-07), computed in JS so it does not depend on the DB collation. */
export const venueNameKey = (name: string): string => name.trim().normalize('NFC').toLowerCase();

const isNameKeyConflict = (err: unknown): boolean => {
  const { code, constraint } = (err ?? {}) as { code?: unknown; constraint?: unknown };
  return code === '23505' && constraint === 'venues_name_key_idx';
};

/** Empty or missing optional values are stored as NULL. */
const optional = (value: string | null | undefined): string | null =>
  value === undefined || value === null || value === '' ? null : value;

const toVenue = (row: VenueRow): Venue => ({
  id: row.id,
  name: row.name,
  address: row.address,
  mapsUrl: row.maps_url,
  notes: row.notes,
});

/**
 * Inserts a venue (name trimmed) and returns it. Throws DuplicateVenueNameError when the name
 * matches an existing venue ignoring case. Required-field checks live in services/venue-rules.
 */
export async function createVenue(input: NewVenue): Promise<Venue> {
  const name = input.name.trim();
  try {
    const { rows } = await getPool().query<VenueRow>(
      `INSERT INTO venues (name, name_key, address, maps_url, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [name, venueNameKey(name), input.address, optional(input.mapsUrl), optional(input.notes)],
    );
    return toVenue(rows[0]);
  } catch (err) {
    if (isNameKeyConflict(err)) throw new DuplicateVenueNameError(name, { cause: err });
    throw err;
  }
}

/** Every venue, oldest first; venues created at the same instant are ordered by name. */
export async function listVenues(): Promise<Venue[]> {
  const { rows } = await getPool().query<VenueRow>(
    `SELECT ${COLUMNS} FROM venues ORDER BY created_at, name`,
  );
  return rows.map(toVenue);
}

export interface VenueWithVisits extends Venue {
  /** Outings this venue won that the organizer confirmed with "Đã đi". */
  visitCount: number;
}

/** Every venue as in listVenues, with how many outings it won that were visited (0 when none). */
export async function listVenuesWithVisits(): Promise<VenueWithVisits[]> {
  const { rows } = await getPool().query<VenueRow & { visit_count: number }>(
    `SELECT v.id, v.name, v.address, v.maps_url, v.notes,
            (SELECT count(*)::int FROM outings o
              WHERE o.winner_venue_id = v.id AND o.visited = true) AS visit_count
       FROM venues v ORDER BY v.created_at, v.name`,
  );
  return rows.map((row) => ({ ...toVenue(row), visitCount: row.visit_count }));
}
