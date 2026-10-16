import type { VenueCount } from '../db/votes.js';

/** Ids of every venue sharing the highest vote count (above 0), in input order; [] with no votes. */
export function leadingVenues(counts: VenueCount[]): string[] {
  const max = Math.max(0, ...counts.map((c) => c.count));
  return max === 0 ? [] : counts.filter((c) => c.count === max).map((c) => c.venueId);
}
