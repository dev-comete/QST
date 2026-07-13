# Core Resource CRUD APIs (The Bank & Catalog)

Standard `ModelViewSet` endpoints exposing full CRUD (`list`, `retrieve`, `create`, `update`, `partial_update`, `destroy`) over the core building-block models used to compose quizzes. These are typically consumed by admin/formateur tooling rather than the student-facing app.

---

## Shared Conventions

* **Permissions:** `IsFormateurOrAdminOrReadOnly` on every viewset below — read access (`GET`) is open to any authenticated caller, write access (`POST`/`PUT`/`PATCH`/`DELETE`) is restricted to Formateurs/Admins.
* **Authentication:** Required (JWT or Session Token) for write operations.
* **Pattern:** All routes follow the standard DRF router convention: list/create at the collection URL, retrieve/update/delete at `<id>/`.

| Resource | Model | Serializer | Suggested Base URL |
| :--- | :--- | :--- | :--- |
| Quiz | `Quiz` | `QuizSerializer` | `/quizzes/quiz/` |
| Question | `Question` | `QuestionSerializer` | `/quizzes/questions/` |
| Réponse | `Reponse` | `ReponseSerializer` | `/quizzes/reponses/` |
| Type de Question | `TypeQuestion` | `TypeQuestionSerializer` | `/quizzes/types/` |
| Barème | `Bareme` | `BaremeSerializer` | `/quizzes/baremes/` |
| Question ↔ Type | `QuestionTypeQuestion` | `QuestionTypeQuestionSerializer` | `/quizzes/question-types/` |
| Question ↔ Barème | `QuestionBareme` | `QuestionBaremeSerializer` | `/quizzes/question-baremes/` |

> ⚠️ Confirm the exact base paths against `urls.py` — the values above follow the app's naming convention but are not guaranteed to be exact.

---

## Quiz (`QuizSerializer`, `fields = '__all__'`)

```json
{
  "id": 1,
  "formation": 4,
  "date_creation_quiz": "2026-07-10T09:00:00Z",
  "duree": "00:45:00",
  "status": "draft"
}
```

> `date_creation_quiz` is `auto_now_add` and effectively read-only regardless of what's submitted. `status` is currently writable via the API since no `read_only_fields` are declared — confirm whether it should be restricted so only the service layer can transition a quiz between states (e.g. `draft` → `published` → `closed`).

## Question (`QuestionSerializer`)

```json
{
  "id": 5,
  "enonce_question": "Quel est le plus grand océan du monde ?"
}
```

> Note this viewset creates a *bare* `Question` row with no type, barème, or answers attached — for a fully configured question in one call, use the [Create Full Question API](./create_full_question_api.md) instead.

## Réponse (`ReponseSerializer`)

```json
{
  "id": 12,
  "reponse": "Océan Pacifique"
}
```

## Type de Question (`TypeQuestionSerializer`)

```json
{
  "id": 1,
  "type_question": "QCU"
}
```

## Barème (`BaremeSerializer`)

```json
{
  "id": 2,
  "pts": 5.0
}
```

## Question ↔ Type / Question ↔ Barème Link Tables

These two viewsets expose the raw join tables (`QuestionTypeQuestion`, `QuestionBareme`) directly. In most workflows these links are created indirectly through the [Create Full Question API](./create_full_question_api.md) or the [Assign Questions API](./assign_questions_api.md) rather than hit directly — direct access is mainly useful for admin correction/cleanup.

```json
{
  "id": 9,
  "question": 5,
  "type_question": 1
}
```

```json
{
  "id": 14,
  "question": 5,
  "bareme": 2
}
```

---

## Common Responses

| Status | Meaning |
| :--- | :--- |
| `200 OK` | Successful `GET`, `PUT`, or `PATCH` |
| `201 Created` | Successful `POST` |
| `204 No Content` | Successful `DELETE` |
| `400 Bad Request` | Validation failure (e.g. missing required field, duplicate under a `unique_together` constraint) |
| `403 Forbidden` | Write attempted by a non-Formateur/Admin user |