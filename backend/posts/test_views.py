from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from posts.models import Post
from interactions.models import Comment

User = get_user_model()


def auth_client(user):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


def make_user(email='a@example.com'):
    return User.objects.create_user(email=email, password='pass')


class PostListCreateViewTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.list_url = reverse('posts:post-list')

    def _make_post(self, **kwargs):
        defaults = dict(author=self.user, post_type='text', title='Hello')
        defaults.update(kwargs)
        return Post.objects.create(**defaults)

    def test_unauthenticated_can_list(self):
        self._make_post()
        response = APIClient().get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_excludes_removed_posts(self):
        self._make_post(title='Visible')
        self._make_post(title='Gone', is_removed=True)
        response = APIClient().get(self.list_url)
        titles = [p['title'] for p in response.data['results']]
        self.assertIn('Visible', titles)
        self.assertNotIn('Gone', titles)

    def test_unauthenticated_cannot_create(self):
        response = APIClient().post(self.list_url, {'post_type': 'text', 'title': 'T'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_create(self):
        response = auth_client(self.user).post(
            self.list_url, {'post_type': 'text', 'title': 'My Post'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_sets_author_to_current_user(self):
        auth_client(self.user).post(
            self.list_url, {'post_type': 'text', 'title': 'Mine'}, format='json'
        )
        post = Post.objects.get(title='Mine')
        self.assertEqual(post.author, self.user)

    def test_create_youtube_post_requires_valid_youtube_url(self):
        response = auth_client(self.user).post(
            self.list_url,
            {'post_type': 'youtube', 'title': 'Clip', 'youtube_url': 'https://example.com/watch?v=abc'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('youtube_url', response.data)

    def test_create_game_post_requires_file(self):
        response = auth_client(self.user).post(
            self.list_url,
            {'post_type': 'file', 'file_type': 'game', 'title': 'Runner'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('file', response.data)

    def test_list_includes_comment_count(self):
        post = self._make_post(title='Counted')
        Comment.objects.create(post=post, author=self.user, body='one')
        Comment.objects.create(post=post, author=self.user, body='two', is_removed=True)

        response = APIClient().get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data['results'][0]
        self.assertIn('comment_count', payload)
        self.assertEqual(payload['comment_count'], 1)


class PostRetrieveViewTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.post = Post.objects.create(author=self.user, post_type='text', title='Detail')
        self.url = reverse('posts:post-detail', args=[self.post.pk])

    def test_unauthenticated_can_retrieve(self):
        response = APIClient().get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_removed_post_returns_404(self):
        self.post.is_removed = True
        self.post.save()
        response = APIClient().get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_is_removed_not_in_response(self):
        response = APIClient().get(self.url)
        self.assertNotIn('is_removed', response.data)


class PostUpdateViewTest(TestCase):
    def setUp(self):
        self.author = make_user('author@example.com')
        self.other = make_user('other@example.com')
        self.admin = make_user('admin@example.com')
        self.admin.is_staff = True
        self.admin.save()
        self.post = Post.objects.create(author=self.author, post_type='text', title='Original')
        self.url = reverse('posts:post-detail', args=[self.post.pk])

    def test_author_can_patch(self):
        response = auth_client(self.author).patch(self.url, {'title': 'Updated'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated')

    def test_non_author_cannot_patch(self):
        response = auth_client(self.other).patch(self.url, {'title': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_patch(self):
        response = auth_client(self.admin).patch(self.url, {'title': 'Admin Edit'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_cannot_patch(self):
        response = APIClient().patch(self.url, {'title': 'X'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostDeleteViewTest(TestCase):
    def setUp(self):
        self.author = make_user('author2@example.com')
        self.other = make_user('other2@example.com')
        self.admin = make_user('admin2@example.com')
        self.admin.is_staff = True
        self.admin.save()
        self.post = Post.objects.create(author=self.author, post_type='text', title='To Delete')
        self.url = reverse('posts:post-detail', args=[self.post.pk])

    def test_author_can_delete(self):
        response = auth_client(self.author).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_non_author_cannot_delete(self):
        response = auth_client(self.other).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete(self):
        response = auth_client(self.admin).delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unauthenticated_cannot_delete(self):
        response = APIClient().delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
