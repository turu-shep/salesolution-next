---
globs: **/*
---

# Decision Log

This project maintains a decision log at `.claude/decisions.jsonl` — an append-only record of choices made during implementation that future sessions need to know about. Commit messages say WHAT changed; the decision log says WHY a path was taken.

## How entries get into the log (command-driven)

The decision log is populated by **specific commands at specific events**, not by Claude's judgment of "this felt non-obvious". Judgment-based logging proved unreliable — Claude's sense of what's worth logging varies, and the log ends up either under-populated or padded with routine work.

The commands that emit decisions and the events that trigger them:

| Command | Event | `type` |
|---------|-------|--------|
| `/implement` | Chose between 2+ approaches for a step | `approach-choice` |
| `/implement` | Accepted plan drift and proceeded anyway | `proceed-despite-drift` |
| `/implement` | Rejected a user suggestion | `user-suggestion-rejected` |
| `/implement` | Deferred work explicitly ("not handling X yet") | `deferred` |
| `/implement` | Worked around a library/framework limitation | `workaround` |
| `/implement`, `/ship`, `/batch` | Overrode a policy | `policy-override` |
| `/pair` | Completed a pair session | `pair-session` |
| `/batch` | Completed a batch run | `batch` |
| `/ship` | Opened a PR | `ship` |
| `/spec` | Wrote a new spec | `spec` |
| `/retro` | Completed a retro | `retro` |
| `/health` | Generated a health snapshot | `health` |
| `/postmortem` | Wrote a postmortem | `postmortem` |
| `/undo` | Reverted a step | `undo` |

The command explicitly emits the entry — it doesn't ask Claude to decide whether to log.

## Format

Each line is a single JSON object. Append using `>>` — never rewrite the file.

```json
{"ts":"2026-08-08T14:32:00Z","issue":"SAL-123","step":3,"type":"approach-choice","decision":"Store glossary aliases as an array field, not separate docs","considered":["array field","separate alias docs"],"chose":"array field","why":"Separate docs would need weak-ref cleanup on every rename — confirmed against the draft-ref gotcha in prompts/_CONTEXT.md","files":["sanity/schemas/glossaryTerm.ts"]}
```

**Required fields:**
- `ts` — ISO-8601 timestamp (UTC)
- `type` — one of the types from the table above
- `decision` — one-sentence summary of what was decided

**Required for specific types:**
- `approach-choice`: `considered`, `chose`, `why`
- `policy-override`: `policy` (name), `why`
- `proceed-despite-drift`: `files` (with drift), `why`
- `workaround`: `what` (the limitation), `why`
- `deferred`: `what` (the deferred work), `why`
- Reporting types (`ship`, `batch`, `retro`, `health`, `postmortem`, `pair-session`, `spec`, `undo`): whatever metrics the command produces

**Optional but recommended:**
- `issue` — Linear issue ID
- `step` — plan step number
- `files` — files affected
- `supersedes` — timestamp of a prior decision this overrides

## How to use the log

**During `/implement`:** Before making a choice that falls into one of the trigger types above, grep the log for related decisions. If a past decision applies, follow it (or explicitly supersede it with reasoning logged as a new entry).

**During `/continue` and `/handoff`:** Include the last 5 decisions for the current issue in the session summary so the next session knows what was settled.

**During `/retro`:** The log is primary material — patterns across many decisions reveal what the project values, which policies are working, and which keep getting overridden.

## Appending a decision

Commands append via their documented emission points. If you're writing a new command that needs to log a decision, define the trigger event and type in the command spec, then emit the entry at that exact event. Don't add general-purpose "log a decision if you think it's interesting" instructions.

For one-off manual additions, the user or Claude can write directly:
```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","issue":"SAL-123","type":"approach-choice","decision":"...","chose":"...","why":"..."}' >> .claude/decisions.jsonl
```

Or use the Write/Edit tool.

**Commit the decision log.** It is shared knowledge, unlike `.claude/state.json` which is per-machine local.

## Why command-driven instead of judgment-driven

The earlier version of this rule said "log when something is non-obvious". In practice:
- Different sessions had different definitions of "non-obvious"
- The log was underpopulated in routine work and over-populated in dramatic debugging sessions
- Retrieval via grep was noisy

Command-driven logging fixes this by defining exact events. You always log at those events; you never log outside them. The log becomes a structured record instead of a diary.

## Worktree caveat (batch mode)

When a sub-agent in `/batch` writes to `.claude/decisions.jsonl`, those entries are LOCAL to the worktree. They reach the main repo only when the PR is merged. This is not a bug — it's how worktrees work. See `.claude/commands/batch.md` for the full explanation.
