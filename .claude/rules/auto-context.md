---
globs: **/*
---

# Auto-Context: Session Start Behavior

At the start of every new conversation, before doing anything else:

### 1. Check the pending-learnings buffer
Read `.claude/pending-learnings.txt` if it exists. This file is written by hooks capturing failure output from the previous session (lint errors, test failures, type errors). If it doesn't exist, skip.

For each entry:
- Ignore trivial/standard failures (typos, flakes, missing env vars)
- For each non-obvious failure, propose a learning file in `.claude/learnings/` following the format in `.claude/rules/learnings.md`
- Show the user the proposed learnings as a batch — they can accept all / reject all / pick
- After processing, truncate the buffer: `> .claude/pending-learnings.txt`

### 2. Load session state
Read `.claude/state.json` to find the current in-progress task. If the file is missing or empty, there's no active tracked task — step 5.

### 3. Prefer the handoff doc over the plan file
If `state.json.handoffFile` exists AND points to a file under `docs/plans/`:
- Read that handoff doc FIRST — it's the freshest source of truth
- Use its "next action" line as your opening suggestion
- Check its "Confidence per remaining step" section — any step listed there carries a concern; offer a re-plan for those steps
- Respect its "files that should NOT be touched" list
- Honor its "User feedback & preferences" section — those are standing corrections, not suggestions

If `state.json.handoffFile` points under `docs/handoff/` instead, it's a handoff *package* (see `.claude/rules/handoff-packages.md`): read the package's `PROMPT.md` and `00-README.md`, check for a `CLOSEOUT.md` (present = already executed — don't redo it), and surface the package as the next action. Pre-rule packages (anything written before this template landed) may lack a per-folder `PROMPT.md` — read `00-README.md` plus any shared protocol at the program root.

Otherwise fall back to reading the plan file in `state.json.planFile`.

### 4. If there's an active issue:
a. Check Linear for new comments or status changes since `lastActivityTimestamp`
b. Read the plan file (or handoff doc — see step 3)
c. Check `git log --oneline -5` to see recent work
d. Check `.claude/learnings/` for any learnings matching files in the current branch's diff
e. Check `.claude/decisions.jsonl` for entries in the last 7 days matching the current issue
f. Check `.claude/batches/` for any active batch manifest — if one exists and the current issue is part of it, surface that context
g. Present a 3-6 line summary:
   - Current issue ID + title
   - Which step you're on (N/total) + confidence if available
   - Any new Linear comments since last session
   - Any pending learnings that were captured
   - The "next action" from the handoff, if any
   - Any blockers or warnings

### 5. If there's no active issue
Say so and suggest `/sync`, `/pull-task`, or `/batch` depending on intent. (Non-Linear work — content sessions, strategy sessions — doesn't need this system; just proceed normally.)

### 6. If a batch is active
If `.claude/batches/` has a manifest from the last 24h with status != "completed":
- Surface it: "Active batch: <file>. X/Y issues complete. Last updated <ts>."
- Suggest `/batch status` or inspecting individual worktrees.

## Keep the summary brief
The user knows their project. Don't re-explain what the issue is about unless they ask. Lead with the single most useful piece of information — usually "next action" from the handoff.

## What this rule replaces

This rule replaces the need to manually run `/continue` at the start of each session. The user should be able to open Claude Code and immediately know where they stand.
