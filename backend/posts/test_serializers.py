from django.test import TestCase
from django.contrib.auth import get_user_model
from posts.models import Post
from posts.serializers import PostSerializer

User = get_user_model()


class PostSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='s@example.com', password='pass')
        self.post = Post.objects.create(author=self.user, post_type='text', title='T')

    def test_is_removed_not_in_fields(self):
        data = PostSerializer(self.post).data
        self.assertNotIn('is_removed', data)

    def test_author_is_read_only_id(self):
        data = PostSerializer(self.post).data
        self.assertIn('author', data)

    def test_required_fields_missing_raises_error(self):
        s = PostSerializer(data={'post_type': 'text'})
        self.assertFalse(s.is_valid())
        self.assertIn('title', s.errors)

    def test_valid_text_post(self):
        s = PostSerializer(data={'post_type': 'text', 'title': 'Hi', 'body': 'Hello'})
        self.assertTrue(s.is_valid(), s.errors)

    def test_invalid_post_type(self):
        s = PostSerializer(data={'post_type': 'invalid', 'title': 'Hi'})
        self.assertFalse(s.is_valid())
        self.assertIn('post_type', s.errors)

    def test_invalid_file_type(self):
        s = PostSerializer(data={'post_type': 'file', 'title': 'Hi', 'file_type': 'bad'})
        self.assertFalse(s.is_valid())
        self.assertIn('file_type', s.errors)

    def test_created_at_in_output(self):
        data = PostSerializer(self.post).data
        self.assertIn('created_at', data)

    def test_updated_at_in_output(self):
        data = PostSerializer(self.post).data
        self.assertIn('updated_at', data)