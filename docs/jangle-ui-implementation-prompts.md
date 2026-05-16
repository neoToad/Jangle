# Jangle UI Implementation Prompt Pack

Use these prompts in order. Each prompt is scoped so an implementation agent can complete it with TDD and produce a reviewable PR-sized change.





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
