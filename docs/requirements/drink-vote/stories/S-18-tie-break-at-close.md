# S-18: Break a tie at close by the least recently visited venue

- **Priority:** P1
- **Covers:** FR-14, FR-11 (result order) · **Decisions:** Q-17, Q-18, Q-28
- **Depends on stories:** S-13, S-17

## User story
As a team member, I want a tied vote to go to the venue we have not been to for the longest time, so that we get variety without arguing.

## Acceptance criteria
1. **Never visited beats visited**
   - Given at close "Quán A" and "Quán B" share the highest vote count, "Quán A" was last visited on 01/10 and "Quán B" was never visited
   - When the outing closes with at least `MIN_PEOPLE` Going
   - Then "Quán B" is the winning venue
2. **Oldest last visit wins**
   - Given at close "Quán A" (last visited 01/09) and "Quán B" (last visited 01/10) share the highest vote count
   - When the outing closes
   - Then "Quán A" is the winning venue
3. **Only "Đã đi" counts as a visit**
   - Given "Quán A" won an earlier outing that the organizer marked "Không đi" or never answered, and "Quán B" was visited ("Đã đi") on 01/10
   - When the two tie at close
   - Then "Quán A" ranks as never visited and wins
4. **No votes means all venues are tied**
   - Given at least `MIN_PEOPLE` people are Going and nobody voted, with included venues "Quán A" (last visited 01/10), "Quán B" (last visited 01/09) and "Quán C" (last visited 15/09)
   - When the outing closes
   - Then all included venues are treated as tied and "Quán B" is the winning venue
5. **Only the tied venues compete**
   - Given "Quán A" has 3 votes, "Quán B" and "Quán C" have 1 vote each, and "Quán A" was visited most recently
   - When the outing closes
   - Then "Quán A" wins; the tie-break is not used

## Out of scope
- Several venues still tied after the tie-break (for example two never-visited venues): S-19.
- The tie-break on the open outing page: S-20.

## Notes
- BR-07, BR-20, BR-21. The "last visited" date is the date of the latest outing the venue won and the organizer confirmed with "Đã đi" (S-17).
- Cancellation (S-15) is decided first; the tie-break applies only to outings with at least `MIN_PEOPLE` Going.
- No new screen: the winner is shown on the closed page (S-14).
