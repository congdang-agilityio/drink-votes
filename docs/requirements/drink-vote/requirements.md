# Requirement analysis: Drink Votes
Signed-off: 2026-10-15 by Cong Dang
- Slug: `drink-vote`
- Status: Signed off
- Sources: see the table below

## Changelog
| Date | Round | Change |
|---|---|---|
| 2026-10-15 | 1 | Initial analysis of the full README; FRs tagged M1 / M2 |
| 2026-10-15 | 2 | Applied Q-01..Q-07: no closing in M1 (FR-08 revised, FR-20 added); organizer = creator's browser (FR-18); Vietnamese-only UI (NFR-08); home page with outing list (FR-17); venues add-only (FR-02, FR-03, scope out); all tied venues shown as leading (FR-09, BR-08); name asked on first visit and changeable (FR-01, FR-19, BR-09). Follow-ups Q-21..Q-26 added |
| 2026-10-15 | 3 | Applied Q-08, Q-09, Q-10, Q-11, Q-14, Q-21, Q-22: vote removed on switch to Not going (FR-07, BR-11); anonymous vote counts, only Going listed (FR-09); create-outing checks (FR-04, BR-12); shared open space, organizer not auto-Going (A-01, A-02, NFR-07, FR-06); no outing editing in M1 (FR-04, scope out); home page lists outings from today, soonest first (FR-17, BR-13); "Chưa có phiếu" when no votes (BR-08). Deferred Q-16..Q-20, Q-25, Q-26 to M2 with stakeholder agreement |
| 2026-10-15 | 4 | Applied Q-12, Q-13, Q-15, Q-23, Q-24: every page usable on a phone screen (NFR-09, now in M1 scope); venue name and address required, Maps link and notes optional and unchecked (FR-02, BR-15); duplicate venue names refused ignoring case (FR-02, BR-16, A-07); new name shown everywhere after a name change (FR-19, BR-17); product name "Drink Votes" (FR-21, C-01). No open or answered questions remain: ready for GATE 1 |

## Sources
| ID | File (in `sources/`) | Origin | Retrieved | Notes |
|---|---|---|---|---|
| SRC-1 | `readme.md` | `README.md` (repo root), Vietnamese | 2026-10-15 | Full product description, milestones M1 and M2 |
| SRC-2 | `stakeholder-brief.md` | stakeholder-brief | 2026-10-15 | "Xây Drink Votes theo M1 trước" (build Drink Votes, M1 first) |
| Q-nn | `questions.md` | stakeholder answers | 2026-10-15 | Confirmed decisions cited as Q-nn |

## Milestones
- **M1 "Tonight's outing" (Kèo tối nay):** build first (SRC-2).
- **M2 "Rules of play" (Luật chơi):** later (SRC-2).

Every FR below carries a `Milestone` column so scope can be decided per milestone.

## 1. Business goal and problem statement
A team picks a drinking spot (quán nhậu) for the evening: who goes, which place, and when it is
decided. Today "drinking tonight?" (tối nay nhậu không?) in chat ends with everyone suggesting a
place, nobody deciding, and at 5 p.m. nobody knows how many people are coming to book a table.
Drink Votes (product name, Q-15) turns each invitation into an **outing (kèo)** with a date, a list of venues to vote
on, a decision deadline (close time) and a headcount (SRC-1 §Vấn đề). The app is also a demo of
the squad workflow (SRC-1 intro).

Success: by the close time the organizer knows how many people are going and which venue won,
so a table can be booked (SRC-1 §Vấn đề, §Người dùng). In M1 there is no formal close: the
organizer reads the live headcount and leading venue(s) on the outing page (Q-01).

## 2. Actors / personas
| Actor | Description | Goals |
|---|---|---|
| Organizer (người rủ / chủ kèo) | Person who creates an outing (SRC-1 §Người dùng); recognised by the browser that created it (Q-02) | Create the outing, choose which venues are in the vote, book a table based on the result |
| Member (thành viên) | Anyone in the team who opens the outing link (SRC-1 §Người dùng) | Say Going / Not going, vote for a venue, see the result |
| Operator / platform | Railway health checks, DevOps (SRC-1 §M1, §Kỹ thuật) | Know whether the app and database are up |

There are no accounts: a user enters a name on the first visit and the app remembers it with a
cookie (SRC-1 §Người dùng, Q-07). Identity is the browser, not the name (BR-09).

## 3. Functional requirements
| ID | Milestone | Requirement | Source | Status |
|---|---|---|---|---|
| FR-01 | M1 | On the first visit to any page, the system shall ask the user for a display name and remember it in a cookie; no login or account. | SRC-1 §Người dùng; Q-07 | confirmed |
| FR-02 | M1 | The system shall let anyone add a venue (quán) with name, address, Google Maps link, and free-text notes (e.g. "parking available" (có chỗ để xe), "draft beer" (bia tươi)). Name and address are required; the Maps link and notes are optional, and the Maps link is not checked (BR-15). A venue whose name matches an existing venue's name, ignoring upper/lower case, is refused with the message "A venue with this name already exists" (shown in Vietnamese) (BR-16). Venues cannot be edited or deleted in M1. | SRC-1 §M1 "Danh sách quán"; Q-05; Q-13; Q-23 | confirmed |
| FR-03 | M1 | The system shall show the list of venues. | SRC-1 §M1 "Danh sách quán"; Q-05 | confirmed |
| FR-04 | M1 | The system shall let a user create an outing (kèo) with a date, a sitting time (giờ ngồi, default 18:30), a close time (giờ chốt, default 16:00) and the venues included in the vote. It shall refuse fewer than 2 venues, a date before today, and a close time that is not before the sitting time (BR-12). An outing cannot be edited after creation in M1. | SRC-1 §M1 "Tạo kèo"; Q-10; Q-14 | confirmed |
| FR-05 | M1 | Each outing shall have its own link that can be pasted into the team chat. | SRC-1 §M1 "Tạo kèo" | confirmed |
| FR-06 | M1 | On an outing, each person shall be able to declare **Going / Not going** (Đi / Không đi) and change that answer at any time in M1. The organizer is not marked Going automatically and answers like everyone else. | SRC-1 §M1 "Trong kèo"; Q-01; Q-11 | confirmed |
| FR-07 | M1 | On an outing, each person who declared Going shall be able to vote for exactly **one** venue; people who are not Going cannot vote. Switching from Going to Not going removes the person's vote; switching back to Going requires voting again (BR-11). | SRC-1 §M1 "Trong kèo"; Q-08 | confirmed |
| FR-08 | M1 | A person shall be able to change their vote at any time in M1 (outings never close in M1). | SRC-1 §M1 "Trong kèo"; Q-01 | confirmed |
| FR-09 | M1 | The outing page shall show the number of people going, the names of people who are Going (people who said Not going or have not answered are not listed), the vote count per venue (votes are anonymous: who voted for which venue is not shown), and the leading venue(s) per BR-08: all venues sharing the highest count, or, when there are no votes, no leader and the message "Chưa có phiếu" (No votes yet). | SRC-1 §M1 "Trang kèo"; Q-06; Q-09; Q-22 | confirmed |
| FR-10 | M1 | `GET /healthz` shall return `200` when both the app and the database are running. | SRC-1 §M1 | provisional (A-06) |
| FR-17 | M1 | The home page (the app's main address) shall show a list of upcoming outings (BR-13: outings dated today or later, soonest first; each line shows the date, sitting time and number of people going) and links to "Create outing" and "Venues". Several outings may exist at the same time. Older outings are not listed but remain reachable by their link. | Q-04; Q-21 | confirmed |
| FR-18 | M1 | Each outing shall record the browser (cookie) that created it; only that browser is the organizer and may perform organizer-only actions. | Q-02; Q-14 | confirmed (no organizer-only actions exist in M1 because outings cannot be edited or closed; the record is kept for M2. Recovery on another device: Q-25, deferred to M2) |
| FR-19 | M1 | A user shall be able to change their display name later. After a change, the new name is shown everywhere, including outings the person already answered (BR-17). | Q-07; Q-24 | confirmed |
| FR-20 | M1 | The outing page shall display the close time; in M1 nothing happens at the close time (the outing never closes). | Q-01 | confirmed |
| FR-21 | M1 | Every page shall show the product name "Drink Votes" in the page title and header. | Q-15 | confirmed |
| FR-11 | M2 | The outing shall close automatically at its close time in Vietnam time (`Asia/Ho_Chi_Minh`); after closing, Going / Not going and votes can no longer be changed. | SRC-1 §M2 | provisional (Q-26, deferred to M2) |
| FR-12 | M2 | The organizer (FR-18) shall be able to close the outing early. | SRC-1 §M2; Q-02 | provisional (G-10 → Q-16, Q-25, deferred to M2) |
| FR-13 | M2 | An outing with fewer than **3 people going** at close time shall be cancelled ("not enough people" (không đủ quân)). The threshold is configurable (`MIN_PEOPLE=3`). | SRC-1 §M2, §Kỹ thuật | provisional (G-10, G-12, deferred to M2) |
| FR-14 | M2 | On a tied vote, the venue that has gone longest without being visited wins; a venue never visited ranks first. | SRC-1 §M2 | provisional (G-11, AMB-05, deferred to M2) |
| FR-15 | M2 | The system shall show a history of closed outings (date, venue, number of people). | SRC-1 §M2 "Lịch sử" | provisional (G-12, deferred to M2) |
| FR-16 | M2 | The system shall show how many times each venue has been visited. | SRC-1 §M2 "Lịch sử" | provisional (AMB-05, deferred to M2) |

## 4. Non-functional requirements
| ID | Category | Requirement | Source |
|---|---|---|---|
| NFR-01 | Platform | Server-rendered HTML, not a single-page app. Stack stated by the stakeholder: Node.js 22, TypeScript, Hono. | SRC-1 §Kỹ thuật |
| NFR-02 | Data | PostgreSQL; database migrations run before the app starts. | SRC-1 §Kỹ thuật |
| NFR-03 | Quality | Tests with Vitest: unit tests and API tests against a test database. | SRC-1 §Kỹ thuật |
| NFR-04 | Platform | Deployed on Railway with two environments, `staging` and `production`, each with its own Postgres. | SRC-1 §Kỹ thuật |
| NFR-05 | Configuration | Configured through environment variables: `DATABASE_URL`, `PORT`, `APP_TZ=Asia/Ho_Chi_Minh`, `DEFAULT_CLOSE_AT=16:00`, `MIN_PEOPLE=3`. | SRC-1 §Kỹ thuật |
| NFR-06 | i18n / Time | All times (sitting time, close time, auto-close) are interpreted in `Asia/Ho_Chi_Minh`. | SRC-1 §M2, §Kỹ thuật |
| NFR-07 | Security | No login and no permissions; identity is a name stored in a cookie. The app is one shared open space: anyone with the address can see and use all venues and outings. | SRC-1 §Người dùng, §Ngoài phạm vi; Q-11 |
| NFR-08 | i18n | The UI (buttons, labels, messages) is in Vietnamese only; times in 24-hour format (e.g. 18:30); dates as day/month/year. | Q-03 |
| NFR-09 | Usability | Every page shall be usable on a phone screen: the same pages adapt to the screen width (no separate mobile UI). | SRC-1 §Ngoài phạm vi; Q-12 |

## 5. Scope
- **In (M1, build first):** FR-01 to FR-10, FR-17 to FR-21, NFR-01 to NFR-09.
- **In (M2, later):** FR-11 to FR-16.
- **Out of M1 (decided):** any closing of an outing, manual or automatic (Q-01); editing or
  deleting venues (Q-05); editing an outing after creation (Q-14); a language switch or English
  UI (Q-03); showing who voted for which venue or who said Not going (Q-09).
- **Out (SRC-1 §Ngoài phạm vi):** login, permissions/roles, multiple teams, bill splitting,
  booking through the venue's app, Slack/email notifications, maps, a separate mobile UI.

## 6. Business rules and data entities
- BR-01 (M1): Only a person who declared Going can vote (SRC-1 §M1).
- BR-02 (M1): One vote per person per outing; in M1 it can be changed at any time (SRC-1 §M1, Q-01).
- BR-03 (M1): Default sitting time 18:30; default close time 16:00 (`DEFAULT_CLOSE_AT`) (SRC-1 §M1, §Kỹ thuật).
- BR-04 (M2): Auto-close at close time in `Asia/Ho_Chi_Minh`; after close, no changes (SRC-1 §M2).
- BR-05 (M2): Organizer can close early (SRC-1 §M2).
- BR-06 (M2): Fewer than `MIN_PEOPLE` (3) going at close → outing cancelled (SRC-1 §M2).
- BR-07 (M2): Tie-break: least recently visited venue wins; never-visited ranks first (SRC-1 §M2).
- BR-08 (M1): Leading venue(s) = every venue with the highest vote count; ties show all of them (Q-06). When an outing has no votes, no venue is leading and the page shows "Chưa có phiếu" (No votes yet) (Q-22).
- BR-09 (M1): A person is identified by their browser (cookie), not by their name; two people may use the same name and are treated as different people (Q-07).
- BR-10 (M1): The organizer of an outing is the browser that created it (Q-02).
- BR-11 (M1): When a person switches from Going to Not going, their vote is removed; if they switch back to Going they must vote again (Q-08).
- BR-12 (M1): Creating an outing is refused if it has fewer than 2 venues, its date is before today (`Asia/Ho_Chi_Minh`), or its close time is not before its sitting time (Q-10).
- BR-13 (M1): The home page lists outings whose date is today or later (`Asia/Ho_Chi_Minh`), soonest first; each line shows date, sitting time and number going (Q-21).
- BR-14 (M1): The organizer is not automatically Going (Q-11).
- BR-15 (M1): A venue requires a name and an address; the Google Maps link and notes are optional; the Maps link is not validated (Q-13).
- BR-16 (M1): Venue names are unique, ignoring upper/lower case; adding a duplicate is refused with "A venue with this name already exists" (shown in Vietnamese) (Q-23).
- BR-17 (M1): A person's current display name is shown everywhere, including on outings they answered before changing it (Q-24).
- Entities:
  - `Venue` (quán): name (required, unique ignoring case), address (required), Google Maps link (optional), notes (optional); add-only in M1. (M2: last visited date, visit count, derived.)
  - `Outing` (kèo): date, sitting time (giờ ngồi), close time (giờ chốt), included venues, unique link,
    creator browser (organizer), state (M1: always open; M2: closed / cancelled), winning venue (M2).
  - `Participant`: browser identity (cookie), current display name; per outing: Going / Not going.
  - `Vote`: participant, outing, venue (at most one per participant per outing).

## 7. Gaps (missing information)
- G-01 (M1): resolved by Q-01 (no closing in M1).
- G-02 (M1/M2): resolved by Q-02 (creator's browser).
- G-03 (M1): resolved by Q-05 (anyone adds; no edit/delete).
- G-04 (M1): resolved by Q-03 (Vietnamese only).
- G-05 (M1): resolved by Q-04 and Q-21 (home page lists outings dated today or later).
- G-06 (M1): resolved by Q-07 and Q-24 (ask on first visit, changeable, same names allowed; new name shown everywhere).
- G-07 (M1): resolved by Q-13 and Q-23 (name and address required; duplicate names refused ignoring case).
- G-08 (M1): resolved by Q-10 (refuse all three cases, BR-12).
- G-09 (M1): resolved by Q-14 (no editing in M1).
- G-10 (M2): Whether an early close by the organizer also applies the 3-people cancellation rule → Q-16 (deferred to M2)
- G-11 (M2): Tie-break when the tied venues are all never visited, or were last visited on the same date → Q-17 (deferred to M2)
- G-12 (M2): How a cancelled outing is shown, and whether it appears in history → Q-19 (deferred to M2)
- G-13 (M1): resolved by Q-12 (every page usable on a phone screen, NFR-09).
- G-14 (M2): What a closed outing page shows (final winner, closed badge) → Q-20 (deferred to M2)
- G-15 (M2): Organizer actions from another device or after clearing the browser → Q-25 (deferred to M2)
- G-16 (M2): What happens at M2 release to M1 outings already past their close time → Q-26 (deferred to M2)

## 8. Ambiguities (more than one reading)
- AMB-01 (M1): resolved by Q-01, reading (a): outings never close in M1.
- AMB-02 (M1): resolved by Q-08, reading (a): the vote is removed.
- AMB-03 (M1): resolved by Q-06, reading (a): all tied venues shown as leading. Zero-votes case → Q-22
- AMB-04 (M1): resolved by Q-07: asked on first visit to any page.
- AMB-05 (M2): "quán lâu chưa đi nhất" (venue not visited for the longest time): "visited" means
  (a) the venue won a closed, not cancelled outing (by outing date); (b) something else → Q-18 (deferred to M2)
- AMB-06 (M1): resolved by Q-09: counts per venue only (anonymous); only Going people listed.
- AMB-07 (M1): resolved by Q-21: outings dated today or later, soonest first.

## 9. Conflicts (sources disagree)
- C-01 (minor): SRC-1 title says "Drink Vote" vs SRC-2 says "Drink Votes": resolved by Q-15 ("Drink Votes", FR-21).

## 10. Assumptions (provisional until confirmed)
- A-01: confirmed by Q-11 (single shared open space; anyone with the URL can see and use everything).
- A-02: confirmed by Q-11 (organizer not automatically Going, BR-14).
- A-03: confirmed by Q-04 (several outings may exist at the same time).
- A-04: confirmed by Q-03 (24-hour times, day/month/year dates).
- A-05: confirmed by Q-09 (only Going people are listed).
- A-06: `/healthz` returns a non-200 status (e.g. 503) when the database is unreachable (only the 200 case is stated) — technical detail, left to the Team Lead; no question.
- A-07: For the duplicate check (BR-16), venue names that differ only by leading or trailing spaces count as the same name — implementation detail of Q-23, left to the Team Lead; no question. Names that differ in Vietnamese diacritics (e.g. "Quán Ốc" vs "Quan Oc") count as different names, since the stakeholder chose "ignoring upper/lower case" only.

## 11. Risks and external dependencies
- R-01: Cookie-only identity allows anyone to vote under any name or vote twice from two browsers,
  and the organizer loses organizer actions on another device (Q-25). Accepted by design (no login
  is out of scope; same names allowed, Q-07), and acknowledged by the stakeholder (Q-11).
- R-02: Accepted (Q-01): M1 gives no final result; the organizer books from the live headcount and
  leading venue(s) at whatever time they choose.
- R-03: Railway (hosting, Postgres) is an external dependency (SRC-1 §Kỹ thuật).
- R-04: M2 tie-break and history depend on data recorded from M1 outings; M1 must store the outing date,
  answers and votes so M2 can compute results for old outings (Q-18, Q-26).
- R-05: Venues are add-only in M1 (Q-05): typos stay in the list permanently. Exact duplicate names are refused (Q-23, BR-16), but a misspelled second entry for the same place can still be added.
