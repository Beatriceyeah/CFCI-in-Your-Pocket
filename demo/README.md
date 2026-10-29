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

Sign-in is simulated: pick a role on the login page and continue. Use the **Demo:** pill in the header to switch
between roles at any time.

## What each role can do

| Role | What to try |
| --- | --- |
| **Investor or alum** | Pick the directions you care about. Browse ventures by swiping or as a list, and search. Open a venture's overview. Mark interest, save to your shortlist, and share your take on the business lenses (Problem, Market, Edge and more). You can pick "not sure". Drafts autosave. Request an introduction to a team. |
| **Student team** | See your product's card and edit it. Add teammates. Read feedback grouped by giver or by lens, and mark each comment Noted, Will address or Not now. See who asked to connect. |
| **CFCI staff** | Dashboard of views, interest rate and scores per product, with a lens heatmap. Portfolio: upload a project, edit a listing, archive or restore it, send update reminders. Feature a venture for a set period. Review introduction requests and share a subset of products for feedback. |

## How it behaves

- **Browse order** is the same for everyone: ventures CFCI is featuring (until their end date), then ventures
  matching the viewer's interests, then everything else. Within each group, the most recently updated listing
  comes first. Nothing is hidden. See `src/lib/order.ts`.
- **Views** on the dashboard count overview opens. **Interest rate** is the share of shown products marked
  interested.
- Engagement numbers (views, evaluations, interest) are generated from a fixed seed so the dashboard has
  something to show. Anything you do in the demo is added on top.
- State is saved in your browser's `localStorage`. To start over, use **Reset demo data** on the Me tab.

## Sample data

- Products come from the IE790 Executive Summaries (`src/data/products.ts`).
- Staff, student and viewer names and all emails are placeholders.
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
