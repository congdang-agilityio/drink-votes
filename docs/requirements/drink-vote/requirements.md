# Requirement analysis: Drink Votes
Signed-off: 2026-10-15 by Cong Dang
Re-signed (M2 "Rules of play", FR-11..FR-16, FR-22..FR-29, assumptions A-08..A-15): 2026-10-16 by Cong Dang
- Slug: `drink-vote`
- Status: Signed off (M1 2026-10-15; M2 re-signed 2026-10-16)
- Sources: see the table below

## Changelog
| Date | Round | Change |
|---|---|---|
| 2026-10-15 | 1 | Initial analysis of the full README; FRs tagged M1 / M2 |
| 2026-10-15 | 2 | Applied Q-01..Q-07: no closing in M1 (FR-08 revised, FR-20 added); organizer = creator's browser (FR-18); Vietnamese-only UI (NFR-08); home page with outing list (FR-17); venues add-only (FR-02, FR-03, scope out); all tied venues shown as leading (FR-09, BR-08); name asked on first visit and changeable (FR-01, FR-19, BR-09). Follow-ups Q-21..Q-26 added |
| 2026-10-15 | 3 | Applied Q-08, Q-09, Q-10, Q-11, Q-14, Q-21, Q-22: vote removed on switch to Not going (FR-07, BR-11); anonymous vote counts, only Going listed (FR-09); create-outing checks (FR-04, BR-12); shared open space, organizer not auto-Going (A-01, A-02, NFR-07, FR-06); no outing editing in M1 (FR-04, scope out); home page lists outings from today, soonest first (FR-17, BR-13); "Chưa có phiếu" when no votes (BR-08). Deferred Q-16..Q-20, Q-25, Q-26 to M2 with stakeholder agreement |
| 2026-10-15 | 4 | Applied Q-12, Q-13, Q-15, Q-23, Q-24: every page usable on a phone screen (NFR-09, now in M1 scope); venue name and address required, Maps link and notes optional and unchecked (FR-02, BR-15); duplicate venue names refused ignoring case (FR-02, BR-16, A-07); new name shown everywhere after a name change (FR-19, BR-17); product name "Drink Votes" (FR-21, C-01). No open or answered questions remain: ready for GATE 1 |
| 2026-10-16 | 5 (M2 change) | Stakeholder asked to move on to M2 (stakeholder-notes.md, 2026-10-16). Reopened the deferred M2 questions Q-16..Q-20, Q-25, Q-26 and re-checked them against M1 decisions (Q-01, Q-06, Q-08, Q-09, Q-10, Q-14, Q-21, Q-22). Added new M2 questions Q-27..Q-31 and gaps G-17..G-21; added assumptions A-08, A-09; FR-11..FR-16 stay provisional. M2 changes to M1 rules noted on FR-06, FR-08, FR-20 (changes allowed only while the outing is open). M1 sign-off is unchanged; M2 needs a re-sign |
| 2026-10-16 | 5 (M2 answers) | Applied Q-16, Q-17, Q-18, Q-25, Q-26, Q-27, Q-28: cancellation below `MIN_PEOPLE` applies to every close incl. early close (FR-13, BR-18); remaining ties after the tie-break are chosen by the organizer (FR-14, FR-22, BR-19); a venue is visited only after the organizer confirms the team went (FR-16, FR-23, BR-20); organizer actions only from the creating browser, no recovery (FR-12, FR-18, BR-10); M1 outings past their close time are closed with M2 rules at release (FR-24, BR-23); tie-break applied live while open (FR-25, BR-22); no votes at close = tie between all venues (BR-21). Added conflict C-02, gaps G-22..G-26, assumptions A-10..A-12, risk R-06 and follow-up questions Q-32..Q-36. Noted the PM's added context when asking Q-25 (stakeholder-notes.md); answer accepted |
| 2026-10-16 | 6 (M2 answers) | Applied Q-19, Q-20, Q-32, Q-33, Q-34, Q-35, Q-36: cancelled page and history entry (FR-26, BR-24); closed page with winner, address, Maps link, headcount, Going names and vote counts (FR-27, BR-25); open page shows remaining ties with "chủ kèo sẽ chọn" note and keeps "Chưa có phiếu" before any vote (FR-25, BR-22); "waiting for the organizer to choose" state with no deadline (FR-22, BR-19); visit confirmation "Đã đi" / "Không đi" from the sitting time, no deadline (FR-23, BR-20); history lists all closed outings with marks, visit counts from "Đã đi" only (FR-15, FR-16, BR-26). Resolved C-02 and G-12, G-14, G-22..G-26; R-06 accepted; added assumptions A-13, A-14. Refined the unasked Q-29 (option A) and Q-30 (question text). No follow-ups; Q-29..Q-31 remain |
| 2026-10-16 | 7 (M2 answers) | Applied Q-29, Q-30, Q-31: the home page lists open outings only; closed, waiting and cancelled outings leave the list (FR-29, BR-28); new "Lịch sử" (History) page linked from the home page, closed outings newest first, visit count next to each venue on the Venues page with 0 for never visited (FR-15, FR-16, BR-29); creating an outing whose close time has already passed is refused (FR-28, BR-27). FR-11, FR-15, FR-16 now confirmed; G-19..G-21 resolved; added assumption A-15 (history order and each line opening its outing page). No open or answered questions remain: M2 ready for its GATE 1 re-sign |

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
| FR-18 | M1 | Each outing shall record the browser (cookie) that created it; only that browser is the organizer and may perform organizer-only actions. | Q-02; Q-14; Q-25 | confirmed (no organizer-only actions exist in M1 because outings cannot be edited or closed; the record is kept for M2. M2: no recovery on another device or after clearing browser data, Q-25) |
| FR-19 | M1 | A user shall be able to change their display name later. After a change, the new name is shown everywhere, including outings the person already answered (BR-17). | Q-07; Q-24 | confirmed |
| FR-20 | M1 | The outing page shall display the close time; in M1 nothing happens at the close time (the outing never closes). | Q-01 | confirmed |
| FR-21 | M1 | Every page shall show the product name "Drink Votes" in the page title and header. | Q-15 | confirmed |
| FR-11 | M2 | The outing shall close automatically at its close time in Vietnam time (`Asia/Ho_Chi_Minh`) on the outing's date (A-08); after closing, Going / Not going and votes can no longer be changed, and the outing cannot be reopened (A-09). From M2, FR-06 and FR-08 ("at any time") apply only while the outing is open, and FR-20 ("nothing happens at the close time") is replaced by this FR. At close, the result is decided by FR-13 (cancellation), then the vote count, FR-14 (tie-break, including no votes per BR-21) and FR-22 (organizer choice). | SRC-1 §M2; Q-28; Q-31 | confirmed (closed page FR-27, cancelled page FR-26; an outing cannot be created already past its close time, FR-28) |
| FR-12 | M2 | The organizer (FR-18) shall be able to close the outing early; the same result rules as an automatic close apply, including cancellation below `MIN_PEOPLE` (BR-18). The organizer-only actions in M2 are: early close (this FR), choosing among venues still tied after the tie-break (FR-22) and confirming the visit (FR-23). They are available only from the browser that created the outing; there is no recovery on another device or after clearing browser data (Q-25). | SRC-1 §M2; Q-02; Q-14; Q-16; Q-17; Q-18; Q-25 | confirmed |
| FR-13 | M2 | An outing with fewer than **3 people going** at close time shall be cancelled ("not enough people" (không đủ quân)), whether the close is automatic or early (BR-18). The threshold is configurable (`MIN_PEOPLE=3`). | SRC-1 §M2, §Kỹ thuật; Q-16 | confirmed (cancelled page and history: FR-26) |
| FR-14 | M2 | On a tied vote at close, the tied venue that has gone longest without being visited (by the date of its last confirmed visit, BR-20) wins; a venue never visited ranks first. With `MIN_PEOPLE` or more going and no votes, all included venues are treated as tied and the same tie-break applies (BR-21). If several venues are still tied after the tie-break (e.g. several never visited, or last visited on the same date), they are shown as tied and the organizer chooses (FR-22). | SRC-1 §M2; Q-17; Q-18; Q-28 | confirmed |
| FR-15 | M2 | The system shall show a history of closed outings on a new "History" (Lịch sử) page, linked from the home page, listing closed outings newest first (BR-29, A-15): every closed, non-cancelled outing with its date, winning venue (or "chưa chọn quán" (no venue chosen) while the organizer has not chosen, FR-22) and number of people, marked "Đã đi" (went, confirmed), "Chưa xác nhận" (not confirmed) or "Không đi" (did not go); and every cancelled outing, marked as cancelled with its final headcount (FR-26). M1 outings closed at M2 release appear in it (FR-24). | SRC-1 §M2 "Lịch sử"; Q-19; Q-26; Q-30; Q-36 | confirmed |
| FR-16 | M2 | The Venues page (FR-03) shall show, next to each venue, how many times it has been visited (0 for a venue never visited) (BR-29). A visit counts only when the venue won a closed, non-cancelled outing and the organizer answered "Đã đi" (BR-20); outings marked "Chưa xác nhận" or "Không đi" do not count (BR-26). | SRC-1 §M2 "Lịch sử"; Q-18; Q-30; Q-35; Q-36 | confirmed |
| FR-22 | M2 | When several venues are still tied after the tie-break at close, the outing page shall show "Closed – waiting for the organizer to choose" (shown in Vietnamese) with the tied venues, and only the organizer's browser (FR-18) sees buttons to choose the winning venue among them (BR-19). There is no deadline: if the organizer never chooses, the outing stays without a winner and never counts as a visit. The choice is final (A-10). The rest of the waiting page follows A-13. | Q-17; Q-34 | confirmed |
| FR-23 | M2 | Once an outing has a winning venue and its sitting time on the outing's date (`Asia/Ho_Chi_Minh`) has passed, the organizer's browser (FR-18) shall see "Đã đi <venue> chưa?" with the buttons "Đã đi" (We went) and "Không đi" (We did not go). There is no deadline. Only "Đã đi" makes the venue count as visited, with the outing's date as the visit date; "Không đi" means it never counts; an unanswered outing does not count (BR-20). The answer is final (A-10). | Q-18; Q-35 | confirmed |
| FR-24 | M2 | At M2 release, every M1 outing whose close time has already passed shall be closed with the M2 rules: cancelled if fewer than `MIN_PEOPLE` are going, otherwise a winner by FR-14 and FR-22; these outings appear in the history (BR-23, A-11). | Q-26 | confirmed (history content: FR-15, BR-26) |
| FR-25 | M2 | While an outing is open, the outing page shall show the leading venue decided by vote count and then the tie-break of FR-14 (using confirmed visits only) (BR-22): normally one leading venue; if several venues are still tied after the tie-break, all of them are shown as leading with a note that the organizer will choose at close (e.g. "Hoà: Quán A, Quán B – chủ kèo sẽ chọn"); with no votes yet, no venue is leading and the page shows "Chưa có phiếu" (No votes yet), as in M1. This replaces the M1 "all tied venues are leading" display (BR-08) from M2. | Q-27; Q-32; Q-33 | confirmed |
| FR-26 | M2 | A cancelled outing's page shall show "Cancelled: not enough people" (shown in Vietnamese, "không đủ quân") with the final headcount; Going / Not going and vote buttons are hidden. The history lists it marked as cancelled; it never counts as a visit (BR-24). | Q-19 | confirmed |
| FR-27 | M2 | A closed outing with a winning venue shall show a "Closed" label (shown in Vietnamese), the winning venue with its address and Google Maps link, the final headcount, the names of people who were Going and the vote count per venue (anonymous, as in FR-09); Going / Not going and vote buttons are hidden. The organizer additionally sees the visit confirmation of FR-23 from the sitting time (BR-25). | Q-20 | confirmed |
| FR-28 | M2 | In addition to the M1 checks of FR-04 (BR-12), creating an outing shall be refused when its close time on the outing's date (`Asia/Ho_Chi_Minh`) has already passed at the moment of creation, with the message "The close time has already passed" (shown in Vietnamese) (BR-27). | Q-31 | confirmed |
| FR-29 | M2 | From M2, the home page list (FR-17) shall show only open outings dated today or later, soonest first, with the same line content as in M1 (date, sitting time, number going). Closed outings (with a winner or waiting for the organizer's choice) and cancelled outings leave the list; they stay reachable by their link and through the History page (FR-15). The home page also links to the History page (BR-28). | Q-21; Q-29; Q-30 | confirmed |

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
- **In (M2, clarified 2026-10-16, awaiting re-sign):** FR-11 to FR-16 and FR-22 to FR-29. M2
  changes to M1 behaviour: FR-04 (extra check, FR-28), FR-06 / FR-08 (changes only while open,
  FR-11), FR-09 (replaced by FR-25 while open, FR-22 / FR-26 / FR-27 after close), FR-17 (open
  outings only plus a History link, FR-29), FR-03 (visit counts, FR-16), FR-20 (replaced by FR-11).
- **Out of M2 (decided):** listing closed or cancelled outings on the home page (Q-29; they are
  in the History page).
- **Out of M2 (decided):** a deadline or automatic fallback when the organizer never chooses
  among tied venues (Q-34) or never confirms the visit (Q-35).
- **Out of M2 (decided):** recovering organizer actions on another device or after clearing
  browser data, e.g. an organizer link (Q-25).
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
- BR-06 (M2): Fewer than `MIN_PEOPLE` (3) going at close → outing cancelled (SRC-1 §M2); applies to every close (BR-18).
- BR-07 (M2): Tie-break: least recently visited venue wins; never-visited ranks first (SRC-1 §M2); "visited" per BR-20; remaining ties per BR-19.
- BR-08 (M1): Leading venue(s) = every venue with the highest vote count; ties show all of them (Q-06). When an outing has no votes, no venue is leading and the page shows "Chưa có phiếu" (No votes yet) (Q-22).
- BR-09 (M1): A person is identified by their browser (cookie), not by their name; two people may use the same name and are treated as different people (Q-07).
- BR-10 (M1): The organizer of an outing is the browser that created it (Q-02). M2: all organizer-only actions (early close, choosing among tied venues, confirming the visit) work only from that browser; there is no recovery (Q-25).
- BR-11 (M1): When a person switches from Going to Not going, their vote is removed; if they switch back to Going they must vote again (Q-08).
- BR-12 (M1): Creating an outing is refused if it has fewer than 2 venues, its date is before today (`Asia/Ho_Chi_Minh`), or its close time is not before its sitting time (Q-10).
- BR-13 (M1): The home page lists outings whose date is today or later (`Asia/Ho_Chi_Minh`), soonest first; each line shows date, sitting time and number going (Q-21).
- BR-14 (M1): The organizer is not automatically Going (Q-11).
- BR-15 (M1): A venue requires a name and an address; the Google Maps link and notes are optional; the Maps link is not validated (Q-13).
- BR-16 (M1): Venue names are unique, ignoring upper/lower case; adding a duplicate is refused with "A venue with this name already exists" (shown in Vietnamese) (Q-23).
- BR-17 (M1): A person's current display name is shown everywhere, including on outings they answered before changing it (Q-24).
- BR-18 (M2): The cancellation rule (fewer than `MIN_PEOPLE` going) applies to every close: automatic, early by the organizer, and at M2 release for old M1 outings (Q-16, Q-26).
- BR-19 (M2): If several venues are still tied after the tie-break at close, they are shown as tied and the organizer chooses the winner among them (Q-17). Until then the outing is "Closed – waiting for the organizer to choose" and has no winner; there is no deadline, and if no choice is ever made it never gets a winner and never counts as a visit (Q-34).
- BR-20 (M2): A venue counts as visited only when it won a closed, non-cancelled outing and the organizer answered "Đã đi" (We went); the visit date is the outing's date. The organizer can answer "Đã đi" or "Không đi" (We did not go) only once the outing has a winner and its sitting time has passed; there is no deadline; "Không đi" or no answer never counts. Visit counts and the tie-break use "Đã đi" visits only (Q-18, Q-35).
- BR-21 (M2): At close, if `MIN_PEOPLE` or more are going and there are no votes, all included venues are treated as tied and BR-07 / BR-19 apply (Q-28).
- BR-22 (M2): While an outing is open, the leading venue is decided by vote count and then the tie-break (BR-07, confirmed visits only); one leading venue is shown (Q-27). If several venues are still tied after the tie-break, all of them are shown as leading with the note that the organizer will choose at close (Q-32). With no votes, no venue is leading and the page shows "Chưa có phiếu", as in M1; BR-21 applies only at close (Q-33). Replaces the "all tied venues" display of BR-08 from M2.
- BR-23 (M2): At M2 release, M1 outings whose close time has passed are closed with the M2 rules (BR-18, BR-07, BR-19, BR-21) and appear in the history (Q-26).
- BR-24 (M2): A cancelled outing shows "Cancelled: not enough people" with the final headcount and no answer or vote buttons; it is listed in the history marked as cancelled and never counts as a visit (Q-19).
- BR-25 (M2): A closed outing with a winner shows the "Closed" label, the winning venue (address, Google Maps link), the final headcount, the Going names and the anonymous vote count per venue; no answer or vote buttons (Q-20).
- BR-26 (M2): The history lists every closed outing: non-cancelled ones with the winning venue (or "chưa chọn quán") and a mark "Đã đi" / "Chưa xác nhận" / "Không đi"; cancelled ones marked as cancelled. Only "Đã đi" outings count in the visit counts (Q-19, Q-36).
- BR-27 (M2): Creating an outing is also refused when its close time on the outing's date (`Asia/Ho_Chi_Minh`) has already passed at creation, with "The close time has already passed" (shown in Vietnamese) (Q-31).
- BR-28 (M2): The home page lists only open outings dated today or later, soonest first; closed (including waiting for the organizer's choice) and cancelled outings are not listed but stay reachable by link and in the History page (Q-29).
- BR-29 (M2): The history is a "Lịch sử" (History) page linked from the home page, closed outings newest first; visit counts are shown next to each venue on the Venues page, 0 for never visited (Q-30).
- Entities:
  - `Venue` (quán): name (required, unique ignoring case), address (required), Google Maps link (optional), notes (optional); add-only in M1. (M2: last visited date, visit count, derived.)
  - `Outing` (kèo): date, sitting time (giờ ngồi), close time (giờ chốt), included venues, unique link,
    creator browser (organizer), state (M1: always open; M2: open / closed with winner / closed
    waiting for the organizer's choice / cancelled, Q-34), winning venue (M2), final headcount
    (M2), visit answer by the organizer (M2: none / "Đã đi" / "Không đi", Q-18, Q-35).
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
- G-10 (M2): resolved by Q-16 (the cancellation rule applies to early close too, BR-18).
- G-11 (M2): resolved by Q-17 (remaining ties: the organizer chooses, BR-19); follow-up G-24.
- G-12 (M2): resolved by Q-19 (cancelled page with headcount; listed in history as cancelled; FR-26, BR-24).
- G-13 (M1): resolved by Q-12 (every page usable on a phone screen, NFR-09).
- G-14 (M2): resolved by Q-20 (closed page with winner details, headcount, Going names and vote counts; FR-27, BR-25).
- G-15 (M2): resolved by Q-25 (only the original browser; no recovery).
- G-16 (M2): resolved by Q-26 (closed with M2 rules at release, in history; FR-24, BR-23).
- G-17 (M2): resolved by Q-27 (tie-break applied live, one leading venue; FR-25, BR-22); remaining cases in C-02.
- G-18 (M2): resolved by Q-28 (no votes at close = tie between all venues, BR-21).
- G-19 (M2): resolved by Q-29 (home page lists open outings only; FR-29, BR-28).
- G-20 (M2): resolved by Q-30 (History page linked from home, newest first; visit counts on the Venues page; FR-15, FR-16, BR-29); remaining detail in A-15.
- G-21 (M2): resolved by Q-31 (refused with "The close time has already passed"; FR-28, BR-27).
- G-22 (M2): resolved by Q-32 (remaining ties shown as leading with the "chủ kèo sẽ chọn" note; FR-25, BR-22).
- G-23 (M2): resolved by Q-33 (keep "Chưa có phiếu" while open with no votes; FR-25, BR-22).
- G-24 (M2): resolved by Q-34 ("waiting for the organizer to choose", no deadline; FR-22, BR-19).
- G-25 (M2): resolved by Q-35 ("Đã đi" / "Không đi" from the sitting time, no deadline; FR-23, BR-20).
- G-26 (M2): resolved by Q-36 (all closed outings listed with marks; visit counts from "Đã đi" only; FR-15, FR-16, BR-26).

## 8. Ambiguities (more than one reading)
- AMB-01 (M1): resolved by Q-01, reading (a): outings never close in M1.
- AMB-02 (M1): resolved by Q-08, reading (a): the vote is removed.
- AMB-03 (M1): resolved by Q-06, reading (a): all tied venues shown as leading. Zero-votes case → Q-22
- AMB-04 (M1): resolved by Q-07: asked on first visit to any page.
- AMB-05 (M2): resolved by Q-18: "visited" = won a closed, non-cancelled outing **and** confirmed by the organizer; visit date = outing date (BR-20).
- AMB-06 (M1): resolved by Q-09: counts per venue only (anonymous); only Going people listed.
- AMB-07 (M1): resolved by Q-21: outings dated today or later, soonest first.

## 9. Conflicts (sources disagree)
- C-01 (minor): SRC-1 title says "Drink Vote" vs SRC-2 says "Drink Votes": resolved by Q-15 ("Drink Votes", FR-21).
- C-02 (M2, between answers): Q-27 = B says "Apply the tie-break already while open: always show one leading venue", while Q-17 = C says "Show them as tied and let the organizer choose" when the tie-break still ties, and Q-22 = A says that with no votes there is "No leader; show a message such as 'No votes yet' (Chưa có phiếu)". "Always one leading venue" cannot hold when the tie-break still ties, and may or may not replace "Chưa có phiếu" → Q-32, Q-33. **Resolved 2026-10-16** by Q-32 = A (remaining ties are shown as leading with a note that the organizer will choose at close) and Q-33 = A (no votes: keep "Chưa có phiếu"); "one leading venue" applies only when the tie-break picks one (FR-25, BR-22).

## 10. Assumptions (provisional until confirmed)
- A-01: confirmed by Q-11 (single shared open space; anyone with the URL can see and use everything).
- A-02: confirmed by Q-11 (organizer not automatically Going, BR-14).
- A-03: confirmed by Q-04 (several outings may exist at the same time).
- A-04: confirmed by Q-03 (24-hour times, day/month/year dates).
- A-05: confirmed by Q-09 (only Going people are listed).
- A-06: `/healthz` returns a non-200 status (e.g. 503) when the database is unreachable (only the 200 case is stated) — technical detail, left to the Team Lead; no question.
- A-07: For the duplicate check (BR-16), venue names that differ only by leading or trailing spaces count as the same name — implementation detail of Q-23, left to the Team Lead; no question. Names that differ in Vietnamese diacritics (e.g. "Quán Ốc" vs "Quan Oc") count as different names, since the stakeholder chose "ignoring upper/lower case" only.
- A-08 (M2): The automatic close happens at the close time on the outing's own date, in `Asia/Ho_Chi_Minh` (e.g. an outing on 20/10 with close time 16:00 closes at 16:00 on 20/10). To be shown to the stakeholder in understanding.md.
- A-09 (M2): Closing (automatic or early) is final: a closed or cancelled outing cannot be reopened (SRC-1 §M2 "sau đó không đổi ... được nữa"; reopening is not mentioned). To be shown to the stakeholder in understanding.md.
- A-10 (M2): The organizer's choice among tied venues (FR-22) and the visit confirmation (FR-23) are final once made; they cannot be changed afterwards. Mentioned in Q-34 and Q-35 and shown in understanding.md.
- A-11 (M2): For M1 outings closed at M2 release (FR-24), no visit is confirmed yet, so every venue ranks as never visited and any tie goes to the organizer's choice; the organizer is the browser recorded in M1 (FR-18), which can also confirm the visit. Consequence of Q-17, Q-18, Q-26; shown in understanding.md.
- A-12 (M2): The organizer does not need to be Going to close early, choose among tied venues or confirm the visit (organizer actions are tied to the creating browser, BR-10, and the organizer answers like everyone else, BR-14). Shown in understanding.md.
- A-13 (M2): Besides the "Closed – waiting for the organizer to choose" label and the tied venues (Q-34), the waiting page shows the same information as the closed page (Q-20): final headcount, names of people who were Going and the vote count per venue; answer and vote buttons are hidden. Once the organizer chooses, it becomes the closed page of FR-27. Shown in understanding.md.
- A-14 (M2): In the history, an outing still waiting for the organizer's choice is shown with "chưa chọn quán" and the mark "Chưa xác nhận" (it cannot be confirmed before it has a winner, Q-35, Q-36). Shown in understanding.md.
- A-15 (M2): On the History page, "newest first" means by outing date, latest date first; each history line opens that outing's page. Because closed outings leave the home page (Q-29), the History page is how people (and the organizer, to choose among tied venues or confirm the visit) get back to a closed outing without its original link. Consequence of Q-29, Q-30; shown in understanding.md.

## 11. Risks and external dependencies
- R-01: Cookie-only identity allows anyone to vote under any name or vote twice from two browsers,
  and the organizer loses organizer actions on another device (accepted in Q-25). Accepted by design (no login
  is out of scope; same names allowed, Q-07), and acknowledged by the stakeholder (Q-11, Q-25).
- R-02: Accepted (Q-01): M1 gives no final result; the organizer books from the live headcount and
  leading venue(s) at whatever time they choose.
- R-03: Railway (hosting, Postgres) is an external dependency (SRC-1 §Kỹ thuật).
- R-04: M2 tie-break and history depend on data recorded from M1 outings; M1 must store the outing date,
  answers and votes so M2 can compute results for old outings (Q-18, Q-26). Q-26 = A confirms old
  outings are closed with M2 rules at release (FR-24).
- R-06 (M2): Several M2 results depend on the organizer acting from one browser (Q-17, Q-18, Q-25):
  if they forget or lose that browser, ties stay without a winner and visits stay unconfirmed, which
  makes visit counts too low and skews the tie-break towards venues the team actually went to.
  Accepted by the stakeholder (Q-34 = A, Q-35 = B: no deadline, no automatic fallback; such
  outings show "chưa chọn quán" / "Chưa xác nhận" in the history). At the start of M2 no visit is
  confirmed, so most ties will need an organizer choice (A-11).
- R-05: Venues are add-only in M1 (Q-05): typos stay in the list permanently. Exact duplicate names are refused (Q-23, BR-16), but a misspelled second entry for the same place can still be added.
