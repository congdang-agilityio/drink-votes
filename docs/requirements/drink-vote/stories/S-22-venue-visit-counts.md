# S-22: Visit counts on the Venues page

- **Priority:** P2
- **Covers:** FR-16, FR-03 (M2 change) · **Decisions:** Q-18, Q-30, Q-35, Q-36
- **Depends on stories:** S-04 (M1), S-17

## User story
As a team member, I want to see how many times we have been to each venue, so that I can suggest places we have not tried much.

## Acceptance criteria
1. **Count next to each venue**
   - Given "Quán A" was visited twice and "Quán B" never
   - When a user opens the Venues page
   - Then "Quán A" shows 2 and "Quán B" shows 0
2. **Only "Đã đi" counts**
   - Given "Quán A" won one outing marked "Đã đi", one marked "Không đi" and one not yet confirmed ("Chưa xác nhận")
   - When a user opens the Venues page
   - Then "Quán A" shows 1
3. **Cancelled and waiting outings do not count**
   - Given a cancelled outing and an outing waiting for the organizer's choice that included "Quán B"
   - When a user opens the Venues page
   - Then "Quán B" still shows 0
4. **Count updates after confirmation**
   - Given "Quán B" shows 0 and won a closed outing
   - When the organizer answers "Đã đi" for that outing and the Venues page is opened again
   - Then "Quán B" shows 1

## Out of scope
- Showing last visit dates on the Venues page (not requested).

## Notes
- BR-20, BR-26, BR-29. No new screen: the M1 Venues page, reached by the "Venues" link on the home page (S-04).
