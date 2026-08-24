# Django Built-In Accounts Endpoints

These endpoints are provided by `django.contrib.auth.urls` and are mounted under the `/accounts/` prefix in `backdev/backdev/urls.py`.

They expose the standard Django browser-based authentication views for logout, password change, and password reset.

Custom JWT auth APIs are documented separately in `auth-login.md` and `auth-logout.md`.

---

## Endpoint Overview

| URL | Method | Authentication | Description |
| :--- | :---: | :---: | :--- |
| `/accounts/logout/` | `GET`, `POST` | Not required | Log the user out and redirect to the configured page. |
| `/accounts/password_change/` | `GET`, `POST` | Required | Show the password change form for authenticated users. |
| `/accounts/password_change/done/` | `GET` | Required | Confirmation page after a successful password change. |
| `/accounts/password_reset/` | `GET`, `POST` | Not required | Start the password reset flow by entering an email address. |
| `/accounts/password_reset/done/` | `GET` | Not required | Confirmation page shown after submitting a password reset request. |
| `/accounts/reset/<uidb64>/<token>/` | `GET`, `POST` | Not required | Set a new password when following the reset email link. |
| `/accounts/reset/done/` | `GET` | Not required | Success page shown after the password has been reset. |

---

## Actual User Creation & Credential Flow

In this project, account creation is not done by a custom “register” endpoint. It goes through the admin-only `UtilisateurViewSet` in `accounts/views.py`.

### 1) Admin creates the user

A privileged user (admin) creates a new `Utilisateur` through the CRUD API for users, usually under the `/utilisateurs/` route managed by the DRF router.

The `perform_create()` method in `UtilisateurViewSet` does the following:

1. Saves the user record.
2. Generates a password-reset token using Django's `default_token_generator`.
3. Encodes the user primary key with `urlsafe_base64_encode`.
4. Builds a reset link using `reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})`.
5. Sends an email with `send_mail(...)`.

### 2) Reset link is sent automatically

The email content includes a direct link to the custom front-end password confirmation flow, not the native Django reset form.

The front-end should call the API endpoint:

```http
POST /accounts/auth/reset-password-confirm/
```

Request body:

```json
{
  "uid": "<uidb64>",
  "token": "<reset_token>",
  "new_password": "MyNewPassword123!"
}
```

This backend endpoint is implemented in `ConfirmPasswordResetAPIView` and uses `ResetPasswordConfirmSerializer` to validate the reset token and set the password.

The project configures the reset email sender as:

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@comete.ai'
```

Because the email backend is the console backend, the reset link is printed in the server console during local development instead of being actually sent via SMTP.

### 3) User sets the password

The user should not be redirected to Django's native password reset form. The front-end must handle the password setup itself using the custom API endpoint above.

The intended flow is:

1. Receive the reset link or token from the invited user email.
2. Redirect the user to the front-end confirmation page.
3. Front-end sends:
   - `uid`
   - `token`
   - `new_password`
4. The backend validates the token and sets the password.
5. The user is then redirected to the login page or the app login screen.

The native Django routes still exist, but they are not the recommended frontend flow for this app.

### 4) Authentication afterward

Once the password is set, the user logs in via the JWT endpoint:

- `/accounts/auth/login/`

and receives:

- `access` token
- `refresh` token
- minimal authenticated user payload

### 5) Security rules applied

The `UtilisateurViewSet` enforces the following restrictions:

- `POST`, `PUT`, `PATCH`, `DELETE`: only Admins can create or modify users.
- `GET`: authenticated users can read, but role-based filters still apply:
  - apprenants see only their own profile
  - formateurs see only users from their own organization

---

## Notes

- These routes are enabled by `path('accounts/', include('django.contrib.auth.urls'))` in `backdev/backdev/urls.py`.
- The project overrides password reset templates under `backdev/templates/registration/`.
- The password reset email is sent through Django's console email backend by default, as configured in `backdev/backdev/settings.py`.
- Use the password change views only after the user is authenticated; the reset flow is open to unauthenticated visitors.
