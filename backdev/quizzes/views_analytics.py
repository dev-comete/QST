from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.core.exceptions import PermissionDenied

from .service_analytics import get_vague_analytics_service , get_apprenant_bulletin_service

class FormateurVagueAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vague_id: int):
        analytics_data = get_vague_analytics_service(
            vague_id=vague_id, 
            requesting_user=request.user
        )
        return Response(analytics_data)
    
class ApprenantBulletinAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vague_id):
        try:
            # On passe request.user, ce qui garantit qu'un élève ne peut voir que SON propre bulletin
            bulletin_data = get_apprenant_bulletin_service(
                vague_id=vague_id, 
                apprenant=request.user
            )
            return Response(bulletin_data, status=status.HTTP_200_OK)
            
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)