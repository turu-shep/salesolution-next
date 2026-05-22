# Batch Mode Guide

This guide explains how to run multiple Linear issues at once via parallel isolated git worktrees. Batch mode is the template's highest-throughput workflow — you describe what you want in natural language, approve the parsed list, and the template ships N PRs while you go get coffee.

## The one-line mental model

> Batch mode gives you N parallel workers, each in an isolated worktree, each delivering one issue end-to-end.

- **Parallel**: up to 5 issues at once by default
- **Isolated**: each worker has its own git worktree — they can't corrupt each other
- **End-to-end**: each worker goes from Linear issue → plan → code → tests → PR
- **Safe**: policies block risky changes; `--review-plans` lets you gate before any code is written

## Quick start

The easiest way to use batch mode is to just describe what you want in plain English:

```
Implement PROJ-73, PROJ-71, PROJ-74, PROJ-19, PROJ-75, PROJ-77, PROJ-72 in parallel worktrees.
Create branches, implement, commit, push, and open PRs.
```

Claude Code recognizes this as a batch request (via `.claude/rules/batch-mode.md`), parses out the issue IDs, confirms the list with you, and launches the sub-agents.

You never have to type `/batch` explicitly if you don't want to. The natural-language form is the primary interface.

## Other natural invocations

All of these work:

```
Let's knock out PROJ-19, PROJ-75, and PROJ-77
```
```
Ship PROJ-73 PROJ-71 PROJ-74 in pair mode
```
```
Do all the In Progress issues assigned to me in parallel
```
```
Run PROJ-73 and PROJ-74 but show me the plans before any code is written
```
```
Batch PROJ-73 PROJ-71 sequentially — they touch the same files
```

The template maps natural-language phrases to batch flags:

| You say | It does |
|---------|---------|
| "in pair mode", "with pair review" | `--pair` |
| "show me plans first", "let me see the plans" | `--review-plans` |
| "don't open PRs", "just commit" | `--no-ship` |
| "don't push" | `--no-push` |
| "sequentially", "one at a time" | `--sequential` |
| "against staging", "target main" | `--base <branch>` |
| "dry run", "what would this do", "don't actually run it" | `--dry-run` |

## The flow, step by step

### 1. You send a batch request

```
Implement PROJ-73, PROJ-71, PROJ-74 in parallel worktrees. Create branches,
implement, commit, push, and open PRs.
```

### 2. The template confirms

```
Batch mode — 3 issues detected.

  1. PROJ-73 — Add timezone support to calendar (priority: High, spec: exists)
  2. PROJ-71 — Fix race condition in booking flow (priority: Medium, spec: missing)
  3. PROJ-74 — Update email templates (priority: Low, spec: N/A)

Policies applicable to this batch:
  ⚠ auth-pairing does NOT apply (no files match)
  ⚠ migrations-rollback does NOT apply
  ✓ no-hardcoded-secrets applies to all

Warnings:
  ⚠ PROJ-71 has no spec. Consider /spec first, or proceed and let the sub-agent ask mid-flight.
  ⚠ PROJ-73 and PROJ-71 both touch lib/booking/availability.ts — forcing --sequential.

Max parallel: 5
Base branch: main
Flags: (inferred --sequential due to file overlap)

Proceed? [y/N]
```

### 3. You approve (or adjust)

Common adjustments:
- "yes but add `--review-plans`" — pause to inspect plans before code
- "skip PROJ-71 for now, run the other two in parallel" — filter the list
- "actually all three in parallel, I'll deal with merge conflicts" — override the sequential warning

### 4. The template spawns sub-agents

Each sub-agent runs in its own worktree:
```
.worktrees/proj-73-timezone-support/  ← sub-agent 1 works here
.worktrees/proj-71-booking-race/      ← sub-agent 2 works here
.worktrees/proj-74-email-templates/   ← sub-agent 3 works here
```

Each sub-agent:
1. Fetches the Linear issue via MCP
2. Reads the spec (if any) and module docs
3. Follows `/pull-task.md` to create its branch and write a plan to `docs/plans/proj-XXX.md`
4. Runs `/implement` for each step (respecting plan-drift, learnings, module docs, decisions, policies)
5. Runs `/ship` to open a PR
6. Returns a JSON result to the main agent

### 5. You get a results table

```
Batch results — 2026-04-10T14:32:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issue     Status      Steps  PR                            Notes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJ-73   ✅ shipped  7/7   https://github.com/.../123    3 decisions, 1 learning
PROJ-71   ⚠ blocked   2/5   -                             Needs design decision on X
PROJ-74   ✅ shipped  3/3   https://github.com/.../125    -
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shipped: 2 | Blocked: 1 | Failed: 0 | Total: 3
Worktrees preserved for blocked/failed: .worktrees/proj-71-booking-race/
```

### 6. You handle the blocked ones

For PROJ-71 you can now:
- `cd .worktrees/proj-71-booking-race/` and inspect
- Answer the design question and run `/continue` in that worktree
- Or run `/undo` and re-plan the whole thing
- Or run `/spec PROJ-71` to write missing acceptance criteria, then re-batch it

## Safety rails

Batch mode has several hard rules to prevent disasters:

| Rail | Why |
|------|-----|
| **Max 10 issues per batch** | More than this and the confirmation list becomes unreadable. Split into groups. |
| **Overlapping files force sequential** | Two sub-agents editing the same file in parallel worktrees would collide on merge. Pre-detected via plan analysis. |
| **Policies apply to the whole batch** | If any issue in the batch would trigger a blocking policy, the policy fires before sub-agents launch. |
| **Never auto-merge PRs** | Batch mode opens PRs. Merging is always human-approved. |
| **Worktrees preserved on failure** | Failed/blocked sub-agents leave their worktree intact so you can inspect. |
| **Dirty working tree aborts batch** | Batch mode assumes a clean starting point. If git status isn't clean, you're asked to commit or stash first. |

## Common patterns

### Pattern 1: High-confidence batch

You have 5 well-defined issues with specs. You trust the plans.

```
Implement PROJ-73, PROJ-71, PROJ-74, PROJ-19, PROJ-75 in parallel worktrees.
```

### Pattern 2: Safety-first batch

Same 5 issues, but you want to see the plans before any code.

```
Run PROJ-73, PROJ-71, PROJ-74, PROJ-19, PROJ-75 in parallel but show me the plans first.
```

The sub-agents will stop after writing their plans and the main agent will present all 5 for your review. You approve, reject, or re-plan each one before code is written.

### Pattern 3: High-stakes batch

Issues touching auth, payments, or other sensitive areas. Use pair mode.

```
Implement PROJ-73 and PROJ-74 in pair mode — they touch auth.
```

Or — because `example-auth-pairing.md` is a blocking policy — the template will automatically refuse to batch auth issues without `--pair`. You don't have to remember.

### Pattern 4: Spec-first batch

You have a sprint of vague tickets. Write specs first, then batch.

```
Write specs for PROJ-73, PROJ-71, PROJ-74, PROJ-19.
```

(This runs `/spec` on each, one at a time — specs need human judgment.)

Then, after reviewing the specs:

```
Implement PROJ-73, PROJ-71, PROJ-74, PROJ-19 in parallel worktrees.
```

The batch sub-agents read the specs you just wrote and their plans will be much tighter.

### Pattern 5: Dry-run before committing to a batch

Not sure if a set of issues is batch-ready? Use `--dry-run` to get a readiness report without spawning anything:

```
Dry-run PROJ-73, PROJ-71, PROJ-74 — what would a batch actually do?
```

The template will produce a table like:

```
Issue     Spec?    Policies         Recent activity      Would launch?
PROJ-73   ✅        no blockers      Clean                ✅
PROJ-71   ❌        auth-pairing     Clean                ⚠ needs /spec + /pair
PROJ-74   ✅        no blockers      file in-flight       ⚠ file overlap with PROJ-73
```

No sub-agents are spawned. You can then address the gaps (write the missing spec, switch to pair mode, re-order) and run the real batch with confidence.

Dry-run is the recommended first step when batching a new group of issues you haven't batched before.

### Pattern 6: Linear query as input

```
Batch all In Progress issues assigned to me.
```

The main agent runs a Linear query first, resolves to concrete IDs, shows you the list, and proceeds on approval.

### Pattern 7: Mid-batch rescue

A batch finishes with 3 shipped and 4 blocked. You triage:

```
For the blocked ones, /handoff each of them — I'll deal with them tomorrow.
```

This writes a handoff doc for each blocked worktree with the "next action" clearly stated, so you (or a fresh session) can pick up each one cold.

## Anti-patterns (don't do this)

### ❌ "Just do all 50 open issues"

Batch mode caps at 10 per run. More than that and you're asking for unreviewable chaos. Split into groups by theme or area.

### ❌ "These 5 issues all touch the same file"

Sub-agents in parallel worktrees can't merge conflicting edits to the same file cleanly. Use `--sequential` if you really want them in one command, but the pattern is a smell — the 5 "issues" probably want to be 1 issue.

### ❌ "Batch everything, I'm going on vacation"

Batch mode is not autonomous-over-days. Sub-agents can hit blockers. You need to triage the results. If you're away, DON'T batch — wait until you can supervise.

### ❌ "Skip the confirmation, just go"

The confirmation step is cheap and catches parse errors. A single misread issue ID can cost an hour. Always confirm.

### ❌ "Batch without any spec or plan context"

Sub-agents can't ask clarifying questions in real time. If the issues are vague, write specs first. The 10 minutes spent on `/spec` saves 3 hours of wrong-direction code.

## How batch mode fits into the broader workflow

```
      /sync                    ← see what's in Linear
         ↓
      /spec (for vague issues) ← pin down WHAT
         ↓
      /batch                   ← run N issues in parallel
         ↓
   ┌──── for each result ────┐
   │                         │
 shipped                  blocked/failed
   │                         │
 /watch-pr (v2.3)        /continue in worktree
 closes review loop      (or /undo, /spec, etc.)
   │                         │
   └────── /ship PR ─────────┘
                  ↓
            human review → merge
                  ↓
            /health (after merge)
                  ↓
            /retro (every 2-4 weeks)
```

## Batch + the rest of v2.1/v2.2/v2.3

Every v2.x command is batch-aware:

- **`/undo PROJ-123 PROJ-124`** — revert the last step for multiple issues (sequential, each in its own branch/worktree)
- **`/handoff`** — after a batch, writes one handoff doc per blocked issue
- **`/spec PROJ-73 PROJ-71`** — writes specs sequentially (specs need human judgment, not parallelism)
- **`/ship proj-73-foo proj-74-bar`** — re-ship multiple branches after fixes
- **`/health`** — single snapshot for the whole repo, not per-issue (includes batch success rate as one of its metrics)
- **`/watch-pr 123 124 125`** — poll multiple PRs in one command, cursors kept separate
- **`/postmortem`** — single incident, not batched

## Where decisions and learnings go during a batch

**Important honest caveat (new in v2.4):** Each sub-agent in a batch runs in its own git worktree. Any entries the sub-agent appends to `.claude/decisions.jsonl` or files it creates in `.claude/learnings/` are LOCAL to that worktree. They reach the main repo only when the PR is merged.

This means:
- **During the batch**, the main repo's `decisions.jsonl` is NOT getting new entries from sub-agent work.
- **If you want to see what decisions a sub-agent has logged**, `cd` into its worktree and read the file there: `cat .worktrees/proj-71-foo/.claude/decisions.jsonl`.
- **After PRs merge**, all the sub-agents' entries arrive in the main log (JSONL append-only means no merge conflicts on append-only lines).
- **The batch orchestrator itself** writes one summary entry to the main repo's `decisions.jsonl` when the batch completes. That entry reflects the batch's aggregate result, not the sub-agents' internal decisions.

This is not a bug — it's how worktrees work. Trying to share decision logs in real-time across worktrees would require symlinks or file locks, which cause more problems than they solve. Accept that per-issue decisions live in branches until merge.

## Debugging a batch

If something goes wrong:

1. **Check the manifest.** Every batch writes `.claude/batches/<timestamp>.json` with the issue list, flags, and sub-agent results.
2. **Inspect the worktrees.** `git worktree list` shows all active worktrees. `cd` into a failing one to see its state.
3. **Read the sub-agent's local artifacts.** Each worktree has its own `.claude/` — that's where its decisions and learnings live until PR merge.
4. **Check the main log for the batch summary entry.** Grep `.claude/decisions.jsonl` for `type: batch` — that's the orchestrator's record, not the per-issue decisions.
5. **`/retro`** — after several batches, retro reveals which types of batches succeed and which fail (uses the batch summary entries).

## Rollback

If a batch produces bad results and you want to abandon:

```
Close all PRs from batch 2026-04-10T14:32 and delete the worktrees
```

The template will:
1. Look up the manifest
2. Close the PRs (via `gh pr close`)
3. Remove the worktrees (`git worktree remove`)
4. Delete the branches (with confirmation)
5. Log the rollback as a decision

This is destructive — it requires explicit confirmation for each PR.

## FAQ

**Q: Can I batch across multiple repos?**
A: Not currently. v3 has multi-repo on the roadmap. For now, batch within one repo.

**Q: What if two sub-agents create conflicting decisions in `decisions.jsonl`?**
A: They can't directly conflict during the batch — each sub-agent writes to its own worktree's copy of the file (see "Where decisions and learnings go during a batch" above). When both PRs merge into main, the append-only JSONL format means the entries simply interleave — no line-level conflicts. The only real conflict scenario is if two sub-agents both write a `supersedes` entry targeting the same past decision; that's rare and surfaces at PR merge time as a normal git conflict on any lines that overlap.

**Q: How do I speed up a batch?**
A: Smaller issues, better specs, `--no-push` if you don't need preview deploys, `--max-parallel N` higher (if your machine can handle it). Batch mode is I/O bound on git operations; past 5-6 parallel workers the speedup drops off.

**Q: Can I batch `/pair` mode for everything?**
A: Yes: add `--pair` or say "in pair mode". Each sub-agent will run its own nested review loop. Slower but higher confidence.

**Q: What happens if my laptop closes mid-batch?**
A: Sub-agents die with the parent session. The manifest is preserved. On next session, `auto-context` surfaces the active batch and you can decide: resume the blocked ones (`/continue` in each worktree) or abandon.

**Q: Do batches respect my `.env.local` / secrets in sub-agents?**
A: Each worktree is a regular git checkout — it does NOT copy gitignored files. If a sub-agent needs `.env.local`, either copy it manually, symlink, or put environment-specific logic behind feature flags that work without the file. The `no-hardcoded-secrets` policy will still block anything committed by accident.
