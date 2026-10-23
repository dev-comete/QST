"""
LAYER 2b - LLM: SourceDocument -> AIExtraction.

The ONLY module that knows about Gemini. It does three things:
  1. build the request (text prompt, or file + prompt)
  2. call with retry/backoff on transient errors
  3. validate the answer (truncation, schema) and raise domain errors
"""
import logging
import time

from .config import conf
from .exceptions import LLMOutputInvalid, LLMRequestFailed, LLMTruncated, LLMUnavailable
from .prompts import build_binary_prompt, build_text_prompt
from .schemas import AIExtraction, SourceDocument

logger = logging.getLogger(__name__)

_RETRYABLE_CODES = {429, 500, 503, 504}
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


def extract_questions(document: SourceDocument) -> AIExtraction:
    contents = _build_contents(document)
    response = _call_with_retry(contents)
    extraction = _parse_response(response)
    logger.info("llm extracted %d raw questions", len(extraction.questions))
    logger.debug("llm raw output: %s", extraction.model_dump_json())
    return extraction
