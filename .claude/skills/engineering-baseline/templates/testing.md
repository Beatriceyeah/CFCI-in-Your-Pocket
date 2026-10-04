# Testing baseline

## Layout
- One test file per resource: `tests/test_<resource>.py` or `tests/<resource>.test.ts`.
- Shared fixtures (test client, test database, auth helper) in one place: `tests/conftest.py` or `tests/setup.ts`.
- Tests run against a separate test database, never real data.

## What every endpoint test covers
1. Happy path: correct status code, and the response matches the contract's envelope and fields.
2. Validation: bad or missing input → `VALIDATION_ERROR` / 400.
3. Auth: no credentials → 401; wrong user → 403 (protected endpoints only).
4. Not found → 404 where the endpoint takes an ID.

Add tests for any key business logic in `services/` (calculations, state changes, permissions).

## Regression rules
- Never delete a test unless its feature is removed.
- A bug fix starts with a test that reproduces the bug.
- The full suite runs before every commit; a failing suite blocks the commit.
