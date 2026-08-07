from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model

from .serializers import UtilisateurSerializer, TypeUtilisateurSerializer , OrganisationSerializer
from .models import TypeUtilisateur, Organisation

User = get_user_model()

class OrganisationViewSet(viewsets.ModelViewSet):
    queryset = Organisation.objects.all()
    serializer_class = OrganisationSerializer
    
    permission_classes = [IsAdminUser]

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

    def perform_create(self, serializer):
        # 1. Sauvegarde l'utilisateur en base de données (ce qui appelle serializer.create)
        user = serializer.save()

        # 2. Création du Token sécurisé pour réinitialiser le mot de passe
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        path = reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
        reset_link = self.request.build_absolute_uri(path)

        print(f"\n🔗 LIEN DIRECT (SANS ENCODAGE) : {reset_link}\n")

        subject = "Invitation à rejoindre la plateforme QST"
        message = (
            f"Hi {user.username},\n\n"
            f"Your account has been created."
            f"To activate your account and set your password, "
            f"please click on the link below :\n\n"
            f"{reset_link}\n\n"
            f"If you are not the one who requested this, you can ignore this email.\n\n"
            f"See you soon !"
        )
        
        # Le mail par défaut (défini dans settings.py avec DEFAULT_FROM_EMAIL)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@comete.ai')

        send_mail(
            subject,
            message,
            from_email,
            [user.email],
            fail_silently=False, # Mettez True en production pour ne pas bloquer l'API si le mail échoue
        )

    def get_permissions(self):
        """
        Règles de sécurité strictes pour les Utilisateurs :
        - POST, PUT, DELETE (Créer/Modifier un compte) : Uniquement les Admins.
        - GET (Lire la liste) : Admins ET Formateurs (mais pas les apprenants).
        """
        if self.action in ['list', 'retrieve']:
            # On vérifie la permission manuellement ici pour le GET
            return [IsAuthenticated()]
        else:
            # Pour la création/modification, seul l'admin passe
            return [IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all()

        # 1. SÉCURITÉ CONFIDENTIALITÉ : Bloquer les apprenants
        if user.type_utilisateur and user.type_utilisateur.type_utilisateur == 'apprenant':
            # Un apprenant ne peut voir que son propre profil
            return queryset.filter(id=user.id)
            
        # 2. SÉCURITÉ CLOISONNEMENT : Le formateur ne voit que les utilisateurs de son organisation
        if user.type_utilisateur and user.type_utilisateur.type_utilisateur == 'formateur':
            queryset = queryset.filter(organisation=user.orga_principale)
            
        # 3. FILTRE : Pour la liste déroulante (ex: ?role=apprenant)
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(type_utilisateur__type_utilisateur=role)
            
        return queryset
