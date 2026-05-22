from rest_framework import serializers
from interactions.models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.public_username', read_only=True)
    replies = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField()
    vote_score = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'author',
            'author_username',
            'parent',
            'body',
            'created_at',
            'replies',
            'reaction_counts',
            'vote_score',
        ]
        read_only_fields = ['id', 'post', 'author', 'created_at']

    def get_replies(self, obj):
        qs = (
            obj.replies.filter(is_removed=False, post=obj.post)
            .select_related('author')
            .order_by('created_at', 'id')
        )
        return CommentSerializer(qs, many=True).data

    def validate_parent(self, parent):
        if parent is None:
            return parent
        post_id = self.context.get('view').kwargs.get('post_id') if self.context.get('view') else None
        if post_id is not None and parent.post_id != int(post_id):
            raise serializers.ValidationError('Parent comment must belong to the same post.')
        return parent

    def get_reaction_counts(self, obj):
        counts = {}
        for reaction in obj.reactions.all():
            counts[reaction.emoji] = counts.get(reaction.emoji, 0) + 1
        return counts

    def get_vote_score(self, obj):
        return 0


class ReactionSerializer(serializers.Serializer):
    emoji = serializers.CharField(max_length=32)


class VoteSerializer(serializers.Serializer):
    value = serializers.IntegerField(min_value=-1, max_value=1)

    def validate_value(self, value):
        if value not in (-1, 1):
            raise serializers.ValidationError('Vote value must be 1 or -1.')
        return value
