# API contract

Every endpoint follows this contract. Change it only with approval, and log the change at the bottom.

## Conventions
- Base path: `/api/v1`
- Format: JSON, UTF-8. Field names in snake_case.
- Timestamps: ISO 8601, UTC (`2026-01-31T14:00:00Z`).
- IDs: UUID strings.
- Auth: `Authorization: Bearer <token>`. Endpoints are protected unless marked public.

## Response format
Every response, success or error, uses this envelope. Framework defaults that produce a different shape must be overridden.

Success:
```json
{ "data": { }, "error": null }
```
Error:
```json
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message", "details": { } } }
```

## Pagination
List endpoints accept query parameters `page` (default 1) and `page_size` (default 20, max 100), and add a top-level `meta` key next to `data` and `error`:
```json
{ "data": [ ], "error": null, "meta": { "page": 1, "page_size": 20, "total": 134 } }
```
Out-of-range `page_size` → `VALIDATION_ERROR`. A page past the end returns an empty `data` list, not 404.

## Error codes
| Code | HTTP | When |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | Input fails validation (always 400, never the framework's 422) |
| UNAUTHENTICATED | 401 | Missing or invalid credentials |
| FORBIDDEN | 403 | Authenticated but not allowed |
| NOT_FOUND | 404 | Resource does not exist |
| CONFLICT | 409 | Duplicate or state conflict |
| INTERNAL_ERROR | 500 | Unexpected server error |

## Endpoints

### <Resource name>

#### `POST /api/v1/<resource>`
- Auth: <required | public>
- Request:
```json
{ }
```
- Response `201`:
```json
{ "data": { }, "error": null }
```
- Errors: VALIDATION_ERROR, UNAUTHENTICATED

<Repeat for each endpoint.>

## Change log
| Date | Change | Approved by |
| --- | --- | --- |
