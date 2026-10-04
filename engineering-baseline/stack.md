# Project stack

This is the ONLY place the stack is defined. Every template in this skill reads from it.
Every row below is decided and locked. A row marked `TBD` is genuinely undecided; the agent asks about TBD rows and nothing else.

## Stack
| Layer | Choice |
| --- | --- |
| Backend language + framework | Python 3.12 + FastAPI (async), Pydantic v2 for schemas |
| Frontend framework | React + Vite + TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 |
| ORM / migrations | SQLAlchemy 2.0 (async, typed `Mapped[...]` models) + Alembic |
| Auth | JWT Bearer access tokens (PyJWT) + passwords hashed with bcrypt |
| Backend tests | pytest + pytest-asyncio + httpx `AsyncClient` |
| Frontend tests | Vitest + React Testing Library |
| Package managers | pip + `requirements.txt` (backend), npm (frontend) |
| Runtime versions (for CI) | Python 3.12, Node 22 |
| Local dev | Docker Compose (Postgres + backend); frontend via `npm run dev` |
| CI | GitHub Actions: tests, lint and build on every push and PR |
| Hosting | AWS: backend as a Docker container on ECS Fargate, database on RDS PostgreSQL, frontend as a static build on S3 + CloudFront |

## Conventions
| Convention | Choice |
| --- | --- |
| Code naming | snake_case (Python), camelCase for TS variables/functions, PascalCase for classes, types and React components |
| JSON field casing | snake_case everywhere, including the frontend's API types (no casing conversion layer) |
| ID type | UUID strings |
| Auth header | `Authorization: Bearer <token>` |
| Backend test file pattern | `backend/tests/test_<resource>.py` |
| Frontend test file pattern | `frontend/src/**/<name>.test.ts(x)` next to the code under test |
| Lint / format | ruff (backend, listed in `requirements.txt` so CI has it), ESLint + Prettier (frontend) |

## Directory layout
```
backend/
  app/
    main.py        # app factory: routers, middleware, exception handlers
    core/          # config (env vars), security (JWT, hashing), errors, logging
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
docker-compose.yml
.env.example
.github/workflows/ci.yml
```

## Framework defaults that conflict with the contract
Implement each of these in `app/core/errors.py` and register them in `main.py` during Phase 1, with a test for each:

- FastAPI returns **422** for validation errors → handle `RequestValidationError` and return **400** `VALIDATION_ERROR` in the contract envelope, with field errors in `details`.
- `HTTPException` returns `{"detail": ...}` → handle it (register for Starlette's `HTTPException`, so 404/405 from routing are covered too) and return the contract envelope with the matching error code.
- Unhandled exceptions return a plain-text 500 → catch-all handler returns **500** `INTERNAL_ERROR` in the envelope, logs the traceback server-side, and never puts it in the response.
- FastAPI redirects (307) between `/path` and `/path/` → set `redirect_slashes=False` and define paths exactly as the contract writes them.
- Routes return bare objects by default → every route returns the envelope; use shared generic Pydantic response models (`Envelope[T]`, `PaginatedEnvelope[T]`) as `response_model`.
- FastAPI's `HTTPBearer` returns 403 when the header is missing → use a custom auth dependency that returns **401** `UNAUTHENTICATED` for missing or invalid tokens and **403** `FORBIDDEN` only for authenticated users who lack permission.
