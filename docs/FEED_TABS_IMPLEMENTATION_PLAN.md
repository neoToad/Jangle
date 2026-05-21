# Feed Tabs Implementation Plan

## Goal
- Turn `Following`, `Explore`, and `Games` into real feed modes with backend-backed data behavior.
- Keep implementation strictly TDD-first across frontend and backend.

## Current State
- Tabs exist in `frontend/src/pages/FeedPage.jsx` and only toggle local active styling.
- Current tests verify visual active-tab switching, not tab-specific data fetching.
- Feed API path is currently generic (`/api/posts/`) without tab semantics in UI logic.

## Prompt 1: Frontend Tab Contract (Tests First)
Status: Completed on 2026-05-21
- Add failing tests in `frontend/src/pages/FeedPage.test.jsx`:
  - default selected tab is `Following`.
  - each tab triggers a fetch using tab-specific query params.
  - tab switch resets pagination and replaces post list (no cross-tab append).
  - active tab syncs with URL query (`?tab=following|explore|games`).
  - back/forward restores selected tab and corresponding fetch behavior.
- Implement minimal tab mapping and state reset logic in `FeedPage.jsx`.

## Prompt 2: Backend Feed Mode Contract (Tests First)
Status: Completed on 2026-05-21
- Add failing DRF tests (split by file):
  - `test_views.py`: `/api/posts/?feed=following|explore|games` behavior.
  - `test_serializers.py`: stable response shape across feed modes.
  - `test_models.py`: follow-model constraints only if model changes are required.
- Define explicit contract:
  - `following`: personalized feed from followed authors.
  - `explore`: discovery feed.
  - `games`: game-content feed.
  - invalid `feed` behavior explicitly tested (400 or fallback policy).
- Implement queryset branching while preserving pagination behavior.

## Prompt 3: Following Feed Semantics
- If follow relationship exists, integrate it into feed queryset.
- If missing, add follow model with:
  - `follower`, `following`, unique pair constraint.
  - self-follow prevention.
  - indexes for lookup performance.
- Add tests:
  - includes followed authors.
  - excludes non-followed authors.
  - authenticated vs guest behavior is explicit and consistent.

## Prompt 4: Explore Ranking
- Add failing tests that prove ranking intent (engagement + recency).
- Implement pragmatic v1 ordering with deterministic tie-breakers.
- Keep query efficient and add regression coverage for order stability.

## Prompt 5: Games Feed Filtering
- Add failing tests for inclusion/exclusion rules.
- Implement filter for game-relevant content (at minimum `post_type=file` + `file_type=game`).
- Validate same pagination/load-more behavior as other feed modes.

## Prompt 6: Frontend UX States Per Tab
- Add failing tests for tab-specific loading/error/empty states.
- Ensure stale responses from previous tabs do not overwrite active tab results.
- Ensure `Load more` continues using current tab parameters.
- Add tab-appropriate empty-state copy.

## Prompt 7: Auth + Fallback Policy
- Decide and test behavior for guest users on `Following`:
  - either force login CTA for following feed, or
  - auto-fallback to `Explore`.
- Implement chosen behavior consistently in UI and API expectations.

## Prompt 8: Hardening + Documentation
- Add regression tests for:
  - invalid feed params.
  - pagination boundaries/duplication.
  - race conditions on rapid tab switching.
- Add concise API docs for `feed` query options and expected semantics.

## Definition of Done
- Tabs trigger distinct backend queries and datasets.
- URL preserves/restores active tab state.
- Pagination/load-more remains isolated per tab.
- Frontend tests and backend split tests pass.
- `docs/CURRENT_TASK.md` and `docs/TODO.md` stay updated after each prompt.
