---
name: batch
description: Run multiple Linear issues in parallel via isolated git worktrees — plan, implement, commit, push, open PRs
---

Execute a batch of Linear issues in parallel isolated worktrees: $ARGUMENTS

This is the primary high-throughput command. Use it when you want to ship several issues at once without cherry-picking per issue. Each issue runs in its own git worktree with its own sub-agent, fully isolated — a failure in one doesn't abort the others, and the sub-agents can't corrupt each other's state.

## Invocation patterns

All of these are valid:

```
/batch SAL-473 SAL-471 SAL-474 SAL-419 SAL-475
/batch Implement SAL-473, SAL-471, and SAL-474 in parallel worktrees
/batch all In Progress issues assigned to me
/batch SAL-473,SAL-471,SAL-474 --review-plans
/batch SAL-473 SAL-471 --no-ship
/batch SAL-473 SAL-471 --pair
/batch SAL-473 SAL-471 --dry-run
```

## Flags

| Flag | Effect |
|------|--------|
| `--dry-run` | Don't spawn any sub-agents. For each issue, produce a readiness check (spec present? policies applicable? recent activity in the area?) and a proposed branch name. Report what the batch WOULD do. |
| `--review-plans` | After each sub-agent writes its plan, pause and show all plans as a batch for human review BEFORE any code is written |
| `--pair` | Each sub-agent uses `/pair` mode instead of `/implement` |
| `--no-ship` | Stop after commit+push, don't open PRs |
| `--no-push` | Stop after commit, don't push |
| `--sequential` | Run issues one at a time instead of in parallel (useful when issues share files) |
| `--max-parallel N` | Cap concurrency (default: 5) |
| `--base <branch>` | Base branch for PRs (default: `main`, the repo's default branch) |

## Process

### 1. Parse the request
- Extract issue IDs from $ARGUMENTS (regex `[A-Z]+-\d+` or natural language)
- If $ARGUMENTS describes a query ("all In Progress assigned to me"), run the Linear MCP query first to resolve to concrete IDs
- Extract flags
- Confirm the parsed list with the user:
  ```
  Batch target (N issues):
    1. SAL-473 — <title> (priority: High, spec: exists)
    2. SAL-471 — <title> (priority: Medium, spec: missing)
    ...
  Flags: --review-plans
  Max parallel: 5

  Proceed? [y/N]
  ```
  Wait for confirmation unless $ARGUMENTS explicitly says "no confirmation" or "go".

### 2. Pre-flight checks
Before spawning any sub-agents:
- Verify working tree is clean (`git status`) — batch mode assumes a clean starting point
- Verify the current branch is the intended base
- Verify `git worktree list` doesn't have stale leftover worktrees from a previous batch; clean up if found (prompt user)
- For each issue, check `.claude/policies/*.md` — if any policy with `requires: ["human-approval"]` matches an issue's likely target files, surface it and require explicit acknowledgment
- Write a batch manifest to `.claude/batches/<YYYY-MM-DD-HH-MM>.json`:
  ```json
  {
    "ts": "...",
    "base": "main",
    "issues": ["SAL-473", "SAL-471"],
    "flags": ["--review-plans"],
    "status": "planning",
    "subagents": {}
  }
  ```

### 3. Dry-run handling
If `--dry-run` is set:
- Do NOT spawn sub-agents
- For each issue, produce a readiness row:
  ```
  Issue     Spec?    Policies             Recent activity      Would launch?
  SAL-473   ✅        no blockers          Clean                ✅
  SAL-471   ❌        content-drafts-only  Clean                ⚠ needs /spec
  SAL-474   ✅        no blockers          file in-flight       ⚠ file overlap with SAL-473
  ```
- Stop here. The user can then decide whether to address the gaps and re-run without `--dry-run`.

### 4. Spawn sub-agents in worktrees
For each issue, launch a sub-agent via the Agent tool with `isolation: "worktree"`. Each sub-agent gets a self-contained prompt — it does NOT share context with the main batch agent. (Do NOT pass `model:` overrides — sub-agents inherit the session model per the standing all-Fable rule.)

**Sub-agent prompt template:**
```
You are a Claude Code sub-agent running inside an isolated git worktree. Your job is to fully deliver Linear issue <ISSUE-ID> end-to-end. Do not wait for human input unless you hit a blocker.

## Your environment
- You are in a git worktree at: <worktree path>
- Base branch: <base>
- Fresh branch you MUST create: <issue-id-lowercase>-<short-description>
- You have full read/write access to this worktree only
- Your worktree has its own .claude/ directory — any entries you append to .claude/decisions.jsonl are LOCAL to this worktree and will reach main only when your PR is merged

## Your task
Deliver issue <ISSUE-ID> end-to-end:

1. Fetch the issue from Linear via MCP. Read description, comments, linked issues.
2. Follow .claude/commands/pull-task.md to set up the branch and write a plan to docs/plans/<issue-id>.md.
3. <IF --review-plans: STOP here and output the plan to the main agent. Wait for approval before continuing.>
4. Follow .claude/commands/implement.md for each plan step. Respect plan-drift, learnings, module docs, decisions, and policies as you would in interactive mode.
   <IF --pair: Use .claude/commands/pair.md instead of implement.md>
5. After all steps pass, follow .claude/commands/ship.md to open a PR against <base>.
   <IF --no-ship: skip ship, just commit + push>
   <IF --no-push: skip push entirely>
6. If you hit a blocker you cannot resolve without human input, STOP and report:
   - What you were doing
   - What the blocker is
   - What you tried
   - What you recommend
   Do NOT make destructive decisions unilaterally.

## Policies in force
<list of applicable policies from .claude/policies/ — hard rules you MUST follow>

## Prior decisions that may apply
<grep decisions.jsonl for entries mentioning files likely to be in this issue's scope>

## Report format
When done (or blocked), return a JSON block. If you cannot produce valid JSON, write the result as a markdown section with the same fields — the orchestrator will parse either:
{
  "issue": "<ISSUE-ID>",
  "status": "shipped" | "committed" | "blocked" | "failed",
  "branch": "<branch-name>",
  "pr_url": "<url or null>",
  "commits": ["sha1", "sha2"],
  "steps_completed": N,
  "steps_total": N,
  "decisions_logged_local": N,
  "learnings_created_local": N,
  "blocker": "<description or null>",
  "next_action": "<what the human should do or null if shipped>"
}

Follow the rules in .claude/rules/*.md and the conventions in CLAUDE.md / AGENTS.md.
```

Launch the sub-agents in parallel via a single message with multiple Agent tool calls, respecting `--max-parallel`.

### 5. Monitor and gate
- If `--review-plans`: wait for all sub-agents to report their plans. Show them to the user as one batch. Collect approve/reject per plan. Resume approved sub-agents, abort rejected ones.
- Otherwise: let them run to completion.
- Update the batch manifest as each sub-agent finishes.

### 6. Collect results and report

Produce a summary table:

```
Batch results — <ts>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issue     Status      Steps   PR                           Notes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAL-473   ✅ shipped  7/7    https://github.com/.../123   3 local decisions, 1 local learning
SAL-471   ✅ shipped  4/4    https://github.com/.../124   -
SAL-474   ⚠ blocked  2/5    -                            Needs design decision on X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shipped: 2 | Blocked: 1 | Total: 3
Worktrees preserved for blocked/failed.
```

### 7. Handle blocked/failed issues
- **Blocked**: show the blocker, suggest next command (`/spec`, `/plan`, human decision). Worktree is preserved for inspection.
- **Failed**: show the error, ask whether to `/undo` or leave for inspection. Worktree is preserved.
- For shipped issues, optionally clean up the worktree after confirmation.

### 8. Decision log merging
**Honest caveat:** each sub-agent's `.claude/decisions.jsonl` is local to its worktree. Those entries reach the main repo only when the PR is merged. This means:
- While the batch is running, the main repo's decision log is NOT getting new entries
- After all PRs merge, the main log has all the entries from all merged branches (no conflicts because the file is append-only JSONL)
- If you want to see decisions from an in-flight sub-agent, `cd` into its worktree and `cat .claude/decisions.jsonl`

The orchestrator does NOT try to merge decision logs across worktrees in real-time — that would require symlinks or shared file locks, which cause more problems than they solve. Accept that decisions live in branches until merge.

### 9. Log the batch itself
Append to the main repo's `.claude/decisions.jsonl` (the orchestrator has direct access to the main repo, so this is fine):
```json
{"ts":"...","type":"batch","manifest":".claude/batches/<file>.json","issues":3,"shipped":2,"blocked":1,"failed":0,"duration_s":N}
```

This feeds `/retro` — it tracks batch throughput over time.

## Safety rules

- **Never run a batch without confirming the issue list.** Confirmation is always on unless the user explicitly says "go".
- **Never batch more than 10 issues at once.** If the user asks for more, split into groups and ask which to run first.
- **File-overlap detection is best-effort.** Batch mode scans the issue descriptions and any existing plans for file mentions, but the real overlap check happens when sub-agents actually write plans. If you know two issues touch the same files, pass `--sequential` explicitly.
- **Never auto-merge PRs.** Batch opens PRs. Merging is always human.
- **Preserve worktrees on failure.** Clean up only after explicit approval.
- **If the main repo's working tree becomes dirty mid-batch**, STOP — something went wrong with worktree isolation.

## What batch mode is NOT for

- **Exploratory work** — run interactively first if you don't know what the solution looks like
- **Issues with missing specs** — sub-agents can't ask clarifying questions mid-flight; use `/spec` first
- **Large refactors touching shared files** — use `--sequential` or don't batch them
- **Sanity content publishing** — publishing stays manual in `/studio`, never batched

## After the batch

Next natural steps:
- Review open PRs (they're linked in the results table)
- `/handoff` for blocked issues to write continuity docs
- `/retro` every few weeks to check batch health trends
