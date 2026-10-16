import { describe, expect, it } from 'vitest';
import { decideOutcome } from './outcome.js';

describe('decideOutcome', () => {
  it('returns the single venue with the highest count', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 1 },
          { venueId: 'b', count: 3 },
          { venueId: 'c', count: 2 },
        ],
      }),
    ).toBe('b');
  });

  it('returns null on a tie for the highest count', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 2 },
          { venueId: 'b', count: 2 },
          { venueId: 'c', count: 1 },
        ],
      }),
    ).toBeNull();
  });

  it('returns null when nobody voted', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 0 },
          { venueId: 'b', count: 0 },
        ],
      }),
    ).toBeNull();
    expect(decideOutcome({ counts: [] })).toBeNull();
  });
});
