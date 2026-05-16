from django.test import TestCase
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from users.serializers import RegisterSerializer

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
