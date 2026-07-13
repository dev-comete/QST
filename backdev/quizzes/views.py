from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status , viewsets , generics
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from .permissions import IsFormateurOrAdminOrReadOnly, IsApprenant

from .serializers import QuizSubmissionSerializer , QuizSerializer, QuestionSerializer, ReponseSerializer , AssignStudentSerializer , StudentTodoQuizSerializer , AssignQuestionsSerializer

from .services import submit_entire_quiz
from .models import Quiz, Question, Reponse , UtilisateurQuiz, QuizQuestion

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class ReponseViewSet(viewsets.ModelViewSet):
    queryset = Reponse.objects.all()
    serializer_class = ReponseSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class AssignQuestionsAPIView(APIView):
    # Only Formateurs and Admins can access this
    permission_classes = [IsFormateurOrAdminOrReadOnly]

    def post(self, request):
        serializer = AssignQuestionsSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        quiz_id = serializer.validated_data['quiz_id']
        question_ids = serializer.validated_data['question_ids']
        
        # 1. Fetch the Quiz
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # 2. SECURITY CHECK: Does this Formateur own the Formation?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and quiz.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez modifier que les quiz de vos propres formations."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Fetch the Questions and verify they exist
        questions = Question.objects.filter(id__in=question_ids)
        if len(questions) != len(question_ids):
            return Response(
                {"error": "Une ou plusieurs questions n'ont pas pu être trouvées."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        links_to_create = []
        for question in questions:
            # We check if the link already exists so we don't violate your unique_together constraint
            if not QuizQuestion.objects.filter(quiz=quiz, question=question).exists():
                links_to_create.append(QuizQuestion(quiz=quiz, question=question))
        
        # bulk_create saves all the new links to the database in a single query (very fast!)
        if links_to_create:
            QuizQuestion.objects.bulk_create(links_to_create)
        
        return Response({
            "message": f"{len(links_to_create)} nouvelle(s) question(s) liée(s) avec succès au Quiz {quiz.id}."
        }, status=status.HTTP_200_OK)

class MyTodoQuizzesAPIView(generics.ListAPIView):
    serializer_class = StudentTodoQuizSerializer
    # Strict security: Only students can access this endpoint
    permission_classes = [IsApprenant]

    def get_queryset(self):
        """
        This is the magic part. Instead of returning all quizzes in the database,
        we strictly filter it to ONLY show unfinished quizzes assigned to the user making the request.
        """
        return UtilisateurQuiz.objects.filter(
            utilisateur=self.request.user,
            termine=False
        ).select_related('quiz', 'quiz__formation') # select_related makes the database query much faster!

class SubmitQuizAPIView(APIView):
    # This guarantees that only logged-in users can hit this endpoint
    permission_classes = [IsApprenant]

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

class AssignStudentAPIView(APIView):
    # Only Formateurs and Admins can access this endpoint
    permission_classes = [IsFormateurOrAdminOrReadOnly]

    def post(self, request):
        serializer = AssignStudentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        etudiant_id = serializer.validated_data['etudiant_id']
        quiz_id = serializer.validated_data['quiz_id']
        
        # 1. Fetch the Quiz
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # 2. SECURITY CHECK: Does this Formateur own the Formation this Quiz belongs to?
        # (Admins bypass this check)
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and quiz.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez assigner des étudiants qu'à vos propres quiz."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Fetch the Student
        student = User.objects.get(id=etudiant_id)
        
        # 4. Create the assignment (using get_or_create so we don't crash if assigned twice)
        assignment, created = UtilisateurQuiz.objects.get_or_create(
            utilisateur=student,
            quiz=quiz,
            defaults={
                'score_obtenu': 0.0,
                'termine': False
            }
        )
        
        if not created:
            return Response({"message": "L'étudiant est déjà assigné à ce quiz."}, status=status.HTTP_200_OK)
            
        return Response({
            "message": f"Étudiant {student.username} assigné avec succès au quiz {quiz.id}."
        }, status=status.HTTP_201_CREATED)