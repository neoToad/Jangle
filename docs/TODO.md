# TODO

## High Priority
- Validate feed query-count performance after `comment_count` annotation to ensure no material regression.
- Verify comment count refresh behavior from post detail creation flow back to feed refresh.
- Run broader frontend regression suite after post-detail style parity completion.
- Implement functional sidebar chat in `frontend/src/components/Layout.jsx` backed by REST history + websocket updates, with TDD coverage.
- Add backend chat REST contract and support for room message history/create endpoints with DRF tests split by `test_models.py`, `test_serializers.py`, and `test_views.py`.
- Add websocket consumer/routing for sidebar chat room events and integration tests for delivery/reconnect behavior.
- Implement functional feed tab behavior for `Following`, `Explore`, and `Games` in `frontend/src/pages/FeedPage.jsx` with TDD coverage.
- Add backend feed mode API contract support for `/api/posts/?feed=...` with DRF tests split by `test_models.py`, `test_serializers.py`, and `test_views.py`.
- Define and implement guest behavior policy for `Following` tab (login-gated vs explore-fallback) with matching frontend/backend tests.
- Prompt 11: wire sidebar `The Jangle` chat panel to backend `api/chat/` endpoint when routes are implemented.
- Prompt 6: align post-detail interactions with new feed-card local reaction/vote behavior.
- Add focused tests for comment action click-through behavior once post-detail footer wiring lands.
- Add comment reply/delete UI controls in post detail, with interaction tests.
- Add missing interaction 404 tests for non-existent or invalid reaction/vote targets.
- Add chat history retrieval endpoint and initial message fetch in UI so chat persists on page load.
- Resolve React Testing Library `act(...)` warning in `src/pages/PostDetailPage.test.jsx` websocket message test.

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
- Decide whether avatars should remain `ImageField`-backed files or move to a URL field.
- Add concise API docs/examples for reactions and votes payloads.
- Consider Docker Compose healthchecks for stronger startup readiness guarantees.
