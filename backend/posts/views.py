from rest_framework import viewsets
from django.db.models import Count, Q, F, IntegerField, ExpressionWrapper
from rest_framework.exceptions import ValidationError
from posts.models import Post
from posts.serializers import PostSerializer
from posts.permissions import IsAuthorOrAdminOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthorOrAdminOrReadOnly]

    def get_queryset(self):
        feed_mode = (self.request.query_params.get('feed') or 'explore').lower()
        base_queryset = (
            Post.objects.filter(is_removed=False)
            .annotate(comment_count=Count('comments', filter=Q(comments__is_removed=False)))
        )
        if feed_mode == 'explore':
            return (
                base_queryset
                .annotate(
                    reaction_count=Count('reactions', distinct=True),
                    vote_count=Count('votes', distinct=True),
                    active_comment_count=Count(
                        'comments', filter=Q(comments__is_removed=False), distinct=True
                    ),
                )
                .annotate(
                    engagement_score=ExpressionWrapper(
                        F('reaction_count') + F('vote_count') + F('active_comment_count'),
                        output_field=IntegerField(),
                    )
                )
                .order_by('-engagement_score', '-created_at', '-id')
            )
        if feed_mode == 'games':
            return base_queryset.filter(post_type='file', file_type='game').order_by('-created_at', '-id')
        if feed_mode == 'following':
            user = self.request.user
            if not user.is_authenticated:
                return base_queryset.none()
            return base_queryset.filter(author__in=user.following.all()).order_by('-created_at', '-id')
        raise ValidationError({'feed': 'Invalid feed mode. Use following, explore, or games.'})

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
