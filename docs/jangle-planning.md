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
