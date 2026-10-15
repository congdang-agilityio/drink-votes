# S-04: Add a venue and see the venue list

- **Priority:** P0
- **Covers:** FR-02, FR-03, NFR-07 · **Decisions:** Q-05, Q-11, Q-13
- **Depends on stories:** S-02, S-03

## User story
As a member, I want to add drinking spots (quán) and see the list of them, so that outings can
offer them in the vote.

## Acceptance criteria
1. **Way in from the home page**
   - Given the home page
   - When the user follows the "Venues" link (in Vietnamese)
   - Then the venue list page is shown, with each venue's name, address, Google Maps link (if any) and notes (if any)
2. **Add a venue with all fields**
   - Given the venue list page
   - When the user adds a venue with name "Quán Ốc Đào", an address, a Google Maps link and the notes "có chỗ để xe, bia tươi"
   - Then the venue appears in the list with all four values
3. **Add a venue with only the required fields**
   - Given the venue list page
   - When the user adds a venue with only a name and an address
   - Then the venue appears in the list without a Maps link or notes
4. **Maps link opens**
   - Given a venue with a Google Maps link
   - When the user taps the link in the list
   - Then the link they entered opens
5. **Shared with everyone**
   - Given a venue was added from browser A
   - When a user in browser B opens the venue list
   - Then browser B sees the venue

## Out of scope
- Refusing missing fields and duplicate names (S-05).
- Editing or deleting venues (out of M1, Q-05).

## Notes
- Anyone can add venues (Q-05). Typos stay permanently in M1 (R-05).
