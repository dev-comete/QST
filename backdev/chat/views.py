from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Conversation.objects.none()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        if user is None or not getattr(user, 'is_authenticated', False):
            return Conversation.objects.none()

        # Only return conversations the user is part of, or the general room
        return (
            Conversation.objects.filter(participants=user) |
            Conversation.objects.filter(type='general')
        ).distinct().order_by('-updated_at')

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Returns all messages for a specific conversation.
        Endpoint: /chat/conversations/{pk}/messages/
        """
        conversation = self.get_object()
        messages = conversation.messages.all().order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)