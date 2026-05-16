## Next
- Implement functional media interactions in feed cards for YouTube inline playback and game browser play.
- Add adapter and component tests for media fields, toggle behavior, and safe URL handling.
- Add feed regression tests to ensure media interactions do not break existing post actions.
- Fix feed comment count mismatch so feed cards render real comment totals from API data.
- Add backend serializer/view contract support for `comment_count` with tests.
- Add frontend adapter/feed regression tests for non-zero comment totals.
- Implement post-detail styling parity in `frontend/src/pages/PostDetailPage.jsx` so detail layout matches feed and site theme.
- Add tests that enforce Jangle token classes and prevent regression to legacy `slate/white` containers.
- Restyle post-detail comments and live chat sections while preserving existing interaction behavior.
- Implement functional sidebar chat in `frontend/src/components/Layout.jsx` backed by REST history + websocket updates.
- Add backend chat API endpoints and split DRF tests (`test_models.py`, `test_serializers.py`, `test_views.py`) for sidebar chat contract.
- Add websocket consumer/routing and integration tests for room chat delivery behavior.
- Implement functional feed tab behavior for `Following`, `Explore`, and `Games` with frontend TDD coverage.
- Implement backend feed mode contract (`/api/posts/?feed=...`) and split DRF tests by file.
- Implement profile menu behavior in `frontend/src/components/Layout.jsx` with TDD in `frontend/src/components/Layout.test.jsx`.
- Build profile page MVP states in `frontend/src/pages/ProfilePage.jsx` with dedicated tests.

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
- Audited feed tabs in `frontend/src/pages/FeedPage.jsx` and confirmed they currently only toggle visual active state.
- Created `docs/FEED_TABS_IMPLEMENTATION_PLAN.md` with an 8-prompt TDD rollout for:
  - frontend tab contract and URL sync.
  - backend `feed` query contract and queryset branching.
  - following semantics, explore ranking, and games filtering.
  - auth policy, race-safety, and hardening/documentation.
- Added unresolved feed-tab implementation tasks to `docs/TODO.md` High Priority.
- Reviewed sidebar chat implementation and confirmed current behavior is local-state mock (no REST persistence or websocket integration).
- Created `docs/SIDEBAR_CHAT_IMPLEMENTATION_PLAN.md` with a 7-prompt TDD rollout for:
  - backend chat data + REST contract.
  - websocket consumer and routing.
  - frontend chat service layer and layout integration.
  - reliability, security baseline, and regression/docs completion.
- Added unresolved sidebar-chat implementation work to `docs/TODO.md` High Priority.
- Investigated feed vs post-detail visual mismatch and confirmed the root cause is divergent component/style systems.
- Created `docs/POST_DETAIL_STYLE_PARITY_PLAN.md` with an 8-prompt TDD rollout for:
  - style contract tests and top-post shell alignment.
  - optional shared styling primitives and mapped detail metadata parity.
  - comments/chat restyle, responsive polish, and regression cleanup.
- Added unresolved post-detail style parity implementation tasks to `docs/TODO.md` High Priority.
- Investigated feed comment totals and confirmed root cause: frontend expects `comment_count` but backend post payload does not provide it.
- Created `docs/FEED_COMMENT_COUNT_FIX_PLAN.md` with a TDD rollout for:
  - frontend adapter contract tests.
  - backend serializer/view `comment_count` support.
  - integration/regression/performance validation.
- Added unresolved comment-count fix tasks to `docs/TODO.md` High Priority.
- Investigated why YouTube inline watch and game browser play do not work and confirmed both are currently placeholder UI with no handlers.
- Created `docs/FEED_MEDIA_INTERACTION_PLAN.md` with a detailed TDD rollout for:
  - adapter media-field contract updates.
  - YouTube inline embed interactions and parsing safety.
  - game launch behavior, guardrails, and feed regression coverage.
- Added unresolved media-interaction implementation tasks to `docs/TODO.md` High Priority.

## Tests
- No tests run in this docs-only planning task.

## Blockers
- None for planning.
