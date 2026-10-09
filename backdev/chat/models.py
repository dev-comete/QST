from django.conf import settings
from django.db import models
from django.db.models import Q


class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ('direct', 'Direct (1-on-1)'),
        ('general', 'General Formateurs'),
    )
    type = models.CharField(max_length=20, choices=CONVERSATION_TYPES, default='direct')
    title = models.CharField(max_length=255, blank=True, null=True)

    # "<low_id>_<high_id>" for direct chats. The unique constraint makes it
    # impossible to create two direct conversations for the same pair of users,
    # even if two WebSocket connections race.
    direct_key = models.CharField(
        max_length=64, unique=True, null=True, blank=True, editable=False
    )

    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            # At most ONE general room can ever exist.
            models.UniqueConstraint(
                fields=['type'],
                condition=Q(type='general'),
                name='single_general_conversation',
            ),
        ]

    @staticmethod
    def build_direct_key(user_a_id, user_b_id):
        low, high = sorted([int(user_a_id), int(user_b_id)])
        return f'{low}_{high}'

    def __str__(self):
        if self.title:
            return self.title
        return f'{self.get_type_display()} - {self.id}'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()

    # Client-generated UUID. Makes sending idempotent: if the client re-sends
    # after a reconnect, the server returns the existing row instead of
    # creating a duplicate. Also lets the client match its optimistic bubble.
    client_id = models.CharField(max_length=64, null=True, blank=True)

    related_question_id = models.IntegerField(null=True, blank=True)
    related_quiz_id = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # DEPRECATED: meaningless for group rooms. Use ConversationRead instead.
    # You can drop this column in a later migration.
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']
        indexes = [models.Index(fields=['conversation', 'id'], name='msg_conversation_id_idx')]
        constraints = [
            models.UniqueConstraint(
                fields=['sender', 'client_id'],
                condition=Q(client_id__isnull=False),
                name='uniq_message_sender_client_id',
            ),
        ]

    def __str__(self):
        if not self.id:
            return 'New Message'
        return f'[{self.created_at:%H:%M}] {self.sender}: {self.content[:30]}'


class ConversationRead(models.Model):
    """Per-user read marker: everything with id <= last_read_id is read."""

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='reads')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversation_reads')
    last_read_id = models.BigIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['conversation', 'user'], name='uniq_read_state_per_user'),
        ]
