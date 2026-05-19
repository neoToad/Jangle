from typing import Any, ClassVar

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager['User']):
    def create_user(self, email: str, password: str | None = None, **extra_fields: Any) -> 'User':
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra_fields: Any) -> 'User':
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # type: ignore[assignment]
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        through='Follow',
        through_fields=('follower', 'following'),
        blank=True,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: ClassVar[list[str]] = []

    objects: ClassVar[UserManager] = UserManager()  # type: ignore[assignment]

    @property
    def public_username(self) -> str:
        return self.email.split('@', 1)[0].lower()

    @property
    def display_name(self) -> str:
        full = f'{self.first_name} {self.last_name}'.strip()
        return full or self.public_username


class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='followed_edges', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='follower_edges', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_follow_relationship'),
            models.CheckConstraint(condition=~models.Q(follower=models.F('following')), name='no_self_follow'),
        ]
