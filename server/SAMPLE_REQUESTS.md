# API Sample Requests

> **Base URL:** `http://localhost:3000`
>
> **Authentication:** All `/v1/admin/*` and `/v1/evaluate` endpoints require a Bearer token in the `Authorization` header.

---

## Projects

### Create a Project

```bash
curl -X POST http://localhost:3000/v1/admin/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "reference": "my-app-prod",
    "name": "My Application (Production)"
  }'
```

### List All Projects

```bash
curl -X GET http://localhost:3000/v1/admin/projects \
  -H "Authorization: Bearer <your-secret-key>"
```

### Get a Single Project

```bash
curl -X GET http://localhost:3000/v1/admin/projects/my-app-prod \
  -H "Authorization: Bearer <your-secret-key>"
```

### Update a Project

```bash
curl -X PUT http://localhost:3000/v1/admin/projects/my-app-prod \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "name": "My Application (Production) - Renamed"
  }'
```

### Delete a Project

```bash
curl -X DELETE http://localhost:3000/v1/admin/projects/my-app-prod \
  -H "Authorization: Bearer <your-secret-key>"
```

---

## Roles

### Create a Role

```bash
curl -X POST http://localhost:3000/v1/admin/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "name": "editor",
    "permissions": ["configs:read", "configs:write", "rules:read", "rules:write"]
  }'
```

### List All Roles

```bash
curl -X GET http://localhost:3000/v1/admin/roles \
  -H "Authorization: Bearer <your-secret-key>"
```

### Get a Single Role

```bash
curl -X GET http://localhost:3000/v1/admin/roles/<role-id> \
  -H "Authorization: Bearer <your-secret-key>"
```

### Update a Role

```bash
curl -X PUT http://localhost:3000/v1/admin/roles/<role-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "name": "senior-editor",
    "permissions": ["configs:read", "configs:write", "rules:read", "rules:write", "projects:read"]
  }'
```

### Delete a Role

```bash
curl -X DELETE http://localhost:3000/v1/admin/roles/<role-id> \
  -H "Authorization: Bearer <your-secret-key>"
```

---

## Authentications (API Tokens)

### Create an Authentication

```bash
curl -X POST http://localhost:3000/v1/admin/authentications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "role_id": "<role-id>",
    "secret_key": "sk_live_a1b2c3d4e5f6g7h8i9j0",
    "email": "admin@example.com",
    "description": "Production API token for CI/CD pipeline",
    "is_active": true,
    "expiration_date": "2026-12-31T23:59:59.000Z"
  }'
```

### Get an Authentication

```bash
curl -X GET http://localhost:3000/v1/admin/authentications/<authentication-id> \
  -H "Authorization: Bearer <your-secret-key>"
```

### List Authentications by Project

```bash
curl -X GET http://localhost:3000/v1/admin/projects/my-app-prod/authentications \
  -H "Authorization: Bearer <your-secret-key>"
```

### Update an Authentication

```bash
curl -X PUT http://localhost:3000/v1/admin/authentications/<authentication-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "description": "Updated description",
    "is_active": false,
    "expiration_date": "2027-06-30T00:00:00.000Z",
    "role_id": "<new-role-id>",
    "email": "new-owner@example.com"
  }'
```

### Delete an Authentication

```bash
curl -X DELETE http://localhost:3000/v1/admin/authentications/<authentication-id> \
  -H "Authorization: Bearer <your-secret-key>"
```

---

## Token Introspection

> **Note:** This endpoint does not use admin authorization. It validates the token provided in the `Authorization` header itself.

### Introspect a Token

```bash
curl -X POST http://localhost:3000/v1/auth/introspect \
  -H "Authorization: Bearer sk_live_a1b2c3d4e5f6g7h8i9j0"
```

---

## Configurations

### Create a Configuration

#### Boolean Flag

```bash
curl -X POST http://localhost:3000/v1/admin/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "key": "enable_dark_mode",
    "description": "Toggles the dark mode feature for all users",
    "type": "BOOLEAN",
    "is_active": true,
    "default_value": false
  }'
```

#### JSON Configuration

```bash
curl -X POST http://localhost:3000/v1/admin/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "key": "rate_limits",
    "description": "Rate limiting settings per tier",
    "type": "JSON",
    "is_active": true,
    "default_value": {
      "free": 100,
      "pro": 5000,
      "enterprise": -1
    }
  }'
```

#### String Configuration

```bash
curl -X POST http://localhost:3000/v1/admin/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "key": "welcome_message",
    "description": "The welcome banner text shown on the homepage",
    "type": "STRING",
    "is_active": true,
    "default_value": "Welcome to our platform!"
  }'
```

#### Secret Configuration

```bash
curl -X POST http://localhost:3000/v1/admin/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "key": "stripe_api_key",
    "description": "Stripe API key for payment processing",
    "type": "SECRET",
    "is_active": true,
    "default_value": "sk_test_placeholder"
  }'
```

---

## Rules

### Assign a Rule to a Configuration

```bash
curl -X POST http://localhost:3000/v1/admin/configs/enable_dark_mode/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "name": "Beta users get dark mode",
    "return_value": true,
    "conditions": [
      {
        "attribute": "user_tier",
        "operator": "EQUALS",
        "value": "beta"
      }
    ],
    "rollout_percentage": 50
  }'
```

#### Rule with Multiple Conditions

```bash
curl -X POST http://localhost:3000/v1/admin/configs/rate_limits/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "project_reference": "my-app-prod",
    "name": "Enterprise US customers override",
    "return_value": { "free": 200, "pro": 10000, "enterprise": -1 },
    "conditions": [
      {
        "attribute": "plan",
        "operator": "EQUALS",
        "value": "enterprise"
      },
      {
        "attribute": "country",
        "operator": "IN",
        "value": ["US", "CA"]
      }
    ]
  }'
```

### Available Condition Operators

| Operator       | Value Type   | Description                              |
| -------------- | ------------ | ---------------------------------------- |
| `EQUALS`       | `string`     | Exact match                              |
| `NOT_EQUALS`   | `string`     | Inverse exact match                      |
| `IN`           | `string[]`   | Value is in the provided list            |
| `NOT_IN`       | `string[]`   | Value is not in the provided list        |
| `CONTAINS`     | `string`     | Attribute contains the substring         |
| `GREATER_THAN` | `string`     | Numeric/lexicographic greater-than       |
| `LESS_THAN`    | `string`     | Numeric/lexicographic less-than          |
| `REGEX`        | `string`     | Value matches the regular expression     |

---

## Evaluate

### Evaluate Configuration Flags

```bash
curl -X POST http://localhost:3000/v1/evaluate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-key>" \
  -d '{
    "filters": {
      "user_tier": "beta",
      "country": "US",
      "plan": "enterprise"
    },
    "keys": ["enable_dark_mode", "rate_limits", "welcome_message"],
    "identifier": "user-12345"
  }'
```

#### Response Shape

```json
{
  "meta": {
    "server_time": 1739347200
  },
  "data": {
    "enable_dark_mode": {
      "value": true,
      "rule_id": "<rule-id>",
      "reason": "MATCH"
    },
    "rate_limits": {
      "value": { "free": 200, "pro": 10000, "enterprise": -1 },
      "rule_id": "<rule-id>",
      "reason": "MATCH"
    },
    "welcome_message": {
      "value": "Welcome to our platform!",
      "rule_id": null,
      "reason": "FALLBACK"
    }
  }
}
```

#### Evaluation Reasons

| Reason             | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| `MATCH`            | A rule's conditions matched the provided filters               |
| `FALLBACK`         | No rule matched; the configuration's `default_value` was used  |
| `DISABLED`         | The configuration exists but `is_active` is `false`            |
| `ROLLOUT_EXCLUDED` | Conditions matched but the identifier was excluded by rollout  |
