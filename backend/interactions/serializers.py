from rest_framework import serializers
from interactions.models import Comment


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'parent', 'body', 'created_at', 'replies']
        read_only_fields = ['id', 'post', 'author', 'created_at']

    def get_replies(self, obj):
        qs = obj.replies.filter(is_removed=False)
        return CommentSerializer(qs, many=True).data