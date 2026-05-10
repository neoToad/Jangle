from django.conf import settings
from django.db import models
from posts.models import Post


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments'
    )
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies'
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_removed = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.body[:50]