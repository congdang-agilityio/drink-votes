# How I understand it: Outing QR code (mã QR của kèo)

Round 3, 2026-10-16. All your answers (Q-01..Q-07) are applied; no questions are left. Please
correct anything that is wrong before you sign off.

## What you asked for
Add a feature that generates a QR code for an outing (kèo), so that other members can scan it
with their phone and vote.

## How I understand it now
- Each outing has its own QR code. The code contains the outing's normal link (the one you
  paste into chat today), so scanning it is the same as opening that link. It never changes.
- The code is always shown on the outing page, below the outing details. There is no extra
  button or separate page, and it is not shown anywhere else (not on the home page list).
  After creating an outing you land on its page, so the code is right there.
- Only the code itself is shown there: no caption, no link as text and no "Sao chép link"
  (Copy link) button.
- Anyone who opens the outing sees the code and can show it to colleagues, not only the
  organizer (chủ kèo).
- The code is shown only while the outing is open. Once the outing is closed, waiting for the
  organizer to choose, or cancelled, its page no longer shows the code.
- There is no download button; showing it on screen is enough (people can take a screenshot).
- Scanning opens the normal outing page. Voting does not change: the member taps "Đi" (Going)
  and then picks one venue, as today. Scanning never marks anyone as Going.

## Still assumed (tell me if this is wrong)
- Members scan with their phone's normal camera; nobody needs to install anything.
- Someone who has never used the app and scans the code is first asked for their name, as
  today, and then lands on the outing automatically, without scanning again.
- A screenshot of the code taken earlier still opens the outing after it has closed; the page
  then simply shows the result (closed, waiting or cancelled), without voting buttons and
  without the code.
- The QR code is not secret: anyone who sees it can open the outing, just like anyone with the
  link today (no login, one shared space).
- A QR code on the test site (staging) opens the test site; one on the real site (production)
  opens the real site.
- The page with the code still works well on a phone screen; the code is large enough to scan
  from a phone or laptop screen at arm's length.

## Deferred
- Nothing.

## Not included
- Jumping straight to the vote part, or marking people "Đi" automatically when they scan.
- A "show QR" button, a full-screen code, or a separate QR page.
- A caption, the link as text, or a copy-link button next to the code.
- The code on closed, waiting or cancelled outings, or on the home page list.
- Downloading the code as an image, printing layouts, posters, or sending it by Slack or email.
- QR codes for anything other than an outing (venues, the home page).
- Any change to the voting, closing or tie-break rules.
