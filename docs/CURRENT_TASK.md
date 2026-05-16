## Next
- No immediate follow-up for this bugfix.
- Remaining backlog items are tracked in `TODO.md`.

## Completed
- Added failing tests in `frontend/src/pages/FeedPage.test.jsx` for:
  - create form hidden by default
  - click `+ Drop something` opens form
  - click `Cancel` hides form
- Implemented visibility state in `frontend/src/pages/FeedPage.jsx`:
  - added `isCreateOpen` state defaulting to `false`
  - wired `+ Drop something` CTA to open the form
  - conditionally renders `<CreatePostForm />` only when open
  - added `Cancel` button in `CreatePostForm`
  - closes form after successful submit and feed refresh
- Preserved existing auth behavior and feed loading behavior.

## Tests
- `npm test -- --run src/pages/FeedPage.test.jsx` (passed: 8 tests).
- `npm test -- --run` (passed: 8 files, 45 tests).
- Existing non-blocking warnings remain:
  - React Router future flags
  - prior `act(...)` warning in `PostDetailPage` websocket test

## Blockers
- None for this change.
