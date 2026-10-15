# S-05: Venue checks (required fields, duplicate names)

- **Priority:** P1
- **Covers:** FR-02 · **Decisions:** Q-13, Q-23, BR-15, BR-16, A-07
- **Depends on stories:** S-04

## User story
As a member, I want the app to stop incomplete or duplicate venues, so that the venue list stays
clean and usable.

## Acceptance criteria
1. **Name required**
   - Given the add-venue form
   - When the user submits it without a name
   - Then the venue is not added and a message (in Vietnamese) says the name is required
2. **Address required**
   - Given the add-venue form
   - When the user submits it without an address
   - Then the venue is not added and a message (in Vietnamese) says the address is required
3. **Duplicate name refused, ignoring case**
   - Given a venue named "Quán Ốc Đào" exists
   - When the user adds a venue named "quán ốc đào"
   - Then the venue is not added and the message "A venue with this name already exists" (in Vietnamese) is shown
4. **Maps link not checked**
   - Given the add-venue form
   - When the user enters a name, an address and the Maps link "not a link"
   - Then the venue is added with that text as its Maps link

## Out of scope
- Editing or deleting venues (out of M1, Q-05).

## Notes
- A-07 (accepted at GATE 1): names differing only by leading/trailing spaces count as the same name;
  names differing only in Vietnamese diacritics (e.g. "Quán Ốc" vs "Quan Oc") are different names.
