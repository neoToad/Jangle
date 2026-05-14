import pytest

from chat.models import ChatMessage, ChatRoom
from posts.models import Post


@pytest.mark.django_db
def test_chat_room_can_be_created_without_post(user):
    room = ChatRoom.objects.create(name='general')

    assert room.name == 'general'
    assert room.post is None
    assert room.created_at is not None


@pytest.mark.django_db
def test_chat_room_can_reference_post(user):
    post = Post.objects.create(
        author=user,
        post_type='text',
        title='Post for room',
        body='Hello',
    )

    room = ChatRoom.objects.create(name='post-room', post=post)

    assert room.post == post


@pytest.mark.django_db
def test_chat_message_links_room_author_and_body(user):
    room = ChatRoom.objects.create(name='general')

    message = ChatMessage.objects.create(room=room, author=user, body='hi there')

    assert message.room == room
    assert message.author == user
    assert message.body == 'hi there'
    assert message.created_at is not None
