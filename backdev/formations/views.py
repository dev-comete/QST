from django.shortcuts import render
from rest_framework import status , viewsets

from quizzes.permissions import IsFormateurOrAdminOrReadOnly, IsOwnerOrAdminOrReadOnly

from formations.serializers import FormationSerializer
from .models import Formation

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
