# Testing baseline

## Layout
- Backend: one test file per resource, using the backend test file pattern from stack.md.
- Frontend: tests next to the code they cover, using the frontend test file pattern from stack.md.
- Shared backend fixtures (test client, test database, auth helper) in one place (`backend/tests/conftest.py`).
- Tests run against a separate test database, never real data. Locally it runs in Docker Compose; in CI it is the Postgres service. Both are created from scratch with `alembic upgrade head`.

## What every endpoint test covers
1. Happy path: correct status code, and the response matches the contract's envelope and fields.
2. Validation: bad or missing input → `VALIDATION_ERROR` / 400, never 422 (this proves the FastAPI override works).
3. Auth: no credentials → 401; wrong user → 403 (protected endpoints only).
4. Not found → 404 where the endpoint takes an ID.
5. List endpoints: `meta` present and correct; invalid `page_size` → 400.

Add tests for any key business logic in the services layer (calculations, state changes, permissions).

## Frontend tests
- The API client: unwraps the envelope on success and returns a typed error on each contract error code.
- Components with real logic (forms, conditional rendering); skip trivial presentational ones.

## Regression rules
- Never delete a test unless its feature is removed.
- A bug fix starts with a test that reproduces the bug.
- The full suite runs locally before every commit and in CI on every push and PR. A red CI run blocks the merge.
