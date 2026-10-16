# S-01: QR code on an open outing's page

- **Priority:** P0
- **Covers:** FR-01, FR-02, FR-05, FR-06, FR-08, FR-09, NFR-01, NFR-02, NFR-03, NFR-04, NFR-05 · **Decisions:** Q-01, Q-02, Q-03, Q-05, Q-06, Q-07
- **Depends on stories:** none

## User story
As anyone viewing an open outing (kèo), I want the outing page to show the outing's QR code, so that colleagues next to me can scan it with their phone and open the outing without searching the chat for the link.

## Acceptance criteria
1. **Code below the outing details**
   - Given an open outing
   - When anyone opens the outing page, on a laptop or on a phone-width screen
   - Then a QR code is shown below the outing details, without pressing any button, and the Going / Not going and vote part is still usable on the phone screen
2. **Visible to everyone, not only the organizer**
   - Given an open outing created in another browser
   - When a member who is not the organizer (chủ kèo) opens the outing page
   - Then the same QR code is shown to them as to the organizer
3. **Scanning opens this outing**
   - Given the QR code shown on an open outing's page in an environment (staging or production)
   - When a person scans it with the built-in camera of a common iPhone or Android phone, from a phone or laptop screen held at arm's length
   - Then the phone opens that outing's page at the same link that is pasted into chat, in that same environment
4. **One code per outing, stable**
   - Given two open outings A and B
   - When their pages are opened, and outing A's page is opened again later
   - Then outing A's code leads to outing A and outing B's code leads to outing B, and outing A's code is the same each time it is shown
5. **Only the code itself**
   - Given an open outing's page showing the QR code
   - When the person looks at the area around the code
   - Then there is no caption, no outing link as text, no "Sao chép link" (Copy link) button and no download or save button for the code

## Out of scope
- What the scanner can do after the page opens (name prompt, Going, vote): S-02.
- Hiding the code on closed, waiting and cancelled outings: S-03.
- The code on the home page list or any other page, a "show QR" button, a full-screen code or a separate QR page (Q-03, Q-06).

## Notes
- No new screen: the code is part of the existing outing page. Users reach the outing page as today: its link from chat, the home page list, or the redirect after creating an outing (Drink Votes S-06, S-11).
- BR-01, BR-03, BR-05. The code encodes the outing's existing link (A-01); it gives no extra rights (NFR-04, BR-02).
- R-03: the code must stay scannable with the warm beer theme colours; QA checks on real phones.
- R-02: whether the code is produced inside the app or by an outside service is the Team Lead's choice; the stakeholder has not asked for any third party.
