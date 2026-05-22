## Next
- Implement sidebar chat Prompt 3 in `frontend/src/lib/chat.js` with Vitest coverage for history fetch, message post, and websocket helper.
- Implement sidebar chat Prompt 4 in `frontend/src/components/Layout.jsx` and `Layout.test.jsx` for mount history load, send flow, guest behavior, and websocket updates.
- Re-run backend feed tests for prompts 7-8 once local DB host `db` is reachable.
- Re-run frontend `FeedPage.test.jsx` once Vitest config path access issue is resolved in this sandbox.

## Completed
- Implemented sidebar chat Prompt 1 (backend REST contract) with TDD:
  - added/updated chat model tests for room uniqueness and message ordering.
  - added serializer tests for validation and payload shape.
  - added view tests for guest history list, authenticated create, and missing-room 404.
  - implemented `GET/POST /api/chat/rooms/<slug>/messages/` with paginated list/create behavior.
- Implemented sidebar chat Prompt 2 (websocket consumer + routing) with TDD:
  - added consumer tests for guest connection policy, authenticated broadcast/persist behavior, and malformed payload safety.
  - updated websocket routing to `ws/chat/<room>/`.
  - updated consumer outbound event payload to match REST serializer fields.
- Updated `docs/SIDEBAR_CHAT_IMPLEMENTATION_PLAN.md` to mark Prompts 1 and 2 completed on 2026-05-22.

## Tests
- `python -m pytest backend/chat/test_models.py backend/chat/test_serializers.py backend/chat/test_views.py backend/chat/test_consumers.py` (pass: 15 passed).

## Blockers
- Backend feed regression commands that use default settings remain blocked when PostgreSQL host `db` is not reachable.
- Frontend Vitest startup path access issue in this sandbox still blocks some frontend regressions.
