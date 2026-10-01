from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..services.interactive_analytics import get_evolution_interactive_service

class InteractiveEvolutionChartAPIView(APIView):
    """
    Endpoint pour alimenter le graphique interactif du Frontend.
    Accepte un paramètre optionnel 'etudiants' dans l'URL.
    Exemple: /api/vagues/5/chart-evolution/?etudiants=12,45,8
    """
    permission_classes = [IsAuthenticated] # + IsFormateurOrAdmin

    def get(self, request, vague_id):
        # 1. Extraction des filtres dynamiques depuis l'URL
        etudiants_param = request.query_params.get('etudiants', '')
        
        student_ids = []
        if etudiants_param:
            try:
                # Transforme la chaîne "12,45,8" en liste d'entiers [12, 45, 8]
                student_ids = [int(x) for x in etudiants_param.split(',') if x.strip().isdigit()]
            except ValueError:
                pass # Si le frontend envoie n'importe quoi, on ignore le filtre

        # 2. Appel du service
        data = get_evolution_interactive_service(
            vague_id=vague_id, 
            student_ids=student_ids
        )
        
        return Response(data)