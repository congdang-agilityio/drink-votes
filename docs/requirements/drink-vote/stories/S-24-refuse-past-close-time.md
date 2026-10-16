# S-24: Refuse an outing whose close time has already passed

- **Priority:** P2
- **Covers:** FR-28, FR-04 (M2 change), NFR-06 · **Decisions:** Q-31, Q-10
- **Depends on stories:** S-07 (M1), S-13

## User story
As an organizer, I want the app to stop me from creating an outing that would be closed immediately, so that I do not share a link nobody can answer.

## Acceptance criteria
1. **Close time already passed today**
   - Given it is 16:30 on 20/10 (`Asia/Ho_Chi_Minh`)
   - When a user submits an outing dated 20/10 with close time 16:00 and sitting time 18:30
   - Then the outing is not created and the form shows "The close time has already passed" (shown in Vietnamese)
2. **Close time still ahead today**
   - Given it is 15:00 on 20/10
   - When a user submits an outing dated 20/10 with close time 16:00
   - Then the outing is created
3. **Future dates are not affected**
   - Given it is 16:30 on 20/10
   - When a user submits an outing dated 21/10 with close time 16:00
   - Then the outing is created
4. **M1 checks still apply**
   - Given an outing with fewer than 2 venues, a past date, or a close time not before the sitting time
   - When a user submits it
   - Then it is refused with the M1 messages, as in S-07

## Out of scope
- Editing an outing after creation (still out).

## Notes
- BR-27. No new screen: the M1 "Create outing" form, reached from the home page link (S-06).
