# Apprenant Quiz List API (My Quizzes)

Returns a list of all quizzes assigned to the logged-in student, including completion status and scores for completed quizzes.

---

## Endpoint Overview

- **URL:** `/quizzes/mes-quiz/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated, IsApprenant`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint provides an authenticated student with a complete view of all quizzes assigned to them across all vagues, including:

- Quiz metadata (ID, title, formation, duration)
- Completion status (not started, in progress, completed)
- Scores for completed quizzes
- Formation context for each quiz

Quizzes are filtered to show only those with `status='published'` to ensure draft or closed quizzes are not visible.

---

## Request

### Headers
```http
Authorization: Bearer <your_token_here>
```

No request body or query parameters required.

### Example Request

```http
GET /quizzes/mes-quiz/
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK`

```json
[
  {
    "id": 3,
    "quiz": 1,
    "quiz_titre": "Mathématiques - Quiz 1",
    "formation": 4,
    "formation_nom": "Développement Web Full Stack",
    "duree": "00:45:00",
    "date_assignation": "2026-07-10T09:15:00Z",
    "termine": false,
    "score_obtenu": null
  },
  {
    "id": 7,
    "quiz": 4,
    "quiz_titre": "Français - Quiz 2",
    "formation": 4,
    "formation_nom": "Développement Web Full Stack",
    "duree": "01:00:00",
    "date_assignation": "2026-07-11T14:02:00Z",
    "termine": true,
    "score_obtenu": 18.5
  },
  {
    "id": 11,
    "quiz": 7,
    "quiz_titre": "Histoire - Quiz 1",
    "formation": 5,
    "formation_nom": "Data Science pour Débutants",
    "duree": "00:30:00",
    "date_assignation": "2026-07-12T10:30:00Z",
    "termine": true,
    "score_obtenu": 15.0
  }
]
```

#### Response Fields (Array of Quiz Assignments)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `UtilisateurQuiz` assignment record. |
| `quiz` | `integer` | ID of the related `Quiz`. |
| `quiz_titre` | `string` | Title of the quiz. |
| `formation` | `integer` | ID of the related `Formation`. |
| `formation_nom` | `string` | Name of the formation the quiz belongs to. |
| `duree` | `string` | Time allotted for the quiz (HH:MM:SS format). |
| `date_assignation` | `datetime` | ISO 8601 timestamp when the assignment was created. |
| `termine` | `boolean` | Whether the student has completed and submitted this quiz. |
| `score_obtenu` | `number \| null` | Score earned (null if not yet completed). |

---

## Business Logic Notes

### Filtering

- Only quizzes with `status='published'` are returned.
- Only assignments for the authenticated user (`request.user`) are included.
- All other users' assignments are excluded.

### Performance Optimization

- The endpoint uses `select_related('quiz', 'quiz__formation')` to avoid N+1 query problems when fetching related quiz and formation data.

### Score Display

- `score_obtenu` is `null` for quizzes not yet submitted.
- `score_obtenu` contains the actual numeric score for completed quizzes.

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

Returned when the requesting user is not an apprenant:

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## Related Endpoints

- [My To-Do Quizzes API](./student-todo.md) — unfinished quizzes only (simpler list).
- [Take Quiz API](./take-quiz.md) — fetch quiz questions to begin taking a quiz.
- [Submit Quiz API](./quiz-submit.md) — submit answers for grading.
- [Quiz Review API](./quiz-review.md) — view detailed corrections after submission.
