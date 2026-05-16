## Next
- Run full frontend auth suite (`AuthFlow`, `LoginPage`, `RegisterPage`) to check for regressions after login contract alignment.
- Optionally improve backend/UX messaging consistency for invalid email vs invalid credentials.

## Completed
- Updated login request contract to match backend JWT expectations: send `email` + `password` to `/api/auth/token/`.
- Updated login form UI from `Email or username` to `Email`, including required-field validation messaging.
- Kept backend failure reason rendering (`non_field_errors` and `detail`) in place for better login error feedback.
- Added/updated login tests first, confirmed failure, then implemented minimal code to pass.

## Tests
- `npm test -- LoginPage.test.jsx --run` (frontend): passing (5/5).
- Coverage includes required-field behavior, submit/loading, success redirect, `non_field_errors`, and backend `detail` rendering.
- Verified test contract now asserts `email` is sent in login payload.

## Blockers
- None for login contract alignment; remaining work is broader auth-flow regression coverage.
