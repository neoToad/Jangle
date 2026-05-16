## Next
- Start Prompt 3: extract a reusable `PostCard` base aligned to the Jangle reference card structure and styling.
- Add TDD coverage for shared card sections (header/body/footer) and hover-state treatment.
- Decide whether to isolate feed header into a dedicated component before Prompt 3 to keep `FeedPage` readable.
- Consider filtering behavior per tab (`Following/Explore/Games`) once backend query options are defined.

## Completed
- Implemented Prompt 2 with TDD: added failing feed-header tests, then shipped minimal UI/state changes to pass.
- Added feed-level controls above cards: tabs `Following`, `Explore`, `Games` plus primary `+ Drop something` CTA.
- Added active/inactive tab styling with rounded pill treatments and earthy token-based contrast.
- Added responsive wrapping/layout behavior for the tab row and CTA on narrower widths.
- Preserved existing feed behavior while introducing local `activeTab` state for interaction styling.

## Tests
- `npm test -- --run src/pages/FeedPage.test.jsx` (failed first on missing controls, then passed after implementation).
- `npm test -- --run` (full frontend suite passed: 6 files, 24 tests).

## Blockers
- No blockers for Prompt 2 implementation.
- Existing non-blocking warnings remain: React Router future flags and prior `act(...)` warning in `PostDetailPage` tests.
