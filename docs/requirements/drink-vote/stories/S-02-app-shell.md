# S-02: App shell with product name, Vietnamese UI and phone layout

- **Priority:** P0
- **Covers:** FR-21, NFR-01, NFR-07, NFR-08, NFR-09 · **Decisions:** Q-03, Q-11, Q-12, Q-15
- **Depends on stories:** none

## User story
As a member, I want a home page that clearly shows "Drink Votes" in my language and fits my phone,
so that I know I opened the right app when I tap a link in the team chat.

## Acceptance criteria
1. **Home page reachable**
   - Given the app is running
   - When a user opens the app's main address
   - Then the home page is shown as a server-rendered HTML page, without any login
2. **Product name**
   - Given any page of the app
   - When it is opened
   - Then the browser page title and the page header both show "Drink Votes"
3. **Vietnamese UI**
   - Given the home page
   - When it is opened
   - Then all buttons, labels and messages are in Vietnamese, and there is no language switch
4. **Usable on a phone**
   - Given a phone-sized screen (about 360 px wide)
   - When the home page is opened
   - Then all content is readable and usable without horizontal scrolling or zooming, on the same page used by desktop browsers

## Out of scope
- The name prompt (S-03), links to "Venues" (S-04) and "Create outing" (S-06), the outing list (S-11).

## Notes
- The home page is the way in for the whole app; later stories add their links to it.
- NFR-08 and NFR-09 apply to every page; each later story keeps its page in Vietnamese, with 24-hour
  times (e.g. 18:30) and day/month/year dates, and usable on a phone screen.
- NFR-07: one shared open space; anyone with the address sees everything.
