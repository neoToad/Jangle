from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

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
