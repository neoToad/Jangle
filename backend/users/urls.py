from django.urls import path
from .views import UserDetailView, UserUpdateView

app_name = 'users'
urlpatterns = [
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('me/update/', UserUpdateView.as_view(), name='user-update'),
]