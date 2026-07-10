from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status , viewsets
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from django.core.exceptions import ValidationError

from .serializers import QuizSubmissionSerializer , QuizSerializer, QuestionSerializer, ReponseSerializer

from .services import submit_entire_quiz
from .models import Quiz, Question, Reponse

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class ReponseViewSet(viewsets.ModelViewSet):
    queryset = Reponse.objects.all()
    serializer_class = ReponseSerializer

class SubmitQuizAPIView(APIView):
    # This guarantees that only logged-in users can hit this endpoint
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        # 1. Validate the incoming JSON payload
        serializer = QuizSubmissionSerializer(data=request.data)
        
        if not serializer.is_valid():
            # If the frontend sent bad data (e.g., text instead of IDs), reject it immediately
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 2. Extract the clean, validated data
        data = serializer.validated_data

        try:
            # 3. Call the Service Layer (Business Logic)
            quiz_attempt = submit_entire_quiz(
                user=request.user,
                quiz_id=data['quiz_id'],
                quiz_payload=data['answers']
            )
            
        except ValidationError as e:
            # Catch errors raised by the service layer (e.g., Quiz ID doesn't exist)
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Catch unexpected server errors securely
            return Response({"error": "Une erreur interne est survenue."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        formation_liee = quiz_attempt.quiz.formation
        # 4. Return the HTTP Response
        return Response({
            "message": "Quiz soumis avec succès.",
            "formation_id": formation_liee.id,
            "formation_nom": formation_liee.nom_formation,
            "quiz_id": quiz_attempt.quiz.id,
            "score_obtenu": quiz_attempt.score_obtenu,
            "termine": quiz_attempt.termine
        }, status=status.HTTP_201_CREATED)