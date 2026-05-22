import pytest

from chat.models import ChatMessage, ChatRoom
from chat.serializers import ChatMessageSerializer


@pytest.mark.django_db
def test_chat_message_serializer_rejects_blank_body(user):
    room = ChatRoom.objects.create(name='the-jangle')
    serializer = ChatMessageSerializer(
        data={'body': '   '},
        context={'room': room, 'request_user': user},
    )

    assert serializer.is_valid() is False
    assert 'body' in serializer.errors


@pytest.mark.django_db
def test_chat_message_serializer_includes_expected_payload_shape(user):
    room = ChatRoom.objects.create(name='the-jangle')
    message = ChatMessage.objects.create(room=room, author=user, body='Hello world')

    data = ChatMessageSerializer(message).data

    assert set(data.keys()) == {'id', 'room', 'author', 'author_email', 'body', 'created_at'}
    assert data['room'] == room.name
    assert data['author'] == user.id
    assert data['author_email'] == user.email
    assert data['body'] == 'Hello world'
