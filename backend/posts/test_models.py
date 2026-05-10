from django.test import TestCase
from django.contrib.auth import get_user_model
from posts.models import Post

User = get_user_model()


def make_user(email='a@example.com'):
    return User.objects.create_user(email=email, password='pass')


class PostModelTest(TestCase):
    def setUp(self):
        self.user = make_user()

    def _post(self, **kwargs):
        defaults = dict(author=self.user, post_type='text', title='Hello')
        defaults.update(kwargs)
        return Post.objects.create(**defaults)

    def test_create_text_post(self):
        post = self._post()
        self.assertIsNotNone(post.pk)

    def test_post_type_choices(self):
        choices = {c[0] for c in Post.POST_TYPE_CHOICES}
        self.assertEqual(choices, {'text', 'youtube', 'file'})

    def test_file_type_choices(self):
        choices = {c[0] for c in Post.FILE_TYPE_CHOICES}
        self.assertEqual(choices, {'image', 'game', 'other'})

    def test_body_nullable(self):
        field = Post._meta.get_field('body')
        self.assertTrue(field.null)
        self.assertTrue(field.blank)

    def test_youtube_url_nullable(self):
        field = Post._meta.get_field('youtube_url')
        self.assertTrue(field.null)
        self.assertTrue(field.blank)

    def test_file_nullable(self):
        field = Post._meta.get_field('file')
        self.assertTrue(field.null)
        self.assertTrue(field.blank)

    def test_file_type_nullable(self):
        field = Post._meta.get_field('file_type')
        self.assertTrue(field.null)
        self.assertTrue(field.blank)

    def test_is_pinned_default_false(self):
        post = self._post()
        self.assertFalse(post.is_pinned)

    def test_is_removed_default_false(self):
        post = self._post()
        self.assertFalse(post.is_removed)

    def test_created_at_auto_set(self):
        post = self._post()
        self.assertIsNotNone(post.created_at)

    def test_updated_at_auto_set(self):
        post = self._post()
        self.assertIsNotNone(post.updated_at)

    def test_author_fk(self):
        post = self._post()
        self.assertEqual(post.author, self.user)

    def test_str(self):
        post = self._post(title='My Post')
        self.assertIn('My Post', str(post))