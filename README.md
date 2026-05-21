# Jangle

Jangle is a social platform where **Janglers** share short posts called **Drops**, react, comment, and hang out in real-time chat spaces, including the global room known as **The Jangle**.

## Tech Stack

### Backend
- Django
- Django REST Framework (DRF)
- Django Channels
- Redis (channel layer)

### Frontend
- React
- Vite
- Tailwind CSS

### Data + Real-Time
- PostgreSQL
- WebSockets via Django Channels + Redis

## Prerequisites

Install these before local setup:

- Python `3.12+`
- Node.js `20+` and npm
- PostgreSQL `16+` (or run via Docker)
- Redis `7+` (or run via Docker)
- Docker + Docker Compose (recommended for full-stack local runs)
- Git

## Local Development Setup (Docker First)

### 1) Clone the repo

```bash
git clone <your-repo-url>
cd Jangle
```

### 2) Configure environment files

Backend env:

```bash
cp backend/.env.example backend/.env
```

Frontend/local compose env:

```bash
cp .env.example .env
```

Update values for your machine, especially:
- `backend/.env` -> `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`
- `.env` -> `POSTGRES_*`, `VITE_API_BASE_URL`

If you are **not** using Docker for Postgres/Redis, set:
- `DATABASE_URL=postgres://<user>:<password>@localhost:5432/<db_name>`
- `REDIS_URL=redis://localhost:6379/0`

### 3) Start the full stack

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This starts:
- `backend` (Django API)
- `frontend` (Vite dev server in container)
- `db` (PostgreSQL)
- `redis` (Channels layer)

Ports:
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8000`

### Run migrations (inside Docker)

In another terminal:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py migrate
```

### Stop stack

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Reset containers + volumes (full clean)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

Then rebuild:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Seeding Test Data

Use the project seed management command to generate fake Janglers, Drops, comments, reactions, and chat messages:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_db
```

Reset and reseed from scratch:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_db --reset
```

If your local branch uses a different seed command name, list available commands with:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py help
```

## Running Tests

### Backend (pytest)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend pytest
```

### Frontend (Vitest)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm test
```

For a single non-watch pass (better for CI/manual checks), use:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm test -- --run
```

Run one frontend test file:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm test -- src/pages/PostDetailPage.test.jsx --run
```

## WebSocket Testing (Live Chat)

Quick local check:
1. Start backend + frontend + Redis.
2. Log in as a user in the UI.
3. Open a Drop detail page with chat.
4. Send a chat message and verify it appears immediately.
5. Open the same Drop in a second browser/session and verify messages broadcast in real time.

WebSocket route pattern used by the app:
- `/ws/chat/<room_name>/?token=<jwt_access_token>`

## Feed Media Behavior

- YouTube drops support inline playback in feed cards when the URL resolves to a supported YouTube host (`youtube.com`, `m.youtube.com`, `youtu.be`).
- Unsupported or unembeddable YouTube links show a safe `Open on YouTube` fallback action.
- Game file drops support:
  - inline iframe launch for safe same-origin game URLs.
  - secure new-tab launch for external game URLs (`target=\"_blank\"` + `rel=\"noopener noreferrer\"`).
- Inline media iframes use explicit sandbox/allow attributes for safer embedding.
- Feed cards include compact media status copy:
  - YouTube: `Loading video...` and fallback hint to open on YouTube.
  - Game: `Opening game...` and fallback hint to open in a new tab.
- Backend creation contract enforces:
  - YouTube post type requires a valid YouTube URL.
  - game file posts require a file payload.

## Feed Query Modes

`GET /api/posts/` accepts optional `feed` query parameter:

- `feed=following`
  - authenticated users: posts from followed authors.
  - guests: auto-fallback to explore dataset ordering.
- `feed=explore`
  - discovery feed ordered by engagement score, then recency.
- `feed=games`
  - only game posts (`post_type=file` and `file_type=game`).
- invalid `feed` values return `400` with a `feed` validation error.

## Environment Variables Reference

### Root `.env` (Docker Compose / frontend build args)

| Key | Required | Description |
| --- | --- | --- |
| `POSTGRES_DB` | Yes | PostgreSQL database name for Docker Compose. |
| `POSTGRES_USER` | Yes | PostgreSQL user for Docker Compose. |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password for Docker Compose. |
| `VITE_API_BASE_URL` | Yes | Frontend API base URL (example: `http://localhost:8000`). |

### `backend/.env` (Django backend)

| Key | Required | Description |
| --- | --- | --- |
| `SECRET_KEY` | Yes | Django secret key. |
| `DEBUG` | Yes | Django debug mode (`True` or `False`). |
| `ALLOWED_HOSTS` | Yes | Comma-separated Django allowed hosts. |
| `DATABASE_URL` | Yes | PostgreSQL connection URL (`postgres://user:pass@host:5432/db`). |
| `REDIS_URL` | Yes | Redis URL used by Channels (`redis://host:6379/0`). |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins allowed by CORS. |

### Frontend runtime env

The frontend reads:

| Key | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL for REST API and WebSocket host derivation. |

`VITE_API_BASE_URL` is supplied either by:
- local shell env when running `npm run dev`, or
- root `.env` through Docker Compose.
