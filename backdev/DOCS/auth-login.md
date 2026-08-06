# Auth Login API

Authenticates a user and returns JWT access/refresh tokens together with a small profile payload for the authenticated account.

---

## Endpoint Overview

- **URL:** `/accounts/auth/login/`
- **Method:** `POST`
- **Authentication:** Not required for this endpoint
- **Permissions:** Public

### Description

This endpoint uses the custom login serializer to validate the supplied credentials and return:

- an `access` token for API authorization,
- a `refresh` token for renewing access tokens,
- a `user` object containing the basic profile and organization information.

---

## Request Body

### Headers
```http
Content-Type: application/json
```

### JSON Payload

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `username` | `string` | ✅ | The account username. |
| `password` | `string` | ✅ | The account password. |

### Example Request
```json
{
  "username": "student1",
  "password": "secret123"
}
```

---

## Success Response

### Status: `200 OK`

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "role": "apprenant",
    "username": "student1",
    "first_name": "",
    "last_name": "",
    "email": "student1@example.com",
    "is_staff": false,
    "is_superuser": false,
    "orga_principale": "Apple",
    "organisations": [
      {"id": 1, "nom": "Apple"}
    ]
  }
}
```

---

## Error Responses

### Status: `401 Unauthorized`

Returned when the username/password combination is invalid.

```json
{
  "detail": "No active account found with the given credentials"
}
```

---

## Notes

- The login response is built by the custom serializer in `accounts/serializers_auth.py`.
- The route is exposed through `accounts/urls.py` under the `/accounts/` prefix.
- To obtain a new access token after expiration, use the refresh endpoint at `/accounts/auth/refresh/`.
