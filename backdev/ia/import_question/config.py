"""
Single place for every tunable value.

Override any of them in Django settings with the QUESTION_IMPORT_ prefix, e.g.
    QUESTION_IMPORT_MAX_FILE_BYTES = 10 * 1024 * 1024

Required in settings:
    GEMINI_API_KEY
Optional:
    GEMINI_MODEL   (default below)
"""
from dataclasses import dataclass

from django.conf import settings


@dataclass(frozen=True)
class Config:
    max_file_bytes: int
    max_text_chars: int
    min_text_chars: int
    default_points: float
    cache_ttl_seconds: int
    gemini_api_key: str
    gemini_model: str
    max_output_tokens: int
    llm_attempts: int


def conf() -> Config:
    def get(name, default):
        return getattr(settings, f"QUESTION_IMPORT_{name}", default)

    return Config(
        max_file_bytes=get("MAX_FILE_BYTES", 5 * 1024 * 1024),
        max_text_chars=get("MAX_TEXT_CHARS", 60_000),
        min_text_chars=get("MIN_TEXT_CHARS", 10),
        default_points=get("DEFAULT_POINTS", 1.0),
        cache_ttl_seconds=get("CACHE_TTL_SECONDS", 3600),
        gemini_api_key=getattr(settings, "GEMINI_API_KEY", ""),
        gemini_model=getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash"),
        max_output_tokens=get("MAX_OUTPUT_TOKENS", 32_768),
        llm_attempts=get("LLM_ATTEMPTS", 3),
    )
