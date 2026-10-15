# S-10: Show the leading venue(s)

- **Priority:** P1
- **Covers:** FR-09 · **Decisions:** Q-06, Q-22, BR-08
- **Depends on stories:** S-09

## User story
As an organizer, I want the outing page to show which venue is leading, so that I can book a table
at the right place without counting votes myself.

## Acceptance criteria
1. **One leader**
   - Given venue A has 3 votes and venue B has 1
   - When anyone opens the outing page
   - Then A is shown as the leading venue
2. **Tie shows all leaders**
   - Given venues A and B have 2 votes each and venue C has 1
   - When anyone opens the outing page
   - Then both A and B are shown as leading and C is not
3. **No votes yet**
   - Given an outing with no votes
   - When anyone opens the outing page
   - Then no venue is shown as leading and the message "Chưa có phiếu" (No votes yet) is shown
4. **Leader follows the votes**
   - Given A is leading with 1 vote and B has 0
   - When the only voter for A switches to Not going
   - Then the page shows no leader and "Chưa có phiếu" again

## Out of scope
- Breaking ties by least recently visited venue (M2, FR-14).
- A final winner at the close time (M2, FR-11).
