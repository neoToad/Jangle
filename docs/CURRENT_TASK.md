## Next
- Wire README/backend docs to reference `python manage.py seed_db` and `python manage.py seed_db --reset`.
- Decide whether to add a dedicated follow relationship model on `User` to satisfy social-graph seeding fully.
- Decide whether avatars should remain file-backed (`ImageField`) or move to a URL field for remote fake avatar URLs.
- Optionally add a lightweight smoke test that executes `seed_db --reset` in CI.

## Completed
- Added TDD coverage for a new `seed_db` management command in `backend/core/test_seed_db.py`.
- Verified initial failure case (`Unknown command: seed_db`) before implementation.
- Implemented `seed_db` command at `backend/posts/management/commands/seed_db.py`.
- Added `--reset` support to wipe seeded app data and reseed in one command.
- Implemented idempotent behavior: command skips when user/post data already exists.
- Ensured global chat room `The Jangle` is always created via `get_or_create`, even when seed is skipped.
- Added factory_boy + Faker factories in `backend/core/factories.py` for users/posts/comments/reactions/votes/chat entities.
- Seeded realistic distribution targets: 25 users, 50 posts split by type, 80 comments, and 60 chat messages.
- Added hardcoded real YouTube ID pool and generated valid `youtube_url` values.
- Added image and minimal HTML5 game file generation for file posts.
- Seeded mixed top-level/threaded comments (roughly one-third replies).
- Seeded reactions across posts/comments with unique-target constraints respected.
- Seeded votes across posts with `value in {-1, 1}` and unique `(user, post)` pairs.
- Marked a subset of posts/comments as `is_removed=True` to exercise soft-delete paths.
- Marked posts from 2-3 users as pinned via `is_pinned=True`.
- Backfilled created timestamps across all seeded entities over the past ~60 days.

## Tests
- Ran: `pytest core\\test_seed_db.py -q`
- Result: 4 passed
- Covered behaviors: initial seed shape/counts, idempotent rerun, `--reset` reseed, and global room creation when seed is skipped.

## Blockers
- Current schema has no follow/follower model or `User` self-referential relation, so sparse follow-graph seeding cannot be implemented yet.
- Current `User.avatar` is an `ImageField`, not a URL field; fake avatars are generated as files rather than URL strings.
