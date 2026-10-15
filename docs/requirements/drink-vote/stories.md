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
| FR-11 | Not covered: M2, deferred to a later M2 epic |
| FR-12 | Not covered: M2, deferred to a later M2 epic |
| FR-13 | Not covered: M2, deferred to a later M2 epic |
| FR-14 | Not covered: M2, deferred to a later M2 epic |
| FR-15 | Not covered: M2, deferred to a later M2 epic |
| FR-16 | Not covered: M2, deferred to a later M2 epic |

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
