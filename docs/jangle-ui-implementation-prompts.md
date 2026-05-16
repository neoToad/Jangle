# Jangle UI Implementation Prompt Pack

Use these prompts in order. Each prompt is scoped so an implementation agent can complete it with TDD and produce a reviewable PR-sized change.





## Prompt 4: Add Post-Type Preview Strips (Game and Video)
Implement conditional preview bars for `game` and `youtube` posts.

Requirements:
- `game` strip: playable badge, play count text, and `Play Now` CTA.
- `youtube` strip: video icon tile and inline-watch hint text.
- Use per-post accent color tint and border for strip container.
- Keep writing posts clean with no preview strip.

Testing:
- Add tests asserting game strip only for game posts and video strip only for youtube posts.
- Verify `Play Now` button is present for game cards.

Definition of done:
- Type-specific strips render correctly without leaking to other post types.

## Prompt 5: Reactions and Voting Interactions
Implement local interaction mechanics from the reference.

Requirements:
- Emoji reaction pills with counts.
- `+ React` button opens emoji picker popover.
- Selecting an emoji increments that emoji count and closes picker.
- Vote control with up/down toggle and computed score delta (`+1`, `-1`, reset on second click).
- Comments count action in footer.

Testing:
- Add interaction tests for picker open/close and count increment.
- Add vote tests for upvote, downvote, and untoggle behavior affecting displayed score.

Definition of done:
- Card interactions behave like the reference and remain deterministic in tests.

## Prompt 6: Live/Playing Indicators and Motion Polish
Add status indicators and restrained animation details.

Requirements:
- Show `LIVE` chip on playing posts only.
- Add pulsing status dot animation token reused by live elements.
- Add subtle card entrance/hover transitions and optional shake hover on `Shake it` button.
- Keep motion accessible (respect reduced motion preference if project already supports it).

Testing:
- Add tests ensuring LIVE indicator renders only when `playing=true`.
- Add class/style assertions for animation hooks without brittle timing checks.

Definition of done:
- Status cues and motion polish are in place without harming usability.

## Prompt 7: Implement �The Jangle� Chat Sidebar UI
Create the right sidebar chat panel UI.

Requirements:
- Sticky sidebar card with header (`The Jangle`, online count, pulse dot).
- Scrollable message list with username, relative time, and message bubble styling.
- Input + send button row at bottom.
- Add local optimistic send behavior: Enter key or click send appends `you` message and clears input.
- On small screens, convert sidebar to a collapsed or bottom-drawer trigger (simple first pass acceptable).

Testing:
- Add tests for initial message rendering.
- Add send-message tests for click and Enter key behavior.
- Add responsive behavior test if your setup supports viewport switching; otherwise test class toggles.

Definition of done:
- Sidebar mirrors reference layout and supports basic local chat interaction.

## Prompt 8: Responsive and Accessibility Hardening
Perform pass focused on mobile layout and a11y semantics.

Requirements:
- Ensure nav/feed/chat remain usable on mobile widths.
- Confirm touch targets are large enough and controls keep contrast in dark mode.
- Add labels/aria attributes for interactive icon-only controls.
- Improve keyboard navigation order and focus visibility.

Testing:
- Add a11y-oriented tests for labeled controls and keyboard-triggered actions.
- Add snapshot or structural tests for mobile layout class switches.

Definition of done:
- UI remains coherent and accessible across desktop/mobile and keyboard flows.

## Prompt 9: Integrate with Real API Data (No Styling Regression)
Swap seeded feed/chat data for backend APIs while preserving UI contract.

Requirements:
- Connect posts to existing DRF feed endpoint with loading and error states.
- Map backend post types to UI variants (`text/writing`, `youtube`, `file/game` as applicable).
- Keep current visual treatments unchanged while data becomes dynamic.
- Isolate adapters/selectors so API field changes do not ripple through UI components.

Testing:
- Add API mocking tests for loading/success/error render paths.
- Add mapper tests for post-type conversion logic.

Definition of done:
- UI keeps the same look while being driven by live backend data.

## Prompt 10: Final UI Fit-and-Finish Against Reference
Run a final parity sweep against `docs/jangle-feed.jsx` and planning notes.

Requirements:
- Tighten spacing, border radii, font weights, and muted text contrast.
- Ensure all core language appears correctly: `Janglers`, `Drops`, `The Jangle`, `Shake it` where appropriate.
- Keep component boundaries clean and remove dead styles.
- Add short developer notes documenting theme tokens and component responsibilities.

Testing:
- Run full frontend test suite and fix regressions.
- Add/refresh any snapshot baselines intentionally changed by final polish.

Definition of done:
- Reference-aligned UI, clean tests, and maintainable component structure.
