import { describe, expect, it } from 'vitest';
import { breakTie } from './tie-break.js';

const c = (venueId: string, count: number) => ({ venueId, count });

describe('breakTie', () => {
  it('ranks a never-visited venue before a visited one', () => {
    expect(breakTie([c('A', 2), c('B', 2)], { A: '2025-10-01', B: null })).toEqual(['B']);
  });
  it('picks the oldest last visit', () => {
    expect(breakTie([c('A', 2), c('B', 2)], { A: '2025-09-01', B: '2025-10-01' })).toEqual(['A']);
  });
  it('only top-voted venues compete', () => {
    expect(
      breakTie([c('A', 3), c('B', 1), c('C', 1)], { A: '2025-10-01', B: null, C: null }),
    ).toEqual(['A']);
  });
  it('treats all venues as tied with no votes', () => {
    expect(
      breakTie([c('A', 0), c('B', 0), c('C', 0)], {
        A: '2025-10-01',
        B: '2025-09-01',
        C: '2025-09-15',
      }),
    ).toEqual(['B']);
  });
  it('keeps two never-visited venues tied, in input order', () => {
    expect(breakTie([c('A', 1), c('B', 1), c('C', 1)], { A: null, B: '2025-01-01', C: null })).toEqual(['A', 'C']);
  });
  it('keeps equal dates tied', () => {
    expect(breakTie([c('A', 1), c('B', 1)], { A: '2025-09-01', B: '2025-09-01' })).toEqual(['A', 'B']);
  });
  it('treats a venue missing from lastVisits as never visited', () => {
    expect(breakTie([c('A', 1), c('B', 1)], { A: '2025-09-01' })).toEqual(['B']);
  });
  it('returns [] for empty input', () => {
    expect(breakTie([], {})).toEqual([]);
  });
});
