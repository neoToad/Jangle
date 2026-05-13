from django.contrib import admin
from posts.models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'post_type', 'is_pinned', 'is_removed', 'created_at')
    list_filter = ('post_type', 'file_type', 'is_pinned', 'is_removed', 'created_at')
    search_fields = ('title', 'body', 'author__email')
    ordering = ('-created_at',)
