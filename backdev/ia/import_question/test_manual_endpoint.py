"""
Isolated manual import: service + view. No database, no network, no AI.
Run with:  python manage.py test ia.import_questions
"""
import io
from types import SimpleNamespace
from unittest import mock

import openpyxl
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from openpyxl.styles import PatternFill
from rest_framework.test import APIRequestFactory, force_authenticate

from . import manual_service, manual_views
from .exceptions import UnsupportedFileType

GREEN = PatternFill("solid", fgColor="FF6AA84F")
TYPE_IDS = {"QCU": 1, "QCM": 2, "OUV": 3}


def _xlsx_bytes():
    """Same layout as the teacher's file: Question | Réponse | Explication, correct row highlighted."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Quiz"
    for col, label in zip("ABC", ("Question", "Réponse", "Explication")):
        ws[f"{col}1"] = label
        ws[f"{col}1"].fill = GREEN
    ws["A2"], ws["B2"] = "1- Capitale de la France ?", "Berlin"
    ws["B3"], ws["C3"] = "Paris", "Paris est la capitale."
    ws["B3"].fill = GREEN
    ws["C3"].fill = GREEN
    ws["B4"] = "Rome"
    ws["A5"], ws["B5"] = "2- Nombres pairs ?", "2"
    ws["B5"].fill = GREEN
    ws["B6"] = "3"
    ws["B7"] = "4"
    ws["B7"].fill = GREEN
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def _upload(name, raw):
    return SimpleUploadedFile(name, raw)


class ManualServiceTests(SimpleTestCase):
    def test_xlsx_end_to_end_with_real_reader(self):
        report = manual_service.import_questions_manual(upload=_upload("q.xlsx", _xlsx_bytes()))
        q1, q2 = report.result.questions
        self.assertEqual((q1.type_code, q2.type_code), ("QCU", "QCM"))
        self.assertEqual(q1.options[1].explanation, "Paris est la capitale.")
        self.assertEqual(report.layout, "spreadsheet")
        stats = report.stats()
        self.assertEqual(stats["questions_found"], 2)
        self.assertEqual(stats["without_correct_answer"], 0)
        self.assertEqual(stats["with_explanation"], 1)

    def test_plain_text(self):
        report = manual_service.import_questions_manual(
            text="1- Capitale ?\nA) Berlin\nB) Paris *\nExplication : Évident.\n"
        )
        self.assertEqual(report.layout, "plain")
        self.assertTrue(report.result.questions[0].options[1].is_correct)

    def test_nothing_found_is_not_an_error(self):
        report = manual_service.import_questions_manual(text="Ceci ne contient aucune question du tout.")
        self.assertEqual(report.result.questions, [])
        self.assertEqual(report.stats()["questions_found"], 0)

    def test_image_is_refused(self):
        with self.assertRaises(UnsupportedFileType):
            manual_service.import_questions_manual(upload=_upload("q.png", b"\x89PNG fake data"))


class ManualViewTests(SimpleTestCase):
    def _post(self, data, *, staff=False, query="", format="multipart"):
        factory = APIRequestFactory()
        request = factory.post(f"/import-questions/manual/{query}", data, format=format)
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True, is_staff=staff))
        with mock.patch.object(manual_views.repository, "get_type_ids", return_value=TYPE_IDS):
            return manual_views.ManualImportQuestionsAPIView.as_view()(request)

    def test_file_upload(self):
        response = self._post({"fichier": _upload("q.xlsx", _xlsx_bytes())})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["source"], "manual")
        self.assertEqual(response.data["questions"][0]["type_id"], 1)
        self.assertEqual(response.data["questions"][0]["options"][1]["explication"], "Paris est la capitale.")
        self.assertIn("stats", response.data)
        self.assertNotIn("debug", response.data)

    def test_text_body(self):
        response = self._post({"texte": "1- Capitale ?\nA) Berlin\nB) Paris *\n"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_debug_only_for_staff(self):
        body = {"texte": "1- Capitale ?\nA) Berlin\nB) Paris *\n"}
        with override_settings(DEBUG=False):
            self.assertNotIn("debug", self._post(body, query="?debug=1", format="json").data)
            staff = self._post(body, staff=True, query="?debug=1", format="json")
        self.assertIn("Capitale", staff.data["debug"]["annotated_text"])

    def test_both_file_and_text_is_rejected(self):
        response = self._post({"fichier": _upload("q.xlsx", _xlsx_bytes()), "texte": "1- Q ?\nA) a\nB) b"})
        self.assertEqual(response.status_code, 400)

    def test_image_gives_domain_error(self):
        response = self._post({"fichier": _upload("q.png", b"\x89PNG fake data")})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "unsupported_file_type")
