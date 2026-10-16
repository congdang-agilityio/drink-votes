# S-19: Organizer chooses among venues still tied at close

- **Priority:** P1
- **Covers:** FR-22, FR-14 (remaining ties), FR-12 (organizer action) · **Decisions:** Q-17, Q-25, Q-34; assumptions A-10, A-12, A-13
- **Depends on stories:** S-18, S-14

## User story
As an organizer, I want to pick the winner when the vote and the tie-break still leave a tie, so that the outing ends with one venue.

## Acceptance criteria
1. **Waiting page**
   - Given "Quán A" and "Quán B" share the highest vote count at close and both were never visited (or last visited on the same date)
   - When anyone opens the outing page
   - Then it shows "Closed – waiting for the organizer to choose" (shown in Vietnamese), the tied venues "Quán A" and "Quán B", the final headcount, the Going names and the vote count per venue, and no Going / Not going or vote buttons
2. **Only the organizer can choose**
   - Given the waiting outing
   - When the organizer's browser opens the page, and another browser opens it
   - Then the organizer sees a choose button for each tied venue and the other browser sees none; a choice sent from another browser is refused
3. **Choice makes the winner**
   - Given the organizer sees the choose buttons
   - When the organizer chooses "Quán B"
   - Then "Quán B" is the winning venue and the page becomes the closed outing page (S-14)
4. **Choice is final and limited to the tied venues**
   - Given the organizer has chosen, or sends a choice for a venue that was not tied
   - When anyone tries to choose again or the non-tied choice arrives
   - Then it is refused and the result does not change
5. **No deadline**
   - Given the organizer never chooses
   - When the outing is opened days later
   - Then it still shows the waiting page, has no winning venue and has not counted as a visit

## Out of scope
- Any deadline or automatic fallback when the organizer never chooses (Q-34, out of M2).
- Recovery on another device (Q-25, out of M2).

## Notes
- BR-19. The same waiting state applies when nobody voted and the tie-break leaves several venues tied (BR-21).
- How users reach the page: the outing link, or the History page line (S-21) since the outing leaves the home page (S-23, A-15).
