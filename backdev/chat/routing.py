from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # ws://localhost:8001/ws/chat/general/
    re_path(r'^ws/chat/(?P<chat_type>general)/$', consumers.ChatConsumer.as_asgi()),
    # ws://localhost:8001/ws/chat/direct/5/   (5 = id of the other formateur)
    re_path(r'^ws/chat/(?P<chat_type>direct)/(?P<user_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
