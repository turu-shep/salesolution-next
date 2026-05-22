---
name: implement
description: Implement the next uncompleted step from a plan, syncing with Linear
---

Implement the next uncompleted step from: $ARGUMENTS

## Process

### 1. Load context
- Read `.claude/state.json` to find the current issue and plan
- If $ARGUMENTS specifies a different plan/issue, use that instead
- Read the plan file
- Find the next step marked with ⬜ (steps execute sequentially — even if the DAG shows multiple steps with no dependencies, run them one at a time for a clean commit history and to avoid races)

### 2. Check plan drift
Apply `.claude/rules/plan-drift.md`:
- Get the plan's write timestamp
- For each file in the step's `Files:` list, check `git log --since="<plan-ts>" --oneline -- <file>` and `git status --short <file>`
- If material drift is detected, STOP and ask the user how to proceed (proceed / re-plan / skip)
- If the user chooses "proceed anyway", log a `type: proceed-despite-drift` entry to `.claude/decisions.jsonl`

### 3. Check policies
Read `.claude/policies/*.md`. For each policy whose `triggers:` list includes `implement` and whose `files:` pattern matches any file in the step:
- Run the policy's `requires:` checks (only the ones the command knows how to verify — see `.claude/rules/policies.md`)
- If `enforcement: block` and a required check fails → STOP, surface the policy, require explicit override (user types `override policy <name>`)
- On override, log a `type: policy-override` entry to `.claude/decisions.jsonl` with the policy name and user reason
- If `enforcement: warn` and a check fails → show the warning, continue

### 4. Load knowledge for this step
- **Learnings**: Read `.claude/learnings/` — list any whose `files:` pattern matches files in the step
- **Module docs**: For each file in the step, check if a `.claude/rules/ctx-*.md` rule matches. If so, read the referenced `docs/modules/*.md`
- **Decisions**: Grep `.claude/decisions.jsonl` for entries mentioning files in the step — if prior decisions apply, follow them (or explicitly supersede with reasoning)

### 5. State what you'll do
Before writing code, output:
- Step N: <description>
- Files: <list>
- Approach: <1-3 sentences>
- Learnings you're accounting for (if any)
- Module invariants you must preserve (if any)
- Prior decisions you're following (if any)

### 6. Implement
- Follow project conventions in CLAUDE.md
- Run the project's formatter/linter after each file change
- Write tests if the step involves business logic or API routes

### 7. Log decisions at specific events
Emit an entry to `.claude/decisions.jsonl` when any of these happens:
- You chose between two viable approaches (include both alternatives and the reason)
- You rejected a user suggestion and picked something else
- You introduced a new pattern the codebase doesn't use yet
- You deferred work explicitly (noted "not handling X yet because Y")
- You worked around a library or framework limitation
- You overrode a policy (per step 3)

Do NOT log routine pattern-following work. See `.claude/rules/decisions.md` for the format.

### 8. Verify
- Run lint / type-check / tests for changed files
- If anything fails, fix it
- **If the failure reveals a non-obvious gotcha, create a learning** in `.claude/learnings/` (format in `.claude/rules/learnings.md`)

### 9. Update module docs
If the change materially alters a module's behavior, data model, flows, or invariants:
- Update the corresponding `docs/modules/<name>.md`
- Bump the `## Last updated` line
- Include the update in the same commit

### 10. Commit and sync
- Mark the step as done in the plan file (⬜ → ✅)
- Commit with Linear issue ID: `git commit -m "type(scope): description [ISSUE-ID]"`
- Push: `git push`
- Update `.claude/state.json`: increment `currentStep`, update `lastActivityTimestamp`
- Add a progress comment on the Linear issue: "Completed step N/total: [step description]"

### 11. If ALL steps are done
- Update Linear issue status to "In Review"
- Add final comment summarizing changes, new learnings, decisions, and module doc updates
- Suggest running `/ship` to create the PR

## After implementation, explain:
- Step completed
- Files created or modified
- Decisions logged (if any)
- Learnings created (if any)
- Module docs updated (if any)

## On multi-issue parallelism

This command runs **one step at a time in one branch**. If you want to work on multiple issues simultaneously, use `/batch` — it spawns one worktree-isolated sub-agent per issue, which is the only safe way to parallelize.

Step-level parallelism within a single issue was attempted in an earlier draft and removed: two sub-agents committing on the same branch in parallel produce races on git and on shared files like the plan markdown. If you think you need it, you probably want to split the issue via `/split-tasks` and then `/batch` the resulting sub-issues.
