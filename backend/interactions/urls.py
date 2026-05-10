from django.urls import path
from interactions.views import CommentListCreateView, CommentDestroyView

app_name = 'interactions'
urlpatterns = [
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDestroyView.as_view(), name='comment-destroy'),
]