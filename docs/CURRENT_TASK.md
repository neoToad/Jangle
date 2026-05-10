## Next
- Add healthcheck conditions to docker-compose.yml so backend waits for db/redis to be truly ready
- Create app-level models and migrations (users, posts, interactions, chat)
- Write test_models.py for each app following TDD workflow

## Completed
- Created backend/Dockerfile (python:3.12-slim, libpq-dev, runs runserver 0.0.0.0:8000)
- Created docker-compose.yml with db (postgres:16), redis (redis:7-alpine), backend services
- Fixed backend/.env to use Docker service names (db, redis) and jangle credentials
- Re-encoded requirements.txt from UTF-16 to UTF-8 so pip can parse it
- Confirmed all three containers start healthy
- Confirmed `python manage.py migrate` runs cleanly (30 migrations applied, 0 errors)

## Tests
- No app tests written yet — no app models defined

## Blockers
- None