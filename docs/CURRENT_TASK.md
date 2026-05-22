## Next
- None.

## Completed
- Implemented sidebar chat Prompt 5 (reliability + UX hardening) with TDD:
  - added websocket reconnect backoff behavior in `frontend/src/lib/chat.js`.
  - added message dedupe + stable chronological merge helper.
  - added optional paginated “load older messages” flow in `Layout.jsx`.
  - replaced static “12 Janglers online” copy with non-fake “Live chat” status text.
- Implemented sidebar chat Prompt 6 (security + rate-limit baseline) with TDD:
  - enforced backend message length validation (`<= 500` chars) in chat serializer.
  - added per-user chat message rate limiting utility shared by REST and websocket creation paths.
  - enforced rate limits in `RoomMessageListCreateView` and `ChatConsumer` while preserving guest read/auth write contract.
- Marked prompts 5 and 6 complete in `docs/SIDEBAR_CHAT_IMPLEMENTATION_PLAN.md` on 2026-05-22.

## Tests
- `python -m pytest backend/chat/test_serializers.py backend/chat/test_views.py backend/chat/test_consumers.py` (pass: 12 passed).
- `npm test -- --run src/lib/chat.test.js src/components/Layout.test.jsx` (pass: 26 passed).

## Blockers
- Backend feed regression commands that use default settings remain blocked when PostgreSQL host `db` is not reachable.
- Frontend `FeedPage.test.jsx` remains pending due to sandbox path access issue outside this task scope.
