# CFCI in Your Pocket

Mobile-first app where Duke student teams list live products and external users browse them, swipe, and leave quick feedback. The current version is the MVP demo.

## Start here
- **AGENTS.md**: project rules, stack, data models and module order. Every AI coding tool reads it first.
- **docs/contract.md**: the API contract. Endpoint changes go here first.
- **docs/prd.md**: the MVP PRD (copy of the Google Doc). Background in docs/product-brief.md.

## Local dev
Copy `.env.example` to `.env`, then `docker compose up` (Postgres + backend). Frontend: `cd frontend && npm install && npm run dev`.

## Claude skills
`.claude/skills/` holds the team's skills, loaded automatically by Claude Code in this repo:
- **engineering-baseline**: sets up and enforces the baseline. The stack is defined in `.claude/skills/engineering-baseline/stack.md`.
- **prd-writer**: writes PRDs in the team's standard structure.

## Day to day
- One module per branch; merge via PR when CI is green.
- If the AI breaks the same rule twice, sharpen the rule in `AGENTS.md` instead of correcting it in chat.
