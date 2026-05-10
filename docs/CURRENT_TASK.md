## Next
- Add Post admin registration
- Consider filtering/ordering query params on list endpoint
- Add interactions (likes, comments) referencing Post

## Completed
- Post model: author FK, post_type/file_type choices, nullable body/youtube_url/file/file_type, is_pinned/is_removed BooleanFields, timestamps
- PostSerializer: all fields except is_removed; author read-only
- PostViewSet: list/create/retrieve/update/destroy; queryset excludes is_removed=True
- IsAuthorOrAdminOrReadOnly permission: unauthenticated read, authenticated create, author/admin edit+delete
- posts/urls.py wired via DefaultRouter
- Fixed conftest.py: moved DRF imports inside fixtures (module-level DRF imports fail before pytest-django configures Django)
- Installed missing pytest-django and Pillow into venv

## Tests
- 37 new tests across test_models.py, test_serializers.py, test_views.py — all green
- Full suite: 57 passed, 0 failed

## Blockers
- None