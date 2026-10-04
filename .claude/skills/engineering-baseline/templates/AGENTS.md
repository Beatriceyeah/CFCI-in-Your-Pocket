# AGENTS.md

Rules for every AI coding tool on this project. Read this file and docs/contract.md before every task.

## Project
<One or two sentences: what this is and who uses it.>

## Stack (locked)
Do not add, swap or upgrade dependencies without asking.

| Layer | Choice |
| --- | --- |
| Backend | <language + framework> |
| Frontend | <framework> |
| Database / ORM | <db + orm, migration tool> |
| Auth | <method / providers> |
| Tests | <framework> |
| Hosting | <runtime or TBD> |

## Data models
<Each core entity: fields, types, relations. Keep it short; the schema in code is the source of truth once it exists.>

## Directory structure
```
<root>/
  backend/
    routes/      # HTTP layer only: parse, validate, call service, return
    services/    # business logic
    data/        # database access only (models, repositories)
    schemas/     # request/response schemas, shared with validation
  frontend/
  docs/contract.md
  tests/
```
Put new files where this structure says. Don't create new top-level folders without asking.

## Backend rules
- **Layers:** routes → services → data. No business logic in routes, no DB calls outside `data/`.
- **Contract:** every endpoint matches docs/contract.md exactly: paths, field names, response envelope, error codes.
- **Validation:** validate every input at the route layer with the schemas in `schemas/`. Never trust client input.
- **Errors:** return only the error format and codes defined in the contract. Never leak stack traces or raw DB errors.
- **Auth:** protected endpoints go through the shared auth middleware. Never check auth ad hoc inside a handler.
- **Database:** schema changes only through migrations. Never edit the database by hand.
- **Config and secrets:** read from environment variables. Never hardcode secrets or commit `.env`; keep `.env.example` up to date.
- **Logging:** use the shared logger; no stray print/console.log. Never log secrets or personal data.

## Coding conventions
- Naming: <e.g. snake_case for Python, camelCase for JS/TS, PascalCase for classes and components>. JSON fields: <casing from contract>.
- One responsibility per file; split files that grow past ~300 lines.
- No dead code, commented-out blocks or unused imports.
- Match the style of the surrounding code over personal preference.

## Workflow
1. Read this file and the relevant contract section.
2. Work on one module at a time. State a short plan before writing code.
3. New or changed endpoint → update docs/contract.md first and get approval.
4. Write the code and its tests together.
5. Run the full test suite. All tests must pass.
6. Commit with a clear message; tag finished modules `module/<name>`.

## Never
- Add or upgrade dependencies without asking.
- Change the contract, the stack or the directory structure without approval.
- Delete or weaken tests to make them pass.
- Edit files unrelated to the task.
- Hardcode secrets, URLs or credentials.

## Definition of done
Matches the contract · tests written and passing · no new lint errors · contract and this file updated if anything changed.

<!--
Pointer files for other tools (create only what the team uses):

CLAUDE.md:
@AGENTS.md

.cursor/rules/baseline.mdc:
---
description: Project baseline
alwaysApply: true
---
Follow all rules in AGENTS.md at the repo root. Read it and docs/contract.md before every task.
-->
