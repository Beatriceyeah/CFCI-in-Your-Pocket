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
| **Investor or alum** | Browse ventures by swiping or as a list, and search. Tap the eye to show interest and see a thank-you in the middle of the screen. Open a venture: each section has a place to share your view right beside the data it is about (problem, market, edge, traction), and it saves as you go. Nothing is required; if you miss a lens you get a reminder before sending. Request an introduction from the card, the list or the overview. Update a take you already shared from the Shortlist. Skip everything and Browse loops back around. Customize interests under Me (optional). |
| **Student team** | See your product's card and post an update, including a team photo and slide deck. Read feedback grouped by giver or by lens, with partly completed takes marked. See a countdown if your listing is close to being delisted. Add teammates and see who asked to connect. |
| **CFCI staff** | Dashboard: feedback rate, written comments and an engagement score, plus views, interest rate (before and after an update) and average score per product, with a lens heatmap. Portfolio: upload a project, edit, archive or restore, remind teams, see delisted listings. Feature a venture for a set period. Review introduction requests and share a subset of products. |

## How it behaves

- **Browse order** is the same for everyone: ventures CFCI is featuring (until their end date), then ventures
  matching the viewer's interests, then everything else. Within each group, the most recently updated listing
  comes first. Nothing is hidden. See `src/lib/order.ts`.
- **Updated tag.** When a team posts an update, its card shows an "Updated" tag for a week, and viewers who already
  looked at it see an alert at the top of Browse.
- **Delisting.** A listing not updated in 30 days gets a reminder. After 60 days it leaves Browse until the team posts an
  update, and the students see a notice on My product.
- **Partly completed feedback** saves automatically and is already visible to the team and to staff, marked as partial.
- **Engagement score:** a view or an interest counts 1; a rating, a written comment or an introduction request counts 2.
- **Views** on the dashboard count overview opens. **Interest rate** is the share of shown products marked
  interested.
- Engagement numbers (views, evaluations, interest) are generated from a fixed seed so the dashboard has
  something to show. Anything you do in the demo is added on top.
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
