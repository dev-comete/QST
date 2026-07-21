from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status , viewsets , generics
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from rest_framework.generics import ListAPIView , GenericAPIView

from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from .permissions import IsFormateurOrAdminOrReadOnly, IsApprenant

from .serializers import QuizSubmissionSerializer , QuizSerializer, QuestionSerializer, ReponseSerializer , AssignStudentSerializer , StudentTodoQuizSerializer , AssignQuestionsSerializer , TypeQuestionSerializer , BaremeSerializer , QuestionTypeQuestionSerializer , QuestionBaremeSerializer, CreateFullQuestionSerializer , QuizQuestionSerializer , ApprenantQuizListSerializer, StudentQuizQuestionSerializer , QuestionBankSerializer 

from .pagination import QuestionBankPagination

from .services import submit_entire_quiz, assign_questions_to_quiz , create_question_with_answers , search_questions_in_bank_service

from .models import Quiz, Question, Reponse , UtilisateurQuiz, QuizQuestion , TypeQuestion, Bareme, QuestionTypeQuestion, QuestionBareme , Valiny , Corrigee

from formations.models import UtilisateurVague

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

class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
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
    permission_classes = [IsApprenant]

    def post(self, request):
        serializer = QuizSubmissionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            # Calls your newly secured service layer
            quiz_attempt = submit_entire_quiz(
                user=request.user,
                quiz_id=data['quiz_id'],
                quiz_payload=data['answers']
            )
            
        except ValidationError as e:
            # This perfectly catches the "already submitted" or "not assigned" errors!
            return Response({"error": str(e.detail[0] if hasattr(e, 'detail') else e)}, status=status.HTTP_403_FORBIDDEN)
            
        except Exception as e:
            return Response({"error": "Une erreur interne est survenue."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        formation_liee = quiz_attempt.quiz.formation
        
        return Response({
            "message": "Quiz soumis avec succès.",
            "formation_id": formation_liee.id,
            "formation_nom": formation_liee.nom_formation,
            "quiz_id": quiz_attempt.quiz.id,
            "score_obtenu": quiz_attempt.score_obtenu,
            "termine": quiz_attempt.termine
        }, status=status.HTTP_201_CREATED)
    
class QuizReviewAPIView(APIView):
    permission_classes = [IsAuthenticated] # Add IsApprenant if applicable

    def get(self, request, quiz_id):
        assignment = get_object_or_404(UtilisateurQuiz, quiz_id=quiz_id, utilisateur=request.user)
        
        if not assignment.termine:
            return Response(
                {"error": "Vous ne pouvez pas voir la correction d'un quiz non terminé."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        valinys = Valiny.objects.filter(
            utilisateur=request.user, 
            question__quizquestion__quiz_id=quiz_id
        ).select_related('question').prefetch_related('reponses_choisies')

        corrections = []
        for v in valinys:
            # Get IDs of what the student clicked
            choisis_ids = set(v.reponses_choisies.values_list('id', flat=True))
            
            # 🆕 Fetch all Corrigee (options) for this question
            corriges = Corrigee.objects.filter(question=v.question).select_related('reponse')
            
            options_details = []
            for c in corriges:
                options_details.append({
                    "reponse_id": c.reponse.id,
                    "texte": c.reponse.reponse,
                    "est_correct": c.est_correct,
                    "choisi_par_apprenant": c.reponse.id in choisis_ids,
                    "explication": c.explication # The specific explanation!
                })
            
            corrections.append({
                "question_id": v.question.id,
                "enonce": v.question.enonce_question,
                "points_obtenus": v.pts,
                "vrai_ou_faux": v.vrai_ou_faux,
                "options": options_details # 🆕 Replaces the simple ID lists
            })

        return Response({
            "quiz_id": quiz_id,
            "score_final": assignment.score_obtenu,
            "corrections": corrections
        }, status=status.HTTP_200_OK)


class AssignStudentAPIView(GenericAPIView):
    """
    Allows a Formateur (or Admin) to assign a specific Quiz to a Student.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = AssignStudentSerializer # ⬅️ Enables the DRF UI form!

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # ✨ Because of PrimaryKeyRelatedField, these are already the actual instances!
        quiz = serializer.validated_data['quiz_id']
        student = serializer.validated_data['etudiant_id']
        
        # 1. SECURITY CHECK: Does this Formateur own the Formation this Quiz belongs to?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and quiz.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez assigner des étudiants qu'à vos propres quiz."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            

        # 3. ENROLLMENT CHECK: Is the student registered in a Vague for this Formation?
        is_enrolled = UtilisateurVague.objects.filter(
            utilisateur=student,
            vague__formation=quiz.formation
        ).exists()

        if not is_enrolled:
            return Response(
                {"error": "Cet étudiant n'est pas inscrit à la formation liée à ce quiz."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 4. CREATE ASSIGNMENT: Give them the Quiz
        assignment, created = UtilisateurQuiz.objects.get_or_create(
            utilisateur=student,
            quiz=quiz,
            defaults={
                'score_obtenu': 0.0,
                'termine': False
            }
        )
        
        if not created:
            return Response(
                {"message": "L'étudiant est déjà assigné à ce quiz."}, 
                status=status.HTTP_200_OK
            )
            
        return Response({
            "message": f"Étudiant {student.username} assigné avec succès au quiz '{quiz.titre}'."
        }, status=status.HTTP_201_CREATED)

class ApprenantQuizListAPIView(ListAPIView):
    """
    Returns a list of all quizzes assigned to the logged-in student,
    along with their completion status and score.
    """
    # 1. Lock it down: Must be logged in AND must be an apprenant
    permission_classes = [IsAuthenticated, IsApprenant]
    
    # 2. Tell DRF how to format the data
    serializer_class = ApprenantQuizListSerializer

    # 3. Tell DRF which data to fetch
    def get_queryset(self):
        # We only return the assignments that belong to the exact user making the request.
        # select_related makes the database query extremely fast by joining the tables!
        return UtilisateurQuiz.objects.filter(
            utilisateur=self.request.user
        ).select_related('quiz', 'quiz__formation')
    
class TakeQuizAPIView(APIView):
    """
    Fetches the quiz details and questions for a student.
    Strictly verifies assignment and prevents retakes of completed quizzes.
    """
    permission_classes = [IsAuthenticated, IsApprenant]

    def get(self, request, quiz_id):
        # GATE 1 & 2: Get the assignment for THIS exact student and THIS exact quiz
        # If it doesn't exist, get_object_or_404 will automatically return a 404 Not Found.
        assignment = get_object_or_404(
            UtilisateurQuiz, 
            quiz_id=quiz_id, 
            utilisateur=request.user
        )

        # GATE 3: Check if the student already submitted this test
        if assignment.termine:
            return Response(
                {"error": "Vous avez déjà terminé ce quiz. Vous ne pouvez pas le refaire."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if not assignment.heure_debut:
            assignment.heure_debut = now()
            assignment.save(update_fields=['heure_debut'])

        # Fetch all questions configured for this quiz
        # .select_related() optimizes the database lookup for the linked questions
        quiz_questions = QuizQuestion.objects.filter(quiz_id=quiz_id).select_related('question')
        
        # Serialize the questions using our safe serializer
        serializer = StudentQuizQuestionSerializer(quiz_questions, many=True)

        # Return a nice, clean payload for the frontend
        return Response({
            "quiz_id": assignment.quiz.id,
            "quiz_duree": assignment.quiz.duree,
            "heure_debut": assignment.heure_debut,
            "questions": serializer.data
        }, status=status.HTTP_200_OK)

class QuestionBankSearchAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        search_term = request.query_params.get('search', '').strip()
        type_code = request.query_params.get('type', '').strip()

        queryset = search_questions_in_bank_service(search_term, type_code)

        paginator = QuestionBankPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)

        serializer = QuestionBankSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)