from django.test import TestCase
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

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