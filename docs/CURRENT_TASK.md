## Next
- Run broader frontend regression suite after post-detail style parity completion.
- Decide whether to resolve or defer existing FeedPage `act(...)` warning noise in Vitest output.

## Completed
- Added `backend/.coveragerc` to define Django backend coverage behavior.
- Configured coverage source targets: `chat`, `interactions`, `posts`, `users`, `core`.
- Added omit rules for migrations, tests, `manage.py`, settings variants, ASGI/WSGI, and cache directories.
- Added reporting defaults: `show_missing = True`, `skip_covered = True`, and practical `exclude_lines` patterns.

## Tests
- Not run (config/documentation-only change).

## Blockers
- None.
