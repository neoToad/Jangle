from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from users.views import ProfileFollowView, PublicProfileView, RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT auth
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/profiles/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
    path('api/profiles/<str:username>/follow/', ProfileFollowView.as_view(), name='profile_follow'),

    # App routes
    path('api/users/', include('users.urls', namespace='users')),
    path('api/posts/', include('posts.urls', namespace='posts')),
    path('api/interactions/', include('interactions.urls', namespace='interactions')),
    path('api/chat/', include('chat.urls', namespace='chat')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
