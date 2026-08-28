# quizzes/dashboard_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .service_dashboard import get_dashboard_metrics_service
from .serializers_dashboard import DashboardMetricsSerializer

class FormateurDashboardMetricsAPIView(APIView):
    """
    Fournit les métriques globales pour le tableau de bord (Formateur/Admin).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. On récupère les données brutes via la couche métier
        raw_data = get_dashboard_metrics_service(request.user)
        
        # 2. On formate et valide la donnée pour le frontend
        serializer = DashboardMetricsSerializer(raw_data)
        
        # 3. On retourne la réponse HTTP standardisée
        return Response(serializer.data)