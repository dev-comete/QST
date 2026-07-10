from django.shortcuts import render
from rest_framework import status , viewsets

from formations.serializers import FormationSerializer
from .models import Formation

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
