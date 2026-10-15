# S-08: Say Going or Not going

- **Priority:** P0
- **Covers:** FR-06, FR-09, FR-20 · **Decisions:** Q-01, Q-09, Q-11, BR-09, BR-14
- **Depends on stories:** S-03, S-06

## User story
As a member, I want to say Going or Not going (Đi / Không đi) on an outing and see who is going,
so that the organizer knows how many people to book for.

## Acceptance criteria
1. **Say Going**
   - Given "Lan" opens an outing she has not answered
   - When she chooses Going
   - Then the page shows her answer as Going, the number of people going increases by 1, and "Lan" appears in the Going list
2. **Say Not going**
   - Given "Minh" opens an outing he has not answered
   - When he chooses Not going
   - Then the page shows his answer as Not going, the number going does not change, and "Minh" is not listed anywhere on the page
3. **Change the answer at any time**
   - Given "Lan" is Going on an outing whose close time has already passed
   - When she switches to Not going, and later back to Going
   - Then each change is accepted and the number going and the Going list update each time
4. **Organizer not automatically Going**
   - Given an outing was just created and nobody has answered
   - When anyone opens the outing page
   - Then the number going is 0, the Going list is empty, and the organizer can answer like everyone else
5. **Same name, different people**
   - Given two different browsers both use the name "Lan"
   - When both choose Going
   - Then the number going is 2 and "Lan" appears twice in the Going list

## Out of scope
- Voting for a venue (S-09).
- Showing who said Not going or who has not answered (out of M1, Q-09).

## Notes
- Outings never close in M1 (Q-01, FR-20).
- People who have not answered are neither counted nor listed (FR-09).
