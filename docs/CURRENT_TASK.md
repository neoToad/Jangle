## Next
- Prompt 6 follow-up: align post-detail interactions with feed-card local reaction/vote behavior.
- Add focused tests for post-detail comment action click-through behavior.
- Add comment reply/delete UI controls in post detail with interaction tests.

## Completed
- Implemented Prompt 8 responsive and accessibility hardening pass with TDD-first workflow.
- Added labeled search input semantics (`type=search`, explicit `aria-label`) and stronger keyboard focus visibility.
- Increased touch target sizing for primary nav/chat controls to mobile-friendly minimum heights.
- Added keyboard-triggered mobile chat behavior: Enter/Space toggle, Escape close, and dialog semantics for drawer.
- Improved mobile nav wrapping so brand/actions/search remain usable on narrow widths.
- Added accessibility-oriented tests for labeled controls, keyboard actions, and mobile structural class coverage.
- Implemented Prompt 7 right sidebar chat UI in `Layout` with TDD-first workflow.
- Added sticky desktop `The Jangle` chat card with pulse status dot, online count, and scrollable chat list.
- Added chat message bubble rows with username + relative-time metadata styling.
- Added local optimistic send behavior for both Send button click and Enter key press.
- Added mobile-first fallback with bottom trigger and collapsible drawer panel.
- Expanded `Layout` tests to cover initial chat rendering, click-send, Enter-send, and drawer toggle state.
- Implemented Prompt 6 status cues and motion polish with TDD.
- Added `LIVE` chip rendering for playing posts only, including pulsing status dot hook.
- Added reusable motion tokens/classes: pulse dot, card entrance, card hover transition, and shake-hover hook.
- Applied optional shake-hover animation hook to `Shake it` button.
- Added reduced-motion fallbacks to disable animation/transition tokens when `prefers-reduced-motion: reduce`.
- Expanded tests for `LIVE` indicator conditional rendering and animation hook class assertions.
- Implemented Prompt 5 local interaction mechanics in `PostCard` using TDD.
- Added emoji reaction pills with counts and `+ React` picker popover interaction.
- Selecting a picker emoji now increments that reaction count and closes the popover deterministically.
- Added local vote toggle behavior (`+1`, `-1`, second-click reset to base score) with displayed score delta.
- Added comments count action button in card footer.
- Expanded `PostCard` tests to cover picker open/close, reaction increment, and vote up/down untoggle states.
- Implemented Prompt 4 with TDD in reusable `PostCard` component.
- Added conditional game preview strip with playable badge text, play count, and `Play Now` CTA.
- Added conditional youtube preview strip with video icon tile and inline-watch hint copy.
- Applied per-post accent tint and border treatment on preview strip containers.
- Ensured writing posts render with no preview strip.
- Expanded `PostCard` tests to validate preview-strip behavior by post type and `Play Now` visibility.

## Tests
- `npm test -- --run src/components/Layout.test.jsx` (failed first on missing Prompt 8 a11y/mobile semantics, then passed after updates).
- `npm test -- --run src/components/Layout.test.jsx` (failed first on missing Prompt 7 chat UI, then passed after implementation).
- `npm test -- --run` (initial run failed in `PostCard.test.jsx` due encoding issue causing duplicate emoji keys, then fixed).
- `npm test -- --run src/components/PostCard.test.jsx src/components/Layout.test.jsx` (failed first on missing Prompt 6 hooks, then passed after implementation).
- `npm test -- --run` (full frontend suite passed: 7 files, 31 tests).

## Blockers
- No blockers for Prompt 8 implementation.
- Existing non-blocking warnings remain: React Router future flags and prior `act(...)` warning in `PostDetailPage` tests.
