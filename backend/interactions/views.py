from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from posts.models import Post
from interactions.models import Comment, Reaction, Vote
from interactions.serializers import CommentSerializer, ReactionSerializer, VoteSerializer
from interactions.permissions import IsAuthorOrAdmin


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return (
            Comment.objects.filter(
                post_id=self.kwargs['post_id'], parent=None, is_removed=False
            )
            .select_related('author')
            .order_by('created_at', 'id')
        )

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


class PostReactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        serializer = ReactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = get_object_or_404(Post, pk=post_id, is_removed=False)
        reaction, created = Reaction.objects.update_or_create(
            user=request.user, post=post, defaults={'emoji': serializer.validated_data['emoji']}
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({'id': reaction.pk, 'emoji': reaction.emoji}, status=status_code)

    def delete(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, is_removed=False)
        Reaction.objects.filter(user=request.user, post=post).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentReactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_id):
        serializer = ReactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = get_object_or_404(Comment, pk=comment_id, is_removed=False)
        reaction, created = Reaction.objects.update_or_create(
            user=request.user,
            comment=comment,
            defaults={'emoji': serializer.validated_data['emoji']},
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({'id': reaction.pk, 'emoji': reaction.emoji}, status=status_code)

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id, is_removed=False)
        Reaction.objects.filter(user=request.user, comment=comment).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        serializer = VoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = get_object_or_404(Post, pk=post_id, is_removed=False)
        vote, created = Vote.objects.update_or_create(
            user=request.user, post=post, defaults={'value': serializer.validated_data['value']}
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({'id': vote.pk, 'value': vote.value}, status=status_code)

    def delete(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, is_removed=False)
        Vote.objects.filter(user=request.user, post=post).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
