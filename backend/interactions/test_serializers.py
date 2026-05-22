from django.test import TestCase
from django.contrib.auth import get_user_model
from posts.models import Post
from interactions.models import Comment, Reaction
from interactions.serializers import CommentSerializer

User = get_user_model()


def make_user(email='user@example.com'):
    return User.objects.create_user(email=email, password='pass')


def make_post(user):
    return Post.objects.create(author=user, post_type='text', title='Test Post')


class CommentSerializerTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.post = make_post(self.user)
        self.comment = Comment.objects.create(
            post=self.post, author=self.user, body='Top level'
        )

    def test_serializes_expected_fields(self):
        data = CommentSerializer(self.comment).data
        for field in ['id', 'post', 'author', 'parent', 'body', 'created_at', 'replies']:
            self.assertIn(field, data)

    def test_is_removed_not_in_fields(self):
        data = CommentSerializer(self.comment).data
        self.assertNotIn('is_removed', data)

    def test_replies_empty_when_no_children(self):
        data = CommentSerializer(self.comment).data
        self.assertEqual(data['replies'], [])

    def test_replies_nested(self):
        reply = Comment.objects.create(
            post=self.post, author=self.user, body='Reply', parent=self.comment
        )
        data = CommentSerializer(self.comment).data
        self.assertEqual(len(data['replies']), 1)
        self.assertEqual(data['replies'][0]['id'], reply.pk)

    def test_removed_reply_excluded_from_replies(self):
        Comment.objects.create(
            post=self.post, author=self.user, body='Gone',
            parent=self.comment, is_removed=True
        )
        data = CommentSerializer(self.comment).data
        self.assertEqual(data['replies'], [])

    def test_author_is_read_only(self):
        self.assertIn('author', CommentSerializer.Meta.read_only_fields)

    def test_post_is_read_only(self):
        self.assertIn('post', CommentSerializer.Meta.read_only_fields)

    def test_includes_reaction_counts(self):
        u2 = make_user('u2@example.com')
        u3 = make_user('u3@example.com')
        Reaction.objects.create(user=self.user, comment=self.comment, emoji='🔥')
        Reaction.objects.create(user=u2, comment=self.comment, emoji='🔥')
        Reaction.objects.create(user=u3, comment=self.comment, emoji='👍')

        data = CommentSerializer(self.comment).data
        self.assertEqual(data['reaction_counts']['🔥'], 2)
        self.assertEqual(data['reaction_counts']['👍'], 1)

    def test_includes_vote_score_default_zero(self):
        data = CommentSerializer(self.comment).data
        self.assertEqual(data['vote_score'], 0)

    def test_includes_author_username(self):
        data = CommentSerializer(self.comment).data
        self.assertIn('author_username', data)
        self.assertEqual(data['author_username'], self.user.public_username)
