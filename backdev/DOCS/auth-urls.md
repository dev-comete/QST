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

## Notes

- These routes are enabled by `path('accounts/', include('django.contrib.auth.urls'))` in `backdev/backdev/urls.py`.
- The project overrides password reset templates under `backdev/templates/registration/`.
- The password reset email is sent through Django's console email backend by default, as configured in `backdev/backdev/settings.py`.
- Use the password change views only after the user is authenticated; the reset flow is open to unauthenticated visitors.
