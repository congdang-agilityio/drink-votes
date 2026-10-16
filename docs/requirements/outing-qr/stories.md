# Stories: Outing QR code (mã QR của kèo)

- Slug: `outing-qr` · PRD: `prd.md` · Requirements signed off 2026-10-16 by Cong Dang
- Scope: FR-01..FR-09, NFR-01..NFR-05 (all in scope)
- AC limit (`limits.story_max_ac`): 5

## Stories
| ID | Title | Priority | ACs | Covers |
|---|---|---|---|---|
| S-01 | QR code on an open outing's page | P0 | 5 | FR-01, FR-02, FR-05, FR-06, FR-08, FR-09, NFR-01, NFR-02, NFR-03, NFR-04, NFR-05 |
| S-02 | Join and vote after scanning the QR code | P1 | 3 | FR-02, FR-03, FR-04 |
| S-03 | No QR code once an outing is no longer open | P1 | 5 | FR-07 |

Suggested delivery order: S-01, S-02, S-03 (S-02 and S-03 both depend only on S-01).

## How users reach each screen
| Screen | Way in | Provided by |
|---|---|---|
| QR code (part of the open outing page, no new screen) | The existing outing page: chat link, home page list, redirect after creating an outing | Drink Votes S-06, S-11; shown by S-01 |
| Outing page after scanning | Scanning the QR code | S-01 (AC 3), S-02 |
| Name prompt for a first-time scanner | Shown automatically, then back to the outing | Drink Votes S-03; verified by S-02 (AC 3) |

## FR → Story traceability
| FR | Stories |
|---|---|
| FR-01 | S-01 |
| FR-02 | S-01, S-02 |
| FR-03 | S-02 |
| FR-04 | S-02 |
| FR-05 | S-01 |
| FR-06 | S-01 |
| FR-07 | S-03 |
| FR-08 | S-01 |
| FR-09 | S-01 |
| NFR-01 | S-01 |
| NFR-02 | S-01 |
| NFR-03 | S-01 |
| NFR-04 | S-01 |
| NFR-05 | S-01 |

## Size self-check
| Story | ACs | ≤ limit? | Split pattern used |
|---|---|---|---|
| S-01 | 5 | yes | happy path first (show the code on open outings) |
| S-02 | 3 | yes | by workflow (what happens after the scan, incl. first-time visitor) |
| S-03 | 5 | yes | by business rule (open outings only, Q-04) |
