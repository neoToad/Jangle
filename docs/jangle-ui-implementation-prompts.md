# Jangle UI Implementation Prompt Pack

Use these prompts in order. Each prompt is scoped so an implementation agent can complete it with TDD and produce a reviewable PR-sized change.




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
