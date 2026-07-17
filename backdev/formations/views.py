from django.shortcuts import render
from rest_framework.generics import GenericAPIView
from rest_framework import status , viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from quizzes.permissions import IsFormateurOrAdminOrReadOnly, IsOwnerOrAdminOrReadOnly

from formations.serializers import FormationSerializer , CreateVagueSerializer , AssignStudentToVagueSerializer
from .models import Formation , Vague , UtilisateurVague

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
    """
    Allows a Formateur (or Admin) to create a new Vague for their Formation.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    serializer_class = CreateVagueSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        formation_id = serializer.validated_data['formation_id']
        date_vague = serializer.validated_data['date_vague']
        

        
        # 2. SECURITY CHECK: Does this Formateur own the Formation?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez créer une vague que pour vos propres formations."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Create the Vague
        vague = Vague.objects.create(
            formation=formation,
            date_vague=date_vague
        )
        
        return Response({
            "message": "Vague créée avec succès.",
            "vague_id": vague.id,
            "formation": formation.nom_formation,
            "date_vague": vague.date_vague
        }, status=status.HTTP_201_CREATED)


class AssignStudentToVagueAPIView(APIView):
    """
    Allows a Formateur (or Admin) to enroll a student into a specific Vague.
    """
    permission_classes = [IsFormateurOrAdminOrReadOnly]
    erializer_class = AssignStudentToVagueSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        vague_id = serializer.validated_data['vague_id']
        etudiant_id = serializer.validated_data['etudiant_id']
        
        # 1. Fetch the Vague
        vague = get_object_or_404(Vague, id=vague_id)
        
        # 2. SECURITY CHECK: Does this Formateur own the Formation linked to this Vague?
        is_admin = request.user.is_staff or request.user.is_superuser
        if not is_admin and vague.formation.createur != request.user:
            return Response(
                {"error": "Vous ne pouvez assigner des étudiants qu'à vos propres vagues."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Fetch the Student
        student = get_object_or_404(User, id=etudiant_id)
        
        # Optional: You could add a check here to ensure the student actually has the role 'apprenant'
        
        # 4. Create the assignment using get_or_create to prevent duplicates
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
