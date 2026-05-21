from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.db import connection
from django.utils import timezone
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

    def test_comment_count_updates_after_comment_create_and_feed_refetch(self):
        post = self._make_post(title='Refresh Count')
        detail_url = reverse('posts:post-detail', args=[post.pk])
        comment_create_url = reverse('interactions:comment-list-create', args=[post.pk])

        first_list = APIClient().get(self.list_url)
        self.assertEqual(first_list.status_code, status.HTTP_200_OK)
        self.assertEqual(first_list.data['results'][0]['comment_count'], 0)

        detail_response = APIClient().get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

        create_response = auth_client(self.user).post(
            comment_create_url, {'body': 'new comment'}, format='json'
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        second_list = APIClient().get(self.list_url)
        self.assertEqual(second_list.status_code, status.HTTP_200_OK)
        self.assertEqual(second_list.data['results'][0]['comment_count'], 1)

    def test_list_avoids_per_post_comment_count_queries(self):
        posts = [self._make_post(title=f'Post {i}') for i in range(3)]
        for post in posts:
            Comment.objects.create(post=post, author=self.user, body='c1')

        with CaptureQueriesContext(connection) as ctx:
            response = APIClient().get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment_table_queries = [
            q for q in ctx.captured_queries if 'interactions_comment' in q['sql'].lower()
        ]
        # DRF pagination can add a second aggregate query, but count queries should not scale per post.
        self.assertLessEqual(len(comment_table_queries), 2)

    def test_feed_following_returns_only_followed_authors_for_authenticated_user(self):
        followed_author = make_user('followed@example.com')
        other_author = make_user('other-following@example.com')
        self.user.following.add(followed_author)
        Post.objects.create(author=followed_author, post_type='text', title='Followed post')
        Post.objects.create(author=other_author, post_type='text', title='Not followed post')

        response = auth_client(self.user).get(f'{self.list_url}?feed=following')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p['title'] for p in response.data['results']]
        self.assertIn('Followed post', titles)
        self.assertNotIn('Not followed post', titles)

    def test_feed_following_returns_empty_list_for_guest(self):
        followed_author = make_user('followed-guest@example.com')
        Post.objects.create(author=followed_author, post_type='text', title='Guest cannot see this')

        response = APIClient().get(f'{self.list_url}?feed=following')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    def test_feed_following_returns_empty_when_user_follows_nobody(self):
        other_author = make_user('other-nofollows@example.com')
        Post.objects.create(author=other_author, post_type='text', title='No-follow candidate')

        response = auth_client(self.user).get(f'{self.list_url}?feed=following')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    def test_feed_explore_returns_discovery_posts(self):
        self._make_post(title='Explore text')
        Post.objects.create(author=self.user, post_type='file', file_type='game', title='Explore game')

        response = APIClient().get(f'{self.list_url}?feed=explore')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p['title'] for p in response.data['results']]
        self.assertIn('Explore text', titles)
        self.assertIn('Explore game', titles)

    def test_feed_games_returns_only_game_file_posts(self):
        Post.objects.create(author=self.user, post_type='file', file_type='game', title='Game included')
        Post.objects.create(author=self.user, post_type='file', file_type='image', title='Image excluded')
        self._make_post(title='Text excluded')

        response = APIClient().get(f'{self.list_url}?feed=games')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p['title'] for p in response.data['results']]
        self.assertEqual(titles, ['Game included'])

    def test_feed_invalid_value_returns_400(self):
        response = APIClient().get(f'{self.list_url}?feed=invalid')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('feed', response.data)

    def test_feed_explore_orders_by_engagement_then_recency(self):
        older_high = Post.objects.create(author=self.user, post_type='text', title='Older high engagement')
        newer_low = Post.objects.create(author=self.user, post_type='text', title='Newer low engagement')
        other_user = make_user('engagement2@example.com')

        # High engagement: 2 votes + 2 reactions + 1 visible comment = 5
        Vote.objects.create(user=self.user, post=older_high, value=1)
        Vote.objects.create(user=other_user, post=older_high, value=1)
        Reaction.objects.create(user=self.user, post=older_high, emoji='🔥')
        Reaction.objects.create(user=other_user, post=older_high, emoji='👍')
        Comment.objects.create(post=older_high, author=self.user, body='engaged')

        # Low engagement: only one vote = 1
        Vote.objects.create(user=self.user, post=newer_low, value=1)

        response = APIClient().get(f'{self.list_url}?feed=explore')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p['title'] for p in response.data['results']]
        self.assertEqual(titles[:2], ['Older high engagement', 'Newer low engagement'])

    def test_feed_explore_uses_deterministic_tiebreaker_on_equal_scores(self):
        first = Post.objects.create(author=self.user, post_type='text', title='Tie first')
        second = Post.objects.create(author=self.user, post_type='text', title='Tie second')
        fixed_ts = timezone.now()
        Post.objects.filter(pk__in=[first.pk, second.pk]).update(created_at=fixed_ts)

        response = APIClient().get(f'{self.list_url}?feed=explore')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p['title'] for p in response.data['results']]
        self.assertEqual(titles[:2], ['Tie second', 'Tie first'])


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
