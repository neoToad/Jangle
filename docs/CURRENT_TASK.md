## Next
- Prompt 8 in `docs/FEED_MEDIA_INTERACTION_PLAN.md`: UX polish and documentation for inline media behaviors.

## Completed
- Prompts 2-7 complete from `docs/FEED_MEDIA_INTERACTION_PLAN.md`.
- Added failing-first tests in `frontend/src/components/PostCard.test.jsx` for:
  - YouTube inline toggle open/collapse and invalid-link fallback.
  - game `Play Now` inline/new-tab/missing-url states.
  - iframe `sandbox`/`allow` guardrails and new-tab `rel` semantics.
- Added failing-first feed integration tests in `frontend/src/pages/FeedPage.test.jsx` for:
  - mapped YouTube/game media action states in feed cards.
  - vote/react/comment controls remaining functional with media interactions.
  - load-more rerender stability with mixed media cards.
- Added `frontend/src/utils/media.test.js` and implemented `frontend/src/utils/media.js`:
  - safe YouTube parsing for `watch`, `youtu.be`, `embed`.
  - rejects malformed/non-http(s)/non-YouTube URLs for embeds.
  - deterministic game launch policy (`inline` same-origin, otherwise `new-tab`).
- Updated `frontend/src/components/PostCard.jsx` with real media behavior:
  - `isYouTubeOpen` and `isGameOpen` local state.
  - inline YouTube iframe rendering and collapse behavior.
  - game inline iframe for safe same-origin URLs.
  - external game launch via secure link attributes.
- Tightened backend post contract in `backend/posts/serializers.py`:
  - YouTube posts require a YouTube-domain URL.
  - game file posts require `file` on create/update payloads.
- Added backend coverage in `backend/posts/test_serializers.py` and `backend/posts/test_views.py` for invalid YouTube URL and missing game file rejection.

## Tests
- `npm run test -- --run src/components/PostCard.test.jsx src/utils/media.test.js` (outside sandbox):
  - Verified failing state first after adding tests.
  - After implementation: passing (20 passed).
- `npm run test -- --run src/pages/FeedPage.test.jsx` (outside sandbox): passing (13 passed).
- `python manage.py test posts.test_serializers posts.test_views --settings=core.settings_test -v 2`: passing (31 passed).

## Blockers
- None.
