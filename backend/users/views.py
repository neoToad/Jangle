from django.contrib.auth import get_user_model
from django.http import Http404
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import PublicProfileSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


def find_user_by_public_username(username: str, request_user=None):
    username_lower = username.lower()
    if username_lower == 'me' and request_user and getattr(request_user, 'is_authenticated', False):
        return request_user
    for user in User.objects.all().prefetch_related('followers', 'following', 'posts'):
        if user.public_username == username_lower:
            return user
    raise Http404('Profile not found.')


class PublicProfileView(generics.RetrieveAPIView):
    serializer_class = PublicProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return find_user_by_public_username(self.kwargs['username'], request_user=self.request.user)


class ProfileFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target = find_user_by_public_username(username, request_user=request.user)
        if target.id == request.user.id:
            return Response({'detail': 'Cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.following.add(target)
        return Response({'is_following': True}, status=status.HTTP_200_OK)

    def delete(self, request, username):
        target = find_user_by_public_username(username, request_user=request.user)
        request.user.following.remove(target)
        return Response({'is_following': False}, status=status.HTTP_200_OK)
