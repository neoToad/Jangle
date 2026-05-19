## Next
- Fix feed comment count contract mismatch by adding backend `comment_count` and wiring frontend mapping/tests.
- Implement functional sidebar chat in `frontend/src/components/Layout.jsx` backed by REST history + websocket updates, with TDD coverage.

## Completed
- Fixed profile 404 when navigating from header `View profile` by resolving `/api/profiles/me/` to the authenticated user in backend profile lookup.
- Implemented backend profile contract with tests in `backend/users/test_models.py`, `backend/users/test_serializers.py`, and `backend/users/test_views.py`.
- Added backend profile APIs for `/api/profiles/:username/` and `/api/profiles/:username/follow/`, including follow relationship constraints and migration `backend/users/migrations/0002_follow_user_following_and_more.py`.
- Expanded profile page post-MVP behavior in `frontend/src/pages/ProfilePage.jsx` with tabs, edit-own-profile flow, and follow/unfollow actions plus frontend tests.
- Marked `docs/PROFILE_PLAN.md` Phase 3 and Phase 4 as completed on 2026-05-19.
- Implemented profile menu MVP in `frontend/src/components/Layout.jsx` with accessible semantics, keyboard support, outside-click/Escape close, and auth-aware menu items.
- Implemented profile page MVP in `frontend/src/pages/ProfilePage.jsx` with fetch-backed loading, success, not-found, and generic error states.
- Added/updated frontend tests first for profile menu and profile page behavior in `frontend/src/components/Layout.test.jsx` and `frontend/src/pages/ProfilePage.test.jsx`.
- Marked `docs/PROFILE_PLAN.md` Phase 1 and Phase 2 as completed on 2026-05-19.
- Pruned `docs/jangle-planning.md` to remove completed foundational planning content.
- Reframed planning doc as an active list of unfinished priorities.
- Preserved remaining high-impact workstreams: feed behavior, chat, profile, post-detail parity, QA, and docs decisions.

## Tests
- `npm run test -- --run src/components/Layout.test.jsx src/pages/ProfilePage.test.jsx` (pass: 18 tests).
- `npm run test -- --run src/pages/ProfilePage.test.jsx` (pass: 7 tests).
- `DJANGO_SETTINGS_MODULE=core.settings_test python manage.py test users.test_models users.test_serializers users.test_views -v 2` (pass: 39 tests).
- `DJANGO_SETTINGS_MODULE=core.settings_test python manage.py test users.test_views.PublicProfileViewTest -v 2` (pass: 5 tests).

## Blockers
- None.
