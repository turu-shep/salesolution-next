---
name: watch-pr
description: Poll a PR for new review comments, classify them, propose fixes, respond inline
---

Watch and auto-address PR review feedback for: $ARGUMENTS

Close the review loop without waiting for a human to manually check after every comment. This command polls a PR, classifies incoming comments, and proposes fixes — but NEVER auto-applies changes to a PR without human approval in the default mode.

## Invocation patterns

```
/watch-pr                  # watches the PR linked to the current issue
/watch-pr 123              # watches PR #123 in the current repo
/watch-pr owner/repo#123   # watches a specific PR anywhere
/watch-pr --auto-fix       # proposes AND applies nit-level fixes (still pauses for blockers)
/watch-pr --once           # one-shot poll, don't loop
/watch-pr --interval 5m    # polling interval (default: 10m)
```

## Process

### 1. Resolve the PR
- If no argument: read `.claude/state.json` for `prUrl`
- Otherwise parse the PR identifier
- Use `gh pr view <num> --json reviews,comments,state,headRefName`

### 2. Read current review state
Fetch:
- All review comments (line-level)
- All issue-level comments
- Review status (APPROVED / CHANGES_REQUESTED / PENDING)
- CI status

### 3. Filter for new comments
Maintain a cursor: `.claude/watch-pr/<pr-num>.json` tracks the last-seen comment timestamp. On each poll, process only comments newer than the cursor.

### 4. Classify each new comment
For each unprocessed comment, classify into ONE of:

| Class | Definition | Action |
|-------|-----------|--------|
| **nit** | Style, naming, tiny refactor — no behavior change | Propose a one-line fix. Auto-apply if `--auto-fix` |
| **question** | Reviewer is asking for clarification, not change | Draft a reply, do not modify code |
| **suggestion** | Proposed alternative approach, non-blocking | Evaluate, reply with agreement or disagreement (with reasoning) |
| **blocker** | Must be addressed before merge (bug, security, wrong approach) | NEVER auto-fix. Propose a plan to the user. |
| **out-of-scope** | Reviewer asking for something not in this PR | Reply politely deflecting, suggest a follow-up issue |

Classification heuristics:
- Comments containing "blocking", "must", "this is wrong", "breaks", "bug" → blocker
- Comments containing "?" without a clear request → question
- Comments like "consider", "maybe", "could" → suggestion
- Comments like "nit:", "tiny:", "whitespace" → nit
- Comments proposing new features beyond the issue → out-of-scope

When unsure, default to the stricter classification (treat ambiguous as blocker).

### 5. Report
Output a table:

```
PR #123 — <title>
Review status: CHANGES_REQUESTED by <user>
CI: ✅ passing

New comments since last check: 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Class        Count  File:line              Reviewer   Action
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
nit          3      lib/schema.ts:42       @reviewer  proposed fix → [Y/n]
question     2      app/api/lead/route.ts  @reviewer  drafted reply → [show]
blocker      1      app/api/lead/route.ts  @reviewer  needs human — see below
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. Take action based on mode

**Default mode** (no flags):
- Show the table
- For nits: propose the fixes, wait for user approval
- For questions/suggestions: show drafted replies, wait for user approval
- For blockers: STOP, summarize, do NOT attempt a fix

**Auto-fix mode** (`--auto-fix`):
- Nits: apply fixes automatically, commit with message `fix(review): address nit from @<reviewer> [SAL-XXX]`, push
- Questions: post the drafted reply inline on the PR comment
- Suggestions: show drafted reply, wait for user
- Blockers: STOP as above — auto-fix does NOT escalate to blockers

After auto-applying, leave a summary comment on the PR: "Addressed 3 nits in <sha>. Still open: 1 blocker, 2 questions."

### 7. Update cursor
After processing, update `.claude/watch-pr/<pr-num>.json` with the latest comment timestamp.

### 8. Loop or exit
- If `--once`: exit after one poll
- Otherwise: sleep for the interval and repeat
- Exit conditions: PR merged, PR closed, PR approved and no new comments for 24h, user interrupt

### 9. Log the session
When the watcher exits, append to `.claude/decisions.jsonl`:
```json
{"ts":"...","type":"watch-pr","pr":"<url>","polls":N,"comments_processed":N,"auto_fixed":N,"blockers_surfaced":N,"duration_s":N}
```

## Important

- **Never auto-fix blockers.** Blockers represent a human judgment call. Escalate.
- **Never reply with placeholder text.** Drafted replies should be substantive — if you can't draft a substantive reply, say so and let the human write it.
- **Respect review etiquette.** Don't reply to every nit with a long explanation. Keep replies tight.
- **Always link to the commit.** When auto-fix applies a change, the PR comment should link directly to the fix commit.
- **If CI fails after an auto-fix, STOP immediately.** Don't keep polling — something's broken and the human needs to look.
- **Don't loop forever.** If no new comments in 24h AND the PR isn't approved, exit with a note suggesting the human ping reviewers.

## Scheduling

For runs without a user session: use the Claude Code `schedule` skill or `/loop` to run `/watch-pr --once` every 15-30 minutes while PRs are open.

## Batch mode

If watching multiple PRs (`/watch-pr 123 124 125`), run the polls in parallel but keep the cursors separate. Report one section per PR in the output.
