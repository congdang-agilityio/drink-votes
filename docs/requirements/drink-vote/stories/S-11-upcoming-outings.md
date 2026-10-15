# S-11: Upcoming outings on the home page

- **Priority:** P1
- **Covers:** FR-17, NFR-06 · **Decisions:** Q-04, Q-21, BR-13
- **Depends on stories:** S-06, S-08

## User story
As a member, I want the home page to list upcoming outings, so that I can find an outing even if
I lost the link in the chat.

## Acceptance criteria
1. **Upcoming outings, soonest first**
   - Given today is 15/10/2026 in Vietnam time and outings exist dated 17/10, 15/10 and 16/10/2026
   - When a user opens the home page
   - Then all three are listed in the order 15/10, 16/10, 17/10, each line showing the date, the sitting time and the number of people going
2. **Several outings on the same day**
   - Given two outings dated 16/10/2026 with sitting times 20:00 and 18:30
   - When a user opens the home page
   - Then both are listed, the 18:30 one first
3. **Older outings hidden but reachable**
   - Given an outing dated 14/10/2026 and today is 15/10/2026 in Vietnam time
   - When a user opens the home page
   - Then that outing is not listed, and opening its link still shows its outing page
4. **Open an outing from the list**
   - Given the home page lists an outing
   - When the user taps its line
   - Then that outing's page opens
5. **No upcoming outings**
   - Given no outing is dated today or later
   - When a user opens the home page
   - Then a message (in Vietnamese) says there are no upcoming outings, and the "Create outing" link is still shown

## Out of scope
- History of closed outings (M2, FR-15).

## Notes
- "Today" is the date in `Asia/Ho_Chi_Minh` (NFR-06, BR-13).
- AC 2 reads "soonest first" (Q-21) as date first, then sitting time.
