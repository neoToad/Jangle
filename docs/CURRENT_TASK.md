## Next
- None.

## Completed
- Added failing tests for loading/error state styling and mobile-safe control sizing in `frontend/src/pages/PostDetailPage.test.jsx`.
- Added failing tests for token-consistent empty states in comments/chat sections.
- Implemented explicit loading state in `frontend/src/pages/PostDetailPage.jsx` with token-consistent loading copy.
- Restyled error state to tokenized bordered alert classes (`border-jangle-accent/30`, `bg-jangle-accent/10`, `text-jangle-textMuted`).
- Added `min-h-11` to comment/chat submit controls and inputs for mobile-safe tap targets.
- Applied responsive spacing/form polish in post detail (`space-y-4 sm:space-y-6`, `p-3 sm:p-4`, chat form `flex-col sm:flex-row`) to keep small-screen layout stable.
- Added failing test coverage in `frontend/src/pages/PostDetailPage.test.jsx` for live chat shell/message-list/input/button token contracts.
- Confirmed new live chat assertions failed for legacy `bg-white` / `border-slate-*` classes before implementation.
- Replaced legacy live chat styles in `frontend/src/pages/PostDetailPage.jsx` with sidebar-consistent token classes for:
  - chat section shell
  - messages list panel
  - chat input control
  - send button control
- Preserved websocket send/receive behavior and auth gating; no logic changes to socket lifecycle or submit guards.
- Re-ran `PostDetailPage` tests to green after live chat restyle.
- Added failing test coverage in `frontend/src/pages/PostDetailPage.test.jsx` for comment cards and nested reply wrappers to enforce Jangle token classes.
- Replaced legacy comment card styling in `frontend/src/pages/PostDetailPage.jsx` from `slate` classes to token classes:
  - `bg-jangle-surface` / `bg-jangle-bg`
  - `border-jangle-border`
  - `text-jangle-textPrimary` / `text-jangle-textMuted`
- Preserved recursive nested reply markup (`CommentItem`) and improved nested readability using bordered tokenized reply wrappers.
- Restyled comment section heading/copy/input/button/empty state to Jangle token palette without changing behavior.
- Added detail data-to-UI parity adapter coverage in `frontend/src/adapters/posts.test.js`.
- Added `mapDetailPost` contract tests for feed-aligned fields: `type`, `author`, `avatar`, `time`, `title`, `description`, `reactions`, `votes`, `comments`, and `color`.
- Added fallback-value tests for detail mapping when optional API fields are absent.
- Extended `frontend/src/pages/PostDetailPage.test.jsx` to verify mapped metadata rendering (author/avatar/type label/time).
- Implemented shared detail view-model logic in `frontend/src/adapters/posts.js` via `mapDetailPost` and internal shared mapping base.
- Updated `frontend/src/pages/PostDetailPage.jsx` to render metadata using adapter output instead of ad-hoc field formatting.
- Kept API contract unchanged; only frontend adapter and presentation mapping were modified.

## Tests
- `npm run test -- --run src/pages/PostDetailPage.test.jsx` (outside sandbox): failing first after Prompt 7 test additions (missing loading state + missing `min-h-11` classes).
- `npm run test -- --run src/pages/PostDetailPage.test.jsx` (outside sandbox): passing after Prompt 7 implementation (11 passed).

## Blockers
- None.
