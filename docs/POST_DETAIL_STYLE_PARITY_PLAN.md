# Post Detail Style Parity Plan

## Goal
- Make clicked post detail pages visually consistent with feed cards and overall Jangle theme.
- Preserve existing post-detail behavior while aligning styling primitives.

## Current State
- Feed cards use Jangle theme tokens and motion styles in `frontend/src/components/PostCard.jsx`.
- Post detail uses separate markup and legacy `slate/white` utility styling in `frontend/src/pages/PostDetailPage.jsx`.
- The style gap is structural: detail page does not reuse feed styling primitives/components.

## Prompt 1: Styling Contract Tests (Fail First)
- Add failing tests in `frontend/src/pages/PostDetailPage.test.jsx` for:
  - top post container uses Jangle token classes (`bg-jangle-surface`, `border-jangle-border`, rounded card shell).
  - comments and chat sections use Jangle theme classes.
  - key post typography follows feed style direction.
- Add a regression assertion that primary post/detail containers do not use legacy `bg-white` and `border-slate-*` classes.

## Prompt 2: Align Top Post Visual Shell
- Implement minimal changes to make top post container match feed card language:
  - Jangle surface/background, border, radius, spacing, and shadow treatment.
  - consistent heading/body text classes with feed tokens.
- Keep data loading and interaction logic unchanged in this prompt.

## Prompt 3: Shared Styling Primitive (If Needed)
- Introduce a small shared presentational wrapper (e.g., `PostCardFrame`) if duplication is growing.
- Reuse shared classes between `PostCard` and `PostDetailPage` to reduce future visual drift.
- Add/update tests to protect shared class contract.

## Prompt 4: Detail Data-to-UI Parity
- Add tests for a mapped detail view model that aligns with feed card fields (`type`, `author`, `avatar`, `time`, etc.).
- Create/extend adapter logic so detail page can render feed-consistent metadata without ad-hoc formatting.
- Keep API contract unchanged unless needed.

## Prompt 5: Comments Restyle
- Add failing tests for comment containers and nested replies using Jangle token classes.
- Replace legacy `slate` comment styles with token-based classes:
  - `bg-jangle-surface`/`bg-jangle-bg`
  - `border-jangle-border`
  - `text-jangle-textPrimary`/`text-jangle-textMuted`
- Preserve current nested reply structure and readability.

## Prompt 6: Live Chat Restyle
- Add failing tests for live chat card/input/button classes to match site design language.
- Replace legacy styles with sidebar/chat-consistent tokens and controls.
- Preserve websocket send/receive behavior and auth gating.

## Prompt 7: States + Responsive Polish
- Add failing tests for:
  - loading/error/empty states using token-consistent styling.
  - mobile-safe control sizing (`min-h-11`) where appropriate.
- Implement responsive spacing and class adjustments so detail layout remains consistent on small screens.

## Prompt 8: Regression + Cleanup
- Run post-detail and related frontend tests.
- Remove obsolete one-off classes left from legacy style path.
- Update docs trackers after implementation prompts.

## Definition of Done
- Post detail visual shell matches feed/style system.
- Comments and chat sections follow Jangle token language.
- Legacy `slate/white` container styling is removed from primary detail sections.
- Existing post detail functionality remains intact and tests pass.
