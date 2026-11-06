"""
LAYER 2c - MANUAL PARSER: annotated text -> AIExtraction, with plain rules (no AI, no network).

Last-resort provider: used when Gemini and Ollama both failed. It reads the SAME annotated text
the readers produce for the AI, so nothing else in the pipeline changes.

Two input shapes are understood:

1. SPREADSHEET text (from readers._read_xlsx):
       ### SHEET: Quiz
       R1 | A: [HL] Question | B: [HL] Réponse | C: [HL] Explication
       R2 | A: 1- Question ? | B: option
       R3 | B: [HL] good option | C: [HL] explanation
   - A header row ("Question", "Réponse", "Explication") gives the column roles; several blocks
     side by side (INITIAL / MODIFICATION) are supported when each has its own header.
   - Without a header: the column holding the numbered/"?" cells is the question column, the next
     column holds the options, the one after the explanations.
   - Correct option = highlighted while its siblings are not.

2. PLAIN TEXT (docx / txt / md / pdf text):
       1- Capitale de la France ?
       A) Berlin
       B) Paris *            <- also: [HL], **bold**, ✓, (correct)
       Réponse : B           <- or a "Corrigé" section at the end: "1-B"
       Explication : ...

If it finds nothing it returns an empty extraction: the caller decides what to do.
"""
import re

from .schemas import AIExtraction, AIOption, AIQuestion

MARK = "[HL]"

_SHEET_RE = re.compile(r"^### SHEET: (.*)$")
_ROW_RE = re.compile(r"^R(\d+) \| (.*)$")
_CELL_SPLIT_RE = re.compile(r" \| (?=[A-Z]{1,3}: )")
_CELL_RE = re.compile(r"^([A-Z]{1,3}): (.*)$", re.DOTALL)

_QNUM_RE = re.compile(r"^\s*(?:q(?:uestion)?\s*)?(\d+)\s*[-.):]\s*(.*)$", re.IGNORECASE)
_OPT_RE = re.compile(r"^\s*(?:\(?([A-Za-z])\)\s*|([A-Za-z])[.)]\s+|[-•–▪●○◦]\s+)(.+)$")
_EXPL_RE = re.compile(r"^\s*(?:explication|justification|commentaire|pourquoi)\s*:?\s*(.+)$", re.IGNORECASE)
_ANSWER_RE = re.compile(r"^\s*(?:bonnes?\s+)?r[ée]ponses?(?:\s+correctes?)?\s*:\s*(.+)$", re.IGNORECASE)
_KEY_HEADER_RE = re.compile(r"^\s*(?:corrig[ée]s?|r[ée]ponses?|solutions?|answer\s*key)\s*:?\s*$", re.IGNORECASE)
_KEY_LINE_RE = re.compile(
    r"^\s*(?:q(?:uestion)?\s*)?(\d+)\s*[-.):=]?\s*([A-Za-z](?:\s*(?:,|;|/|&|et|and|\s)\s*[A-Za-z])*)\s*$",
    re.IGNORECASE,
)
_LETTERS_RE = re.compile(r"[A-Za-z]")
_TRAILING_FLAG_RE = re.compile(r"\s*(?:\*|✓|✔|\(\s*(?:correct|bonne r[ée]ponse|vrai)\s*\))\s*$", re.IGNORECASE)
_LEADING_FLAG_RE = re.compile(r"^\s*\[\s*[xX✓✔]\s*\]\s*")

_HEADER_ROLES = (
    ("question", re.compile(r"^(questions?|[ée]nonc[ée]s?)$", re.IGNORECASE)),
    ("answer", re.compile(r"^(r[ée]ponses?|options?|choix|propositions?)$", re.IGNORECASE)),
    ("explanation", re.compile(r"^(explications?|justifications?|commentaires?)$", re.IGNORECASE)),
)


# ---------------------------------------------------------------------------
# Internal structures
# ---------------------------------------------------------------------------
class _Opt:
    __slots__ = ("text", "marked", "flagged", "label", "explanation")

    def __init__(self, text, marked=False, flagged=False, label=None):
        self.text = text
        self.marked = marked        # highlighted / bold in the source
        self.flagged = flagged      # explicit flag: trailing *, ✓, (correct)...
        self.label = label          # "A", "B"... when the source has one
        self.explanation = ""


class _Q:
    def __init__(self, text, number=None):
        self.text = text
        self.number = number
        self.options: list[_Opt] = []
        self.answer_letters: set[str] = set()
        self.pending_expl: list[tuple[str, int, bool]] = []   # (text, last option index, after "Réponse :")


def _split_flag(text: str) -> tuple[str, bool]:
    flagged = False
    if _TRAILING_FLAG_RE.search(text):
        text, flagged = _TRAILING_FLAG_RE.sub("", text), True
    if _LEADING_FLAG_RE.match(text):
        text, flagged = _LEADING_FLAG_RE.sub("", text), True
    return text.strip(), flagged


# ---------------------------------------------------------------------------
# Finalisation: decide which options are correct, attach explanations
# ---------------------------------------------------------------------------
def _finalize(q: _Q) -> AIQuestion:
    opts = q.options
    n = len(opts)

    marked = sum(o.marked for o in opts)
    use_marks = 0 < marked < n          # all/none marked = formatting, not a signal

    correct = []
    for i, o in enumerate(opts):
        label = (o.label or chr(65 + i)).upper()
        correct.append(o.flagged or (use_marks and o.marked) or label in q.answer_letters)

    for text, last_idx, after_answer in q.pending_expl:
        if not after_answer and 0 <= last_idx < n and correct[last_idx]:
            target = last_idx
        else:
            target = next((i for i, c in enumerate(correct) if c), None)
        if target is not None:
            joined = f"{opts[target].explanation} {text}".strip()
            opts[target].explanation = joined

    return AIQuestion(
        question=q.text.strip(),
        options=[
            AIOption(text=o.text, is_correct=bool(c), explanation=o.explanation if c else "")
            for o, c in zip(opts, correct)
        ],
    )


# ---------------------------------------------------------------------------
# 1. SPREADSHEET TEXT
# ---------------------------------------------------------------------------
def _col_index(col: str) -> int:
    n = 0
    for ch in col:
        n = n * 26 + (ord(ch) - 64)
    return n


def _parse_row(rest: str) -> dict[str, tuple[str, bool]]:
    cells = {}
    for part in _CELL_SPLIT_RE.split(rest):
        m = _CELL_RE.match(part)
        if not m:
            continue
        col, value = m.group(1), m.group(2).strip()
        hl = value.startswith(MARK)
        if hl:
            value = value[len(MARK):].strip()
        if value:
            cells[col] = (value, hl)
    return cells


def _role_of(text: str) -> str | None:
    cleaned = text.strip().strip(":").strip()
    if len(cleaned) > 40:
        return None
    for role, pattern in _HEADER_ROLES:
        if pattern.match(cleaned):
            return role
    return None


def _find_header(rows) -> tuple[int, dict[str, str]] | None:
    """First row with at least 2 recognised role cells -> (row position, {col: role})."""
    for pos, (_, cells) in enumerate(rows):
        roles = {col: r for col, (text, _) in cells.items() if (r := _role_of(text))}
        if len(roles) >= 2 and "question" in roles.values():
            return pos, roles
    return None


def _blocks_from_roles(roles: dict[str, str]) -> list[tuple[str, str | None, str | None]]:
    """[(question_col, answer_col, explanation_col)], one per 'question' column."""
    cols = sorted(roles, key=_col_index)
    blocks = []
    for i, col in enumerate(cols):
        if roles[col] != "question":
            continue
        answer = explanation = None
        for nxt in cols[i + 1:]:
            if roles[nxt] == "question":
                break
            if roles[nxt] == "answer" and answer is None:
                answer = nxt
            elif roles[nxt] == "explanation" and explanation is None:
                explanation = nxt
        if answer:
            blocks.append((col, answer, explanation))
    return blocks


def _guess_block(rows) -> list[tuple[str, str | None, str | None]]:
    """No header: question col = col with most numbered / '?' cells; options and explanations follow."""
    score: dict[str, int] = {}
    used: set[str] = set()
    for _, cells in rows:
        for col, (text, _) in cells.items():
            used.add(col)
            if _QNUM_RE.match(text) or text.endswith("?"):
                score[col] = score.get(col, 0) + 1
    if not score:
        return []
    qcol = max(score, key=score.get)
    after = sorted((c for c in used if _col_index(c) > _col_index(qcol)), key=_col_index)
    if not after:
        return []
    return [(qcol, after[0], after[1] if len(after) > 1 else None)]


def _parse_block(rows, qcol, acol, ecol) -> list[_Q]:
    questions: list[_Q] = []
    current: _Q | None = None

    for _, cells in rows:
        q_cell, a_cell = cells.get(qcol), cells.get(acol)
        e_cell = cells.get(ecol) if ecol else None

        if q_cell:
            text = q_cell[0]
            m = _QNUM_RE.match(text)
            is_continuation = (
                current is not None and not current.options and not m
                and not current.text.rstrip().endswith("?")
            )
            if is_continuation:
                current.text += " " + text
            else:
                current = _Q(m.group(2).strip() if m and m.group(2).strip() else text,
                             int(m.group(1)) if m else None)
                questions.append(current)
        if current is None:
            continue

        if a_cell:
            text, flagged = _split_flag(a_cell[0])
            current.options.append(_Opt(text, marked=a_cell[1], flagged=flagged))
        if e_cell and current.options:
            current.pending_expl.append((e_cell[0], len(current.options) - 1, not a_cell))
    return questions


def _parse_sheet(rows) -> list[_Q]:
    header = _find_header(rows)
    if header:
        pos, roles = header
        data_rows = rows[pos + 1:]
        blocks = _blocks_from_roles(roles)
    else:
        data_rows, blocks = rows, _guess_block(rows)

    questions: list[_Q] = []
    for qcol, acol, ecol in blocks:
        questions.extend(_parse_block(data_rows, qcol, acol, ecol))
    return questions


def _parse_spreadsheet(text: str) -> list[_Q]:
    sheets: list[list] = [[]]
    for line in text.splitlines():
        if _SHEET_RE.match(line):
            sheets.append([])
            continue
        m = _ROW_RE.match(line)
        if m:
            cells = _parse_row(m.group(2))
            if cells:
                sheets[-1].append((int(m.group(1)), cells))
    questions: list[_Q] = []
    for rows in sheets:
        if rows:
            questions.extend(_parse_sheet(rows))
    return questions


# ---------------------------------------------------------------------------
# 2. PLAIN TEXT
# ---------------------------------------------------------------------------
def _parse_plain(text: str) -> list[_Q]:
    questions: list[_Q] = []
    current: _Q | None = None
    key_mode = False
    last_was_answer = False       # an explanation right after "Réponse : B" belongs to the correct option(s)
    answer_key: dict[int, set[str]] = {}

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        was_answer, last_was_answer = last_was_answer, False

        hl = line.startswith(MARK)
        if hl:
            line = line[len(MARK):].strip()
        bold = "**" in line
        if bold:
            line = line.replace("**", "").strip()
        if not line:
            continue

        # --- answer-key section at the end ("Corrigé", "Réponses") -----------
        if _KEY_HEADER_RE.match(line):
            key_mode = True
            continue
        if key_mode:
            m = _KEY_LINE_RE.match(line)
            if m:
                answer_key[int(m.group(1))] = {c.upper() for c in _LETTERS_RE.findall(m.group(2))}
                continue
            key_mode = False                      # something else: back to normal parsing

        # --- explanation -------------------------------------------------------
        m = _EXPL_RE.match(line)
        if m and current is not None:
            current.pending_expl.append((m.group(1).strip(), len(current.options) - 1, was_answer))
            continue

        # --- "Réponse : B" -----------------------------------------------------
        m = _ANSWER_RE.match(line)
        if m and current is not None:
            value = m.group(1).strip()
            letters = _LETTERS_RE.findall(value) if re.fullmatch(
                r"[A-Za-z](?:\s*(?:,|;|/|&|et|and|\s)\s*[A-Za-z])*", value) else []
            if letters:
                current.answer_letters |= {c.upper() for c in letters}
            else:                                  # the answer is written in full
                target = value.casefold()
                for o in current.options:
                    if o.text.casefold() == target:
                        o.flagged = True
            last_was_answer = True
            continue

        # --- new numbered question --------------------------------------------
        m = _QNUM_RE.match(line)
        if m and not _OPT_RE.match(line):
            current = _Q(m.group(2).strip(), int(m.group(1)))
            questions.append(current)
            continue

        # --- option --------------------------------------------------------------
        m = _OPT_RE.match(line)
        if m and current is not None:
            label = m.group(1) or m.group(2)
            text, flagged = _split_flag(m.group(3))
            current.options.append(_Opt(text, marked=hl or bold, flagged=flagged, label=label))
            continue

        # --- unnumbered question ("....?") ------------------------------------
        if line.endswith("?") and (current is None or current.options):
            current = _Q(line)
            questions.append(current)
            continue

        # --- continuation of a broken line ---------------------------------------
        if current is not None:
            if not current.options and not current.text.rstrip().endswith("?"):
                current.text += " " + line
            elif current.options and line[:1].islower():
                current.options[-1].text += " " + line

    # apply the "Corrigé" section
    for i, q in enumerate(questions):
        letters = answer_key.get(q.number if q.number is not None else i + 1)
        if letters:
            q.answer_letters |= letters
    return questions


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------
def detect_layout(text: str) -> str:
    """"spreadsheet" if the text comes from readers._read_xlsx ("R12 | A: ... | B: ..."), else "plain"."""
    return "spreadsheet" if any(_ROW_RE.match(line) for line in text.splitlines()[:50]) else "plain"


def parse(text: str) -> AIExtraction:
    questions = _parse_spreadsheet(text) if detect_layout(text) == "spreadsheet" else _parse_plain(text)
    return AIExtraction(questions=[_finalize(q) for q in questions if q.text.strip()])
