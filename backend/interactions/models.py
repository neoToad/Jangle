from django.conf import settings
from django.core.exceptions import ValidationError
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


class Reaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reactions'
    )
    emoji = models.CharField(max_length=32)
    post = models.ForeignKey(
        Post, null=True, blank=True, on_delete=models.CASCADE, related_name='reactions'
    )
    comment = models.ForeignKey(
        Comment,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reactions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                condition=models.Q(post__isnull=False),
                name='unique_reaction_user_post',
            ),
            models.UniqueConstraint(
                fields=['user', 'comment'],
                condition=models.Q(comment__isnull=False),
                name='unique_reaction_user_comment',
            ),
            models.CheckConstraint(
                condition=(
                    (models.Q(post__isnull=False) & models.Q(comment__isnull=True))
                    | (models.Q(post__isnull=True) & models.Q(comment__isnull=False))
                ),
                name='reaction_exactly_one_target',
            ),
        ]

    def clean(self):
        super().clean()
        has_post = self.post_id is not None
        has_comment = self.comment_id is not None
        if has_post == has_comment:
            raise ValidationError('Reaction must target exactly one of post or comment.')


class Vote(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='votes'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='votes')
    value = models.SmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_vote_user_post'),
            models.CheckConstraint(
                condition=models.Q(value__in=[-1, 1]), name='vote_value_must_be_plus_minus_1'
            ),
        ]

    def clean(self):
        super().clean()
        if self.value not in (-1, 1):
            raise ValidationError({'value': 'Vote value must be 1 or -1.'})
