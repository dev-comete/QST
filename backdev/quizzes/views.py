from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status , viewsets , generics
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from .permissions import IsFormateurOrAdminOrReadOnly, IsApprenant

from .serializers import QuizSubmissionSerializer , QuizSerializer, QuestionSerializer, ReponseSerializer , AssignStudentSerializer , StudentTodoQuizSerializer , AssignQuestionsSerializer , TypeQuestionSerializer , BaremeSerializer , QuestionTypeQuestionSerializer , QuestionBaremeSerializer, CreateFullQuestionSerializer

from .services import submit_entire_quiz, assign_questions_to_quiz , create_question_with_answers

from .models import Quiz, Question, Reponse , UtilisateurQuiz, QuizQuestion , TypeQuestion, Bareme, QuestionTypeQuestion, QuestionBareme

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

class TypeQuestionViewSet(viewsets.ModelViewSet):
    queryset = TypeQuestion.objects.all()
    serializer_class = TypeQuestionSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class BaremeViewSet(viewsets.ModelViewSet):
    queryset = Bareme.objects.all()
    serializer_class = BaremeSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class QuestionTypeQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet to link a Question to a specific Type."""
    queryset = QuestionTypeQuestion.objects.all()
    serializer_class = QuestionTypeQuestionSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class QuestionBaremeViewSet(viewsets.ModelViewSet):
    """ViewSet to link a Question to a specific point value."""
    queryset = QuestionBareme.objects.all()
    serializer_class = QuestionBaremeSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class AssignQuestionsAPIView(APIView):
    permission_classes = [IsFormateurOrAdminOrReadOnly]

    def post(self, request):
        # 1. Parse and validate the incoming JSON
        serializer = AssignQuestionsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        quiz = get_object_or_404(Quiz, id=serializer.validated_data['quiz_id'])
        
        # 2. View-Level Security Check
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and quiz.formation.createur != request.user:
            return Response({"error": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)
            
        # 3. Delegate to the Service Layer
        try:
            created_count = assign_questions_to_quiz(
                quiz=quiz, 
                questions_choisies=serializer.validated_data['questions_choisies']
            )
            return Response(
                {"message": f"{created_count} question(s) assignée(s) !"}, 
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
                    # Bulletproof error extraction that handles both Django and DRF ValidationErrors
                    if hasattr(e, 'detail'):
                        # It's a DRF ValidationError
                        error_message = e.detail[0] if isinstance(e.detail, list) else e.detail
                    elif hasattr(e, 'messages'):
                        # It's a Django ValidationError
                        error_message = e.messages[0]
                    else:
                        # Fallback for any other type of error
                        error_message = str(e)
                        
                    return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

class CreateFullQuestionAPIView(APIView):
    permission_classes = [IsFormateurOrAdminOrReadOnly]

    def post(self, request):
        serializer = CreateFullQuestionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        data = serializer.validated_data
        
        try:
            # Pass the validated data directly to the service layer
            question = create_question_with_answers(
                enonce=data['enonce_question'],
                type_id=data['type_id'],
                bareme_id=data['bareme_id'],
                options=data.get('options', [])
            )
            
            return Response(
                {
                    "message": "Question ajoutée avec succès à la banque !", 
                    "question_id": question.id
                }, 
                status=status.HTTP_201_CREATED
            )
            
        except ValidationError as e:
            # Handle business logic exceptions gracefully
            error_message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

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