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
        lastVisits: {},
      }),
    ).toEqual({ cancelled: false, winnerVenueId: 'b', tiedVenueIds: [] });
  });

  it('returns null and the tied ids on a tie the visits cannot break', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 2 },
          { venueId: 'b', count: 2 },
          { venueId: 'c', count: 1 },
        ],
        goingCount: 5,
        minPeople: 3,
        lastVisits: {},
      }),
    ).toEqual({ cancelled: false, winnerVenueId: null, tiedVenueIds: ['a', 'b'] });
  });

  it('treats every venue as tied when nobody voted', () => {
    expect(
      decideOutcome({
        counts: [
          { venueId: 'a', count: 0 },
          { venueId: 'b', count: 0 },
        ],
        goingCount: 3,
        minPeople: 3,
        lastVisits: {},
      }),
    ).toEqual({ cancelled: false, winnerVenueId: null, tiedVenueIds: ['a', 'b'] });
    expect(decideOutcome({ counts: [], goingCount: 3, minPeople: 3, lastVisits: {} })).toEqual({
      cancelled: false,
      winnerVenueId: null,
      tiedVenueIds: [],
    });
  });

  it('breaks a tie with the least recently visited venue', () => {
    const counts = [
      { venueId: 'a', count: 2 },
      { venueId: 'b', count: 2 },
    ];
    expect(
      decideOutcome({ counts, goingCount: 4, minPeople: 3, lastVisits: { a: '2026-10-01', b: null } }),
    ).toEqual({ cancelled: false, winnerVenueId: 'b', tiedVenueIds: [] });
    expect(
      decideOutcome({
        counts,
        goingCount: 4,
        minPeople: 3,
        lastVisits: { a: '2026-09-01', b: '2026-10-01' },
      }),
    ).toEqual({ cancelled: false, winnerVenueId: 'a', tiedVenueIds: [] });
  });

  it('picks the oldest visit among all venues when nobody voted', () => {
    const counts = ['a', 'b', 'c'].map((venueId) => ({ venueId, count: 0 }));
    const lastVisits = { a: '2026-10-01', b: '2026-09-01', c: '2026-09-15' };
    expect(decideOutcome({ counts, goingCount: 3, minPeople: 3, lastVisits }).winnerVenueId).toBe(
      'b',
    );
  });

  it('ignores visits when one venue leads the vote', () => {
    const counts = [
      { venueId: 'a', count: 3 },
      { venueId: 'b', count: 1 },
      { venueId: 'c', count: 1 },
    ];
    const lastVisits = { a: '2026-10-01', b: null, c: null };
    expect(decideOutcome({ counts, goingCount: 5, minPeople: 3, lastVisits }).winnerVenueId).toBe(
      'a',
    );
  });

  it('cancels before the tie-break, with no tied ids', () => {
    const counts = [
      { venueId: 'a', count: 1 },
      { venueId: 'b', count: 1 },
    ];
    expect(decideOutcome({ counts, goingCount: 2, minPeople: 3, lastVisits: { a: null } })).toEqual({
      cancelled: true,
      winnerVenueId: null,
      tiedVenueIds: [],
    });
  });

  const lead = [{ venueId: 'a', count: 2 }];

  it('cancels with no winner when fewer than minPeople are going, even with a leader', () => {
    expect(decideOutcome({ counts: lead, goingCount: 2, minPeople: 3, lastVisits: {} })).toEqual({
      cancelled: true,
      winnerVenueId: null,
      tiedVenueIds: [],
    });
  });

  it('does not cancel at exactly minPeople', () => {
    expect(decideOutcome({ counts: lead, goingCount: 3, minPeople: 3, lastVisits: {} })).toEqual({
      cancelled: false,
      winnerVenueId: 'a',
      tiedVenueIds: [],
    });
  });

  it('cancels with 0 going', () => {
    expect(decideOutcome({ counts: [], goingCount: 0, minPeople: 3, lastVisits: {} }).cancelled).toBe(true);
  });

  it('honours a larger minPeople', () => {
    expect(decideOutcome({ counts: lead, goingCount: 4, minPeople: 5, lastVisits: {} }).cancelled).toBe(true);
  });
});
