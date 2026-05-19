from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from posts.models import Post

User = get_user_model()


def auth_client(user):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


class UserDetailViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='view@example.com', password='pass')

    def test_authenticated_returns_200(self):
        response = auth_client(self.user).get(reverse('users:user-detail'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_response_contains_email(self):
        response = auth_client(self.user).get(reverse('users:user-detail'))
        self.assertEqual(response.data['email'], 'view@example.com')

    def test_unauthenticated_returns_401(self):
        response = APIClient().get(reverse('users:user-detail'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserUpdateViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='upd@example.com', password='pass')

    def test_patch_bio_authenticated(self):
        response = auth_client(self.user).patch(reverse('users:user-update'), {'bio': 'New bio'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'New bio')

    def test_patch_persists_to_db(self):
        auth_client(self.user).patch(reverse('users:user-update'), {'bio': 'Saved'})
        self.user.refresh_from_db()
        self.assertEqual(self.user.bio, 'Saved')

    def test_unauthenticated_returns_401(self):
        response = APIClient().patch(reverse('users:user-update'), {'bio': 'x'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_change_email_via_update(self):
        auth_client(self.user).patch(reverse('users:user-update'), {'email': 'hack@example.com'})
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'upd@example.com')


class PublicProfileViewTest(TestCase):
    def setUp(self):
        self.viewer = User.objects.create_user(email='viewer@example.com', password='pass')
        self.user = User.objects.create_user(email='mosswood@example.com', password='pass', bio='Bio text')
        self.user.first_name = 'Moss'
        self.user.last_name = 'Wood'
        self.user.save(update_fields=['first_name', 'last_name'])
        Post.objects.create(author=self.user, post_type='text', title='One', body='Body')

    def test_profile_read_returns_200_for_guest(self):
        response = APIClient().get(reverse('users:public-profile', kwargs={'username': 'mosswood'}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile_read_contract_shape(self):
        response = APIClient().get(reverse('users:public-profile', kwargs={'username': 'mosswood'}))
        self.assertSetEqual(
            set(response.data.keys()),
            {'username', 'display_name', 'bio', 'avatar', 'post_count', 'follower_count', 'following_count', 'is_following'},
        )

    def test_profile_read_returns_404_for_unknown_username(self):
        response = APIClient().get(reverse('users:public-profile', kwargs={'username': 'unknown'}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_profile_read_sets_is_following_for_authenticated_user(self):
        self.user.followers.add(self.viewer)
        response = auth_client(self.viewer).get(reverse('users:public-profile', kwargs={'username': 'mosswood'}))
        self.assertTrue(response.data['is_following'])

    def test_profile_read_supports_me_alias_for_authenticated_user(self):
        response = auth_client(self.user).get(reverse('users:public-profile', kwargs={'username': 'me'}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'mosswood')


class ProfileFollowViewTest(TestCase):
    def setUp(self):
        self.viewer = User.objects.create_user(email='viewer@example.com', password='pass')
        self.user = User.objects.create_user(email='mosswood@example.com', password='pass')

    def test_follow_requires_authentication(self):
        response = APIClient().post(reverse('users:profile-follow', kwargs={'username': 'mosswood'}))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_follow_creates_relationship(self):
        response = auth_client(self.viewer).post(reverse('users:profile-follow', kwargs={'username': 'mosswood'}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.viewer.following.filter(id=self.user.id).exists())

    def test_unfollow_removes_relationship(self):
        self.viewer.following.add(self.user)
        response = auth_client(self.viewer).delete(reverse('users:profile-follow', kwargs={'username': 'mosswood'}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.viewer.following.filter(id=self.user.id).exists())

    def test_cannot_follow_self(self):
        response = auth_client(self.user).post(reverse('users:profile-follow', kwargs={'username': 'mosswood'}))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RegisterViewTest(TestCase):
    def test_register_returns_201(self):
        response = APIClient().post(
            reverse('users:register'),
            {
                'username': 'colin',
                'email': 'reg@example.com',
                'password': 'SecurePass123!',
                'confirm_password': 'SecurePass123!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_persists_user(self):
        APIClient().post(
            reverse('users:register'),
            {
                'username': 'colin',
                'email': 'save@example.com',
                'password': 'SecurePass123!',
                'confirm_password': 'SecurePass123!',
            },
            format='json',
        )
        self.assertTrue(User.objects.filter(email='save@example.com').exists())

    def test_register_password_mismatch_returns_400(self):
        response = APIClient().post(
            reverse('users:register'),
            {
                'username': 'colin',
                'email': 'bad@example.com',
                'password': 'SecurePass123!',
                'confirm_password': 'Mismatch123!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
