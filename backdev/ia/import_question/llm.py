"""
LAYER 2b - LLM: SourceDocument -> AIExtraction.

The ONLY module that knows about the AI providers (Gemini, Ollama).

    extract_questions()  tries the providers listed in QUESTION_IMPORT_LLM_PROVIDERS, in order
                         (default: ("gemini", "ollama", "manual")). If one is unavailable /
                         rate-limited / refuses / returns garbage, the next one is tried.
                         "manual" = rule-based parser (manual_parser.py): no AI, no network.

Each provider function `_<name>_extract(document) -> AIExtraction`:
  1. builds the request
  2. calls the model (Gemini: retry/backoff on transient errors)
  3. validates the answer and raises domain errors (exceptions.py)

Add a provider = write `_<name>_extract` and put <name> in the setting.
"""
import io
import logging
import time

from . import manual_parser
from .config import conf
from .exceptions import LLMOutputInvalid, LLMRequestFailed, LLMTruncated, LLMUnavailable
from .prompts import build_binary_prompt, build_text_prompt
from .schemas import AIExtraction, SourceDocument

logger = logging.getLogger(__name__)

_RETRYABLE_CODES = {429, 500, 503, 504}

# Errors that justify trying the next provider. LLMTruncated is NOT here:
# a document too long for one model will not be better handled by another.
_FALLBACK_ERRORS = (LLMUnavailable, LLMRequestFailed, LLMOutputInvalid)


# ===========================================================================
# GEMINI
# ===========================================================================
_client = None


def _get_client():
    global _client
    if _client is None:
        from google import genai
        _client = genai.Client(api_key=conf().gemini_api_key)
    return _client


def _build_contents(document: SourceDocument):
    if document.is_binary:
        from google.genai import types
        part = types.Part.from_bytes(data=document.data, mime_type=document.mime_type)
        return [part, build_binary_prompt()]
    return build_text_prompt(document.text)


def _call_with_retry(contents):
    from google.genai import errors, types

    cfg = conf()
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AIExtraction,
        temperature=0,
        max_output_tokens=cfg.max_output_tokens,
    )

    for attempt in range(1, cfg.llm_attempts + 1):
        try:
            return _get_client().models.generate_content(
                model=cfg.gemini_model, contents=contents, config=config
            )
        except errors.APIError as exc:
            code = getattr(exc, "code", None)
            retryable = code in _RETRYABLE_CODES
            logger.warning("gemini error code=%s attempt=%d/%d", code, attempt, cfg.llm_attempts)
            if not retryable:
                raise LLMRequestFailed(detail=f"code={code} {exc}") from exc
            if attempt == cfg.llm_attempts:
                raise LLMUnavailable(detail=f"code={code} after {attempt} attempts") from exc
            time.sleep(2 ** attempt)        # 2s, 4s, ...
        except Exception as exc:            # network down, DNS, timeout...: not an APIError
            logger.exception("gemini unexpected error")
            raise LLMUnavailable(detail=f"gemini transport error: {exc!r}") from exc


def _parse_response(response) -> AIExtraction:
    candidate = response.candidates[0] if getattr(response, "candidates", None) else None
    finish = str(getattr(candidate, "finish_reason", "") or "")
    if "MAX_TOKENS" in finish:
        raise LLMTruncated(detail=f"finish_reason={finish}")

    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, AIExtraction):
        return parsed

    # Fallback: schema parsing failed on the SDK side, try ourselves.
    text = getattr(response, "text", None)
    if text:
        try:
            return AIExtraction.model_validate_json(text)
        except Exception as exc:
            raise LLMOutputInvalid(detail=f"finish={finish} {exc}") from exc
    raise LLMOutputInvalid(detail=f"empty response, finish_reason={finish}")


def _gemini_extract(document: SourceDocument) -> AIExtraction:
    if not conf().gemini_api_key:
        raise LLMUnavailable(detail="GEMINI_API_KEY is not set")
    response = _call_with_retry(_build_contents(document))
    return _parse_response(response)


# ===========================================================================
# OLLAMA (local model, text only)
# ===========================================================================
def _pdf_to_text(data: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise LLMRequestFailed(detail="pypdf not installed (pip install pypdf)") from exc
    try:
        reader = PdfReader(io.BytesIO(data))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception as exc:
        raise LLMRequestFailed(detail=f"pypdf failed: {exc!r}") from exc


def _ollama_text(document: SourceDocument) -> str:
    """Local text models cannot read files: PDFs are converted to text, images are refused."""
    if not document.is_binary:
        return document.text or ""

    if document.mime_type == "application/pdf":
        text = _pdf_to_text(document.data)
        if len(text.strip()) < conf().min_text_chars:
            raise LLMRequestFailed(
                "Le modèle local ne peut pas lire ce PDF (scan ou image).",
                detail="pdf has no text layer",
            )
        logger.info("ollama: pdf converted to %d chars of text (colors/bold are lost)", len(text))
        return text

    raise LLMRequestFailed(
        "Le modèle local ne peut pas lire les images.",
        detail=f"ollama cannot read {document.mime_type}",
    )


def _ollama_extract(document: SourceDocument) -> AIExtraction:
    import requests

    cfg = conf()
    text = _ollama_text(document)
    if len(text) > cfg.ollama_max_input_chars:
        # Ollama silently truncates what exceeds num_ctx: better to refuse than to lose questions.
        raise LLMRequestFailed(
            "Document trop long pour le modèle local : découpez-le en plusieurs fichiers.",
            detail=f"{len(text)} chars > ollama_max_input_chars={cfg.ollama_max_input_chars}",
        )

    payload = {
        "model": cfg.ollama_model,
        "messages": [{"role": "user", "content": build_text_prompt(text)}],
        "stream": False,
        "format": AIExtraction.model_json_schema(),   # constrained JSON output
        "options": {
            "temperature": 0,
            "num_ctx": cfg.ollama_num_ctx,            # Ollama's default (2048) is far too small
            "num_predict": cfg.ollama_num_predict,
        },
    }
    url = f"{cfg.ollama_base_url.rstrip('/')}/api/chat"

    try:
        response = requests.post(url, json=payload, timeout=cfg.ollama_timeout)
    except requests.RequestException as exc:          # not running, refused, timeout...
        raise LLMUnavailable(detail=f"ollama unreachable at {url}: {exc!r}") from exc

    if response.status_code != 200:
        # 404 usually = model not pulled ("ollama pull llama3.2")
        raise LLMRequestFailed(detail=f"ollama http {response.status_code}: {response.text[:300]}")

    data = response.json()
    if data.get("done_reason") == "length":
        raise LLMTruncated(detail=f"ollama done_reason=length (num_predict={cfg.ollama_num_predict})")

    content = (data.get("message") or {}).get("content") or ""
    try:
        return AIExtraction.model_validate_json(content)
    except Exception as exc:
        raise LLMOutputInvalid(detail=f"ollama output invalid: {exc}") from exc


# ===========================================================================
# MANUAL (rules only, last resort)
# ===========================================================================
def _manual_extract(document: SourceDocument) -> AIExtraction:
    if not document.is_binary:
        text = document.text or ""
    elif document.mime_type == "application/pdf":
        text = _pdf_to_text(document.data)      # colors / bold are lost: only textual markers work
    else:
        raise LLMRequestFailed(
            "Les images ne peuvent pas être importées sans le service d'IA.",
            detail=f"manual parser cannot read {document.mime_type}",
        )

    extraction = manual_parser.parse(text)
    if not extraction.questions:
        raise LLMOutputInvalid(detail="manual parser found no question")
    return extraction


# ===========================================================================
# Public entry point
# ===========================================================================
def extract_questions_with_source(document: SourceDocument) -> tuple[AIExtraction, bool]:
    """
    Returns (extraction, is_fallback). is_fallback is True when the answer did NOT come from the
    first configured provider: the caller should not cache it (the main provider may be back soon).
    """
    providers = conf().llm_providers
    errors: list[Exception] = []

    for index, name in enumerate(providers):
        provider = globals().get(f"_{name}_extract")
        if provider is None:
            logger.error("unknown LLM provider %r in QUESTION_IMPORT_LLM_PROVIDERS", name)
            continue
        try:
            extraction = provider(document)
        except _FALLBACK_ERRORS as exc:
            logger.warning("provider %s failed (%s): %s", name, exc.code, exc.detail)
            errors.append(exc)
            continue

        logger.info("llm[%s] extracted %d raw questions", name, len(extraction.questions))
        logger.debug("llm raw output: %s", extraction.model_dump_json())
        return extraction, index > 0

    # Every provider failed: show the user the error of the first (main) provider.
    raise errors[0] if errors else LLMUnavailable(detail="no LLM provider configured")


def extract_questions(document: SourceDocument) -> AIExtraction:
    """Same as extract_questions_with_source, without the fallback flag."""
    return extract_questions_with_source(document)[0]
