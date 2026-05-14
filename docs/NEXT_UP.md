# Next Up: Auth Foundations

## Goal
Set up login and register pages and wire full authentication functionality between React frontend and Django backend.

## Scope
- Create `LoginPage` UI (email/username + password form, validation, submit states).
- Create `RegisterPage` UI (username, email, password, confirm password, validation, submit states).
- Add frontend auth API client methods for register/login requests.
- Persist auth tokens in frontend auth state/storage.
- Handle success flows (redirect to feed/profile) and failure flows (field + non-field errors).
- Add route guards for protected pages and guest-only guard for login/register.
- Add logout action and UI entry point.
- Confirm backend auth endpoints/contracts and adjust serializers/views if needed.
- Add/verify CORS and CSRF/JWT settings for local dev.

## TDD Plan
1. Add failing frontend tests for login page behavior.
2. Add failing frontend tests for register page behavior.
3. Add failing integration-level auth flow tests (store/token/redirect).
4. Implement minimal auth page/components/services to pass tests.
5. Add/adjust backend tests (`test_views.py`, `test_serializers.py`) if endpoint behavior changes.
6. Refactor while keeping all tests green.

## Done Criteria
- Users can register from UI and receive clear error feedback.
- Users can log in from UI and remain authenticated on refresh.
- Protected routes require authentication.
- Logout clears auth state and returns user to guest-safe route.
- Frontend and backend auth tests pass.
