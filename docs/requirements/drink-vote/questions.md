# Clarifying questions: Drink Votes

- Slug: `drink-vote`
- Open: 0 · Answered: 0 · Confirmed: 36 · Deferred: 0
- Next batch to ask: none (M2 ready for its GATE 1 re-sign)
- Round 6 (Q-19, Q-20, Q-32..Q-36) applied 2026-10-16; no follow-ups were needed
- Round 7 (Q-29, Q-30, Q-31) applied 2026-10-16; no follow-ups were needed

Rules: the PM asks each question **verbatim** (translation allowed, no rephrasing, merging or
answering) and records the answer verbatim plus an English translation. Only the BA changes a
status to `confirmed` or `deferred`.

Questions Q-01 to Q-15 and Q-21 to Q-24 concern M1 (signed off 2026-10-15). Q-16 to Q-20 and
Q-25 to Q-26 concern M2; they were deferred on 2026-10-15 and reopened on 2026-10-16 when the
stakeholder asked to move on to M2 (stakeholder-notes.md, 2026-10-16). Q-27 to Q-31 are new M2
questions raised on 2026-10-16 after re-checking M2 against the M1 decisions. Q-32 to Q-36 are
follow-ups raised on 2026-10-16 by the round 5 answers (Q-17, Q-18, Q-27, Q-28). Round 6
(2026-10-16) answered Q-19, Q-20 and Q-32 to Q-36; all are confirmed. Round 7 (2026-10-16)
answered Q-29 to Q-31; all are confirmed.

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

## M2 questions (deferred 2026-10-15, reopened 2026-10-16)

### Q-16: Does an early close also cancel outings with fewer than 3 people?
- **Question:** If the organizer closes the outing early and fewer than 3 people are going at that moment, should the outing be cancelled ("not enough people") as with the automatic close?
- **Why it matters:** Defines the early-close rule and its acceptance criteria.
- **Related:** FR-12, FR-13, G-10
- **Options:**
  - A) Yes, the same rule applies to every close.
  - B) No, an early close always keeps the outing, whatever the headcount.
  - C) Other (please describe)
- **Answer (original):** A) Có
- **Answer (English):** A) Yes (option A: the same <3 cancellation rule applies to every close, including an early close).
- **Status:** confirmed
- **BA note:** Deferred on 2026-10-15 ("Đồng ý hoãn"); reopened 2026-10-16 because M2 has started (stakeholder-notes.md, 2026-10-16). Applied 2026-10-16 (round 5): FR-12, FR-13 and new BR-18 (the fewer-than-`MIN_PEOPLE` cancellation applies to every close, automatic or early); G-10 resolved. Early close is no longer the only organizer action (Q-17, Q-18 add two more; see FR-12).

### Q-17: What if the tie-break still ties?
- **Question:** On a tie, the venue visited longest ago wins, and never-visited venues come first. What if several tied venues have never been visited, or were last visited on the same day?
- **Why it matters:** Without a final rule, the winner is not decided.
- **Related:** FR-14, G-11
- **Options:**
  - A) The venue that was added to the venue list earliest wins.
  - B) Pick one at random.
  - C) Show them as tied and let the organizer choose.
  - D) Other (please describe)
- **Answer (original):** C) Chủ kèo chọn
- **Answer (English):** C) Organizer chooses (option C: show them as tied and let the organizer choose).
- **Status:** confirmed
- **BA note:** Deferred on 2026-10-15; reopened 2026-10-16 because M2 has started. Applied 2026-10-16 (round 5): FR-14 and new FR-22, BR-19 (when the tie-break still leaves several venues tied at close, they are shown as tied and the organizer chooses the winner from the browser that created the outing, Q-25); G-11 resolved. Raises follow-ups: Q-34 (state of the outing until the organizer chooses, and what happens if they never choose) and Q-32 (what the open page shows when the tie-break still ties, since Q-27 asks for one leading venue). Assumed the choice is final (A-10).

### Q-18: When does a venue count as "visited"?
- **Question:** For the tie-break and for "how many times each venue was visited", when does a venue count as visited?
- **Why it matters:** Drives the tie-break and the history numbers; M1 must record the right data.
- **Related:** FR-14, FR-16, AMB-05, R-04
- **Options:**
  - A) When it won an outing that closed and was not cancelled; the visit date is the outing's date.
  - B) Same as A, but the organizer confirms afterwards that the team really went.
  - C) Other (please describe)
- **Answer (original):** B) Như A + chủ kèo xác nhận
- **Answer (English):** B) Same as A plus organizer confirmation (option B: counts as visited when it won a closed, non-cancelled outing AND the organizer confirms afterwards that the team really went).
- **Status:** confirmed
- **BA note:** Deferred on 2026-10-15; reopened 2026-10-16 because M2 has started. Applied 2026-10-16 (round 5): FR-16 and new FR-23, BR-20 (a venue counts as visited only when it won a closed, non-cancelled outing and the organizer confirmed afterwards that the team went; the visit date is the outing's date); AMB-05 resolved. Raises follow-ups: Q-35 (when the organizer can confirm, whether they can answer "did not go", and what happens if they never confirm) and Q-36 (how the history shows outings that are not confirmed). Assumed the confirmation is final (A-10).

### Q-19: How are cancelled outings shown?
- **Question:** When an outing is cancelled for not enough people, what should its page show, and should it appear in the history?
- **Why it matters:** Defines the cancelled state and the history content.
- **Related:** FR-13, FR-15, G-12
- **Options:**
  - A) The page shows "Cancelled: not enough people" with the final headcount; the history lists it marked as cancelled (it does not count as a visit).
  - B) Same page message, but cancelled outings are left out of the history.
  - C) Other (please describe)
- **Answer (original):** A) Có trong lịch sử
- **Answer (English):** A) In the history (option A: page shows "Cancelled: not enough people" with the final headcount; history lists it marked cancelled, not a visit).
- **Status:** confirmed
- **BA note:** Deferred on 2026-10-15; reopened 2026-10-16 because M2 has started. Re-checked against M1: still valid. "Final headcount" is a number only; per Q-09 votes stay anonymous. How a cancelled outing appears in the home page list is asked in Q-29. Updated 2026-10-16 after round 5: early closes with fewer than 3 going are also cancelled (Q-16); M1 outings closed at M2 release can be cancelled too (Q-26). Applied 2026-10-16 (round 6): FR-13, FR-15 and new FR-26, BR-24 (a cancelled outing's page shows "Cancelled: not enough people" (shown in Vietnamese) with the final headcount, and Going / vote buttons are hidden; the history lists it marked as cancelled, with no venue, and it never counts as a visit); G-12 resolved. The cancelled page shows only what option A lists (no going list, no vote counts).

### Q-20: What does a closed outing page show?
- **Question:** After an outing closes normally, what should its page show?
- **Why it matters:** Defines the final state the organizer uses to book a table.
- **Related:** FR-11, G-14
- **Options:**
  - A) A "Closed" label, the winning venue (with address and Maps link), the final headcount and who is going; Going / vote buttons are hidden.
  - B) Same as A, plus the full vote count per venue.
  - C) Other (please describe)
- **Answer (original):** B) Như A + số phiếu
- **Answer (English):** B) Same as A plus vote counts (option B: "Closed" label, winner with address and Maps link, final headcount and who is going, Going/vote buttons hidden, plus the full vote count per venue).
- **Status:** confirmed
- **BA note:** Applied 2026-10-16 (round 6): new FR-27 and BR-25 (a closed outing with a winner shows a "Closed" label (shown in Vietnamese), the winning venue with its address and Google Maps link, the final headcount, the names of people who were Going and the vote count per venue (still anonymous); Going / Not going and vote buttons are hidden; the organizer additionally sees the visit confirmation from the sitting time, Q-35); G-14 resolved. History of this note: deferred on 2026-10-15; reopened 2026-10-16 because M2 has started. Re-checked against M1: both options stay consistent with Q-09 (vote counts per venue only, anonymous; only Going people listed). If the winner was decided by the tie-break (Q-17) or with no votes (Q-28), the page shows the venue chosen by that rule. Updated 2026-10-16 after round 5: this question is about an outing that has a winner; the state while the organizer still has to choose among tied venues is asked in Q-34, and the visit confirmation (Q-18) in Q-35.

### Q-25: What if the organizer opens the outing from another device?
- **Question:** The organizer is recognised by the browser that created the outing. If they open it from another phone or computer, or clear their browser data, they lose the organizer actions. Is that acceptable?
- **Why it matters:** Decides whether organizer actions (early close in M2) need a way to recover them.
- **Related:** FR-18, FR-12, Q-02, R-01
- **Options:**
  - A) Acceptable; only the original browser can do organizer actions.
  - B) Show the organizer a private "organizer link" when the outing is created, which grants organizer actions on any device.
  - C) Other (please describe)
- **Answer (original):** A) Chấp nhận
- **Answer (English):** A) Acceptable (option A: only the original browser can do organizer actions).
- **Status:** confirmed
- **BA note:** Deferred on 2026-10-15; reopened 2026-10-16 because M2 has started. PM note (stakeholder-notes.md, 2026-10-16): when asking, the PM added to the "why it matters" line that M2 organizer actions may include early close, choosing among tied venues and confirming the visit. This deviates from verbatim asking, but the added content is accurate (it matches this BA note and the Q-17/Q-18 answers), so the stakeholder answered with full information and the answer stands. Applied 2026-10-16 (round 5): FR-18, FR-12 and new BR-10 wording (all M2 organizer actions, early close, choosing among tied venues and confirming the visit, are available only from the browser that created the outing; no recovery on another device); G-15 resolved; R-01 and new R-06 updated (a lost organizer browser leaves ties unchosen and visits unconfirmed, which is why Q-34 and Q-35 ask what happens then).

### Q-26: When M2 arrives, what happens to M1 outings whose close time has passed?
- **Question:** In M1 outings never close. When M2 (automatic closing) is released, some outings will already be past their close time. What should happen to them?
- **Why it matters:** Decides whether old M1 outings get a winner, can be cancelled, and appear in the history and visit counts.
- **Related:** FR-11, FR-13, FR-15, FR-16, Q-01, R-04
- **Options:**
  - A) Close them all at release with the M2 rules (cancel if fewer than 3 going, otherwise pick a winner); they appear in the history.
  - B) Close them without a result; they do not appear in the history and do not count as visits.
  - C) Other (please describe)
- **Answer (original):** A) Chốt theo luật M2
- **Answer (English):** A) Close with M2 rules (option A: close all of them at release with the M2 rules; they appear in the history).
- **Status:** confirmed
- **BA note:** Deferred on 2026-10-15; reopened 2026-10-16 because M2 has started. Applied 2026-10-16 (round 5): new FR-24 and BR-23 (at M2 release, every M1 outing whose close time has passed is closed with the M2 rules: cancelled if fewer than `MIN_PEOPLE` going, otherwise a winner by votes, tie-break (Q-28 for no votes) and organizer choice (Q-17); they appear in the history per Q-19/Q-36); G-16 resolved; R-04 updated. Consequence recorded as assumption A-11: no visit is confirmed at release, so every venue ranks as never visited for these outings, and any tie goes to their organizer's choice; their organizer is the browser recorded in M1 (FR-18), which can also confirm the visit (Q-18).

---

## New M2 questions (2026-10-16)

### Q-27: While an M2 outing is still open, which venue is shown as leading on a tie?
- **Question:** In M1, when several venues share the top vote count, all of them are shown as leading. In M2 a tie is broken at close time (the venue visited longest ago wins). While the outing is still open, should the page keep showing all tied venues, or already show the venue that would win the tie-break?
- **Why it matters:** Decides whether the outing page's "leading venue" changes from M1 and what members see before the close.
- **Related:** FR-09, FR-14, BR-08, Q-06, Q-17
- **Options:**
  - A) Keep the M1 display while open (all tied venues shown as leading); the tie-break is applied only when the outing closes.
  - B) Apply the tie-break already while open: always show one leading venue.
  - C) Other (please describe)
- **Answer (original):** B) Áp luật ngay
- **Answer (English):** B) Apply immediately (option B: apply the tie-break while the outing is open; always show one leading venue).
- **Status:** confirmed
- **BA note:** New 2026-10-16 from re-checking FR-14 against Q-06 (M1 shows all tied venues). Applied 2026-10-16 (round 5): new FR-25 and BR-22 (while an M2 outing is open, the leading venue is decided by vote count and then the tie-break, using confirmed visits only; this replaces the M1 "all tied venues" display of BR-08 from M2); G-17 resolved. Two cases are not covered by "always one leading venue" and are recorded as conflict C-02: the tie-break can still tie (Q-17 says those venues are shown as tied) → follow-up Q-32; and no votes at all (M1 shows "Chưa có phiếu", Q-22) → follow-up Q-33.

### Q-28: What happens at close if enough people are going but nobody voted?
- **Question:** People who are Going do not have to vote. If 3 or more people are going at close time but there are no votes at all, what should happen?
- **Why it matters:** Every included venue is then tied at 0 votes. In M1 this state shows "Chưa có phiếu" with no leader (Q-22); M2 needs a rule for the final result.
- **Related:** FR-11, FR-13, FR-14, BR-08, Q-22, Q-17
- **Options:**
  - A) Treat it as a tie between all included venues and apply the tie-break (venue visited longest ago wins).
  - B) Close the outing with the headcount but no winning venue ("Chưa có phiếu"); it does not count as a visit.
  - C) Cancel the outing, as if there were not enough people.
  - D) Other (please describe)
- **Answer (original):** A) Áp luật hoà phiếu
- **Answer (English):** A) Apply the tie-break (option A: treat it as a tie between all included venues and apply the tie-break).
- **Status:** confirmed
- **BA note:** New 2026-10-16 from re-checking FR-14 and FR-13 against Q-22. Applied 2026-10-16 (round 5): FR-14 and new BR-21 (at close, with `MIN_PEOPLE` or more going and no votes, all included venues are treated as tied and the tie-break applies; if still tied, the organizer chooses per Q-17); G-18 resolved. What the open page shows before any vote is asked in Q-33.

### Q-29: How does the home page list show closed and cancelled outings?
- **Question:** The home page lists outings dated today or later, soonest first (date, sitting time, number going). In M2, outings dated today may already be closed or cancelled. How should the list handle them?
- **Why it matters:** Defines the home page in M2; without a rule, members cannot tell from the list whether an outing is still open.
- **Related:** FR-17, BR-13, Q-21, FR-11, FR-13
- **Options:**
  - A) Keep the same list and add a label to each line: "Open", "Closed" (with the winning venue, or "chưa chọn quán" while the organizer has not chosen) or "Cancelled".
  - B) Show only open outings; closed and cancelled outings leave the list (they stay reachable by link and in the history).
  - C) Other (please describe)
- **Answer (original):** B) Chỉ kèo đang mở
- **Answer (English):** B) Open outings only (option B: show only open outings; closed and cancelled outings leave the list but stay reachable by link and in the history).
- **Status:** confirmed
- **BA note:** New 2026-10-16 from re-checking FR-17 (Q-21) against M2 closing. Option A refined 2026-10-16 (before being asked) to cover the "waiting for the organizer to choose" state decided in Q-34. Applied 2026-10-16 (round 7): new FR-29 and BR-28 (from M2 the home page lists only open outings dated today or later, soonest first; closed, waiting and cancelled outings leave the list but stay reachable by link and in the History page); G-19 resolved. Since a closed outing waiting for the organizer's choice also leaves the list, the History page becomes the way back to it without the original link (A-15).

### Q-30: Where are the history and the venue visit counts shown?
- **Question:** M2 adds a history of closed outings (date, venue, number of people, with the marks you chose: "Đã đi" / "Chưa xác nhận" / "Không đi", or cancelled) and how many times each venue was visited. Where should these appear, and in what order?
- **Why it matters:** Decides which pages are added or changed and how people reach them.
- **Related:** FR-15, FR-16, FR-03, FR-17
- **Options:**
  - A) A new "History" (Lịch sử) page, linked from the home page, listing closed outings newest first; the visit count is shown next to each venue on the existing Venues page (0 for never visited).
  - B) A new "History" page, linked from the home page, with two parts: closed outings (newest first) and a table of venues with their visit counts.
  - C) Other (please describe)
- **Answer (original):** A) Trang Lịch sử + số ở Quán
- **Answer (English):** A) History page + counts on Venues (option A: new "Lịch sử" page linked from home, closed outings newest first; visit count next to each venue on the existing Venues page, 0 if never visited).
- **Status:** confirmed
- **BA note:** New 2026-10-16: gap in FR-15/FR-16 (no location, order or way in). Question text refined 2026-10-16 (before being asked) to mention the history marks decided in Q-19 and Q-36; "closed outings" in the options includes cancelled ones (Q-19). Visit counts include "Đã đi" outings only (Q-36). Applied 2026-10-16 (round 7): FR-15, FR-16 and new BR-29 (a "Lịch sử" (History) page linked from the home page lists closed outings, including cancelled ones, newest first; the Venues page shows each venue's visit count, 0 for never visited); G-20 resolved. Recorded as assumption A-15: "newest first" is by outing date, and each history line opens that outing's page.

### Q-31: Can an outing be created after its close time has already passed?
- **Question:** In M1 the app allows creating an outing for today even if its close time has already passed (for example creating at 17:00 an outing for today with close time 16:00). In M2 such an outing would close immediately. What should happen?
- **Why it matters:** Adds or not an error case to the "create outing" page in M2.
- **Related:** FR-04, BR-12, FR-11, Q-10
- **Options:**
  - A) Refuse it: "The close time has already passed" (shown in Vietnamese).
  - B) Allow it; it closes immediately with the normal M2 rules.
  - C) Other (please describe)
- **Answer (original):** A) Từ chối
- **Answer (English):** A) Refuse (option A: "The close time has already passed", shown in Vietnamese).
- **Status:** confirmed
- **BA note:** New 2026-10-16 from re-checking BR-12 (Q-10) against FR-11. Applied 2026-10-16 (round 7): new FR-28 and BR-27 (from M2, creating an outing is also refused when its close time on the outing's date, `Asia/Ho_Chi_Minh`, has already passed at creation, with "The close time has already passed" shown in Vietnamese); FR-11 now confirmed; G-21 resolved.

---

## Follow-up M2 questions (2026-10-16, from round 5 answers)

### Q-32: While an outing is open, what is shown when the tie-break still leaves several venues tied?
- **Question:** You chose to apply the tie-break while the outing is open and always show one leading venue (Q-27). But when the tied venues have never been visited, or were last visited on the same day, the tie-break cannot pick one, and at close you chose to show them as tied and let the organizer choose (Q-17). While the outing is still open, what should the page show in that case?
- **Why it matters:** This happens often at the start of M2, because no venue has a confirmed visit yet, so every tie remains a tie. It defines the "leading venue" line of the outing page.
- **Related:** FR-25, FR-14, FR-22, BR-22, C-02, Q-27, Q-17
- **Options:**
  - A) Show all the venues still tied after the tie-break as leading, with a note that the organizer will choose at close (for example "Hoà: Quán A, Quán B – chủ kèo sẽ chọn").
  - B) Show all the venues still tied as leading, without any note.
  - C) Other (please describe)
- **Answer (original):** A) Hiện hoà + ghi chú
- **Answer (English):** A) Show tie + note (option A: show all venues still tied after the tie-break as leading, with a note that the organizer will choose at close).
- **Status:** confirmed
- **BA note:** New 2026-10-16: follow-up of Q-27 = B and Q-17 = C (conflict C-02). Applied 2026-10-16 (round 6): FR-25 and BR-22 (while open, if several venues remain tied after the tie-break, all of them are shown as leading with a note that the organizer will choose at close, e.g. "Hoà: Quán A, Quán B – chủ kèo sẽ chọn"); G-22 resolved; with Q-33, C-02 resolved.

### Q-33: While an outing is open and nobody has voted yet, what is shown as leading?
- **Question:** In M1, before anyone votes, the page shows no leading venue and "Chưa có phiếu" (Q-22). In M2 you chose to apply the tie-break while the outing is open (Q-27) and, at close, to treat "no votes" as a tie between all venues (Q-28). While the outing is open and has no votes yet, what should the page show?
- **Why it matters:** Every new outing starts with no votes, so this is the first thing people see on the outing page in M2.
- **Related:** FR-25, FR-09, BR-08, BR-21, BR-22, C-02, Q-22, Q-27, Q-28
- **Options:**
  - A) Keep the M1 display: no leading venue and "Chưa có phiếu" until the first vote.
  - B) Treat it as a tie between all venues and show the venue the tie-break would pick (or the venues still tied, as decided in Q-32).
  - C) Other (please describe)
- **Answer (original):** A) Giữ như M1
- **Answer (English):** A) Keep M1 (option A: no leading venue and "Chưa có phiếu" until the first vote).
- **Status:** confirmed
- **BA note:** New 2026-10-16: follow-up of Q-27 = B and Q-28 = A against Q-22 (conflict C-02). Applied 2026-10-16 (round 6): FR-25 and BR-22 (while open with no votes, no venue is leading and the page shows "Chưa có phiếu", as in M1 BR-08; the "no votes = tie between all venues" rule of BR-21 applies only at close); G-23 resolved; with Q-32, C-02 resolved.

### Q-34: After close, what happens until the organizer chooses among tied venues, and what if they never choose?
- **Question:** When the outing closes with several venues still tied after the tie-break, the organizer chooses the winner (Q-17). Until then the outing has no winning venue. Only the organizer's original browser can choose (Q-25), so they may forget or lose that browser. What should happen?
- **Why it matters:** Without a rule, an outing can stay without a winner forever: the team does not know where to go, and the outing never becomes a visit for the history and the tie-break.
- **Related:** FR-22, FR-12, FR-15, FR-16, BR-19, R-06, Q-17, Q-25
- **Options:**
  - A) The page shows "Closed – waiting for the organizer to choose" with the tied venues, and only the organizer sees the choice buttons. There is no deadline; if the organizer never chooses, the outing stays without a winner and never counts as a visit.
  - B) Same as A, but if the organizer has not chosen by the sitting time, the tied venue that was added to the venue list earliest wins automatically.
  - C) Same as A, but if the organizer has not chosen by the sitting time, one of the tied venues is picked at random.
  - D) Other (please describe)
- **Answer (original):** A) Chờ, không hạn
- **Answer (English):** A) Wait, no deadline (option A: page shows "Closed – waiting for the organizer to choose" with the tied venues; only the organizer sees the choice buttons; no deadline; if never chosen, no winner and never counts as a visit).
- **Status:** confirmed
- **BA note:** New 2026-10-16: follow-up of Q-17 = C combined with Q-25 = A. The BA assumes the choice is final once made (A-10); tell us if the organizer should be able to change it. Applied 2026-10-16 (round 6): FR-22 and BR-19 (after close with venues still tied, the page shows "Closed – waiting for the organizer to choose" (shown in Vietnamese) with the tied venues; only the organizer's browser sees the choice buttons; no deadline; without a choice the outing never gets a winner and never counts as a visit); G-24 resolved; R-06 accepted. What else the waiting page shows (headcount, Going names, vote counts as on the closed page, Q-20) is recorded as assumption A-13.

### Q-35: How does the organizer confirm the visit, and what if they never confirm?
- **Question:** A venue counts as visited only after the organizer confirms that the team really went (Q-18). When can the organizer confirm, can they also say "we did not go", and what happens if they never confirm (for example they forget, or lose their browser, Q-25)?
- **Why it matters:** Visits drive the tie-break and the visit counts. If confirmations are often missing, the tie-break keeps favouring venues the team actually went to.
- **Related:** FR-23, FR-16, FR-14, BR-20, R-06, Q-18, Q-25
- **Options:**
  - A) Once the outing has a winning venue, the organizer sees "Đã đi <venue> chưa?" with "Đã đi" (We went) / "Không đi" (We did not go). No deadline. Until "Đã đi" it does not count as a visit; "Không đi" means it never counts.
  - B) Same buttons, but available only from the sitting time onward (after the team should have gone). No deadline; unconfirmed outings do not count as visits.
  - C) Same as A, but if the organizer has not answered by the end of the day after the outing, it counts as visited automatically.
  - D) Other (please describe)
- **Answer (original):** B) Từ giờ ngồi trở đi
- **Answer (English):** B) From the sitting time onward (option B: same "Đã đi" / "Không đi" buttons, available only from the sitting time; no deadline; unconfirmed outings do not count as visits).
- **Status:** confirmed
- **BA note:** New 2026-10-16: follow-up of Q-18 = B combined with Q-25 = A. The BA assumes the answer is final once given (A-10). Applied 2026-10-16 (round 6): FR-23 and BR-20 (once the outing has a winning venue and its sitting time on the outing's date has passed, the organizer's browser sees "Đã đi <venue> chưa?" with "Đã đi" (We went) / "Không đi" (We did not go); no deadline; only "Đã đi" makes it a visit; "Không đi" means it never counts; unanswered outings do not count); G-25 resolved; R-06 accepted. If the organizer chooses the winner (Q-34) after the sitting time, the buttons appear as soon as the winner is chosen; for M1 outings closed at release the sitting time has passed, so they appear once there is a winner.

### Q-36: How does the history show closed outings whose visit is not confirmed?
- **Question:** The history lists closed outings (date, venue, number of people). Now a closed outing with a winner may be confirmed as visited, not yet confirmed, or (depending on Q-35) marked "we did not go", and it may also still be waiting for the organizer's choice (Q-34). Which closed outings should the history list, and how?
- **Why it matters:** Defines the history content and makes sure the visit counts match what people see in the history.
- **Related:** FR-15, FR-16, FR-23, BR-20, Q-18, Q-34, Q-35, Q-19
- **Options:**
  - A) List every closed, non-cancelled outing with its winning venue (or "chưa chọn quán" while the organizer has not chosen), and a mark: "Đã đi" (confirmed), "Chưa xác nhận" (not confirmed) or "Không đi" (did not go). Only "Đã đi" outings count in the visit counts.
  - B) List only outings confirmed as visited ("Đã đi"); the others are left out of the history.
  - C) Other (please describe)
- **Answer (original):** A) Liệt kê tất cả + dấu
- **Answer (English):** A) List all with marks (option A: every closed non-cancelled outing with its winner or "chưa chọn quán", marked "Đã đi" / "Chưa xác nhận" / "Không đi"; only "Đã đi" counts in visit counts).
- **Status:** confirmed
- **BA note:** New 2026-10-16: follow-up of Q-18 = B. Cancelled outings in the history are asked separately in Q-19. Applied 2026-10-16 (round 6): FR-15, FR-16 and new BR-26 (the history lists every closed, non-cancelled outing with its date, winning venue (or "chưa chọn quán" while the organizer has not chosen) and number of people, marked "Đã đi", "Chưa xác nhận" or "Không đi"; cancelled outings are also listed, marked cancelled, per Q-19; visit counts include "Đã đi" outings only); G-26 resolved. An outing still waiting for the organizer's choice is marked "Chưa xác nhận" (it cannot be confirmed without a winner), recorded as assumption A-14. Where the history is shown and its order: Q-30.

<!-- Status values: open | answered | confirmed | deferred
     answered  = PM recorded an answer, BA has not processed it
     confirmed = BA applied it to requirements.md
     deferred  = stakeholder agreed to postpone; reason required in BA note -->
