## Next
- Prompt 2 in `docs/FEED_MEDIA_INTERACTION_PLAN.md`: add failing `PostCard` tests for YouTube inline toggle/open/collapse/fallback and implement minimal behavior.
- Prompt 3 in `docs/FEED_MEDIA_INTERACTION_PLAN.md`: add safe YouTube URL parsing helper tests and implementation.
- Prompt 4 in `docs/FEED_MEDIA_INTERACTION_PLAN.md`: implement deterministic game `Play Now` behavior with tests.

## Completed
- Prompt 1 complete from `docs/FEED_MEDIA_INTERACTION_PLAN.md`.
- Added failing-first adapter tests in `frontend/src/adapters/posts.test.js` for:
  - YouTube canonical media fields.
  - Game file playable URL/metadata fields.
  - Null-safe defaults for non-media posts.
- Updated `frontend/src/adapters/posts.js` `mapFeedPost` to include:
  - `mediaKind`, `mediaUrl`
  - `youtubeUrl`
  - `gameFileUrl`, `gameFileName`, `gameFileSize`

## Tests
- `npm run test -- --run src/adapters/posts.test.js` (outside sandbox):
  - Verified failing state first: 3 failing tests for missing media fields.
  - After implementation: passing (7 passed).

## Blockers
- None.
