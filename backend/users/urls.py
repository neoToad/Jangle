from django.urls import path
from .views import ProfileFollowView, PublicProfileView, RegisterView, UserDetailView, UserUpdateView

app_name = 'users'
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('me/update/', UserUpdateView.as_view(), name='user-update'),
    path('profiles/<str:username>/', PublicProfileView.as_view(), name='public-profile'),
    path('profiles/<str:username>/follow/', ProfileFollowView.as_view(), name='profile-follow'),
]
