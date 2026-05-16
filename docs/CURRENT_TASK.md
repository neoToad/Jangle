## Next
- Confirm the seed command name and implementation (`seed_data` vs another command) so README seed instructions exactly match the codebase.
- Run a full-stack smoke check with the Docker dev override to validate documented ports and startup commands.
- Keep README updated as auth/chat APIs and environment keys evolve.

## Completed
- Added a new root `README.md` with end-to-end developer onboarding for the Jangle platform.
- Included project overview language using Janglers, Drops, and The Jangle.
- Documented backend/frontend/database/real-time tech stack.
- Added prerequisites with concrete tool/version expectations.
- Revised local setup to Docker-first only; removed manual local venv/npm/runserver workflow.
- Added Docker Compose workflows for build/up, down, and full volume reset.
- Added Docker-based migration command via `docker compose ... exec backend python manage.py migrate`.
- Added seeding section with `manage.py` command plus command discovery fallback.
- Switched backend/frontend test commands to Docker `exec` variants.
- Added WebSocket verification steps for local live chat behavior.
- Added environment-variable reference tables for root `.env`, backend `.env`, and frontend runtime key usage.

## Tests
- No code-level tests run for this task (documentation-only change).
- Validation performed by cross-checking README commands/keys against:
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `backend/core/settings.py`
- `backend/.env.example`
- `.env.example`
- `frontend/package.json`

## Blockers
- Seed command does not appear in tracked source files yet; README currently documents `python manage.py seed_data` with `manage.py help` fallback.
