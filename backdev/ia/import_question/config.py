"""
Single place for every tunable value.

Override any of them in Django settings with the QUESTION_IMPORT_ prefix, e.g.
    QUESTION_IMPORT_MAX_FILE_BYTES = 10 * 1024 * 1024

Required in settings (if Gemini is used):
    GEMINI_API_KEY
Optional:
    GEMINI_MODEL   (default below)

AI providers (tried in order, next one used if the previous fails):
    QUESTION_IMPORT_LLM_PROVIDERS = ("gemini", "ollama", "manual")  # default: Gemini, then Ollama,
                                                                    # then the rule-based parser
    QUESTION_IMPORT_LLM_PROVIDERS = ("gemini", "ollama")   # without the rule-based parser
    QUESTION_IMPORT_LLM_PROVIDERS = ("ollama",)            # local only
    QUESTION_IMPORT_LLM_PROVIDERS = ("gemini",)            # old behaviour

Ollama (all optional):
    OLLAMA_BASE_URL, OLLAMA_MODEL,
    QUESTION_IMPORT_OLLAMA_NUM_CTX / _NUM_PREDICT / _TIMEOUT / _MAX_INPUT_CHARS
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
    llm_providers: tuple[str, ...]
    ollama_base_url: str
    ollama_model: str
    ollama_num_ctx: int
    ollama_num_predict: int
    ollama_timeout: int
    ollama_max_input_chars: int


def _clean_ollama_base(url: str) -> str:
    """Accept 'http://host:11434' as well as 'http://host:11434/api/generate'."""
    url = url.rstrip("/")
    for suffix in ("/api/generate", "/api/chat"):
        if url.endswith(suffix):
            url = url[: -len(suffix)]
    return url


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
        llm_providers=tuple(get("LLM_PROVIDERS", ("gemini", "ollama", "manual"))),
        ollama_base_url=_clean_ollama_base(getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")),
        ollama_model=getattr(settings, "OLLAMA_MODEL", "llama3.2"),
        # input + output must fit in num_ctx (~3 chars per token in French)
        ollama_num_ctx=get("OLLAMA_NUM_CTX", 8192),
        ollama_num_predict=get("OLLAMA_NUM_PREDICT", 4096),
        ollama_timeout=get("OLLAMA_TIMEOUT", 180),
        ollama_max_input_chars=get("OLLAMA_MAX_INPUT_CHARS", 12_000),
    )
