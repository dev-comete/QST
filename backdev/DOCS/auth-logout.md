# Auth Logout API

Logs a user out by blacklisting the submitted refresh token. This endpoint is implemented by `LogoutAPIView` in `backdev/accounts/views_auth.py` and is mounted under `/accounts/auth/logout/`.

---

## Endpoint Overview

- **URL:** `/accounts/auth/logout/`
- **Method:** `POST`
- **Authentication:** Required (Bearer token)
- **Permissions:** `IsAuthenticated`

### Description

This endpoint accepts a refresh token and blacklists it so it can no longer be used to obtain new access tokens. The request must be authenticated with a valid access token.

---

## Request

### Headers
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### JSON Payload

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `refresh` | `string` | ✅ | The JWT refresh token to blacklist. |

### Example Request
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Success Response

### Status: `205 Reset Content`

No response body is returned on successful logout.

---

## Error Response

### Status: `400 Bad Request`

Returned when the refresh token is missing or invalid.

```json
{
  "detail": "Invalid token."
}
```

---

## Notes

- This API is separate from Django's built-in browser-based `/accounts/logout/` view.
- The custom login API is documented in `auth-login.md`.
