from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Quiz, Question
from .serializers import QuizSerializer, QuestionSerializer

class CorbeilleQuizAPIView(APIView):
    """
    Permet de lister les quiz supprimés et de les restaurer.
    """
    # permission_classes = [IsAuthenticated, IsFormateur] # À adapter selon vos permissions

    def get(self, request):
        # On récupère les quiz inactifs (idéalement filtrés par le créateur de la formation)
        # request.user si vous voulez limiter aux quiz de ce formateur précis
        quizzes = Quiz.all_objects.filter(
            is_active=False, 
            formation__createur=request.user 
        )
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, quiz_id):
        # Action de RESTAURATION
        quiz = get_object_or_404(Quiz.all_objects, id=quiz_id, is_active=False)
        
        quiz.is_active = True
        quiz.status = 'draft'  # On le remet en brouillon par sécurité pour éviter qu'il ne s'ouvre direct
        quiz.save()
        
        return Response(
            {"message": f"Le quiz '{quiz.id}' a été restauré avec succès en mode brouillon."},
            status=status.HTTP_200_OK
        )


class CorbeilleQuestionAPIView(APIView):
    """
    Permet de lister les questions supprimées et de les restaurer.
    """
    def get(self, request):
        questions = Question.all_objects.filter(is_active=False)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, question_id):
        # Action de RESTAURATION
        question = get_object_or_404(Question.all_objects, id=question_id, is_active=False)
        
        question.is_active = True
        question.save()
        
        return Response(
            {"message": f"La question '{question.id}' a été restaurée dans la banque avec succès."},
            status=status.HTTP_200_OK
        )