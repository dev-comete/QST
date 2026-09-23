# Formateur Vague Analytics API

This endpoint returns analytics for a specific formation cohort (`Vague`) so a formateur or admin can evaluate class performance and identify difficult questions.

---

## Endpoint Overview

- **URL:** `/quizzes/analytics/vague/<int:vague_id>/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

This API provides:
- global statistics for the entire vague;
- per-quiz statistics for every quiz attached to the formation of that vague;
- the most difficult question detected from failed attempts;
- top and bottom performers for the class.

Access is restricted to the formation creator or a superuser/admin.

---

## Request Parameters

### URL Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `vague_id` | `integer` | ✅ | ID of the vague whose analytics are requested. |

### Example Request

```http
GET /quizzes/analytics/vague/3/
Authorization: Bearer <your_token_here>
```

---

## Response Format

```json
{
  "vague": {
    "id": 3,
    "formation": "Développement Web",
    "total_inscrits": 18
  },
  "statistiques_globales": {
    "points_totaux_possibles": 120.0,
    "moyenne_globale_classe": 74.5,
    "taux_reussite_global_pct": 61.1,
    "majors_de_promo_top3": [
      {
        "utilisateur__username": "alice",
        "utilisateur__first_name": "Alice",
        "utilisateur__last_name": "Durand",
        "score_cumule": 110.0
      }
    ],
    "etudiants_en_difficulte_bottom3": []
  },
  "statistiques_par_quiz": [
    {
      "quiz_id": 7,
      "status": "publie",
      "points_maximum": 40.0,
      "taux_participation_pct": 100.0,
      "moyenne_classe": 32.5,
      "taux_reussite_pct": 75.0,
      "top_3": [
        {"username": "alice", "score": 38.0}
      ],
      "bottom_3": [
        {"username": "bob", "score": 20.0}
      ],
      "alerte_question_difficile": "Quelle est la syntaxe correcte ?",
      "nombre_echecs_question": 6
    }
  ]
}
```

---

## Business Notes

- The view delegates to the analytics service layer.
- The endpoint only works for the formation creator or a superuser/admin.
- If no students are enrolled in the vague, the API returns a message explaining that there is no data yet.
- Quiz-level difficulty is inferred from failed student answers (`Valiny`).

---

## Possible Errors

### 403 Forbidden
Returned when the requester is not the formation creator and is not an admin/superuser.

```json
{
  "detail": "Vous n'êtes pas autorisé à voir les statistiques de cette vague."
}
```
