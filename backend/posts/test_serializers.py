from django.test import TestCase
from django.contrib.auth import get_user_model
from posts.models import Post
from posts.serializers import PostSerializer
from interactions.models import Comment, Reaction, Vote

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

    def test_includes_reaction_counts(self):
        u2 = User.objects.create_user(email='u2@example.com', password='pass')
        u3 = User.objects.create_user(email='u3@example.com', password='pass')
        Reaction.objects.create(user=self.user, post=self.post, emoji='🔥')
        Reaction.objects.create(user=u2, post=self.post, emoji='🔥')
        Reaction.objects.create(user=u3, post=self.post, emoji='👍')

        data = PostSerializer(self.post).data
        self.assertEqual(data['reaction_counts']['🔥'], 2)
        self.assertEqual(data['reaction_counts']['👍'], 1)

    def test_includes_vote_score(self):
        u2 = User.objects.create_user(email='v2@example.com', password='pass')
        u3 = User.objects.create_user(email='v3@example.com', password='pass')
        Vote.objects.create(user=self.user, post=self.post, value=1)
        Vote.objects.create(user=u2, post=self.post, value=1)
        Vote.objects.create(user=u3, post=self.post, value=-1)

        data = PostSerializer(self.post).data
        self.assertEqual(data['vote_score'], 1)

    def test_youtube_post_requires_youtube_url(self):
        s = PostSerializer(data={'post_type': 'youtube', 'title': 'Clip'})
        self.assertFalse(s.is_valid())
        self.assertIn('youtube_url', s.errors)

    def test_youtube_post_rejects_non_youtube_domain(self):
        s = PostSerializer(
            data={'post_type': 'youtube', 'title': 'Clip', 'youtube_url': 'https://example.com/watch?v=abc'}
        )
        self.assertFalse(s.is_valid())
        self.assertIn('youtube_url', s.errors)

    def test_game_file_post_requires_file(self):
        s = PostSerializer(data={'post_type': 'file', 'file_type': 'game', 'title': 'Runner'})
        self.assertFalse(s.is_valid())
        self.assertIn('file', s.errors)

    def test_includes_comment_count_field(self):
        data = PostSerializer(self.post).data
        self.assertIn('comment_count', data)
        self.assertEqual(data['comment_count'], 0)

    def test_comment_count_excludes_removed_comments(self):
        Comment.objects.create(post=self.post, author=self.user, body='keep me')
        Comment.objects.create(post=self.post, author=self.user, body='remove me', is_removed=True)

        data = PostSerializer(self.post).data
        self.assertEqual(data['comment_count'], 1)

    def test_comment_count_includes_replies(self):
        parent = Comment.objects.create(post=self.post, author=self.user, body='parent')
        Comment.objects.create(post=self.post, author=self.user, body='reply', parent=parent)

        data = PostSerializer(self.post).data
        self.assertEqual(data['comment_count'], 2)

    def test_feed_mode_response_shape_fields_are_stable(self):
        post = Post.objects.create(author=self.user, post_type='file', file_type='game', title='Game shape')
        data = PostSerializer(post).data
        expected_fields = {
            'id', 'author', 'post_type', 'title', 'body',
            'youtube_url', 'file', 'file_type',
            'created_at', 'updated_at', 'is_pinned',
            'reaction_counts', 'vote_score', 'comment_count',
        }
        self.assertEqual(set(data.keys()), expected_fields)
