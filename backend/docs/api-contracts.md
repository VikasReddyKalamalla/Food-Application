# API Specifications & Contracts

## 1. Response Formats

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 54,
    "totalPages": 3
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Human-readable safe error message",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

## 2. Authentication Flow
1. Client calls `POST /api/v1/auth/login` or `POST /api/v1/auth/register`.
2. Response includes:
   - `accessToken`: Short-lived JWT (15 mins) for `Authorization: Bearer <token>`.
   - `refreshToken`: Sent both in body and as an `HttpOnly`, `SameSite=lax` cookie.
3. When `accessToken` expires:
   - Client calls `POST /api/v1/auth/refresh`.
   - The server validates the refresh token hash against the dedicated session store, invalidates the old refresh token (Token Rotation), and returns a fresh pair.
4. On `POST /api/v1/auth/logout`:
   - The refresh token hash is revoked and the cookie is cleared.

## 3. Standard HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Invalid syntax or domain rule violation.
- `401 Unauthorized`: Authentication missing or token expired.
- `403 Forbidden`: Authenticated user lacks required role.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Illegal state transition or duplicate unique key.
- `422 Unprocessable Entity`: Zod schema validation failed.
- `429 Too Many Requests`: Rate limiter triggered.
- `500 Internal Server Error`: Unhandled server exception (stack traces omitted in production).
- `503 Service Unavailable`: Dependent service (e.g. database or unconfigured AI) is unavailable.
