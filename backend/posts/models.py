from django.conf import settings
from django.db import models


class Post(models.Model):
    POST_TYPE_CHOICES = [
        ('text', 'Text'),
        ('youtube', 'YouTube'),
        ('file', 'File'),
    ]
    FILE_TYPE_CHOICES = [
        ('image', 'Image'),
        ('game', 'Game'),
        ('other', 'Other'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
    )
    post_type = models.CharField(max_length=10, choices=POST_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField(null=True, blank=True)
    youtube_url = models.URLField(null=True, blank=True)
    file = models.FileField(upload_to='posts/', null=True, blank=True)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)
    is_removed = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.title