from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'titre', 'message', 'is_read', 'type_notif', 'created_at']
        read_only_fields = ['id', 'created_at']