# Jangle — Project Planning Document

## Concept

Jangle is a creative community hangout where people share cool things and spend time together. It sits somewhere between Tumblr, itch.io, and a cozy Discord server — a warm, low-pressure space where games, writing, and videos are all first-class content. The key differentiator is that **games and interactive content are playable directly in the page**, making Jangle unlike anything mainstream.

**Tagline ideas:**
- *"The weird corner of the internet"*
- *"Hang out. Play stuff. Share things."*

**Community language:**
- Users → **Janglers**
- Posts → **Drops**
- Global chat room → **The Jangle**
- Explore button → **Shake it**

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Django + Django REST Framework |
| Real-time | Django Channels + Redis |
| Database | PostgreSQL (Supabase or Railway) |
| Auth | Django built-in + SimpleJWT (or django-allauth for social login) |
| Frontend | React + Vite + Tailwind CSS |
| File Storage | Supabase Storage or Cloudflare R2 |
| Hosting | Railway (backend), Vercel (frontend) |

---

## Data Models

### User *(extends AbstractUser)*
- `bio` — TextField
- `avatar` — ImageField
- `created_at` — DateTimeField

### Post
- `author` → FK to User
- `post_type` — choices: `text`, `youtube`, `file`
- `title` — CharField
- `body` — TextField (nullable, text posts)
- `youtube_url` — CharField (nullable, YouTube posts)
- `file` — FileField (nullable, uploads)
- `file_type` — choices: `image`, `game`, `other` (nullable)
- `created_at` / `updated_at` — DateTimeField
- `is_pinned` — BooleanField
- `is_removed` — BooleanField (soft delete)

### Comment
- `post` → FK to Post
- `author` → FK to User
- `parent` → FK to self (nullable — threaded replies)
- `body` — TextField
- `created_at` — DateTimeField
- `is_removed` — BooleanField

### Reaction
- `user` → FK to User
- `emoji` — CharField
- `post` → FK to Post (nullable)
- `comment` → FK to Comment (nullable)
- `created_at` — DateTimeField
- Unique constraint on `(user, post)` and `(user, comment)`

### Vote
- `user` → FK to User
- `post` → FK to Post
- `value` — SmallIntegerField (`1` or `-1`)
- `created_at` — DateTimeField
- Unique constraint on `(user, post)`

### ChatRoom
- `name` — CharField
- `post` → OneToOneField to Post (nullable — global or per-post room)
- `created_at` — DateTimeField

### ChatMessage
- `room` → FK to ChatRoom
- `author` → FK to User
- `body` — TextField
- `created_at` — DateTimeField

---

## Features

### Content
- **Three post types:** text/writing, YouTube embeds, file uploads (images, HTML5 games)
- **HTML5 games run in a sandboxed iframe** directly on the post page
- **Soft deletes** on posts and comments for moderation integrity

### Feed & Discovery
- Single global feed, chronological
- Tabs: Following, Explore, Games
- **"Shake it"** button — surfaces a random Drop

### Interactions
- Emoji reactions (expressive, multiple per post)
- Upvotes / downvotes (affect sorting/score)
- Threaded comments (via self-referential FK on Comment)
- Live chat per post + global chat room (The Jangle) via Django Channels

### Profiles
- Avatar, bio, display name
- **3 pinned Drops** showcased at the top
- Chronological list of all posts below
- Follower system — no public follower counts displayed

### Special Touches
- **"Playing now" indicator** — soft pulsing ring on game cards when someone is active
- Friendly timestamps (*"about an hour ago"*)
- Emoji reactions animate briefly when added
- No public follower counts — keeps the vibe low pressure

---

## Build Prompts

### Prompt 1 — Django Project Scaffold ***Done
Create a new Django project called `hangout` with apps: `users`, `posts`, `interactions`, `chat`. Install and configure Django REST Framework, Simple JWT, django-cors-headers, and Django Channels with a Redis channel layer. Set up PostgreSQL as the database. Include a `.env` setup using `django-environ` for secrets and database credentials. Configure `settings.py` for all installed apps, middleware, and static/media file handling.

### Prompt 2 — User Model ***Done
In the `users` app, create a custom user model extending `AbstractUser`. Add fields: `bio` (TextField, blank), `avatar` (ImageField, upload to `avatars/`), `created_at` (auto DateTimeField). Set `AUTH_USER_MODEL` in settings. Create a DRF serializer with fields for `id`, `username`, `bio`, `avatar`, `created_at`. Create a `UserDetailView` and `UserUpdateView` using DRF generics, JWT-protected.

### Prompt 3 — Post Model & API
In the `posts` app, create a `Post` model with: `author` (FK to User), `post_type` (choices: `text`, `youtube`, `file`), `title`, `body` (nullable), `youtube_url` (nullable), `file` (FileField, nullable), `file_type` (choices: `image`, `game`, `other`, nullable), `created_at`, `updated_at`, `is_pinned`, `is_removed` (both BooleanField, default False). Create a DRF serializer and viewset with list, create, retrieve, update, destroy actions. Unauthenticated users can read; only authenticated users can post. Only the author or admin can edit or delete. Filter out `is_removed=True` from all public responses.

### Prompt 4 — Comment Model & API
In the `interactions` app, create a `Comment` model with: `post` (FK to Post), `author` (FK to User), `parent` (FK to self, nullable for threaded replies), `body`, `created_at`, `is_removed`. Create a nested DRF serializer that includes replies. Create endpoints to list comments by post, create a comment, and soft-delete (set `is_removed=True`). Only the author or admin can delete.

### Prompt 5 — Reactions & Votes
In the `interactions` app, create a `Reaction` model with: `user` (FK), `emoji` (CharField), `post` (FK nullable), `comment` (FK nullable), `created_at`. Add unique constraints on `(user, post)` and `(user, comment)`. Create a `Vote` model with: `user` (FK), `post` (FK), `value` (SmallIntegerField, 1 or -1), `created_at`. Add a unique constraint on `(user, post)`. Create DRF endpoints to add/change/remove a reaction and cast/change/remove a vote. Include aggregated reaction counts and vote scores in Post and Comment serializers.

### Prompt 6 — Django Channels Chat
In the `chat` app, create a `ChatRoom` model with: `name` (CharField), `post` (OneToOneField to Post, nullable), `created_at`. Create a `ChatMessage` model with: `room` (FK to ChatRoom), `author` (FK to User), `body`, `created_at`. Write a Django Channels WebSocket consumer that authenticates the user via JWT query param, joins the correct room by name, broadcasts incoming messages to the room group, and saves each message to the database. Set up routing for `ws/chat/<room_name>/`.

### Prompt 7 — React + Vite Frontend Scaffold
Create a React + Vite project with Tailwind CSS. Set up React Router with routes: `/` (feed), `/post/:id` (post detail + comments + chat), `/profile/:username`, `/login`, `/register`. Configure an Axios instance with base URL from an env variable and a JWT auth interceptor that attaches the access token and refreshes on 401. Set up Zustand for global auth state (current user, tokens).

### Prompt 8 — Feed & Post UI
Build the main feed page. Fetch posts from the API and display in a scrollable list. Each post card renders differently by `post_type`: text posts show title + body preview, YouTube posts embed the video, file posts show an image or play/download link for games. Include upvote/downvote buttons and emoji reaction pickers on each card. Add a create post form that conditionally shows fields based on the selected post type.

### Prompt 9 — Post Detail, Comments & Live Chat
Build the post detail page. Show full post content at the top. Below, render a threaded comment section with nested replies and a comment form. Alongside or below, render a live chat panel via WebSocket to `ws/chat/<room_name>/`. Display incoming messages in real time and allow the logged-in user to send messages. Use the post ID or a global room name to determine the room.

---

## Visual Identity

### Vibe
Dark-default with a light mode option. Soft and bubbly — rounded corners, warm and earthy. Think late-night art studio, not cold tech dashboard.

### Color Palette (Dark Mode)
| Token | Value | Use |
|---|---|---|
| Background | `#1a1614` | Page background |
| Surface | `#252019` | Cards, panels |
| Border | `#3a3228` | Dividers, card edges |
| Accent | `#c9a87c` | Primary CTA, logo, highlights |
| Sage | `#8faa8b` | Secondary accent, live indicators |
| Text Primary | `#ede6d6` | Body text |
| Text Muted | `#9c8f7e` | Timestamps, labels |

Light mode flips to warm cream backgrounds (`#f5f0e8`) with the same accent colors.

### Typography
- **Headings:** Fraunces (editorial, warm, characterful)
- **Body:** DM Sans (clean, readable)
- **Monospace:** JetBrains Mono (code, game descriptions)

### Layout
- Single column feed, centered, generous padding
- Cards: `border-radius: 20px`, soft inner glow on hover
- Sticky nav: logo left, search center, avatar right
- Chat sidebar: collapsible on desktop, tab on mobile

### Domain Ideas
- `jangle.gg` *(recommended — signals playful/gaming angle)*
- `jangle.io`
- `janglehq.com`
