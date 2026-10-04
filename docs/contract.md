# API contract

Every endpoint follows this contract. Change it only with approval, and log the change at the bottom.

## Conventions
- Base path: `/api/v1`
- Format: JSON, UTF-8. Field names in snake_case.
- Timestamps: ISO 8601, UTC (`2026-01-31T14:00:00Z`).
- IDs: UUID strings.
- Auth: `Authorization: Bearer <token>`. Endpoints are protected unless marked public.
- Paths are exact: no trailing slash, no redirects.

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
| METHOD_NOT_ALLOWED | 405 | Path exists, method does not |
| CONFLICT | 409 | Duplicate or state conflict |
| INTERNAL_ERROR | 500 | Unexpected server error |

## Shared objects

**User**
```json
{
  "id": "uuid",
  "name": "Ada Student",
  "email": "ada@duke.edu",
  "auth_provider": "duke_netid",
  "role": "student",
  "interested_directions": ["software", "health"],
  "onboarded": false,
  "created_at": "2026-10-04T18:00:00Z"
}
```
`auth_provider`: `duke_netid` | `linkedin` | `google`. `role`: `student` | `external`. Directions: `research` | `health` | `software` | `hardware`.

**ProductCard** (gallery)
```json
{ "id": "uuid", "name": "Loom", "one_liner": "Clinical trial matching in minutes", "cover_image_url": "https://...", "category": "health" }
```

**Product** (info card and owner view): ProductCard plus
```json
{ "demo_video_url": "https://...", "brief": "Longer description...", "team_name": "Owner's name", "status": "live", "created_at": "...", "updated_at": "..." }
```
`status`: `pending_review` | `live` | `archived`.

## Endpoints

### System

#### `GET /api/v1/health`
- Auth: public
- Response `200`: `{ "data": { "status": "ok" }, "error": null }`

### Auth (MVP mock sign-in)

#### `POST /api/v1/auth/demo-login`
- Auth: public
- Request: `{ "provider": "duke_netid" }`
- Response `200`:
```json
{ "data": { "access_token": "jwt", "token_type": "bearer", "user": { "...": "User" } }, "error": null }
```
- Behavior: signs in as the demo user for that provider, created on its first sign-in (no separate seeding). One demo user per provider, shared by everyone who clicks that button. `duke_netid` → student path; `linkedin` / `google` → external path.
- Errors: VALIDATION_ERROR

### Me

#### `GET /api/v1/me`
- Auth: required
- Response `200`: `{ "data": User, "error": null }`
- Errors: UNAUTHENTICATED

#### `PATCH /api/v1/me`
- Auth: required
- Request (all optional): `{ "interested_directions": ["software"], "onboarded": true }`
- Response `200`: `{ "data": User, "error": null }`
- Errors: VALIDATION_ERROR, UNAUTHENTICATED
- Note: directions only set the default gallery filter. Skipping onboarding = `{ "onboarded": true }` alone. Duplicate directions are collapsed; `null` for either field → VALIDATION_ERROR.

### Products (Module 1)

#### `GET /api/v1/products`
- Auth: required
- Query: `page`, `page_size`, `category` (repeatable, optional), `exclude_swiped` (bool, default `true`)
- Response `200`: `{ "data": [ProductCard], "error": null, "meta": { ... } }`
- Behavior: `live` products only, newest first.
- Errors: VALIDATION_ERROR, UNAUTHENTICATED

#### `GET /api/v1/products/{product_id}`
- Auth: required
- Response `200`: `{ "data": Product, "error": null }`
- Behavior: non-`live` products are visible to their owner only; others get NOT_FOUND.
- Errors: UNAUTHENTICATED, NOT_FOUND

#### `POST /api/v1/products`
- Auth: required, role `student`
- Request:
```json
{ "name": "Loom", "one_liner": "Clinical trial matching in minutes", "cover_image_url": "https://...", "demo_video_url": "https://...", "brief": "Longer description...", "category": "health" }
```
- Response `201`: `{ "data": Product, "error": null }` with `status: "pending_review"`
- Errors: VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, CONFLICT (student already has a product)

#### `PATCH /api/v1/products/{product_id}`
- Auth: required, owner only
- Request: any subset of the POST fields
- Response `200`: `{ "data": Product, "error": null }`
- Errors: VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND

#### `GET /api/v1/me/product`
- Auth: required, role `student`
- Response `200`: `{ "data": Product | null, "error": null }` (`null` if the student skipped upload)
- Errors: UNAUTHENTICATED, FORBIDDEN

### Browse (Module 3)

#### `PUT /api/v1/products/{product_id}/swipe`
- Auth: required
- Request: `{ "direction": "right" }` (`left` | `right`)
- Response `200`: `{ "data": { "product_id": "uuid", "direction": "right", "created_at": "..." }, "error": null }`
- Behavior: idempotent; a later swipe on the same product replaces the earlier one. Right = added to Interested Products.
- Errors: VALIDATION_ERROR, UNAUTHENTICATED, NOT_FOUND

#### `POST /api/v1/products/{product_id}/feedback`
- Auth: required
- Request: `{ "would_use": true, "would_invest": false, "would_intro": true, "comment": "optional, max 1000 chars" }`
- Response `201`: `{ "data": { "product_id": "uuid", "would_use": true, "would_invest": false, "would_intro": true, "comment": "...", "created_at": "..." }, "error": null }`
- Errors: VALIDATION_ERROR, UNAUTHENTICATED, NOT_FOUND, CONFLICT (no right swipe yet, or feedback already given)

### Dashboard (Module 4)

#### `GET /api/v1/me/interested-products`
- Auth: required
- Query: `page`, `page_size`
- Response `200`: `{ "data": [ProductCard], "error": null, "meta": { ... } }`, most recent right swipe first
- Errors: VALIDATION_ERROR, UNAUTHENTICATED

#### `GET /api/v1/products/{product_id}/feedback`
- Auth: required, owner only
- Response `200`:
```json
{ "data": { "counts": { "right_swipes": 12, "would_use": 8, "would_invest": 3, "would_intro": 5 }, "comments": [ { "comment": "...", "created_at": "..." } ] }, "error": null }
```
- Errors: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND
- Note: commenter identity is not returned (open question in the PRD).

## Open items (TBD, need a decision before the module that uses them)
- How a product moves from `pending_review` to `live` in the demo. PRD says approval is simulated; proposal: seeded sample products are `live`, new uploads stay `pending_review`.
- Cover image and demo video: URLs only in the MVP, or real upload (S3)?
- Whether reactions and comments are visible to other viewers (PRD open question). Contract currently: owner only.

## Change log
| Date | Change | Approved by |
| --- | --- | --- |
| 2026-10-04 | Initial contract. Auth mocked via `demo-login` instead of passwords (stack deviation, MVP only) | Caroline (auth approach); contract pending review |
| 2026-10-04 | `demo-login`: demo users are created on first sign-in instead of seeded; `PATCH /me` collapses duplicate directions and rejects null | Pending review (PR for Module 2) |
