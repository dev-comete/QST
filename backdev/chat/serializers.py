from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, Message

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'created_at', 'client_id']


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSimpleSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'type', 'title', 'participants', 'created_at', 'updated_at',
                  'last_message', 'unread_count']

    def get_last_message(self, obj):
        # The viewset prefetches the latest message in ONE query (no N+1).
        prefetched = getattr(obj, 'latest_message_list', None)
        if prefetched is not None:
            return MessageSerializer(prefetched[0]).data if prefetched else None
        last = obj.messages.select_related('sender').order_by('-id').first()
        return MessageSerializer(last).data if last else None

    def get_unread_count(self, obj):
        return getattr(obj, 'unread_count', 0)
