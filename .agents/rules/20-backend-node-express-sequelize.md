---
trigger: glob
globs:
  - "backend/**/*.js"
  - "backend/**/*.ts"
  - "server/**/*.js"
  - "server/**/*.ts"
---

# Backend Standards

Apply these rules to Node.js, Express, and Sequelize backend code.

## Architecture Boundaries

### Controllers

Controllers:

- handle request/response ONLY,
- MUST use `try/catch` with `next(error)` unless the project already uses a centralized async wrapper,
- MUST assume validated input,
- MUST NOT contain inline validation logic except trivial defensive checks required by existing code,
- MUST NOT access DB models directly,
- MUST NOT perform data transformation, iteration, or branching based on business rules,
- MUST delegate business logic to services.

### Services

Services:

- contain ALL business logic,
- MUST be Express-agnostic,
- MUST NOT depend on Express `req`, `res`, or `next`,
- MUST be domain-scoped and single-responsibility,
- MUST handle data processing, validation rules, transformations, authorization decisions, and transactions,
- MAY call Sequelize models directly for DB operations,
- MAY access persistence through repositories when a repository layer exists,
- MUST NOT send HTTP responses,
- MUST NOT call unrelated domain services directly.

### Repositories

Repositories are optional. If the project uses repositories, they:

- contain database query logic,
- MUST use Sequelize models or parameterized raw SQL,
- MUST enforce query-level data scoping where applicable,
- MUST NOT contain HTTP logic,
- MUST NOT contain business workflows that belong in services.

### Models

Models:

- define schema and associations ONLY,
- MUST define indexes and persistence-level constraints where applicable,
- MUST NOT contain application business logic,
- MUST NOT perform calculations or branching logic,
- MUST NOT use hooks for business logic or data transformation beyond persistence concerns.

## Forbidden Backend Patterns

- Controllers importing Sequelize models directly.
- Services sending HTTP responses.
- Models performing application-level calculations or business branching.
- Cross-service circular dependencies.
- Raw SQL without parameterization.
- Silent async failures.

## Database Rules

- All models MUST define explicit data types.
- All model fields MUST define `allowNull` intentionally.
- Required default values MUST be explicit.
- Business-unique fields MUST use `unique: true` unless a composite/partial unique constraint is explicitly required.
- Foreign keys MUST be indexed.

## Transactions

Transactions are REQUIRED for any multi-step writes affecting two or more tables.

## API Response Format

Use the project response envelope consistently.

Success response:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Rules:

- `success` and `data` are required.
- `meta` is optional and may be used for pagination, totals, filters, or other response metadata.
- No unrelated top-level fields are allowed.

Error response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

Rules:

- Error responses MUST use the centralized error middleware.
- Internal stack traces MUST NOT be exposed to clients.
- Contextual metadata may be logged internally when useful for debugging.

## Error Handlers

- All controllers MUST use centralized error middleware.
- Errors MUST include:
  - message,
  - stack internally only,
  - contextual metadata if available.

## Query Rules

- Sequelize ORM MUST be used by default.
- Raw SQL is ALLOWED ONLY IF:
  - ORM cannot express the query efficiently,
  - the query is parameterized,
  - and it is justified via JSDoc or a nearby comment.

## Naming Constraints

- Use `camelCase` for variables, functions, and resource files, for example `auth.js`.
- Use `PascalCase` for classes and exported classes, for example `class AuthService`.
- Use `snake_case` for DB fields.

## Logging Standards

- `console.log` is strictly prohibited except for server startup diagnostics.
- All logs MUST be JSON and include `level`, `message`, and `timestamp`.
- Logging is REQUIRED for:
  - all errors at `error` level,
  - all external API calls, including endpoint and latency,
  - all transaction boundaries: start, end, and failure,
  - critical flows at `info` level.
- Winston outputs to `/src/logs/` with daily rotation.

## Skill Requirements

- Use the `scaffold-express-app` skill ONLY when creating a new `app.js`. Do NOT use it for modifying an existing file.
- Use the `scaffold-http-server` skill ONLY when creating a new `server.js`. Do NOT use it for modifying an existing file.
- Use the `scaffold-error-handler` skill ONLY when creating a new centralized error middleware.