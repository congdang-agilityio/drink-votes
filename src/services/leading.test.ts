import { describe, expect, it } from 'vitest';
import { leadingVenues } from './leading.js';

const counts = (...n: number[]) => n.map((count, i) => ({ venueId: `v${i}`, count }));

describe('leadingVenues', () => {
  it('returns the single leader', () => {
    expect(leadingVenues(counts(3, 1), {})).toEqual(['v0']);
  });
  it('returns every undecidable venue sharing the top count', () => {
    expect(leadingVenues(counts(2, 2, 1), {})).toEqual(['v0', 'v1']);
  });
  it('returns nothing when nobody voted', () => {
    expect(leadingVenues(counts(0, 0), {})).toEqual([]);
    expect(leadingVenues([], {})).toEqual([]);
  });
  it('lets the least recently visited venue win a tie', () => {
    expect(leadingVenues(counts(2, 2), { v0: '2030-01-10', v1: null })).toEqual(['v1']);
    expect(leadingVenues(counts(2, 2), { v0: '2030-01-10', v1: '2030-02-01' })).toEqual(['v0']);
  });
  it('keeps venues the tie-break cannot decide', () => {
    expect(leadingVenues(counts(2, 2), { v0: null, v1: null })).toEqual(['v0', 'v1']);
  });
  it('ignores visits when nobody voted', () => {
    expect(leadingVenues(counts(0, 0), { v0: '2030-01-10', v1: null })).toEqual([]);
  });
  it('returns a single venue with one vote', () => {
    expect(leadingVenues(counts(1), {})).toEqual(['v0']);
  });
});
