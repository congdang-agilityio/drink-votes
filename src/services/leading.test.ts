import { describe, expect, it } from 'vitest';
import { leadingVenues } from './leading.js';

const counts = (...n: number[]) => n.map((count, i) => ({ venueId: `v${i}`, count }));

describe('leadingVenues', () => {
  it('returns the single leader', () => {
    expect(leadingVenues(counts(3, 1))).toEqual(['v0']);
  });
  it('returns every venue sharing the top count', () => {
    expect(leadingVenues(counts(2, 2, 1))).toEqual(['v0', 'v1']);
  });
  it('returns nothing when nobody voted', () => {
    expect(leadingVenues(counts(0, 0))).toEqual([]);
    expect(leadingVenues([])).toEqual([]);
  });
  it('returns a single venue with one vote', () => {
    expect(leadingVenues(counts(1))).toEqual(['v0']);
  });
});
