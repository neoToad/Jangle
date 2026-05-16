import random
from datetime import timedelta

import factory
from django.core.files.base import ContentFile
from django.utils import timezone
from factory.django import DjangoModelFactory

from chat.models import ChatMessage, ChatRoom
from interactions.models import Comment, Reaction, Vote
from posts.models import Post
from users.models import User

YOUTUBE_VIDEO_IDS = [
    'dQw4w9WgXcQ',
    '9bZkp7q19f0',
    '3JZ_D3ELwOQ',
    'fJ9rUzIMcZQ',
    'kJQP7kiw5Fk',
    'Zi_XLOBDo_Y',
    'YQHsXMglC9A',
    'RgKAFK5djSk',
    'hT_nvWreIhg',
    'L_jWHffIx5E',
]
REACTION_EMOJIS = ['😀', '🔥', '👏', '🎉', '❤️', '🙌', '✨']


def random_recent_datetime() -> timezone.datetime:
    now = timezone.now()
    days = random.randint(0, 59)
    seconds = random.randint(0, 24 * 60 * 60 - 1)
    return now - timedelta(days=days, seconds=seconds)


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('user_name')
    last_name = factory.Faker('last_name')
    bio = factory.Faker('paragraph', nb_sentences=3)


class TextPostFactory(DjangoModelFactory):
    class Meta:
        model = Post

    author = factory.SubFactory(UserFactory)
    post_type = 'text'
    title = factory.Faker('sentence', nb_words=6)
    body = factory.Faker('paragraph', nb_sentences=6)


class YouTubePostFactory(DjangoModelFactory):
    class Meta:
        model = Post

    author = factory.SubFactory(UserFactory)
    post_type = 'youtube'
    title = factory.Faker('sentence', nb_words=5)
    body = factory.Faker('paragraph', nb_sentences=2)
    youtube_url = factory.LazyFunction(
        lambda: f'https://www.youtube.com/watch?v={random.choice(YOUTUBE_VIDEO_IDS)}'
    )


class ImagePostFactory(DjangoModelFactory):
    class Meta:
        model = Post
        skip_postgeneration_save = True

    author = factory.SubFactory(UserFactory)
    post_type = 'file'
    file_type = 'image'
    title = factory.Faker('sentence', nb_words=4)
    body = factory.Faker('sentence', nb_words=8)

    @factory.post_generation
    def file(self, create, extracted, **kwargs):  # type: ignore[no-untyped-def]
        if not create:
            return
        payload = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc`\x00\x00\x00'
            b'\x02\x00\x01\xe2!\xbc3\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        self.file.save(f'image-post-{self.pk}.png', ContentFile(payload), save=True)


class GamePostFactory(DjangoModelFactory):
    class Meta:
        model = Post
        skip_postgeneration_save = True

    author = factory.SubFactory(UserFactory)
    post_type = 'file'
    file_type = 'game'
    title = factory.Faker('sentence', nb_words=4)
    body = factory.Faker('sentence', nb_words=10)

    @factory.post_generation
    def file(self, create, extracted, **kwargs):  # type: ignore[no-untyped-def]
        if not create:
            return
        html = (
            '<!doctype html><html><head><meta charset="utf-8"><title>Mini Game</title></head>'
            '<body><h1>Jangle Mini Game</h1><p>Use arrow keys to move.</p></body></html>'
        )
        self.file.save(f'game-post-{self.pk}.html', ContentFile(html.encode('utf-8')), save=True)


class CommentFactory(DjangoModelFactory):
    class Meta:
        model = Comment

    post = factory.SubFactory(TextPostFactory)
    author = factory.SubFactory(UserFactory)
    body = factory.Faker('paragraph', nb_sentences=2)
    parent = None


class ReactionFactory(DjangoModelFactory):
    class Meta:
        model = Reaction

    user = factory.SubFactory(UserFactory)
    emoji = factory.LazyFunction(lambda: random.choice(REACTION_EMOJIS))
    post = factory.SubFactory(TextPostFactory)
    comment = None


class VoteFactory(DjangoModelFactory):
    class Meta:
        model = Vote

    user = factory.SubFactory(UserFactory)
    post = factory.SubFactory(TextPostFactory)
    value = factory.LazyFunction(lambda: random.choice([-1, 1]))


class ChatRoomFactory(DjangoModelFactory):
    class Meta:
        model = ChatRoom

    name = factory.Sequence(lambda n: f'Room {n}')
    post = None


class ChatMessageFactory(DjangoModelFactory):
    class Meta:
        model = ChatMessage

    room = factory.SubFactory(ChatRoomFactory)
    author = factory.SubFactory(UserFactory)
    body = factory.Faker('sentence', nb_words=12)
