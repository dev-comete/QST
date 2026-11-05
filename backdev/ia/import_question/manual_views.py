"""
HTTP LAYER of the ISOLATED manual import (rules only, no AI).

Same request and response contract as ImportQuestionsv2APIView, so the existing front-end can be
pointed at this URL to compare. Extra keys in the response:
    "source": "manual"
    "stats":  numbers to judge the parser (see ManualImportReport.stats)
    "debug":  only with  ?debug=1  AND (settings.DEBUG or staff user): the exact text the parser saw.

No throttling: this endpoint costs nothing (no AI call).
"""
import logging

from django.conf import settings
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import manual_service, presenter, repository
from .config import conf
from .exceptions import QuestionImportError
from .serializers import ImportQuestionsSerializer

logger = logging.getLogger(__name__)


class ManualImportQuestionsAPIView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ImportQuestionsSerializer

    def _debug_allowed(self, request) -> bool:
        asked = request.query_params.get("debug", "").lower() in ("1", "true", "yes")
        return asked and (settings.DEBUG or bool(getattr(request.user, "is_staff", False)))

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            report = manual_service.import_questions_manual(
                upload=serializer.validated_data.get("fichier"),
                text=serializer.validated_data.get("texte"),
            )
        except QuestionImportError as exc:
            logger.warning("manual import failed code=%s detail=%s", exc.code, exc.detail)
            return Response({"error": exc.message, "code": exc.code}, status=exc.http_status)
        except Exception:
            logger.exception("unexpected error during manual question import")
            return Response(
                {"error": "Erreur interne lors de l'import.", "code": "internal_error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payload = presenter.to_api_payload(
            report.result, repository.get_type_ids(), conf().default_points
        )
        payload["message"] = f"{payload['count']} questions extraites (import manuel, sans IA)."
        payload["source"] = "manual"
        payload["stats"] = report.stats()
        if self._debug_allowed(request):
            payload["debug"] = {
                "annotated_text": report.text,
                "chars": len(report.text),
                "parser_raw_questions": report.raw_questions,
            }
        return Response(payload, status=status.HTTP_200_OK)
