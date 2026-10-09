"""
Short-lived WebSocket tickets.

Browsers can't set an Authorization header on a WebSocket, so instead of
putting the long-lived JWT in the URL (it ends up in proxy / access logs) the
client calls POST /chat/ws-ticket/ (normal JWT auth) and connects with the
returned ticket, which is valid for 30 seconds.

The ticket is a signed, stateless value (no Redis/DB needed, works across
several Daphne processes as long as they share SECRET_KEY). It is not strictly
single-use, but a leaked URL is useless after 30s.
"""
from django.core import signing

WS_TICKET_SALT = 'chat.ws-ticket'
WS_TICKET_MAX_AGE = 30  # seconds


def make_ws_ticket(user) -> str:
    return signing.dumps({'uid': user.pk}, salt=WS_TICKET_SALT)


def read_ws_ticket(ticket: str):
    """Returns the user id or None if the ticket is invalid/expired."""
    try:
        data = signing.loads(ticket, salt=WS_TICKET_SALT, max_age=WS_TICKET_MAX_AGE)
        return data['uid']
    except (signing.BadSignature, KeyError, TypeError):
        return None
