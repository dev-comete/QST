"""
ORCHESTRATOR: chains the layers. No business logic of its own.

    readers.py  -> llm.py -> normalizer.py
    (file->text)  (AI)       (clean + type + warnings)

To debug a bad import, set the logger "ia.import_questions" to DEBUG:
you will see the exact text sent to the AI and the raw AI output.
"""
import logging
import time

from django.core.cache import cache

from .config import conf
from .llm import extract_questions
from .normalizer import normalize
from .readers import read_raw_text, read_upload
from .schemas import AIExtraction, NormalizationResult, SourceDocument

logger = logging.getLogger(__name__)


def _extract_with_cache(document: SourceDocument) -> AIExtraction:
    """Same file/text twice -> no second (paid) AI call."""
    key = f"question_import:v2{document.fingerprint()}"
    cached = cache.get(key)
    if cached is not None:
        logger.info("cache hit %s", key)
        return AIExtraction.model_validate(cached)

    extraction = extract_questions(document)
    cache.set(key, extraction.model_dump(), conf().cache_ttl_seconds)
    return extraction


def import_questions(*, upload=None, text: str | None = None) -> NormalizationResult:
    """Exactly one of `upload` (Django UploadedFile) or `text` must be given."""
    started = time.monotonic()

    document = read_upload(upload) if upload is not None else read_raw_text(text or "")
    t_read = time.monotonic()

    extraction = _extract_with_cache(document)
    t_llm = time.monotonic()

    result = normalize(extraction)
    logger.info(
        "import done: %d questions (%d skipped) | read=%.2fs llm=%.2fs total=%.2fs",
        len(result.questions), result.skipped,
        t_read - started, t_llm - t_read, time.monotonic() - started,
    )
    return result
