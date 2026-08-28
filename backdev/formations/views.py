from django.shortcuts import render
from rest_framework.generics import GenericAPIView , ListAPIView
from rest_framework import status , viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.permissions import IsAuthenticated

from quizzes.permissions import IsFormateurOrAdminOrReadOnly, IsOwnerOrAdminOrReadOnly

from .serializers import FormationSerializer , CreateVagueSerializer , AssignStudentToVagueSerializer , AssignQuizToVagueSerializer , VagueListWithStudentsSerializer, VagueSerializer

from .models import Formation , Vague , UtilisateurVague
from quizzes.models import Quiz, UtilisateurQuiz


User = get_user_model()

class VagueViewSet(viewsets.ModelViewSet):
    queryset = Vague.objects.all()
    serializer_class = VagueSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly]

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly , IsOwnerOrAdminOrReadOnly]

    def perform_create(self, serializer):
            """
            When a Formateur creates a new Formation via POST, 
            automatically assign them as the creator so they don't have to send their own ID.
            """
            serializer.save(createur=self.request.user , organisation=self.request.user.orga_principale)

    def get_queryset(self):
            user = self.request.user
            if user.is_staff or user.is_superuser:
                return Formation.objects.all() # L'admin voit tout
                
            # Le formateur ne voit QUE les formations de son organisation
            return Formation.objects.filter(organisation=user.orga_principale)
    
class CreateVagueAPIView(GenericAPIView):
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = CreateVagueSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        formation = serializer.validated_data['formation_id'] 
        debut = serializer.validated_data['debut']
        fin = serializer.validated_data['fin']
        
        # SECURITY CHECK: Does this Formateur own the Formation?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez créer une vague que pour vos propres formations."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Create the Vague with the new date range
        vague = Vague.objects.create(
            formation=formation, 
            debut=debut,
            fin=fin
        )
        
        return Response({
            "message": "Vague créée avec succès.",
            "vague_id": vague.id,
            "debut": vague.debut,
            "fin": vague.fin
        }, status=status.HTTP_201_CREATED)
class MesVaguesAPIView(APIView):
    """
    Retourne la liste des vagues auxquelles l'étudiant connecté est inscrit.
    """
    permission_classes = [IsAuthenticated] # Vous pouvez ajouter IsApprenant si vous l'avez

    def get(self, request):
        # On récupère les inscriptions de cet étudiant uniquement
        inscriptions = UtilisateurVague.objects.filter(
            utilisateur=request.user
        ).select_related('vague', 'vague__formation')
        
        data = []
        for inscription in inscriptions:
            data.append({
                "vague_id": inscription.vague.id,
                "formation_nom": inscription.vague.formation.nom_formation,
                "debut": inscription.vague.debut,
                "fin": inscription.vague.fin
            })
            
        return Response(data)


class AssignStudentToVagueAPIView(GenericAPIView):
    """
    Allows a Formateur (or Admin) to enroll multiple students into a specific Vague.
    Automatically assigns all existing quizzes for that Formation to the new students.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = AssignStudentToVagueSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        vague = serializer.validated_data['vague_id']
        students = serializer.validated_data['etudiant_ids'] # ⬅️ Ceci est maintenant une liste d'objets Utilisateur
        
        # 1. SECURITY CHECK: Does this Formateur own the Formation?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and vague.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez assigner des étudiants qu'à vos propres vagues."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        quizzes = Quiz.objects.filter(formation=vague.formation)
        students_assigned = 0
        total_quizzes_assigned = 0

        # 🌟 NOUVEAU : On sécurise l'opération en base de données
        with transaction.atomic():
            for student in students:
                # 2. ROLE CHECK
                if not student.type_utilisateur or student.type_utilisateur.type_utilisateur != 'apprenant':
                    # Si un seul étudiant n'est pas valide, la transaction annule tout
                    return Response(
                        {"error": f"L'utilisateur {student.username} n'a pas le rôle 'apprenant'."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # 3. ENROLL THE STUDENT
                assignment, created = UtilisateurVague.objects.get_or_create(
                    vague=vague,
                    utilisateur=student
                )

                if created:
                    students_assigned += 1
                    student.organisation.add(vague.formation.organisation)
                
                    # 4. THE AUTO-SYNC MAGIC
                    for quiz in quizzes:
                        _, quiz_created = UtilisateurQuiz.objects.get_or_create(
                            utilisateur=student,
                            quiz=quiz,
                            defaults={
                                'score_obtenu': 0.0,
                                'termine': False
                            }
                        )
                        if quiz_created:
                            total_quizzes_assigned += 1
            
        return Response({
            "message": f"{students_assigned} étudiant(s) assigné(s) à la vague {vague.id}. {total_quizzes_assigned} quiz auto-assignés au total."
        }, status=status.HTTP_201_CREATED)

class AssignQuizToVagueAPIView(GenericAPIView):
    """
    Allows a Formateur to assign a Quiz to an entire Vague (all enrolled students) at once.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = AssignQuizToVagueSerializer # Activates the UI!

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        quiz = serializer.validated_data['quiz_id']
        vague = serializer.validated_data['vague_id']
        
        # 1. SECURITY CHECK: Does this Formateur own the Formation?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and quiz.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez assigner des quiz qu'à vos propres vagues."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 2. Fetch all students currently enrolled in this Vague
        # Using select_related speeds up the database query!
        enrollments = UtilisateurVague.objects.filter(vague=vague).select_related('utilisateur')
        
        if not enrollments.exists():
            return Response(
                {"message": "Cette vague ne contient encore aucun étudiant. Aucun quiz assigné."},
                status=status.HTTP_200_OK
            )

        # 3. Bulk Assign the Quiz to everyone in the classroom
        assigned_count = 0
        for enrollment in enrollments:
            assignment, created = UtilisateurQuiz.objects.get_or_create(
                utilisateur=enrollment.utilisateur,
                quiz=quiz,
                defaults={
                    'score_obtenu': 0.0,
                    'termine': False
                }
            )
            if created:
                assigned_count += 1
                
        if quiz.status == 'draft':
            message = (
                f"Succès ! Le quiz '{quiz.titre}' a été assigné à {assigned_count} étudiant(s). "
                f"ATTENTION : Ce quiz est encore en mode Brouillon. "
                f"Les étudiants ne le verront que lorsque vous le passerez en 'Publié'."
            )
        else:
            message = f"Succès ! Le quiz '{quiz.titre}' a été assigné et est maintenant visible pour {assigned_count} étudiant(s)."

        return Response({
            "message": message
        }, status=status.HTTP_201_CREATED)
    
class VagueListAPIView(ListAPIView):
    """
    Returns a list of all Vagues, including the details of the Formation 
    and a nested list of all enrolled students.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = VagueListWithStudentsSerializer

    def get_queryset(self):
        queryset = Vague.objects.select_related('formation').prefetch_related(
            'utilisateurvague_set__utilisateur'
        )
        
        # OPTIONAL SECURITY LAYER: 
        # If you only want Formateurs to see the Vagues for their OWN Formations:
        is_admin = self.request.user.is_staff or self.request.user.is_superuser
        if not is_admin:
            queryset = queryset.filter(formation__createur=self.request.user)
            
        formation_id = self.request.query_params.get('formation')
        mois = self.request.query_params.get('mois') # ex: '09' pour septembre
        annee = self.request.query_params.get('annee') # ex: '2026'

        if formation_id:
            queryset = queryset.filter(formation_id=formation_id)
            
        if mois:
            # Filtre les vagues qui commencent ce mois-là
            queryset = queryset.filter(debut__month=mois)
            
        if annee:
            queryset = queryset.filter(debut__year=annee)

        # On trie toujours par date de début (les plus récentes en premier)
        return queryset.order_by('-debut')