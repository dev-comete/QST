# Assign Questions API (The Quiz Builder)

This endpoint allows Formateurs and Admins to populate a `Quiz` by attaching one or more existing questions from the **Question Bank**, each configured with a specific type and point scale (`bareme`) for that particular quiz context.

---

## Endpoint Overview

* **URL:** `/quizzes/assign-questions/` *(confirm exact path against `urls.py`)*
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdminOrReadOnly`
* **Authentication:** Required (JWT or Session Token)

### Description
This endpoint is the primary way to build up the contents of a `Quiz` after it has been created. It links pre-existing `Question` records to a target `Quiz` via the `QuizQuestion` join table, pairing each question with a `TypeQuestion` and a `Bareme` chosen specifically for that assignment.

Because `type_id` and `bareme_id` are supplied per assignment rather than being fixed on the `Question` itself, the same question can be reused across different quizzes — or even within the same quiz — under different scoring/type configurations, as long as the exact `(quiz, question, type, bareme)` combination isn't repeated.

An **ownership check** is enforced at the view level before any data is written: only the Formateur who owns the `Formation` behind the `Quiz` (or an Admin/staff user) may assign questions to it.

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
| `quiz_id` | `integer` | ✅ | ID of the target `Quiz` to assign questions to. Must already exist. |
| `questions_choisies` | `array` | ✅ | Non-empty list of question configurations to attach to the quiz. |
| `questions_choisies[].question_id` | `integer` | ✅ | ID of an existing `Question` from the bank. |
| `questions_choisies[].type_id` | `integer` | ✅ | Reference ID for the question type to use in this quiz context (e.g., 1 for QCU, 2 for QCM). |
| `questions_choisies[].bareme_id` | `integer` | ✅ | Reference ID for the point scale to apply to this question in this quiz. |

### Example Request Body
```json
{
  "quiz_id": 1,
  "questions_choisies": [
    {
      "question_id": 5,
      "type_id": 2,
      "bareme_id": 3
    },
    {
      "question_id": 8,
      "type_id": 1,
      "bareme_id": 4
    },
    {
      "question_id": 12,
      "type_id": 2,
      "bareme_id": 3
    }
  ]
}
```

---

## Business Logic Guardrails

1. **Quiz Existence:** `quiz_id` must reference a real `Quiz`; otherwise a `404 Not Found` is returned before any assignment logic runs.
2. **Ownership Enforcement:** Non-admin users may only assign questions to quizzes belonging to formations they created (`quiz.formation.createur == request.user`). Any mismatch returns a `403 Forbidden`.
3. **Non-Empty Selection:** `questions_choisies` cannot be an empty list — the serializer rejects the request at validation time if no questions are provided.
4. **Duplicate Assignment Constraint:** The underlying `QuizQuestion` table enforces uniqueness on `(quiz, question, type_question, bareme)`. Submitting the exact same combination twice for the same quiz should be handled gracefully by the service layer as a business validation error rather than a raw database integrity error — verify this behavior against `assign_questions_to_quiz` in `services.py`.

---

## API Responses

### 🟢 200 OK
```json
{
  "message": "3 question(s) assignée(s) !"
}
```

### 🔴 400 Bad Request
Returned for validation failures (empty selection, malformed payload, or a business rule raised in the service layer):
```json
{
  "error": "Cette question est déjà assignée à ce quiz avec cette configuration."
}
```

### 🔴 403 Forbidden
Returned when a non-admin Formateur attempts to assign questions to a quiz they don't own:
```json
{
  "error": "Accès refusé."
}
```

### 🔴 404 Not Found
Returned when `quiz_id` does not correspond to an existing `Quiz`.