import json
import logging
import time
from collections import deque

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import Conversation, Message
from .permissions import is_formateur
from .serializers import MessageSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 2000
RATE_LIMIT_MAX = 10         # messages ...
RATE_LIMIT_WINDOW = 10.0    # ... per 10 seconds, per connection


class CloseCode:
    """Custom close codes. The frontend must NOT auto-retry on these."""
    BAD_REQUEST = 4400
    UNAUTHENTICATED = 4401
    FORBIDDEN = 4403
    NOT_FOUND = 4404


class ChatConsumer(AsyncJsonWebsocketConsumer):
    # ------------------------------------------------------------------ lifecycle
    async def connect(self):
        self.user = self.scope['user']
        self._sent_at = deque()

        # Accept FIRST, then close with a custom code if needed
        await self.accept()

        if not self.user.is_authenticated:
            await self.close(code=CloseCode.UNAUTHENTICATED)
            return
            
        has_perm = await database_sync_to_async(is_formateur)(self.user)
        if not has_perm:
            await self.close(code=CloseCode.FORBIDDEN)
            return

        # 1. Join Personal Group (Receives all 1-on-1 Direct Messages)
        self.personal_group = f'chat_user_{self.user.id}'
        await self.channel_layer.group_add(self.personal_group, self.channel_name)

        # 2. Join General Group (Receives all General Room Messages)
        self.general_id = await self._get_general_conversation_id()
        self.general_group = f'chat_conversation_{self.general_id}'
        await self.channel_layer.group_add(self.general_group, self.channel_name)

        # Tell the client which conversation ID represents the general room
        await self.send_json({'type': 'ready', 'conversation_id': self.general_id})

    async def disconnect(self, close_code):
        if hasattr(self, 'personal_group'):
            await self.channel_layer.group_discard(self.personal_group, self.channel_name)
        if hasattr(self, 'general_group'):
            await self.channel_layer.group_discard(self.general_group, self.channel_name)

    # ------------------------------------------------------------------ incoming
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if not text_data:
            return
        try:
            content = json.loads(text_data)
        except ValueError:
            await self._error('bad_json', 'Invalid JSON.')
            return
        await self.receive_json(content)

    async def receive_json(self, content, **kwargs):
        if not isinstance(content, dict):
            await self._error('bad_payload', 'Payload must be an object.')
            return

        kind = content.get('type', 'message')

        if kind == 'ping':
            await self.send_json({'type': 'pong'})
            return
        if kind != 'message':
            return

        text = content.get('message')
        client_id = content.get('client_id')
        conversation_id = content.get('conversation_id')
        target_user_id = content.get('target_user_id')

        if not isinstance(client_id, str) or not (0 < len(client_id) <= 64):
            client_id = None

        if not isinstance(text, str) or not text.strip():
            return
        text = text.strip()
        if len(text) > MAX_MESSAGE_LENGTH:
            await self._error('too_long', f'Max {MAX_MESSAGE_LENGTH} characters.', client_id)
            return
        if self._rate_limited():
            await self._error('rate_limited', 'Too many messages, slow down.', client_id)
            return

        # Resolve conversation ID if it's a brand new Direct Message
        if not conversation_id and target_user_id:
            if target_user_id == self.user.id or not await self._is_valid_target(target_user_id):
                await self._error('bad_request', 'Invalid target user.', client_id)
                return
            conversation_id = await self._get_direct_conversation_id(self.user.id, target_user_id)

        if not conversation_id:
            return

        data, created, participants = await self._save_message(text, client_id, conversation_id)

        if created:
            if conversation_id == self.general_id:
                # Broadcast to everyone in General
                await self.channel_layer.group_send(
                    self.general_group,
                    {'type': 'chat.message', 'message': data, 'client_id': client_id}
                )
            else:
                # Broadcast directly to BOTH participants' personal streams for Direct Chat
                for p_id in participants:
                    await self.channel_layer.group_send(
                        f'chat_user_{p_id}',
                        {'type': 'chat.message', 'message': data, 'client_id': client_id}
                    )
        else:
            # Re-send exact same duplicate msg ack
            await self.send_json({'type': 'message', 'message': data, 'client_id': client_id})

    # ------------------------------------------------------------------ outgoing
    async def chat_message(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message'],
            'client_id': event.get('client_id'),
        })

    async def _error(self, code, detail, client_id=None):
        await self.send_json({'type': 'error', 'code': code, 'detail': detail, 'client_id': client_id})

    # ------------------------------------------------------------------ helpers
    def _rate_limited(self):
        now = time.monotonic()
        while self._sent_at and now - self._sent_at[0] > RATE_LIMIT_WINDOW:
            self._sent_at.popleft()
        if len(self._sent_at) >= RATE_LIMIT_MAX:
            return True
        self._sent_at.append(now)
        return False

    # ------------------------------------------------------------------ database
    @database_sync_to_async
    def _is_valid_target(self, target_id):
        target = User.objects.filter(pk=target_id, is_active=True).first()
        if not target:
            return False
        return is_formateur(target)

    @database_sync_to_async
    def _get_general_conversation_id(self):
        conv = Conversation.objects.filter(type='general').order_by('id').first()
        if conv is None:
            try:
                with transaction.atomic():
                    conv = Conversation.objects.create(type='general', title='General Formateurs')
            except IntegrityError:  # another connection created it first
                conv = Conversation.objects.get(type='general')
        return conv.id

    @database_sync_to_async
    def _get_direct_conversation_id(self, user_a, user_b):
        low, high = sorted([int(user_a), int(user_b)])
        key = Conversation.build_direct_key(low, high)

        with transaction.atomic():
            conv = Conversation.objects.filter(direct_key=key).first()
            if conv is None:
                # Self-healing for conversations created before direct_key existed.
                legacy = (
                    Conversation.objects.filter(type='direct', direct_key__isnull=True, participants=low)
                    .filter(participants=high).order_by('id').first()
                )
                if legacy is not None:
                    legacy.direct_key = key
                    legacy.save(update_fields=['direct_key'])
                    return legacy.id

            conv, created = Conversation.objects.get_or_create(direct_key=key, defaults={'type': 'direct'})
            if created:
                conv.participants.add(low, high)
            return conv.id

    @database_sync_to_async
    def _save_message(self, content, client_id, conv_id):
        """Returns (serialized_message, created, participants_list)."""
        if client_id:
            existing = (Message.objects.select_related('sender')
                        .filter(sender=self.user, client_id=client_id).first())
            if existing:
                conv = Conversation.objects.get(pk=conv_id)
                return MessageSerializer(existing).data, False, list(conv.participants.values_list('id', flat=True))

        try:
            with transaction.atomic():
                message = Message.objects.create(
                    conversation_id=conv_id,
                    sender=self.user,
                    content=content,
                    client_id=client_id,
                )
                Conversation.objects.filter(pk=conv_id).update(updated_at=timezone.now())
                conv = Conversation.objects.prefetch_related('participants').get(pk=conv_id)
        except IntegrityError:
            existing = Message.objects.select_related('sender').get(sender=self.user, client_id=client_id)
            conv = Conversation.objects.get(pk=conv_id)
            return MessageSerializer(existing).data, False, list(conv.participants.values_list('id', flat=True))

        message.sender = self.user
        return MessageSerializer(message).data, True, list(conv.participants.values_list('id', flat=True))