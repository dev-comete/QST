# Question Detail API

Retrieves detailed information about a specific question from the question bank, including all its answer options, correctness flags, and explanations.

---

## Endpoint Overview

- **URL:** `/quizzes/banque-questions/<int:question_id>/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint provides a complete view of a single question, including all its metadata and answer options. It is typically used to display question details for previewing, editing, or inspecting questions in the bank.

---

## Request Parameters

### URL Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `question_id` | `integer` | ✅ | ID of the question to retrieve. |

### Example Request

```http
GET /quizzes/banque-questions/45/
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK`

```json
{
  "id": 45,
  "enonce_question": "Quelle est la capitale de la France ?",
  "organisation": 2,
  "is_active": true,
  "date_creation": "2026-07-10T09:00:00Z",
  "reponses": [
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
  ],
  "type_question": {
    "id": 1,
    "code": "QCU",
    "type_question": "Question à Choix Unique"
  },
  "bareme": {
    "id": 5,
    "pts": 2.5
  }
}
```

#### Response Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the question. |
| `enonce_question` | `string` | Full question text. |
| `organisation` | `integer` | ID of the organization that owns this question. |
| `is_active` | `boolean` | Whether this question is active (not soft-deleted). |
| `date_creation` | `datetime` | ISO 8601 timestamp of when the question was created. |
| `reponses` | `array` | All answer options for this question (see below). |
| `type_question` | `object` | Type information (QCU, QCM, etc.). |
| `bareme` | `object` | Default point value for this question. |

**`reponses[]` item:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `Reponse` (answer option). |
| `texte` | `string` | Text of the answer option. |
| `est_correct` | `boolean` | Whether this option is marked as correct. |
| `explication` | `string \| null` | Explanation shown during quiz review. |

**`type_question` object:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `TypeQuestion`. |
| `code` | `string` | Short code (e.g., `"QCU"`, `"QCM"`, `"OUV"`). |
| `type_question` | `string` | Human-readable name. |

**`bareme` object:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | ID of the `Bareme`. |
| `pts` | `number` | Default points assigned to this question. |

---

## Possible Errors

### ❌ 404 Not Found

Returned when the question does not exist or has been permanently deleted:

```json
{
  "detail": "Not found."
}
```

### ❌ 403 Forbidden

Returned if the user lacks permission to view this question (e.g., a formateur trying to view a question from a different organization). Depends on custom permission checks.

---

## Business Logic Notes

- **Soft Deletion:** Only active questions (with `is_active=True`) are returned. Deleted questions return `404`.
- **Multi-Tenancy:** Formateurs only see questions from their organization; admins see all questions.
- **Full Data:** Unlike the search endpoint, this returns all details including correctness flags and explanations.

---

## Related Endpoints

- [Question Bank Search API](./question-bank-search.md) — search and list multiple questions.
- [Create Full Question API](./question-create.md) — create a new question.
- [Quiz Assigned Questions API](./quiz-assigned-questions.md) — questions in a specific quiz.
