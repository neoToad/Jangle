## Next
- None.

## Completed
- Completed `docs/COMMENTS_DISPLAY_PLAN.md` steps 6-8:
  - step 6 verification complete:
    - backend targeted interactions tests passed in Docker.
    - frontend related feed/detail tests passed.
    - broader backend pytest suite passed in Docker.
  - step 7 refactor/performance pass complete:
    - kept comment visibility + metadata behavior stable; existing backend query optimizations retained (`select_related`, deterministic ordering).
    - no additional structural refactor required after green regressions.
  - step 8 workflow updates complete:
    - updated `docs/CURRENT_TASK.md` and `docs/TODO.md`.
    - marked `docs/COMMENTS_DISPLAY_PLAN.md` fully complete on 2026-05-22.
- Implemented `docs/COMMENTS_DISPLAY_PLAN.md` steps 4-5 (frontend, TDD-first):
  - added failing PostDetailPage test coverage for comment username and posted time on parent and nested replies.
  - updated comment card rendering to show `author_username` and `created_at` date metadata.
  - reran targeted PostDetailPage Vitest suite to green.
- Marked steps 4-5 complete in `docs/COMMENTS_DISPLAY_PLAN.md` on 2026-05-22.
- Implemented `docs/COMMENTS_DISPLAY_PLAN.md` steps 1-3 (backend, TDD-first):
  - added serializer test coverage for `author_username` on comments.
  - added view tests for recursive reply visibility, comment metadata fields, and reply ordering contract.
  - updated `CommentSerializer` to include `author_username` and deterministic reply ordering.
  - updated comment list queryset to `select_related('author')` and deterministic top-level ordering.
- Marked steps 1-3 complete in `docs/COMMENTS_DISPLAY_PLAN.md` on 2026-05-22.
- Implemented sidebar chat Prompt 7 (final regression + docs):
  - ran focused backend chat tests for models, serializers, views, and consumers.
  - ran focused frontend chat tests for chat service and `Layout` integration.
  - attempted full-suite regressions:
    - backend full pytest run passed.
    - frontend full Vitest run is now passing after feed test expectation fixes.
  - added concise chat contract docs in `docs/CHAT_API.md`.
  - updated `README.md` and `docs/FRONTEND_UI_NOTES.md` to reflect persisted real-time sidebar chat behavior.
  - marked Prompt 7 complete in `docs/SIDEBAR_CHAT_IMPLEMENTATION_PLAN.md` on 2026-05-22.
- Fixed failing frontend tests in `src/pages/FeedPage.test.jsx` to match guest `Following` fallback contract:
  - expected guest `Following` fetch to use `/api/posts/?feed=explore`.
  - expected guest `Following` empty state to show explore copy.

## Tests
- `python backend/manage.py test interactions.test_serializers interactions.test_views -v 2` (blocked: DB host `db` not resolvable in this shell environment).
- `docker compose exec backend python manage.py test interactions.test_serializers interactions.test_views -v 1` (pass: 36 passed).
- `npm test -- --run src/pages/PostDetailPage.test.jsx` in `frontend/` (pass: 12 passed).
- `npm test -- --run src/pages/PostDetailPage.test.jsx src/pages/FeedPage.test.jsx` in `frontend/` (pass: 32 passed).
- `docker compose exec backend python -m pytest -q` (pass: 177 passed).
- `python -m pytest backend/chat/test_models.py backend/chat/test_serializers.py backend/chat/test_views.py backend/chat/test_consumers.py -v` (pass: 18 passed).
- `npm test -- --run src/lib/chat.test.js src/components/Layout.test.jsx` (pass: 26 passed).
- `python -m pytest -q` in `backend/` (pass: 173 passed).
- `npm test -- --run src/pages/FeedPage.test.jsx` in `frontend/` (pass: 20 passed).
- `npm test -- --run` in `frontend/` (pass: 114 passed).

## Blockers
- None.
