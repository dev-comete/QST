# Create Full Question API (The Factory)

This endpoint allows Formateurs and Admins to create a complete question in one request, including its text, question type, bareme, and all associated answer choices.

---

## Endpoint Overview

* **URL:** `/quizzes/questions/create-full/`
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdminOrReadOnly`
* **Authentication:** Required (JWT or Session Token)

### Description
This endpoint creates a `Question` and all linked data in one call:

- `Question`
- `QuestionTypeQuestion`
- `QuestionBareme`
- `Reponse`
- `Corrigee`

The implementation is in `CreateFullQuestionAPIView` and delegues to `create_question_with_answers(...)` in the service layer.

This is the main factory endpoint for the question bank.

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
| `enonce_question` | `string` | ✅ | The exact text of the question. |
| `type_id` | `integer` | ✅ | ID of the `TypeQuestion` model. |
| `bareme_pts` | `number` | ✅ | Points assigned to the question. It is converted to a `Bareme` if needed. |
| `options` | `array` | ❌ | List of answer choices. Allowed to be empty for open questions. |
| `options[].reponse` | `string` | ✅ | Text of the answer option. |
| `options[].est_correct` | `boolean` | ❌ | Whether this option is correct. Defaults to `false`. |
| `options[].explication` | `string` | ❌ | Optional explanation associated with that option. |

### Example Request Body (QCU)
```json
{
  "enonce_question": "Quel est le plus grand océan du monde ?",
  "type_id": 1,
  "bareme_pts": 2.5,
  "options": [
    {
      "reponse": "Océan Atlantique",
      "est_correct": false,
      "explication": "L'Atlantique est plus petit que le Pacifique."
    },
    {
      "reponse": "Océan Pacifique",
      "est_correct": true,
      "explication": "Le Pacifique est le plus grand océan du monde."
    },
    {
      "reponse": "Océan Indien",
      "est_correct": false,
      "explication": "L'océan Indien est plus petit que le Pacifique."
    }
  ]
}
```

### Example Request Body (Open Question)
```json
{
  "enonce_question": "Décrivez les impacts du climat sur les écosystèmes.",
  "type_id": 3,
  "bareme_pts": 4,
  "options": []
}
```

---

## Business Logic Guardrails

The backend validates the request before creating rows:

1. **Type existence check**
   - if `type_id` does not exist, the API returns a `400`.

2. **Bareme creation**
   - `bareme_pts` is converted to a numeric `Bareme` value.
   - If the value is invalid, the API rejects it.

3. **QCU validation**
   - If the type code is `QCU`, there must be exactly one correct answer.

4. **QCM validation**
   - If the type code is `QCM`, there must be at least one correct answer.

5. **Open question validation**
   - If the type code is `OUV`, the `options` list must be empty.

6. **Answer deduplication**
   - identical `reponse` texts are reused via `Reponse.objects.get_or_create(...)` to avoid duplicate copies.

---

## API Responses

### 🟢 201 Created
```json
{
  "message": "Question ajoutée avec succès à la banque !",
  "question_id": 42
}
```

### 🔴 400 Bad Request
```json
{
  "error": "Un QCU (Choix Unique) doit avoir exactement UNE réponse correcte."
}
```

### 🔴 400 Bad Request (invalid type)
```json
{
  "error": "Le Type spécifié n'existe pas."
}
```

---

## Actual Implementation References

- Route: `quizzes/urls.py` → `path('questions/create-full/', CreateFullQuestionAPIView.as_view(), name='create-full-question')`
- View: `quizzes/views.py` → `CreateFullQuestionAPIView`
- Serializer: `quizzes/serializers.py` → `CreateFullQuestionSerializer`
- Service: `quizzes/services.py` → `create_question_with_answers(...)`
