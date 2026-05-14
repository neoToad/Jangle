import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from chat.models import ChatMessage, ChatRoom
from users.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = await self._authenticate_user()
        if user is None:
            await self.close()
            return

        self.user = user
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.room = await self._get_or_create_room(self.room_name)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        if not message:
            return

        saved_message = await self._create_message(message)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': saved_message.body,
                'author_id': self.user.id,
                'room': self.room_name,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    'message': event['message'],
                    'author_id': event['author_id'],
                    'room': event['room'],
                }
            )
        )

    async def _authenticate_user(self):
        query_string = self.scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        if not token:
            return None

        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
        except (TokenError, KeyError):
            return None

        return await self._get_user(user_id)

    @database_sync_to_async
    def _get_or_create_room(self, room_name):
        room, _ = ChatRoom.objects.get_or_create(name=room_name)
        return room

    @database_sync_to_async
    def _create_message(self, message):
        return ChatMessage.objects.create(room=self.room, author=self.user, body=message)

    @database_sync_to_async
    def _get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
