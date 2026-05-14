## Next
- Add DRF endpoints/serializers for chat room history retrieval.
- Add pagination and ordering controls for room message history.
- Add authorization rules for post-bound chat rooms (private/public behavior).
- Add consumer test coverage for malformed JSON and invalid JWT tokens.
- Wire frontend chat client to `ws/chat/<room_name>/?token=<access_jwt>`.

## Completed
- Added `ChatRoom` model in `chat` with:
- `name` (`CharField`, unique)
- `post` (`OneToOneField` to `posts.Post`, nullable, `SET_NULL`)
- `created_at` (`DateTimeField(auto_now_add=True)`)
- Added `ChatMessage` model in `chat` with:
- `room` (`ForeignKey` to `ChatRoom`)
- `author` (`ForeignKey` to `users.User`)
- `body` (`TextField`)
- `created_at` (`DateTimeField(auto_now_add=True)`)
- Added JWT-authenticated websocket consumer behavior:
- Requires `token` query param with SimpleJWT access token.
- Resolves room by URL name and joins `chat_<room_name>` group.
- Persists each incoming message to `ChatMessage`.
- Broadcasts message payload to all room subscribers.
- Updated websocket route to `ws/chat/<room_name>/` via `chat/routing.py`.
- Generated migration: `chat/migrations/0001_initial.py`.

## Tests
- Added model tests in `chat/test_models.py` for room/message creation and relations.
- Added websocket consumer tests in `chat/test_consumers.py` for:
- JWT-required connection behavior.
- Broadcast payload correctness.
- DB persistence of incoming messages.
- Verified with:
- `python -m pytest chat/test_models.py chat/test_consumers.py`
- Result: 5 passed, 0 failed.

## Blockers
- None
