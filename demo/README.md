# CFCI in Your Pocket: interactive demo

A frontend-only, mobile-first demo of CFCI in Your Pocket. It shows how the three groups of users would use the
app, using the 16 IE790 Executive Summary products as sample data. There is no backend: all data is sample data
and nothing you do leaves your browser.

## Try it

**Without installing anything.** Open `Beatrice - CFCI in Your Pocket.html` in this folder (download it from
GitHub, then double-click). It is a single self-contained file; it only needs internet for the fonts.

**Run it locally.** Needs Node 20 or newer.

```bash
npm install
npm run dev      # then open the address it prints
```

Each kind of user has their own link, so nobody has to pick a role:

| Who | Link |
| --- | --- |
| Investor or alum | `#/investor` (the default) |
| Student team | `#/student` |
| CFCI staff | `#/staff` |

For example, `Beatrice - CFCI in Your Pocket.html#/staff`, or `http://localhost:5173/#/staff` when running locally.
Sign-in is simulated. Once signed in, the **Demo:** pill in the header switches between roles for presentations.

## What each role can do

| Role | What to try |
| --- | --- |
| **Investor or alum** | Browse ventures by swiping or as a list, and search. Tap the eye (Review later) to save a venture to My reviews, or the cross (Not interested) to pass. Open a venture: each section has a place to share your view right beside the data it is about (problem, market, edge, traction), and it saves automatically, like a shared doc. Nothing is required. Request an introduction from the card, the list or the overview. Writing anything on a venture puts it in My reviews and takes it out of the feed; Review later is only for ventures you have not started on. Come back to anything under My reviews (Review later, Reviewed, Not interested) and change it. Ventures you passed on come round again at the end of Browse, with a short line under the card saying so (and, in the list, a "Passed before" tag); when nothing is left to show (everything saved or reviewed, or no search match), Browse says so and points you to My reviews. Customize interests under Me. |
| **Student team** | See your product's card and post an update, including a team photo and slide deck. Read feedback grouped by giver or by lens, with partly completed takes marked. See a countdown if your listing is close to being delisted. Add teammates and see who asked to connect. |
| **CFCI staff** | Dashboard: feedback rate, written comments and an engagement score, plus views, review-later rate (before and after an update) and average score per product, with a lens heatmap. Portfolio: upload a project, edit, archive or restore, remind teams, see delisted listings. Feature a venture for a set period. Review introduction requests and share a subset of products. |

## How it behaves

- **Browse order** is the same for everyone, and Browse does not run out on its own. First the ventures CFCI is
  featuring that you have not decided on, then ventures the team has updated since you last saw them (new to you, or
  passed on), then everything new to you (matching your interests first, most recently updated first), and last the
  ventures you passed on, oldest decision first, so they come round once more. Passing on one a second time is
  final: it stays under Not interested and is not shown again unless the team updates it. Undo puts it back. Ventures you saved or reviewed are not in the loop: they wait in My reviews. Nothing is
  hidden. See `src/lib/feed.ts` and `src/lib/order.ts`.
- **Updated tag.** When a team posts an update, its card shows a "Recently updated" tag for a week.
- **Updates to a venture you follow.** My reviews has three tabs: Review later, Reviewed and Not interested, and
  every row looks the same: cover, name, at most one mark, one line of text, then the buttons. When a team has updated
  a venture since you last looked, its row shows a green dot with "Recently updated" (softer green under Not
  interested), the team's one-line note instead of the tagline, and a "See what changed" button, and it moves to the
  top of its list. Reviewed is one list: updated first, then the rest with the most recently edited review on top
  (button "Edit"). It does not matter to you whether a review is complete; only the team and CFCI see that. The tab that holds an
  update shows a dot, and the My reviews icon counts them all. Opening one counts as looking, and the marks go away.
  Nothing is preset: a new viewer has no saved, reviewed or passed ventures, so My reviews is empty and every count
  starts at 0 until you act. To see an update, save or review a venture and use "Simulate a team update" (below).
- **What changed.** If you saved, reviewed or passed on a venture and the team has updated it since, its overview opens
  with a short "AI summary" of what changed (in the demo it is worked out from the team's note and the fields they
  edited). Closing the overview counts as having seen it. Your scores from before the update stay visible as a
  slightly darker box on the score you gave last time, and the new scores start blank. The parts the team changed (a new tagline, a rewritten problem, a new next step) are also marked in green in the overview, with a "Recently updated" tag on their section.
- **Delisting.** A listing not updated in 30 days gets a reminder. After 60 days it leaves Browse until the team posts an
  update, and the students see a notice on My product.
- **Feedback saves automatically**, like a shared doc, and is already visible to the team and to staff. It is marked
  "partially completed" until the three core lenses have an answer.
- **Engagement score:** a view or an interest counts 1; a rating, a written comment or an introduction request counts 2.
- **Views** on the dashboard count overview opens. **Review-later rate** is the share of shown products marked
  Review later.
- Engagement numbers (views, evaluations, interest) are generated from a fixed seed so the dashboard has
  something to show. Anything you do in the demo is added on top.
- **Simulate a team update.** To see an update without waiting for a team, save or review a venture: My reviews then
  shows a "For the demo" block with a "Simulate a team update" button (the same button is on the Me tab). It acts as if a team had
  just posted an update to a venture you follow (one you reviewed first, then one you saved, then one you passed on).
  It reworks the solution line and adds a next step, so My reviews shows a new update and the overview marks the
  changed parts. Handy for a demo; the summary and marks are generated the same way as for a real team update.
- State is saved in your browser's `localStorage`. To start over, use **Reset demo data** on the Me tab.

## Sample data

- Products come from the IE790 Executive Summaries (`src/data/products.ts`).
- Staff, student and viewer names and all emails are placeholders. Students are shown as "Student founder N" with a
  placeholder year; the team photos are placeholders until teams upload one.
- Cover images are generated gradients, not real product images.

## Not in this demo

Real authentication, a database or API, email delivery, file and video upload, and AI-assisted listing creation.
Introductions, reminders and shares are recorded in the demo's state only; nothing is actually sent.

## Project layout

```
src/data/        products, business lenses, users, seeded engagement
src/store/       reducer and context, persisted to localStorage
src/lib/         ranking, analytics, feedback and team helpers
src/pages/       one folder per role: external, team, admin
src/components/  shared UI (cards, sheets, evaluation form)
```

Built with React 19, Vite, TypeScript and Tailwind CSS v4.

```bash
npm test         # unit tests for the analytics helpers
npm run build    # type-check and production build
```

To regenerate the single HTML file, run `npm run build` and inline the files in `dist/assets/` into one page
along with the font links.
