# Weapon-X Server — Backend API

> **Feature Flag & Configuration Management API**
>
> Authoritative reference for contributors and AI agents (CLAUD.md compatible).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Core Business Logic](#core-business-logic)
4. [Data Model](#data-model)
5. [API Surface](#api-surface)
6. [Tech Stack](#tech-stack)
7. [Project Structure](#project-structure)
8. [Operational Guide](#operational-guide)

---

## Architecture Overview

The backend follows **Clean Architecture** with strict separation of concerns:

```
HTTP Request
  │
  ▼
Controller        ← Handles HTTP, delegates to Use Case
  │
  ▼
Use Case          ← Business logic, orchestrates repositories
  │
  ▼
Repository (I/F)  ← Abstract interface (port)
  │
  ▼
Prisma Impl.      ← Concrete adapter (PostgreSQL)
```

### Design Patterns

| Pattern                   | Where                                        |
|---------------------------|----------------------------------------------|
| **Repository Pattern**    | `src/repository/*/interfaces.ts` → `prisma/` |
| **Dependency Injection**  | Wired manually in `src/index.ts`             |
| **Use Case Pattern**      | `src/usecases/*.usecase.ts`                  |
| **Middleware Pipeline**    | Validation (Joi) → Authorization → Controller|
| **Centralized Errors**    | `src/errors/index.ts` (ConflictError, NotFoundError, ValidationError) |

---

## Data Flow

### Admin Operations (CRUD)

```
POST /v1/admin/configs
  → authorize(authRepo, ['configs:write'])
  → validate(createConfigSchema)          [Joi]
  → ConfigController.create()
  → CreateConfigUseCase.execute()
  → IConfigRepository.create()            [interface]
  → PrismaConfigRepository.create()       [implementation]
  → PostgreSQL
```

### Evaluation (Flag Resolution)

```
POST /v1/evaluate
  → authorize(authRepo, ['configs:read'])
  → validate(evaluateSchema)
  → EvaluateController.evaluate()
  → EvaluateUseCase.execute()
  → IConfigRepository.findManyByKeysWithRules()
  → Waterfall evaluation + Rollout hash
  → Response: { [key]: { value, rule_id, reason } }
```

---

## Core Business Logic

### Feature Flag Evaluation Engine

The evaluation engine resolves flag values through a deterministic pipeline:

1. **Fetch** — Load all requested configurations with their rules (sorted by priority ascending).
2. **Active Check** — If `is_active === false`, return `{ value: null, reason: 'DISABLED' }`.
3. **Waterfall Matching** — Iterate rules in priority order (0 → N). For each rule, evaluate ALL conditions against the provided context (`filters`).
4. **Rollout Gate** — If a rule matches AND has `rollout_percentage < 100`, apply deterministic hashing.
5. **Result** — First fully matching rule wins → `reason: 'MATCH'`. If no rule matches → `reason: 'FALLBACK'` with `default_value`.

### Waterfall Priority Logic

Rules are processed in **ascending priority order** (priority `0` is evaluated first):

```
Rule Priority 0  →  conditions met?  →  YES → return value (MATCH)
                                      →  NO  ↓
Rule Priority 1  →  conditions met?  →  YES → return value (MATCH)
                                      →  NO  ↓
Rule Priority N  →  ...
                                      →  NO  → return default_value (FALLBACK)
```

**First match wins.** Subsequent rules are never evaluated once a match is found.

### Deterministic Rollout Strategy

For gradual rollouts, each rule can specify a `rollout_percentage` (0–100):

```
hash = SHA-256("${identifier}:${ruleId}")
bucket = parseInt(hash[0..7], 16) % 100    // 0–99

if bucket < rollout_percentage → rule applies (MATCH)
if bucket >= rollout_percentage → rule skipped, continue waterfall
```

**Identifier resolution order:**
1. `filters.identifier` (from the evaluation request context)
2. Top-level `identifier` field
3. Empty string fallback

**Properties:**
- Same user + same rule → always same bucket (deterministic)
- Uniform distribution across 0–99
- Server uses Node.js `crypto.createHash('sha256')`
- SDK uses `crypto-js/sha256` (browser-compatible, produces identical output)

### Supported Condition Operators

| Operator       | Behavior                                          |
|----------------|---------------------------------------------------|
| `EQUALS`       | Case-insensitive string equality                  |
| `NOT_EQUALS`   | Negated equality                                  |
| `IN`           | Context value exists in comma-separated list      |
| `NOT_IN`       | Context value absent from list                    |
| `CONTAINS`     | Substring match                                   |
| `GREATER_THAN` | Numeric comparison                                |
| `LESS_THAN`    | Numeric comparison                                |
| `REGEX`        | RegExp test against raw context value             |

---

## Data Model

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│   Project    │────<│  Configuration     │────<│     Rule     │
│              │     │                    │     │              │
│ reference PK │     │ id            PK   │     │ id       PK  │
│ name         │     │ project_ref   FK   │     │ config_id FK │
│ created_at   │     │ key (unique/proj)  │     │ name         │
│ updated_at   │     │ type (ENUM)        │     │ conditions   │
└──────┬───────┘     │ is_active          │     │ return_value │
       │             │ default_value JSON │     │ priority     │
       │             │ validation_schema  │     │ rollout_%    │
       │             └────────────────────┘     └──────────────┘
       │
       │        ┌──────────────────┐     ┌──────────────┐
       └───────<│ Authentication   │────>│     Role     │
                │                  │     │              │
                │ id           PK  │     │ id       PK  │
                │ project_ref  FK  │     │ name UNIQUE  │
                │ role_id      FK  │     │ permissions[]│
                │ secret_key UNIQ  │     └──────────────┘
                │ is_active        │
                │ expiration_date  │
                │ removed_at       │
                └──────────────────┘
```

**Key constraints:**
- Deleting a Project cascades to its Configurations, Rules, and Authentications.
- `Configuration.key` is unique per project (`@@unique([project_reference, key])`).
- Rule `return_value` is capped at **32,768 characters** (enforced at UI, API validation, and use case layers).
- Config types: `BOOLEAN`, `JSON`, `STRING`.
- JSON rule values are validated against the configuration's `validation_schema` using AJV.

---

## API Surface

All admin routes require `Authorization: Bearer <secret_key>` with appropriate role permissions.

| Method | Endpoint                                              | Permission             |
|--------|-------------------------------------------------------|------------------------|
| POST   | `/v1/admin/projects`                                  | `projects:write`       |
| GET    | `/v1/admin/projects`                                  | `projects:read`        |
| GET    | `/v1/admin/projects/:reference`                       | `projects:read`        |
| PUT    | `/v1/admin/projects/:reference`                       | `projects:write`       |
| DELETE | `/v1/admin/projects/:reference`                       | `projects:write`       |
| POST   | `/v1/admin/roles`                                     | `roles:write`          |
| GET    | `/v1/admin/roles`                                     | `roles:read`           |
| GET    | `/v1/admin/roles/:id`                                 | `roles:read`           |
| PUT    | `/v1/admin/roles/:id`                                 | `roles:write`          |
| DELETE | `/v1/admin/roles/:id`                                 | `roles:write`          |
| POST   | `/v1/admin/authentications`                           | `authentications:write`|
| GET    | `/v1/admin/authentications/:id`                       | `authentications:read` |
| GET    | `/v1/admin/projects/:ref/authentications`             | `authentications:read` |
| PUT    | `/v1/admin/authentications/:id`                       | `authentications:write`|
| DELETE | `/v1/admin/authentications/:id`                       | `authentications:write`|
| POST   | `/v1/admin/configs`                                   | `configs:write`        |
| POST   | `/v1/admin/configs/:key/rules`                        | `rules:write`          |
| POST   | `/v1/evaluate`                                        | `configs:read`         |
| GET    | `/health`                                             | _(none)_               |

---

## Tech Stack

| Technology      | Role                                                  |
|-----------------|-------------------------------------------------------|
| **Node.js 20**  | Runtime                                               |
| **TypeScript**  | Type safety, compiled to ES2020/CommonJS              |
| **Express.js**  | HTTP framework, middleware pipeline                   |
| **Prisma ORM**  | Database access, migrations, schema management        |
| **PostgreSQL**  | Relational datastore                                  |
| **Joi**         | Request payload validation (middleware layer)         |
| **AJV**         | JSON Schema validation for rule return values         |
| **Docker**      | Containerized deployment (multi-stage Dockerfile)     |
| **Vitest**      | Unit & integration testing                            |

---

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma              # Database schema & migrations
├── src/
│   ├── index.ts                   # App bootstrap: DI wiring, Express setup
│   ├── routes/
│   │   └── index.ts               # Route definitions with middleware chain
│   ├── controllers/
│   │   ├── config.controller.ts   # Configuration CRUD endpoints
│   │   ├── rule.controller.ts     # Rule assignment endpoint
│   │   ├── evaluate.controller.ts # Flag evaluation endpoint
│   │   ├── project.controller.ts  # Project CRUD endpoints
│   │   ├── role.controller.ts     # Role CRUD endpoints
│   │   └── authentication.controller.ts  # API key management
│   ├── usecases/
│   │   ├── evaluate.usecase.ts    # ⭐ Core evaluation engine
│   │   ├── createConfig.usecase.ts
│   │   ├── assignRule.usecase.ts  # Rule + AJV validation
│   │   ├── create*.usecase.ts     # CRUD use cases for each entity
│   │   ├── get*.usecase.ts
│   │   ├── update*.usecase.ts
│   │   └── delete*.usecase.ts
│   ├── repository/
│   │   ├── config/
│   │   │   ├── interfaces.ts      # IConfigRepository (port)
│   │   │   └── prisma/            # Prisma implementation (adapter)
│   │   ├── rule/
│   │   ├── project/
│   │   ├── role/
│   │   └── authentication/
│   ├── middleware/
│   │   ├── validation.ts          # Joi schemas + validate() middleware
│   │   └── authorization.ts       # Bearer token + permission check
│   ├── errors/
│   │   └── index.ts               # ConflictError, NotFoundError, ValidationError
│   ├── types/
│   │   └── index.ts               # Shared DTOs and type definitions
│   └── utils/
│       └── schema-validator.ts    # AJV utility for JSON schema validation
├── tests/                         # Mirrors src/ structure
│   ├── controllers/
│   ├── usecases/
│   ├── repository/
│   ├── middleware/
│   └── utils/
├── Dockerfile                     # Multi-stage build (builder → runner)
├── docker-compose.yml             # API + PostgreSQL services
├── .env.example                   # DATABASE_URL, PORT
├── package.json
└── tsconfig.json
```

---

## Operational Guide

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 16+ (or Docker)

### Local Setup (without Docker)

```bash
cd server
cp .env.example .env          # Edit DATABASE_URL with your credentials
npm install
npx prisma generate
npx prisma migrate dev        # Apply migrations & seed
npm run dev                   # Starts on http://localhost:3001
```

### Local Setup (with Docker)

```bash
cd server
docker-compose up --build     # API on :3001, PostgreSQL on :5432
```

Migrations run automatically on container start (`prisma migrate deploy`).

### Database Migrations

```bash
# Create a new migration after editing schema.prisma
npx prisma migrate dev --name describe_change

# Apply migrations in production
npx prisma migrate deploy

# Open visual database browser
npx prisma studio
```

### Running Tests

```bash
# All server tests
npx vitest run

# Specific test file
npx vitest run tests/usecases/evaluate.usecase.test.ts

# Watch mode
npx vitest
```

### Health Check

```
GET /health → { "status": "ok" }
```

---

## Authorization Model

Every API request (except `/health`) requires a valid Bearer token:

```
Authorization: Bearer <secret_key>
```

The middleware pipeline:
1. Extracts the token from the `Authorization` header.
2. Looks up the `Authentication` record (includes linked `Role`).
3. Verifies `is_active === true` and not expired.
4. Checks that the role's `permissions[]` array contains ALL required permissions for the endpoint.
5. Attaches the auth entity to `req.auth` for downstream use.

Failure at any step returns `401 Unauthorized` or `403 Forbidden`.
