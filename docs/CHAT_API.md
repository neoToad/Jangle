# Chat API and WebSocket Contract

## Sidebar Room Scope
- Sidebar chat uses one global room slug: `the-jangle`.
- History is persisted in backend storage and loaded through REST.
- Live message delivery is handled through Channels WebSocket events.

## REST Endpoints
- `GET /api/chat/rooms/<slug>/messages/`
  - Auth: guest and authenticated users allowed.
  - Response: paginated `results` array of chat messages in chronological order (oldest first).
  - Message fields: `id`, `room`, `author`, `author_username`, `body`, `created_at`.
- `POST /api/chat/rooms/<slug>/messages/`
  - Auth: authenticated users only.
  - Body: `{ "body": "message text" }`.
  - Success: `201` with serialized message payload.
  - Validation: blank body rejected; max length `500` chars.
  - Rate limit: per-authenticated-user throttle; overflow returns `429`.

## WebSocket Endpoint
- `ws/chat/<room>/`
  - Example: `/ws/chat/the-jangle/`
  - Guests may connect and receive broadcast messages.
  - Sending messages requires authenticated connection (`?token=<jwt_access_token>` in current implementation).

## WebSocket Event Shape
- Client send:
  - `{ "message": "hello world" }`
- Server broadcast event:
  - `{ "type": "chat.message", "message": { ...serialized_message_fields } }`
- Malformed payloads are ignored safely (no persistence, no broadcast).

## Behavior Summary
- Sidebar and mobile drawer consume shared chat state in frontend.
- New messages persist first, then broadcast to connected clients.
- Guest users can read history/live updates but cannot create messages.
