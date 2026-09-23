# views.py (or auth_views.py)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from .serializers_auth import CustomLoginSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model

from .serializers_auth import ResetPasswordConfirmSerializer

User = get_user_model()

class CustomLoginAPIView(TokenObtainPairView):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token to prove the authentication of those credentials, along with user details.
    """
    serializer_class = CustomLoginSerializer

class LogoutAPIView(APIView):
    # L'utilisateur doit être connecté pour pouvoir se déconnecter
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # On récupère le refresh token envoyé par React
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            
            # On le met sur liste noire
            token.blacklist()
            
            # 205 Reset Content indique au frontend qu'il doit vider ses données
            return Response(status=status.HTTP_205_RESET_CONTENT)
            
        except Exception as e:
            # Si le token est invalide ou absent, on renvoie une erreur 400
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ConfirmPasswordResetAPIView(APIView):
    # Endpoint public : l'utilisateur n'est pas encore connecté
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            # 1. On décode l'ID de l'utilisateur
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        # 2. On vérifie le token généré lors de la création
        if user is not None and default_token_generator.check_token(user, token):
            # 3. Le token est valide, on enregistre le nouveau mot de passe
            user.set_password(new_password)
            user.save()
            
            return Response(
                {"message": "Mot de passe défini avec succès. Vous pouvez maintenant vous connecter."}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Ce lien d'activation est invalide ou a déjà été utilisé."}, 
                status=status.HTTP_400_BAD_REQUEST
            )