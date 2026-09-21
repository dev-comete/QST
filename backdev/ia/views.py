# ia/views.py
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from quizzes.models import TypeQuestion

from .serializers import ImportQuestionsSerializer

from .services import tester_connexion_gemini, generer_distracteurs_qcm, parser_questions_brutes
from .formater.file_import_reader import extraire_texte_fichier

class TestGeminiAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        resultat = tester_connexion_gemini()
        return Response({
            "statut": "succès" if resultat == "OK" else "erreur",
            "reponse_gemini": resultat
        })

class GenerateDistractorsAPIView(APIView):
    permission_classes = [IsAuthenticated] 

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

class ImportQuestionsIAAPIView(GenericAPIView):
    permission_classes = [IsAuthenticated] 
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ImportQuestionsSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        fichier = serializer.validated_data.get('fichier')
        texte = serializer.validated_data.get('texte')
        raw_text = ""
        
        if fichier:
            try:
                raw_text = extraire_texte_fichier(fichier)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        elif texte:
            raw_text = texte

        if len(raw_text) < 10:
            return Response(
                {"error": "Le texte extrait est trop court pour contenir des questions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            questions_ia = parser_questions_brutes(raw_text)
            
            types_mapping = {
                t.code.upper(): t.id 
                for t in TypeQuestion.objects.all() if t.code
            }

            questions_formatees = []

            for q in questions_ia:
                # 🌟 SÉCURITÉ : On ignore les éléments qui ne sont pas des dictionnaires
                if not isinstance(q, dict):
                    continue

                type_code = q.get('type_code', 'QCM').upper()
                type_id = types_mapping.get(type_code)

                if not type_id:
                    continue 

                # 🌟 Utilisation stricte de .get() pour éviter toute KeyError
                question_propre = {
                    "enonce_question": q.get('enonce_question', 'Question sans énoncé'),
                    "type_id": type_id,
                    "bareme_pts": float(q.get('bareme_pts', 1.0)),
                    "options": q.get('options', [])
                }
                questions_formatees.append(question_propre)

            return Response({
                "message": f"{len(questions_formatees)} questions extraites avec succès.",
                "questions": questions_formatees
            }, status=status.HTTP_200_OK)

        except Exception as e:
            erreur_msg = str(e)
            if "503" in erreur_msg or "UNAVAILABLE" in erreur_msg:
                erreur_msg = "Les serveurs de l'IA sont surchargés. Veuillez réessayer."
                
            return Response(
                {"error": erreur_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )