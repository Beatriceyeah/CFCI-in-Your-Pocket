# AGENTS.md

Rules for every AI coding tool on this project. Read this file and docs/contract.md before every task.

## Project
<One or two sentences: what this is and who uses it.>

## Stack (locked)
Do not add, swap or upgrade dependencies without asking.

<Copy the Stack table from stack.md, filled in.>

## Data models
<Each core entity: fields, types, relations. Keep it short; the schema in code is the source of truth once it exists.>

## Directory structure
<Copy the directory layout from stack.md.>

Put new files where this structure says. Don't create new top-level folders without asking.

## Backend rules
- **Layers:** HTTP layer → services → data access. No business logic in route handlers, no DB calls outside the data layer.
- **Contract:** every endpoint matches docs/contract.md exactly: paths, field names, response envelope, error codes, pagination.
- **Contract beats framework:** where the framework's default differs from the contract, override the framework. Known overrides for this stack:
  <copy the list from stack.md, "Framework defaults that conflict with the contract">
- **Validation:** validate every input at the HTTP layer with the shared schemas. Never trust client input.
- **Errors:** return only the error format and codes defined in the contract. Never leak stack traces or raw DB errors.
- **Auth:** protected endpoints go through the shared auth middleware/dependency. Never check auth ad hoc inside a handler.
- **Database:** schema changes only through migrations. Never edit the database by hand.
- **Config and secrets:** read from environment variables. Never hardcode secrets or commit `.env`; keep `.env.example` up to date.
- **Logging:** use the shared logger; no stray print/console.log. Never log secrets or personal data.

## Frontend rules
- **One API client:** every HTTP call goes through the single client module (`<path from directory layout, e.g. frontend/src/api/>`). No `fetch`/`axios` calls inside components.
- **Types mirror the contract:** request/response types live in the API client and match docs/contract.md field-for-field, including casing. When the contract changes, update these types in the same change.
- **Errors:** the API client unwraps the contract envelope; components get `data` or a typed error, and show the error's `message`, never raw responses.
- **Components:** one component per file; pages compose components and own data fetching; components stay presentational where possible.
- **Styling:** use <styling choice from stack.md> only. Don't mix in other styling approaches.
- **State:** keep state local unless it is shared; don't add a state library without asking.

## Coding conventions
- Naming: <code naming from stack.md>. JSON fields: <JSON casing from stack.md>.
- One responsibility per file; split files that grow past ~300 lines.
- No dead code, commented-out blocks or unused imports.
- Match the style of the surrounding code over personal preference.

## Workflow
1. Read this file and the relevant contract section.
2. Work on one module at a time, on its own branch. State a short plan before writing code.
3. New or changed endpoint → update docs/contract.md first and get approval.
4. Write the code and its tests together.
5. Run the full test suite locally. All tests must pass.
6. Commit with a clear message, open a PR, and merge only when CI is green.

## Never
- Add or upgrade dependencies without asking.
- Change the contract, the stack or the directory structure without approval.
- Delete or weaken tests to make them pass.
- Disable, skip or edit the CI workflow to get a green build.
- Edit files unrelated to the task.
- Hardcode secrets, URLs or credentials.

## Definition of done
Matches the contract · tests written and passing locally and in CI · no new lint errors · contract, frontend API types and this file updated if anything changed.

<!--
Pointer files for other tools (create only what this person uses):

CLAUDE.md:
@AGENTS.md

.cursor/rules/baseline.mdc:
---
description: Project baseline
alwaysApply: true
---
Follow all rules in AGENTS.md at the repo root. Read it and docs/contract.md before every task.
-->
