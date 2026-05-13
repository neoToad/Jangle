from django.contrib import admin
from interactions.models import Comment, Reaction, Vote

admin.site.register(Comment)
admin.site.register(Reaction)
admin.site.register(Vote)
