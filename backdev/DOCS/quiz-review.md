# Quiz Review API

Returns the detailed correction (review) of a quiz the authenticated user has already completed, including per-question scoring and per-option correctness/explanations.

## Endpoint

```
GET /<int:quiz_id>/review/
```

| | |
|---|---|
| **View** | `QuizReviewAPIView` |
| **URL name** | `quiz-review` |
| **HTTP method** | `GET` |
| **Authentication** | Required (`IsAuthenticated`) — consider adding `IsApprenant` if only learners should access this |

## Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `quiz_id` | `int` | ID of the quiz to review |

## Authentication & Permissions

- Requires a valid authenticated user (`IsAuthenticated`).
- The user must have an associated `UtilisateurQuiz` assignment for the given `quiz_id` (returns `404` otherwise via `get_object_or_404`).
- The quiz assignment must be marked as **finished** (`termine=True`). If not, the endpoint returns a `403 Forbidden`.

## Responses

### ✅ 200 OK

Returned when the quiz is completed and review data is available.

```json
{
  "quiz_id": 12,
  "score_final": 8.5,
  "corrections": [
    {
      "question_id": 45,
      "enonce": "Quelle est la capitale de Madagascar ?",
      "points_obtenus": 1,
      "vrai_ou_faux": true,
      "options": [
        {
          "reponse_id": 101,
          "texte": "Antananarivo",
          "est_correct": true,
          "choisi_par_apprenant": true,
          "explication": "Antananarivo est la capitale et plus grande ville de Madagascar."
        },
        {
          "reponse_id": 102,
          "texte": "Toamasina",
          "est_correct": false,
          "choisi_par_apprenant": false,
          "explication": "Toamasina est un port important mais n'est pas la capitale."
        }
      ]
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|---|---|---|
| `quiz_id` | `int` | ID of the reviewed quiz |
| `score_final` | `number` | Final score obtained by the user (`assignment.score_obtenu`) |
| `corrections` | `array` | List of corrected questions (see below) |

**`corrections[]` item:**

| Field | Type | Description |
|---|---|---|
| `question_id` | `int` | ID of the question |
| `enonce` | `string` | Question text |
| `points_obtenus` | `number` | Points earned by the user for this question |
| `vrai_ou_faux` | `bool` | Whether the user's answer was correct |
| `options` | `array` | All possible answer options for the question (see below) |

**`options[]` item:**

| Field | Type | Description |
|---|---|---|
| `reponse_id` | `int` | ID of the answer option |
| `texte` | `string` | Text of the answer option |
| `est_correct` | `bool` | Whether this option is a correct answer |
| `choisi_par_apprenant` | `bool` | Whether the learner selected this option |
| `explication` | `string \| null` | Explanation specific to this option, if any |

### ❌ 403 Forbidden

Returned when the quiz assignment exists but hasn't been completed yet.

```json
{
  "error": "Vous ne pouvez pas voir la correction d'un quiz non terminé."
}
```

### ❌ 404 Not Found

Returned when no `UtilisateurQuiz` assignment exists for this user and `quiz_id` (i.e., the user was never assigned / never started this quiz).

## Behavior Notes

- **Ownership scoping**: All data is filtered by `request.user`, so users can only review their own quiz attempts.
- **Data sources**:
  - `UtilisateurQuiz` — the user's quiz assignment (checks completion status and stores final score).
  - `Valiny` — the user's validated answers per question (`vrai_ou_faux`, `pts`, `reponses_choisies`).
  - `Corrigee` — the full answer key for each question, including per-option correctness and explanation text.
- **Query optimization**: Uses `select_related('question')` and `prefetch_related('reponses_choisies')` on the `Valiny` queryset, and `select_related('reponse')` on the `Corrigee` queryset to limit N+1 query issues.
- **Full option list**: Unlike a simple "which IDs did the user pick / which IDs were correct" response, this endpoint returns **every** option for each question, annotated with both its correctness and whether the learner chose it — enabling a rich, per-option review UI.

## Example Request

```http
GET /42/review/ HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

## Suggested Improvements

- Enforce `IsApprenant` (or equivalent role-based permission) if this endpoint should be restricted to learners only.
- Consider returning `404` with a more specific error body distinguishing "quiz not found" vs. "not assigned to you" vs. "quiz has no questions".
- Consider paginating `corrections` for quizzes with a very large number of questions.
