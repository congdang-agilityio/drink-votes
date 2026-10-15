# Clarifying questions: Drink Votes

- Slug: `drink-vote`
- Open: 0 · Answered: 0 · Confirmed: 19 · Deferred: 7
- Next batch to ask: none. All M1 questions are confirmed; M2 questions are deferred with stakeholder agreement. Requirements are clear for GATE 1.

Rules: the PM asks each question **verbatim** (translation allowed, no rephrasing, merging or
answering) and records the answer verbatim plus an English translation. Only the BA changes a
status to `confirmed` or `deferred`.

Questions Q-01 to Q-15 and Q-21 to Q-24 concern M1 (build first). Q-16 to Q-20 and Q-25 to
Q-26 concern M2 (later) and are deferred to M2 with the stakeholder's agreement (2026-10-15).

---

## M1 questions

### Q-01: Does an outing close in M1?
- **Question:** The README says a vote can be changed "while the outing is still open", but automatic closing and early closing are listed under M2. In M1, what should happen at the close time?
- **Why it matters:** Decides whether M1 includes any closing logic. Without it, the organizer never gets a final result in M1; with it, part of M2 moves into M1.
- **Related:** FR-08, FR-11, FR-12, AMB-01, G-01, R-02
- **Options:**
  - A) Nothing: in M1 the outing never closes; the close time is only displayed, and people can change their answer and vote at any time.
  - B) The organizer can close the outing by hand in M1; automatic closing waits for M2.
  - C) Move automatic closing at the close time into M1 (no cancellation or tie-break rules yet).
  - D) Other (please describe)
- **Answer (original):** A) Không gì cả
- **Answer (English):** A) Nothing (option A: in M1 the outing never closes; the close time is only displayed).
- **Status:** confirmed
- **BA note:** Applied: FR-08 revised (answer and vote can be changed at any time in M1), new FR-20 (close time displayed only, no closing in M1); AMB-01, G-01 resolved; R-02 accepted. Raised follow-up Q-26 (M2: what happens to M1 outings whose close time has passed when M2 ships).

### Q-02: Who counts as the organizer?
- **Question:** There are no accounts. Who is allowed to do organizer actions on an outing (for example closing it early, or editing it)?
- **Why it matters:** Decides whether the app must remember who created each outing, and what other people see on the outing page.
- **Related:** FR-04, FR-12, G-02, R-01
- **Options:**
  - A) Only the person who created the outing, recognised by their browser (cookie).
  - B) Anyone who has the outing link.
  - C) There are no organizer-only actions in M1; decide for M2 later.
  - D) Other (please describe)
- **Answer (original):** A) Chỉ người tạo kèo
- **Answer (English):** A) Only the person who created the outing (option A, recognised by their browser cookie).
- **Status:** confirmed
- **BA note:** Applied: new FR-18 (the outing records its creator's browser; only that browser gets organizer actions); FR-12 updated; G-02 resolved. With Q-01 = A, M1 has organizer-only actions only if Q-14 allows editing. Raised follow-up Q-25 (M2: organizer opening the outing from another device or after clearing the browser).

### Q-03: Which language should the app's screens use?
- **Question:** In which language should buttons, labels and messages be shown (for example "Đi / Không đi" or "Going / Not going")? And how should dates and times be shown?
- **Why it matters:** Every screen and every acceptance criterion depends on the wording.
- **Related:** NFR-08, G-04, A-04
- **Options:**
  - A) Vietnamese only; times in 24-hour format (18:30), dates as day/month/year.
  - B) English only; same time and date format as A.
  - C) Both, with a language switch.
  - D) Other (please describe)
- **Answer (original):** A) Chỉ tiếng Việt
- **Answer (English):** A) Vietnamese only (option A: 24-hour times, day/month/year dates).
- **Status:** confirmed
- **BA note:** Applied: NFR-08 (Vietnamese-only UI, 24-hour times, day/month/year dates); A-04 confirmed; G-04 resolved. Requirement documents stay in English and quote UI wording in Vietnamese where needed.

### Q-04: What does the home page show, and can several outings be open at once?
- **Question:** When someone opens the app's main address (not an outing link), what should they see? And can there be more than one outing at the same time (for example tonight and Friday)?
- **Why it matters:** Decides whether we need a list of outings and how people get to the venue list and the "create outing" page.
- **Related:** FR-03, FR-04, FR-05, G-05, A-03
- **Options:**
  - A) A list of upcoming outings plus links to "Create outing" and "Venues"; several outings may exist at once.
  - B) Only "Create outing" and "Venues" links; outings are reached only through their shared link; several may exist at once.
  - C) Only one open outing at a time; the home page shows it (or "Create outing" if there is none).
  - D) Other (please describe)
- **Answer (original):** A) Danh sách kèo
- **Answer (English):** A) List of outings (option A: upcoming outings plus "Create outing" and "Venues" links; several outings may exist at once).
- **Status:** confirmed
- **BA note:** Applied: new FR-17 (home page with list of upcoming outings and links to "Create outing" and "Venues"); A-03 confirmed; G-05 resolved. Because outings never close in M1 (Q-01), "upcoming" needs a definition: follow-up Q-21.

### Q-05: Who can add, edit and delete venues?
- **Question:** Who may add venues to the venue list, and should venues be editable or removable?
- **Why it matters:** Decides how many venue screens we build in M1 and what happens to outings that already include a removed venue.
- **Related:** FR-02, FR-03, G-03
- **Options:**
  - A) Anyone can add venues; nobody can edit or delete them in M1.
  - B) Anyone can add and edit venues; nobody can delete them.
  - C) Anyone can add, edit and delete venues (a venue used in an outing cannot be deleted).
  - D) Other (please describe)
- **Answer (original):** A) Chỉ thêm
- **Answer (English):** A) Add only (option A: anyone can add venues; nobody can edit or delete them in M1).
- **Status:** confirmed
- **BA note:** Applied: FR-02 (anyone can add), FR-03 confirmed, venue editing and deletion added to M1 out of scope; G-03 resolved. Since mistakes cannot be corrected, raised follow-up Q-23 (duplicate venue names).

### Q-06: Which venue is "leading" when votes are tied in M1?
- **Question:** The outing page shows the "leading venue". If two or more venues have the same number of votes in M1 (the tie-break rule is in M2), what should the page show?
- **Why it matters:** Decides what the page displays and whether part of the M2 tie-break moves into M1.
- **Related:** FR-09, FR-14, AMB-03
- **Options:**
  - A) Show all tied venues as leading (for example "Tied: Quán A, Quán B").
  - B) Show no leader until one venue has more votes than every other.
  - C) Use the M2 rule already in M1 (the venue visited longest ago wins).
  - D) Other (please describe)
- **Answer (original):** A) Hiện tất cả
- **Answer (English):** A) Show all (option A: show all tied venues as leading).
- **Status:** confirmed
- **BA note:** Applied: FR-09 and new BR-08 (all venues tied for the highest count are shown as leading); AMB-03 resolved. Raised follow-up Q-22 (what is shown when nobody has voted yet, since every venue is then tied at 0).

### Q-07: How do names work?
- **Question:** People enter their name once and the browser remembers it. When should the app ask for the name, can people change it, and what if two people use the same name?
- **Why it matters:** Names are the only identity. This decides the first screen people see and whether one person can accidentally overwrite another's answer.
- **Related:** FR-01, AMB-04, G-06, R-01
- **Options:**
  - A) Ask on the first visit to any page; the name can be changed later; two people with the same name are treated as different people (the list may show the name twice).
  - B) Ask only when the person first answers Going / Not going, votes or creates something; the name can be changed later; same-name handling as A.
  - C) Ask as in A or B, but refuse a name already used on that outing ("this name is taken").
  - D) Other (please describe)
- **Answer (original):** A) Hỏi lần đầu vào
- **Answer (English):** A) Ask on first visit (option A: ask on the first visit to any page; name can be changed; same names are different people).
- **Status:** confirmed
- **BA note:** Applied: FR-01 (name asked on first visit to any page), new FR-19 (change name), BR-09 (identity is the browser, not the name; same names allowed); AMB-04, G-06 resolved. Raised follow-up Q-24 (whether a changed name also appears on outings already answered).

### Q-08: What happens to a vote when someone switches to "Not going"?
- **Question:** If a person voted for a venue and then changes their answer from Going to Not going, what should happen to their vote?
- **Why it matters:** Affects vote counts and the leading venue.
- **Related:** FR-06, FR-07, BR-01, AMB-02
- **Options:**
  - A) The vote is removed; if they switch back to Going they vote again.
  - B) The vote is kept but not counted while they are Not going; it counts again if they switch back.
  - C) Other (please describe)
- **Answer (original):** A) Xoá phiếu
- **Answer (English):** A) Remove the vote (option A: the vote is removed; if they switch back to Going they vote again).
- **Status:** confirmed
- **BA note:** Applied: FR-07 and new BR-11 (switching from Going to Not going removes the person's vote; switching back to Going requires a new vote); AMB-02 resolved.

### Q-09: What exactly does the outing page show about people and votes?
- **Question:** Besides the number of people going, the list of who is going and the vote count per venue, should the page also show who voted for which venue, and who said Not going?
- **Why it matters:** Decides the content of the outing page and how private votes are.
- **Related:** FR-09, AMB-06, A-05
- **Options:**
  - A) Counts only per venue (votes are anonymous); list only people who are Going.
  - B) Show who voted for which venue; list people Going and people Not going.
  - C) Show who voted for which venue; list only people who are Going.
  - D) Other (please describe)
- **Answer (original):** A) Chỉ số phiếu
- **Answer (English):** A) Counts only (option A: vote counts per venue, votes anonymous; list only people who are Going).
- **Status:** confirmed
- **BA note:** Applied: FR-09 (vote counts per venue only, votes anonymous; the list shows only people who are Going; Not going and non-responders are not listed); AMB-06 resolved; A-05 confirmed.

### Q-10: What checks apply when creating an outing?
- **Question:** When creating an outing, which of these should the app refuse: fewer than 2 venues, a date in the past, a close time later than the sitting time?
- **Why it matters:** Defines the error cases (acceptance criteria) of the "create outing" page.
- **Related:** FR-04, G-08
- **Options:**
  - A) Refuse all three (at least 2 venues, date today or later, close time before sitting time).
  - B) Refuse a past date and a close time after the sitting time; allow a single venue.
  - C) No checks; trust the organizer.
  - D) Other (please describe)
- **Answer (original):** A) Từ chối cả ba
- **Answer (English):** A) Refuse all three (option A: at least 2 venues, date today or later, close time before sitting time).
- **Status:** confirmed
- **BA note:** Applied: FR-04 and new BR-12 (create outing refuses fewer than 2 venues, a date before today in Asia/Ho_Chi_Minh, and a close time that is not before the sitting time); G-08 resolved.

### Q-11: Is the whole app open to anyone with the address, and is the organizer automatically "Going"?
- **Question:** We assume the app is one shared space for your team: anyone with the address can see and use all venues and outings. We also assume the organizer is not automatically marked Going and answers like everyone else. Are both correct?
- **Why it matters:** Confirms there is no privacy layer (anyone on the internet who finds the link can vote) and how the headcount starts.
- **Related:** A-01, A-02, NFR-07, R-01
- **Options:**
  - A) Both correct.
  - B) Shared space is correct, but the organizer should automatically be marked Going.
  - C) Other (please describe)
- **Answer (original):** A) Cả hai đúng
- **Answer (English):** A) Both correct (option A).
- **Status:** confirmed
- **BA note:** Applied: A-01 and A-02 confirmed; NFR-07 and FR-06 updated (one shared open space; organizer answers Going / Not going like everyone else, not marked Going automatically); R-01 acknowledged by the stakeholder.

### Q-12: Must the pages work well on a phone?
- **Question:** A separate mobile app or UI is out of scope, but people will open outing links from the chat on their phones. Must the normal web pages be comfortable to use on a phone screen?
- **Why it matters:** Affects layout work and how QA checks every screen.
- **Related:** NFR-09, G-13
- **Options:**
  - A) Yes, every page must be usable on a phone screen (same pages, adapting to width).
  - B) Desktop first; working on a phone is nice to have.
  - C) Other (please describe)
- **Answer (original):** A) Có
- **Answer (English):** A) Yes (option A: every page must be usable on a phone screen, same pages adapting to width).
- **Status:** confirmed
- **BA note:** Applied: NFR-09 (every page usable on a phone screen; the same pages adapt to the screen width; no separate mobile UI); G-13 resolved; NFR-09 added to M1 scope.

### Q-13: Which venue fields are required?
- **Question:** When adding a venue (name, address, Google Maps link, notes), which fields must be filled in? Should the app check that the Google Maps link really is a link?
- **Why it matters:** Defines the form's error cases.
- **Related:** FR-02, G-07
- **Options:**
  - A) Only the name is required; the Maps link, if given, must look like a web link.
  - B) Name and address are required; the rest is optional; no link check.
  - C) All fields except notes are required; the Maps link must look like a web link.
  - D) Other (please describe)
- **Answer (original):** B) Tên và địa chỉ
- **Answer (English):** B) Name and address (option B: name and address required; the rest optional; no link check).
- **Status:** confirmed
- **BA note:** Applied: FR-02 and new BR-15 (name and address are required; Google Maps link and notes are optional; the Maps link is not validated); G-07 resolved together with Q-23.

### Q-14: Can an outing be changed after it is created?
- **Question:** After an outing is created and shared, can its date, times or list of venues be changed?
- **Why it matters:** Editing adds a screen and raises questions about votes for a removed venue.
- **Related:** FR-04, G-09, Q-02
- **Options:**
  - A) No editing in M1; create a new outing instead.
  - B) The organizer can change times and add venues, but not remove venues that already have votes.
  - C) The organizer can change everything; votes for a removed venue are deleted.
  - D) Other (please describe)
- **Answer (original):** A) Không sửa
- **Answer (English):** A) No editing (option A: no editing in M1; create a new outing instead).
- **Status:** confirmed
- **BA note:** Applied: FR-04 (outings cannot be edited after creation in M1), outing editing added to M1 out of scope; G-09 resolved. M1 therefore has no organizer-only actions; FR-18 still records the creator for M2. Q-25 now qualifies for deferral.

### Q-15: What is the product name?
- **Question:** The README says "Drink Vote" and the brief says "Drink Votes". Which name should appear in the app?
- **Why it matters:** Shown in the page title and header.
- **Related:** C-01
- **Options:**
  - A) Drink Vote
  - B) Drink Votes
  - C) Other (please describe)
- **Answer (original):** B) Drink Votes
- **Answer (English):** B) Drink Votes.
- **Status:** confirmed
- **BA note:** Applied: new FR-21 (the app shows the product name "Drink Votes" in the page title and header); C-01 resolved; requirement documents now use "Drink Votes" (the slug `drink-vote` is unchanged).

### Q-21: Which outings appear in the home page list?
- **Question:** The home page lists upcoming outings. Since outings never close in M1, which outings should the list show, in what order, and what should each line show?
- **Why it matters:** Without a rule, old outings pile up on the home page forever; this defines the home page content and its acceptance criteria.
- **Related:** FR-17, Q-04, Q-01
- **Options:**
  - A) Outings dated today or later, soonest first; each line shows the date, sitting time and number of people going. Older outings are not listed (still reachable by their link).
  - B) Same as A, plus a separate "Past outings" section below.
  - C) All outings, newest first, with the same details as A.
  - D) Other (please describe)
- **Answer (original):** A) Từ hôm nay
- **Answer (English):** A) From today (option A: outings dated today or later, soonest first; each line shows date, sitting time and number going; older outings not listed but reachable by link).
- **Status:** confirmed
- **BA note:** Applied: FR-17 and new BR-13 (home page lists outings dated today or later in Asia/Ho_Chi_Minh, soonest first; each line shows date, sitting time and number going; older outings are not listed but stay reachable by their link); AMB-07 resolved.

### Q-22: What is shown as "leading" when nobody has voted yet?
- **Question:** You chose to show all tied venues as leading. When an outing has no votes yet, every venue is tied at 0 votes. What should the page show then?
- **Why it matters:** Every new outing starts in this state; it defines what people see first.
- **Related:** FR-09, BR-08, Q-06
- **Options:**
  - A) No leader; show a message such as "No votes yet" (Chưa có phiếu).
  - B) Show all venues as tied leaders, as with any other tie.
  - C) Other (please describe)
- **Answer (original):** A) "Chưa có phiếu"
- **Answer (English):** A) "No votes yet" (option A: no leader; show a message such as "Chưa có phiếu").
- **Status:** confirmed
- **BA note:** Applied: BR-08 and FR-09 (when an outing has no votes, no venue is shown as leading and the page shows "Chưa có phiếu" (No votes yet)).

### Q-23: May two venues have the same name?
- **Question:** Venues cannot be edited or deleted in M1. If someone adds a venue with a name that is already in the list (for example by mistake), what should happen?
- **Why it matters:** A duplicate cannot be removed later, and it would split votes between two entries for the same place.
- **Related:** FR-02, Q-05
- **Options:**
  - A) Refuse it: "A venue with this name already exists" (ignoring upper/lower case).
  - B) Allow it (two branches of the same chain can share a name; the address tells them apart).
  - C) Other (please describe)
- **Answer (original):** A) Từ chối
- **Answer (English):** A) Refuse (option A: "A venue with this name already exists", ignoring upper/lower case).
- **Status:** confirmed
- **BA note:** Applied: FR-02 and new BR-16 (adding a venue whose name matches an existing venue's name, ignoring upper/lower case, is refused with the message "A venue with this name already exists", shown in Vietnamese per NFR-08); G-07 resolved; R-05 reduced. Treating names that differ only in surrounding spaces as the same is recorded as assumption A-07 (implementation detail, no question).

### Q-24: When someone changes their name, what happens on outings they already answered?
- **Question:** A person can change their name later. Should outings where they already answered or voted show the new name, or keep the name they had at that time?
- **Why it matters:** Decides whether the "who is going" list always shows the current name, and what the organizer sees.
- **Related:** FR-19, BR-09, Q-07
- **Options:**
  - A) Show the new name everywhere, including outings already answered.
  - B) Keep the old name on outings already answered; the new name is used from now on.
  - C) Other (please describe)
- **Answer (original):** A) Tên mới mọi nơi
- **Answer (English):** A) New name everywhere (option A: show the new name everywhere, including outings already answered).
- **Status:** confirmed
- **BA note:** Applied: FR-19 and new BR-17 (after a name change, the new name is shown everywhere, including outings the person already answered); G-06 fully resolved.

---

## M2 questions

### Q-16: Does an early close also cancel outings with fewer than 3 people?
- **Question:** If the organizer closes the outing early and fewer than 3 people are going at that moment, should the outing be cancelled ("not enough people") as with the automatic close?
- **Why it matters:** Defines the early-close rule and its acceptance criteria.
- **Related:** FR-12, FR-13, G-10
- **Options:**
  - A) Yes, the same rule applies to every close.
  - B) No, an early close always keeps the outing, whatever the headcount.
  - C) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15: "Đồng ý hoãn"). Reason: early close does not exist in M1 (Q-01).

### Q-17: What if the tie-break still ties?
- **Question:** On a tie, the venue visited longest ago wins, and never-visited venues come first. What if several tied venues have never been visited, or were last visited on the same day?
- **Why it matters:** Without a final rule, the winner is not decided.
- **Related:** FR-14, G-11
- **Options:**
  - A) The venue that was added to the venue list earliest wins.
  - B) Pick one at random.
  - C) Show them as tied and let the organizer choose.
  - D) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15). Reason: M1 shows all tied venues (Q-06) and never picks a winner.

### Q-18: When does a venue count as "visited"?
- **Question:** For the tie-break and for "how many times each venue was visited", when does a venue count as visited?
- **Why it matters:** Drives the tie-break and the history numbers; M1 must record the right data.
- **Related:** FR-14, FR-16, AMB-05, R-04
- **Options:**
  - A) When it won an outing that closed and was not cancelled; the visit date is the outing's date.
  - B) Same as A, but the organizer confirms afterwards that the team really went.
  - C) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15). Reason: M1 outings never close, so no visit can be recorded in M1; M1 keeps outings, dates and votes for either option.

### Q-19: How are cancelled outings shown?
- **Question:** When an outing is cancelled for not enough people, what should its page show, and should it appear in the history?
- **Why it matters:** Defines the cancelled state and the history content.
- **Related:** FR-13, FR-15, G-12
- **Options:**
  - A) The page shows "Cancelled: not enough people" with the final headcount; the history lists it marked as cancelled (it does not count as a visit).
  - B) Same page message, but cancelled outings are left out of the history.
  - C) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15). Reason: cancellation does not exist in M1.

### Q-20: What does a closed outing page show?
- **Question:** After an outing closes normally, what should its page show?
- **Why it matters:** Defines the final state the organizer uses to book a table.
- **Related:** FR-11, G-14
- **Options:**
  - A) A "Closed" label, the winning venue (with address and Maps link), the final headcount and who is going; Going / vote buttons are hidden.
  - B) Same as A, plus the full vote count per venue.
  - C) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15). Reason: closing does not exist in M1.

### Q-25: What if the organizer opens the outing from another device?
- **Question:** The organizer is recognised by the browser that created the outing. If they open it from another phone or computer, or clear their browser data, they lose the organizer actions. Is that acceptable?
- **Why it matters:** Decides whether organizer actions (early close in M2) need a way to recover them.
- **Related:** FR-18, FR-12, Q-02, R-01
- **Options:**
  - A) Acceptable; only the original browser can do organizer actions.
  - B) Show the organizer a private "organizer link" when the outing is created, which grants organizer actions on any device.
  - C) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15). Reason: Q-14 = A, so M1 has no organizer-only actions.

### Q-26: When M2 arrives, what happens to M1 outings whose close time has passed?
- **Question:** In M1 outings never close. When M2 (automatic closing) is released, some outings will already be past their close time. What should happen to them?
- **Why it matters:** Decides whether old M1 outings get a winner, can be cancelled, and appear in the history and visit counts.
- **Related:** FR-11, FR-13, FR-15, FR-16, Q-01, R-04
- **Options:**
  - A) Close them all at release with the M2 rules (cancel if fewer than 3 going, otherwise pick a winner); they appear in the history.
  - B) Close them without a result; they do not appear in the history and do not count as visits.
  - C) Other (please describe)
- **Answer (original):**
- **Answer (English):**
- **Status:** deferred
- **BA note:** Deferred to M2 with stakeholder agreement (stakeholder-notes.md, 2026-10-15). Reason: M1 already keeps everything needed for either option.

<!-- Status values: open | answered | confirmed | deferred
     answered  = PM recorded an answer, BA has not processed it
     confirmed = BA applied it to requirements.md
     deferred  = stakeholder agreed to postpone; reason required in BA note -->
