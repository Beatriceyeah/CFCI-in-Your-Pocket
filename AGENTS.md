# AGENTS.md

Rules for every AI coding tool on this project. Read this file and docs/contract.md before every task.

## Project
CFCI in Your Pocket: a mobile-first portfolio app where Duke student teams list live products and external users (alumni, investors) browse them one at a time, swipe, and leave quick feedback. This MVP is an interactive demo on sample data so CFCI can confirm style and core flow. Product spec: the MVP PRD (Login, Onboarding, Product Browse, My Dashboard).

## Stack (locked)
Do not add, swap or upgrade dependencies without asking.

| Layer | Choice |
| --- | --- |
| Backend language + framework | Python 3.12 + FastAPI (async), Pydantic v2 for schemas |
| Frontend framework | React + Vite + TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 |
| ORM / migrations | SQLAlchemy 2.0 (async, typed `Mapped[...]` models) + Alembic |
| Auth | JWT Bearer access tokens (PyJWT). **MVP:** mock sign-in (see below); bcrypt passwords not used |
| Backend tests | pytest + pytest-asyncio + httpx `AsyncClient` |
| Frontend tests | Vitest + React Testing Library |
| Package managers | pip + `requirements.txt` (backend), npm (frontend) |
| Runtime versions (for CI) | Python 3.12, Node 22 |
| Local dev | Docker Compose (Postgres + backend); frontend via `npm run dev` |
| CI | GitHub Actions: tests, lint and build on every push and PR |
| Hosting | AWS: backend on ECS Fargate, database on RDS PostgreSQL, frontend on S3 + CloudFront |

### Auth in the MVP
The PRD's sign-in options are Duke NetID, LinkedIn and Google. In the MVP these are **mocked**: the login page shows the three buttons, `POST /api/v1/auth/demo-login` picks a demo user for the chosen provider and returns a real JWT. `duke_netid` → role `student`; `linkedin` / `google` → role `external`. Every other endpoint authenticates only through the JWT, so swapping in real OAuth later changes only the auth route and service. Never add real OAuth, passwords or provider SDKs without approval.

## Data models
| Entity | Fields | Notes |
| --- | --- | --- |
| User | id (UUID), name, email, auth_provider (`duke_netid` \| `linkedin` \| `google`), role (`student` \| `external`), interested_directions (list of strings), onboarded (bool), created_at | Role comes from provider |
| Product | id, owner_id → User, name, one_liner, cover_image_url, demo_video_url, brief, category, status (`pending_review` \| `live` \| `archived`), created_at, updated_at | Only `live` products appear in Browse. New uploads start `pending_review` |
| Swipe | id, user_id → User, product_id → Product, direction (`left` \| `right`), created_at | Unique per (user, product). Right = Interested Products |
| Feedback | id, user_id, product_id, would_use, would_invest, would_intro (bools), comment (nullable), created_at | Only after a right swipe. One per (user, product) |

Directions / categories (MVP set): `research`, `health`, `software`, `hardware`. Media are URLs to sample assets; file upload is TBD.

## Directory structure
```
backend/
  app/
    main.py        # app factory: routers, middleware, exception handlers
    core/          # config (env vars), security (JWT), errors, logging
    routes/        # HTTP layer only: parse, validate, call service, return envelope
    services/      # business logic
    data/          # SQLAlchemy models + repositories; the only place that touches the DB
    schemas/       # Pydantic request/response models
  migrations/      # Alembic
  tests/
    conftest.py    # test client, test DB, auth helper
  Dockerfile
  requirements.txt
frontend/
  src/
    api/           # the single API client + contract types; all HTTP calls go through here
    components/
    pages/
docs/contract.md
scripts/           # local dev helpers (e.g. test DB init for Docker Compose)
docker-compose.yml
.env.example
.github/workflows/ci.yml
```

Put new files where this structure says. Don't create new top-level folders without asking. `engineering-baseline/` and `.claude/skills/` hold the skill itself, not app code.

## Backend rules
- **Layers:** routes → services → data. No business logic in route handlers, no DB calls outside `data/`.
- **Contract:** every endpoint matches docs/contract.md exactly: paths, field names, response envelope, error codes, pagination.
- **Contract beats framework:** where FastAPI's default differs from the contract, override it. Already implemented in `app/core/errors.py` and `app/core/security.py`, each with a test in `tests/test_contract_overrides.py`:
  - Validation errors → **400** `VALIDATION_ERROR` (never 422), field errors in `details`.
  - `HTTPException` (including routing 404/405) → contract envelope with the matching code.
  - Unhandled exceptions → **500** `INTERNAL_ERROR`; traceback logged server-side, never returned.
  - `redirect_slashes=False`; paths defined exactly as the contract writes them.
  - Every route returns `Envelope[T]` or `PaginatedEnvelope[T]` as `response_model`.
  - Missing/invalid token → **401** `UNAUTHENTICATED`; wrong role → **403** `FORBIDDEN` (custom dependency, not `HTTPBearer`).
- **Validation:** validate every input at the route layer with the schemas in `schemas/`. Never trust client input.
- **Errors:** raise `ApiError(code, message, details)` from services; return only contract codes. Never leak stack traces or raw DB errors.
- **Auth:** protected endpoints use `CurrentUser`, `StudentUser` or `require_role(...)` from `app/core/security.py`, and `Pagination` from `app/schemas/envelope.py` for list endpoints. Never check auth ad hoc inside a handler.
- **Database:** schema changes only through Alembic migrations. Never edit the database by hand.
- **Config and secrets:** read from environment variables via `app/core/config.py`. Never hardcode secrets or commit `.env`; keep `.env.example` up to date.
- **Logging:** use `app/core/logging.py`; no stray `print`. Never log tokens or personal data.

## Frontend rules
- **One API client:** every HTTP call goes through `frontend/src/api/`. No `fetch`/`axios` calls inside components.
- **Types mirror the contract:** request/response types live in `frontend/src/api/types.ts` and match docs/contract.md field-for-field, in snake_case. When the contract changes, update these types in the same change.
- **Errors:** the API client unwraps the envelope; components get `data` or an `ApiError`, and show its `message`, never raw responses.
- **Components:** one component per file; pages compose components and own data fetching; components stay presentational where possible.
- **Styling:** Tailwind only, using the theme tokens in `frontend/src/index.css` (Duke palette from the PRD). Don't mix in other styling approaches or hardcode hex values in components.
- **Mobile-first:** design for a phone viewport first; desktop keeps the single focused card, not a grid (PRD section 5).
- **State:** keep state local unless it is shared; don't add a state library without asking.

## Coding conventions
- Naming: snake_case (Python), camelCase for TS variables/functions, PascalCase for classes, types and React components. JSON fields: snake_case everywhere, including frontend API types (no casing conversion layer).
- One responsibility per file; split files that grow past ~300 lines.
- No dead code, commented-out blocks or unused imports.
- Match the style of the surrounding code over personal preference.

## Workflow
1. Read this file and the relevant contract section.
2. Work on one module at a time, on its own branch (`module/<name>`). State a short plan before writing code.
3. New or changed endpoint → update docs/contract.md first and get approval.
4. Write the code and its tests together.
5. Run the full test suite locally (`pytest` in `backend/`, `npx vitest run` in `frontend/`). All tests must pass.
6. Commit with a clear message, open a PR, and merge only when CI is green.

Module order: 1 Products → 2 Auth + onboarding → 3 Browse (swipes + feedback) → 4 My Dashboard → 5 frontend screens per PRD flow.

## Never
- Add or upgrade dependencies without asking.
- Change the contract, the stack or the directory structure without approval.
- Delete or weaken tests to make them pass.
- Disable, skip or edit the CI workflow to get a green build.
- Edit files unrelated to the task.
- Hardcode secrets, URLs or credentials.

## Definition of done
Matches the contract · tests written and passing locally and in CI · no new lint errors · contract, frontend API types and this file updated if anything changed.
