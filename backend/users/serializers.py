from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'bio', 'avatar', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True, write_only=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        validated_data.pop('username', None)
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
        )


class PublicProfileSerializer(serializers.Serializer):
    username = serializers.CharField(source='public_username', read_only=True)
    display_name = serializers.CharField(read_only=True)
    bio = serializers.CharField(read_only=True)
    avatar = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    def get_avatar(self, obj):
        if not obj.avatar:
            return ''
        try:
            return obj.avatar.url
        except ValueError:
            return ''

    def get_post_count(self, obj):
        return obj.posts.count()

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not getattr(request.user, 'is_authenticated', False):
            return False
        return obj.followers.filter(id=request.user.id).exists()
