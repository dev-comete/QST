from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import PermissionDenied

# Importez la fonction que nous venons de créer
from .service_pdf import render_to_pdf
from .service_analytics import get_apprenant_bulletin_service

class ApprenantBulletinPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vague_id):
        try:
            # 1. On récupère exactement les mêmes données que pour le JSON
            bulletin_data = get_apprenant_bulletin_service(
                vague_id=vague_id, 
                apprenant=request.user
            )
            
            # 2. On génère le PDF avec un template HTML
            pdf_response = render_to_pdf('bulletin_template.html', {'data': bulletin_data})
            
            if pdf_response:
                # 3. Forcer le téléchargement du fichier pour le navigateur
                filename = f"Bulletin_{request.user.last_name}_{bulletin_data['vague']['formation']}.pdf"
                pdf_response['Content-Disposition'] = f'attachment; filename="{filename}"'
                return pdf_response
                
            return Response({"error": "Erreur lors de la génération du PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)