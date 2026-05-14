import pytest
from asgiref.sync import async_to_sync
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken

from chat.models import ChatMessage
from chat.routing import websocket_urlpatterns


@pytest.mark.django_db(transaction=True)
def test_chat_consumer_rejects_connection_without_jwt():
    async def scenario():
        application = URLRouter(websocket_urlpatterns)
        communicator = WebsocketCommunicator(application, '/ws/chat/general/')
        connected, _ = await communicator.connect()
        assert connected is False

    async_to_sync(scenario)()


@pytest.mark.django_db(transaction=True)
def test_chat_consumer_broadcasts_and_persists_message(user):
    async def scenario():
        token = str(AccessToken.for_user(user))
        application = URLRouter(websocket_urlpatterns)
        communicator = WebsocketCommunicator(application, f'/ws/chat/general/?token={token}')

        connected, _ = await communicator.connect()
        assert connected is True

        await communicator.send_json_to({'message': 'hello room'})
        response = await communicator.receive_json_from()

        assert response['message'] == 'hello room'
        assert response['author_id'] == user.id
        assert response['room'] == 'general'

        await communicator.disconnect()

    async_to_sync(scenario)()
    saved = ChatMessage.objects.get(room__name='general', author=user)
    assert saved.body == 'hello room'
