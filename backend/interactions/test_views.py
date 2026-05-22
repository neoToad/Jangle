from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from posts.models import Post
from interactions.models import Comment, Reaction, Vote

User = get_user_model()


def auth_client(user):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


def make_user(email='user@example.com'):
    return User.objects.create_user(email=email, password='pass')


def make_post(user):
    return Post.objects.create(author=user, post_type='text', title='Test Post')


class CommentListCreateViewTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.post = make_post(self.user)
        self.url = reverse('interactions:comment-list-create', args=[self.post.pk])

    def _comment(self, **kwargs):
        defaults = dict(post=self.post, author=self.user, body='Hello')
        defaults.update(kwargs)
        return Comment.objects.create(**defaults)

    def test_list_returns_200(self):
        response = APIClient().get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_only_top_level_comments(self):
        parent = self._comment(body='Parent')
        self._comment(body='Reply', parent=parent)
        response = APIClient().get(self.url)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['body'], 'Parent')

    def test_replies_nested_in_parent(self):
        parent = self._comment(body='Parent')
        self._comment(body='Reply', parent=parent)
        response = APIClient().get(self.url)
        self.assertEqual(len(response.data['results'][0]['replies']), 1)

    def test_list_includes_author_username_and_created_at(self):
        self._comment(body='Parent')
        response = APIClient().get(self.url)
        first = response.data['results'][0]
        self.assertIn('author_username', first)
        self.assertEqual(first['author_username'], self.user.public_username)
        self.assertIn('created_at', first)

    def test_list_includes_all_reply_levels_recursively(self):
        parent = self._comment(body='Parent')
        child = self._comment(body='Child', parent=parent)
        self._comment(body='Grandchild', parent=child)
        response = APIClient().get(self.url)
        parent_row = response.data['results'][0]
        self.assertEqual(len(parent_row['replies']), 1)
        self.assertEqual(parent_row['replies'][0]['body'], 'Child')
        self.assertEqual(len(parent_row['replies'][0]['replies']), 1)
        self.assertEqual(parent_row['replies'][0]['replies'][0]['body'], 'Grandchild')

    def test_replies_are_returned_in_created_order(self):
        parent = self._comment(body='Parent')
        self._comment(body='Second reply', parent=parent)
        self._comment(body='First reply', parent=parent)
        response = APIClient().get(self.url)
        replies = response.data['results'][0]['replies']
        self.assertEqual([reply['body'] for reply in replies], ['Second reply', 'First reply'])

    def test_removed_comments_not_listed(self):
        self._comment(is_removed=True)
        response = APIClient().get(self.url)
        self.assertEqual(len(response.data['results']), 0)

    def test_unauthenticated_cannot_create(self):
        response = APIClient().post(self.url, {'body': 'Hello'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_create(self):
        response = auth_client(self.user).post(
            self.url, {'body': 'New comment'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_sets_author_and_post(self):
        auth_client(self.user).post(self.url, {'body': 'My comment'}, format='json')
        comment = Comment.objects.get(body='My comment')
        self.assertEqual(comment.author, self.user)
        self.assertEqual(comment.post, self.post)

    def test_create_reply_via_parent(self):
        parent = self._comment()
        auth_client(self.user).post(
            self.url, {'body': 'Reply text', 'parent': parent.pk}, format='json'
        )
        reply = Comment.objects.get(body='Reply text')
        self.assertEqual(reply.parent, parent)


class CommentDestroyViewTest(TestCase):
    def setUp(self):
        self.author = make_user('author@example.com')
        self.other = make_user('other@example.com')
        self.admin = make_user('admin@example.com')
        self.admin.is_staff = True
        self.admin.save()
        self.post = make_post(self.author)
        self.comment = Comment.objects.create(
            post=self.post, author=self.author, body='To delete'
        )
        self.url = reverse('interactions:comment-destroy', args=[self.comment.pk])

    def test_author_can_soft_delete(self):
        response = auth_client(self.author).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.comment.refresh_from_db()
        self.assertTrue(self.comment.is_removed)

    def test_admin_can_soft_delete(self):
        response = auth_client(self.admin).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.comment.refresh_from_db()
        self.assertTrue(self.comment.is_removed)

    def test_non_author_gets_403(self):
        response = auth_client(self.other).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.comment.refresh_from_db()
        self.assertFalse(self.comment.is_removed)

    def test_unauthenticated_gets_401(self):
        response = APIClient().delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReactionViewTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.other = make_user('other@example.com')
        self.post = make_post(self.other)
        self.comment = Comment.objects.create(post=self.post, author=self.other, body='c1')
        self.post_url = reverse('interactions:post-reaction', args=[self.post.pk])
        self.comment_url = reverse('interactions:comment-reaction', args=[self.comment.pk])

    def test_unauthenticated_cannot_set_reaction(self):
        response = APIClient().post(self.post_url, {'emoji': '🔥'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_reaction_to_post(self):
        response = auth_client(self.user).post(self.post_url, {'emoji': '🔥'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reaction = Reaction.objects.get(user=self.user, post=self.post)
        self.assertEqual(reaction.emoji, '🔥')

    def test_change_reaction_on_post(self):
        Reaction.objects.create(user=self.user, post=self.post, emoji='🔥')
        response = auth_client(self.user).post(self.post_url, {'emoji': '👍'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        reaction = Reaction.objects.get(user=self.user, post=self.post)
        self.assertEqual(reaction.emoji, '👍')

    def test_remove_reaction_from_post(self):
        Reaction.objects.create(user=self.user, post=self.post, emoji='🔥')
        response = auth_client(self.user).delete(self.post_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Reaction.objects.filter(user=self.user, post=self.post).exists())

    def test_add_reaction_to_comment(self):
        response = auth_client(self.user).post(self.comment_url, {'emoji': '😂'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reaction = Reaction.objects.get(user=self.user, comment=self.comment)
        self.assertEqual(reaction.emoji, '😂')

    def test_remove_reaction_from_comment(self):
        Reaction.objects.create(user=self.user, comment=self.comment, emoji='😂')
        response = auth_client(self.user).delete(self.comment_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Reaction.objects.filter(user=self.user, comment=self.comment).exists())


class VoteViewTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.other = make_user('other2@example.com')
        self.post = make_post(self.other)
        self.url = reverse('interactions:post-vote', args=[self.post.pk])

    def test_unauthenticated_cannot_vote(self):
        response = APIClient().post(self.url, {'value': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cast_vote(self):
        response = auth_client(self.user).post(self.url, {'value': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vote = Vote.objects.get(user=self.user, post=self.post)
        self.assertEqual(vote.value, 1)

    def test_change_vote(self):
        Vote.objects.create(user=self.user, post=self.post, value=1)
        response = auth_client(self.user).post(self.url, {'value': -1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vote = Vote.objects.get(user=self.user, post=self.post)
        self.assertEqual(vote.value, -1)

    def test_remove_vote(self):
        Vote.objects.create(user=self.user, post=self.post, value=1)
        response = auth_client(self.user).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Vote.objects.filter(user=self.user, post=self.post).exists())

    def test_invalid_vote_value_rejected(self):
        response = auth_client(self.user).post(self.url, {'value': 0}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
