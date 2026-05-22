---
name: undo
description: Revert the last implement step safely — git, state, decisions, learnings
---

Undo the last implement step for the current (or specified) issue: $ARGUMENTS

You are reverting the most recent `/implement` action cleanly so the session can either retry the step with a different approach or skip it. This is NOT a general-purpose git undo — it's scoped to the last tracked step.

## What "the last step" means

Look at `.claude/state.json`:
- `currentStep` is the step NUMBER that will run next
- The last completed step was `currentStep - 1`
- Find the commit(s) for that step in the git log

## Process

### 1. Identify the scope
- Read `.claude/state.json` for `currentIssue`, `planFile`, `currentStep`
- If $ARGUMENTS specifies an issue ID, use that instead (look up its state/branch)
- Target step to undo: `currentStep - 1`
- Read the plan file and find that step's description

### 2. Find the commits to revert
```bash
git log --oneline --grep="\\[${ISSUE-ID}\\]" -n 20
```
- Filter commits whose message matches the step description OR the step number
- Usually this is 1 commit, but a step may have produced 2-3 (implementation + fix + lint-fix)
- Show the candidates to the user and confirm before touching anything

### 3. Safety checks — STOP if any of these are true
- The target commit has been pushed to a shared branch AND has PR reviews or CI runs against it → ask user to confirm force-reverting
- There are uncommitted changes in the working tree → ask to commit or stash first
- There are commits AFTER the target step on the same branch (means subsequent steps already ran) → ask whether to undo those too or bail

### 4. Execute the revert
Choose the safest method available:

**Preferred — revert (non-destructive):**
```bash
git revert --no-edit <commit-sha>
```
Creates a new commit that undoes the changes. History is preserved. Works even if pushed.

**Alternative — reset (only if commit is unpushed AND user confirms):**
```bash
git reset --hard HEAD~N
```
Destructive. Use only when the commits never left the local machine.

Default to `revert`. Only use `reset` with explicit user approval.

### 5. Update the plan file
- Change the reverted step's marker from ✅ back to ⬜
- If the plan had a "last executed" timestamp per step, update it

### 6. Update `.claude/state.json`
- Decrement `currentStep` by the number of undone steps
- Update `lastActivityTimestamp`
- Add `lastUndoAt` and `lastUndoReason` fields (prompt user for reason if not in $ARGUMENTS)

### 7. Log a supersede decision
Append to `.claude/decisions.jsonl`:
```json
{"ts":"...","issue":"PROJ-123","type":"undo","step":N,"reverted_commits":["sha1","sha2"],"reason":"<user-provided or 'approach didn't work'>","supersedes":"<ts of the decision the undone step created, if any>"}
```

If the step had created an entry in `decisions.jsonl`, the new entry should set `supersedes` to that timestamp. This keeps the log consistent — the log never forgets, it just records that a prior decision was overturned.

### 8. Quarantine related learnings
If the reverted step created any learnings in `.claude/learnings/` that no longer apply, **do not delete them** — move them to `.claude/learnings/archive/` with a note appended:
```markdown
## Archived
Reason: superseded by undo of step N on <date>
```

### 9. Sync Linear
Add a comment on the Linear issue:
```
↩ Undid step N — <reason>
Commits reverted: <list>
Next up: re-attempt step N with a different approach
```

Do NOT change the Linear status — the issue is still in progress.

### 10. Report
Show the user:
- Which commits were reverted (with SHAs)
- Which plan step was rolled back
- What learnings/decisions were quarantined
- A suggested next command (`/implement` to retry, `/plan` to replan the step, `/spec` if the requirements themselves need rework)

## Important

- **Never revert commits that belong to a different issue.** Filter strictly by the issue ID in commit messages.
- **Never delete history by default.** Revert, don't reset.
- **Always log the undo as a decision.** Without this, `/retro` loses visibility into churn.
- **Undo is not "try again harder".** If the step has been undone twice, stop and ask the user to re-run `/plan` or `/spec` for that step. Repeated undos are a signal the plan is wrong, not the execution.

## Batch mode

If invoked for multiple issues at once (`/undo PROJ-123 PROJ-124`), process each in isolation — they may live on different branches or in different worktrees. Do NOT assume they share state. Report a table of results at the end.
