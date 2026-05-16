# TODO

## High Priority
- Implement header profile menu interaction and accessibility behavior in `frontend/src/components/Layout.jsx` with TDD coverage.
- Implement profile page MVP states and data rendering in `frontend/src/pages/ProfilePage.jsx` with tests.
- Add or confirm backend profile API contract tests (`test_models.py`, `test_serializers.py`, `test_views.py`) and endpoint support.
- Prompt 11: wire sidebar `The Jangle` chat panel to backend `api/chat/` endpoint when routes are implemented.
- Prompt 6: align post-detail interactions with new feed-card local reaction/vote behavior.
- Add focused tests for comment action click-through behavior once post-detail footer wiring lands.
- Add comment reply/delete UI controls in post detail, with interaction tests.
- Add missing interaction 404 tests for non-existent or invalid reaction/vote targets.
- Add chat history retrieval endpoint and initial message fetch in UI so chat persists on page load.

## Medium Priority
- Add empty-feed UI copy state for successful API responses with zero posts.
- Run full backend test suite before next backend feature merge.
- Add targeted tests for auth store token lifecycle and refresh interceptor behavior.

## Admin / Moderation
- Add admin list filters for chat models (room, author, created date).
- Add admin actions for bulk message moderation (soft-delete/export).
- Consider `ordering` and `date_hierarchy` for chat admin if message volume grows.

## Docs / Decisions
- Revisit seeded data strategy so placeholder content mirrors backend reaction emoji format exactly.
- Update README/backend docs to reference `python manage.py seed_db` and `python manage.py seed_db --reset`.
- Decide whether to add a dedicated follow relationship model on `User` for social-graph seeding.
- Decide whether avatars should remain `ImageField`-backed files or move to a URL field.
- Add concise API docs/examples for reactions and votes payloads.
- Consider Docker Compose healthchecks for stronger startup readiness guarantees.
