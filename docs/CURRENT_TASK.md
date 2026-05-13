## Next
- Add queryset annotations/prefetching for reaction/vote aggregates to reduce serializer query count
- Add endpoint tests for removed/non-existent post/comment targets (404 behavior)
- Add API docs/examples for reaction and vote payloads
- Decide whether comments should support votes beyond the placeholder `vote_score=0`

## Completed
- Added `Reaction` model in `interactions` with fields: `user`, `emoji`, `post` (nullable), `comment` (nullable), `created_at`
- Added `Reaction` constraints:
- Unique `(user, post)` when `post` is set
- Unique `(user, comment)` when `comment` is set
- Check constraint + model `clean()` enforcing exactly one target (`post` xor `comment`)
- Added `Vote` model in `interactions` with fields: `user`, `post`, `value`, `created_at`
- Added `Vote` constraints:
- Unique `(user, post)`
- Check constraint + serializer/model validation enforcing `value` in `{1, -1}`
- Added DRF endpoints:
- `POST/DELETE /api/interactions/posts/<post_id>/reactions/` (add/change/remove reaction)
- `POST/DELETE /api/interactions/comments/<comment_id>/reactions/` (add/change/remove reaction)
- `POST/DELETE /api/interactions/posts/<post_id>/votes/` (cast/change/remove vote)
- Added aggregated fields to serializers:
- `PostSerializer`: `reaction_counts` and `vote_score`
- `CommentSerializer`: `reaction_counts` and `vote_score` (currently `0` placeholder)
- Registered `Reaction` and `Vote` in Django admin
- Generated migration: `interactions/migrations/0002_reaction_vote.py`

## Tests
- Added/updated tests across:
- `interactions/test_models.py` for reaction/vote constraints and validation
- `interactions/test_views.py` for reaction/vote add-change-remove endpoints
- `interactions/test_serializers.py` for comment reaction aggregates and vote score field
- `posts/test_serializers.py` for post reaction aggregates and vote score field
- Ran: `python manage.py test interactions.test_models interactions.test_views interactions.test_serializers posts.test_serializers --settings=core.settings_test -v 2`
- Result: 60 passed, 0 failed

## Blockers
- None
