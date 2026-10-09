from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet, WsTicketView

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('ws-ticket/', WsTicketView.as_view(), name='chat-ws-ticket'),
    path('', include(router.urls)),
]
