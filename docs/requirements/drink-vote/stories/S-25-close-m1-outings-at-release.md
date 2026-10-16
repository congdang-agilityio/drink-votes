# S-25: Close old M1 outings with the M2 rules at release

- **Priority:** P1
- **Covers:** FR-24 · **Decisions:** Q-26, Q-16, Q-17, Q-18, Q-28; assumption A-11
- **Depends on stories:** S-13, S-15, S-18, S-19, S-21

## User story
As a team member, I want the outings created before M2 to get a result like any other, so that the history is complete from day one.

## Acceptance criteria
1. **Old outing with too few people is cancelled**
   - Given an M1 outing whose close time had passed before M2 release, with 2 people Going
   - When M2 is released
   - Then the outing is cancelled, shows the cancelled page and is listed in the History page as cancelled
2. **Old outing with a clear winner**
   - Given an M1 outing whose close time had passed, with 3 or more Going and one venue with the most votes
   - When M2 is released
   - Then it is closed with that venue as the winner and listed in the History page with the mark "Chưa xác nhận"
3. **Old outing with a tie goes to the organizer**
   - Given an M1 outing whose close time had passed, with 3 or more Going and a tie (or no votes)
   - When M2 is released
   - Then, since no visit is confirmed yet, all tied venues rank as never visited and the outing waits for the organizer's choice
4. **M1 organizer keeps organizer actions**
   - Given an old outing created from browser X in M1
   - When browser X opens it after release
   - Then browser X can choose among the tied venues (if waiting) and confirm the visit after the sitting time
5. **Outings not yet past their close time stay open**
   - Given an M1 outing whose close time is still ahead at release
   - When M2 is released
   - Then it stays open and closes at its close time like any M2 outing

## Out of scope
- Any change to the answers or votes recorded in M1.

## Notes
- BR-23, A-11. Old outings closed this way leave the home page (S-23) and are reached by their link or the History page (S-21).
