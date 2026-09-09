# ia/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import tester_connexion_gemini, generer_distracteurs_qcm

class TestGeminiAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        resultat = tester_connexion_gemini()
        return Response({
            "statut": "succès" if resultat == "OK" else "erreur",
            "reponse_gemini": resultat
        })

class GenerateDistractorsAPIView(APIView):
    # L'accès est laissé libre (AllowAny) pour faciliter vos tests initiaux
    permission_classes = [AllowAny] 

    def post(self, request):
        enonce = request.data.get('enonce')
        bonne_reponse = request.data.get('bonne_reponse')

        if not enonce or not bonne_reponse:
            return Response(
                {"error": "Veuillez fournir 'enonce' et 'bonne_reponse' dans le corps de la requête."},
                status=status.HTTP_400_BAD_REQUEST
            )

        distracteurs = generer_distracteurs_qcm(enonce, bonne_reponse)
        
        return Response({
            "enonce": enonce,
            "bonne_reponse": bonne_reponse,
            "distracteurs": distracteurs
        }, status=status.HTTP_200_OK)