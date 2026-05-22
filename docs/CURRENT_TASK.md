## Next
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
- Implemented sidebar chat Prompt 3 (frontend chat service layer) with TDD:
  - added `frontend/src/lib/chat.js` helpers for history fetch, message post, and websocket connection.
  - normalized REST/websocket payloads into a single message shape.
  - added `frontend/src/lib/chat.test.js` for URL construction and helper behavior.
- Implemented sidebar chat Prompt 4 (Layout integration) with TDD:
  - replaced mock-only sidebar chat state in `Layout.jsx` with REST history + websocket updates.
  - added loading/error/empty chat UI states.
  - enforced guest read/authenticated send behavior and backend-backed send flow.
  - expanded `Layout.test.jsx` coverage for mount history load, send, websocket, and guest contract.
- Updated `docs/SIDEBAR_CHAT_IMPLEMENTATION_PLAN.md` to mark Prompts 3 and 4 completed on 2026-05-22.

## Tests
- `python -m pytest backend/chat/test_models.py backend/chat/test_serializers.py backend/chat/test_views.py backend/chat/test_consumers.py` (pass: 15 passed).
- `npm test -- --run src/lib/chat.test.js src/components/Layout.test.jsx` (pass: 21 passed).

## Blockers
- Backend feed regression commands that use default settings remain blocked when PostgreSQL host `db` is not reachable.
- Frontend `FeedPage.test.jsx` remains pending due to sandbox path access issue outside this task scope.
