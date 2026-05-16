## Next
- Recreate frontend service with dev override and verify it binds to `localhost:5174`.
- Run backend auth tests once DB service is confirmed reachable in local env.

## Completed
- Resolved recurring port collision risk between base and dev compose frontend services.
- Updated `docker-compose.dev.yml` frontend host-port mapping from `5173:5173` to `5174:5173`.
- Kept base `docker-compose.yml` frontend mapping unchanged (`5173:80`).
- This allows regular and dev variants to run without competing for host port 5173.

## Tests
- No application tests run for this config-only change.
- Functional verification step pending: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` then open `http://localhost:5174`.

## Blockers
- None.
