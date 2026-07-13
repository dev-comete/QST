# Create Full Question API (The Factory)

This endpoint allows Formateurs and Admins to create a complete question configuration—including its énoncé text, type, point scale, and all associated answer options (both correct and incorrect)—in a single request payload.

---

## Endpoint Overview

* **URL:** `/quizzes/questions/create-full/`
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdminOrReadOnly`
* **Authentication:** Required (JWT or Session Token)

### Description
This endpoint serves as the central data entry point for the **Question Bank**. It processes multi-table relational inserts across `Question`, `QuestionTypeQuestion`, `QuestionBareme`, `Reponse`, and `Corrigee` atomically.

To save database overhead, answer strings are deduplicated automatically via a `get_or_create` workflow, allowing identical choices (e.g., "Vrai", "Faux") to share rows globally while preserving isolated correct/incorrect statuses per question context.

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
| `enonce_question` | `string` | ✅ | The definitive text of the question. |
| `type_id` | `integer` | ✅ | Reference ID for the question type (e.g., 1 for QCU, 2 for QCM). |
| `bareme_id` | `integer` | ✅ | Reference ID for the score allocation scale. |
| `options` | `array` | ❌ | Nested array of options. Required for objective question types. |
| `options[].reponse` | `string` | ✅ | Text value of the individual answer option. |
| `options[].est_correct` | `boolean` | ❌ | Flags if this option represents a correct answer. Defaults to `false`. |

### Example Request Body (QCU)
```json
{
  "enonce_question": "Quel est le plus grand océan du monde ?",
  "type_id": 1,
  "bareme_id": 2,
  "options": [
    {
      "reponse": "Océan Atlantique",
      "est_correct": false
    },
    {
      "reponse": "Océan Pacifique",
      "est_correct": true
    },
    {
      "reponse": "Océan Indien",
      "est_correct": false
    }
  ]
}
```

---

## Business Logic Guardrails

The service layer implements strict transactional enforcement before modifying data rows:
1. **QCU Validation:** Questions containing `'qcu'` in their type name must possess exactly **one** option where `est_correct` is `true`.
2. **QCM Validation:** Questions containing `'qcm'` in their type name must possess **at least one** option where `est_correct` is `true`.
3. **Open Question Validation:** Questions containing `'ouverte'` in their type name must contain zero options (`len(options) == 0`).

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