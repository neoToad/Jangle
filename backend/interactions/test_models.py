from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from posts.models import Post
from interactions.models import Comment, Reaction, Vote

User = get_user_model()


def make_user(email='user@example.com'):
    return User.objects.create_user(email=email, password='pass')


def make_post(user):
    return Post.objects.create(author=user, post_type='text', title='Test Post')


class CommentModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.post = make_post(self.user)

    def _comment(self, **kwargs):
        defaults = dict(post=self.post, author=self.user, body='Hello')
        defaults.update(kwargs)
        return Comment.objects.create(**defaults)

    def test_create_comment(self):
        comment = self._comment()
        self.assertIsNotNone(comment.pk)

    def test_post_fk(self):
        comment = self._comment()
        self.assertEqual(comment.post, self.post)

    def test_author_fk(self):
        comment = self._comment()
        self.assertEqual(comment.author, self.user)

    def test_parent_nullable_by_default(self):
        comment = self._comment()
        self.assertIsNone(comment.parent)

    def test_threaded_reply(self):
        parent = self._comment()
        reply = self._comment(parent=parent)
        self.assertEqual(reply.parent, parent)

    def test_replies_related_name(self):
        parent = self._comment()
        reply = self._comment(parent=parent)
        self.assertIn(reply, parent.replies.all())

    def test_is_removed_defaults_false(self):
        comment = self._comment()
        self.assertFalse(comment.is_removed)

    def test_created_at_auto_set(self):
        comment = self._comment()
        self.assertIsNotNone(comment.created_at)

    def test_str(self):
        comment = self._comment(body='Test body here')
        self.assertIn('Test body here', str(comment))


class ReactionModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.post = make_post(self.user)
        self.comment = Comment.objects.create(post=self.post, author=self.user, body='c')

    def test_can_react_to_post(self):
        reaction = Reaction.objects.create(user=self.user, post=self.post, emoji='🔥')
        self.assertEqual(reaction.post, self.post)
        self.assertIsNone(reaction.comment)

    def test_can_react_to_comment(self):
        reaction = Reaction.objects.create(user=self.user, comment=self.comment, emoji='👍')
        self.assertEqual(reaction.comment, self.comment)
        self.assertIsNone(reaction.post)

    def test_unique_user_post_reaction(self):
        Reaction.objects.create(user=self.user, post=self.post, emoji='🔥')
        with self.assertRaises(IntegrityError):
            Reaction.objects.create(user=self.user, post=self.post, emoji='👍')

    def test_unique_user_comment_reaction(self):
        Reaction.objects.create(user=self.user, comment=self.comment, emoji='🔥')
        with self.assertRaises(IntegrityError):
            Reaction.objects.create(user=self.user, comment=self.comment, emoji='👍')

    def test_requires_exactly_one_target(self):
        reaction = Reaction(user=self.user, emoji='🔥')
        with self.assertRaises(ValidationError):
            reaction.full_clean()

        reaction = Reaction(user=self.user, post=self.post, comment=self.comment, emoji='🔥')
        with self.assertRaises(ValidationError):
            reaction.full_clean()


class VoteModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.post = make_post(self.user)

    def test_valid_upvote(self):
        vote = Vote.objects.create(user=self.user, post=self.post, value=1)
        self.assertEqual(vote.value, 1)

    def test_valid_downvote(self):
        vote = Vote.objects.create(user=self.user, post=self.post, value=-1)
        self.assertEqual(vote.value, -1)

    def test_unique_user_post_vote(self):
        Vote.objects.create(user=self.user, post=self.post, value=1)
        with self.assertRaises(IntegrityError):
            Vote.objects.create(user=self.user, post=self.post, value=-1)

    def test_invalid_vote_value_rejected(self):
        vote = Vote(user=self.user, post=self.post, value=0)
        with self.assertRaises(ValidationError):
            vote.full_clean()
