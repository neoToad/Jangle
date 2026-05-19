## Next
- Fix feed comment count contract mismatch by adding backend `comment_count` and wiring frontend mapping/tests.
- Implement functional sidebar chat in `frontend/src/components/Layout.jsx` backed by REST history + websocket updates, with TDD coverage.

## Completed
- Implemented profile menu MVP in `frontend/src/components/Layout.jsx` with accessible semantics, keyboard support, outside-click/Escape close, and auth-aware menu items.
- Implemented profile page MVP in `frontend/src/pages/ProfilePage.jsx` with fetch-backed loading, success, not-found, and generic error states.
- Added/updated frontend tests first for profile menu and profile page behavior in `frontend/src/components/Layout.test.jsx` and `frontend/src/pages/ProfilePage.test.jsx`.
- Marked `docs/PROFILE_PLAN.md` Phase 1 and Phase 2 as completed on 2026-05-19.
- Pruned `docs/jangle-planning.md` to remove completed foundational planning content.
- Reframed planning doc as an active list of unfinished priorities.
- Preserved remaining high-impact workstreams: feed behavior, chat, profile, post-detail parity, QA, and docs decisions.

## Tests
- `npm run test -- --run src/components/Layout.test.jsx src/pages/ProfilePage.test.jsx` (pass: 18 tests).

## Blockers
- None.
