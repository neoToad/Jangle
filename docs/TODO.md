# TODO

## High Priority
- Run `docs/COMMENTS_DISPLAY_PLAN.md` step 6 backend verification via `docker compose exec backend ...` command path.
- Complete `docs/COMMENTS_DISPLAY_PLAN.md` steps 7-8 (backend refactor/perf pass and final workflow closeout).
- Run broader frontend regression suite after post-detail style parity completion.
- Decide whether to resolve or defer FeedPage Vitest `act(...)` warnings in `frontend/src/pages/FeedPage.test.jsx`.
- Define and implement guest behavior policy for `Following` tab (login-gated vs explore-fallback) with matching frontend/backend tests.
- Re-run backend feed mode tests for prompts 3-6 after database host `db` is reachable in local test environment.
- Re-run backend feed mode tests for prompts 7-8 after database host `db` is reachable in local test environment.
- Prompt 6: align post-detail interactions with new feed-card local reaction/vote behavior.
- Add focused tests for comment action click-through behavior once post-detail footer wiring lands.
- Add comment reply/delete UI controls in post detail, with interaction tests.
- Add missing interaction 404 tests for non-existent or invalid reaction/vote targets.
- Resolve React Testing Library `act(...)` warning in `src/pages/PostDetailPage.test.jsx` websocket message test.

## Medium Priority
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
