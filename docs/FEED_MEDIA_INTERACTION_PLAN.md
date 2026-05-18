# Feed Media Interaction Plan (YouTube Inline + Game Play)

## Goal
- Make YouTube posts actually open/watch inline from feed cards.
- Make game posts actually launch/play in browser from feed cards.
- Preserve current feed styling and interaction patterns while adding real behavior.

## Root Cause
- `PostCard` currently renders media sections as static UI text/buttons only.
- No click handlers are attached for YouTube inline playback or game launch.
- Feed adapter does not pass media source fields (`youtube_url`, `file`) into card props.

## Product Behavior (MVP)
- YouTube post:
  - click media block or explicit action opens inline embedded player in the card.
  - second click can collapse player.
  - invalid/unembeddable links show clear fallback action (`Open on YouTube`).
- Game post:
  - `Play Now` opens playable content in browser.
  - if embedded play is safe/allowed, open inline iframe panel; otherwise open file URL in new tab.
  - missing file URL shows disabled state and explanatory copy.

## Prompt 1: Frontend Adapter Contract (Tests First) [COMPLETED]
- Add failing tests in `frontend/src/adapters/posts.test.js` for mapped media fields:
  - YouTube posts expose canonical media URL/id for embed usage.
  - Game/file posts expose playable file URL/metadata.
  - Non-media posts keep null-safe defaults.
- Update `mapFeedPost` to include required media fields.

## Prompt 2: PostCard YouTube Inline (Tests First)
- Add failing tests in `frontend/src/components/PostCard.test.jsx`:
  - YouTube card renders trigger control.
  - clicking trigger mounts inline player region.
  - clicking again collapses player.
  - invalid URL renders fallback link message/state.
- Implement minimal local state (`isYouTubeOpen`) and embed rendering.
- Add accessible labels and `aria-expanded` semantics for the toggle.

## Prompt 3: Safe YouTube URL Parsing
- Add unit tests for URL parsing helper:
  - supports `youtube.com/watch?v=...`, `youtu.be/...`, and existing embed links.
  - rejects malformed URLs.
- Create helper to derive safe embed URL from raw input.
- Ensure only allowed YouTube host patterns are embedded.

## Prompt 4: PostCard Game Launch (Tests First)
- Add failing tests in `frontend/src/components/PostCard.test.jsx`:
  - `Play Now` is enabled when game URL exists.
  - click behavior opens inline panel or new tab based on selected MVP policy.
  - missing URL leaves button disabled with clear text.
- Implement `Play Now` action and UX state.
- Keep behavior explicit and deterministic in tests.

## Prompt 5: Security/Policy Guardrails
- Add tests and implementation for embed safety:
  - block non-http(s) schemes.
  - prevent arbitrary domain embedding for YouTube mode.
  - apply `sandbox` and `allow` attrs on iframes.
- If opening new tab for game files, ensure `rel="noopener noreferrer"` is used.

## Prompt 6: Feed Integration Regression
- Add/extend feed tests in `frontend/src/pages/FeedPage.test.jsx`:
  - mapped posts include media fields and render proper action states.
  - interaction does not break vote/react/comment controls.
  - load-more and rerender preserve stable behavior.
- Verify no regressions in existing post card rendering variants.

## Prompt 7: Optional Backend Contract Tightening
- If needed, add backend serializer tests ensuring media URL fields are always present for relevant post types.
- Add validation/error semantics for invalid YouTube links and missing game files at creation time.
- Keep this prompt scoped to contract consistency, not full media processing.

## Prompt 8: UX Polish + Documentation
- Align inline player and game launch UI with Jangle styling tokens.
- Add compact loading/error copy for media failures.
- Document supported media behaviors and constraints in project docs.

## Definition of Done
- YouTube feed cards open playable inline embeds as intended.
- Game feed cards launch playable content as intended.
- Media actions are test-covered, accessible, and safe.
- Existing feed interactions remain functional and tests pass.
