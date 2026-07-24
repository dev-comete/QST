# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views_auth import CustomLoginAPIView

urlpatterns = [
    # Login endpoint
    path('auth/login/', CustomLoginAPIView.as_view(), name='api-login'),
    
    # Endpoint to get a new access token when the 60-minute one expires
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
]