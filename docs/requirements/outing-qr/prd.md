# PRD: Outing QR code (mã QR của kèo)

- Slug: `outing-qr` · Analysis: `requirements.md` (signed off 2026-10-16 by Cong Dang) · Version: 1
- Epic title: Outing QR code to join and vote

## 1. Summary
Drink Votes outings (kèo) are shared today by pasting their link into the team chat. This
feature shows a QR code on every open outing's page, so that anyone who has the page on screen
can let colleagues nearby scan it with their phone camera and land on the outing to say Going
and vote, without hunting for the link in chat (SRC-1). The QR code is only a new way in: the
voting rules do not change (Q-01).

## 2. Goals and success metrics
| Goal | Metric | Target |
|---|---|---|
| Members join an outing by scanning instead of searching chat | A member scanning the code with a phone's built-in camera reaches the outing's normal page | Works on common iPhone and Android phones, from a phone or laptop screen at arm's length (NFR-01), checked by QA on real phones |
| No change to the voting flow | Scanning marks nobody Going and casts no vote | Always (FR-04, BR-02) |
| The code appears only where voting is possible | QR code shown on open outings, absent on closed, waiting and cancelled ones | Always (FR-07, BR-04) |

## 3. Users
- **QR presenter:** anyone who has an open outing's page on screen, not only the organizer (chủ kèo) (Q-02).
- **Member (thành viên):** a team member who scans the code with their phone to open the outing and vote.

## 4. Scope
- **In this release:**
  - FR-01: a QR code per outing, encoding the outing's existing link.
  - FR-02: scanning opens the outing's normal page, like the chat link.
  - FR-03: a first-time scanner is asked for a name, then lands on the outing.
  - FR-04: voting after scanning follows the existing rules; scanning answers nothing.
  - FR-05: the code is shown to anyone who opens the outing.
  - FR-06: always visible on the outing page, below the outing details; nowhere else.
  - FR-07: shown only while the outing is open.
  - FR-08: only the code itself; no caption, link text or copy button.
  - FR-09: on screen only; no download.
  - NFR-01..NFR-05: scannable with a phone camera, no new labels / phone layout, environment's own address, no extra protection, server-rendered HTML.
- **Out / later:**
  - Jumping to the vote part or auto-marking "Đi" (Going) on scan (Q-01).
  - Organizer-only QR (Q-02).
  - "Show QR" button, full-screen code or a separate QR page (Q-03).
  - QR on closed, waiting or cancelled outings (Q-04).
  - Download / save as image (Q-05).
  - QR on the home page list or any other page (Q-06).
  - Caption, link text or "Sao chép link" (Copy link) button next to the code (Q-07).
  - QR codes for anything other than an outing; printing layouts, posters, Slack/email; an in-app scanner; any change to Drink Votes voting, closing, tie-break or identity rules (requirements.md §5, by default).

## 5. Requirements
| ID | Summary | Decided by |
|---|---|---|
| FR-01 | One QR code per outing, encoding the outing's existing link | SRC-1; A-01 (accepted at GATE 1) |
| FR-02 | Scanning opens the outing's normal page, no jump, no automatic answer | Q-01 |
| FR-03 | First-time scanner: name prompt, then the outing without scanning again | A-02 (accepted at GATE 1) |
| FR-04 | Voting after scanning unchanged; scanning never marks anyone Going | Q-01 |
| FR-05 | Shown to anyone who opens the outing page | Q-02 |
| FR-06 | Always visible on the outing page below the outing details; reachable only there | Q-03, Q-06 |
| FR-07 | Shown only while the outing is open | Q-04 |
| FR-08 | Only the QR code: no caption, link text or copy button | Q-07 |
| FR-09 | On screen only, no download button | Q-05 |
| NFR-01 | Scannable with a common phone's built-in camera at arm's length | A-04 (accepted at GATE 1) |
| NFR-02 | No new labels; the page stays usable on a phone screen | Q-07; DV NFR-08, NFR-09 |
| NFR-03 | The code points to the environment it was generated in | A-05 (accepted at GATE 1) |
| NFR-04 | No extra protection beyond today's link | A-06 (accepted at GATE 1) |
| NFR-05 | Server-rendered HTML like the rest of the app | DV NFR-01 |

## 6. Key decisions
| Question | Decision |
|---|---|
| Q-01 | A: scanning opens the normal outing page; the member taps "Đi" (Going) and votes as today |
| Q-02 | A: anyone who opens the outing can show the code |
| Q-03 | A: always visible on the outing page, below the outing details |
| Q-04 | A: only open outings |
| Q-05 | A: no download; on screen is enough (screenshots remain possible) |
| Q-06 | A: only from the outing page |
| Q-07 | A: only the QR code, nothing else |

## 7. Assumptions, deferred items and risks
- Remaining assumptions (each accepted at GATE 1): A-01 (code = existing outing link, never changes), A-02 (first-time scanner name prompt then back to the outing), A-04 (phone's built-in camera), A-05 (environment's own address), A-06 (code is not secret), A-07 (an earlier screenshot still opens the outing in its current state).
- Deferred: none.
- Risks: R-01 (anyone who sees the code can join and vote, accepted as with the link), R-02 (library vs external service: Team Lead's choice; an external service would send outing links to a third party), R-03 (size and contrast in the warm beer theme must scan reliably; QA on real phones), R-04 (an always-visible code makes the page longer on a phone; keep the existing order of the answer and vote part).

## 8. Story map
1. S-01: QR code on an open outing's page
2. S-02: Join and vote after scanning the QR code
3. S-03: No QR code once an outing is no longer open
