import type { VenueCount } from '../db/votes.js';
import { leadingVenues } from './leading.js';

/** Everything the close decision needs. Later rules add fields (headcount, tie-break data). */
export interface OutcomeInput {
  /** Vote count per outing venue at the close. */
  counts: VenueCount[];
}

/**
 * Pure close decision: the winner venue id when exactly one venue has the highest vote count
 * above 0, otherwise null (tie or no votes).
 */
export function decideOutcome({ counts }: OutcomeInput): string | null {
  const leaders = leadingVenues(counts);
  return leaders.length === 1 ? leaders[0] : null;
}
