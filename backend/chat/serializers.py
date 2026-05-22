from rest_framework import serializers

from chat.models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    room = serializers.CharField(source='room.name', read_only=True)
    author = serializers.IntegerField(source='author.id', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'room', 'author', 'author_email', 'body', 'created_at']
        read_only_fields = ['id', 'room', 'author', 'author_email', 'created_at']

    def validate_body(self, value):
        body = value.strip()
        if not body:
            raise serializers.ValidationError('Message body cannot be blank.')
        return body
