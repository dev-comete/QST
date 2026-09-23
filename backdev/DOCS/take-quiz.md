# Take Quiz API (The Quiz Loader)

Fetches the full quiz details and questions for a student to begin taking it. Enforces assignment validation, completion checks, and scheduling windows.

---

## Endpoint Overview

- **URL:** `/quizzes/<int:quiz_id>/take/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated, IsApprenant`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint retrieves the complete quiz and its questions for a student, but only if:

1. The student is officially assigned to this quiz via a `UtilisateurQuiz` record
2. The quiz is published and accessible (not in draft or closed state)
3. The quiz falls within the configured access window (`date_ouverture` to `date_fermeture`)
4. The student hasn't already completed this quiz
5. This is their first time accessing the quiz (or they're resuming a started-but-not-submitted attempt)

On first access, the system records the `heure_debut` (start time) automatically to enforce quiz duration limits.

---

## Request Parameters

### URL Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `quiz_id` | `integer` | ✅ | ID of the quiz to take. |

### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `vague_id` | `integer` | ✅ | ID of the vague under which this quiz was assigned. Used to validate the exact assignment context. |

### Example Request

```http
GET /quizzes/5/take/?vague_id=12
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK`

```json
{
  "quiz_id": 5,
  "quiz_titre": "Mathématiques - Quiz 1",
  "quiz_duree": "00:45:00",
  "heure_debut": "2026-07-20T14:30:00Z",
  "questions": [
    {
      "quiz_question_id": 23,
      "question_id": 45,
      "enonce": "Quelle est la capitale de la France ?",
      "bareme_pts": 2.5,
      "options": [
        {
          "id": 101,
          "texte": "Paris",
          "explication": null
        },
        {
          "id": 102,
          "texte": "Lyon",
          "explication": null
        },
        {
          "id": 103,
          "texte": "Marseille",
          "explication": null
        }
      ]
    },
    {
      "quiz_question_id": 24,
      "question_id": 46,
      "enonce": "Quel est le plus grand océan ?",
      "bareme_pts": 3.0,
      "options": [
        {
          "id": 104,
          "texte": "Océan Pacifique",
          "explication": null
        },
        {
          "id": 105,
          "texte": "Océan Atlantique",
          "explication": null
        }
      ]
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `quiz_id` | `integer` | ID of the quiz. |
| `quiz_titre` | `string` | Title of the quiz. |
| `quiz_duree` | `string` | Duration allowed (HH:MM:SS format). |
| `heure_debut` | `datetime` | Timestamp when the quiz was first accessed (used to enforce time limits). |
| `questions` | `array` | List of questions configured for this quiz. |

**`questions[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `quiz_question_id` | `integer` | ID of the `QuizQuestion` link record. |
| `question_id` | `integer` | ID of the underlying `Question`. |
| `enonce` | `string` | Question text. |
| `bareme_pts` | `number` | Points available for this question in this quiz context. |
| `options` | `array` | Answer choices for this question (without correctness markers or explanations to prevent cheating). |

**`options[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `Reponse` (answer option). |
| `texte` | `string` | Text of the answer option. |
| `explication` | `string \| null` | (Always null for students) — explanations are shown only in the review endpoint. |

---

## Error Responses

### ❌ 400 Bad Request

Missing `vague_id` query parameter:

```json
{
  "error": "L'ID de la vague est manquant dans l'URL."
}
```

### ❌ 403 Forbidden

Returned when the quiz is not yet published:

```json
{
  "error": "Ce quiz est en cours de préparation et n'est pas encore accessible."
}
```

Returned when the quiz is not yet open (before `date_ouverture`):

```json
{
  "error": "Ce quiz ne sera accessible qu'à partir du 20/07/2026 14:00."
}
```

Returned when the quiz has closed (after `date_fermeture`):

```json
{
  "error": "La période d'accès à ce quiz est terminée."
}
```

Returned when the student has already completed this quiz:

```json
{
  "error": "Vous avez déjà terminé ce quiz. Vous ne pouvez pas le refaire."
}
```

### ❌ 404 Not Found

Returned when the student is not assigned to this quiz or the quiz does not exist:

```json
{
  "error": "Not found."
}
```

---

## Business Logic Notes

- **First Access Recording:** On the first `GET`, if `heure_debut` is null, it is set to the current time and saved. This timestamp is used later by `submit_entire_quiz()` to enforce the quiz duration limit.
- **No Student Answers:** The response includes only the question text and answer options. Correctness markers and per-option explanations are intentionally excluded to prevent cheating. These are only revealed in the [Quiz Review API](./quiz-review.md) after submission.
- **Scheduling Windows:** Both `date_ouverture` and `date_fermeture` are optional fields on the `Quiz` model. If either is missing, the check is skipped.
- **Idempotency:** Calling this endpoint multiple times returns the same payload, except `heure_debut` is only set once (on the first call).

---

## Related Endpoints

- [Submit Quiz API](./quiz-submit.md) — submit answers for grading.
- [Quiz Review API](./quiz-review.md) — view detailed corrections after submitting.
- [My Quiz List API](./student-todo.md) — list all assigned unfinished quizzes.
