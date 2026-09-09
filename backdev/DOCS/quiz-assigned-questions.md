# Quiz Assigned Questions API

Returns a detailed list of all questions assigned to a specific quiz, including their full question text, all answer options with correctness flags, explanations, and point values. This endpoint is typically consumed by formateurs during quiz review or editing phases.

---

## Endpoint Overview

- **URL:** `/quizzes/<int:quiz_id>/questions/`
- **Method:** `GET`
- **Permissions:** `IsFormateurOrAdminOrReadOnly`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint retrieves all questions linked to a quiz via `QuizQuestion` records, including full question details and all their answer options. This is useful for:

- Formateurs reviewing the questions they've assembled into a quiz
- Formateurs previewing what students will see (minus student-specific data like answers submitted)
- Admins auditing quiz content

---

## Request Parameters

### URL Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `quiz_id` | `integer` | ✅ | ID of the quiz whose questions should be retrieved. |

### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `page` | `integer` | ❌ | Page number for pagination (if applicable). |
| `page_size` | `integer` | ❌ | Number of items per page (if applicable). |

### Example Request

```http
GET /quizzes/5/questions/
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK`

```json
[
  {
    "id": 23,
    "quiz_id": 5,
    "question_id": 45,
    "enonce": "Quelle est la capitale de la France ?",
    "bareme_pts": 2.5,
    "type_code": "QCU",
    "options": [
      {
        "id": 101,
        "texte": "Paris",
        "est_correct": true,
        "explication": "Paris est la capitale et plus grande ville de France."
      },
      {
        "id": 102,
        "texte": "Lyon",
        "est_correct": false,
        "explication": "Lyon est la deuxième ville, mais pas la capitale."
      },
      {
        "id": 103,
        "texte": "Marseille",
        "est_correct": false,
        "explication": "Marseille est un port important mais n'est pas la capitale."
      }
    ]
  },
  {
    "id": 24,
    "quiz_id": 5,
    "question_id": 46,
    "enonce": "Quel est le plus grand océan du monde ?",
    "bareme_pts": 3.0,
    "type_code": "QCU",
    "options": [
      {
        "id": 104,
        "texte": "Océan Pacifique",
        "est_correct": true,
        "explication": "Le Pacifique couvre environ 165 millions de km²."
      },
      {
        "id": 105,
        "texte": "Océan Atlantique",
        "est_correct": false,
        "explication": "L'Atlantique est le deuxième plus grand océan."
      }
    ]
  }
]
```

#### Response Fields (Array of Questions)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `QuizQuestion` link record. |
| `quiz_id` | `integer` | ID of the quiz. |
| `question_id` | `integer` | ID of the underlying `Question` in the bank. |
| `enonce` | `string` | Full question text. |
| `bareme_pts` | `number` | Points awarded for this question in this quiz context. |
| `type_code` | `string` | Type code of the question (e.g., `"QCU"`, `"QCM"`, `"OUV"`). |
| `options` | `array` | All answer options for this question (see below). |

**`options[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `Reponse` (answer option). |
| `texte` | `string` | Text of the answer option. |
| `est_correct` | `boolean` | Whether this option is marked as correct in the answer key. |
| `explication` | `string \| null` | Explanation shown to students after submission (can be null). |

---

## Pagination

If pagination is enabled, the response may wrap results in a paginated envelope:

```json
{
  "count": 12,
  "next": "http://localhost:8000/quizzes/5/questions/?page=2",
  "previous": null,
  "results": [
    { ... }
  ]
}
```

---

## Possible Errors

### ❌ 404 Not Found

Returned when the `quiz_id` does not correspond to an existing quiz:

```json
{
  "detail": "Not found."
}
```

### ❌ 403 Forbidden

Returned if permission checks prevent the user from viewing this quiz (should be rare since permission is `IsFormateurOrAdminOrReadOnly`).

---

## Related Endpoints

- [Assign Questions API](./question-assign.md) — add questions to a quiz.
- [Remove Question from Quiz API](./remove-question-from-quiz.md) — delete a question from a quiz.
- [Quiz Review API](./quiz-review.md) — student view of quiz corrections (after submission).
