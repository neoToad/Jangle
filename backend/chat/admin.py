from django.contrib import admin

from chat.models import ChatMessage, ChatRoom


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'post', 'created_at')
    search_fields = ('name',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'author', 'created_at')
    search_fields = ('body', 'author__username', 'room__name')
    list_select_related = ('room', 'author')
