# My To-Do Quizzes API (The Student Dashboard)

Returns the list of quizzes assigned to the currently authenticated student that have not yet been completed.

---

## Endpoint Overview

* **URL:** `/quizzes/my-todo/` *(confirm exact path against `urls.py`)*
* **Method:** `GET`
* **Permissions:** `IsApprenant`
* **Authentication:** Required (JWT or Session Token)

### Description
Filters `UtilisateurQuiz` down to records where `utilisateur == request.user` and `termine=False`, using `select_related('quiz', 'quiz__formation')` to avoid N+1 queries when reading the related quiz and formation name.

---

## Request Architecture

No request body — this is a `GET` request. Authentication header only:

```http
Authorization: Bearer <your_token_here>
```

---

## Response Shape

Each item is serialized via `StudentTodoQuizSerializer`:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `UtilisateurQuiz` assignment record. |
| `quiz` | `integer` | ID of the related `Quiz`. |
| `formation_nom` | `string` | Name of the formation the quiz belongs to. |
| `duree` | `duration` | Time allotted for the quiz. |
| `date_assignation` | `datetime` | Timestamp the assignment was created. |
| `termine` | `boolean` | Always `false` for items returned by this endpoint. |

---

## API Responses

### 🟢 200 OK
```json
[
  {
    "id": 3,
    "quiz": 1,
    "formation_nom": "Développement Web Full Stack",
    "duree": "00:45:00",
    "date_assignation": "2026-07-10T09:15:00Z",
    "termine": false
  },
  {
    "id": 7,
    "quiz": 4,
    "formation_nom": "Data Science pour Débutants",
    "duree": "01:00:00",
    "date_assignation": "2026-07-11T14:02:00Z",
    "termine": false
  }
]
```

### 🔴 403 Forbidden
Returned if the requesting user is not an Apprenant.

