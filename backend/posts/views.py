from rest_framework import viewsets
from django.db.models import Count, Q
from posts.models import Post
from posts.serializers import PostSerializer
from posts.permissions import IsAuthorOrAdminOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthorOrAdminOrReadOnly]

    def get_queryset(self):
        return (
            Post.objects.filter(is_removed=False)
            .annotate(comment_count=Count('comments', filter=Q(comments__is_removed=False)))
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
