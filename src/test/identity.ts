import { createParticipant, type Participant } from '../db/participants.js';
import { PARTICIPANT_COOKIE } from '../lib/identity.js';

/**
 * Creates a participant and returns it with request headers carrying its `dv_pid` cookie,
 * so route tests pass the identity middleware: `app.request('/', { headers })`.
 */
export async function asParticipant(
  displayName = 'Lan',
): Promise<{ participant: Participant; headers: { Cookie: string } }> {
  const participant = await createParticipant(displayName);
  return { participant, headers: { Cookie: `${PARTICIPANT_COOKIE}=${participant.id}` } };
}
