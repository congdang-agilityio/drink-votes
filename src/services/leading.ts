import type { VenueCount } from '../db/votes.js';
import { breakTie } from './tie-break.js';

/**
 * Venue ids that would win right now: [] when nobody voted (no tie-break on zero votes),
 * otherwise the venues still tied after the least-recently-visited tie-break (one = clear
 * leader, several = the organizer will choose).
 */
export function leadingVenues(
  counts: VenueCount[],
  lastVisits: Record<string, string | null>,
): string[] {
  return counts.every((c) => c.count === 0) ? [] : breakTie(counts, lastVisits);
}
