## Next
- Add admin registration for chat models.
- Add list_display/list_filter/search_fields for interactions admin classes.
- Add queryset annotations/prefetching for reaction/vote aggregates to reduce serializer query count.
- Add endpoint tests for removed/non-existent post/comment targets (404 behavior).

## Completed
- Added `Reaction` model and `Vote` model in `interactions` with uniqueness/check constraints.
- Added reaction endpoints for posts/comments and vote endpoints for posts.
- Added `reaction_counts` and `vote_score` aggregate fields to Post and Comment serializers.
- Registered `Reaction` and `Vote` in interactions admin.
- Added Django admin registration for `Post` with `PostAdmin` (`list_display`, `list_filter`, `search_fields`, ordering).
- Added Django admin registration for custom `User` with `UserAdmin` based on `BaseUserAdmin`.
- Configured user admin `fieldsets`, `add_fieldsets`, list views, filters, and read-only `created_at`.
- Generated migration: `interactions/migrations/0002_reaction_vote.py`.

## Tests
- Previously verified interaction changes with:
- `python manage.py test interactions.test_models interactions.test_views interactions.test_serializers posts.test_serializers --settings=core.settings_test -v 2`
- Result: 60 passed, 0 failed.
- Verified this admin task with:
- `python manage.py check --settings=core.settings_test`
- Result: System check identified no issues.

## Blockers
- None
