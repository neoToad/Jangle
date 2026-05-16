# TODO

## High Priority
- Add comment reply/delete UI controls in post detail, with interaction tests.
- Add missing interaction 404 tests for non-existent or invalid reaction/vote targets.
- Add chat history retrieval endpoint and initial message fetch in UI so chat persists on page load.

## Medium Priority
- Run full backend test suite before next backend feature merge.
- Run full frontend Vitest suite after post-detail and chat follow-ups.
- Add targeted tests for auth store token lifecycle and refresh interceptor behavior.

## Admin / Moderation
- Add admin list filters for chat models (room, author, created date).
- Add admin actions for bulk message moderation (soft-delete/export).
- Consider `ordering` and `date_hierarchy` for chat admin if message volume grows.

## Docs / Decisions
- Update README/backend docs to reference `python manage.py seed_db` and `python manage.py seed_db --reset`.
- Decide whether to add a dedicated follow relationship model on `User` for social-graph seeding.
- Decide whether avatars should remain `ImageField`-backed files or move to a URL field.
- Add concise API docs/examples for reactions and votes payloads.
- Consider Docker Compose healthchecks for stronger startup readiness guarantees.
