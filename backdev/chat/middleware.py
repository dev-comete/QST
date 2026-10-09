from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from .tickets import read_ws_ticket

User = get_user_model()


@database_sync_to_async
def get_active_user(user_id):
    try:
        return User.objects.get(pk=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class TicketAuthMiddleware(BaseMiddleware):
    """ws://host/ws/chat/general/?ticket=<signed ticket>"""

    async def __call__(self, scope, receive, send):
        scope = dict(scope)  # don't mutate the caller's scope
        query = parse_qs(scope.get('query_string', b'').decode('utf-8'))
        ticket = query.get('ticket', [None])[0]

        user = AnonymousUser()
        if ticket:
            user_id = read_ws_ticket(ticket)
            if user_id is not None:
                user = await get_active_user(user_id)

        scope['user'] = user
        return await super().__call__(scope, receive, send)
