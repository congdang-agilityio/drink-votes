import type { VenueCount } from '../db/votes.js';

/**
 * Venues still tied after the vote and the least-recently-visited tie-break.
 * Candidates share the highest count (all venues when nobody voted). A never-visited
 * venue (null or missing) ranks first, then the oldest `YYYY-MM-DD` date. Returns every
 * candidate sharing the best rank, in input order; [] for empty input.
 */
export function breakTie(
  counts: VenueCount[],
  lastVisits: Record<string, string | null>,
): string[] {
  if (counts.length === 0) return [];
  const max = Math.max(...counts.map((c) => c.count));
  const candidates = counts.filter((c) => c.count === max).map((c) => c.venueId);
  const visit = (id: string) => lastVisits[id] ?? null;
  const visited = candidates.map(visit).filter((d): d is string => d !== null);
  const best = candidates.some((id) => visit(id) === null) ? null : visited.sort()[0];
  return candidates.filter((id) => visit(id) === best);
}
