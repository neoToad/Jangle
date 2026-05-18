## Next
- Restyle post-detail comments and live chat containers in `frontend/src/pages/PostDetailPage.jsx` to use Jangle token classes.
- Replace remaining legacy `bg-white` and `border-slate-*` usage in post-detail secondary shells.
- Re-run `PostDetailPage.test.jsx` until all style-contract assertions pass.
- Run broader frontend tests after post-detail styling parity is complete.

## Completed
- Implemented minimal top-post visual-shell alignment in `frontend/src/pages/PostDetailPage.jsx`.
- Updated top post container to feed-card language: `bg-jangle-surface`, `border-jangle-border`, `rounded-[20px]`, `p-5`, and shadow treatment.
- Updated top post heading typography to feed tokens: `font-display` and `text-jangle-textPrimary`.
- Updated top post body typography to feed direction with `leading-relaxed` and `text-jangle-textMuted`.
- Preserved existing post-detail data loading and interaction logic with no behavior changes.

## Tests
- `npm run test -- --run PostDetailPage.test.jsx` (currently failing with 2 failures, 5 passing).
- Passing now includes top post shell/token and key typography assertions.
- Remaining failures are limited to comments/live-chat section styling and legacy class regression guard.

## Blockers
- None.
