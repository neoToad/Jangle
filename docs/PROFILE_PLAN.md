# Profile Menu + Profile Page Plan

## Goal
- Fix the non-functional header profile button.
- Define a clear MVP for profile navigation and profile page behavior.

## Current State
- `Open profile menu` button exists in `frontend/src/components/Layout.jsx`.
- Button has no click handler, no open state, and no menu content.
- `frontend/src/pages/ProfilePage.jsx` is a placeholder header only.
- Protected route already exists at `/profile/:username`.

## Phase 1: Profile Menu MVP (Header) - Completed (2026-05-19)
- Add tests first in `frontend/src/components/Layout.test.jsx`:
  - opens menu on click/keyboard.
  - closes on outside click and `Escape`.
  - exposes `aria-expanded` and menu semantics.
  - renders auth-aware items.
  - navigates to `/profile/:username` for authenticated users.
- Implement minimal menu state and handlers in `Layout.jsx`.
- Menu item behavior:
  - Authenticated: `View profile`, `Settings` (placeholder), `Log out`.
  - Guest: `Log in`, `Register`.

## Phase 2: Profile Page MVP - Completed (2026-05-19)
- Add tests first for `frontend/src/pages/ProfilePage.jsx`:
  - loading state.
  - successful profile render.
  - not-found state.
  - generic error state.
- Implement fetch-backed profile UI with stable loading/error patterns.
- MVP data fields:
  - `username`, `display_name`, `bio`, `avatar`, `post_count`, `follower_count`, `following_count`.

## Phase 3: Backend Profile Contract
- Add/confirm Django + DRF tests first:
  - `test_models.py`: profile field constraints/defaults.
  - `test_serializers.py`: output shape and validation.
  - `test_views.py`: profile read endpoint, permissions, 404 behavior.
- Implement minimal endpoint to satisfy frontend contract.

## Phase 4: Profile Expansion (Post-MVP)
- Profile tabs (posts and replies/likes if in scope).
- Edit-own-profile flow.
- Follow/unfollow if social graph is prioritized.
- Performance refinements (pagination/cache).

## Definition of Done (MVP)
- Profile button opens a working accessible menu.
- Menu routes/actions work for guest and authenticated states.
- `/profile/:username` renders real user data and robust error states.
- All related frontend and backend tests pass.
