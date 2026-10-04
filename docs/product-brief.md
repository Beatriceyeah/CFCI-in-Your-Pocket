# CFCI New Product Brief (V1)

> Source of truth: [Google Doc](https://docs.google.com/document/d/1Ks4aG-xtOZq4VIW0oH02NSpx_lZT0FLDAAIqeWPAzAE/edit). Background context only: for what the MVP builds, [prd.md](prd.md) wins. Copied 2026-10-04.

## Summary
A public-facing portfolio of student products developed through the Christensen Center (CFCI), so that external stakeholders such as alumni and investors can browse products, rate them, and leave feedback. Their engagement shows CFCI which products are attracting interest and where to direct funding and market attention. This semester we build from scratch, ship a high-fidelity prototype as early as possible, and iterate through user testing.

- **Live, ongoing, relatively mature / high-bar products > toy projects**
- **Portfolio-style > intake generation**

## Background and what changed
Last semester's direction focused on people pitching ideas and on matching student talent with opportunities. CFCI's needs have changed. The project now centers on products rather than people, and it starts from a clean slate instead of extending the previous build. The goal is to give students a way to show their products to the world. This fits CFCI's broader model: Duke's talent pool combined with technology produces products, and CFCI intakes ideas, onboards them, and manages them as a portfolio. This app is the visible layer of that portfolio.

## Users
- **CFCI (and CFCI staff):** need a platform for gathering and displaying high-quality feedback to foster engagement with the public beyond CFCI.
- **External viewers:** alumni, investors, and other outside stakeholders who browse, rate, and comment on products.
- **Student product teams:** submit and maintain their product listings.

## Product concept
Viewers see one product at a time, engage with it (rate, comment, suggest), and move to the next, similar to a dating app. The interface stays minimal, without many tabs. There is no matching algorithm; all approved products are shown.

## Core features for the first version
- **CFCI staff end:**
  - **Collaborative listings:** student teams create and edit their product listing; CFCI staff approve it before it goes live.
  - **Entry filter:** not every product is listed. A standard assessment (typical product assessment plus a risk evaluation, producing a score) decides what qualifies. *(TBD: evaluation before acceptance by LLM + CFCI staff check, or only through external feedback?)*
- **External user end:**
  - **Login for viewers:** used to count unique external visitors.
  - **Viewer engagement:** one-at-a-time browsing with ratings, comments, and suggestions.
- **Student end:**
  - **Product intake**
  - **Freshness:** automatic reminder emails to teams that have not updated their listing in a while. Inactive listings move to an archive page rather than being deleted, so the main page stays current.

## Success metrics
- **Primary:** number of external users engaging with the portfolio (unique visitors, tracked through login).
- **Engagement quality:** volume of ratings, comments, and suggestions per product, as a signal for where to invest funding and attention.
- **Portfolio health:** share of listings updated recently (to be defined with CFCI).

## Out of scope for now
- Matching algorithms between students, products, and viewers.
- Extending last semester's staff-facing build.

## To be discussed
- What's the user pain point? Is it for CFCI, external users, or both?
- Engagement mechanism: why would external users use the product and leave comments?
  - Lower interaction cost through pre-designed options (e.g. would use / would invest / would intro someone).
- Filtering: how are high-quality products selected? If an LLM is the first-round judge, what are the evaluation metrics?
- AI-generated product portfolio: design, layout, which information to keep. *(TBD: is the displayed portfolio AI-generated or uploaded by students?)*
