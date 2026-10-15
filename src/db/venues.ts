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

/** Inserts a venue and returns it. Required-field checks live in services/venue-rules. */
export async function createVenue(input: NewVenue): Promise<Venue> {
  const { rows } = await getPool().query<VenueRow>(
    `INSERT INTO venues (name, address, maps_url, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [input.name, input.address, optional(input.mapsUrl), optional(input.notes)],
  );
  return toVenue(rows[0]);
}

/** Every venue, oldest first; venues created at the same instant are ordered by name. */
export async function listVenues(): Promise<Venue[]> {
  const { rows } = await getPool().query<VenueRow>(
    `SELECT ${COLUMNS} FROM venues ORDER BY created_at, name`,
  );
  return rows.map(toVenue);
}
