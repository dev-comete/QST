from django.db.models import (BigIntegerField, Count, IntegerField, OuterRef,
                              Prefetch, Q, Subquery, Value)
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, ConversationRead, Message
from .permissions import IsFormateur
from .serializers import ConversationSerializer, MessageSerializer
from .tickets import WS_TICKET_MAX_AGE, make_ws_ticket

DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200


def _int_param(request, name):
    raw = request.query_params.get(name)
    if raw in (None, ''):
        return None
    try:
        value = int(raw)
    except ValueError:
        raise ValidationError({name: 'Must be an integer.'})
    if value < 0:
        raise ValidationError({name: 'Must be >= 0.'})
    return value


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Conversation.objects.none()
    permission_classes = [IsFormateur]
    serializer_class = ConversationSerializer
    pagination_class = None  # the frontend expects a plain array

    def get_queryset(self):
        user = self.request.user

        # Conversations I take part in + the general room. No JOIN, so no
        # duplicates and no .distinct() needed.
        base = Conversation.objects.filter(
            Q(pk__in=user.conversations.values('pk')) | Q(type='general')
        )
        if self.action != 'list':
            return base

        # Latest message of each conversation, fetched in a single query.
        latest_id = (
            Message.objects.filter(conversation=OuterRef('conversation'))
            .order_by('-id').values('id')[:1]
        )
        latest_messages = Message.objects.filter(id=Subquery(latest_id)).select_related('sender')

        # Unread = messages from others newer than my read marker.
        my_marker = (
            ConversationRead.objects.filter(conversation=OuterRef('conversation'), user=user)
            .values('last_read_id')[:1]
        )
        unread = (
            Message.objects.filter(
                conversation=OuterRef('pk'),
                id__gt=Coalesce(Subquery(my_marker, output_field=BigIntegerField()), Value(0)),
            )
            .exclude(sender=user)
            .order_by()
            .values('conversation')
            .annotate(c=Count('pk'))
            .values('c')
        )

        return (
            base.prefetch_related(
                'participants',
                Prefetch('messages', queryset=latest_messages, to_attr='latest_message_list'),
            )
            .annotate(unread_count=Coalesce(Subquery(unread, output_field=IntegerField()), Value(0)))
            .order_by('-updated_at')
        )

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        GET /chat/conversations/{id}/messages/
            ?limit=50          page size (max 200)
            ?before_id=123     older messages  (scroll-back)
            ?after_id=123      newer messages  (catch-up after a reconnect)
        Always returns oldest -> newest:  {"results": [...], "has_more": bool}
        """
        conversation = self.get_object()
        limit = min(_int_param(request, 'limit') or DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
        before_id = _int_param(request, 'before_id')
        after_id = _int_param(request, 'after_id')

        qs = conversation.messages.select_related('sender')

        if after_id is not None:
            items = list(qs.filter(id__gt=after_id).order_by('id')[: limit + 1])
            has_more = len(items) > limit
            items = items[:limit]
        else:
            if before_id is not None:
                qs = qs.filter(id__lt=before_id)
            items = list(qs.order_by('-id')[: limit + 1])
            has_more = len(items) > limit
            items = items[:limit][::-1]

        return Response({'results': MessageSerializer(items, many=True).data, 'has_more': has_more})

    @action(detail=True, methods=['post'], url_path='read')
    def mark_read(self, request, pk=None):
        """POST /chat/conversations/{id}/read/   body: {"last_id": 123} (optional)"""
        conversation = self.get_object()
        latest = conversation.messages.order_by('-id').values_list('id', flat=True).first() or 0

        raw = request.data.get('last_id')
        try:
            target = int(raw) if raw is not None else latest
        except (TypeError, ValueError):
            raise ValidationError({'last_id': 'Must be an integer.'})
        target = max(0, min(target, latest))

        ConversationRead.objects.get_or_create(conversation=conversation, user=request.user)
        ConversationRead.objects.filter(
            conversation=conversation, user=request.user, last_read_id__lt=target
        ).update(last_read_id=target)
        return Response({'last_read_id': target})


class WsTicketView(APIView):
    """POST /chat/ws-ticket/  ->  {"ticket": "...", "expires_in": 30}"""

    permission_classes = [IsFormateur]

    def post(self, request):
        return Response({'ticket': make_ws_ticket(request.user), 'expires_in': WS_TICKET_MAX_AGE})
