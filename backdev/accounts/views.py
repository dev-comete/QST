from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model

from .serializers import UtilisateurSerializer, TypeUtilisateurSerializer
from .models import TypeUtilisateur

User = get_user_model()

class TypeUtilisateurViewSet(viewsets.ModelViewSet):
    queryset = TypeUtilisateur.objects.all()
    serializer_class = TypeUtilisateurSerializer
    # Only Admins can manage roles
    permission_classes = [IsAdminUser]

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UtilisateurSerializer
    
    # SECURITY: Only users with is_staff=True (Admins) can access ANY of these endpoints
    permission_classes = [IsAdminUser]
