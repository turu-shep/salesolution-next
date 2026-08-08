---
globs: **/*
---

# Plan Drift Detection

Plans in `docs/plans/*.md` go stale. Files listed in a step may have been edited by the user, a parallel session, a prior step, or a merge from main since the plan was written. Executing a stale step blindly produces confused, wrong work.

## Before executing any plan step

When running `/implement`, `/continue`, or any command that follows a pre-written plan:

1. **Find the plan's write timestamp.** Use `git log -1 --format=%cI <plan-file>` if the plan is committed, otherwise use the file's mtime.

2. **For each file listed in the current step's `Files:` section:**
   - If the file exists: `git log --since="<plan-timestamp>" --oneline -- <file>` to see commits since the plan was written.
   - Also check for uncommitted changes: `git status --short <file>`.
   - If the file is new (doesn't exist yet): that's fine, the step will create it.

3. **Classify the drift:**
   - **No drift**: No commits or uncommitted changes since plan time → proceed.
   - **Minor drift**: Formatting, comments, or unrelated changes → proceed but re-read the file first.
   - **Material drift**: Structure, exports, function signatures, or related logic changed → STOP, flag to user, ask whether the step is still valid.

4. **On material drift, output this and wait:**
   ```
   ⚠ Plan drift detected on step <N>
   Plan written: <timestamp>
   <file>: <N commits> since plan [+ uncommitted changes]
     Most recent: <commit-subject>

   Options:
     (1) Proceed anyway — I've reviewed the changes and the step is still valid
     (2) Re-plan this step — the changes invalidate the original approach
     (3) Skip this step — it's no longer needed
   ```

## Why this matters

Without drift detection, `/implement` will blindly apply the plan's instructions to files that no longer match the plan's mental model. You end up with Claude deleting a function another session just added, or re-implementing something that was already done differently.

## What counts as "material"

Heuristics, not rules:
- **Material**: new/removed exports, changed function signatures, new imports, new dependencies, Sanity schema changes, new types, any change in logic flow.
- **Not material**: whitespace, comments, renamed local variables, lint auto-fixes, import ordering.

When uncertain, treat it as material and ask.

## Logging the decision

If the user chooses (1) "proceed anyway", log that as a decision in `.claude/decisions.jsonl` so the choice is auditable:
```json
{"ts":"...","issue":"SAL-123","step":3,"type":"proceed-despite-drift","decision":"Proceeded despite drift on file.ts","chose":"proceed","why":"Drift was only a rename I could adapt to"}
```
