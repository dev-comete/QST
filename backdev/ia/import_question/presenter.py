"""
LAYER 4 - PRESENTER: NormalizationResult -> JSON-ready dict (the API contract).

Pure function. If the front-end contract changes, this is the only file to touch.
Field names keep the ones already used by the existing front-end
(enonce_question, reponse, est_correct, ...).
"""
from .schemas import NormalizationResult


def to_api_payload(
    result: NormalizationResult,
    type_ids: dict[str, int],
    default_points: float = 1.0,
) -> dict:
    questions = []
    for q in result.questions:
        warnings = list(q.warnings)
        type_id = type_ids.get(q.type_code)
        if type_id is None:
            warnings.append("unknown_type")     # kept for review instead of silently dropped

        questions.append(
            {
                "enonce_question": q.question,
                "type_code": q.type_code,
                "type_id": type_id,
                "bareme_pts": default_points,
                "options": [
                    {"reponse": o.text, "est_correct": o.is_correct, "explication": ""}
                    for o in q.options
                ],
                "warnings": warnings,
            }
        )

    return {
        "count": len(questions),
        "skipped": result.skipped,
        "questions": questions,
    }
