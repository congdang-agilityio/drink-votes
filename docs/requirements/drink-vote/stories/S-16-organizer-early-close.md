# S-16: Organizer closes the outing early

- **Priority:** P1
- **Covers:** FR-12, FR-18 (M2 organizer actions) · **Decisions:** Q-02, Q-16, Q-25; assumptions A-09, A-12
- **Depends on stories:** S-13, S-15

## User story
As an organizer, I want to close the outing before its close time, so that I can book a table as soon as the team has decided.

## Acceptance criteria
1. **Only the organizer sees the button**
   - Given an open outing created from browser X
   - When it is opened from browser X, and separately from another browser Y
   - Then browser X sees a "Close now" button (shown in Vietnamese) and browser Y does not
2. **Early close with enough people**
   - Given an open outing with 3 people Going and one venue with the most votes
   - When the organizer clicks "Close now" before the close time
   - Then the outing is closed with that venue as the winner, and the organizer lands on the closed outing page (S-14)
3. **Early close below the threshold cancels**
   - Given an open outing with 2 people Going
   - When the organizer clicks "Close now"
   - Then the outing is cancelled and shows the cancelled page (S-15)
4. **Others cannot close it**
   - Given an open outing created from browser X
   - When a close request is sent from browser Y (or from browser X after its browser data was cleared)
   - Then the request is refused and the outing stays open
5. **Organizer does not need to be Going**
   - Given the organizer answered Not going, or did not answer
   - When they click "Close now"
   - Then the outing closes the same way

## Out of scope
- Recovering organizer actions on another device or after clearing browser data (Q-25, out of M2).
- Tied results at close: S-18, S-19.

## Notes
- BR-05, BR-10, BR-18. The "Close now" button is on the open outing page; there is no other way in.
- After an early close, the automatic close at the close time does nothing more (closing is final, A-09).
