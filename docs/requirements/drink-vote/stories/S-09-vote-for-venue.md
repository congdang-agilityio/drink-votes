# S-09: Vote for a venue

- **Priority:** P0
- **Covers:** FR-07, FR-08, FR-09 · **Decisions:** Q-01, Q-08, Q-09, BR-01, BR-02, BR-11
- **Depends on stories:** S-08

## User story
As a member who is going, I want to vote for one venue and change my vote, so that the group picks
a place everyone can live with.

## Acceptance criteria
1. **Going person votes**
   - Given "Lan" is Going on an outing with venues A and B
   - When she votes for A
   - Then the page shows her vote for A and A's vote count increases by 1
2. **Only Going people can vote**
   - Given a person who said Not going or has not answered
   - When they open the outing page or try to vote
   - Then they cannot vote and no vote is counted for them
3. **One vote, changeable at any time**
   - Given "Lan" voted for A
   - When she votes for B
   - Then A's count decreases by 1, B's count increases by 1, and she still has exactly one vote
4. **Votes are anonymous**
   - Given several people have voted
   - When anyone opens the outing page
   - Then the vote count of every venue in the outing is shown, and no page shows who voted for which venue
5. **Not going removes the vote**
   - Given "Lan" is Going and voted for A
   - When she switches to Not going, and later back to Going
   - Then A's count decreases by 1 when she switches to Not going, and after switching back she has no vote until she votes again

## Out of scope
- Showing the leading venue(s) and the "Chưa có phiếu" message (S-10).
- Tie-break between tied venues (M2, FR-14).

## Notes
- Votes stay changeable after the close time; outings never close in M1 (Q-01).
