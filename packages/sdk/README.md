# Weapon-X SDK

> Typed TypeScript SDK for the Weapon-X Feature Flag & Configuration Management API.  
> Designed for **zero-latency client-side evaluation** with full backend parity.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Data Flow](#data-flow)
3. [Core Components](#core-components)
4. [Key Interfaces & Types](#key-interfaces--types)
5. [File Structure](#file-structure)
6. [Quick Start](#quick-start)
7. [API Reference](#api-reference)
8. [Error Handling](#error-handling)
9. [Constraints & Best Practices](#constraints--best-practices)
10. [Build & Test](#build--test)

---

## Architectural Overview

The SDK provides three distinct clients, each serving a specific role:

| Client | Purpose | Latency | Transport |
|---|---|---|---|
| `AdminClient` | CRUD for projects, roles, authentications, configs, rules | Network-bound | HTTP (Axios) |
| `EvaluationClient` | Server-side flag evaluation via API | Network-bound | HTTP (Axios) |
| `SyncEvaluationClient` | **Client-side flag evaluation with zero latency** | **In-memory** | Sync (no I/O) |

### Design Principles

- **Separation of Concerns** — Management (Admin), remote evaluation, and local evaluation are isolated into distinct classes.
- **Backend Parity** — `SyncEvaluationClient.evaluate()` is an exact port of `server/src/usecases/evaluate.usecase.ts`, producing mathematically identical results.
- **Singleton Pattern** — `SyncEvaluationClient` is a singleton to prevent redundant memory caches.
- **Shared HTTP Layer** — `AdminClient` and `EvaluationClient` share a common Axios factory (`createHttpClient`) with a centralized error interceptor.

---

## Data Flow

### Remote Evaluation (EvaluationClient)

```
Client ──POST /v1/evaluate──▶ API Server ──▶ EvaluateUseCase ──▶ Response
```

### Local Evaluation (SyncEvaluationClient) — Primary Use Case

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SYNC (async, one-time)                                       │
│    GET /v1/admin/projects/:ref/configs ──▶ In-Memory Cache      │
│                                                                  │
│ 2. EVALUATE (synchronous, zero-latency, unlimited calls)        │
│    evaluate({ filters, keys }) ──▶ Cache Lookup                 │
│      ├─ Config not found       → FALLBACK (null)                │
│      ├─ Config disabled        → DISABLED (null)                │
│      ├─ Rule match + rollout   → MATCH (rule.return_value)      │
│      ├─ Rule match − rollout   → skip, try next rule            │
│      └─ No rule matched        → FALLBACK (config.default_value)│
└─────────────────────────────────────────────────────────────────┘
```

### Admin Operations (AdminClient)

```
AdminClient.method(data) ──▶ Axios ──▶ REST API ──▶ Response (unwrapped)
```

All admin methods unwrap the `{ data: T }` envelope automatically, returning clean domain objects.

---

## Core Components

### SyncEvaluationClient

The high-performance, client-side evaluation engine. This is the most critical component.

#### Singleton Lifecycle

```typescript
// Obtain the singleton (creates on first call)
const client = SyncEvaluationClient.getInstance({ baseUrl, headers });

// Populate the in-memory cache (must await before evaluating)
await client.sync('PROJECT_REF');

// Synchronous evaluation — zero latency
const results = client.evaluate({ filters: { ... }, keys: ['flag_key'] });

// Reset singleton (testing only)
SyncEvaluationClient.resetInstance();
```

#### Evaluation Engine — Waterfall Priority Logic

Rules are processed in **ascending priority order** (priority `0` first). The **first matching rule wins**; all subsequent rules are ignored.

```
For each requested key:
  1. Lookup config in cache by key
  2. If not found → { value: null, reason: 'FALLBACK' }
  3. If config.is_active === false → { value: null, reason: 'DISABLED' }
  4. For each rule (ordered by priority ASC):
     a. Evaluate ALL conditions against filters (AND logic)
     b. If all conditions pass:
        - Check rollout_percentage (default: 100%)
        - If user excluded by rollout → skip to next rule
        - Otherwise → { value: rule.return_value, reason: 'MATCH' }
  5. If no rule matched → { value: config.default_value, reason: 'FALLBACK' }
```

#### Deterministic Rollout Hashing

Rollout percentages use **deterministic SHA-256 hashing** to ensure the same user always gets the same result for a given rule:

```
bucket = parseInt(SHA256(identifier + ":" + ruleId).substring(0, 8), 16) % 100
```

- **Identifier Resolution**: `filters.identifier` → `data.identifier` → `""` (fallback)
- **Bucket Range**: `0–99` (user included if `bucket < rollout_percentage`)
- **Implementation**: Uses `crypto-js/sha256` for synchronous, browser-compatible hashing
- **Backend Parity**: Produces identical results to `server/src/usecases/evaluate.usecase.ts`

#### Condition Operators

All comparisons are **case-insensitive** (values lowercased before comparison):

| Operator | Behavior | Value Type |
|---|---|---|
| `EQUALS` | Exact match | Scalar |
| `NOT_EQUALS` | Inverse exact match | Scalar |
| `IN` | Context value exists in list | Array or comma-separated string |
| `NOT_IN` | Context value not in list | Array or comma-separated string |
| `CONTAINS` | Substring match | Scalar |
| `GREATER_THAN` | Numeric comparison (`parseFloat`) | Scalar |
| `LESS_THAN` | Numeric comparison (`parseFloat`) | Scalar |
| `REGEX` | RegExp test (case-sensitive on raw value) | Scalar or first array element |

### AdminClient

Full CRUD client for management operations. All methods are `async` and return unwrapped domain objects.

#### Available Operations

| Domain | Methods |
|---|---|
| **Projects** | `createProject`, `getProject`, `listProjects`, `updateProject`, `deleteProject` |
| **Roles** | `createRole`, `getRole`, `listRoles`, `updateRole`, `deleteRole` |
| **Authentications** | `createAuthentication`, `getAuthentication`, `listAuthenticationsByProject`, `updateAuthentication`, `deleteAuthentication` |
| **Configurations** | `createConfig` |
| **Rules** | `assignRule(configKey, data)` |

### EvaluationClient

Thin async client that delegates evaluation to the server:

```typescript
const result = await evaluator.evaluate({
  filters: { client_id: 'VIP_01', country: 'CO' },
  keys: ['new_checkout_flow'],
});
// result.data.new_checkout_flow → { value: true, rule_id: "...", reason: "MATCH" }
// result.meta.server_time → 1704067200
```

### Error Interceptor (HTTP Layer)

All API errors are intercepted by Axios and re-thrown as `WeaponXApiError`:

```typescript
class WeaponXApiError extends Error {
  status: number;        // HTTP status (e.g. 409)
  errorCode: string;     // Error name (e.g. "ConflictError")
  message: string;       // Human-readable message
  details?: ApiValidationDetail[];  // Validation errors (if 400)
}
```

---

## Key Interfaces & Types

### Client Options

```typescript
interface WeaponXClientOptions {
  baseUrl: string;                    // e.g. "http://localhost:3001"
  headers?: Record<string, string>;   // e.g. { Authorization: 'Bearer ...' }
}
```

### Domain Models

```typescript
interface Config {
  id: string;
  project_reference: string;
  key: string;                              // Unique flag identifier
  description: string;
  type: 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';     // ConfigType
  is_active: boolean;
  default_value: unknown;                   // Returned when no rule matches
  validation_schema: Record<string, unknown>;
  rules?: Rule[];                           // Ordered by priority (ASC)
  created_at: string;
  updated_at: string;
}

interface Rule {
  id: string;
  configuration_id: string;
  name: string;
  conditions: Condition[];         // ALL must match (AND logic)
  return_value: unknown;           // Value returned on MATCH
  priority: number;                // Lower = evaluated first
  rollout_percentage: number;      // 0–100, default 100
  created_at: string;
  updated_at: string;
}

interface Condition {
  attribute: string;       // Key in the filters object
  operator: Operator;      // EQUALS | NOT_EQUALS | IN | NOT_IN | CONTAINS | GREATER_THAN | LESS_THAN | REGEX
  value: string | string[];
}

interface Project {
  reference: string;       // Unique identifier (e.g. "DEADPOOL_STAGING")
  name: string;
  configurations?: Config[];
  authentications?: Authentication[];
}

interface Role {
  id: string;
  name: string;
  permissions: string[];   // e.g. ["projects:read", "configs:write"]
}

interface Authentication {
  id: string;
  project_reference: string;
  role_id: string;
  secret_key: string;
  description: string;
  is_active: boolean;
  expiration_date: string | null;
  removed_at: string | null;     // Soft-delete timestamp
  role?: Role;
}
```

### Request DTOs

```typescript
interface EvaluateRequest {
  filters: Record<string, unknown>;  // Context attributes for condition matching
  keys: string[];                     // Config keys to evaluate
  identifier?: string;                // Fallback identifier for rollout hashing
}

interface CreateConfigRequest {
  project_reference: string;
  key: string;
  description?: string;
  type: 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';
  is_active: boolean;
  default_value: unknown;
  validation_schema?: Record<string, unknown>;
}

interface CreateRuleRequest {
  project_reference: string;
  name: string;
  return_value: unknown;
  conditions: Condition[];
  rollout_percentage?: number;        // Defaults to 100
}
```

### Response Types

```typescript
interface ApiDataResponse<T> { data: T; }

interface EvaluateResponse {
  meta: { server_time: number };
  data: Record<string, EvaluationResult>;
}

interface EvaluationResult {
  value: unknown;
  rule_id: string;
  reason: 'MATCH' | 'FALLBACK' | 'DISABLED' | 'ROLLOUT_EXCLUDED';
}
```

### Enums

| Type | Values |
|---|---|
| `ConfigType` | `'BOOLEAN' \| 'JSON' \| 'STRING' \| 'SECRET'` |
| `Operator` | `'EQUALS' \| 'NOT_EQUALS' \| 'IN' \| 'NOT_IN' \| 'CONTAINS' \| 'GREATER_THAN' \| 'LESS_THAN' \| 'REGEX'` |
| `EvaluationReason` | `'MATCH' \| 'FALLBACK' \| 'DISABLED' \| 'ROLLOUT_EXCLUDED'` |

---

## File Structure

```
packages/sdk/src/
├── index.ts                    # Public barrel — all exports
├── admin-client.ts             # AdminClient: CRUD for projects, roles, auths, configs, rules
├── evaluation-client.ts        # EvaluationClient: async POST /v1/evaluate
├── sync-evaluation-client.ts   # SyncEvaluationClient: singleton, sync evaluation engine
├── http.ts                     # Shared Axios factory with error interceptor
├── errors.ts                   # WeaponXApiError class
├── sha256.ts                   # Deterministic rollout hash (crypto-js)
└── types.ts                    # All interfaces, enums, DTOs

packages/sdk/tests/
├── admin-client.test.ts
├── client.test.ts
├── errors.test.ts
├── evaluation-client.test.ts
├── http.test.ts
└── sync-evaluation-client.test.ts
```

---

## Quick Start

### SyncEvaluationClient (Recommended for Client Apps)

```typescript
import { SyncEvaluationClient } from 'weapon-x-sdk';

const client = SyncEvaluationClient.getInstance({
  baseUrl: 'http://localhost:3001',
  headers: { Authorization: 'Bearer <token>' },
});

// 1. Sync configurations (async, do once or periodically)
await client.sync('DEADPOOL_STAGING');

// 2. Evaluate flags (synchronous, zero-latency)
const results = client.evaluate({
  filters: { client_id: 'VIP_01', country: 'CO' },
  keys: ['new_checkout_flow', 'dark_mode'],
});

console.log(results.new_checkout_flow);
// { value: true, rule_id: "abc123", reason: "MATCH" }
```

### AdminClient + EvaluationClient

```typescript
import { AdminClient, EvaluationClient } from 'weapon-x-sdk';

const admin = new AdminClient({
  baseUrl: 'http://localhost:3001',
  headers: { Authorization: 'Bearer <admin-token>' },
});

const evaluator = new EvaluationClient({
  baseUrl: 'http://localhost:3001',
  headers: { Authorization: 'Bearer <eval-token>' },
});

// Create a flag
await admin.createConfig({
  project_reference: 'DEADPOOL_STAGING',
  key: 'new_checkout_flow',
  type: 'BOOLEAN',
  is_active: true,
  default_value: false,
});

// Add a targeting rule
await admin.assignRule('new_checkout_flow', {
  project_reference: 'DEADPOOL_STAGING',
  name: 'VIP Customers',
  return_value: true,
  conditions: [
    { attribute: 'client_id', operator: 'IN', value: ['VIP_01', 'VIP_02'] },
  ],
  rollout_percentage: 100,
});

// Evaluate remotely
const result = await evaluator.evaluate({
  filters: { client_id: 'VIP_01' },
  keys: ['new_checkout_flow'],
});
```

---

## Error Handling

```typescript
import { WeaponXApiError } from 'weapon-x-sdk';

try {
  await admin.createConfig({ ... });
} catch (err) {
  if (err instanceof WeaponXApiError) {
    console.error(err.status);     // 409
    console.error(err.errorCode);  // "ConflictError"
    console.error(err.message);    // "Config key already exists"
    console.error(err.details);    // Validation details (400 only)
  }
}
```

---

## Constraints & Best Practices

### Do

- ✅ Call `sync()` before the first `evaluate()` — the cache starts empty.
- ✅ Use `SyncEvaluationClient` for high-frequency evaluation in frontends.
- ✅ Use `AdminClient` for management UIs and CI/CD scripts.
- ✅ Always handle `WeaponXApiError` for graceful degradation.
- ✅ Pass `identifier` in `filters` or at the top level for deterministic rollouts.

### Do Not

- ❌ **Do not modify the evaluation logic** in `SyncEvaluationClient` — it must remain an exact mirror of the server's `EvaluateUseCase`.
- ❌ **Do not modify `sha256.ts`** — the hashing algorithm must stay identical to the backend's `crypto` implementation.
- ❌ **Do not instantiate `SyncEvaluationClient` with `new`** — always use `getInstance()`.
- ❌ **Do not call `evaluate()` before `sync()`** — results will be empty/incorrect.

---

## Build & Test

```bash
# Type-check without emitting
npm run typecheck

# Run tests
npx vitest run

# Build (produces dist/ with CJS, ESM, and .d.ts)
npm run build
```
