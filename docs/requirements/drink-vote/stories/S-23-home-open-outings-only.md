# S-23: Home page lists open outings only

- **Priority:** P1
- **Covers:** FR-29, FR-17 (M2 change) · **Decisions:** Q-21, Q-29, Q-30
- **Depends on stories:** S-11 (M1), S-13, S-15, S-21

## User story
As a team member, I want the home page to show only outings I can still answer, so that I do not mistake a finished outing for tonight's.

## Acceptance criteria
1. **Open outings stay, as in M1**
   - Given open outings dated today and later
   - When a user opens the home page
   - Then they are listed soonest first, each line with the date, sitting time and number going
2. **Closed outings leave the list**
   - Given an outing dated today that closed with a winner, and another closed and waiting for the organizer's choice
   - When a user opens the home page
   - Then neither is listed
3. **Cancelled outings leave the list**
   - Given an outing dated today that was cancelled
   - When a user opens the home page
   - Then it is not listed
4. **Still reachable elsewhere**
   - Given an outing that left the home list after closing or cancellation
   - When a user opens its link, or the History page from the home page "Lịch sử" link
   - Then the outing page opens from the link and the outing is listed on the History page

## Out of scope
- The History page itself and its home page link: S-21.

## Notes
- BR-28 replaces BR-13 from M2 for which outings are listed. An outing leaves the list as soon as it closes, including an early close (S-16).
- No new screen: the M1 home page (the app's main address).
