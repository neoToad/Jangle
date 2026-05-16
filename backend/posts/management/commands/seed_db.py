import random

from django.core.management.base import BaseCommand
from django.db import transaction

from chat.models import ChatMessage, ChatRoom
from core.factories import (
    ChatMessageFactory,
    CommentFactory,
    GamePostFactory,
    ImagePostFactory,
    REACTION_EMOJIS,
    TextPostFactory,
    UserFactory,
    VoteFactory,
    YouTubePostFactory,
    random_recent_datetime,
)
from interactions.models import Comment, Reaction, Vote
from posts.models import Post
from users.models import User


class Command(BaseCommand):
    help = 'Seed database with realistic development data.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Delete data and reseed.')

    @transaction.atomic
    def handle(self, *args, **options):
        ChatRoom.objects.get_or_create(name='The Jangle', defaults={'post': None})

        if options['reset']:
            self._reset_data()
        elif User.objects.exists() or Post.objects.exists():
            self.stdout.write(self.style.WARNING('Seed skipped: data already exists.'))
            return

        users = UserFactory.create_batch(25)
        posts = []
        for _ in range(20):
            posts.append(TextPostFactory(author=random.choice(users)))
        for _ in range(15):
            posts.append(YouTubePostFactory(author=random.choice(users)))
        for _ in range(10):
            posts.append(ImagePostFactory(author=random.choice(users)))
        for _ in range(5):
            posts.append(GamePostFactory(author=random.choice(users)))

        self._pin_posts_for_subset_of_users(users)
        self._mark_some_removed(posts)
        self._backfill_post_timestamps(posts)

        comments = self._seed_comments(users, posts)
        self._seed_reactions(users, posts, comments)
        self._seed_votes(users, posts)
        self._seed_chat(users, posts)

        self.stdout.write(self.style.SUCCESS('Database seeded.'))

    def _reset_data(self):
        ChatMessage.objects.all().delete()
        ChatRoom.objects.exclude(name='The Jangle').delete()
        Reaction.objects.all().delete()
        Vote.objects.all().delete()
        Comment.objects.all().delete()
        Post.objects.all().delete()
        User.objects.all().delete()

    def _pin_posts_for_subset_of_users(self, users):
        users_with_posts = [u for u in users if Post.objects.filter(author=u).exists()]
        for user in random.sample(users_with_posts, k=min(3, len(users_with_posts))):
            post = Post.objects.filter(author=user).order_by('?').first()
            if post:
                post.is_pinned = True
                post.save(update_fields=['is_pinned'])

    def _mark_some_removed(self, posts):
        for post in random.sample(posts, k=4):
            post.is_removed = True
            post.save(update_fields=['is_removed'])

    def _backfill_post_timestamps(self, posts):
        for post in posts:
            created_at = random_recent_datetime()
            Post.objects.filter(pk=post.pk).update(created_at=created_at, updated_at=created_at)

    def _seed_comments(self, users, posts):
        comments = []
        top_level = []
        for idx in range(80):
            parent = random.choice(top_level) if top_level and idx % 3 == 0 else None
            comment = CommentFactory(
                post=random.choice(posts),
                author=random.choice(users),
                parent=parent,
            )
            comments.append(comment)
            if parent is None:
                top_level.append(comment)

        for comment in random.sample(comments, k=7):
            comment.is_removed = True
            comment.save(update_fields=['is_removed'])

        for comment in comments:
            Comment.objects.filter(pk=comment.pk).update(created_at=random_recent_datetime())
        return comments

    def _seed_reactions(self, users, posts, comments):
        post_pairs = set()
        comment_pairs = set()
        created = 0
        while created < 80:
            user = random.choice(users)
            if random.random() < 0.55:
                post = random.choice(posts)
                key = (user.pk, post.pk)
                if key in post_pairs:
                    continue
                post_pairs.add(key)
                Reaction.objects.create(user=user, post=post, emoji=random.choice(REACTION_EMOJIS))
            else:
                comment = random.choice(comments)
                key = (user.pk, comment.pk)
                if key in comment_pairs:
                    continue
                comment_pairs.add(key)
                Reaction.objects.create(
                    user=user,
                    comment=comment,
                    emoji=random.choice(REACTION_EMOJIS),
                )
            created += 1

        for reaction_id in Reaction.objects.values_list('id', flat=True):
            Reaction.objects.filter(pk=reaction_id).update(created_at=random_recent_datetime())

    def _seed_votes(self, users, posts):
        used_pairs = set()
        created = 0
        while created < 120:
            user = random.choice(users)
            post = random.choice(posts)
            key = (user.pk, post.pk)
            if key in used_pairs:
                continue
            used_pairs.add(key)
            VoteFactory(user=user, post=post)
            created += 1

        for vote_id in Vote.objects.values_list('id', flat=True):
            Vote.objects.filter(pk=vote_id).update(created_at=random_recent_datetime())

    def _seed_chat(self, users, posts):
        global_room, _ = ChatRoom.objects.get_or_create(name='The Jangle', defaults={'post': None})
        post_rooms = []
        for post in random.sample(posts, k=5):
            room, _ = ChatRoom.objects.get_or_create(name=f'Post {post.pk}', defaults={'post': post})
            if room.post_id is None:
                room.post = post
                room.save(update_fields=['post'])
            post_rooms.append(room)

        rooms = [global_room] + post_rooms
        for idx in range(60):
            target_room = global_room if idx % 2 == 0 else random.choice(rooms[1:])
            ChatMessageFactory(room=target_room, author=random.choice(users))

        for message_id in ChatMessage.objects.values_list('id', flat=True):
            ChatMessage.objects.filter(pk=message_id).update(created_at=random_recent_datetime())
