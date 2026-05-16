# Sidebar Chat Implementation Plan

## Goal
- Replace sidebar chat mock behavior with a functional, persisted, real-time chat experience.
- Keep implementation TDD-first across Django/DRF/Channels and React.

## Current State
- Sidebar chat in `frontend/src/components/Layout.jsx` uses in-memory state only.
- Initial chat messages are hardcoded mock entries.
- Send action appends local state only; there is no API call and no persistence.
- Mobile drawer and desktop sidebar share local chat state correctly.

## MVP Product Contract
- Room scope: one global room (`the-jangle`) for sidebar chat.
- Guests: can read history.
- Authenticated users: can send messages.
- Initial history comes from REST; live updates come from WebSocket.

## Prompt 1: Backend Chat Data + REST Contract (Tests First)
- Add failing tests split by file:
  - `test_models.py`: `ChatRoom`, `ChatMessage`, constraints, ordering.
  - `test_serializers.py`: message validation and payload shape.
  - `test_views.py`: history list endpoint, create endpoint, auth/permission behavior.
- Implement minimal models, serializers, views, and routes:
  - `GET /api/chat/rooms/<slug>/messages/`
  - `POST /api/chat/rooms/<slug>/messages/`
- Preserve pagination support for history.

## Prompt 2: WebSocket Consumer + Routing (Tests First)
- Add failing consumer/integration tests:
  - connection handling by auth policy.
  - broadcast delivery for new messages.
  - malformed payload safety behavior.
- Implement Channels consumer and routing:
  - `ws/chat/<room>/`
  - room-group join/leave lifecycle.
  - normalized outbound event shape matching REST serializer fields.

## Prompt 3: Frontend Chat Service Layer
- Add `frontend/src/lib/chat.js` with tests:
  - history fetch helper.
  - message post helper.
  - websocket connector helper.
- Ensure URL construction and payload normalization are centralized.

## Prompt 4: Layout Integration (Tests First)
- Add failing tests in `frontend/src/components/Layout.test.jsx`:
  - history loads on mount.
  - loading/error/empty states render correctly.
  - send posts to backend and clears input on success.
  - incoming websocket messages render in both desktop/mobile chat contexts.
  - guest send behavior follows contract.
- Replace mock-only message flow in `Layout.jsx` with service-backed state.

## Prompt 5: Reliability + UX Hardening
- Add tests and implementation for:
  - reconnect backoff on websocket disconnect.
  - stale/double message deduplication (optimistic + echo safety).
  - stable chronological ordering.
  - optional “load older” pagination behavior.
- Replace static “12 Janglers online” copy unless real presence is implemented.

## Prompt 6: Security and Rate-Limit Baseline
- Enforce backend validation limits on message content/length.
- Add per-user rate limiting for message creation paths.
- Ensure permission checks match guest/read and auth/write contract.

## Prompt 7: Final Regression + Docs
- Run focused frontend and backend chat tests, then full suite if feasible.
- Add concise API and websocket docs for chat endpoints/events.
- Update project docs to indicate sidebar chat is now persisted and real-time.

## Definition of Done
- Sidebar chat loads persisted history from backend.
- Authenticated users can send messages; guest behavior is explicit and tested.
- New messages arrive in real time via websocket.
- Desktop sidebar and mobile drawer show synchronized chat state.
- Chat-related frontend/backend tests pass.
- Tracking docs (`docs/CURRENT_TASK.md`, `docs/TODO.md`) stay current.
