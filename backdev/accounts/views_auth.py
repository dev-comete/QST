# views.py (or auth_views.py)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from .serializers_auth import CustomLoginSerializer

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