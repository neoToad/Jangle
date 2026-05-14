# TODO

## High Priority
- Implement full auth UI and flows:
- Build `LoginPage` form + validation + submit/loading/error states.
- Build `RegisterPage` form + confirm-password validation + API error handling.
- Wire login/register API calls and token lifecycle handling in frontend auth flow.
- Add protected-route and guest-only route guards.
- Add logout action and navigation UX.
- Add frontend auth tests first (Vitest + RTL), then implement to green.

## Medium Priority
- Add comment reply/delete UI controls in post detail, with interaction tests.
- Add chat history retrieval endpoint and/or initial message fetch in UI (if chat persistence on page load is required).
- Add missing interaction 404 tests for non-existent/invalid reaction or vote targets (if still absent).

## Quality / Verification
- Run full frontend Vitest suite after auth and post-detail follow-ups are merged.
- Add targeted tests for auth store + Axios token refresh interceptor behavior.

## Lower Priority / Decision Needed
- Decide whether comments should support real vote aggregation (currently placeholder `vote_score` behavior was noted historically).
- Add concise API docs/examples for reactions and votes payloads.
- Consider Docker Compose healthchecks for stronger startup readiness guarantees.
