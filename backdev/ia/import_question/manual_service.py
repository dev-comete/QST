"""
ISOLATED MANUAL IMPORT: file / text -> NormalizationResult using ONLY the rule-based parser.

No Gemini, no Ollama, no cache, no network. Purpose: measure how far the manual parser goes on
its own, and offer an AI-free import path.

    readers.py -> manual_parser.py -> normalizer.py
    (file->text)  (rules)             (clean + type + warnings)

Same readers and same normalizer as the AI pipeline, so results are directly comparable.
"""
import io
import logging
import time
from dataclasses import dataclass

from . import manual_parser
from .config import conf
from .exceptions import EmptyDocument, UnreadableFile, UnsupportedFileType
from .normalizer import normalize
from .readers import read_raw_text, read_upload
from .schemas import NormalizationResult, SourceDocument

logger = logging.getLogger(__name__)


@dataclass
class ManualImportReport:
    result: NormalizationResult
    layout: str                 # "spreadsheet" | "plain"
    text: str                   # the annotated text the parser actually saw
    raw_questions: int          # found by the parser, before the normalizer drops empty ones
    timings_ms: dict

    def stats(self) -> dict:
        """Numbers to judge the parser at a glance."""
        questions = self.result.questions
        total = len(questions)
        with_options = [q for q in questions if q.options]
        return {
            "layout": self.layout,
            "questions_found": total,
            "skipped": self.result.skipped,
            "open_questions": total - len(with_options),
            "with_correct_answer": sum(any(o.is_correct for o in q.options) for q in with_options),
            "without_correct_answer": sum(not any(o.is_correct for o in q.options) for q in with_options),
            "with_explanation": sum(any(getattr(o, "explanation", "") for o in q.options) for q in questions),
            "qcu": sum(q.type_code == "QCU" for q in questions),
            "qcm": sum(q.type_code == "QCM" for q in questions),
            "avg_options": round(sum(len(q.options) for q in with_options) / len(with_options), 1)
            if with_options else 0,
            "timings_ms": self.timings_ms,
        }


def _pdf_to_text(data: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise UnreadableFile(
            "Lecture des PDF indisponible pour l'import manuel.", detail="pypdf not installed"
        ) from exc
    try:
        reader = PdfReader(io.BytesIO(data))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception as exc:
        raise UnreadableFile(detail=f"pypdf failed: {exc!r}") from exc


def _document_text(document: SourceDocument) -> str:
    if not document.is_binary:
        return document.text or ""

    if document.mime_type == "application/pdf":
        text = _pdf_to_text(document.data)
        if len(text.strip()) < conf().min_text_chars:
            raise EmptyDocument(
                "Ce PDF ne contient pas de texte (scan ?). L'import manuel ne peut pas le lire.",
                detail="pdf has no text layer",
            )
        return text      # colors / bold are lost: only textual markers (*, Réponse : B...) work

    raise UnsupportedFileType(
        "L'import manuel ne lit pas les images : utilisez l'import par IA.",
        detail=f"manual import cannot read {document.mime_type}",
    )


def import_questions_manual(*, upload=None, text: str | None = None) -> ManualImportReport:
    """Exactly one of `upload` (Django UploadedFile) or `text` must be given."""
    t0 = time.monotonic()
    document = read_upload(upload) if upload is not None else read_raw_text(text or "")
    source_text = _document_text(document)
    t_read = time.monotonic()

    extraction = manual_parser.parse(source_text)
    t_parse = time.monotonic()

    result = normalize(extraction)
    t_norm = time.monotonic()

    timings = {
        "read": round((t_read - t0) * 1000),
        "parse": round((t_parse - t_read) * 1000),
        "normalize": round((t_norm - t_parse) * 1000),
        "total": round((t_norm - t0) * 1000),
    }
    logger.info(
        "manual import: %d questions found (%d skipped) in %d ms",
        len(result.questions), result.skipped, timings["total"],
    )
    return ManualImportReport(
        result=result,
        layout=manual_parser.detect_layout(source_text),
        text=source_text,
        raw_questions=len(extraction.questions),
        timings_ms=timings,
    )
