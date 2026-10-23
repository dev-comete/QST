# ia/import_questions: AI question import

```
HTTP        views.py ──► serializers.py            validate input, map errors -> status codes
                │
Orchestrate  service.py                            chains the layers + cache (same file = no 2nd AI call)
                │
  1 Read      readers.py      file -> text/bytes   keeps "correct answer" signals ([HL] = highlight, **bold**)
  2 AI        prompts.py + llm.py                  Gemini call, retry, truncation + schema checks
  3 Normalize normalizer.py   (pure)               clean text, QCU/QCM/OUV inferred in code, warnings
  4 Present   presenter.py    (pure)               shape of the JSON sent to the front-end
                │
DB          repository.py                          only file touching the ORM (TypeQuestion)

Cross-cutting: config.py (all tunables), schemas.py (data shapes), exceptions.py (domain errors)
```

## Install
- `pip install pypdf` is NOT needed (PDFs go straight to Gemini). Needs: `openpyxl python-docx pydantic google-genai`.
- settings.py: `GEMINI_API_KEY`, optional `GEMINI_MODEL`, and
  `REST_FRAMEWORK = {"DEFAULT_THROTTLE_RATES": {"question_import": "20/hour"}}`
- repository.py: fix the `TypeQuestion` import path.
- urls.py: `path("import-questions/", ImportQuestionsIAAPIView.as_view())`
- Tests: `python manage.py test ia.import_questions`

## Debugging: "where did it go wrong?"
Set logger `ia.import_questions` to DEBUG. You get, in order:
1. the exact annotated text sent to the AI (readers)    -> wrong/missing answers? look here first
2. the raw AI output (llm)                              -> AI misread the text?
3. warnings per question in the response (normalizer)   -> `no_correct_answer`, `too_few_options`...

| Symptom | Layer |
|---|---|
| correct answers never detected | readers (is `[HL]` present in the DEBUG text?) |
| questions missing / merged | prompts.py |
| 502/503/422 `llm_*` codes | llm.py |
| wrong type (QCU/QCM) | normalizer.infer_type |
| front-end field names | presenter.py |

## Response
```json
{"message": "...", "count": 2, "skipped": 0,
 "questions": [{"enonce_question": "...", "type_code": "QCU", "type_id": 1, "bareme_pts": 1.0,
   "options": [{"reponse": "...", "est_correct": true, "explication": ""}],
   "warnings": []}]}
```
Errors: `{"error": "<message>", "code": "<machine_code>"}`.
