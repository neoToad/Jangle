## Next
- Register custom User in admin (UserAdmin subclass with email-based fieldsets)
- Add healthcheck conditions to docker-compose.yml so backend waits for db/redis to be truly ready
- Create app-level models and migrations (posts, interactions, chat)
- Write test_models.py for posts, interactions, chat apps following TDD workflow

## Completed
- pytest configured: pytest.ini + core/settings_test.py (SQLite in-memory, InMemoryChannelLayer) + conftest.py with shared user/api_client/auth_client fixtures; all 20 tests passing in 0.66s via `docker-compose exec backend pytest`
- Custom User model (users app): email as USERNAME_FIELD, no username, bio/avatar/created_at fields
- AUTH_USER_MODEL = 'users.User' set in settings
- UserSerializer: id, email (read-only), bio, avatar, created_at
- UserDetailView (GET /api/users/me/) and UserUpdateView (PATCH /api/users/me/update/) — JWT-protected
- Pillow added to requirements.txt for ImageField support
- users/0001_initial.py migration generated; dev DB recreated and re-migrated cleanly
- Renamed Django project config directory from `backend/hangout/` to `backend/core/`; updated all `hangout.*` module references
- Created backend/Dockerfile, docker-compose.yml with db/redis/backend services
- Fixed backend/.env to use Docker service names; re-encoded requirements.txt to UTF-8
- Confirmed all three containers start healthy

## Tests
- 20 tests passing: test_models.py (9), test_serializers.py (4), test_views.py (7)

## Blockers
- None