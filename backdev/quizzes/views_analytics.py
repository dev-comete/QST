from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

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
            student_id = request.query_params.get('student_id')
            target_user = request.user
            if student_id:
                try:
                    target_user = get_user_model().objects.get(id=student_id)
                except (get_user_model().DoesNotExist, ValueError, TypeError):
                    return Response({"error": "Apprenant introuvable."}, status=status.HTTP_404_NOT_FOUND)

            bulletin_data = get_apprenant_bulletin_service(
                vague_id=vague_id, 
                apprenant=target_user,
                requesting_user=request.user
            )
            return Response(bulletin_data, status=status.HTTP_200_OK)
            
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)