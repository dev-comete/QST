# Vague Management APIs

Comprehensive documentation for creating, listing, and managing vagues (class cohorts) within formations.

---

## Create Vague API

### Endpoint Overview

- **URL:** `/formations/vagues/create/`
- **Method:** `POST`
- **Permissions:** `IsFormateurOrAdminOrReadOnly`
- **Authentication:** Required (JWT or Session Token)

### Description

Creates a new vague (class cohort) within a formation. Only the formation owner or an admin can create vagues for that formation.

### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `nom_vague` | `string` | ✅ | Name of the vague (e.g., "Promotion 2026-A"). |
| `formation_id` | `integer` | ✅ | ID of the formation this vague belongs to. |
| `debut` | `datetime` | ✅ | Start date/time of the vague (ISO 8601 format). |
| `fin` | `datetime` | ✅ | End date/time of the vague (must be after `debut`). |

### Example Request

```json
{
  "nom_vague": "Promotion 2026 - Cohorte A",
  "formation_id": 4,
  "debut": "2026-09-01T08:00:00Z",
  "fin": "2026-12-31T18:00:00Z"
}
```

### Success Response (201 Created)

```json
{
  "message": "Vague créée avec succès.",
  "vague_id": 15,
  "debut": "2026-09-01T08:00:00Z",
  "fin": "2026-12-31T18:00:00Z"
}
```

### Error Responses

#### ❌ 400 Bad Request

Invalid date range (end before start):

```json
{
  "error": "La date de fin doit être strictement ultérieure à la date de début."
}
```

#### ❌ 403 Forbidden

User doesn't own the formation:

```json
{
  "error": "Vous ne pouvez créer une vague que pour vos propres formations."
}
```

---

## List Vagues for Student API

### Endpoint Overview

- **URL:** `/formations/student/mes-vagues/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

Returns a list of all vagues (class cohorts) in which the authenticated student is enrolled.

### Request

```http
GET /formations/student/mes-vagues/
Authorization: Bearer <your_token_here>
```

### Success Response (200 OK)

```json
[
  {
    "vague_id": 12,
    "nom_vague": "Promotion 2026 - Cohorte A",
    "formation_nom": "Développement Web",
    "debut": "2026-09-01T08:00:00Z",
    "fin": "2026-12-31T18:00:00Z"
  },
  {
    "vague_id": 13,
    "nom_vague": "Promotion 2026 - Cohorte B",
    "formation_nom": "Data Science",
    "debut": "2026-10-01T08:00:00Z",
    "fin": "2027-01-31T18:00:00Z"
  }
]
```

---

## Vague Update API

### Endpoint Overview

- **URL:** `/formations/vagues/<int:vague_id>/` (via CRUD)
- **Method:** `PATCH` / `PUT`
- **Permissions:** `IsFormateurOrAdminOrReadOnly`
- **Authentication:** Required (JWT or Session Token)

### Description

Updates vague details such as dates. Security checks include:

- Only the formation owner or admin can modify the vague.
- If students are already enrolled, the formation cannot be changed.
- If quizzes have started (students have begun taking them), the start date cannot be modified (this ensures fairness).

### Request Body (PATCH - Partial Update)

```json
{
  "nom_vague": "Promotion 2026 - Cohorte A (Updated)",
  "fin": "2027-01-31T18:00:00Z"
}
```

### Success Response (200 OK)

```json
{
  "id": 12,
  "nom_vague": "Promotion 2026 - Cohorte A (Updated)",
  "formation": 4,
  "debut": "2026-09-01T08:00:00Z",
  "fin": "2027-01-31T18:00:00Z"
}
```

### Error Responses

#### ❌ 400 Bad Request

Cannot move start date if quizzes have started:

```json
{
  "error": "La date de fin doit être strictement ultérieure à la date de début."
}
```

Cannot change formation if students are enrolled:

```json
{
  "error": "Impossible de changer la formation d'une vague contenant des inscrits."
}
```

#### ❌ 403 Forbidden

Not authorized to modify this vague:

```json
{
  "error": "Accès refusé."
}
```

---

## Assign Students to Vague API

See [Assign Students to Vague API](./student-to-vague.md) for detailed documentation on bulk enrolling students into vagues.

---

## Assign Quiz to Vague API

See [Assign Quiz to Vague API](./quiz-to-vague.md) for detailed documentation on assigning quizzes to entire vagues.

---

## Business Logic Notes

### Date Enforcement

- Vagues have strict date ranges: `debut` must be before `fin`.
- Once students have started quizzes, the `debut` date is locked to ensure fairness (all students get the same time window).

### Cascading Operations

- When students are enrolled in a vague, they are automatically assigned all quizzes in the formation (if applicable).
- When a quiz is added to a formation, it can be bulk-assigned to all vagues.

### Multi-Tenancy

- Formateurs only see and manage vagues in their formations.
- Admins can see and modify any vague.

---

## Related Endpoints

- [Vague Analytics API](./formateur-vague-analytics.md) — detailed class performance metrics.
- [Formation CRUD](./crud.md) — manage formations.
- [Student to Vague](./student-to-vague.md) — enroll students in vagues.
