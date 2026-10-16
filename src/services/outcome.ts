import type { VenueCount } from '../db/votes.js';
import { breakTie } from './tie-break.js';

/** Everything the close decision needs. */
export interface OutcomeInput {
  /** Vote count per outing venue at the close. */
  counts: VenueCount[];
  /** People answered Going at the close. */
  goingCount: number;
  /** Fewer Going than this cancels the outing. */
  minPeople: number;
  /** Last "Đã đi" date (`YYYY-MM-DD`) per venue id; null or missing = never visited. */
  lastVisits: Record<string, string | null>;
}

/**
 * Result of a close: cancelled (never a winner), a winner venue id, or no winner (null) with
 * the venues still tied after the tie-break in tiedVenueIds ([] whenever there is a winner or
 * the outing is cancelled).
 */
export interface Outcome {
  cancelled: boolean;
  winnerVenueId: string | null;
  tiedVenueIds: string[];
}

/**
 * Pure close decision. Fewer than minPeople Going cancels the outing with no winner, checked
 * before any vote logic. Otherwise the venues sharing the highest vote count (every venue when
 * nobody voted) go through the least-recently-visited tie-break: one remaining venue wins;
 * several remaining leave no winner and are returned as tied.
 */
export function decideOutcome({ counts, goingCount, minPeople, lastVisits }: OutcomeInput): Outcome {
  if (goingCount < minPeople) return { cancelled: true, winnerVenueId: null, tiedVenueIds: [] };
  const remaining = breakTie(counts, lastVisits);
  if (remaining.length === 1) {
    return { cancelled: false, winnerVenueId: remaining[0], tiedVenueIds: [] };
  }
  return { cancelled: false, winnerVenueId: null, tiedVenueIds: remaining };
}
