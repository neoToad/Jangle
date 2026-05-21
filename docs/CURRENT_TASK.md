## Next
- Validate query-count impact for feed endpoint after comment_count annotation (phase 6).
- Verify count refresh behavior after comment creation in post detail then feed reload (phase 6).
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
- Updated `docs/FEED_COMMENT_COUNT_FIX_PLAN.md` to mark prompts 3 and 4 completed on 2026-05-21.

## Tests
- `DJANGO_SETTINGS_MODULE=core.settings_test python manage.py test posts.test_serializers posts.test_views -v 2` (pass: 35 tests).
- `npm run test -- --run src/adapters/posts.test.js src/pages/FeedPage.test.jsx` (pass: 22 tests).

## Blockers
- None for phases 3-4 completion.
