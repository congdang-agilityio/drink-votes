# S-07: Outing creation checks

- **Priority:** P1
- **Covers:** FR-04, NFR-06 · **Decisions:** Q-10, BR-12
- **Depends on stories:** S-06

## User story
As an organizer, I want the app to stop me creating an outing that cannot work, so that members
never see an outing with nothing to vote on or impossible times.

## Acceptance criteria
1. **At least two venues**
   - Given the create-outing form with only one venue chosen (or none)
   - When the user submits it
   - Then no outing is created and a message (in Vietnamese) says at least 2 venues are needed
2. **No past date**
   - Given today is 15/10/2026 in Vietnam time
   - When the user submits an outing dated 14/10/2026
   - Then no outing is created and a message (in Vietnamese) says the date cannot be in the past
3. **Close time before sitting time**
   - Given a sitting time of 18:30
   - When the user submits a close time of 18:30 or 19:00
   - Then no outing is created and a message (in Vietnamese) says the close time must be before the sitting time
4. **Today is allowed**
   - Given today is 15/10/2026 in Vietnam time
   - When the user submits a valid outing dated 15/10/2026
   - Then the outing is created
5. **"Today" means Vietnam time**
   - Given the server clock reads 14/10/2026 20:00 UTC (15/10/2026 03:00 in Vietnam)
   - When the user submits a valid outing dated 15/10/2026
   - Then the outing is created

## Out of scope
- Editing an outing after creation (out of M1, Q-14).

## Notes
- A close time that has already passed today is allowed (only the three rules of BR-12 apply).
