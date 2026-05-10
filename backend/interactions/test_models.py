from django.test import TestCase
from django.contrib.auth import get_user_model
from posts.models import Post
from interactions.models import Comment

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