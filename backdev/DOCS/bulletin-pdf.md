# Apprenant Bulletin PDF API

Generates and returns a PDF report of a student's grades and performance for a specific vague (class cohort).

---

## Endpoint Overview

- **URL:** `/quizzes/bulletin/vague/<int:vague_id>/pdf/`
- **Method:** `GET`
- **Permissions:** `IsAuthenticated`
- **Authentication:** Required (JWT or Session Token)

### Description

This endpoint generates a PDF report containing a student's detailed bulletin (grade report) for a given vague. It includes:

- Student identity
- Vague and formation context
- Overall performance summary
- Per-quiz scores and percentages
- Detailed corrections (if applicable)

The PDF is returned as a file download.

---

## Request Parameters

### URL Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `vague_id` | `integer` | ✅ | ID of the vague for which the bulletin PDF is requested. |

### Request

```http
GET /quizzes/bulletin/vague/3/pdf/
Authorization: Bearer <your_token_here>
```

---

## Success Response

### Status: `200 OK`

Returns a PDF file with the following headers:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="Bulletin_Durand_Développement Web.pdf"
```

#### PDF Content

The PDF includes:

1. **Student Header**
   - Student name and ID
   - Assignment date

2. **Vague & Formation Context**
   - Formation name
   - Vague name and dates
   - Class information (if available)

3. **Performance Summary**
   - Total score obtained
   - Total score possible
   - Overall percentage
   - Progress (e.g., "3/5 quizzes completed")

4. **Per-Quiz Details**
   - Quiz title
   - Status (Not Started, In Progress, Completed)
   - Score obtained / Score maximum
   - Percentage
   - Pass/Fail indicator

5. **Optional Corrections** (if `?include_corrections=true`)
   - Question-by-question breakdown
   - Student's answers vs. correct answers
   - Per-question explanations

---

## Query Parameters (Optional)

| Parameter | Type | Default | Description |
| :--- | :--- | :---: | :--- |
| `include_corrections` | `boolean` | `false` | Whether to include detailed corrections in the PDF. |
| `include_signature` | `boolean` | `false` | Whether to include a space for signature. |

### Example with Options

```http
GET /quizzes/bulletin/vague/3/pdf/?include_corrections=true&include_signature=true
Authorization: Bearer <your_token_here>
```

---

## Error Responses

### ❌ 403 Forbidden

Returned when the student is not enrolled in the requested vague:

```json
{
  "error": "Vous n'êtes pas inscrit à cette vague."
}
```

### ❌ 404 Not Found

Returned when the vague does not exist:

```json
{
  "detail": "Not found."
}
```

### ❌ 500 Internal Server Error

Returned if the PDF generation fails (e.g., missing template):

```json
{
  "error": "Erreur lors de la génération du PDF"
}
```

---

## File Download Behavior

- The browser will automatically download the PDF file using the filename specified in the `Content-Disposition` header.
- Filename format: `Bulletin_<last_name>_<formation_name>.pdf`
- Example: `Bulletin_Durand_Développement Web.pdf`

---

## Business Logic Notes

### Data Source

- The endpoint delegates to the same service as the [Apprenant Bulletin API](./apprenant-bulletin.md) (`get_apprenant_bulletin_service`) to fetch all data.
- It then renders this data into an HTML template and converts it to PDF using `render_to_pdf`.

### Security

- The endpoint enforces enrollment checks: only students enrolled in the given vague can download their own bulletin.
- Formateurs and admins cannot use this endpoint (though they can generate reports via analytics endpoints).

### Template

- PDF rendering requires a Django template at `templates/bulletin_template.html`.
- This template receives the bulletin data in the context as `data`.

---

## Related Endpoints

- [Apprenant Bulletin API (JSON)](./apprenant-bulletin.md) — same data as JSON (no PDF).
- [Formateur Vague Analytics API](./formateur-vague-analytics.md) — formateur view of class-wide analytics.
- [My Quiz List API](./apprenant-quiz-list.md) — student's full quiz list.
