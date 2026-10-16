# S-03: No QR code once an outing is no longer open

- **Priority:** P1
- **Covers:** FR-07 · **Decisions:** Q-04, Q-05
- **Depends on stories:** S-01

## User story
As a member, I want the QR code to disappear once an outing can no longer be voted on, so that nobody is invited to scan into an outing where voting is over.

## Acceptance criteria
1. **Closed with a winner**
   - Given an outing that has closed with a winning venue
   - When anyone opens its page
   - Then no QR code is shown
2. **Waiting for the organizer's choice**
   - Given an outing that is waiting for the organizer to choose between tied venues
   - When anyone, including the organizer, opens its page
   - Then no QR code is shown
3. **Cancelled**
   - Given an outing that was cancelled
   - When anyone opens its page
   - Then no QR code is shown
4. **Code disappears when the outing closes**
   - Given an open outing whose page showed the QR code
   - When the outing closes (at its close time or by the organizer's early close) and the page is opened or reloaded
   - Then the page shows the outing's new state without the QR code
5. **Earlier screenshot of the code**
   - Given a screenshot of an outing's QR code taken while it was open, and the outing has since closed, is waiting or was cancelled
   - When a member scans the screenshot
   - Then the outing's page opens in its current state, without the QR code and without Going / Not going or vote buttons

## Out of scope
- Showing the code on open outings: S-01.
- Any change to how outings close, wait or get cancelled (Drink Votes FR-22, FR-26, FR-27).

## Notes
- BR-04, A-07. No new screen: these are the existing closed, waiting and cancelled outing pages (Drink Votes S-14, S-15, S-19).
