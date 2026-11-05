# ia/services.py
"""
Distractor generation + legacy raw-text parsing, with provider fallback.

Providers are tried in order; the next one is used when the previous one fails
(rate limit, outage, missing key, invalid JSON...).

Settings (all optional):
    IA_LLM_PROVIDERS = ("gemini", "ollama")   # ("ollama",) = local only, ("gemini",) = Gemini only
    GEMINI_API_KEY, GEMINI_MODEL
    OLLAMA_BASE_URL  = "http://localhost:11434"   (replaces the old OLLAMA_API_URL)
    OLLAMA_MODEL     = "llama3.2"
    OLLAMA_NUM_CTX   = 8192      # Ollama's default (2048) silently cuts long prompts
    OLLAMA_TIMEOUT   = 60
"""
import json
import logging

import requests
from django.conf import settings

from .prompts.prompt_distractor import DISTRACTOR_PROMPT
from .prompts.prompt_import import IMPORT_TEXT_PROMPT

logger = logging.getLogger(__name__)

_client = None


# ---------------------------------------------------------------------------
# Settings (read at call time, so they can be overridden in tests)
# ---------------------------------------------------------------------------
def _providers() -> tuple:
    return tuple(getattr(settings, "IA_LLM_PROVIDERS", ("gemini", "ollama")))


def _ollama_url() -> str:
    base = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    for suffix in ("/api/generate", "/api/chat"):   # tolerate a base URL that already has the path
        if base.endswith(suffix):
            base = base[: -len(suffix)]
    return f"{base}/api/generate"


# ---------------------------------------------------------------------------
# Providers: each takes a prompt and returns the raw text of the answer
# ---------------------------------------------------------------------------
def _get_gemini_client():
    """Created on first use: a missing key no longer breaks the import of this module."""
    global _client
    if _client is None:
        from google import genai
        from google.genai import types

        api_key = getattr(settings, "GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                retry_options=types.HttpRetryOptions(
                    attempts=3,             # was 5: fail over to Ollama faster (~3s of waiting)
                    initial_delay=1.0,
                    max_delay=20.0,
                    exp_base=2,
                    http_status_codes=[429, 500, 502, 503, 504],
                )
            ),
        )
    return _client


def _gemini_text(prompt: str, *, json_mode: bool = True, timeout: int = 0) -> str:
    from google.genai import types

    config = types.GenerateContentConfig(
        response_mime_type="application/json" if json_mode else "text/plain",
        temperature=0,
    )
    response = _get_gemini_client().models.generate_content(
        model=getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash"),
        contents=prompt,
        config=config,
    )
    return (response.text or "").strip()


def _ollama_text(prompt: str, *, json_mode: bool = True, timeout: int = 0) -> str:
    payload = {
        "model": getattr(settings, "OLLAMA_MODEL", "llama3.2"),
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0,
            "num_ctx": getattr(settings, "OLLAMA_NUM_CTX", 8192),
        },
    }
    if json_mode:
        payload["format"] = "json"
    response = requests.post(
        _ollama_url(),
        json=payload,
        timeout=timeout or getattr(settings, "OLLAMA_TIMEOUT", 60),
    )
    response.raise_for_status()
    return (response.json().get("response") or "").strip()


_PROVIDER_FUNCS = {"gemini": _gemini_text, "ollama": _ollama_text}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _strip_markdown_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _ask_json(prompt: str):
    """Try each provider until one returns valid JSON. Returns the parsed JSON."""
    errors: list[Exception] = []

    for name in _providers():
        func = _PROVIDER_FUNCS.get(name)
        if func is None:
            logger.error("unknown provider %r in IA_LLM_PROVIDERS", name)
            continue
        try:
            raw = func(prompt, json_mode=True)
            return json.loads(_strip_markdown_fences(raw))
        except Exception as exc:                      # includes JSONDecodeError, network, quota...
            logger.warning("provider %s failed: %r", name, exc)
            errors.append(exc)

    first = errors[0] if errors else RuntimeError("no provider configured")
    if isinstance(first, json.JSONDecodeError):
        raise ValueError("Le format renvoyé par l'IA n'est pas valide.")
    raise Exception(f"Erreur de l'API IA : {first}")


def _unwrap_list(data, *, allow_str_values: bool = False) -> list:
    """
    The AI may answer [...] or {"questions": [...]} (Ollama's format=json always returns an object).
    allow_str_values: {"a": "x", "b": "y"} -> ["x", "y"] (distractors).
    """
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for value in data.values():
            if isinstance(value, list):
                return value
        if allow_str_values and data and all(isinstance(v, str) for v in data.values()):
            return list(data.values())
        return [data]
    return []


# ---------------------------------------------------------------------------
# Public API (names unchanged)
# ---------------------------------------------------------------------------
def tester_connexion_gemini():
    """Kept under this name for your URLs. Tests every configured provider."""
    results = []
    for name in _providers():
        func = _PROVIDER_FUNCS.get(name)
        if func is None:
            results.append(f"{name}: provider inconnu")
            continue
        try:
            answer = func("Réponds simplement 'OK' si tu m'entends.", json_mode=False, timeout=10)
            results.append(f"{name}: {answer[:40] or 'réponse vide'}")
        except Exception as exc:
            results.append(f"{name}: ERREUR ({exc})")
    return " | ".join(results)


def generer_distracteurs_qcm(enonce: str, bonne_reponse: str) -> list:
    prompt = DISTRACTOR_PROMPT.format(enonce=enonce, bonne_reponse=bonne_reponse)
    return _unwrap_list(_ask_json(prompt), allow_str_values=True)


def parser_questions_brutes(raw_text: str) -> list:
    prompt = IMPORT_TEXT_PROMPT.replace("{raw_text}", raw_text)
    return _unwrap_list(_ask_json(prompt))
