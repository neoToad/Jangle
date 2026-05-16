# TODO

## High Priority
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

- Prompt 11: wire sidebar `The Jangle` chat panel to backend `api/chat/` endpoint when HTTP routes are implemented.
- Add empty-feed UI copy for successful API responses with zero posts.
- Align post-detail interactions with feed-card local reaction/vote behavior.
- Fix feed scrolling and load-more visibility behavior in `frontend/src/pages/FeedPage.jsx`:
  - remove internal feed scroll container (`max-h-[65vh] overflow-y-auto`) so scrolling is page-level and scrollbar stays at viewport right edge.
  - keep feed content in normal document flow and preserve spacing without right-padding hack (`pr-1`) tied to internal scroll.
  - show `Load more` only when user reaches the bottom of the page (or near-bottom threshold), while `nextUrl` exists.
  - add scroll-position state/effect (or `IntersectionObserver` sentinel near footer) to control `Load more` button visibility.
  - keep loading/disabled logic intact (`loadingMore`, `nextUrl`) and ensure no duplicate loads.
  - add/adjust `FeedPage.test.jsx` coverage for:
    - no internal feed scroll class regression
    - load-more hidden before bottom, visible at bottom with paginated data.