# PRD: Drink Votes, M1 "Tonight's outing" (Kèo tối nay)

- Slug: `drink-vote` · Analysis: `requirements.md` (signed off 2026-10-15 by Cong Dang) · Version: 1
- Epic title: Drink Votes M1: Tonight's outing

## 1. Summary
Drink Votes turns a team's "drinking tonight?" (tối nay nhậu không?) chat into an outing (kèo)
with a date, a sitting time, a close time and a list of venues to vote on. Members open the
outing link, say Going / Not going and vote for one venue; the organizer reads the live
headcount and leading venue(s) to book a table. M1 is built first (SRC-2); it has no closing,
no tie-break and no history (all M2).

## 2. Goals and success metrics
| Goal | Metric | Target |
|---|---|---|
| The organizer knows how many people are going | Headcount and Going names visible on the outing page (FR-09) | Always shown, updated on every answer |
| The organizer knows which venue is winning | Vote count per venue and leading venue(s) on the outing page (FR-09, BR-08) | Always shown; ties show all leaders |
| Inviting is as easy as pasting a link | Each outing has its own link (FR-05) | Opening the link from any browser shows the outing |
| Usable from a phone in the team chat | Every page usable on a phone screen (NFR-09) | No separate mobile UI needed |
| The service can be monitored | `GET /healthz` (FR-10) | `200` when app and database are up |

## 3. Users
- Organizer (người rủ / chủ kèo): creates the outing; recognised by the creating browser (FR-18).
- Member (thành viên): anyone with the link; answers Going / Not going and votes.
- Operator / platform: Railway health checks and DevOps (FR-10).

## 4. Scope
- **In this release (M1):**
  - FR-01 Ask a display name on the first visit, remembered in a cookie.
  - FR-02 Add a venue (name, address required; Maps link, notes optional; no duplicate names).
  - FR-03 Venue list.
  - FR-04 Create an outing (date, sitting time 18:30, close time 16:00, at least 2 venues), with checks.
  - FR-05 Each outing has its own shareable link.
  - FR-06 Going / Not going, changeable at any time.
  - FR-07 Going people vote for exactly one venue; switching to Not going removes the vote.
  - FR-08 Votes can be changed at any time.
  - FR-09 Outing page: headcount, Going names, anonymous vote counts, leading venue(s).
  - FR-10 `GET /healthz`.
  - FR-17 Home page with upcoming outings and links to "Create outing" and "Venues".
  - FR-18 Outing records the creating browser as organizer.
  - FR-19 Change display name; new name shown everywhere.
  - FR-20 Close time displayed; nothing happens at it in M1.
  - FR-21 "Drink Votes" in every page title and header.
  - NFR-01 to NFR-09 (server-rendered HTML, PostgreSQL with migrations, Vitest tests, Railway
    staging/production, environment variables, Vietnam time, shared open space, Vietnamese UI,
    phone-friendly pages).
- **Out / later:**
  - FR-11 to FR-16 (auto-close, early close, cancellation under 3 people, tie-break, history,
    visit counts): M2, a later epic (SRC-2; open points Q-16 to Q-20, Q-25, Q-26 deferred to M2).
  - Any closing of an outing (Q-01); editing or deleting venues (Q-05); editing an outing (Q-14);
    English UI or language switch (Q-03); showing who voted for which venue or who said Not going (Q-09).
  - Login, permissions/roles, multiple teams, bill splitting, booking, notifications, maps, a
    separate mobile UI (SRC-1 §Ngoài phạm vi).

## 5. Requirements
| ID | Summary | Decided by |
|---|---|---|
| FR-01 | Name asked on first visit, cookie, no login | Q-07 |
| FR-02 | Add venue; required/optional fields; duplicate names refused | Q-05, Q-13, Q-23 |
| FR-03 | Venue list | Q-05 |
| FR-04 | Create outing with defaults and checks; no editing | Q-10, Q-14 |
| FR-05 | Own link per outing | SRC-1 |
| FR-06 | Going / Not going, changeable; organizer not auto-Going | Q-01, Q-11 |
| FR-07 | One vote per Going person; vote removed on Not going | Q-08 |
| FR-08 | Vote changeable at any time | Q-01 |
| FR-09 | Headcount, Going names, anonymous counts, leaders, "Chưa có phiếu" | Q-06, Q-09, Q-22 |
| FR-10 | `GET /healthz` returns 200 | SRC-1 (A-06 for the failure case) |
| FR-17 | Home page: upcoming outings, links | Q-04, Q-21 |
| FR-18 | Creator browser is organizer | Q-02, Q-14 |
| FR-19 | Change display name, shown everywhere | Q-07, Q-24 |
| FR-20 | Close time displayed, no effect in M1 | Q-01 |
| FR-21 | Product name "Drink Votes" | Q-15 |
| NFR-01 to NFR-07 | Platform, data, tests, Railway, config, time zone, shared open space | SRC-1, Q-11 |
| NFR-08 | Vietnamese-only UI, 24-hour times, day/month/year dates | Q-03 |
| NFR-09 | Every page usable on a phone screen | Q-12 |

## 6. Key decisions
| Question | Decision |
|---|---|
| Q-01 | Outings never close in M1; answers and votes can change at any time |
| Q-02 | The organizer is the browser that created the outing |
| Q-03 | Vietnamese-only UI; 24-hour times; day/month/year dates |
| Q-04 | Home page lists outings; several outings may exist at once |
| Q-05 | Anyone can add venues; no edit or delete in M1 |
| Q-06 | All tied venues are shown as leading |
| Q-07 | Name asked on first visit to any page, changeable later, same names allowed |
| Q-08 | Switching to Not going removes the vote; switching back requires voting again |
| Q-09 | Vote counts are anonymous; only Going people are listed |
| Q-10 | Refuse fewer than 2 venues, a past date, or a close time not before the sitting time |
| Q-11 | One shared open space; organizer not automatically Going |
| Q-12 | Every page usable on a phone screen |
| Q-13 | Venue name and address required; Maps link and notes optional and unchecked |
| Q-14 | No editing of an outing in M1 |
| Q-15 | Product name "Drink Votes" |
| Q-21 | Home page lists outings dated today or later, soonest first, with date, sitting time, number going |
| Q-22 | No votes: no leader, message "Chưa có phiếu" |
| Q-23 | Duplicate venue names refused, ignoring upper/lower case |
| Q-24 | After a name change the new name is shown everywhere |

## 7. Assumptions, deferred items and risks
- Remaining assumptions (each accepted at GATE 1):
  - A-06: `/healthz` returns a non-200 status when the database is unreachable.
  - A-07: Names differing only by leading/trailing spaces count as duplicates; names differing
    in diacritics are different.
- Deferred: FR-11 to FR-16 and Q-16 to Q-20, Q-25, Q-26 (M2 epic). `MIN_PEOPLE` (NFR-05) is
  only used by M2.
- Risks: R-01 cookie-only identity (anyone can vote under any name; organizer tied to one
  browser); R-02 no final result in M1; R-03 Railway dependency; R-04 M1 must store outing
  dates, answers and votes for M2; R-05 add-only venues keep typos.

## 8. Story map
1. S-01: Health check for the operator
2. S-02: App shell with product name, Vietnamese UI and phone layout
3. S-03: Ask for a display name on the first visit
4. S-04: Add a venue and see the venue list
5. S-05: Venue checks (required fields, duplicate names)
6. S-06: Create an outing and get its link
7. S-07: Outing creation checks
8. S-08: Say Going or Not going
9. S-09: Vote for a venue
10. S-10: Show the leading venue(s)
11. S-11: Upcoming outings on the home page
12. S-12: Change my display name
