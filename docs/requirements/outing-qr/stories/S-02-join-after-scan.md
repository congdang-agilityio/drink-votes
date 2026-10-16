# S-02: Join and vote after scanning the QR code

- **Priority:** P1
- **Covers:** FR-02, FR-03, FR-04 · **Decisions:** Q-01
- **Depends on stories:** S-01

## User story
As a member who scans an outing's QR code, I want to land on the normal outing page and answer and vote as usual, so that scanning is a quick way in that does not change how the outing works.

## Acceptance criteria
1. **Scanning answers nothing**
   - Given a member who already has a display name and has not answered an open outing
   - When they scan the outing's QR code and the outing page opens
   - Then they are not marked "Đi" (Going) or "Không đi" (Not going), no vote is recorded for them, and the page is not jumped to a particular part
2. **Going and voting as today**
   - Given a member who opened an open outing by scanning its QR code
   - When they tap "Đi" (Going) and then choose one venue
   - Then they are counted as Going and their single vote is recorded, exactly as when they open the outing from the chat link
3. **First-time scanner gives a name first**
   - Given a person who has never used the app on their phone
   - When they scan an open outing's QR code
   - Then they are first asked for their display name, and after giving it they land on that outing's page without scanning again

## Out of scope
- Showing the code: S-01. Behaviour on closed, waiting and cancelled outings: S-03.
- Any change to the voting, closing or identity rules of Drink Votes (A-03, Q-01).

## Notes
- No new screen: the scanner reaches the existing outing page (S-01) and, the first time, the existing name prompt (Drink Votes S-03).
- BR-02. The current app may already behave this way (`identity.ts` returns a person to the page they asked for, A-02); this story makes the scanning path an explicit, verified criterion.
