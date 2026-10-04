# engineering-baseline

A skill that sets up and enforces an engineering baseline for AI-assisted coding: shared rules for every AI tool (`AGENTS.md`), an API contract, a test scaffold and CI. Each of us runs it in our own project and owns the result.

## Stack
FastAPI + PostgreSQL (SQLAlchemy 2.0, Alembic) · React + Vite + TypeScript + Tailwind · JWT auth · pytest + Vitest · Docker Compose · GitHub Actions · AWS (ECS Fargate, RDS, S3 + CloudFront).

The full definition lives in `engineering-baseline/stack.md`. It is the only place the stack is defined; change it there and everything else follows.

## Install

**Claude Code**: copy the folder into your project or your user skills:
```bash
# this project only
mkdir -p .claude/skills && cp -r engineering-baseline .claude/skills/
# or every project
mkdir -p ~/.claude/skills && cp -r engineering-baseline ~/.claude/skills/
```
Then say something like "set up the engineering baseline for this project". It also triggers when you start a new project or ask for project rules.

**claude.ai**: upload `engineering-baseline.skill` under Settings → Capabilities → Skills.

**Cursor, Codex, Copilot or anything else**: copy the folder into your project and prompt:
> Read `engineering-baseline/SKILL.md` and follow Phase 1.

## What you get
After Phase 1 your repo has `AGENTS.md`, `CLAUDE.md`, `docs/contract.md`, `tests/`, `.github/workflows/ci.yml` and `.env.example`. Review `AGENTS.md` and `docs/contract.md` before writing any feature code. After that, `AGENTS.md` does the ongoing work, because Claude Code, Codex, Cursor and Copilot all read it.

## Day to day
- One module per branch; merge via PR when CI is green.
- Endpoint changes go into `docs/contract.md` first.
- If the AI breaks the same rule twice, sharpen the rule in `AGENTS.md` instead of correcting it in chat.
