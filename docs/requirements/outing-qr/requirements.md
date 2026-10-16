# Requirement analysis: Outing QR code (mã QR của kèo)
Signed-off: 2026-10-16 by Cong Dang

- Slug: `outing-qr`
- Status: Signed off (2026-10-16)
- Sources: see the table below

## Changelog
| Date | Round | Change |
|---|---|---|
| 2026-10-16 | 1 | Initial analysis of the stakeholder brief, on top of the signed-off Drink Votes M1 + M2 requirements |
| 2026-10-16 | 2 | Applied Q-01..Q-06 (all "A"): scanning opens the normal outing page, voting unchanged (FR-02, FR-04); anyone viewing the outing sees the QR code (FR-05); always visible on the outing page below the outing details, reachable only there (FR-06); open outings only (FR-07, BR-04); no download, on-screen only (FR-09). Resolved G-01..G-05, AMB-01, AMB-02; confirmed A-03; added A-07 (an earlier screenshot of the code opens the outing in its current state). Refined Q-07 (what is shown next to the code) since the outing details are already above it. Remaining open: Q-07 |
| 2026-10-16 | 3 | Applied Q-07 ("A"): only the QR code is shown, with no caption, link text or copy button (FR-08, scope out). Resolved G-06. NFR-02 clarified: the feature adds no new labels. No open questions remain |

## Sources
| ID | File (in `sources/`) | Origin | Retrieved | Notes |
|---|---|---|---|---|
| SRC-1 | `stakeholder-brief.md` | stakeholder-brief | 2026-10-16 | "thêm chức năng sinh QR của một kèo để các thành viên khác quét để vote" (add a feature that generates a QR code for an outing so that other members can scan it to vote) |
| Q-nn | `../questions.md` | stakeholder answers | 2026-10-16 | Confirmed decisions cited as Q-nn |
| DV | `../../drink-vote/requirements.md` | existing signed-off requirements (M1 signed 2026-10-15, M2 re-signed 2026-10-16) | 2026-10-16 | Context only, not re-analyzed; cited as `DV FR-nn` / `DV BR-nn` / `DV NFR-nn` |
| CODE | `src/` (repo) | current implementation | 2026-10-16 | Context only: outing page at `/outings/<id>`; a visitor without a name is sent to the name prompt and then back to the page they asked for (`src/middleware/identity.ts`) |

## 1. Business goal and problem statement
Today an outing (kèo) is shared by pasting its link into the team chat (DV FR-05). The
stakeholder wants the app to generate a QR code for an outing so that other members can scan
it and vote (SRC-1). The likely situation is people physically together (for example in the
office): one person shows the outing page with its QR code on a screen, the others point their
phone camera at it and land on the outing without searching the chat for the link (inferred
from "quét" (scan), SRC-1; see A-01).

Success: a member who scans the outing's QR code with a phone reaches that outing's normal page
and can say Going and vote with the existing rules (DV FR-06, DV FR-07), in a few seconds (Q-01).

## 2. Actors / personas
| Actor | Description | Goals |
|---|---|---|
| QR presenter | Anyone who has the open outing's page on screen and shows it to others; not limited to the organizer (chủ kèo) (Q-02) | Get colleagues into the outing quickly |
| Member (thành viên) | A team member who scans the QR code with their phone (SRC-1 "các thành viên khác quét") | Open the outing, say Going, vote for a venue |

No new identity concept: people are still identified by their browser cookie and a display
name (DV FR-01, DV BR-09, DV NFR-07).

## 3. Functional requirements
| ID | Requirement | Source | Status |
|---|---|---|---|
| FR-01 | The system shall generate a QR code for each outing. The QR code encodes the outing's own link (the same link that is pasted into chat, DV FR-05). | SRC-1; DV FR-05 | provisional (A-01, shown in understanding.md) |
| FR-02 | Scanning an outing's QR code with a phone camera shall open that outing's normal page, exactly as opening the link from chat; there is no jump to a particular part of the page and no automatic answer. | SRC-1 "quét để vote"; Q-01 | confirmed |
| FR-03 | A person who scans the QR code without a display name yet shall first be asked for their name (DV FR-01) and then be taken to the outing, without scanning again. | DV FR-01; CODE `identity.ts` | provisional (A-02, shown in understanding.md) |
| FR-04 | After scanning, voting follows the existing rules unchanged: the member taps "Đi" (Going) first (DV FR-06), one vote per Going person (DV FR-07), changes only while the outing is open (DV FR-11). Scanning never marks anyone Going. | SRC-1 "để vote"; DV FR-06, FR-07, FR-11; Q-01 | confirmed |
| FR-05 | The QR code shall be shown to anyone who opens the outing page, not only to the organizer's browser (DV FR-18); it is not an organizer-only action. | SRC-1; Q-02 | confirmed |
| FR-06 | The QR code shall always be visible on the outing page, below the outing details (no button to reveal it and no separate QR page). It is reachable only from the outing page: not from the home page list or any other page. After creating an outing the organizer already lands on its page, where the code is shown. | SRC-1; Q-03; Q-06 | confirmed |
| FR-07 | The QR code shall be shown only while the outing is open (people can still answer and vote). The pages of closed outings (with a winner, DV FR-27), outings waiting for the organizer's choice (DV FR-22) and cancelled outings (DV FR-26) shall not show it. | SRC-1 "để vote"; Q-04; DV FR-11, FR-22, FR-26, FR-27 | confirmed |
| FR-08 | The outing page shall show only the QR code itself in that place: no caption, no outing link as text and no "Sao chép link" (Copy link) button next to it. | SRC-1; Q-07 | confirmed |
| FR-09 | The QR code is shown on screen only; there is no button to download or save it as an image. People may still take a screenshot themselves. | SRC-1; Q-05 | confirmed |

## 4. Non-functional requirements
| ID | Category | Requirement | Source |
|---|---|---|---|
| NFR-01 | Usability | The QR code shall be scannable with the built-in camera of a common phone (iPhone, Android) without installing an app, from a phone or laptop screen at normal arm's length. | SRC-1 "quét"; A-04 |
| NFR-02 | i18n / Usability | The feature adds no visible labels next to the code (Q-07); any text it does add (if one turns out to be needed) is in Vietnamese only. The outing page with the QR code stays usable on a phone screen, as for every page of the app. | DV NFR-08, DV NFR-09; Q-07 |
| NFR-03 | Platform | The QR code shall point to the address of the environment it was generated in (a QR from staging opens staging, a QR from production opens production). | DV NFR-04; A-05 |
| NFR-04 | Security | No extra protection: anyone holding the QR code can do exactly what anyone holding the outing link can do today (shared open space, no login). | DV NFR-07; A-06 |
| NFR-05 | Platform | Server-rendered HTML like the rest of the app. | DV NFR-01 |

## 5. Scope
- **In:** FR-01..FR-09, NFR-01..NFR-05.
- **Out (decided):**
  - Changing the voting flow on scan: no jump to the vote part and no automatic "Đi" (Q-01).
  - Restricting the QR code to the organizer (Q-02).
  - A "show QR" button, a full-screen code or a separate QR page (Q-03).
  - The QR code on closed, waiting and cancelled outings (Q-04).
  - Downloading or saving the QR code as an image (Q-05).
  - The QR code on the home page list or any page other than the outing page (Q-06).
  - A caption, the link as text, or a "Sao chép link" (Copy link) button next to the QR code (Q-07).
- **Out (by default, unless the stakeholder says otherwise):**
  - Any change to the voting, closing, tie-break or identity rules of Drink Votes (DV FR-06..FR-29): the QR is only a new way in (A-03, Q-01).
  - QR codes for anything other than an outing (e.g. the Venues page or the app home page): the brief says "của một kèo" (of an outing) (SRC-1).
  - Printing layouts, posters, or sending the QR by Slack/email (DV scope out: notifications).
  - Scanning inside the app (an in-app camera scanner): members use their phone's own camera (A-04).

## 6. Business rules and data entities
- BR-01: An outing's QR code leads to that outing and only that outing; each outing has its own code (SRC-1 "QR của một kèo"; A-01).
- BR-02: Scanning a QR code gives no extra rights and does not answer for the member: a scanner is a normal member and follows the existing rules (DV BR-01, DV BR-09, DV BR-10; Q-01; A-06).
- BR-03: An outing's QR code never changes, because the outing's link never changes (DV FR-05; A-01).
- BR-04: The QR code is visible to everyone on the outing page while the outing is open, and to nobody once it is closed, waiting for the organizer's choice or cancelled (Q-02, Q-03, Q-04).
- BR-05: The QR code is shown on its own, without caption, link text or copy button (Q-07).
- Entities: no new stored data is expected; the QR code is derived from the existing `Outing` (kèo) link (DV §6 Entities). Confirmed by the Team Lead at design time.

## 7. Gaps (missing information)
- G-01: resolved by Q-02 (anyone viewing the outing; FR-05).
- G-02: resolved by Q-03 (always visible on the outing page, below the details; FR-06).
- G-03: resolved by Q-04 (open outings only; FR-07, BR-04).
- G-04: resolved by Q-05 (no download; FR-09).
- G-05: resolved by Q-06 (outing page only; FR-06).
- G-06: resolved by Q-07 (only the QR code, nothing else next to it; FR-08).

## 8. Ambiguities (more than one reading)
- AMB-01: resolved by Q-01, reading (a): scanning opens the normal outing page; the member says Going and votes as today.
- AMB-02: resolved by Q-03 and Q-05, reading (a): the app shows the QR code on screen; no image file to download.

## 9. Conflicts (sources disagree)
- None found.

## 10. Assumptions (provisional until confirmed)
- A-01: The QR code encodes the outing's existing link (DV FR-05), so scanning it is the same as opening the link from chat (consistent with Q-01). One code per outing; it never changes (BR-01, BR-03). Shown in understanding.md.
- A-02: A first-time scanner without a display name sees the existing name prompt (DV FR-01) and is then taken to the outing automatically; the current app already returns the person to the page they asked for (CODE `identity.ts`). Shown in understanding.md.
- A-03: confirmed by Q-01 (the QR code is only a new way in; voting rules unchanged; FR-04).
- A-04: Members scan with their phone's built-in camera; no app to install and no scanner inside Drink Votes (NFR-01). Shown in understanding.md.
- A-05: The QR code uses the address of the environment it was created in (NFR-03). Technical detail for the Team Lead; no question.
- A-06: The QR code is not secret and gives no extra protection, like the link (NFR-04, DV NFR-07). Shown in understanding.md.
- A-07: Because the code is just the outing link (A-01), a screenshot or photo of the code taken while the outing was open still opens the outing page after it closes; that page then shows the closed, waiting or cancelled state as usual, without the QR code and without answer or vote buttons (Q-04, Q-05, DV FR-22, FR-26, FR-27). Shown in understanding.md.

## 11. Risks and external dependencies
- R-01: Anyone who sees or photographs the QR code (e.g. a screen in a shared space) can open the outing and vote, the same as with a forwarded link. Accepted by design in Drink Votes (DV NFR-07, DV R-01); restated here because a QR on a screen is easier to pick up than a link in chat, and with Q-02 = A and Q-03 = A the code is on every open outing page for everyone.
- R-02: Producing the QR code may rely on a library or an external online service; an external service would add a dependency and send outing links to a third party. Choice belongs to the Team Lead.
- R-03: A QR code that is too small or low-contrast (for example in the warm beer theme colours, commit f891239) may not scan reliably on some phones (NFR-01); to be checked by QA on real phones. Since the code is inline on the page (Q-03 = A) rather than full-screen, its size on a phone screen matters more.
- R-04: An always-visible code makes the outing page longer on a phone (Q-03 = A, NFR-02); placing it below the outing details keeps the answer and vote part where it is today only if the Team Lead / UI keeps the existing order. To be checked at story and design time.
