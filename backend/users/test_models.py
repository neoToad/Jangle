from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


class UserModelTest(TestCase):
    def test_username_field_is_email(self):
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_no_username_field(self):
        from django.core.exceptions import FieldDoesNotExist
        with self.assertRaises(FieldDoesNotExist):
            User._meta.get_field('username')  # type: ignore[misc]

    def test_required_fields_is_empty(self):
        self.assertEqual(User.REQUIRED_FIELDS, [])

    def test_create_user_with_email(self):
        user = User.objects.create_user(email='alice@example.com', password='s3cr3t!')
        self.assertEqual(user.email, 'alice@example.com')

    def test_email_is_unique(self):
        User.objects.create_user(email='dup@example.com', password='pass1')
        with self.assertRaises(IntegrityError):
            User.objects.create_user(email='dup@example.com', password='pass2')

    def test_bio_field_blank(self):
        field = User._meta.get_field('bio')
        self.assertTrue(field.blank)

    def test_bio_default_empty(self):
        user = User.objects.create_user(email='bio@example.com', password='pass')
        self.assertEqual(user.bio, '')

    def test_avatar_upload_to(self):
        field = User._meta.get_field('avatar')
        self.assertEqual(field.upload_to, 'avatars/')

    def test_created_at_auto_set(self):
        user = User.objects.create_user(email='ts@example.com', password='pass')
        self.assertIsNotNone(user.created_at)