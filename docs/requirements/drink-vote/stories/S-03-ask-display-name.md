# S-03: Ask for a display name on the first visit

- **Priority:** P0
- **Covers:** FR-01, NFR-07 · **Decisions:** Q-07, BR-09
- **Depends on stories:** S-02

## User story
As a member, I want to type my name once when I first open the app, so that others see who is
coming without me creating an account.

## Acceptance criteria
1. **Asked on the first visit to any page**
   - Given a browser that has no remembered name
   - When the user opens any page (the home page or an outing link)
   - Then the user is asked for a display name before using the page, with no login or account
2. **Back to the page they opened**
   - Given a first-time user opened a specific page (for example an outing link)
   - When they enter the name "Lan" and confirm
   - Then they land on the page they originally opened
3. **Name remembered**
   - Given the user entered "Lan" in this browser
   - When they open the app again later in the same browser
   - Then they are not asked for a name again
4. **Empty name refused**
   - Given the name prompt is shown
   - When the user confirms an empty name or only spaces
   - Then the name is not accepted, a message (in Vietnamese) asks for a name, and the prompt stays
5. **Same name allowed**
   - Given another browser already uses the name "Lan"
   - When a user in a different browser enters "Lan"
   - Then the name is accepted and this browser is treated as a different person

## Out of scope
- Changing the name later (S-12).

## Notes
- Identity is the browser (cookie), not the name (BR-09). Clearing cookies makes the user a new person (R-01, accepted).
- AC 4 is the BA's reading of "ask the user for a display name": a name is needed to list Going people.
