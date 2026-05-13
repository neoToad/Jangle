from rest_framework import serializers
from posts.models import Post
from django.db.models import Sum


class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    reaction_counts = serializers.SerializerMethodField()
    vote_score = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'post_type', 'title', 'body',
            'youtube_url', 'file', 'file_type',
            'created_at', 'updated_at', 'is_pinned',
            'reaction_counts', 'vote_score',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_reaction_counts(self, obj):
        counts = {}
        for reaction in obj.reactions.all():
            counts[reaction.emoji] = counts.get(reaction.emoji, 0) + 1
        return counts

    def get_vote_score(self, obj):
        return obj.votes.aggregate(total=Sum('value'))['total'] or 0
