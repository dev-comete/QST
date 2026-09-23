# Apprenant Bulletin API

This endpoint returns a detailed bulletin of results for a single student within a specific vague.

---

## Endpoint Overview

- **URL:** `/quizzes/bulletin/<int:vague_id>/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

This API is intended for learners to view their own progress across the quizzes of a given vague.

It returns:
- the learner identity;
- the vague and formation context;
- a global summary of completed vs. possible points;
- a detailed line for each quiz in the formation.

Access is restricted to the student who is actually enrolled in the vague.

---

## Request Parameters

### URL Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `vague_id` | `integer` | ✅ | ID of the vague for which the bulletin is requested. |

### Example Request

```http
GET /quizzes/bulletin/3/
Authorization: Bearer <your_token_here>
```

---

## Response Format

```json
{
  "apprenant": {
    "id": 12,
    "nom": "Durand",
    "prenom": "Alice",
    "username": "alice"
  },
  "vague": {
    "id": 3,
    "formation": "Développement Web"
  },
  "resume_global": {
    "total_score_obtenu": 74.5,
    "total_score_possible": 120.0,
    "moyenne_generale_pct": 62.1,
    "progression": "2/4 quiz terminés"
  },
  "details_quizzes": [
    {
      "quiz_id": 7,
      "statut": "Terminé",
      "score_obtenu": 38.0,
      "score_maximum": 40.0,
      "pourcentage": 95.0
    },
    {
      "quiz_id": 8,
      "statut": "En cours",
      "score_obtenu": 0.0,
      "score_maximum": 30.0,
      "pourcentage": 0.0
    }
  ]
}
```

---

## Business Notes

- The endpoint checks that the requester is enrolled in the targeted vague.
- If the student is not enrolled, the API raises a permission error.
- Each quiz line reports whether it is not started, in progress, or completed.
- The global average is computed from the total score obtained over the total score possible for the vague.

---

## Possible Errors

### 403 Forbidden
Returned when the student is not enrolled in the requested vague.

```json
{
  "error": "Vous n'êtes pas inscrit à cette vague."
}
```
