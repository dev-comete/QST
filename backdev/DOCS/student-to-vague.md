# Assign Students to Vague API

Allows a Formateur (owner of the related Formation) or an Admin to enroll one or many apprenants into a specific `Vague` in one request.

When students are newly enrolled, the system also auto-assigns all existing quizzes belonging to that formation to each new student.

---

## Endpoint Overview

* **URL:** `/vagues/assign-student/`
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdminOrReadOnly`
* **Authentication:** Required (JWT or Session Token)

### Description
This endpoint accepts a `vague_id` and a list of `etudiant_ids` to create `UtilisateurVague` links in bulk. The same user cannot be duplicated in the same vague; duplicates are prevented via the database uniqueness constraint and `get_or_create` logic.

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
| `vague_id` | `integer` | ✅ | ID of the target `Vague`. |
| `etudiant_ids` | `array[integer]` | ✅ | List of apprenant user IDs to enroll. One or many users may be passed at once. |

### Example Request Body
```json
{
  "vague_id": 12,
  "etudiant_ids": [17, 18, 19]
}
```

---

## Business Logic Guardrails

1. **Bulk Enrolment:** `etudiant_ids` accepts a list, so the endpoint can assign several apprenants in a single request instead of one by one.
2. **Student Validation:** Every ID in `etudiant_ids` must resolve to an existing user whose `type_utilisateur` is `'apprenant'`; otherwise the request is rejected with `400 Bad Request`.
3. **Ownership Enforcement:** Non-admin Formateurs may only assign students to vagues belonging to formations they created. A mismatch returns `403 Forbidden`.
4. **Auto-Quiz Sync:** For each newly enrolled apprenant, all quizzes in the formation are auto-created in `UtilisateurQuiz` if they do not already exist.
5. **Atomic Transaction:** If one apprenant is invalid, the whole request is rolled back to keep the database consistent.

---

## API Responses

### 🟢 201 Created
```json
{
  "message": "2 étudiant(s) assigné(s) à la vague 12. 8 quiz auto-assignés au total."
}
```

### 🔴 400 Bad Request
```json
{
  "error": "L'utilisateur johndoe n'a pas le rôle 'apprenant'."
}
```

### 🔴 403 Forbidden
```json
{
  "error": "Vous ne pouvez assigner des étudiants qu'à vos propres vagues."
}
```

---

## Notes

- This endpoint is designed for bulk intake of students into a class (`Vague`).
- It is not a quiz assignment endpoint; it creates the enrolment to the vague and then mirrors the formation's quizzes to the newly added apprenants.
- The request should send a list, not a single `etudiant_id` value.
