# Submit Quiz API (The Grader)

Allows an authenticated Apprenant (student) to submit their answers for a quiz in a single payload. The service layer scores the attempt and marks it as completed.

---

## Endpoint Overview

* **URL:** `/quizzes/submit/` *(confirm exact path against `urls.py`)*
* **Method:** `POST`
* **Permissions:** `IsApprenant`
* **Authentication:** Required (JWT or Session Token)

### Description
This endpoint accepts a full set of answers for a quiz — one entry per question — and delegates scoring to `submit_entire_quiz`. On success it returns the resulting `UtilisateurQuiz` attempt, including the computed score.

---

## Request Architecture

### Headers
```http
Content-Type: application/json
Authorization: Bearer <your_token_here>
```

### Body Parameters (JSON)

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `quiz_id` | `integer` | ✅ | ID of the quiz being submitted. |
| `answers` | `object` | ✅ | Dictionary keyed by Question ID (string), each value a list of submitted Reponse IDs. |

### Example Request Body
```json
{
  "quiz_id": 1,
  "answers": {
    "10": [2, 3],
    "11": [5],
    "12": []
  }
}
```

> An empty array (e.g., `"12": []`) represents a question left unanswered or an open-ended question with no selectable options.

---

## Business Logic Guardrails

1. **Authentication Scope:** Only users passing `IsApprenant` may hit this endpoint.
2. **Quiz Resolution:** If `quiz_id` doesn't correspond to a real quiz, the service layer raises a `ValidationError`, translated by the view into a `404 Not Found`.
3. **Scoring:** Points are computed per question against the `Corrigee` records and aggregated into `UtilisateurQuiz.score_obtenu`; the attempt is flagged `termine=True` on completion — verify against `submit_entire_quiz` in `services.py` whether resubmission of an already-completed quiz is blocked or allowed.
4. **Unexpected Errors:** Any non-`ValidationError` exception is caught and masked as a generic `500` message to avoid leaking internals.

---

## API Responses

### 🟢 201 Created
```json
{
  "message": "Quiz soumis avec succès.",
  "formation_id": 4,
  "formation_nom": "Développement Web Full Stack",
  "quiz_id": 1,
  "score_obtenu": 14.5,
  "termine": true
}
```

### 🔴 400 Bad Request
Returned when the payload fails serializer validation (e.g., non-integer IDs).

### 🔴 404 Not Found
```json
{
  "error": "Quiz introuvable."
}
```

### 🔴 500 Internal Server Error
```json
{
  "error": "Une erreur interne est survenue."
}
```