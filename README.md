# CFCI in Your Pocket

Mobile-first app for the Christensen Center for Innovation (CFCI) at Duke. Student teams list the products they are
building, and external users (alumni and investors) browse them one at a time, swipe, and leave quick feedback. CFCI
staff keep the portfolio fresh and make introductions.

## What's in this repo

| Folder | What it is |
| --- | --- |
| `frontend/`, `backend/` | The MVP app: React + Vite + TypeScript, and a FastAPI + PostgreSQL API. Scope: Login, Onboarding, Product Browse, My Dashboard. |
| `demo/` | A frontend-only interactive demo of the fuller product vision for all three roles (investor or alum, student team, CFCI staff). No backend, runs on sample data. Self-contained; it does not share code with the app. |
| `docs/` | The API contract, the MVP PRD and the product brief. |
| `scripts/` | Local dev helpers. |

## Try the interactive demo

The quickest way to see the product. No setup:

- **Open in the browser:** <https://claude.ai/artifact/GmJiDSnmu4M7zVNzrtTCU1>
- **Or download the file:** `demo/Beatrice - CFCI in Your Pocket.html`, then double-click it.
- **Or run it locally:** `cd demo && npm install && npm run dev`

Pick a role on the login page (sign-in is simulated) and use the **Demo:** pill in the header to switch roles. Details
are in [`demo/README.md`](demo/README.md).

## Start here (for the MVP app)

- **AGENTS.md**: project rules, stack, data models and module order. Every AI coding tool reads it first.
- **docs/contract.md**: the API contract. Endpoint changes go here first.
- **docs/prd.md**: the MVP PRD (copy of the Google Doc). Background in docs/product-brief.md.

## Local dev

Copy `.env.example` to `.env`, then `docker compose up` (Postgres + backend). Frontend: `cd frontend && npm install && npm run dev`.

To populate Browse with sample live products for the demo (new student uploads otherwise start
`pending_review`, and there's no approval workflow yet): `pip install -r backend/requirements.txt`
then `DATABASE_URL=postgresql+asyncpg://app:app@localhost:5432/app python scripts/seed_sample_products.py`.
Dev database only — never point this at `app_test`.

## Claude skills

`.claude/skills/` holds the team's skills, loaded automatically by Claude Code in this repo:
- **engineering-baseline**: sets up and enforces the baseline. The stack is defined in `.claude/skills/engineering-baseline/stack.md`.
- **prd-writer**: writes PRDs in the team's standard structure.

## Day to day

- One module per branch; merge via PR when CI is green.
- If the AI breaks the same rule twice, sharpen the rule in `AGENTS.md` instead of correcting it in chat.
