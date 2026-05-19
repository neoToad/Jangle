## Next
- Fix feed comment count contract mismatch by adding backend `comment_count` and wiring frontend mapping/tests.

## Completed
- Prompt 8 complete from `docs/FEED_MEDIA_INTERACTION_PLAN.md`.
- Updated `frontend/src/components/PostCard.test.jsx` with failing-first UX polish coverage for:
  - compact loading and recovery copy for inline YouTube playback.
  - compact loading and recovery copy for inline game launch.
  - concise helper text for inline vs new-tab media launch modes.
- Updated `frontend/src/components/PostCard.jsx` to polish media UX while preserving existing interaction behavior:
  - inline YouTube toggle now initializes compact loading state (`Loading video...`).
  - inline game toggle now initializes compact loading state (`Opening game...`).
  - inline YouTube panel includes persistent recovery fallback (`If it fails, open on YouTube.`).
  - inline game panel includes persistent recovery fallback (`If it fails, open in a new tab.`).
  - game cards with external URLs now show concise helper copy (`Launches in a new tab.`).
  - YouTube cards with embeddable URLs now show concise helper copy (`Inline playback in card.`).
- Documented supported media behaviors and constraints in `README.md` under `Feed Media Behavior`.
- Marked prompt 8 as complete in `docs/FEED_MEDIA_INTERACTION_PLAN.md`.

## Tests
- `npm run test -- --run src/components/PostCard.test.jsx` (outside sandbox): passing (16 passed).
- `npm run test -- --run src/pages/FeedPage.test.jsx` (outside sandbox): passing (13 passed).

## Blockers
- None.
