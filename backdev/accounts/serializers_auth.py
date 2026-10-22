# serializers_auth.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import PasswordResetRequest

class CustomLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # The default validate method checks the username/password and generates the tokens
        data = super().validate(attrs)

        # self.user is automatically populated if the credentials are valid
        user = self.user

        role = user.type_utilisateur.type_utilisateur if user.type_utilisateur else None
        # 1. On récupère la liste complète (pratique pour les apprenants)

        organisations_list = [
            {'id': org.id, 'nom': org.nom} 
            for org in user.organisation.all()
        ]

        # 2. On utilise la propriété (@property) qu'on a créée pour choper l'orga principale
        orga_principale_nom = user.orga_principale.nom if user.orga_principale else None

        # Add custom data to the response payload
        data.update({
            'user': {
                'id': user.id,
                'role': role,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                # Example of determining role based on Django's built-in flags
                'is_staff': user.is_staff, 
                'is_superuser': user.is_superuser,
                'orga_principale': orga_principale_nom, # String (ex: "Apple")
                'organisations': organisations_list     # Array (ex: [{id: 1, nom: "Apple"}])
            }
        })

        # If you have specific models for Formateur or Apprenant (like a OneToOneField),
        # you can check them here. For example:
        # data['user']['role'] = 'formateur' if hasattr(user, 'formateur_profile') else 'apprenant'

        return data

class ResetPasswordConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        help_text="Le nouveau mot de passe (8 caractères minimum)."
    )

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = PasswordResetRequest
        fields = ['id', 'user_email', 'user_name', 'role', 'status', 'requested_at', 'resolved_at']
        read_only_fields = ['id', 'requested_at', 'resolved_at']

    def get_role(self, obj):
        # Récupération sécurisée du rôle via votre modèle TypeUtilisateur
        if obj.user and getattr(obj.user, 'type_utilisateur', None):
            return obj.user.type_utilisateur.type_utilisateur
        return "Non défini"