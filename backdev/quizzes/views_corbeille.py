from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Quiz, Question
from .serializers import QuizSerializer, QuestionSerializer, QuestionBankSerializer

from .permissions import IsFormateurOrAdminOrReadOnly
from .pagination import QuestionBankPagination

class CorbeilleQuizAPIView(APIView):
    """
    Permet de lister les quiz supprimés et de les restaurer.
    """
    # 🌟 1. On applique les mêmes permissions que le reste de l'app
    permission_classes = [IsFormateurOrAdminOrReadOnly] 

    def get(self, request):
        user = request.user
        
        # 2. On récupère tous les quiz inactifs
        queryset = Quiz.all_objects.filter(is_active=False).order_by('-id')

        # 3. Cloisonnement (Multi-tenancy) : identique à QuizViewSet
        if not (user.is_staff or user.is_superuser):
            if hasattr(user, 'type_utilisateur') and user.type_utilisateur.type_utilisateur == 'formateur':
                # Le formateur ne voit que la corbeille de son organisation
                queryset = queryset.filter(formation__organisation=user.orga_principale)
            else:
                queryset = queryset.none()

        # Le frontend (data.results || data) gérera très bien cette liste simple
        serializer = QuizSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, quiz_id):
        user = request.user
        
        # 1. On cherche le quiz dans la corbeille
        quiz = get_object_or_404(Quiz.all_objects, id=quiz_id, is_active=False)
        
        # 2. Sécurité : On vérifie que l'utilisateur a le droit de manipuler ce quiz
        if not (user.is_staff or user.is_superuser):
            if quiz.formation.organisation != user.orga_principale:
                return Response(
                    {"error": "Accès refusé. Vous n'avez pas l'autorisation de restaurer ce quiz."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        # 3. Action de RESTAURATION
        quiz.is_active = True
        quiz.status = 'draft'  # 🌟 Votre excellente idée : on force le mode brouillon !
        quiz.save(update_fields=['is_active', 'status'])
        
        nom_quiz = quiz.titre if quiz.titre else f"Quiz #{quiz.id}"
        
        return Response(
            {"message": f"Le quiz '{nom_quiz}' a été restauré avec succès en mode brouillon."},
            status=status.HTTP_200_OK
        )


class CorbeilleQuestionAPIView(APIView):
    """
    Permet de lister les questions supprimées (avec pagination et filtres) et de les restaurer.
    """
    def get(self, request):
        # 1. Récupération des paramètres de recherche envoyés par React
        search_term = request.query_params.get('search', '').strip()
        type_code = request.query_params.get('type', '').strip()

        # 2. Requête de base : Uniquement les questions inactives (corbeille)
        queryset = Question.all_objects.prefetch_related('corrigee_set__reponse').filter(
            is_active=False
        ).order_by('-id')

        # 3. Application des filtres si présents
        if search_term:
            queryset = queryset.filter(enonce_question__icontains=search_term)
        if type_code:
            queryset = queryset.filter(questiontypequestion__type_question__code__iexact=type_code)

        # 4. Pagination
        paginator = QuestionBankPagination()
        paginated_queryset = paginator.paginate_queryset(queryset.distinct(), request)
        
        # 5. Sérialisation avec le même serializer que la banque active (pour avoir les 'reponses')
        serializer = QuestionBankSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, question_id):
        # Action de RESTAURATION
        question = get_object_or_404(Question.all_objects, id=question_id, is_active=False)
        
        question.is_active = True
        question.save()
        
        return Response(
            {"message": f"La question a été restaurée dans la banque avec succès."},
            status=status.HTTP_200_OK
        )