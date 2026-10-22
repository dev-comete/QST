# urls.py
from django.urls import path, include

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

from .views_auth import CustomLoginAPIView, LogoutAPIView , ConfirmPasswordResetAPIView, SubmitPasswordResetRequestView , AdminPasswordResetViewSet
from .views import MyBasicProfileAPIView

router = DefaultRouter()
# Register the AdminPasswordResetViewSet with the router
router.register(r'admin/password-resets', AdminPasswordResetViewSet, basename='admin-password-resets')

urlpatterns = [
    # Login endpoint
    path('auth/login/', CustomLoginAPIView.as_view(), name='api-login'),
    
    # Endpoint to get a new access token when the 60-minute one expires
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),

    path('auth/logout/', LogoutAPIView.as_view(), name='api-logout'),

    path('auth/request-password-reset/', SubmitPasswordResetRequestView.as_view(), name='request-password-reset'),

    path('auth/reset-password-confirm/', ConfirmPasswordResetAPIView.as_view(), name='api_password_reset_confirm'),

    path('profile/me/', MyBasicProfileAPIView.as_view(), name='my-basic-profile'),

    path('', include(router.urls)),
]