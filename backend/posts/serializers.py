from rest_framework import serializers
from posts.models import Post


class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'post_type', 'title', 'body',
            'youtube_url', 'file', 'file_type',
            'created_at', 'updated_at', 'is_pinned',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']