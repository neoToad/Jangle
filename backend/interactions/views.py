from rest_framework import generics, permissions, status
from rest_framework.response import Response
from interactions.models import Comment
from interactions.serializers import CommentSerializer
from interactions.permissions import IsAuthorOrAdmin


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Comment.objects.filter(
            post_id=self.kwargs['post_id'], parent=None, is_removed=False
        ).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, post_id=self.kwargs['post_id'])


class CommentDestroyView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrAdmin]

    def perform_destroy(self, instance):
        instance.is_removed = True
        instance.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)