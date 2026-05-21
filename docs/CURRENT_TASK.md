## Next
- Run broader frontend regression suite after post-detail style parity completion.
- Decide whether to resolve or defer existing FeedPage `act(...)` warning noise in Vitest output.

## Completed
- Implemented phase 3 backend work for feed comment counts:
  - added `comment_count` to `PostSerializer` output.
  - added serializer fallback counting for non-annotated usage.
  - annotated `PostViewSet` queryset with filtered comment count to avoid list N+1 counting.
- Implemented phase 4 adapter hardening confirmation:
  - verified adapter already consumes `comment_count` as primary source.
- Added regression coverage in `backend/posts/test_views.py`:
  - list payload includes `comment_count` and excludes removed comments from the total.
- Implemented phase 5 integration/regression validation:
  - confirmed feed test coverage renders non-zero comment totals (`Comments 3`, `Comments 2`) from API payload in `frontend/src/pages/FeedPage.test.jsx`.
  - confirmed `PostCard` interaction regression suite remains green.
- Implemented phase 6 performance/correctness validation:
  - added backend query-capture test ensuring comment-table queries remain bounded (no per-post query explosion).
  - added backend flow test confirming list `comment_count` updates from `0` to `1` after creating a comment and re-fetching feed.
  - validated zero-comment rendering remains covered (`Comments 0`) in feed tests.
- Updated `docs/FEED_COMMENT_COUNT_FIX_PLAN.md` to mark prompts 3 and 4 completed on 2026-05-21.
- Updated `docs/FEED_COMMENT_COUNT_FIX_PLAN.md` to mark prompts 5 and 6 completed on 2026-05-21.

## Tests
- `DJANGO_SETTINGS_MODULE=core.settings_test python manage.py test posts.test_views.PostListCreateViewTest -v 2` (initial run: failed as expected for overly strict query bound, then fixed).
- `DJANGO_SETTINGS_MODULE=core.settings_test python manage.py test posts.test_views posts.test_serializers -v 2` (pass: 37 tests).
- `npm run test -- --run src/pages/FeedPage.test.jsx src/components/PostCard.test.jsx` (pass: 30 tests).

## Blockers
- None for phases 5-6 completion.
