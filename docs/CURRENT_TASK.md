## Next
- Implement feed tabs Prompt 3 (`Following` guest/auth semantics) with TDD in frontend + backend.
- Decide and document guest fallback policy for `feed=following` (`none` vs `explore` behavior).
- Run backend feed mode tests once local DB host `db` is reachable in the test environment.

## Completed
- Implemented feed tabs Prompt 1 (frontend tab contract):
  - added FeedPage tests for tab-specific fetch params, URL query sync, history back behavior, and cross-tab pagination reset.
  - updated `frontend/src/pages/FeedPage.jsx` to map tabs to query/feed keys and fetch tab-specific datasets.
  - synchronized active tab with URL query (`?tab=following|explore|games`).
- Implemented feed modes Prompt 2 (backend API contract):
  - added `posts/test_views.py` coverage for `feed=following|explore|games` and invalid feed behavior.
  - added `posts/test_serializers.py` response-shape contract test for stable payload fields.
  - updated `posts/views.py` queryset branching for `following`, `explore`, and `games`; invalid feed returns 400.
- Updated `docs/FEED_TABS_IMPLEMENTATION_PLAN.md` to mark Prompts 1 and 2 completed on 2026-05-21.

## Tests
- `npm run test -- --run src/pages/FeedPage.test.jsx` (pass: 16 tests).
- `python manage.py test posts.test_views posts.test_serializers -v 2` (blocked: `db` host name not resolvable in current environment).

## Blockers
- Backend test environment cannot resolve PostgreSQL host `db` (`OperationalError: could not translate host name "db" to address`).
