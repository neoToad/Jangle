## Next
- None.

## Completed
- Implemented sidebar chat Prompt 7 (final regression + docs):
  - ran focused backend chat tests for models, serializers, views, and consumers.
  - ran focused frontend chat tests for chat service and `Layout` integration.
  - attempted full-suite regressions:
    - backend full pytest run passed.
    - frontend full Vitest run has 2 failures in `src/pages/FeedPage.test.jsx` (outside chat scope).
  - added concise chat contract docs in `docs/CHAT_API.md`.
  - updated `README.md` and `docs/FRONTEND_UI_NOTES.md` to reflect persisted real-time sidebar chat behavior.
  - marked Prompt 7 complete in `docs/SIDEBAR_CHAT_IMPLEMENTATION_PLAN.md` on 2026-05-22.

## Tests
- `python -m pytest backend/chat/test_models.py backend/chat/test_serializers.py backend/chat/test_views.py backend/chat/test_consumers.py -v` (pass: 18 passed).
- `npm test -- --run src/lib/chat.test.js src/components/Layout.test.jsx` (pass: 26 passed).
- `python -m pytest -q` in `backend/` (pass: 173 passed).
- `npm test -- --run` in `frontend/` (fails: 2, pass: 112).

## Blockers
- Frontend full-suite failures outside chat scope:
  - `src/pages/FeedPage.test.jsx` -> `syncs active tab from URL and responds to browser back/forward`
  - `src/pages/FeedPage.test.jsx` -> `shows tab-specific empty-state copy`
