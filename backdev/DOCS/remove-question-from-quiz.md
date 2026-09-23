# Remove Question from Quiz API

Allows a formateur or admin to remove a specific question from a quiz, provided the quiz is still in draft mode and no students have started it.

---

## Endpoint Overview

- **URL:** `/quizzes/remove-question/<int:quiz_id>/<int:question_id>/`
- **Method:** `POST`
- **Permissions:** `IsFormateurOrAdminOrReadOnly`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint deletes the link between a question and a quiz via the `QuizQuestion` table. It enforces that:

1. The quiz is still in draft mode (`status='draft'`) — published quizzes cannot be modified.
2. No students have started the quiz yet (no `UtilisateurQuiz` records with `heure_debut` set).

If either condition is violated, the operation is rejected with `400 Bad Request` or `403 Forbidden`.

---

## Request Parameters

### URL Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `quiz_id` | `integer` | ✅ | ID of the quiz from which to remove the question. |
| `question_id` | `integer` | ✅ | ID of the question to remove. |

### Request Body

No body required.

### Example Request

```http
POST /quizzes/remove-question/5/45/
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK` or `204 No Content`

```json
{
  "message": "La question a été retirée du quiz avec succès."
}
```

---

## Error Responses

### ❌ 400 Bad Request

Returned when the quiz is not in draft mode:

```json
{
  "error": "Impossible de modifier ce quiz. Il n'est plus en brouillon."
}
```

Returned when students have already started the quiz:

```json
{
  "error": "Impossible de modifier ce quiz. Au moins un apprenant a déjà commencé son évaluation."
}
```

### ❌ 404 Not Found

Returned when the quiz or question does not exist, or the question is not assigned to the quiz:

```json
{
  "detail": "Not found."
}
```

### ❌ 403 Forbidden

Returned if the user lacks permission (e.g., a formateur trying to modify a quiz they don't own):

```json
{
  "error": "Accès refusé."
}
```

---

## Business Logic Notes

- **Soft Deletes:** The `QuizQuestion` link is deleted from the database, but the underlying `Question` is not deleted.
- **Re-addition:** The same question can be re-added to the quiz using the [Assign Questions API](./question-assign.md).
- **Ownership Check:** Non-admin formateurs can only remove questions from quizzes in their formations.

---

## Related Endpoints

- [Assign Questions API](./question-assign.md) — add questions to a quiz.
- [Quiz Assigned Questions API](./quiz-assigned-questions.md) — list all questions in a quiz.
- [Quiz CRUD](./crud.md) — view and modify quiz details.
