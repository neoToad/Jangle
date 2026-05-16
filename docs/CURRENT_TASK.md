## Next
- Implement profile menu behavior in `frontend/src/components/Layout.jsx` with TDD in `frontend/src/components/Layout.test.jsx`.
- Build profile page MVP states in `frontend/src/pages/ProfilePage.jsx` with dedicated tests.
- Confirm backend profile API contract and required DRF tests split by file.

## Completed
- Investigated the non-working profile button path in frontend shell components.
- Confirmed root cause: the `Open profile menu` button currently has no state or click handler.
- Audited route wiring and verified protected profile route already exists at `/profile/:username`.
- Created planning document `docs/PROFILE_PLAN.md` covering:
  - profile menu MVP (accessibility + auth-aware actions).
  - profile page MVP (loading/success/not-found/error states).
  - backend profile contract expectations and test split.
  - post-MVP expansion scope.
- Moved unresolved next implementation work into `docs/TODO.md` under High Priority.

## Tests
- No tests run in this docs-only planning task.

## Blockers
- None for planning.
