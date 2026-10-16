# Drink Votes M2: Rules of play

Drink Votes M2 "Rules of play" (Luật chơi) gives every outing (kèo) a real end. An outing
closes automatically at its close time on its own date (Vietnam time), or earlier when the
organizer closes it; after that nobody can change answers or votes, and it cannot be reopened.
At close, an outing with fewer than `MIN_PEOPLE` (3) people Going is cancelled ("không đủ
quân"). Otherwise the venue with the most votes wins; a tie (or no votes at all) goes to the
venue not visited for the longest time, and if venues are still tied the organizer chooses.
After the sitting time the organizer confirms whether the team went ("Đã đi" / "Không đi");
only confirmed visits count. A new History (Lịch sử) page lists closed and cancelled outings,
the Venues page shows visit counts, and the home page lists open outings only. M1 outings
already past their close time are closed with these rules at release.

This epic covers milestone M2: FR-11 to FR-16 and FR-22 to FR-29, plus the M2 changes to M1
behaviour (FR-03, FR-04, FR-06, FR-08, FR-09, FR-17, FR-20). Organizer actions work only from
the browser that created the outing, with no recovery; there are no deadlines for the
organizer's choice or visit confirmation. M1 stories (epic #2) are unchanged.

Details: `docs/requirements/drink-vote/prd.md` (M2 section), `requirements.md` (M2 re-signed
2026-10-16 by Cong Dang).

## Stories
| ID | Title | Priority |
|---|---|---|
| S-13 | Outing closes automatically at its close time | P0 |
| S-14 | Closed outing page with the result | P0 |
| S-15 | Cancel an outing when not enough people are going | P0 |
| S-16 | Organizer closes the outing early | P1 |
| S-17 | Organizer confirms whether the team went | P1 |
| S-18 | Break a tie at close by the least recently visited venue | P1 |
| S-19 | Organizer chooses among venues still tied at close | P1 |
| S-20 | Leading venue with the tie-break while the outing is open | P2 |
| S-21 | History page of closed outings | P1 |
| S-22 | Visit counts on the Venues page | P2 |
| S-23 | Home page lists open outings only | P1 |
| S-24 | Refuse an outing whose close time has already passed | P2 |
| S-25 | Close old M1 outings with the M2 rules at release | P1 |
