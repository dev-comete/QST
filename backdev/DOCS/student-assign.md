# Assign Student API (The Roster Manager)

Allows a Formateur (owner of the related Formation) or an Admin to assign an individual student to a quiz, creating the `UtilisateurQuiz` record that makes the quiz appear in that student's to-do list.

---

## Endpoint Overview

* **URL:** `/quizzes/assign-student/` *(confirm exact path against `urls.py`)*
* **Method:** `POST`
* **Permissions:** `IsFormateurOrAdminOrReadOnly`
* **Authentication:** Required (JWT or Session Token)

### Description
Creates (or confirms) a link between a student and a quiz via `UtilisateurQuiz.objects.get_or_create`. The endpoint is idempotent — assigning the same student to the same quiz twice does not raise an error or duplicate a row.

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
| `etudiant_id` | `integer` | ✅ | ID of the user to assign. Must exist and have `type_utilisateur == 'apprenant'`. |
| `quiz_id` | `integer` | ✅ | ID of the target quiz. |

### Example Request Body
```json
{
  "etudiant_id": 17,
  "quiz_id": 1
}
```

---

## Business Logic Guardrails

1. **Student Validation:** `etudiant_id` must resolve to an existing user whose `type_utilisateur` is `'apprenant'`; otherwise the serializer rejects the request with a `400`.
2. **Ownership Enforcement:** Non-admin Formateurs may only assign students to quizzes belonging to formations they created. A mismatch returns `403 Forbidden`.
3. **Idempotency:** If the student is already assigned to the quiz, the endpoint returns `200 OK` with a notice instead of creating a duplicate or erroring.

---

## API Responses

### 🟢 201 Created
```json
{
  "message": "Étudiant johndoe assigné avec succès au quiz 1."
}
```

### 🟢 200 OK (Already Assigned)
```json
{
  "message": "L'étudiant est déjà assigné à ce quiz."
}
```

### 🔴 400 Bad Request
```json
{
  "etudiant_id": ["Cet utilisateur n'est pas un apprenant."]
}
```

### 🔴 403 Forbidden
```json
{
  "error": "Vous ne pouvez assigner des étudiants qu'à vos propres quiz."
}
```