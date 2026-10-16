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

---

# PRD: Drink Votes, M2 "Rules of play" (Luật chơi)

- Slug: `drink-vote` · Analysis: `requirements.md` (M2 re-signed 2026-10-16 by Cong Dang) · Version: 2
- Epic title: Drink Votes M2: Rules of play (epic file `epic-m2.md`; stories S-13..S-25)

## M2.1 Summary
M2 gives every outing a real end. It closes automatically at its close time on its own date
(Vietnam time) or earlier by the organizer; afterwards answers and votes are frozen and it
cannot be reopened. Fewer than `MIN_PEOPLE` (3) Going at close cancels it ("không đủ quân").
Otherwise the most-voted venue wins; ties (and "no votes") go to the venue not visited for the
longest time, and remaining ties are chosen by the organizer. After the sitting time the
organizer confirms the visit ("Đã đi" / "Không đi"); only confirmed visits count. A History
page, visit counts on the Venues page and an open-only home list complete the milestone.

## M2.2 Goals and success metrics
| Goal | Metric | Target |
|---|---|---|
| A fixed decision at the close time | Outing closed at its close time; no changes after (FR-11) | Every outing closes on time; changes after close refused |
| No booking for too few people | Outings under `MIN_PEOPLE` cancelled (FR-13) | Always, for every kind of close |
| One venue per outing | Winner by votes, tie-break, then organizer choice (FR-14, FR-22) | Every non-cancelled outing has a winner or a visible "waiting" state |
| Variety of venues | Tie-break by least recently visited (FR-14), visit counts (FR-16) | Only "Đã đi" visits count |
| Look back at past outings | History page (FR-15) | Every closed and cancelled outing listed, newest first |

## M2.3 Users
- Organizer: closes early, chooses among tied venues, confirms the visit; only from the
  creating browser, no recovery (FR-12, FR-18, Q-25). Does not need to be Going (A-12).
- Member: answers and votes while the outing is open; sees the result, history and visit counts.

## M2.4 Scope
- **In this release (M2):** FR-11 automatic close; FR-12 early close and organizer actions;
  FR-13 cancellation; FR-14 tie-break; FR-15 History page; FR-16 visit counts; FR-22 organizer
  choice among remaining ties; FR-23 visit confirmation; FR-24 closing M1 outings at release;
  FR-25 live leading venue with tie-break; FR-26 cancelled page; FR-27 closed page; FR-28 refuse
  creation after the close time; FR-29 home page lists open outings only, links to History.
- **M2 changes to M1 behaviour:** FR-03 (visit counts), FR-04 (extra check), FR-06 / FR-08
  (only while open), FR-09 (replaced by FR-25 / FR-27 / FR-22 / FR-26), FR-17 (open outings
  only, History link), FR-20 (replaced by FR-11).
- **Out of M2:** closed or cancelled outings on the home page (Q-29); a deadline or automatic
  fallback for the organizer's choice or visit confirmation (Q-34, Q-35); recovering organizer
  actions on another device (Q-25). Everything out of M1 that M2 does not mention stays out
  (editing/deleting venues, editing outings, English UI, showing who voted for what).

## M2.5 Requirements
| ID | Summary | Decided by |
|---|---|---|
| FR-11 | Automatic close at close time on the outing's date; frozen, final | SRC-1, Q-28, Q-31, A-08, A-09 |
| FR-12 | Organizer early close; organizer-only actions from the creating browser | Q-02, Q-16, Q-17, Q-18, Q-25 |
| FR-13 | Cancel below `MIN_PEOPLE` at any close | Q-16 |
| FR-14 | Tie-break by least recently visited; no votes = all tied | Q-17, Q-18, Q-28 |
| FR-15 | History page, newest first, with marks | Q-19, Q-26, Q-30, Q-36, A-14, A-15 |
| FR-16 | Visit counts on the Venues page, "Đã đi" only | Q-18, Q-30, Q-35, Q-36 |
| FR-22 | Waiting state; organizer chooses among remaining ties; no deadline | Q-17, Q-34, A-10, A-13 |
| FR-23 | Visit confirmation "Đã đi" / "Không đi" from the sitting time | Q-18, Q-35, A-10 |
| FR-24 | M1 outings past close time closed with M2 rules at release | Q-26, A-11 |
| FR-25 | Live leading venue with tie-break; tie note; "Chưa có phiếu" | Q-27, Q-32, Q-33 |
| FR-26 | Cancelled page with final headcount; history entry | Q-19 |
| FR-27 | Closed page: winner, address, Maps link, headcount, names, counts | Q-20 |
| FR-28 | Refuse creating an outing past its close time | Q-31 |
| FR-29 | Home page: open outings only; History link | Q-21, Q-29, Q-30 |

## M2.6 Key decisions
| Question | Decision |
|---|---|
| Q-16 | Cancellation below `MIN_PEOPLE` applies to early close too |
| Q-17 | Venues still tied after the tie-break: the organizer chooses |
| Q-18 | A visit counts only when the organizer confirms the team went; visit date = outing date |
| Q-19 | Cancelled page with final headcount; listed in history as cancelled |
| Q-20 | Closed page with winner, address, Maps link, headcount, Going names, vote counts |
| Q-25 | Organizer actions only from the creating browser; no recovery |
| Q-26 | M1 outings past their close time are closed with M2 rules at release, in history |
| Q-27 | Tie-break applied live while open |
| Q-28 | No votes at close with enough people = tie between all included venues |
| Q-29 | Home page lists open outings only |
| Q-30 | History page linked from home, newest first; visit counts on the Venues page (0 if never) |
| Q-31 | Creating an outing whose close time has passed is refused |
| Q-32 | Live remaining ties shown as leading with "chủ kèo sẽ chọn" |
| Q-33 | Live, no votes: keep "Chưa có phiếu" |
| Q-34 | "Waiting for the organizer to choose", no deadline |
| Q-35 | "Đã đi" / "Không đi" from the sitting time, no deadline |
| Q-36 | History lists all closed outings with marks; counts from "Đã đi" only |

## M2.7 Assumptions and risks
- Assumptions accepted at the M2 re-sign: A-08 (close on the outing's own date, Vietnam time),
  A-09 (closing is final), A-10 (choice and visit confirmation are final), A-11 (old M1 outings:
  no visits yet, ties go to the M1 organizer's browser), A-12 (organizer need not be Going),
  A-13 (waiting page shows headcount, names, counts), A-14 (waiting outings in history:
  "chưa chọn quán", "Chưa xác nhận"), A-15 (history by outing date, newest first; each line
  opens the outing).
- Risks: R-06 organizer actions tied to one browser (ties stay unchosen, visits unconfirmed;
  accepted); R-01 cookie-only identity; R-04 M2 results for old outings rely on M1 data.

## M2.8 Story map
1. S-13: Outing closes automatically at its close time
2. S-14: Closed outing page with the result
3. S-15: Cancel an outing when not enough people are going
4. S-16: Organizer closes the outing early
5. S-17: Organizer confirms whether the team went
6. S-18: Break a tie at close by the least recently visited venue
7. S-19: Organizer chooses among venues still tied at close
8. S-20: Leading venue with the tie-break while the outing is open
9. S-21: History page of closed outings
10. S-22: Visit counts on the Venues page
11. S-23: Home page lists open outings only
12. S-24: Refuse an outing whose close time has already passed
13. S-25: Close old M1 outings with the M2 rules at release
