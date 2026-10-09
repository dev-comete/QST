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
        self.conversation_id = None
        self.room_group_name = None
        self._sent_at = deque()

        # Accept FIRST, then close with a custom code. Closing before accept
        # makes browsers see a generic 1006 and they can't tell "server down"
        # from "not allowed".
        await self.accept()

        if not self.user.is_authenticated:
            await self.close(code=CloseCode.UNAUTHENTICATED)
            return
        if not await database_sync_to_async(is_formateur)(self.user):
            await self.close(code=CloseCode.FORBIDDEN)
            return

        kwargs = self.scope['url_route']['kwargs']
        chat_type = kwargs.get('chat_type')

        if chat_type == 'general':
            self.conversation_id = await self._get_general_conversation_id()
        elif chat_type == 'direct':
            target_id = int(kwargs['user_id'])
            if target_id == self.user.id:
                await self.close(code=CloseCode.BAD_REQUEST)
                return
            if not await self._is_valid_target(target_id):
                await self.close(code=CloseCode.NOT_FOUND)
                return
            self.conversation_id = await self._get_direct_conversation_id(self.user.id, target_id)
        else:
            await self.close(code=CloseCode.BAD_REQUEST)
            return

        self.room_group_name = f'chat_conversation_{self.conversation_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # Tell the client which conversation this socket is bound to (a first
        # DM is created server-side, the client can't know its id otherwise).
        await self.send_json({'type': 'ready', 'conversation_id': self.conversation_id})

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # ------------------------------------------------------------------ incoming
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if not text_data or self.conversation_id is None:
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

        data, created = await self._save_message(text, client_id)

        if created:
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'chat.message', 'message': data, 'client_id': client_id},
            )
        else:
            # Duplicate re-send (e.g. after a reconnect): it was already
            # broadcast the first time, just acknowledge it to the sender.
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
        return target is not None and is_formateur(target)

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
    def _save_message(self, content, client_id):
        """Returns (serialized_message, created). Idempotent on (sender, client_id)."""
        if client_id:
            existing = (Message.objects.select_related('sender')
                        .filter(sender=self.user, client_id=client_id).first())
            if existing:
                return MessageSerializer(existing).data, False

        try:
            with transaction.atomic():
                message = Message.objects.create(
                    conversation_id=self.conversation_id,
                    sender=self.user,
                    content=content,
                    client_id=client_id,
                )
                # .update() bypasses auto_now, so set the timestamp explicitly.
                Conversation.objects.filter(pk=self.conversation_id).update(updated_at=timezone.now())
        except IntegrityError:  # two identical client_ids raced
            existing = Message.objects.select_related('sender').get(sender=self.user, client_id=client_id)
            return MessageSerializer(existing).data, False

        message.sender = self.user  # avoid an extra query in the serializer
        return MessageSerializer(message).data, True
