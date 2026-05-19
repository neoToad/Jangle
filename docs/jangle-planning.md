# Jangle - Active Planning (Remaining Work)

This document now tracks only unfinished planning items. Completed foundational work (core models, base stack, initial feed interactions, and initial visual direction) has been removed.

## Product Priorities

### Feed Behavior
- Finish true backend-driven feed modes for `Following`, `Explore`, and `Games`.
- Finalize guest behavior for `Following` (auth-gated vs fallback strategy) and lock with tests.
- Complete feed payload contract alignment for comment counts and keep adapter behavior test-covered.

### Chat
- Wire sidebar `The Jangle` panel to backend chat history/create endpoints.
- Complete websocket event behavior for delivery/reconnect in sidebar chat.
- Ensure chat history is loaded on first render so sessions are persistent.

### Profile
- Implement profile page MVP states and rendering.
- Confirm backend profile API contract coverage and endpoint behavior.
- Finish header profile menu interaction + accessibility behavior.

### Post Detail Parity
- Align post-detail vote/reaction behavior with feed-card behavior.
- Add focused tests for comment action click-through behavior.
- Add reply/delete controls for comments in post detail.

### Reliability and QA
- Resolve React Testing Library `act(...)` warning in `PostDetailPage.test.jsx` websocket test.
- Run broader frontend and full backend regressions around feed/chat/profile milestones.

### Docs and Decisions
- Keep reaction/vote payload examples concise and current in docs.
- Revisit seeded-data fidelity to ensure placeholder content matches production API semantics.
- Re-evaluate avatar storage strategy (file-backed vs URL-backed) when profile MVP lands.

## Deferred / Nice-to-Have
- Expand admin chat moderation ergonomics (filters, bulk actions, ordering/date hierarchy).
- Revisit startup/readiness hardening such as Docker Compose health checks.
