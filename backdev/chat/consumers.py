import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # Reject unauthenticated connections
        if not self.user.is_authenticated:
            await self.close()
            return

        self.chat_type = self.scope['url_route']['kwargs'].get('chat_type')
        
        # 1. Handle General Formateur Room
        if self.chat_type == 'general':
            self.room_group_name = 'chat_general_formateurs'
            self.conversation = await self.get_or_create_general_conversation()
        
        # 2. Handle 1-on-1 Direct Messaging
        elif self.chat_type == 'direct':
            target_user_id = self.scope['url_route']['kwargs'].get('user_id')
            self.room_group_name = self.get_direct_room_name(self.user.id, target_user_id)
            self.conversation = await self.get_or_create_direct_conversation(self.user.id, target_user_id)
        
        else:
            await self.close()
            return

        # Join the Redis channel group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get('message')

        if message_content:
            # Save to PostgreSQL
            message = await self.save_message(self.conversation.id, self.user.id, message_content)
            
            # Broadcast via Redis to all connected users in this room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message.content,
                    'sender_id': self.user.id,
                    'sender_email': self.user.email,
                    'created_at': message.created_at.strftime('%Y-%m-%d %H:%M:%S')
                }
            )

    async def chat_message(self, event):
        # Send the broadcasted message down to the frontend client
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_email': event['sender_email'],
            'created_at': event['created_at']
        }))

    # --- Database Operations Bridge ---
    
    @database_sync_to_async
    def get_or_create_general_conversation(self):
        conv, _ = Conversation.objects.get_or_create(
            type='general', 
            defaults={'title': 'General Formateurs'}
        )
        return conv

    @database_sync_to_async
    def get_or_create_direct_conversation(self, user1_id, user2_id):
        # Sorting IDs ensures user 1 connecting to user 2 generates the exact same 
        # conversation as user 2 connecting to user 1.
        id_1, id_2 = sorted([int(user1_id), int(user2_id)])
        
        # Find an existing direct conversation between exactly these two users
        convs = Conversation.objects.filter(type='direct', participants=id_1).filter(participants=id_2)
        
        if convs.exists():
            return convs.first()
        
        # If none exists, create it
        conv = Conversation.objects.create(type='direct')
        conv.participants.add(id_1, id_2)
        return conv

    def get_direct_room_name(self, user1_id, user2_id):
        id_1, id_2 = sorted([int(user1_id), int(user2_id)])
        return f"chat_direct_{id_1}_{id_2}"

    @database_sync_to_async
    def save_message(self, conversation_id, sender_id, content):
        return Message.objects.create(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content
        )