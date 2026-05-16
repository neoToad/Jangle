## Next
- No immediate follow-up for this bugfix.

## Completed
- Implemented feed scroll and load-more behavior fixes in `frontend/src/pages/FeedPage.jsx`:
  - removed internal feed scroll container classes (`max-h-[65vh] overflow-y-auto pr-1`) so scrolling is page-level and scrollbar stays at viewport right edge.
  - added near-bottom detection state (`isNearBottom`) using window scroll/resize listeners.
  - gated `Load more` visibility behind both `nextUrl` and near-bottom state.
  - preserved existing pagination guards (`!nextUrl || loadingMore`) and disabled/loading button behavior.
- Added TDD coverage in `frontend/src/pages/FeedPage.test.jsx`:
  - confirms no internal feed scroll container regression.
  - confirms `Load more` stays hidden before bottom and appears at bottom when paginated data exists.
- Identified root causes for new feed UX issues:
  - feed area has its own scroll container (`max-h-[65vh] overflow-y-auto`), which pulls the scrollbar into the feed region instead of page-right.
  - `Load more` is rendered whenever `nextUrl` exists, regardless of user scroll position.
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
- `npm test -- --run src/pages/FeedPage.test.jsx` (passed: 10 tests).
- `npm test -- --run` (passed: 8 files, 47 tests).
- `npm test -- --run src/pages/FeedPage.test.jsx` (passed: 8 tests).
- `npm test -- --run` (passed: 8 files, 45 tests).
- Existing non-blocking warnings remain:
  - React Router future flags
  - prior `act(...)` warning in `PostDetailPage` websocket test

## Blockers
- None for this change.
