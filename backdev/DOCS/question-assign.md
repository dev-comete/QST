# Assign Questions API (The Quiz Builder)

This endpoint allows Formateurs and Admins to populate a `Quiz` by attaching one or more existing questions from the **Question Bank**, each configured with a specific type and a point value (`bareme`) for that particular quiz context.

---

## Endpoint Overview

* **URL:** `/quizzes/assign-questions/` *(confirm exact path against `urls.py`)*
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdminOrReadOnly`
* **Authentication:** Required (JWT or Session Token)

### Description
This endpoint is the primary way to build up the contents of a `Quiz` after it has been created. It links pre-existing `Question` records to a target `Quiz` via the `QuizQuestion` join table, pairing each question with a `TypeQuestion` and a `Bareme` chosen specifically for that assignment.

Unlike the older flow, the service now receives `bareme_pts` instead of a bareme ID. The backend creates or reuses a `Bareme` row based on the provided point value, then links it to the question in the bank via `QuestionBareme`. Because `type_id` and `bareme_pts` are supplied per assignment rather than being fixed on the `Question` itself, the same question can be reused across different quizzes — or even within the same quiz — under different scoring/type configurations, as long as the exact `(quiz, question, type, bareme)` combination isn't repeated.

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
| `questions_choisies[].bareme_pts` | `number` | ✅ | Point value to apply to this question in this quiz context. The backend creates or reuses a `Bareme` entry from these points. |

### Example Request Body
```json
{
  "quiz_id": 1,
  "questions_choisies": [
    {
      "question_id": 5,
      "type_id": 2,
      "bareme_pts": 3
    },
    {
      "question_id": 8,
      "type_id": 1,
      "bareme_pts": 4
    },
    {
      "question_id": 12,
      "type_id": 2,
      "bareme_pts": 3
    }
  ]
}
```

---

## Business Logic Guardrails

1. **Quiz Existence:** `quiz_id` must reference a real `Quiz`; otherwise a `404 Not Found` is returned before any assignment logic runs.
2. **Ownership Enforcement:** Non-admin users may only assign questions to quizzes belonging to formations they created (`quiz.formation.createur == request.user`). Any mismatch returns a `403 Forbidden`.
3. **Non-Empty Selection:** `questions_choisies` cannot be an empty list — the serializer rejects the request at validation time if no questions are provided.
4. **Dynamic Bareme Handling:** The service accepts `bareme_pts` and creates or reuses a `Bareme` based on the provided point value. It also creates `QuestionBareme` links for the underlying question.
5. **Type-Specific Validation:** When a question is assigned as a `QCU`, the service requires exactly one correct answer in the bank; when assigned as a `QCM`, it requires at least one correct answer. Otherwise, the request is rejected with a `400 Bad Request`.
6. **Duplicate Assignment Constraint:** The underlying `QuizQuestion` table enforces uniqueness on `(quiz, question, type_question, bareme)`. The service only creates a new link when that exact combination does not already exist.

---

## API Responses

### 🟢 200 OK
```json
{
  "message": "3 question(s) assignée(s) !"
}
```

### 🔴 400 Bad Request
Returned for validation failures (empty selection, malformed payload, or a business rule raised in the service layer), including invalid `QCU`/`QCM` answer configuration or an invalid question/type reference:
```json
{
  "error": "Impossible d'assigner la question 12 en tant que QCU. Elle possède actuellement 2 réponses correctes dans la banque, alors qu'un QCU en exige exactement UNE."
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