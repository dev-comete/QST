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
    permission_classes = [AllowAny] 

    def post(self, request):
        enonce = request.data.get('enonce')
        bonne_reponse = request.data.get('bonne_reponse')

        if not enonce or not bonne_reponse:
            return Response(
                {"error": "Veuillez fournir 'enonce' et 'bonne_reponse' dans le corps de la requête."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # On tente de générer
            distracteurs = generer_distracteurs_qcm(enonce, bonne_reponse)
            
            return Response({
                "enonce": enonce,
                "bonne_reponse": bonne_reponse,
                "distracteurs": distracteurs
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # S'il y a une erreur (ex: 503), on renvoie une réponse d'erreur
            erreur_msg = str(e)
            if "503" in erreur_msg or "UNAVAILABLE" in erreur_msg:
                erreur_msg = "Les serveurs de l'IA sont temporairement surchargés. Veuillez réessayer dans quelques instants."
                
            return Response(
                {"error": erreur_msg},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )