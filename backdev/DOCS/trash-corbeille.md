# Trash/Corbeille Management APIs

These endpoints allow formateurs and admins to view, search, and restore soft-deleted quizzes and questions.

---

## Trash Quiz List API

### Endpoint Overview

- **URL:** `/quizzes/corbeille/quizzes/`
- **Method:** `GET`
- **Permissions:** `IsFormateurOrAdminOrReadOnly`
- **Authentication:** Required (JWT or Session Token)

### Description

Lists all soft-deleted (inactive) quizzes in the user's scope. Admins see all deleted quizzes system-wide; formateurs see only those from their organization.

### Request

```http
GET /quizzes/corbeille/quizzes/
Authorization: Bearer <your_token_here>
```

### Success Response (200 OK)

```json
[
  {
    "id": 15,
    "formation": 5,
    "titre": "Mathématiques - Quiz Supprimé",
    "date_creation_quiz": "2026-07-10T09:00:00Z",
    "duree": "00:45:00",
    "status": "published",
    "is_active": false
  }
]
```

---

## Trash Question List API

### Endpoint Overview

- **URL:** `/quizzes/corbeille/questions/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

Lists all soft-deleted (inactive) questions in the user's question bank, with pagination and optional search/type filtering.

### Request Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `search` | `string` | ❌ | Text to search in question statements. |
| `type` | `string` | ❌ | Filter by question type code (e.g., `QCU`, `QCM`). |
| `page` | `integer` | ❌ | Page number for pagination. |
| `page_size` | `integer` | ❌ | Items per page (default: 15, max: 50). |

### Example Request

```http
GET /quizzes/corbeille/questions/?search=capital&type=QCU&page=1
Authorization: Bearer <your_token_here>
```

### Success Response (200 OK)

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "enonce_question": "Quelle est la capitale de la France ?",
      "reponses": [
        {
          "id": 3,
          "texte": "Paris",
          "est_correct": true,
          "explication": "Paris est la capitale."
        }
      ]
    }
  ]
}
```

---

## Restore Quiz API

### Endpoint Overview

- **URL:** `/quizzes/corbeille/quizzes/<int:quiz_id>/restaurer/`
- **Method:** `POST`
- **Permissions:** `IsFormateurOrAdminOrReadOnly`
- **Authentication:** Required (JWT or Session Token)

### Description

Restores a soft-deleted quiz. On restoration, the quiz status is automatically set to `draft` (to prevent accidentally exposing an incomplete quiz to students).

### Request

```http
POST /quizzes/corbeille/quizzes/15/restaurer/
Authorization: Bearer <your_token_here>
```

### Request Body

No body required.

### Success Response (200 OK)

```json
{
  "message": "Le quiz 'Mathématiques - Quiz Supprimé' a été restauré avec succès en mode brouillon."
}
```

### Error Responses

#### ❌ 403 Forbidden

```json
{
  "error": "Accès refusé. Vous n'avez pas l'autorisation de restaurer ce quiz."
}
```

#### ❌ 404 Not Found

```json
{
  "detail": "Not found."
}
```

---

## Restore Question API

### Endpoint Overview

- **URL:** `/quizzes/corbeille/questions/<int:question_id>/restaurer/`
- **Method:** `POST`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

Restores a soft-deleted question back to the active question bank.

### Request

```http
POST /quizzes/corbeille/questions/12/restaurer/
Authorization: Bearer <your_token_here>
```

### Request Body

No body required.

### Success Response (200 OK)

```json
{
  "message": "La question a été restaurée dans la banque avec succès."
}
```

### Error Responses

#### ❌ 404 Not Found

```json
{
  "detail": "Not found."
}
```

---

## Business Logic Notes

### Soft Deletion

- Deleted quizzes and questions are not permanently removed from the database.
- Instead, their `is_active` field is set to `False`.
- They can be permanently restored or left in the trash indefinitely.

### Draft Mode on Restoration

- When a quiz is restored, its status is automatically reset to `draft` to ensure it cannot be accessed by students until the formateur verifies and re-publishes it.

### Multi-Tenancy

- Formateurs can only see and restore items from their organization.
- Admins can see and restore anything system-wide.

---

## Related Endpoints

- [Quiz CRUD](./crud.md) — create, update, and delete quizzes.
- [Question CRUD](./crud.md) — create, update, and delete questions.
