import { getPool } from './pool.js';

/** A person, identified by the browser that created it (BR-09), not by the name. */
export interface Participant {
  id: string;
  displayName: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ParticipantRow {
  id: string;
  display_name: string;
}

const toParticipant = (row: ParticipantRow): Participant => ({
  id: row.id,
  displayName: row.display_name,
});

/** Inserts a participant with a generated id. A blank name is rejected by the database. */
export async function createParticipant(displayName: string): Promise<Participant> {
  const { rows } = await getPool().query<ParticipantRow>(
    'INSERT INTO participants (display_name) VALUES ($1) RETURNING id, display_name',
    [displayName],
  );
  return toParticipant(rows[0]);
}

/** The participant with this id, or null when it does not exist or the id is not a uuid. */
export async function findParticipant(id: string): Promise<Participant | null> {
  if (typeof id !== 'string' || !UUID_RE.test(id)) return null;
  const { rows } = await getPool().query<ParticipantRow>(
    'SELECT id, display_name FROM participants WHERE id = $1',
    [id],
  );
  return rows[0] ? toParticipant(rows[0]) : null;
}
