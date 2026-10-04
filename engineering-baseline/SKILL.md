---
name: engineering-baseline
description: Set up and enforce an engineering baseline for AI-assisted (vibe coding) projects so AI-generated code stays consistent and the backend stays under control. Creates AGENTS.md (shared rules for every AI coding tool), CLAUDE.md, an API contract (contract.md), a test scaffold and a CI workflow, then enforces them while coding. Use whenever someone starts a new project with Claude Code, Cursor, Codex or similar tools, sets up a repo, asks for CLAUDE.md / AGENTS.md / .cursorrules / project rules, defines API conventions, or complains that AI output is inconsistent, drifting, or breaking the backend.
---

# Engineering baseline for AI coding

AI coding tools drift: each session picks its own naming, response format and file layout, and quietly breaks things that worked. A baseline fixes the rules before any feature code exists and makes every tool read them. It has four parts, and all four are needed:

1. **AGENTS.md**: the rules every AI tool reads before working.
2. **docs/contract.md**: the API contract. One request/response/error format, so frontend and backend never disagree.
3. **tests/**: one test file per resource. The automatic check that AI didn't break something.
4. **.github/workflows/ci.yml**: runs the tests on every push and PR. Without it, "tests pass" is just the agent's word.

Spec (stack, data models, structure) and module-by-module iteration live inside AGENTS.md, so there are only two documents to maintain.

## Phase 1: set up the baseline

### 1. Gather inputs
The stack and conventions are defined in `stack.md` (next to this file). Read it first.

- Every filled-in row in `stack.md` is fixed. Do not ask about it, question it, or propose alternatives.
- Ask only about rows marked `TBD` or still showing a `<...>` placeholder. If `stack.md` is entirely unfilled, ask for the whole stack before generating anything. Never assume a stack.
- Then read whatever exists in the project (PRD, README, existing code) and ask about the project itself: what it does, who uses it, its core entities, and which resource to build first.
- Ask which AI tools this person uses (Claude Code, Cursor, Codex, Copilot, others), so you create only the pointer files they need.

### 2. Generate the files
Use the templates in `templates/`. Fill every section from `stack.md` and the answers above; write `TBD` where a decision is genuinely open rather than inventing one.

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Single source of truth for rules. From `templates/AGENTS.md` |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude Code loads the same rules |
| `.cursor/rules/baseline.mdc` | Only if they use Cursor; points to AGENTS.md (template at the end of `templates/AGENTS.md`) |
| `docs/contract.md` | API contract. From `templates/contract.md` |
| `tests/` | Test folder, shared fixtures, and one example test for the first resource, following `templates/testing.md` |
| `.github/workflows/ci.yml` | From `templates/ci.yml`, adapted to the stack (remove jobs for layers the project doesn't have) |
| `docker-compose.yml` | Local Postgres (and backend) for development and tests, per `stack.md` |
| `.env.example` | Every environment variable the project reads, with placeholder values |

Also implement the overrides listed under "Framework defaults that conflict with the contract" in `stack.md` as part of the scaffold, with a test for each, so the contract holds from the first endpoint.

Keep rules in AGENTS.md only. Every other rule file points to it, so the tools can never disagree.

### 3. Review gate
Stop after generating the files. Ask the human to review AGENTS.md and contract.md. Write no feature code until they approve.

## Phase 2: enforce while coding

Follow these on every task. They are also written into AGENTS.md so other tools follow them too:

- **Read first.** Before any change, read AGENTS.md and the relevant part of contract.md.
- **One module at a time.** Design → generate → human review → test → merge. Work on a branch per module and merge it via a PR once tests pass in CI. Finish one module before starting the next.
- **Contract first.** A new or changed endpoint is written into contract.md and approved before it is implemented.
- **Tests with code.** Every endpoint ships with its tests. Run the full test suite before calling a task done. Failing tests = not done.
- **Never weaken tests** to make them pass. If a test is wrong, say so and ask.
- **Contract beats framework.** If the framework's default behavior (status codes, error shape, field casing) differs from the contract, override the framework.
- **Stay in scope.** Don't touch files unrelated to the task; don't add dependencies without asking.
- **Update the baseline, not the chat.** When AI breaks the same rule twice, add or sharpen that rule in AGENTS.md. A correction given only in chat is forgotten next session.

## When the baseline must change
Stack, contract format or structure changes are deliberate: propose the change, get approval, update AGENTS.md / contract.md, record it in the contract's change log, then update code and tests together.
