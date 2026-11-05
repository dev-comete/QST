"""
Provider fallback tests. No network: both providers are mocked.
Run with:  python manage.py test ia.import_questions
"""
from types import SimpleNamespace
from unittest import mock

from django.test import SimpleTestCase, override_settings

from . import llm
from .exceptions import LLMRequestFailed, LLMTruncated, LLMUnavailable
from .schemas import AIExtraction, AIOption, AIQuestion, SourceDocument

DOC = SourceDocument(filename="q.txt", text="1- Capitale ?\nA) Paris\nB) Berlin")
FAKE = AIExtraction(questions=[AIQuestion(question="Capitale ?", options=[
    AIOption(text="Paris", is_correct=True), AIOption(text="Berlin", is_correct=False)])])


class FallbackTests(SimpleTestCase):
    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("gemini", "ollama"))
    def test_falls_back_to_ollama_when_gemini_unavailable(self):
        with mock.patch.object(llm, "_gemini_extract", side_effect=LLMUnavailable(detail="429")), \
             mock.patch.object(llm, "_ollama_extract", return_value=FAKE) as ollama:
            result = llm.extract_questions(DOC)
        ollama.assert_called_once()
        self.assertIs(result, FAKE)

    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("gemini", "ollama"))
    def test_gemini_ok_means_ollama_not_called(self):
        with mock.patch.object(llm, "_gemini_extract", return_value=FAKE), \
             mock.patch.object(llm, "_ollama_extract") as ollama:
            llm.extract_questions(DOC)
        ollama.assert_not_called()

    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("gemini", "ollama"))
    def test_truncation_does_not_fall_back(self):
        with mock.patch.object(llm, "_gemini_extract", side_effect=LLMTruncated()), \
             mock.patch.object(llm, "_ollama_extract") as ollama:
            with self.assertRaises(LLMTruncated):
                llm.extract_questions(DOC)
        ollama.assert_not_called()

    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("gemini", "ollama"))
    def test_all_fail_raises_first_error(self):
        first = LLMUnavailable(detail="gemini down")
        with mock.patch.object(llm, "_gemini_extract", side_effect=first), \
             mock.patch.object(llm, "_ollama_extract", side_effect=LLMRequestFailed(detail="x")):
            with self.assertRaises(LLMUnavailable) as ctx:
                llm.extract_questions(DOC)
        self.assertIs(ctx.exception, first)

    @override_settings(QUESTION_IMPORT_LLM_PROVIDERS=("ollama",))
    def test_ollama_only(self):
        with mock.patch.object(llm, "_gemini_extract") as gemini, \
             mock.patch.object(llm, "_ollama_extract", return_value=FAKE):
            llm.extract_questions(DOC)
        gemini.assert_not_called()


class OllamaTests(SimpleTestCase):
    def _response(self, status=200, body=None):
        return SimpleNamespace(status_code=status, text="", json=lambda: body)

    def test_parses_structured_output(self):
        body = {"done_reason": "stop", "message": {"content": FAKE.model_dump_json()}}
        with mock.patch("requests.post", return_value=self._response(200, body)):
            result = llm._ollama_extract(DOC)
        self.assertEqual(result.questions[0].options[0].text, "Paris")

    def test_truncated(self):
        body = {"done_reason": "length", "message": {"content": "{"}}
        with mock.patch("requests.post", return_value=self._response(200, body)):
            with self.assertRaises(LLMTruncated):
                llm._ollama_extract(DOC)

    def test_unreachable_is_unavailable(self):
        import requests
        with mock.patch("requests.post", side_effect=requests.ConnectionError("refused")):
            with self.assertRaises(LLMUnavailable):
                llm._ollama_extract(DOC)

    def test_model_not_pulled(self):
        with mock.patch("requests.post", return_value=self._response(404)):
            with self.assertRaises(LLMRequestFailed):
                llm._ollama_extract(DOC)

    def test_image_is_refused(self):
        img = SourceDocument(filename="q.png", data=b"x", mime_type="image/png")
        with self.assertRaises(LLMRequestFailed):
            llm._ollama_extract(img)

    @override_settings(QUESTION_IMPORT_OLLAMA_MAX_INPUT_CHARS=20)
    def test_too_long_input_is_refused(self):
        with mock.patch("requests.post") as post:
            with self.assertRaises(LLMRequestFailed):
                llm._ollama_extract(DOC)
        post.assert_not_called()
