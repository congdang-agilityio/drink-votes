# Stories: Drink Votes M1 "Tonight's outing"

- Slug: `drink-vote` · PRD: `prd.md` · Requirements signed off 2026-10-15 by Cong Dang
- Scope of this epic: M1 only (FR-01..FR-10, FR-17..FR-21, NFR-01..NFR-09). M2 (FR-11..FR-16) is deferred to a later epic.
- AC limit (`limits.story_max_ac`): 5

## Stories
| ID | Title | Priority | ACs | Covers |
|---|---|---|---|---|
| S-01 | Health check for the operator | P0 | 4 | FR-10, NFR-02, NFR-04, NFR-05 |
| S-02 | App shell with product name, Vietnamese UI and phone layout | P0 | 4 | FR-21, NFR-01, NFR-07, NFR-08, NFR-09 |
| S-03 | Ask for a display name on the first visit | P0 | 5 | FR-01, NFR-07 |
| S-04 | Add a venue and see the venue list | P0 | 5 | FR-02, FR-03, NFR-07 |
| S-05 | Venue checks (required fields, duplicate names) | P1 | 4 | FR-02 |
| S-06 | Create an outing and get its link | P0 | 5 | FR-04, FR-05, FR-18, FR-20, NFR-05, NFR-06 |
| S-07 | Outing creation checks | P1 | 5 | FR-04, NFR-06 |
| S-08 | Say Going or Not going | P0 | 5 | FR-06, FR-09, FR-20 |
| S-09 | Vote for a venue | P0 | 5 | FR-07, FR-08, FR-09 |
| S-10 | Show the leading venue(s) | P1 | 4 | FR-09 |
| S-11 | Upcoming outings on the home page | P1 | 5 | FR-17, NFR-06 |
| S-12 | Change my display name | P1 | 4 | FR-19 |

Suggested delivery order: S-01, S-02, S-03, S-04, S-05, S-06, S-07, S-08, S-09, S-10, S-11, S-12.

## How users reach each screen
| Screen | Way in | Provided by |
|---|---|---|
| Home page | App's main address | S-02 |
| Name prompt | Shown automatically on the first visit to any page | S-03 |
| Venue list / add venue | "Venues" link on the home page | S-04 |
| Create outing | "Create outing" link on the home page | S-06 |
| Outing page | Redirect after creating; its own link pasted in chat; line in the home list | S-06, S-11 |
| Change name | Current name with a change link in the page header | S-12 |

## FR → Story traceability
| FR | Stories |
|---|---|
| FR-01 | S-03 |
| FR-02 | S-04, S-05 |
| FR-03 | S-04 |
| FR-04 | S-06, S-07 |
| FR-05 | S-06 |
| FR-06 | S-08 |
| FR-07 | S-09 |
| FR-08 | S-09 |
| FR-09 | S-08, S-09, S-10 |
| FR-10 | S-01 |
| FR-17 | S-02 (home page), S-04 ("Venues" link), S-06 ("Create outing" link), S-11 (outing list) |
| FR-18 | S-06 |
| FR-19 | S-12 |
| FR-20 | S-06, S-08 |
| FR-21 | S-02 |
| FR-11 | M2: see the M2 section below |
| FR-12 | M2: see the M2 section below |
| FR-13 | M2: see the M2 section below |
| FR-14 | M2: see the M2 section below |
| FR-15 | M2: see the M2 section below |
| FR-16 | M2: see the M2 section below |

## NFR → Story traceability
| NFR | Stories |
|---|---|
| NFR-01 | S-02 (and every page story) |
| NFR-02 | S-01 |
| NFR-03 | Every story (unit and API tests against a test database are part of each story's tasks) |
| NFR-04 | S-01 (staging/production on Railway; checked by DevOps on deploy) |
| NFR-05 | S-01 (`DATABASE_URL`, `PORT`), S-06 (`DEFAULT_CLOSE_AT`), S-07 and S-11 (`APP_TZ`); `MIN_PEOPLE` is used only by M2 |
| NFR-06 | S-06, S-07, S-11 |
| NFR-07 | S-02, S-03, S-04 |
| NFR-08 | S-02 (and every page story) |
| NFR-09 | S-02 (and every page story) |

## Size self-check
| Story | ACs | ≤ limit? | Split pattern used |
|---|---|---|---|
| S-01 | 4 | yes | operator channel separated from user pages |
| S-02 | 4 | yes | simple version first (shell before features) |
| S-03 | 5 | yes | by workflow: ask name (change name split to S-12) |
| S-04 | 5 | yes | happy path first (checks split to S-05) |
| S-05 | 4 | yes | by business rule (BR-15, BR-16) |
| S-06 | 5 | yes | happy path first (checks split to S-07) |
| S-07 | 5 | yes | by business rule (BR-12) |
| S-08 | 5 | yes | by workflow: answer before vote |
| S-09 | 5 | yes | by workflow: vote (leader display split to S-10) |
| S-10 | 4 | yes | by business rule (BR-08) |
| S-11 | 5 | yes | by business rule (BR-13) |
| S-12 | 4 | yes | by CRUD operation: update name |

---

# Stories: Drink Votes M2 "Rules of play"

- Slug: `drink-vote` · PRD: `prd.md` (M2 section) · Epic file: `epic-m2.md` · Requirements re-signed for M2 on 2026-10-16 by Cong Dang
- Scope of this epic: M2 (FR-11..FR-16, FR-22..FR-29) and the M2 changes to M1 behaviour (FR-03, FR-04, FR-06, FR-08, FR-09, FR-17, FR-20). Stories S-13..S-25; M1 stories S-01..S-12 are unchanged.
- AC limit (`limits.story_max_ac`): 5

## M2 stories
| ID | Title | Priority | ACs | Covers |
|---|---|---|---|---|
| S-13 | Outing closes automatically at its close time | P0 | 5 | FR-11, FR-06, FR-08, FR-20, NFR-06 |
| S-14 | Closed outing page with the result | P0 | 5 | FR-27, FR-09 |
| S-15 | Cancel an outing when not enough people are going | P0 | 5 | FR-13, FR-26, NFR-05 |
| S-16 | Organizer closes the outing early | P1 | 5 | FR-12, FR-18 |
| S-17 | Organizer confirms whether the team went | P1 | 5 | FR-23, FR-27 |
| S-18 | Break a tie at close by the least recently visited venue | P1 | 5 | FR-14, FR-11 |
| S-19 | Organizer chooses among venues still tied at close | P1 | 5 | FR-22, FR-14, FR-12 |
| S-20 | Leading venue with the tie-break while the outing is open | P2 | 5 | FR-25, FR-09 |
| S-21 | History page of closed outings | P1 | 5 | FR-15, FR-26, FR-29 |
| S-22 | Visit counts on the Venues page | P2 | 4 | FR-16, FR-03 |
| S-23 | Home page lists open outings only | P1 | 4 | FR-29, FR-17 |
| S-24 | Refuse an outing whose close time has already passed | P2 | 4 | FR-28, FR-04, NFR-06 |
| S-25 | Close old M1 outings with the M2 rules at release | P1 | 5 | FR-24 |

Suggested delivery order: S-13, S-14, S-15, S-16, S-17, S-18, S-19, S-21, S-23, S-25, S-20, S-22, S-24.
S-25 should be done before M2 goes to production, so that old M1 outings are closed at release.

## How users reach each M2 screen
| Screen | Way in | Provided by |
|---|---|---|
| Closed outing page (winner) | Outing link; History line; redirect after early close | S-14, S-16, S-21 |
| Cancelled outing page | Outing link; History line; after early close | S-15, S-16, S-21 |
| Waiting for the organizer's choice | Outing link; History line | S-19, S-21 |
| "Close now" button | On the open outing page, organizer's browser only | S-16 |
| Visit question "Đã đi <venue> chưa?" | On the closed outing page, organizer's browser, from the sitting time | S-17 |
| History (Lịch sử) page | "Lịch sử" link on the home page | S-21 |
| Visit counts | M1 Venues page ("Venues" link on the home page) | S-22 (S-04) |
| Open outing page, home page, Create outing | Unchanged from M1 | S-20, S-23, S-24 (S-06, S-11) |

## M2 FR → Story traceability
| FR | Stories |
|---|---|
| FR-11 | S-13 (close, no changes, final), S-18 (result order at close) |
| FR-12 | S-16 (early close), S-19 (choice among tied venues), S-17 (visit confirmation, organizer-only) |
| FR-13 | S-15 |
| FR-14 | S-18 (tie-break, no votes = all tied), S-19 (remaining ties) |
| FR-15 | S-21 |
| FR-16 | S-22 |
| FR-22 | S-19 |
| FR-23 | S-17 |
| FR-24 | S-25 |
| FR-25 | S-20 |
| FR-26 | S-15 (cancelled page), S-21 (history entry) |
| FR-27 | S-14, S-17 (organizer's visit question) |
| FR-28 | S-24 |
| FR-29 | S-23 (open outings only), S-21 ("Lịch sử" link on the home page) |

### M2 changes to M1 behaviour
| M1 FR | M2 change | Stories |
|---|---|---|
| FR-03 | Visit count next to each venue | S-22 |
| FR-04 | Extra check: close time already passed (FR-28) | S-24 |
| FR-06, FR-08 | Answers and votes changeable only while open (FR-11) | S-13 |
| FR-09 | Replaced while open by FR-25; after close by FR-27 / FR-22 / FR-26 | S-20, S-14, S-19, S-15 |
| FR-17 | Open outings only, plus History link (FR-29) | S-23, S-21 |
| FR-18 | Organizer-only actions now exist (FR-12) | S-16, S-17, S-19 |
| FR-20 | Replaced by the automatic close (FR-11) | S-13 |

### Business rules and assumptions
| Rule / assumption | Stories |
|---|---|
| BR-04, A-08, A-09 | S-13 |
| BR-05, BR-10, A-12 | S-16, S-17, S-19 |
| BR-06, BR-18, BR-24 | S-15, S-16, S-25 |
| BR-07, BR-21 | S-18 |
| BR-19, A-10, A-13 | S-19 (A-10 also S-17) |
| BR-20 | S-17, S-18, S-22 |
| BR-22 | S-20 |
| BR-23, A-11 | S-25 |
| BR-25 | S-14 |
| BR-26, BR-29, A-14, A-15 | S-21 (BR-26, BR-29 also S-22) |
| BR-27 | S-24 |
| BR-28 | S-23 |

## M2 size self-check
| Story | ACs | ≤ limit? | Split pattern used |
|---|---|---|---|
| S-13 | 5 | yes | happy path first (clear winner; cancel, ties, early close split out) |
| S-14 | 5 | yes | by workflow: result display separated from closing |
| S-15 | 5 | yes | by business rule (BR-18, BR-24) |
| S-16 | 5 | yes | by user role (organizer action) |
| S-17 | 5 | yes | by workflow: after-the-outing step |
| S-18 | 5 | yes | by business rule (BR-07, BR-21) |
| S-19 | 5 | yes | by business rule (BR-19, remaining ties) |
| S-20 | 5 | yes | by business rule (BR-22, live display) |
| S-21 | 5 | yes | new screen, read-only list (visit counts split to S-22) |
| S-22 | 4 | yes | by data type (per-venue counts) |
| S-23 | 4 | yes | by business rule (BR-28) |
| S-24 | 4 | yes | by business rule (BR-27) |
| S-25 | 5 | yes | by data type (old M1 outings, one-off at release) |
