# serializers_auth.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # The default validate method checks the username/password and generates the tokens
        data = super().validate(attrs)

        # self.user is automatically populated if the credentials are valid
        user = self.user

        role = user.type_utilisateur.type_utilisateur if user.type_utilisateur else None

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
            }
        })

        # If you have specific models for Formateur or Apprenant (like a OneToOneField),
        # you can check them here. For example:
        # data['user']['role'] = 'formateur' if hasattr(user, 'formateur_profile') else 'apprenant'

        return data