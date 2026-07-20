from django.shortcuts import render
from rest_framework.generics import GenericAPIView , ListAPIView
from rest_framework import status , viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from quizzes.permissions import IsFormateurOrAdminOrReadOnly, IsOwnerOrAdminOrReadOnly

from .serializers import FormationSerializer , CreateVagueSerializer , AssignStudentToVagueSerializer , AssignQuizToVagueSerializer , VagueListWithStudentsSerializer

from .models import Formation , Vague , UtilisateurVague
from quizzes.models import Quiz, UtilisateurQuiz


User = get_user_model()

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsFormateurOrAdminOrReadOnly , IsOwnerOrAdminOrReadOnly]

    def perform_create(self, serializer):
            """
            When a Formateur creates a new Formation via POST, 
            automatically assign them as the creator so they don't have to send their own ID.
            """
            serializer.save(createur=self.request.user)


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


class AssignStudentToVagueAPIView(GenericAPIView):
    """
    Allows a Formateur (or Admin) to enroll a student into a specific Vague.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = AssignStudentToVagueSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # ✨ DRF MAGIC: Because of PrimaryKeyRelatedField, these are already the actual objects!
        # Even though the key is named '_id', the value inside is the full Model instance.
        vague = serializer.validated_data['vague_id']
        student = serializer.validated_data['etudiant_id']
        
        # 1. SECURITY CHECK: Does this Formateur own the Formation linked to this Vague?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and vague.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez assigner des étudiants qu'à vos propres vagues."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 2. ROLE CHECK: Ensure the user is actually an 'apprenant'
        if not student.type_utilisateur or student.type_utilisateur.type_utilisateur != 'apprenant':
            return Response(
                {"error": f"L'utilisateur {student.username} n'a pas le rôle 'apprenant'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 3. Create the assignment
        assignment, created = UtilisateurVague.objects.get_or_create(
            vague=vague,
            utilisateur=student
        )
        
        if not created:
            return Response(
                {"message": "L'étudiant est déjà inscrit à cette vague."}, 
                status=status.HTTP_200_OK
            )
            
        return Response({
            "message": f"Étudiant {student.username} assigné avec succès à la vague {vague.id} ({vague.formation.nom_formation})."
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
                
        return Response({
            "message": f"Succès ! Le quiz '{quiz.id}' a été assigné à {assigned_count} étudiant(s) de la vague {vague.id}."
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
            
        return queryset