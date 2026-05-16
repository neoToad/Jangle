## Next
- Prompt 10: wire sidebar `The Jangle` chat panel to a backend endpoint once `api/chat/` routes are implemented.
- Add empty-feed UI copy for successful API responses with zero posts.
- Run full frontend suite (`npm test -- --run`) after next prompt integration.

## Completed
- Implemented Prompt 9 with TDD-first workflow: feed now renders from DRF `/api/posts/` data without seeded fallback.
- Added adapter isolation in `frontend/src/adapters/posts.js`:
- `mapFeedPostType` for backend-to-UI variant mapping (`text/writing`, `youtube`, `file/game`).
- `mapFeedPost` for stable PostCard contract mapping.
- `selectFeedItems` and `selectFeedNext` selectors to isolate API response shape.
- Refactored `FeedPage` to consume adapter/selectors and preserve existing visual treatments.
- Added loading, success, and error path coverage in `FeedPage.test.jsx` using API mocks.
- Added mapper unit tests in `frontend/src/adapters/posts.test.js` for conversion logic and mapped shape.
- Verified failing test first (seeded fallback on error), then implemented minimal code to pass.

## Tests
- `npm test -- --run FeedPage.test.jsx src/adapters/posts.test.js` (failed first: missing adapter module and seeded fallback on error).
- `npm test -- --run FeedPage.test.jsx src/adapters/posts.test.js` (passed: 2 files, 8 tests).

## Blockers
- No blocker for Prompt 9 feed integration.
- Backend `api/chat/` HTTP endpoint is currently empty; only websocket chat is available in post detail.
