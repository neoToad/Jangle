import pytest
from asgiref.sync import async_to_sync
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken

from chat.models import ChatMessage
from chat.routing import websocket_urlpatterns


@pytest.mark.django_db(transaction=True)
def test_chat_consumer_allows_guest_connection_but_cannot_send_messages():
    async def scenario():
        application = URLRouter(websocket_urlpatterns)
        communicator = WebsocketCommunicator(application, '/ws/chat/the-jangle/')
        connected, _ = await communicator.connect()
        assert connected is True

        await communicator.send_json_to({'body': 'guest post'})

        await communicator.disconnect()

    async_to_sync(scenario)()
    assert ChatMessage.objects.count() == 0


@pytest.mark.django_db(transaction=True)
def test_chat_consumer_broadcasts_and_persists_message_for_authenticated_user(user):
    async def scenario():
        token = str(AccessToken.for_user(user))
        application = URLRouter(websocket_urlpatterns)
        communicator = WebsocketCommunicator(application, f'/ws/chat/the-jangle/?token={token}')

        connected, _ = await communicator.connect()
        assert connected is True

        await communicator.send_json_to({'body': 'hello room'})
        response = await communicator.receive_json_from()

        assert set(response.keys()) == {'id', 'room', 'author', 'author_email', 'body', 'created_at'}
        assert response['body'] == 'hello room'
        assert response['author'] == user.id
        assert response['author_email'] == user.email
        assert response['room'] == 'the-jangle'

        await communicator.disconnect()

    async_to_sync(scenario)()
    saved = ChatMessage.objects.get(room__name='the-jangle', author=user)
    assert saved.body == 'hello room'


@pytest.mark.django_db(transaction=True)
def test_chat_consumer_ignores_malformed_payload(user):
    async def scenario():
        token = str(AccessToken.for_user(user))
        application = URLRouter(websocket_urlpatterns)
        communicator = WebsocketCommunicator(application, f'/ws/chat/the-jangle/?token={token}')

        connected, _ = await communicator.connect()
        assert connected is True

        await communicator.send_to(text_data='{"not_json"')
        await communicator.send_json_to({'body': ''})
        await communicator.send_json_to({'message': 'legacy key'})

        await communicator.disconnect()

    async_to_sync(scenario)()
    assert ChatMessage.objects.count() == 0
