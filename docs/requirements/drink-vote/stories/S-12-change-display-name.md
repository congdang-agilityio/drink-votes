# S-12: Change my display name

- **Priority:** P1
- **Covers:** FR-19 · **Decisions:** Q-07, Q-24, BR-17
- **Depends on stories:** S-03, S-08

## User story
As a member, I want to change my display name later, so that others recognise me if I typed it
wrong or want a different name.

## Acceptance criteria
1. **Way in**
   - Given a user with the name "Lan"
   - When they open any page
   - Then the page header shows their current name with a link to change it, and following it shows a form prefilled with "Lan"
2. **Name changed and remembered**
   - Given the change-name form
   - When the user enters "Lan Anh" and confirms
   - Then the header shows "Lan Anh", and the new name is kept on later visits from the same browser
3. **New name shown everywhere**
   - Given "Lan" is Going on two outings
   - When she changes her name to "Lan Anh"
   - Then both outings' Going lists show "Lan Anh" and no longer show "Lan"
4. **Empty name refused**
   - Given the change-name form
   - When the user confirms an empty name or only spaces
   - Then the name is not changed and a message (in Vietnamese) asks for a name

## Out of scope
- Recovering identity on another device (M2, Q-25).

## Notes
- The header link in AC 1 is the BA's proposal for how users reach this screen; the stakeholder can change it at GATE 2.
- Changing the name keeps the same person (browser), so answers and votes stay (BR-09).
