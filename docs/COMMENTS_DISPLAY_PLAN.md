# Comments Expansion Plan

## Goal
Show all comments when a post is opened, and display each comment poster's username and posted time.

## Plan
1. [x] Add failing backend tests first (`backend/interactions/test_views.py`, `backend/interactions/test_serializers.py`).
- Verify `GET /api/interactions/posts/<id>/comments/` returns every non-removed comment in the thread tree (top-level and replies recursively).
- Verify each comment payload includes poster identity (`author_username`) and timestamp (`created_at`).
- Verify ordering is deterministic (chronological within each level, or flat chronological if that is the final API contract).

2. [x] Define and lock response shape in tests.
- Option A: Keep nested tree and ensure all reply levels are included.
- Option B: Return a flat list of all comments with `parent` references.
- Add tests for the chosen shape so frontend behavior is stable.

3. [x] Implement minimum backend changes to pass tests.
- Update `CommentSerializer` to include username (`author_username`, using `source` or `SerializerMethodField`).
- Ensure `created_at` is always returned.
- If needed, optimize with `select_related('author')` and reply prefetching to prevent N+1 queries.

4. [x] Add failing frontend tests (`frontend/src/pages/PostDetailPage.test.jsx`).
- Assert all comments and replies are rendered on post detail.
- Assert each rendered comment shows username and posted time.
- Assert deep replies render correctly if nested shape is retained.

5. [x] Implement minimum frontend changes.
- Update `PostDetailPage.jsx` and `CommentItem` to render:
  - Poster username
  - Posted timestamp (consistent formatting)
- Keep recursive rendering stable for multi-level threads.

6. Verify with tests.
- Backend: targeted interactions tests, then relevant backend suite.
- Frontend: post detail tests, then related feed/detail tests.

7. Refactor and performance pass.
- Remove serializer/view duplication.
- Keep behavior changes limited to comment visibility and metadata display.

8. Repository workflow updates (required after implementation task).
- Update `docs/CURRENT_TASK.md` sections: `Next`, `Completed`, `Tests`, `Blockers`.
- Move unfinished `Next` items to `docs/TODO.md`.
- Provide commit message only after tests pass.
