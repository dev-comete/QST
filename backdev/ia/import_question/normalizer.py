"""
LAYER 3 - NORMALIZER: AIExtraction -> NormalizationResult.

Pure functions: no Django, no network, no database. Everything the AI should NOT
decide is decided here (question type, warnings), so it is deterministic and easy to unit-test.

Warning codes (shown by the front-end on the review screen):
    no_correct_answer   options exist but none is marked correct -> teacher must pick
    too_few_options     a single option
    all_options_correct every option is marked (probably an over-marked source)
"""
import re

from .schemas import (
    AIExtraction,
    NormalizationResult,
    ParsedOption,
    ParsedQuestion,
)

_MARKER_RE = re.compile(r"\[HL\]")
_SPACES_RE = re.compile(r"\s+")
_QUESTION_NUMBER_RE = re.compile(r"^\s*(?:q(?:uestion)?\s*)?\d+\s*[-.):]\s*", re.IGNORECASE)
_OPTION_LABEL_RE = re.compile(r"^\s*(?:\(?[A-Za-z]\)|[A-Za-z][.)])\s+")


def _clean(text: str) -> str:
    text = _MARKER_RE.sub("", text or "")
    return _SPACES_RE.sub(" ", text).strip()


def _clean_question(text: str) -> str:
    return _QUESTION_NUMBER_RE.sub("", _clean(text), count=1).strip()


def _clean_option(text: str) -> str:
    return _OPTION_LABEL_RE.sub("", _clean(text), count=1).strip()


def _dedupe_options(options: list[ParsedOption]) -> list[ParsedOption]:
    seen: dict[str, ParsedOption] = {}
    for option in options:
        key = option.text.casefold()
        if key in seen:
            seen[key].is_correct = seen[key].is_correct or option.is_correct
        else:
            seen[key] = option
    return list(seen.values())


def infer_type(options: list[ParsedOption]) -> str:
    if not options:
        return "OUV"
    correct = sum(o.is_correct for o in options)
    return "QCM" if correct > 1 else "QCU"      # 0 correct -> provisional QCU + warning


def collect_warnings(options: list[ParsedOption]) -> list[str]:
    warnings = []
    if not options:
        return warnings
    correct = sum(o.is_correct for o in options)
    if correct == 0:
        warnings.append("no_correct_answer")
    if len(options) == 1:
        warnings.append("too_few_options")
    if len(options) >= 2 and correct == len(options):
        warnings.append("all_options_correct")
    return warnings


def normalize(extraction: AIExtraction) -> NormalizationResult:
    questions: list[ParsedQuestion] = []
    skipped = 0

    for item in extraction.questions:
        statement = _clean_question(item.question)
        if not statement:
            skipped += 1
            continue

        options = [
            ParsedOption(text=text, is_correct=o.is_correct)
            for o in item.options
            if (text := _clean_option(o.text))
        ]
        options = _dedupe_options(options)

        questions.append(
            ParsedQuestion(
                question=statement,
                options=options,
                type_code=infer_type(options),
                warnings=collect_warnings(options),
            )
        )

    return NormalizationResult(questions=questions, skipped=skipped)
