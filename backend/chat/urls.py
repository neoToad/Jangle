from django.urls import path

from chat.views import RoomMessageListCreateView

app_name = 'chat'
urlpatterns = [
    path('rooms/<slug:slug>/messages/', RoomMessageListCreateView.as_view(), name='room-messages'),
]
