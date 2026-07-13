# Quiz API Documentation

This document outlines the two-step architecture for creating and assigning questions in our e-learning platform. 

To ensure maximum scalability and reusability, our platform separates **Question Creation** (adding to the Question Bank) from **Question Assignation** (building a specific Quiz).

---

## 1. Create a Full Question (The "Factory")

This endpoint acts as the factory. It allows Formateurs to create a question, define its type and points, and set its answers all in one single payload.

* **URL:** `/quizzes/questions/create-full/`
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdmin`

### Description
Behind the scenes, this endpoint automatically handles deduplication. If a `Reponse` string (e.g., "Vrai" or "Faux") already exists in the dictionary, it reuses it to save database space, while safely managing the context (whether it is correct or incorrect) via the `Corrigee` table.

### Request Body (JSON)

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `enonce_question` | `string` | ✅ | The actual text of the question. |
| `type_id` | `integer` | ✅ | The ID representing the type (e.g., QCM, QCU, Ouverte). |
| `bareme_id` | `integer` | ✅ | The ID representing the point value. |
| `options` | `array` | ❌ | List of answer options. Required for QCM/QCU, must be empty for open questions. |
| `options[].reponse` | `string` | ✅ | The text of the answer option. |
| `options[].est_correct` | `boolean` | ❌ | `true` if this is the correct answer. Defaults to `false`. |

**Example Payload (QCU):**
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
    }
  ]
}