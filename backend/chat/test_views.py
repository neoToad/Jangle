import pytest
from django.urls import reverse

from chat.models import ChatMessage, ChatRoom


@pytest.mark.django_db
def test_list_room_messages_returns_paginated_history_for_guests(api_client, user):
    room = ChatRoom.objects.create(name='the-jangle')
    ChatMessage.objects.create(room=room, author=user, body='hello')

    url = reverse('chat:room-messages', kwargs={'slug': room.name})
    response = api_client.get(url)

    assert response.status_code == 200
    assert 'results' in response.data
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['body'] == 'hello'


@pytest.mark.django_db
def test_post_room_message_requires_auth(api_client, user):
    room = ChatRoom.objects.create(name='the-jangle')
    url = reverse('chat:room-messages', kwargs={'slug': room.name})

    response = api_client.post(url, {'body': 'nope'}, format='json')

    assert response.status_code == 401


@pytest.mark.django_db
def test_post_room_message_creates_message_for_authenticated_user(auth_client, user):
    room = ChatRoom.objects.create(name='the-jangle')
    url = reverse('chat:room-messages', kwargs={'slug': room.name})

    response = auth_client.post(url, {'body': 'persist me'}, format='json')

    assert response.status_code == 201
    saved = ChatMessage.objects.get(room=room, author=user)
    assert saved.body == 'persist me'
    assert response.data['body'] == 'persist me'


@pytest.mark.django_db
def test_room_messages_endpoint_404_for_unknown_room(api_client):
    url = reverse('chat:room-messages', kwargs={'slug': 'missing-room'})

    response = api_client.get(url)

    assert response.status_code == 404
