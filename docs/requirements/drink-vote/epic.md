# Drink Votes M1: Tonight's outing

Drink Votes turns a team's "drinking tonight?" (tối nay nhậu không?) chat into an outing (kèo)
with a date, a sitting time, a close time and a list of venues to vote on. Members open the
outing link, give a name once (no login), say Going / Not going and vote for one venue; the
organizer reads the live headcount and leading venue(s) to book a table. The UI is Vietnamese
only and works on a phone screen.

This epic covers milestone M1 only: FR-01 to FR-10, FR-17 to FR-21 and NFR-01 to NFR-09.
Closing outings, cancellation, tie-break and history (FR-11 to FR-16) are M2 and belong to a
later epic. Outings never close in M1, venues are add-only, and outings cannot be edited.

Details: `docs/requirements/drink-vote/prd.md`, `requirements.md` (signed off 2026-10-15 by Cong Dang).

## Stories
| ID | Title | Priority |
|---|---|---|
| S-01 | Health check for the operator | P0 |
| S-02 | App shell with product name, Vietnamese UI and phone layout | P0 |
| S-03 | Ask for a display name on the first visit | P0 |
| S-04 | Add a venue and see the venue list | P0 |
| S-05 | Venue checks (required fields, duplicate names) | P1 |
| S-06 | Create an outing and get its link | P0 |
| S-07 | Outing creation checks | P1 |
| S-08 | Say Going or Not going | P0 |
| S-09 | Vote for a venue | P0 |
| S-10 | Show the leading venue(s) | P1 |
| S-11 | Upcoming outings on the home page | P1 |
| S-12 | Change my display name | P1 |
