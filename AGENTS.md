# Agent Instructions
## Project: Jangle — Django + DRF + React + Vite + Tailwind 
## Workflow: Test-Driven Development
1. Write failing tests first
2. Confirm they fail for the right reasons
3. Write minimum code to make them pass
4. Refactor if needed, keeping tests green

---
 
## After Every task
 
**Update `docs/CURRENT_TASK.md` (Keep around 20–40 lines Ideally):** 
```
## Next
## Completed
## Tests
## Blockers
```
**Move anything from the next section that is not completed to TODO.md** 

---
 
**Output a commit message:**
```
<type>(<scope>): <summary>
- <what changed>
```
Types: `feat` `fix` `test` `refactor` `chore` `docs`
 
---

## Rules
- Never write implementation before tests
- Django: split tests into `test_models.py`, `test_views.py`, `test_serializers.py`
- Frontend: Vitest + React Testing Library
- No commit message if tests are failing
- Never commit secrets, keys, or credentials — use .env