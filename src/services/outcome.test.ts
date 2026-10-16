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
        goingCount: 6,
        minPeople: 3,
      }),
    ).toEqual({ cancelled: false, winnerVenueId: 'b' });
  });

  it('returns null on a tie for the highest count', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 2 },
          { venueId: 'b', count: 2 },
          { venueId: 'c', count: 1 },
        ],
        goingCount: 5,
        minPeople: 3,
      }),
    ).toEqual({ cancelled: false, winnerVenueId: null });
  });

  it('returns null when nobody voted', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 0 },
          { venueId: 'b', count: 0 },
        ],
        goingCount: 3,
        minPeople: 3,
      }),
    ).toEqual({ cancelled: false, winnerVenueId: null });
    expect(decideOutcome({ counts: [], goingCount: 3, minPeople: 3 })).toEqual({
      cancelled: false,
      winnerVenueId: null,
    });
  });

  const lead = [{ venueId: 'a', count: 2 }];

  it('cancels with no winner when fewer than minPeople are going, even with a leader', () => {
    expect(decideOutcome({ counts: lead, goingCount: 2, minPeople: 3 })).toEqual({
      cancelled: true,
      winnerVenueId: null,
    });
  });

  it('does not cancel at exactly minPeople', () => {
    expect(decideOutcome({ counts: lead, goingCount: 3, minPeople: 3 })).toEqual({
      cancelled: false,
      winnerVenueId: 'a',
    });
  });

  it('cancels with 0 going', () => {
    expect(decideOutcome({ counts: [], goingCount: 0, minPeople: 3 }).cancelled).toBe(true);
  });

  it('honours a larger minPeople', () => {
    expect(decideOutcome({ counts: lead, goingCount: 4, minPeople: 5 }).cancelled).toBe(true);
  });
});
