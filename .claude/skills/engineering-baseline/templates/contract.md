# API contract

Every endpoint follows this contract. Change it only with approval, and log the change at the bottom.

## Conventions
- Base path: `/api/v1`
- Format: JSON, UTF-8. Field names in <snake_case | camelCase>.
- Timestamps: ISO 8601, UTC (`2026-01-31T14:00:00Z`).
- IDs: <UUID strings | integers>.
- Auth: <e.g. `Authorization: Bearer <token>`>. Endpoints are protected unless marked public.

## Response format
Success:
```json
{ "data": { }, "error": null }
```
Error:
```json
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message", "details": { } } }
```
List endpoints add `"meta": { "page": 1, "page_size": 20, "total": 134 }`.

## Error codes
| Code | HTTP | When |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | Input fails validation |
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
