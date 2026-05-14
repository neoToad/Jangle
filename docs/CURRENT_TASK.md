## Next
- Build login/register forms and call backend JWT endpoints.
- Add protected-route handling and redirect rules based on auth state.
- Implement feed API integration and post detail data loading.
- Implement post comments UI and wire real-time chat websocket client.
- Add Vitest + RTL tests for auth store and Axios refresh interceptor behavior.

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

## Tests
- Added Vitest setup file (`src/test/setup.js`) and test config in `vite.config.js`.
- No frontend test execution yet in this task (dependencies not installed in this run).

## Blockers
- None
