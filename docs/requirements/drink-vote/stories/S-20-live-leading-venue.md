# S-20: Leading venue with the tie-break while the outing is open

- **Priority:** P2
- **Covers:** FR-25, FR-09 (M2 change while open) · **Decisions:** Q-27, Q-32, Q-33, Q-22
- **Depends on stories:** S-10 (M1), S-18

## User story
As a member, I want the open outing to show which venue would win right now, tie-break included, so that I know where we are heading before the close.

## Acceptance criteria
1. **One clear leader**
   - Given an open outing where "Quán A" has the most votes
   - When anyone opens the outing page
   - Then "Quán A" is shown as the leading venue
2. **Tie decided by the tie-break**
   - Given "Quán A" and "Quán B" share the most votes, "Quán A" last visited 01/10 and "Quán B" never visited
   - When anyone opens the outing page
   - Then only "Quán B" is shown as the leading venue
3. **Tie the tie-break cannot decide**
   - Given "Quán A" and "Quán B" share the most votes and both were never visited
   - When anyone opens the outing page
   - Then both are shown as leading with the note that the organizer will choose at close, e.g. "Hoà: Quán A, Quán B – chủ kèo sẽ chọn"
4. **No votes yet**
   - Given an open outing with no votes, even with 3 or more people Going
   - When anyone opens the outing page
   - Then no venue is leading and the page shows "Chưa có phiếu", as in M1
5. **Updates with each vote**
   - Given the page shows "Quán B" leading
   - When a Going person changes their vote so that "Quán A" has the most votes, and the page is opened again
   - Then "Quán A" is shown as leading

## Out of scope
- The result at close: S-13, S-18, S-19.

## Notes
- BR-22 replaces the M1 rule "all tied venues are leading" (BR-08, S-10) from M2. Visits count only with "Đã đi" (BR-20).
- No new screen: the open outing page from M1 (reached by its link or the home page list).
