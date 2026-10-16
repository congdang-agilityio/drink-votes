# S-21: History page of closed outings

- **Priority:** P1
- **Covers:** FR-15, FR-26 (history entry), FR-29 (History link) · **Decisions:** Q-19, Q-26, Q-30, Q-36; assumptions A-14, A-15
- **Depends on stories:** S-13, S-15, S-17

## User story
As a team member, I want a page listing past outings and their results, so that I can see where we went and get back to a closed outing.

## Acceptance criteria
1. **Reached from the home page, newest first**
   - Given closed outings dated 10/10, 15/10 and 12/10
   - When a user clicks the "Lịch sử" (History) link on the home page
   - Then the History page lists them in the order 15/10, 12/10, 10/10, and open outings are not listed
2. **Line for an outing with a winner**
   - Given a closed outing dated 15/10 won by "Quán A" with 4 people Going
   - When the History page is shown
   - Then its line shows 15/10, "Quán A", 4 people and the mark "Đã đi", "Chưa xác nhận" or "Không đi" according to the organizer's answer (no answer = "Chưa xác nhận")
3. **Line for an outing waiting for the organizer's choice**
   - Given a closed outing still waiting for the organizer to choose among tied venues
   - When the History page is shown
   - Then its line shows the date, "chưa chọn quán", the number of people and the mark "Chưa xác nhận"
4. **Line for a cancelled outing**
   - Given a cancelled outing with 2 people Going at close
   - When the History page is shown
   - Then its line shows the date, is marked as cancelled (shown in Vietnamese) and shows the final headcount 2
5. **Each line opens the outing**
   - Given any line on the History page
   - When the user clicks it
   - Then that outing's page opens

## Out of scope
- Visit counts next to venues: S-22. Removing closed outings from the home list: S-23.

## Notes
- BR-26, BR-29. M1 outings closed at M2 release appear here too (S-25).
- With no closed outings yet, the page simply shows an empty list; the exact wording, if any, is a UI detail.
- The History page is also how the organizer gets back to an outing to choose among tied venues (S-19) or confirm the visit (S-17) without the original link (A-15).
