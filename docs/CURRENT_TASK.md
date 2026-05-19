## Next
- Implement `comment_count` in backend `PostSerializer` and feed queryset path to satisfy new serializer contract tests.
- Add feed/list regression coverage for `comment_count` payload exposure and non-zero UI rendering.

## Completed
- Added phase 1 adapter tests in `frontend/src/adapters/posts.test.js`:
  - uses backend `comment_count` when present.
  - falls back to `0` only when the field is absent.
- Added phase 2 serializer tests in `backend/posts/test_serializers.py`:
  - serializer includes `comment_count`.
  - `comment_count` excludes removed comments.
  - `comment_count` includes replies (all-comment policy).
- Marked phase 1 and phase 2 complete in `docs/FEED_COMMENT_COUNT_FIX_PLAN.md` on 2026-05-19.

## Tests
- `npm run test -- --run src/adapters/posts.test.js` (pass: 9 tests).
- `DJANGO_SETTINGS_MODULE=core.settings_test python manage.py test posts.test_serializers -v 2` (fails as expected for phase 2):
  missing `comment_count` in serializer output (1 failure, 2 errors).

## Blockers
- Backend prompt 3 (`comment_count` implementation) is not done yet, so phase 2 tests remain intentionally red.
