## Next
- Prompt 11: wire sidebar `The Jangle` chat panel to backend `api/chat/` endpoint when HTTP routes are implemented.
- Add empty-feed UI copy for successful API responses with zero posts.
- Align post-detail interactions with feed-card local reaction/vote behavior.

## Completed
- Implemented Prompt 10 final UI parity sweep against `docs/jangle-feed.jsx` and planning notes.
- Tightened fit-and-finish in shell/feed/card primitives (spacing rhythm, 20px card radii consistency, stronger muted text contrast token).
- Ensured core language appears in-product: `Janglers`, `Drops`, `The Jangle`, and `Shake it`.
- Refined feed heading language (`Drops` + `Latest from Janglers`) and create flow copy (`Create Drop`).
- Kept component boundaries clean: data mapping remains isolated in adapters while visual components remain API-shape agnostic.
- Removed dead hover class dependency from `PostCard` (`border-jangle-tint`) and kept hover styling via stable shadow + inline border color.
- Added short developer documentation for theme tokens and component responsibilities in `docs/FRONTEND_UI_NOTES.md`.
- Refreshed tests for intentional polish changes (copy/behavior assertions in `FeedPage.test.jsx`, `Layout.test.jsx`, `PostCard.test.jsx`).

## Tests
- `npm test -- --run` (passed: 8 files, 43 tests).
- Existing non-blocking warnings remain: React Router future flags and prior `act(...)` warning in `PostDetailPage` websocket test.

## Blockers
- No blocker for Prompt 10 UI polish.
- Backend `api/chat/` HTTP endpoint still not implemented for sidebar chat history wiring.
