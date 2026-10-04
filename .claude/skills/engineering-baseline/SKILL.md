---
name: engineering-baseline
description: Set up and enforce an engineering baseline for AI-assisted (vibe coding) projects so AI-generated code stays consistent and the backend stays under control. Creates AGENTS.md (shared rules for every AI coding tool), CLAUDE.md, an API contract (contract.md) and a test scaffold, then enforces them while coding. Use whenever someone starts a new project with Claude Code, Cursor, Codex or similar tools, sets up a repo, asks for CLAUDE.md / AGENTS.md / .cursorrules / project rules, defines API conventions, or complains that AI output is inconsistent, drifting, or breaking the backend.
---

# Engineering baseline for AI coding

AI coding tools drift: each session picks its own naming, response format and file layout, and quietly breaks things that worked. A baseline fixes the rules before any feature code exists and makes every tool read them. It has three parts, and all three are needed:

1. **AGENTS.md**: the rules every AI tool reads before working.
2. **docs/contract.md**: the API contract. One request/response/error format, so frontend and backend never disagree.
3. **tests/**: one test file per resource. The only automatic check that AI didn't break something.

Spec (stack, data models, structure) and module-by-module iteration live inside AGENTS.md, so there are only two documents to maintain.

## Phase 1: set up the baseline

### 1. Gather inputs
Read whatever exists first (PRD, README, existing code). Then ask only for what is missing. Never assume a stack.

- Language and framework (backend, frontend)
- Database and ORM / migration tool
- Auth method (e.g. OAuth providers, sessions, JWT)
- Test framework
- Hosting / runtime, if decided
- Which AI tools the team uses (Claude Code, Cursor, Codex, Copilot, others)

### 2. Generate the files
Use the templates in `templates/`. Fill every section from the inputs; write `TBD` where a decision is genuinely open rather than inventing one.

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Single source of truth for rules. From `templates/AGENTS.md` |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude Code loads the same rules |
| `.cursor/rules/baseline.mdc` | Only if the team uses Cursor; points to AGENTS.md (template at the end of `templates/AGENTS.md`) |
| `docs/contract.md` | API contract. From `templates/contract.md` |
| `tests/` | Test folder plus one example test for the first resource, following `templates/testing.md` |

Keep rules in AGENTS.md only. Every other rule file points to it, so the tools can never disagree.

### 3. Review gate
Stop after generating the files. Ask the human to review AGENTS.md and contract.md. Write no feature code until they approve.

## Phase 2: enforce while coding

Follow these on every task, and they are also written into AGENTS.md so other tools follow them too:

- **Read first.** Before any change, read AGENTS.md and the relevant part of contract.md.
- **One module at a time.** Design → generate → human review → test → commit. Finish and commit one module before starting the next. Tag each finished module (`module/<name>`) so it can be rolled back.
- **Contract first.** A new or changed endpoint is written into contract.md and approved before it is implemented.
- **Tests with code.** Every endpoint ships with its tests. Run the full test suite before calling a task done. Failing tests = not done.
- **Never weaken tests** to make them pass. If a test is wrong, say so and ask.
- **Stay in scope.** Don't touch files unrelated to the task; don't add dependencies without asking.
- **Update the baseline, not the chat.** When AI breaks the same rule twice, add or sharpen that rule in AGENTS.md. A correction given only in chat is forgotten next session.

## When the baseline must change
Stack, contract format or structure changes are deliberate: propose the change, get approval, update AGENTS.md / contract.md, record it in the contract's change log, then update code and tests together.
