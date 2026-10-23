"""
Data shapes passed between layers. No logic besides tiny helpers.

    SourceDocument  : what the READERS produce      (file -> text/bytes)
    AI*             : what the LLM must return      (validated by Gemini + pydantic)
    Parsed*         : what the NORMALIZER produces  (clean, typed, with warnings)
"""
import hashlib
from dataclasses import dataclass, field

from pydantic import BaseModel


# --- readers -> llm -------------------------------------------------------

@dataclass(frozen=True)
class SourceDocument:
    """Either `text` (annotated plain text) or `data`+`mime_type` (sent as-is to the LLM)."""
    filename: str
    text: str | None = None
    data: bytes | None = None
    mime_type: str | None = None

    @property
    def is_binary(self) -> bool:
        return self.data is not None

    def fingerprint(self) -> str:
        payload = self.data if self.is_binary else (self.text or "").encode("utf-8")
        return hashlib.sha256(payload).hexdigest()


# --- llm output (kept deliberately minimal) -------------------------------

class AIOption(BaseModel):
    text: str
    is_correct: bool


class AIQuestion(BaseModel):
    question: str
    options: list[AIOption]


class AIExtraction(BaseModel):
    questions: list[AIQuestion]


# --- normalizer output ----------------------------------------------------

@dataclass
class ParsedOption:
    text: str
    is_correct: bool


@dataclass
class ParsedQuestion:
    question: str
    options: list[ParsedOption]
    type_code: str                      # "QCU" | "QCM" | "OUV"
    warnings: list[str] = field(default_factory=list)


@dataclass
class NormalizationResult:
    questions: list[ParsedQuestion]
    skipped: int = 0                    # empty / unusable items dropped
