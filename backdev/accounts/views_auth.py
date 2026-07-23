# views.py (or auth_views.py)
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers_auth import CustomLoginSerializer

class CustomLoginAPIView(TokenObtainPairView):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token to prove the authentication of those credentials, along with user details.
    """
    serializer_class = CustomLoginSerializer