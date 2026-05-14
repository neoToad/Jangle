## Next
- Wire post card clicks in feed to navigate to `/post/:id`.
- Add comment delete/reply UI controls and corresponding interaction tests.
- Add chat history fetch endpoint/UI if persistent history is required on page load.
- Run full frontend Vitest suite after post detail stabilization.

## Completed
- Added frontend TDD coverage for post detail behavior in `frontend/src/pages/PostDetailPage.test.jsx`.
- Added test cases for rendering full post content, nested threaded replies, comment submission, and WebSocket send/receive.
- Implemented `PostDetailPage` data loading from `/api/posts/:id/` and `/api/interactions/posts/:id/comments/`.
- Replaced placeholder post panel with full post title/body rendering.
- Implemented threaded comments UI with recursive nested reply rendering.
- Implemented authenticated comment form posting to `/api/interactions/posts/:id/comments/` and comment list refresh.
- Implemented live chat panel bound to room `post-<id>` over `ws/chat/<room_name>/` with JWT query token.
- Implemented real-time incoming message rendering and authenticated message sending.
- Added chat/login guard messaging for unauthenticated users.
- Installed frontend dependencies in `frontend/`.
- Fixed Vitest setup by enabling global test APIs in `frontend/vite.config.js` (`test.globals = true`).
- Added missing standard Node/frontend ignore paths in `.gitignore` (`node_modules/`, npm/yarn/pnpm debug logs, `.eslintcache`, `*.tsbuildinfo`).

## Tests
- Added `frontend/src/pages/PostDetailPage.test.jsx`.
- Ran `npm test -- PostDetailPage.test.jsx --run`.
- Result: `1 passed` test file, `3 passed` tests in `src/pages/PostDetailPage.test.jsx`.
- No tests required for `.gitignore` update.
- Backend tests were not modified or executed in this task.

## Blockers
- None.
