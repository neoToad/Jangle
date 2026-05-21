from rest_framework import serializers
from posts.models import Post
from django.db.models import Sum
from urllib.parse import urlparse


class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    reaction_counts = serializers.SerializerMethodField()
    vote_score = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'post_type', 'title', 'body',
            'youtube_url', 'file', 'file_type',
            'created_at', 'updated_at', 'is_pinned',
            'reaction_counts', 'vote_score', 'comment_count',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_reaction_counts(self, obj):
        counts = {}
        for reaction in obj.reactions.all():
            counts[reaction.emoji] = counts.get(reaction.emoji, 0) + 1
        return counts

    def get_vote_score(self, obj):
        return obj.votes.aggregate(total=Sum('value'))['total'] or 0

    def get_comment_count(self, obj):
        # Prefer queryset annotation for list/detail performance; fallback for direct serializer use.
        annotated_value = getattr(obj, 'comment_count', None)
        if annotated_value is not None:
            return annotated_value
        return obj.comments.filter(is_removed=False).count()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        post_type = attrs.get('post_type', getattr(self.instance, 'post_type', None))
        youtube_url = attrs.get('youtube_url', getattr(self.instance, 'youtube_url', None))
        file_type = attrs.get('file_type', getattr(self.instance, 'file_type', None))
        file_value = attrs.get('file', getattr(self.instance, 'file', None))

        if post_type == 'youtube':
            if not youtube_url:
                raise serializers.ValidationError({'youtube_url': 'This field is required for YouTube posts.'})
            host = (urlparse(str(youtube_url)).hostname or '').lower()
            allowed_hosts = {'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'}
            if host not in allowed_hosts:
                raise serializers.ValidationError({'youtube_url': 'Enter a valid YouTube URL.'})

        if post_type == 'file' and file_type == 'game' and not file_value:
            raise serializers.ValidationError({'file': 'This field is required for game file posts.'})

        return attrs
