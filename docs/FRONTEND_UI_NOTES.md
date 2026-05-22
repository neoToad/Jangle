# Frontend UI Notes

## Theme Tokens
- `jangle-bg`: page background and deep canvas.
- `jangle-surface`: cards, panels, and elevated containers.
- `jangle-border`: default component borders and separators.
- `jangle-accent`: primary CTA and highlight color.
- `jangle-sage`: secondary accent and live presence indicators.
- `jangle-textPrimary`: primary readable text.
- `jangle-textMuted`: metadata and supporting copy.

## Component Responsibilities
- `Layout`: owns app shell, sticky nav, global search, `Shake it` action, and persisted real-time `The Jangle` chat shell on desktop/mobile (REST history + websocket updates).
- `FeedPage`: owns feed-level actions/state (tabs, create drop form, loading/error/pagination) and binds API posts to `PostCard`.
- `PostCard`: owns per-drop visual presentation and local interaction affordances (reactions, vote toggles, game/youtube preview strips).
- `adapters/posts`: isolates backend feed payload mapping (`post_type`, pagination shape) from UI components.

## Boundary Rule
- UI components should consume view-model fields (`title`, `description`, `type`, `votes`, etc.) and avoid direct DRF payload assumptions.
- If backend field names change, update `adapters/posts` rather than page/card components.
