import os
from django.core.asgi import get_asgi_application

# 1. Set the Django settings module first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backdev.settings')

# 2. Initialize Django setup before importing any models or routing
django_asgi_app = get_asgi_application()

# 3. Now it is safe to import Channels and your chat routing
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chat.middleware import JWTAuthMiddleware
import chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})