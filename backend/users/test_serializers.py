from django.test import TestCase
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from users.serializers import RegisterSerializer, PublicProfileSerializer
from posts.models import Post

User = get_user_model()


class UserSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='serial@example.com', password='pass', bio='Hi')

    def test_contains_expected_fields(self):
        data = UserSerializer(self.user).data
        self.assertSetEqual(set(data.keys()), {'id', 'email', 'bio', 'avatar', 'created_at'})

    def test_email_value(self):
        data = UserSerializer(self.user).data
        self.assertEqual(data['email'], 'serial@example.com')

    def test_bio_value(self):
        data = UserSerializer(self.user).data
        self.assertEqual(data['bio'], 'Hi')

    def test_email_is_read_only(self):
        serializer = UserSerializer(self.user, data={'email': 'new@example.com', 'bio': 'x'}, partial=True)
        serializer.is_valid()
        updated = serializer.save()
        self.assertEqual(updated.email, 'serial@example.com')


class PublicProfileSerializerTest(TestCase):
    def setUp(self):
        self.viewer = User.objects.create_user(email='viewer@example.com', password='pass')
        self.user = User.objects.create_user(email='mosswood@example.com', password='pass', bio='Hi there')
        self.user.first_name = 'Moss'
        self.user.last_name = 'Wood'
        self.user.save(update_fields=['first_name', 'last_name'])
        Post.objects.create(author=self.user, post_type='text', title='One', body='Body')
        self.user.followers.add(self.viewer)

    def test_contains_profile_contract_fields(self):
        serializer = PublicProfileSerializer(self.user, context={'request': None})
        self.assertSetEqual(
            set(serializer.data.keys()),
            {
                'username',
                'display_name',
                'bio',
                'avatar',
                'post_count',
                'follower_count',
                'following_count',
                'is_following',
            },
        )

    def test_derives_counts_and_display_name(self):
        serializer = PublicProfileSerializer(self.user, context={'request': None})
        self.assertEqual(serializer.data['username'], 'mosswood')
        self.assertEqual(serializer.data['display_name'], 'Moss Wood')
        self.assertEqual(serializer.data['post_count'], 1)
        self.assertEqual(serializer.data['follower_count'], 1)
        self.assertEqual(serializer.data['following_count'], 0)

    def test_is_following_true_for_authenticated_viewer(self):
        request = type('Req', (), {'user': self.viewer})
        serializer = PublicProfileSerializer(self.user, context={'request': request})
        self.assertTrue(serializer.data['is_following'])


class RegisterSerializerTest(TestCase):
    def test_valid_payload_creates_user(self):
        serializer = RegisterSerializer(
            data={
                'username': 'colin',
                'email': 'new@example.com',
                'password': 'SecurePass123!',
                'confirm_password': 'SecurePass123!',
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, 'new@example.com')
        self.assertTrue(user.check_password('SecurePass123!'))

    def test_password_mismatch_invalid(self):
        serializer = RegisterSerializer(
            data={
                'username': 'colin',
                'email': 'new@example.com',
                'password': 'SecurePass123!',
                'confirm_password': 'Mismatch123!',
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn('Passwords do not match.', serializer.errors['non_field_errors'])
