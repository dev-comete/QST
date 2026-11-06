"""
Manual parser tests (no AI, no network).
Run with:  python manage.py test ia.import_questions
"""
from types import SimpleNamespace
from unittest import mock

from django.test import SimpleTestCase, override_settings

from . import llm, manual_parser
from .exceptions import LLMOutputInvalid, LLMRequestFailed, LLMUnavailable
from .schemas import SourceDocument

SHEET_WITH_HEADER = """### SHEET: Quiz
R1 | A: [HL] Question | B: [HL] Réponse | C: [HL] Explication
R2 | A: 1- Que signifie SMART ? | B: Simple, Motivant
R3 | B: [HL] Spécifique, Mesurable | C: [HL] Moyen mnémotechnique
R4 | B: Stratégique, Modérable
R5 | A: 2- Quelles sont des émotions primaires ?
R6 | B: [HL] La joie | C: [HL] Émotion de base
R7 | B: [HL] La peur | C: [HL] Émotion de base
R8 | B: Le QI
"""

SIDE_BY_SIDE = """### SHEET: Quiz
R1 | A: Question | B: Réponse | D: Question | E: Réponse
R2 | A: 1- Capitale ? | B: Paris | D: 1- Capitale (modif) ? | E: Rome
R3 | B: [HL] Berlin | E: [HL] Madrid
"""

HEADERLESS = """### SHEET: Quiz
R1 | A: 1- Capitale de la France ? | B: Berlin
R2 | B: [HL] Paris
R4 | A: 2- Combien font 2+2 ? | B: [HL] 4
R5 | B: 5
"""


def _by_text(extraction):
    return {q.question: q for q in extraction.questions}


class SpreadsheetParserTests(SimpleTestCase):
    def test_header_layout_with_explanations(self):
        res = manual_parser.parse(SHEET_WITH_HEADER)
        self.assertEqual(len(res.questions), 2)
        q1, q2 = res.questions
        self.assertEqual(q1.question, "Que signifie SMART ?")
        self.assertEqual([o.is_correct for o in q1.options], [False, True, False])
        self.assertEqual(q1.options[1].explanation, "Moyen mnémotechnique")
        self.assertEqual([o.is_correct for o in q2.options], [True, True, False])
        self.assertEqual(q2.options[0].explanation, "Émotion de base")

    def test_blocks_side_by_side(self):
        res = manual_parser.parse(SIDE_BY_SIDE)
        self.assertEqual(len(res.questions), 2)
        correct = [next(o.text for o in q.options if o.is_correct) for q in res.questions]
        self.assertEqual(correct, ["Berlin", "Madrid"])

    def test_headerless_sheet(self):
        res = manual_parser.parse(HEADERLESS)
        self.assertEqual(len(res.questions), 2)
        self.assertEqual([o.text for o in res.questions[0].options if o.is_correct], ["Paris"])
        self.assertEqual([o.text for o in res.questions[1].options if o.is_correct], ["4"])

    def test_all_options_highlighted_means_no_signal(self):
        text = "R1 | A: 1- Q ? | B: [HL] a\nR2 | B: [HL] b"
        res = manual_parser.parse(text)
        self.assertEqual([o.is_correct for o in res.questions[0].options], [False, False])

    def test_noise_sheet_is_ignored(self):
        text = SHEET_WITH_HEADER + "### SHEET: Suivi\nR1 | A: Nom\nR2 | A: Dupont\n"
        self.assertEqual(len(manual_parser.parse(text).questions), 2)


class PlainTextParserTests(SimpleTestCase):
    def test_star_hl_and_checkmark_flags(self):
        text = (
            "1- Capitale de la France ?\nA) Berlin\nB) Paris *\nC) Rome\n"
            "2. Choisir les pairs ?\n[HL] a) 2\nb) 3\nc) 4 ✓\n"
        )
        res = manual_parser.parse(text)
        self.assertEqual([o.is_correct for o in res.questions[0].options], [False, True, False])
        self.assertEqual([o.is_correct for o in res.questions[1].options], [True, False, True])
        self.assertEqual(res.questions[0].options[1].text, "Paris")

    def test_answer_line_and_explanation(self):
        text = (
            "1- Capitale ?\nA) Berlin\nB) Paris\nRéponse : B\nExplication : Paris est la capitale.\n"
        )
        q = manual_parser.parse(text).questions[0]
        self.assertEqual([o.is_correct for o in q.options], [False, True])
        self.assertEqual(q.options[1].explanation, "Paris est la capitale.")

    def test_answer_key_section(self):
        text = "1- Q un ?\nA) x\nB) y\n2- Q deux ?\nA) x\nB) y\nCorrigé\n1-B\n2. A\n"
        res = manual_parser.parse(text)
        self.assertEqual([o.is_correct for o in res.questions[0].options], [False, True])
        self.assertEqual([o.is_correct for o in res.questions[1].options], [True, False])

    def test_bold_is_signal_only_when_not_everywhere(self):
        mixed = "1- Q ?\nA) x\nB) **y**\n"
        self.assertEqual([o.is_correct for o in manual_parser.parse(mixed).questions[0].options], [False, True])
        everywhere = "1- Q ?\n**A) x**\n**B) y**\n"
        self.assertEqual([o.is_correct for o in manual_parser.parse(everywhere).questions[0].options], [False, False])

    def test_no_answer_means_no_correct_option(self):
        q = manual_parser.parse("1- Q ?\nA) x\nB) y\n").questions[0]
        self.assertEqual([o.is_correct for o in q.options], [False, False])

    def test_open_question_has_no_options(self):
        res = manual_parser.parse("1- Expliquez la photosynthèse ?\n2- Définissez le PIB ?\n")
        self.assertEqual([len(q.options) for q in res.questions], [0, 0])

    def test_multiline_question(self):
        q = manual_parser.parse("1- Quelle est la capitale\nde la France ?\nA) Paris *\nB) Rome\n").questions[0]
        self.assertEqual(q.question, "Quelle est la capitale de la France ?")

    def test_nothing_found(self):
        self.assertEqual(manual_parser.parse("rien à voir ici").questions, [])


class ManualProviderTests(SimpleTestCase):
    def test_provider_returns_questions(self):
        doc = SourceDocument(filename="q.xlsx", text=SHEET_WITH_HEADER)
        self.assertEqual(len(llm._manual_extract(doc).questions), 2)

    def test_provider_fails_when_nothing_found(self):
        with self.assertRaises(LLMOutputInvalid):
            llm._manual_extract(SourceDocument(filename="q.txt", text="rien à voir ici"))

    def test_provider_refuses_images(self):
        with self.assertRaises(LLMRequestFailed):
            llm._manual_extract(SourceDocument(filename="q.png", data=b"x", mime_type="image/png"))

    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("gemini", "ollama", "manual"))
    def test_chain_reaches_manual_and_flags_fallback(self):
        doc = SourceDocument(filename="q.xlsx", text=SHEET_WITH_HEADER)
        with mock.patch.object(llm, "_gemini_extract", side_effect=LLMUnavailable(detail="429")), \
             mock.patch.object(llm, "_ollama_extract", side_effect=LLMUnavailable(detail="down")):
            extraction, is_fallback = llm.extract_questions_with_source(doc)
        self.assertEqual(len(extraction.questions), 2)
        self.assertTrue(is_fallback)

    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("gemini", "ollama", "manual"))
    def test_first_provider_success_is_not_a_fallback(self):
        doc = SourceDocument(filename="q.txt", text="x")
        fake = manual_parser.parse(SHEET_WITH_HEADER)
        with mock.patch.object(llm, "_gemini_extract", return_value=fake):
            _, is_fallback = llm.extract_questions_with_source(doc)
        self.assertFalse(is_fallback)
