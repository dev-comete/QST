# 📚 API Reference: Assign Quiz to Vague (Bulk Assignment)

This endpoint allows a Formateur or Admin to assign a specific Quiz to an entire classroom (`Vague`) at once. The system will automatically fetch all students currently enrolled in the specified `Vague` and create an individual `UtilisateurQuiz` assignment for each of them.

---

## 🔗 Endpoint Details

*   **URL:** `/api/quizzes/assign-to-vague/` *(Adjust route based on your urls.py)*
*   **Method:** `POST`
*   **Content-Type:** `application/json`

## 🔐 Authorization & Permissions

*   **Authentication:** Required (Bearer Token / Session)
*   **Roles Allowed:** `formateur` or `admin`
*   **Ownership Check:** A Formateur can only assign quizzes that belong to a `Formation` they created. Admins bypass this check.

---

## 📥 Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `quiz_id` | `integer` | **Yes** | The ID of the Quiz to be assigned. |
| `vague_id` | `integer` | **Yes** | The ID of the Vague (classroom) receiving the Quiz. |

### Example Payload
```json
{
  "quiz_id": 5,
  "vague_id": 12
}

