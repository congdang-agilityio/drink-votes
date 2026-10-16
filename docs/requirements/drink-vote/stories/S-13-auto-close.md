# S-13: Outing closes automatically at its close time

- **Priority:** P0
- **Covers:** FR-11, FR-06 (M2 change), FR-08 (M2 change), FR-20 (replaced), NFR-06 · **Decisions:** Q-01 (lifted for M2), Q-28, Q-31; assumptions A-08, A-09
- **Depends on stories:** S-08, S-09 (M1)

## User story
As an organizer, I want the outing to close by itself at its close time, so that the headcount and the venue are fixed when I need to book a table.

## Acceptance criteria
1. **Closes at the close time on the outing's date**
   - Given an open outing dated 20/10 with close time 16:00
   - When anyone opens its page at or after 16:00 on 20/10 (`Asia/Ho_Chi_Minh`)
   - Then the page shows the "Closed" label (shown in Vietnamese) and the Going / Not going and vote buttons are no longer shown
2. **Still open before the close time**
   - Given the same outing
   - When someone opens its page at 15:59 on 20/10, or on 19/10 at any time
   - Then the outing is open and people can still answer Going / Not going and change their vote as in M1
3. **No changes after close**
   - Given a closed outing
   - When someone sends a Going / Not going answer or a vote for it (for example from a page opened before the close time)
   - Then the change is refused with a message that the outing is closed (shown in Vietnamese), and the headcount, answers and votes stay as they were at the close time
4. **Winner by most votes**
   - Given an outing with at least `MIN_PEOPLE` (3) people Going and exactly one venue with the highest vote count at the close time
   - When it closes
   - Then that venue is recorded and shown as the winning venue
5. **Closing is final**
   - Given a closed outing
   - When anyone, including the organizer, opens its page
   - Then there is no way to reopen it, and it stays closed

## Out of scope
- Full closed page (address, Maps link, final headcount, Going names, vote counts): S-14.
- Cancellation when fewer than `MIN_PEOPLE` are Going: S-15.
- Early close by the organizer: S-16.
- Tied vote or no votes at close: S-18; venues still tied after the tie-break: S-19.
- M1 outings already past their close time at M2 release: S-25.

## Notes
- From M2, "change at any time" (FR-06, FR-08) means "while the outing is open"; FR-20 ("nothing happens at the close time") no longer applies.
- The close must be in effect for everyone from the close time on, whether or not anyone opens the outing at that moment: the home page (S-23), History (S-21) and Venues counts (S-22) rely on it.
- How users reach the page: unchanged (outing link, home page list while open, History once closed: S-21).
