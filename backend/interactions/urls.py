from django.urls import path
from interactions.views import (
    CommentListCreateView,
    CommentDestroyView,
    PostReactionView,
    CommentReactionView,
    PostVoteView,
)

app_name = 'interactions'
urlpatterns = [
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDestroyView.as_view(), name='comment-destroy'),
    path('posts/<int:post_id>/reactions/', PostReactionView.as_view(), name='post-reaction'),
    path('comments/<int:comment_id>/reactions/', CommentReactionView.as_view(), name='comment-reaction'),
    path('posts/<int:post_id>/votes/', PostVoteView.as_view(), name='post-vote'),
]
