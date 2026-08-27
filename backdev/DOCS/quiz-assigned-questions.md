## QuizAssignedQuestionsListAPIView

Description
---------------
Retourne la liste détaillée de toutes les questions assignées à un quiz spécifique. Cette vue est utilisée principalement par les formateurs / administrateurs pour voir le contenu d'un quiz (questions, type, barème, options et éventuelles explications).

Endpoint
---------------
- URL: `/<quiz_id>/questions/` (route app `quizzes`, name: `quiz-assigned-questions`)
- Method: `GET`

Permissions
---------------
- `IsFormateurOrAdminOrReadOnly` (par défaut restreint aux formateurs ou administrateurs selon la logique personnalisée). Adapté selon vos besoins.

URL Parameters
---------------
- `quiz_id` (int) — Identifiant du quiz dont on veut lister les questions.

Response Schema
---------------
La vue utilise le serializer `QuizQuestionSerializer`. Chaque élément de la liste contient les champs suivants:

- `id` : integer — ID interne du lien `QuizQuestion`.
- `quiz_id` : integer — ID du quiz.
- `question_id` : integer — ID de la question dans la banque.
- `enonce_question` : string — L'énoncé textuel de la question.
- `type_id` : integer — ID du type de question.
- `type_nom` : string — Nom lisible du type de question (ex: QCM, ouverte).
- `bareme_id` : integer — ID du barème associé à la question.
- `points` : float — Nombre de points attribués à la question.
- `options` : array — Liste des options/choix associés (vide pour les questions ouvertes). Chaque option contient:
  - `reponse_id`: integer — ID de la `Reponse` liée.
  - `texte`: string — Texte de l'option.
  - `est_correct`: boolean — Indique si l'option est correcte (visible aux formateurs/admins).
  - `explication`: string — Explication affichée lors de la correction.

Example Request
---------------
GET /api/quizzes/42/questions/

Example Response (200)
---------------
[
  {
    "id": 12,
    "quiz_id": 42,
    "question_id": 7,
    "enonce_question": "Quelle est la capitale de la France ?",
    "type_id": 2,
    "type_nom": "QCM",
    "bareme_id": 3,
    "points": 2.5,
    "options": [
      {
        "reponse_id": 21,
        "texte": "Paris",
        "est_correct": true,
        "explication": "Paris est la capitale depuis des siècles."
      },
      {
        "reponse_id": 22,
        "texte": "Lyon",
        "est_correct": false,
        "explication": "Lyon n'est pas la capitale."
      }
    ]
  }
]

Errors
---------------
- `403 Forbidden` — Si l'utilisateur n'a pas les permissions nécessaires.
- `404 Not Found` — Si la route ou le préfixe API n'existe pas (selon configuration) ; la vue en elle-même retourne une liste vide si aucun `QuizQuestion` n'est trouvé pour l'`quiz_id` fourni.

Notes
---------------
- Le serializer `QuizQuestionSerializer` construit la liste `options` en interrogeant la table `Corrigee` et fournit un aperçu complet destiné aux formateurs (incluant `est_correct` et `explication`). Pour l'affichage côté apprenant, utilisez `StudentQuizQuestionSerializer` qui masque `est_correct`.
