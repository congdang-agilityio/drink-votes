# S-14: Closed outing page with the result

- **Priority:** P0
- **Covers:** FR-27, FR-09 (M2 change after close) · **Decisions:** Q-20, Q-09
- **Depends on stories:** S-13

## User story
As a member, I want a closed outing to show the final result, so that I know where we are going, how many we are, and how to get there.

## Acceptance criteria
1. **Winning venue with its details**
   - Given an outing closed with a winning venue that has an address and a Google Maps link
   - When anyone opens the outing page
   - Then the page shows the "Closed" label (shown in Vietnamese), the winning venue's name, its address and its Google Maps link
2. **Venue without a Maps link**
   - Given the winning venue has no Google Maps link
   - When anyone opens the outing page
   - Then the page shows the venue's name and address and no Maps link
3. **Final headcount and Going names**
   - Given 4 people were Going at the close time
   - When anyone opens the outing page
   - Then it shows the headcount 4 and the current display names of those 4 people; people who said Not going or never answered are not listed
4. **Final vote count per venue, anonymous**
   - Given the outing had votes at the close time
   - When anyone opens the outing page
   - Then it shows the vote count of every included venue as at the close time, without showing who voted for which venue
5. **No answer or vote buttons**
   - Given a closed outing with a winning venue
   - When anyone opens the outing page
   - Then no Going / Not going or vote buttons are shown

## Out of scope
- The organizer's visit question "Đã đi <venue> chưa?": S-17.
- Cancelled outing page: S-15. Page while waiting for the organizer's choice: S-19.

## Notes
- BR-25. The closed page replaces the M1 live display (FR-09) once the outing has a winner.
- How users reach the page: its own outing link, the History page line (S-21), or the redirect after an early close (S-16).
