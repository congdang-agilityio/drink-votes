# Drink Votes: how the BA understands it (round 4, final, for sign-off)

All M1 questions are answered (Q-01 to Q-15, Q-21 to Q-24). The M2-only questions are
postponed until M2 starts, as you agreed. Please check that the summary below matches what you want.

**What it is.** **Drink Votes** is a small web app that helps a team pick a place to drink in
the evening. Each invitation becomes an **outing (kèo)**: a date, a few venues to vote on, a
close time and a headcount. The organizer shares the outing's link in the team chat. The name
"Drink Votes" appears in the page title and header. All screens are in Vietnamese; times look
like 18:30 and dates like 15/10/2026. Every page must also be comfortable on a phone screen
(the same pages adjust to the screen width; there is no separate mobile app).

**Who uses it.** One shared, open space for your team: anyone with the address can see and use
all venues and outings. The organizer (người rủ / chủ kèo) creates the outing and picks the
venues; the app remembers the organizer by the browser they used. The organizer is not marked
Going automatically and answers like everyone else. There are no accounts: the first time you
open any page, the app asks your name and the browser remembers it. You can change your name
later, and the new name then shows everywhere, including outings you already answered. Two
people may use the same name; the app treats them as different people.

**M1 "Tonight's outing" (build first).**
- **Home page:** outings dated today or later, soonest first; each line shows the date, the
  sitting time and how many are going. Links to "Create outing" and "Venues". Older outings drop
  off the list but still open from their link.
- **Venues:** anyone can add a venue and see the list. Name and address are required; the Google
  Maps link and notes are optional, and the app does not check the Maps link. A venue whose
  name already exists is refused ("A venue with this name already exists", shown in Vietnamese),
  ignoring upper/lower case. Venues cannot be edited or deleted in M1.
- **Create an outing:** date, sitting time (default 18:30), close time (default 16:00) and the
  venues to vote on. The app refuses fewer than 2 venues, a date before today, or a close time
  that is not before the sitting time. Each outing has its own link. An outing cannot be
  changed after it is created; you create a new one instead.
- **On the outing:** say Going / Not going; if you are Going, vote for one venue. You can change
  your answer and your vote at any time. If you switch from Going to Not going, your vote is
  removed; if you switch back to Going, you vote again.
- **The outing page shows** how many are going and their names (people who said Not going or
  have not answered are not listed), the number of votes per venue (nobody sees who voted for
  what), and the leading venue. If several venues share the top count, all of them are shown as
  leading. Before anyone votes, no venue is leading and the page says "Chưa có phiếu" (No votes
  yet). The close time is displayed.
- **Outings never close in M1.** Nothing happens at the close time. The organizer books a
  table based on what the page shows when they look.
- A health check address for the hosting platform.

**M2 "Rules of play" (later).**
- The outing closes by itself at the close time (Vietnam time), and then nothing can change.
  The organizer (the browser that created the outing) can close it early.
- If fewer than 3 people are going at close, the outing is cancelled ("not enough people").
- On a tied vote, the venue visited longest ago wins; venues never visited come first.
- A history of closed outings, and how many times each venue was visited.
- Postponed until M2 starts (you agreed): early close and cancellation (Q-16), a tie that is
  still tied (Q-17), what "visited" means (Q-18), how cancelled and closed outings look (Q-19,
  Q-20), the organizer on another device (Q-25), old M1 outings when M2 ships (Q-26).

**Not included.** Login, permissions, multiple teams, bill splitting, booking through the
venue's app, Slack/email notifications, maps, a separate mobile app. Also not in M1: closing
an outing, editing an outing, editing or deleting venues, an English version of the screens,
showing who voted for which venue or who said Not going.

**Small details the BA assumed (tell us if any is wrong).**
- When checking for a duplicate venue name, spaces at the start or end are ignored ("Quán A "
  equals "Quán A"). Names that differ only in Vietnamese accents ("Quán Ốc" and "Quan Oc") count
  as different names, because you asked to ignore upper/lower case only.
- The health check reports a problem when the database is down (only the "all fine" case is
  described in the README).

**Known trade-offs you accepted.**
- No login: anyone can answer under any name, or vote twice from two browsers.
- M1 gives no final result; the organizer decides when to look and book.
- Venues cannot be fixed or removed in M1, so a typo (or a misspelled second entry for the
  same place) stays in the list.

**What is still unclear.** Nothing for M1.
