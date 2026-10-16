# Drink Votes: how the BA understands it (M1 signed off 2026-10-15; M2 ready for confirmation, 2026-10-16)

All questions are answered, for M1 and for M2 (Q-16 to Q-20 and Q-25 to Q-36). M1 is signed off
and does not change. This page presents **M2 "Rules of play" (Luật chơi)** in full so you can
confirm it. A short reminder of M1 is at the end.

---

## M2 "Rules of play": what it adds and changes

**1. Outings now close.**
- **Automatic close:** each outing closes by itself at its close time, Vietnam time, on the
  outing's own date. After that nobody can change Going / Not going or their vote. "Change at
  any time" from M1 becomes "change while the outing is open".
- **Early close:** the organizer can close the outing before the close time. The same rules
  apply as for the automatic close.
- **Not enough people:** if fewer than 3 people are going at any close (automatic or early), the
  outing is cancelled ("không đủ quân"). The number 3 is a setting.

**2. How the winner is decided at close.**
- The venue with the most votes wins.
- If several venues are tied, the venue visited longest ago wins; a venue never visited comes
  first.
- If 3 or more are going but nobody voted, all venues of the outing count as tied and the same
  rule applies.
- If venues are still tied after that (for example several never visited), the **organizer
  chooses** the winner among them.

**3. The outing page while it is open.**
- The leading venue uses the same rule (most votes, then the tie-break). Normally one venue is
  shown.
- If the tie-break still leaves several venues tied, all of them are shown as leading with a
  note, for example "Hoà: Quán A, Quán B – chủ kèo sẽ chọn".
- Before anyone votes, the page still says "Chưa có phiếu" with no leading venue, as in M1.
- This replaces the M1 display where all tied venues were shown as leading.

**4. The outing page after it closes.** There are three possible endings.
- **Closed with a winner:** a "Closed" label, the winning venue with its address and Google
  Maps link, the final headcount, the names of the people who were going, and the number of
  votes per venue (still anonymous). The Going / Not going and vote buttons are gone.
- **Closed, waiting for the organizer:** when venues are still tied at close, the page shows
  "Closed – waiting for the organizer to choose" with the tied venues. Only the organizer sees
  the buttons to choose. There is no deadline: if the organizer never chooses, the outing never
  gets a winner and never counts as a visit.
- **Cancelled:** "Cancelled: not enough people" with the final headcount; the buttons are gone.

**5. "Visited" means confirmed by the organizer.**
- Once the outing has a winner and its sitting time has passed, the organizer sees
  "Đã đi <venue> chưa?" with "Đã đi" (We went) and "Không đi" (We did not go).
- There is no deadline. Only "Đã đi" counts as a visit (the visit date is the outing's date).
  "Không đi" never counts, and neither does an outing the organizer never answered.
- Only "Đã đi" visits are used for the tie-break and for the visit counts.

**6. Organizer actions.** Early close, choosing among tied venues, and confirming the visit.
They work only in the browser that created the outing. On another phone or computer, or after
clearing browser data, the organizer cannot do them. There is no "organizer link".

**7. Home page.** The list now shows only **open** outings dated today or later, soonest first
(date, sitting time, number going, as in M1). As soon as an outing closes or is cancelled, it
leaves the list; it still opens from its link and from the History page. The home page gets a
new link to the History page, next to "Create outing" and "Venues".

**8. History page (Lịch sử) and visit counts.**
- A new History page, linked from the home page, lists closed outings, newest first.
- Each line shows the date, the venue and the number of people, with a mark: "Đã đi" (went),
  "Chưa xác nhận" (not confirmed) or "Không đi" (did not go). An outing still waiting for the
  organizer's choice shows "chưa chọn quán" instead of a venue.
- Cancelled outings are listed too, marked as cancelled, with their final headcount.
- The existing Venues page shows next to each venue how many times it was visited (0 for a
  venue never visited). Only "Đã đi" outings count.

**9. Creating an outing.** In addition to the M1 checks, the app refuses an outing whose close
time has already passed when you create it (for example creating at 17:00 an outing for today
with close time 16:00), with the message "The close time has already passed" (shown in
Vietnamese).

**10. Old M1 outings.** When M2 is released, every M1 outing whose close time has passed is
closed with the M2 rules (cancelled if fewer than 3 going, otherwise a winner, or waiting for
the organizer's choice) and appears in the History page.

## Small details the BA assumed for M2 (please confirm or correct each one)

- **A-08:** The close time applies on the outing's own date (an outing on 20/10 with close time
  16:00 closes at 16:00 on 20/10, Vietnam time).
- **A-09:** Closing is final: a closed or cancelled outing cannot be reopened.
- **A-10:** The organizer's choice among tied venues and the visit confirmation ("Đã đi" /
  "Không đi") are final once made; they cannot be changed afterwards.
- **A-11:** When M2 starts, no venue has a confirmed visit yet, so every venue counts as "never
  visited". As a result, most ties at first (including in old M1 outings closed at release) will
  be decided by the organizer's choice. For old M1 outings, the organizer is the browser that
  created them in M1, and it can also confirm the visit.
- **A-12:** The organizer does not need to be Going to close early, choose a venue or confirm the
  visit.
- **A-13:** While an outing waits for the organizer's choice, its page also shows the final
  headcount, the names of the people who were going and the votes per venue, like a closed
  outing page. Once the organizer chooses, it becomes the normal closed page.
- **A-14:** In the History page, an outing still waiting for the organizer's choice is marked
  "Chưa xác nhận" (it cannot be confirmed before it has a winner).
- **A-15 (new, from your last answers):** In the History page, "newest first" means by the
  outing's date, latest date first, and tapping a line opens that outing's page. Because closed
  outings leave the home page, this is how people, and the organizer (to choose a venue or
  confirm the visit), get back to a closed outing without its original link.

## Not included in M2

- A deadline or automatic fallback when the organizer never chooses among tied venues or never
  confirms the visit.
- Any way to recover organizer actions on another device (no "organizer link").
- Showing closed or cancelled outings on the home page (they are in the History page).
- Still out of the product: login, permissions, multiple teams, bill splitting, booking through
  the venue's app, Slack/email notifications, maps, a separate mobile app.

## Known trade-offs you accepted in M2

- If the organizer forgets, or loses the browser that created the outing, tied outings stay
  without a winner and visits stay unconfirmed, with no deadline and no automatic fallback.
  Visit counts can then be lower than reality, and the History page shows "chưa chọn quán" or
  "Chưa xác nhận" for those outings.
- No login: anyone can answer under any name, or vote twice from two browsers (unchanged from M1).

## What is still unclear

Nothing. If the summary and the assumptions A-08 to A-15 are right, M2 is ready for your
confirmation.

---

## Reminder: M1 "Tonight's outing" (signed off 2026-10-15, unchanged)

Drink Votes is a small web app, in Vietnamese, usable on a phone, where a team picks a place to
drink. No accounts: the app asks your name on the first visit and remembers your browser; you
can change your name later and it changes everywhere. Anyone can add venues (name and address
required, duplicate names refused, no editing or deleting). Anyone can create an outing (date,
sitting time 18:30 by default, close time 16:00 by default, at least 2 venues, no past date,
close time before sitting time; no editing afterwards), share its link, say Going / Not going
and, if Going, vote for one venue. The outing page shows the headcount, the names of people
going, anonymous vote counts and the leading venue(s), or "Chưa có phiếu" before any vote. The
home page lists outings from today on, soonest first, with links to "Create outing" and
"Venues". In M1 outings never close. M2 above changes the parts noted there.
