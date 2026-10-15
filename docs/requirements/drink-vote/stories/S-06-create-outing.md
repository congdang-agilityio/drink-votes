# S-06: Create an outing and get its link

- **Priority:** P0
- **Covers:** FR-04, FR-05, FR-18, FR-20, NFR-05, NFR-06 · **Decisions:** Q-01, Q-02, Q-14, BR-03, BR-10
- **Depends on stories:** S-03, S-04

## User story
As an organizer, I want to create an outing with a date, times and the venues to vote on, so that
I can paste its link into the team chat.

## Acceptance criteria
1. **Way in and defaults**
   - Given the home page
   - When the user follows the "Create outing" link (in Vietnamese)
   - Then a form is shown with a date, a sitting time prefilled with 18:30, a close time prefilled with 16:00 (`DEFAULT_CLOSE_AT`), and all venues to choose from
2. **Outing created**
   - Given the form with a date of today or later, sitting time 18:30, close time 16:00 and two venues chosen
   - When the user submits it
   - Then the outing is created and the user is taken to its outing page, which shows the date (day/month/year), sitting time, close time (24-hour) and the chosen venues
3. **Own link**
   - Given an outing page
   - When the user copies its address and someone opens it in another browser
   - Then that person sees the same outing (after giving a name if it is their first visit)
4. **Organizer recorded**
   - Given browser A created an outing
   - When the outing is stored
   - Then it records browser A as its organizer (verifiable by test; no organizer-only action exists in M1)
5. **Close time has no effect**
   - Given an outing whose close time has passed
   - When anyone opens the outing page
   - Then the page still shows the close time and the outing is not shown as closed

## Out of scope
- Refusing invalid outings (S-07).
- Going / Not going and votes (S-08, S-09); the outing in the home list (S-11).
- Editing an outing (out of M1, Q-14); any closing (M2, FR-11, FR-12).

## Notes
- Dates and times are in Vietnam time, `Asia/Ho_Chi_Minh` (NFR-06).
- The organizer is not automatically Going (BR-14, checked in S-08).
- Several outings may exist at the same time (Q-04).
