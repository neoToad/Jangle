# Feed Comment Count Fix Plan

## Goal
- Ensure feed cards display accurate comment totals instead of always showing `0`.
- Resolve the frontend/backend contract mismatch with TDD-first changes.

## Root Cause
- Frontend adapter maps `comments` from `post.comment_count`.
- Backend post serializer does not expose `comment_count`.
- Frontend fallback (`?? 0`) always applies, so every card shows `0`.

## Prompt 1: Frontend Contract Test (Fail First)
Status: Completed on 2026-05-19.
- Add failing tests in `frontend/src/adapters/posts.test.js` that prove:
  - `mapFeedPost` uses backend `comment_count` when present.
  - mapping supports agreed API key `comment_count` (no alias required in current contract).
  - fallback to `0` only when comment count field is truly absent.
- Confirm failure is due to backend payload mismatch.

## Prompt 2: Backend Serializer Contract Test (Fail First)
Status: Completed on 2026-05-19.
- Add failing tests in `backend/posts/test_serializers.py`:
  - serialized post includes `comment_count`.
  - count excludes removed comments if model semantics require it.
  - count reflects nested reply policy explicitly (all comments including replies).
- Keep policy explicit in tests to avoid future ambiguity.

## Prompt 3: Backend Implementation
- Add `comment_count` field to `PostSerializer`:
  - use annotation on queryset (`Count('comments', filter=...)`) or serializer method.
  - avoid N+1 query patterns for feed lists.
- Update `backend/posts/views.py` queryset to include annotation if chosen.
- Preserve existing response fields and pagination behavior.

## Prompt 4: Frontend Adapter Hardening
- Update `frontend/src/adapters/posts.js` only if needed for compatibility:
  - consume `comment_count` as primary source.
  - optional temporary alias support if multiple API shapes exist during rollout.
- Keep `comments` numeric and stable for `PostCard`.

## Prompt 5: Integration and Regression Tests
- Add/extend backend view tests (`backend/posts/test_views.py`) verifying list payload contains `comment_count`.
- Add feed page test in `frontend/src/pages/FeedPage.test.jsx` asserting rendered comment button reflects non-zero API value.
- Ensure existing `PostCard` interaction tests remain green.

## Prompt 6: Performance and Correctness Validation
- Validate query count for feed endpoint does not regress materially.
- Verify counts update after comment creation on detail page and subsequent feed refresh.
- Confirm behavior for posts with zero comments still renders `Comments 0`.

## Definition of Done
- Feed cards show correct comment totals from backend data.
- Backend API formally includes `comment_count`.
- Frontend adapter and feed tests protect against regression.
- Serializer/view tests pass with explicit comment-count semantics.
