# Question Bank Search API

This endpoint allows an authenticated user to search the question bank and retrieve paginated results for reuse in quiz building.

---

## Endpoint Overview

- **URL:** `/quizzes/banque-questions/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

This API searches existing questions from the question bank by text and/or question type. It is primarily used by formateurs and admins when selecting questions to assign to a quiz.

The service layer:
- searches by question text using a case-insensitive contains filter;
- optionally filters by type code such as `QCU`, `QCM`, or `OUV`;
- returns the results with pagination.

---

## Request Parameters

### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `search` | `string` | ❌ | Text to search inside the question statement. |
| `type` | `string` | ❌ | Type code to filter the questions, for example `QCU`, `QCM`, or `OUV`. |
| `page` | `integer` | ❌ | Page number for pagination. |
| `page_size` | `integer` | ❌ | Number of results per page. Default is `15`, max is `50`. |

### Example Request

```http
GET /quizzes/banque-questions/?search=capital&type=QCU&page=1&page_size=10
Authorization: Bearer <your_token_here>
```

---

## Response Format

The endpoint returns a paginated JSON response with the following structure:

```json
{
  "count": 42,
  "next": "http://localhost:8000/quizzes/banque-questions/?page=2&page_size=10",
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
          "explication": "Paris est la capitale de la France."
        },
        {
          "id": 4,
          "texte": "Lyon",
          "est_correct": false,
          "explication": ""
        }
      ]
    }
  ]
}
```

### Response Fields

- `count`: total number of matching questions.
- `next`: URL of the next page if one exists.
- `previous`: URL of the previous page if one exists.
- `results`: array of matching questions.

Each item in `results` contains:
- `id`: question ID.
- `enonce_question`: the question statement.
- `reponses`: list of answer options with:
  - `id`: response ID;
  - `texte`: the option text;
  - `est_correct`: whether the option is marked as correct;
  - `explication`: optional explanation linked to that option.

---

## Business Notes

- The search is case-insensitive.
- The search term is applied to the question statement only.
- The type filter uses the question type code stored in the database.
- Results are ordered by most recent questions first.
- The endpoint does not assign questions to a quiz; it only returns candidates from the bank.

---

## Possible Errors

### 401 Unauthorized
Returned when no valid authentication token is provided.

```json
{
  "detail": "Authentication credentials were not provided."
}
```
