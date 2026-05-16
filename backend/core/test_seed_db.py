import random

import pytest
from django.core.management import call_command
from django.utils import timezone

from chat.models import ChatMessage, ChatRoom
from interactions.models import Comment, Reaction, Vote
from posts.models import Post
from users.models import User


@pytest.mark.django_db
def test_seed_db_populates_expected_data_and_shapes(settings):
    call_command('seed_db')

    assert User.objects.count() == 25
    assert Post.objects.filter(post_type='text').count() == 20
    assert Post.objects.filter(post_type='youtube').count() == 15
    assert Post.objects.filter(post_type='file', file_type='image').count() == 10
    assert Post.objects.filter(post_type='file', file_type='game').count() == 5
    assert Comment.objects.count() == 80
    assert ChatMessage.objects.count() == 60

    assert Reaction.objects.exists()
    assert Vote.objects.exists()
    assert Post.objects.filter(is_pinned=True).exists()
    assert Post.objects.filter(is_removed=True).exists()
    assert Comment.objects.filter(is_removed=True).exists()

    # Roughly one-third threaded comments.
    threaded_ratio = Comment.objects.exclude(parent__isnull=True).count() / Comment.objects.count()
    assert 0.2 <= threaded_ratio <= 0.5

    # Vote unique constraint must be respected by the seeded data.
    distinct_vote_pairs = Vote.objects.values('user_id', 'post_id').distinct().count()
    assert distinct_vote_pairs == Vote.objects.count()

    # Global room is always present.
    assert ChatRoom.objects.filter(name='The Jangle').exists()

    # Timestamps are distributed in the last 60 days, not all at now.
    now = timezone.now()
    oldest_post = Post.objects.order_by('created_at').first()
    newest_post = Post.objects.order_by('-created_at').first()
    assert oldest_post is not None and newest_post is not None
    assert oldest_post.created_at >= now - timezone.timedelta(days=60)
    assert newest_post.created_at <= now
    assert oldest_post.created_at < newest_post.created_at


@pytest.mark.django_db
def test_seed_db_is_idempotent_without_reset():
    call_command('seed_db')
    baseline = {
        'users': User.objects.count(),
        'posts': Post.objects.count(),
        'comments': Comment.objects.count(),
        'reactions': Reaction.objects.count(),
        'votes': Vote.objects.count(),
        'messages': ChatMessage.objects.count(),
    }

    call_command('seed_db')

    assert User.objects.count() == baseline['users']
    assert Post.objects.count() == baseline['posts']
    assert Comment.objects.count() == baseline['comments']
    assert Reaction.objects.count() == baseline['reactions']
    assert Vote.objects.count() == baseline['votes']
    assert ChatMessage.objects.count() == baseline['messages']


@pytest.mark.django_db
def test_seed_db_reset_reseeds_data():
    call_command('seed_db')
    post = Post.objects.order_by('id').first()
    assert post is not None
    post.title = 'SENTINEL TITLE'
    post.save(update_fields=['title'])

    call_command('seed_db', '--reset')

    assert User.objects.count() == 25
    assert Post.objects.count() == 50
    assert not Post.objects.filter(title='SENTINEL TITLE').exists()


@pytest.mark.django_db
def test_seed_db_creates_global_room_even_if_user_data_exists_and_seed_is_skipped():
    User.objects.create_user(email='existing@example.com', password='pass1234')

    call_command('seed_db')

    assert ChatRoom.objects.filter(name='The Jangle').exists()
