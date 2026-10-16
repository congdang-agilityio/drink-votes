# S-17: Organizer confirms whether the team went

- **Priority:** P1
- **Covers:** FR-23, FR-27 (organizer view) · **Decisions:** Q-18, Q-25, Q-35; assumptions A-10, A-12
- **Depends on stories:** S-14

## User story
As an organizer, I want to confirm whether the team actually went to the winning venue, so that only real visits count in the tie-break and the visit counts.

## Acceptance criteria
1. **Question appears from the sitting time**
   - Given an outing dated 20/10 with sitting time 18:30, closed with winning venue "Quán A"
   - When the organizer's browser opens the outing page at or after 18:30 on 20/10 (`Asia/Ho_Chi_Minh`)
   - Then it shows "Đã đi Quán A chưa?" with the buttons "Đã đi" and "Không đi"; before 18:30 on 20/10 the question is not shown
2. **Only the organizer sees it**
   - Given the same outing after its sitting time
   - When another browser opens the page, or sends an answer
   - Then that browser sees no question, and its answer is refused
3. **"Đã đi" records a visit**
   - Given the question is shown to the organizer
   - When the organizer clicks "Đã đi"
   - Then "Quán A" counts as visited with 20/10 as the visit date, and the question and buttons are no longer shown
4. **"Không đi" records no visit**
   - Given the question is shown to the organizer
   - When the organizer clicks "Không đi"
   - Then the outing is recorded as not visited, the venue does not count as visited, and the question and buttons are no longer shown
5. **Final, no deadline, only with a winner**
   - Given the organizer answered, or a cancelled outing, or an outing still waiting for the organizer's choice
   - When the organizer opens the page on any later day
   - Then no question is shown for an answered, cancelled or waiting outing, and an unanswered outing with a winner still shows it with no deadline

## Out of scope
- Showing the answer as a mark in the history: S-21. Visit counts on the Venues page: S-22. Using visits in the tie-break: S-18, S-20.

## Notes
- BR-20: an unanswered outing never counts as a visit. The answer cannot be changed (A-10). The organizer does not need to be Going (A-12).
- How the organizer reaches the question: the outing link, or the History page line (S-21), since closed outings leave the home page (A-15).
