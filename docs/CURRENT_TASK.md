## Next
- Add interactions admin with list_display, list_filter
- Consider filtering comments by author or date range
- Add like/reaction model to interactions app
- Add Post admin registration

## Completed
- Comment model: post/author/parent FKs, body, created_at, is_removed; self-referential parent for threaded replies
- CommentSerializer: nested replies (SerializerMethodField, filters is_removed=False); post+author read-only; is_removed excluded from output
- CommentListCreateView: GET public, POST requires auth; filters top-level (parent=None) + is_removed=False; sets author+post from URL
- CommentDestroyView: soft-delete (sets is_removed=True); IsAuthorOrAdmin permission; returns 204
- interactions/urls.py: posts/<post_id>/comments/ and comments/<pk>/
- interactions/migrations/0001_initial.py generated
- Post model: author FK, post_type/file_type choices, nullable fields, is_pinned/is_removed, timestamps
- PostSerializer, PostViewSet, IsAuthorOrAdminOrReadOnly permission

## Tests
- 28 new tests across test_models.py, test_serializers.py, test_views.py — all green
- Full suite: 85 passed, 0 failed

## Blockers
- None