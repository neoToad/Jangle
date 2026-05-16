## Next
- Start Prompt 2 from `docs/jangle-ui-implementation-prompts.md`: feed header tabs and `+ Drop something` CTA with TDD.
- Keep current shell/theme tokens stable while layering feed-specific controls.
- Add focused `FeedPage` tests for tab labels, default active state, and active-state switching.
- Decide whether to introduce reusable UI primitives (`PillButton`, `ShellCard`) before Prompt 3.

## Completed
- Implemented Prompt 1 with frontend TDD: wrote failing `Layout` shell tests first, then implemented minimum code to pass.
- Added dark theme token support in Tailwind/global theme for: `bg`, `surface`, `border`, `accent`, `sage`, `textPrimary`, `textMuted`.
- Wired typography to match design direction: Fraunces for display/logo and DM Sans for body.
- Rebuilt app shell in `Layout` with sticky nav and required structure: wordmark, center search, right `Shake it` CTA, avatar button.
- Added centered two-region main layout with feed column + right sidebar shell region.
- Added warm radial background treatment and subtle SVG noise texture overlay.
- Preserved auth entry points by moving guest links/logout controls into sidebar shell.

## Tests
- `npm test -- --run src/components/Layout.test.jsx` (failed first, then passed after implementation).
- `npm test -- --run src/pages/AuthFlow.test.jsx` (passed, validates logout/auth guard regression safety).
- `npm test -- --run` (full frontend suite passed: 6 files, 22 tests).

## Blockers
- No blockers for Prompt 1 implementation.
- Existing React Router future-flag warnings and one pre-existing `act(...)` warning in `PostDetailPage` tests remain non-blocking.
