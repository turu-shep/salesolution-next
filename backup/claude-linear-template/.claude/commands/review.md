---
name: review
description: Review recent changes and post results to Linear
---

Review the recent changes: $ARGUMENTS

Use subagents to investigate the changes, then check:

### 1. Convention compliance
Verify coding standards from CLAUDE.md:
- Naming conventions
- Import ordering
- Code structure and organization
- Error handling patterns

### 2. Architecture compliance
- Data flow patterns respected
- Auth checked where needed
- No violations of established boundaries

### 3. Type safety
Run type checking and report issues

### 4. Test coverage
Are there tests for new business logic?

### 5. Security
No exposed secrets, proper input validation

### 6. Learnings check
- Read `.claude/learnings/` for any patterns that apply to the changed files
- Flag if a known gotcha was repeated

Report findings as: **PASS** / **WARN** / **FAIL** for each category with specific file:line references.

### Post-review actions:

**If a Linear issue is associated:**
- Add a review comment on the Linear issue with the full report
- If all PASS: update status to "Done"
- If any FAIL: keep status as "In Progress" and list required fixes

**If any failures reveal non-obvious gotchas:**
- Create a learning in `.claude/learnings/` so the mistake isn't repeated
