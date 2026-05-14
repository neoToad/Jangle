## Next
- Build login/register forms and call backend JWT endpoints.
- Add protected-route handling and redirect rules based on auth state.
- Implement post detail page data fetch with comments + live chat integration.
- Add optimistic UI updates for feed votes/reactions and error toasts.
- Add frontend tests for feed rendering variants and create-post form behavior.

## Completed
- Created `frontend/` React + Vite project scaffold with Tailwind CSS setup.
- Added Vite config, PostCSS config, Tailwind config, and `.env.example` with `VITE_API_BASE_URL`.
- Configured React Router routes:
- `/` (feed)
- `/post/:id` (post detail + comments + chat placeholders)
- `/profile/:username`
- `/login`
- `/register`
- Added Axios API client with:
- Base URL from `import.meta.env.VITE_API_BASE_URL`
- Request interceptor attaching `Authorization: Bearer <access>`
- Response interceptor that refreshes on `401` via `/api/auth/token/refresh/`
- Retry logic after refresh and auth clear on refresh failure.
- Added Zustand auth store for `currentUser`, `accessToken`, `refreshToken` with localStorage persistence.
- Dockerized frontend app:
- Added multi-stage `frontend/Dockerfile` (Node build + Nginx runtime).
- Added SPA routing config in `frontend/nginx.conf` (`try_files ... /index.html`).
- Added `frontend` service to `docker-compose.yml` on host port `5173`.
- Added compose build arg `VITE_API_BASE_URL` with default `http://localhost:8000`.
- Added `VITE_API_BASE_URL` to root `.env.example`.
- Built main feed page UI and API wiring:
- Fetches posts from `/api/posts/` and renders in a scrollable list.
- Supports DRF paginated payloads (`results` + `next`) with a load-more button.
- Renders post cards by `post_type`:
- `text`: title + body preview.
- `youtube`: embedded player when URL can be parsed, fallback link otherwise.
- `file`: image preview for image files, play/open + download links for game files.
- Added per-card vote controls using `/api/interactions/posts/<id>/votes/`.
- Added emoji reaction picker controls using `/api/interactions/posts/<id>/reactions/`.
- Added create-post form with conditional fields by selected type:
- `text` -> body
- `youtube` -> youtube_url
- `file` -> file_type + upload
- Create post submits multipart form-data to `/api/posts/`.

## Tests
- Added Vitest setup file (`src/test/setup.js`) and test config in `vite.config.js`.
- No frontend test execution yet in this task (dependencies not installed in this run).
- Docker build/runtime not executed in this run.
- Feed page behavior not test-executed in this run (UI code added without local npm install/run here).

## Blockers
- None
