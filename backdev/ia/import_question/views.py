"""
HTTP LAYER: thin on purpose. Validate -> call service -> present -> map errors to status codes.

Settings needed for throttling:
    REST_FRAMEWORK = {"DEFAULT_THROTTLE_RATES": {"question_import": "20/hour"}}
"""
import logging

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from . import presenter, repository, service
from .config import conf
from .exceptions import QuestionImportError
from .serializers import ImportQuestionsSerializer

logger = logging.getLogger(__name__)


class ImportQuestionsv2APIView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ImportQuestionsSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "question_import"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = service.import_questions(
                upload=serializer.validated_data.get("fichier"),
                text=serializer.validated_data.get("texte"),
            )
        except QuestionImportError as exc:
            logger.warning("import failed code=%s detail=%s", exc.code, exc.detail)
            return Response({"error": exc.message, "code": exc.code}, status=exc.http_status)
        except Exception:
            logger.exception("unexpected error during question import")
            return Response(
                {"error": "Erreur interne lors de l'import.", "code": "internal_error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payload = presenter.to_api_payload(
            result, repository.get_type_ids(), conf().default_points
        )
        payload["message"] = f"{payload['count']} questions extraites avec succès."
        return Response(payload, status=status.HTTP_200_OK)
