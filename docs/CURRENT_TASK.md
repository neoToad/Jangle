## Next
- Start Prompt 4: add type-specific preview strips for game and video posts while preserving the reusable `PostCard` contract.
- Add tests for conditional strip rendering by post type and game CTA presence.
- Decide whether to move feed seed/mapping helpers into a dedicated module before Prompt 4 to keep `FeedPage` lean.
- Refine seeded avatar display (currently placeholder-safe) when unicode handling is standardized in this shell.

## Completed
- Implemented Prompt 3 with TDD by introducing a reusable `PostCard` component and wiring feed rendering through it.
- Added shared card structure in `PostCard`: avatar, author, timestamp, type badge/icon, title link, description, and footer actions.
- Added Jangle card styling treatment: `20px` rounded corners, border, hover tint based on post color, and glow/elevation shadow transitions.
- Added post type label/icon mapping in card API: `GAME`, `WRITING`, `VIDEO`.
- Added realistic seeded feed data aligned to planning docs and fallback rendering when API list is empty.
- Added API-to-UI normalization mapper in `FeedPage` so backend records render through one `PostCard` prop contract.

## Tests
- `npm test -- --run src/components/PostCard.test.jsx` (failed first before component existed, then passed after implementation).
- `npm test -- --run src/pages/FeedPage.test.jsx` (passed after `PostCard` integration).
- `npm test -- --run` (full frontend suite passed: 7 files, 26 tests).

## Blockers
- No blockers for Prompt 3 implementation.
- Existing non-blocking warnings remain: React Router future flags and prior `act(...)` warning in `PostDetailPage` tests.
