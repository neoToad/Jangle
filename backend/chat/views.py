from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework import generics
from rest_framework.exceptions import Throttled

from chat.models import ChatMessage, ChatRoom
from chat.rate_limits import consume_chat_message_token
from chat.serializers import ChatMessageSerializer


class IsAuthenticatedForWriteOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class RoomMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticatedForWriteOnly]

    def get_room(self):
        return get_object_or_404(ChatRoom, name=self.kwargs['slug'])

    def get_queryset(self):
        return ChatMessage.objects.filter(room=self.get_room()).select_related('author', 'room')

    def perform_create(self, serializer):
        if not consume_chat_message_token(self.request.user.id):
            raise Throttled(detail='Rate limit exceeded for chat messages.')
        serializer.save(room=self.get_room(), author=self.request.user)
