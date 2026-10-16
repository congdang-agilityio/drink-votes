# S-15: Cancel an outing when not enough people are going

- **Priority:** P0
- **Covers:** FR-13, FR-26, NFR-05 (`MIN_PEOPLE`) · **Decisions:** Q-16, Q-19
- **Depends on stories:** S-13

## User story
As an organizer, I want an outing with too few people to be cancelled at close, so that nobody books a table for a gathering that will not happen.

## Acceptance criteria
1. **Cancelled below the threshold**
   - Given `MIN_PEOPLE` is 3 and 2 people are Going at the close time
   - When the outing closes
   - Then the outing is cancelled and has no winning venue
2. **Not cancelled at the threshold**
   - Given `MIN_PEOPLE` is 3 and exactly 3 people are Going at the close time
   - When the outing closes
   - Then the outing is not cancelled and gets a result as usual
3. **Cancelled page**
   - Given a cancelled outing with 2 people Going at the close time
   - When anyone opens its page
   - Then it shows "Cancelled: not enough people" (shown in Vietnamese, with "không đủ quân") and the final headcount 2, and no Going / Not going or vote buttons
4. **Threshold is configurable**
   - Given the app runs with `MIN_PEOPLE` set to 5
   - When an outing closes with 4 people Going
   - Then it is cancelled
5. **Zero people going**
   - Given nobody answered Going by the close time
   - When the outing closes
   - Then it is cancelled with the final headcount 0

## Out of scope
- Listing cancelled outings in the history: S-21. Early close by the organizer (same rule applies): S-16.

## Notes
- BR-06, BR-18, BR-24: the rule applies to every close (automatic, early, and old M1 outings at release, S-25). A cancelled outing never counts as a visit.
- How users reach the page: its own outing link or the History page line (S-21).
