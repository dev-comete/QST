# Dashboard Metrics API (The KPI Hub)

Provides key performance indicators and summary metrics for a formateur or admin to monitor platform activity and engagement.

---

## Endpoint Overview

- **URL:** `/quizzes/dashboard/metrics/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint returns a snapshot of:

- Summary statistics (formations, published quizzes, question bank size, success rate)
- Recent quiz activity with completion tracking
- Upcoming vague sessions
- All data is filtered by the user's organization (multi-tenancy) — admins see everything, formateurs see only their org's data

This is the primary backend for a formateur/admin dashboard UI.

---

## Request

### Headers
```http
Authorization: Bearer <your_token_here>
```

No request body or query parameters required.

### Example Request

```http
GET /quizzes/dashboard/metrics/
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK`

```json
{
  "stats": [
    {
      "label": "Formations",
      "value": "5",
      "change": "Actives",
      "tone": "harbor"
    },
    {
      "label": "Quiz publiés",
      "value": "12",
      "change": "En ligne",
      "tone": "success"
    },
    {
      "label": "Questions",
      "value": "87",
      "change": "Dans la banque",
      "tone": "info"
    },
    {
      "label": "Taux de réussite",
      "value": "72%",
      "change": "Global",
      "tone": "warning"
    }
  ],
  "recent_quizzes": [
    {
      "name": "Mathématiques - Quiz 1",
      "completion": "85%",
      "status": "En cours"
    },
    {
      "name": "Français - Quiz 2",
      "completion": "100%",
      "status": "Validé"
    },
    {
      "name": "Histoire - Quiz 1",
      "completion": "30%",
      "status": "À lancer"
    }
  ],
  "upcoming_sessions": [
    {
      "name": "Développement Web",
      "date": "25 Jul 2026"
    },
    {
      "name": "Data Science",
      "date": "28 Jul 2026"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `stats` | `array` | Array of 4 key metrics (formations, active quizzes, questions, success rate). |
| `recent_quizzes` | `array` | List of the 3 most recently published quizzes with their completion percentage. |
| `upcoming_sessions` | `array` | List of the next 3 vagues by start date. |

**`stats[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The name of the metric. |
| `value` | `string` | The numeric or percentage value. |
| `change` | `string` | Context text (e.g., "Actives", "En ligne", "Global"). |
| `tone` | `string` | UI tone/color hint: `"harbor"`, `"success"`, `"info"`, `"warning"`. |

**`recent_quizzes[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Quiz title. |
| `completion` | `string` | Percentage (e.g., "85%") of assigned students who have submitted. |
| `status` | `string` | One of: `"À lancer"` (not started), `"En cours"` (in progress), `"Validé"` (100% complete). |

**`upcoming_sessions[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Formation name. |
| `date` | `string` | Vague start date formatted as "DD MMM YYYY". |

---

## Business Logic Notes

### Multi-Tenancy Filtering

- **Admins (is_staff=True):** See all formations, quizzes, questions, and vagues across the entire system.
- **Formateurs:** See only data belonging to their organization (`orga_principale`).
- **Apprenants:** Typically should not access this endpoint; permission checks will return `403 Forbidden`.

### Metrics Calculation

1. **Formations Count:** Total active formations in the user's scope.
2. **Quiz Count:** Total published quizzes in the user's scope.
3. **Questions Count:** Active questions in the user's organization's question bank.
4. **Success Rate:** Weighted average: `(total_points_earned / (total_points_possible × attempt_count)) × 100` across all completed quiz attempts.

### Recent Quizzes

- Sorted by creation date (newest first)
- Limited to the 3 most recent published quizzes
- Completion percentage = `(completed_count / assigned_count) × 100`
- Status rules:
  - `"À lancer"`: completion = 0%
  - `"En cours"`: 0% < completion < 100%
  - `"Validé"`: completion = 100% AND assigned_count > 0

### Upcoming Sessions

- Filtered to vagues with `debut` date >= current time
- Sorted by start date (earliest first)
- Limited to the next 3 sessions
- Empty if no upcoming sessions

---

## Possible Errors

### ❌ 401 Unauthorized

Returned when the request lacks valid authentication:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### ❌ 403 Forbidden

Typically not returned by this endpoint, but if permission checks were stricter:

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## Related Endpoints

- [Formateur Vague Analytics API](./formateur-vague-analytics.md) — detailed per-vague analytics and difficulty detection.
- [My To-Do Quizzes API](./student-todo.md) — student-facing list of unfinished assignments.
