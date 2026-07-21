from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .service_analytics import get_vague_analytics_service

class FormateurVagueAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vague_id: int):
        analytics_data = get_vague_analytics_service(
            vague_id=vague_id, 
            requesting_user=request.user
        )
        return Response(analytics_data)