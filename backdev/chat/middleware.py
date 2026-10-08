import jwt
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        # Validate the token using SimpleJWT
        UntypedToken(token)
        
        # Decode the payload to get the user ID
        decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return User.objects.get(id=decoded_data['user_id'])
        
    except (InvalidToken, TokenError, User.DoesNotExist, jwt.DecodeError):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse the query string: ws://domain.com/ws/chat/?token=abc
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)