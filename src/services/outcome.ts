import type { VenueCount } from '../db/votes.js';
import { leadingVenues } from './leading.js';

/** Everything the close decision needs. Later rules add fields (headcount, tie-break data). */
export interface OutcomeInput {
  /** Vote count per outing venue at the close. */
  counts: VenueCount[];
  /** People answered Going at the close. */
  goingCount: number;
  /** Fewer Going than this cancels the outing. */
  minPeople: number;
}

/** Result of a close: cancelled (never a winner) or a winner venue id / null (tie, no votes). */
export interface Outcome {
  cancelled: boolean;
  winnerVenueId: string | null;
}

/**
 * Pure close decision. Fewer than minPeople Going cancels the outing with no winner, checked
 * before any vote logic. Otherwise the winner is the one venue with the highest vote count
 * above 0, or null on a tie or no votes.
 */
export function decideOutcome({ counts, goingCount, minPeople }: OutcomeInput): Outcome {
  if (goingCount < minPeople) return { cancelled: true, winnerVenueId: null };
  const leaders = leadingVenues(counts);
  return { cancelled: false, winnerVenueId: leaders.length === 1 ? leaders[0] : null };
}
