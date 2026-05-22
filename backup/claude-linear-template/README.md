# Claude Code + Linear Workflow Template (v2.4)

A reusable template that adds a Linear-powered development workflow to any Claude Code project. Framework-aware, with a module knowledge base, decision log, plan drift detection, a policy engine, and natural-language batch execution across isolated git worktrees.

**v2.4 is an honesty pass.** v2.0 through v2.3 piled on features. v2.4 removes the features that were theater (step-level parallelism, auto-assigned learning severity, judgment-driven decision logging, preflight behavior verification) and reframes the ones that work to match what they actually do. The result is smaller, slower-sounding, and more trustworthy.

If you want the audit that produced v2.4, see the git history of this README — the v2.3 version made bigger claims.

---

## The one-line sell

You open Claude Code and type:

> *"Implement PROJ-73, PROJ-71, PROJ-74, PROJ-19, PROJ-75, PROJ-77, PROJ-72 in parallel worktrees. Create branches, implement, commit, push, and open PRs."*

The template recognizes the batch request, confirms the parsed list, spawns up to 5 parallel sub-agents in isolated git worktrees, and each sub-agent delivers one issue end-to-end — plan, code, tests, PR. You get a results table showing which shipped, which are blocked, and which failed.

That's the headline feature. It actually works. See [BATCH_GUIDE.md](BATCH_GUIDE.md).

The rest of the template is supporting infrastructure: knowledge systems, quality gates, and observability that make single-issue and batch work more reliable. Not every piece pulls equal weight — see "What's load-bearing vs. what's supporting" below.

---

## What's in each version

### v1.x (foundation)
Slash commands for the Linear loop, framework detection, learnings system, reviewer/test-runner/investigator agents, auto-context rule.

### v2.0 (knowledge systems)
| System | What it does |
|--------|--------------|
| **Module knowledge base** (`docs/modules/` + `.claude/rules/ctx-*.md`) | Positive knowledge auto-loaded when Claude edits matching files |
| **Decision log** (`.claude/decisions.jsonl`) | Records WHY a choice was made; now command-driven (v2.4) rather than judgment-driven |
| **Plan drift detection** | Stops execution when plan files have changed since the plan was written. Real, mechanical check. |
| **`/scan-modules`** | Bootstraps `docs/modules/` with observable sections (v2.4 leaves invariants/gotchas empty — they can't be reliably inferred) |
| **`/retro`** | Pattern spotter over learnings/decisions/plans/git. Produces observations with evidence and confidence levels. |
| **`/pair`** | Reviewer subagent sees the diff without the implementer's context. Better than self-review, not as good as a human. |

### v2.1 (multi-issue execution)
| System | What it does |
|--------|--------------|
| **`/batch`** (parallel worktrees) | The headline feature. Runs N issues simultaneously in isolated worktrees. Each sub-agent delivers one issue end-to-end. |
| **Batch-mode NL detection** | Natural-language batch requests route automatically — no slash-command syntax needed |
| **`/undo`** | Safely revert the last implement step via `git revert` + state rollback |
| **`/handoff`** | Continuity doc with verifiable sections (decisions, learnings, completed steps) and a reflection section the human should review before committing |

### v2.2 (quality gates)
| System | What it does |
|--------|--------------|
| **`/spec`** | Structured acceptance criteria before planning. The "non-goals" section is the real value — it prevents scope creep. |
| **`/ship` preflight** | Static checks against plan step "Expected outcome" fields. Generates a reviewer checklist for behavioral items that can't be auto-verified. |
| **Policy engine** (`.claude/policies/`) | Hard rules enforced before risky actions. v2.4 pruned the `requires:` vocabulary to only the checks commands can actually verify. |

### v2.3 (observability)
| System | What it does |
|--------|--------------|
| **`/health`** | Collects metrics (git counts, staleness, policy activity) and reports them with trend vs. previous snapshot. Does NOT score your project. |
| **`/watch-pr`** | Polls PR comments, classifies them, proposes fixes. Never auto-applies blocker-class changes. |
| **`/postmortem`** | Structured incident reconstruction. Ranks suspect commits by concrete evidence (file in stack trace, deploy timing) rather than fake probabilities. |
| **Scheduled jobs rule** | Guidance for running `/health`, `/retro`, `/watch-pr` on a cadence via cron or CI |

### v2.4 (honesty pass — cuts and reframes)

**Cuts (features that were broken or theater):**
- Step-level parallelism within `/implement` — git races on the same branch made this unsafe. Parallelism now lives at the issue level via `/batch` only.
- Auto-assigned learning severity — without a consistent rubric, severity became noise. Severity is now added manually or during `/retro`, not at capture time.
- The `Stop` hook that ran lint after every turn — too noisy as a default. Opt-in now (documented in `init.sh`).
- Judgment-driven decision logging ("log when something feels non-obvious") — replaced with command-driven logging at specific events.

**Reframes (features that work but were over-described):**
- `/scan-modules` no longer fabricates "Invariants" and "Known gotchas" — those sections are left empty with a TODO note until the team populates them.
- `/ship` preflight is now described as "static checks + reviewer checklist for behavioral items", not "verification of expected outcomes".
- `/retro` is a pattern spotter with confidence levels, not a self-improving oracle.
- `/health` reports metrics with Δ vs. the previous run instead of made-up 🟢🟡🔴 scores.
- `/postmortem` ranks suspects by concrete evidence, not by "probability".
- `/pair` is described honestly as "same model, fresh context", not "independent review".
- `/handoff` distinguishes verifiable sections (from logs) from reflection sections (may be inaccurate, should be human-reviewed).
- The policy `requires:` vocabulary was pruned to six reliably-enforceable checks: `pair-mode`, `spec-exists`, `no-hardcoded-secrets`, `rollback-sql-present`, `human-approval`, `linked-decision`.

**Additions:**
- `/batch --dry-run` flag — shows what the batch would do without spawning sub-agents.
- Honest documentation of worktree `decisions.jsonl` semantics — entries in sub-agent worktrees are local until PR merge.

---

## What's load-bearing vs. what's supporting

**Load-bearing (the template would be noticeably worse without these):**
- `/batch` — the multi-issue parallelism that makes the template worth using for real throughput
- `/pull-task` → `/plan` → `/implement` → `/ship` core loop — the Linear integration basics
- Plan drift detection — a real mechanical check that prevents executing stale plans
- Module knowledge base — when `docs/modules/*.md` exists and `ctx-*.md` globs match, Claude edits with actual context
- Policy engine — the 6 enforceable checks in the pruned vocabulary do real work
- Decision log as a committed artifact — even underpopulated, it's better than nothing when resuming work weeks later
- Linear MCP integration — `/sync`, `/pull-task`, `/push-task`, etc.

**Supporting (useful but not the reason to adopt the template):**
- `/spec` — forces quality thinking if humans actually use it; easy to skip for bug fixes
- `/undo` — nice to have, straightforward git ops, rarely used in practice
- `/handoff` — better than just abandoning a session; quality depends on human reviewing the reflection section
- `/scan-modules` — useful one-time bootstrap for observable sections
- `/retro` — pattern-spotting prompt; expect 2-3 useful observations per run among noise
- `/health` — good for tracking Δ over time; not useful as a one-shot snapshot
- `/watch-pr` — situational; most useful when a PR has many reviewers
- `/postmortem` — structured incident template; the value is having a consistent format

**Skip unless you have a specific need:**
- Scheduled jobs — only set up if you actually want cron-driven reports

---

## Quick start (new project)

```bash
# Run from any project directory:
/path/to/claude-linear-template/init.sh .

# Or specify a target:
/path/to/claude-linear-template/init.sh /path/to/my-project
```

The init script will:
1. **Detect your framework** (Next.js, Vite, Python, Ruby, Go, Rust, etc.)
2. **Ask for your Linear prefix** (e.g., `FA`, `ENG`, `APP`)
3. **Copy commands, agents, rules, and example policies** into `.claude/`
4. **Generate framework-specific `settings.json`** with format hooks
5. **Create `.mcp.json`** with Linear and Context7 MCP servers
6. **Initialize state files**: `state.json`, `decisions.jsonl`
7. **Create directory structure**: `docs/plans/`, `docs/specs/`, `docs/modules/`, `docs/postmortems/`, `.claude/policies/`, `.claude/batches/`, `.claude/health/`, `.claude/retros/`, `.claude/watch-pr/`, `.claude/learnings/`, `.claude/learnings/archive/`
8. **Replace `PROJ` placeholders** with your actual prefix
9. **Add local-only paths to `.gitignore`**

Safe to re-run — it skips existing files.

### What gets committed vs. what's local

**Committed (shared team knowledge):**
- `.claude/commands/`, `.claude/agents/`, `.claude/rules/`, `.claude/policies/`
- `.claude/learnings/`, `.claude/decisions.jsonl`
- `docs/plans/`, `docs/specs/`, `docs/modules/`, `docs/postmortems/`
- `.claude/settings.json`, `.mcp.json`, `.claude/health/*.md`, `.claude/retros/*.md`

**Gitignored (per-developer local state):**
- `.claude/state.json` — current task cursor
- `.claude/pending-learnings.txt` — (only used if you opt into the failure-capture hook)
- `.claude/watch-pr/` — PR polling cursors
- `.claude/batches/` — batch manifests

### After `init.sh` runs

1. **Add the CLAUDE.md snippet** — the init script prints it at the end. Paste it into your project's `CLAUDE.md`.
2. **Start Claude Code** — Linear MCP will prompt for authentication on first use.
3. **Run `/sync`** to see your Linear dashboard.
4. **Run `/scan-modules`** to bootstrap `docs/modules/` (observable sections only). One-time step.
5. **Review example policies** in `.claude/policies/` — keep, edit, or delete.
6. **Run `/pull-task`** for a single issue, or describe a batch in natural language for multiple.

### First-week checklist

- [ ] `/scan-modules` produced a reviewed `docs/modules/` structure (observable sections only; invariants/gotchas will fill in over time)
- [ ] `.claude/rules/ctx-*.md` globs match your actual source layout
- [ ] Shipped at least one issue through `/pull-task` → `/implement` → `/ship`
- [ ] Tried a small batch (2-3 issues) in parallel worktrees
- [ ] Wrote at least one spec for a high-stakes issue (`/spec`)
- [ ] Reviewed and adjusted the example policies
- [ ] `CLAUDE.md` has the `CLAUDE_SNIPPET.md` content pasted in

---

## Upgrading between versions

Re-running `init.sh` is non-destructive — it skips files that already exist. Below are the pieces you need to manually replace for each upgrade.

### v1.x → v2.0

Back up first: `cp -r .claude .claude.v1-backup`

Re-run init — it adds module/decision/drift rules, `/scan-modules`, `/retro`, `/pair`, `/split-tasks`.

Manually replace (behavior changed): `.claude/commands/implement.md`, `.claude/rules/learnings.md`, `CLAUDE_SNIPPET.md` in your `CLAUDE.md`.

Verify `.claude/decisions.jsonl` is NOT gitignored.

### v2.0 → v2.1

Re-run init — adds `/batch`, `/undo`, batch-mode rule, and v2.1 directories.

Manually replace: `.claude/commands/handoff.md`, `.claude/commands/plan.md`, `.claude/commands/implement.md`.

### v2.1 → v2.2

Re-run init — adds `/spec`, policies rule, example policies, `docs/specs/`.

Manually replace: `.claude/commands/plan.md`, `.claude/commands/ship.md`, `.claude/commands/implement.md`.

### v2.2 → v2.3

Re-run init — adds `/health`, `/watch-pr`, `/postmortem`, scheduled-jobs rule, new directories. Purely additive.

### v2.3 → v2.4 (the honesty pass)

**Re-run init** — no new files, but bumps version strings.

**Files to manually replace** — all of these had behavior/tone changes in v2.4:

| File | What changed |
|------|--------------|
| `.claude/commands/implement.md` | Removed step-level parallelism. Decision logging is now emitted at specific events. Steps run sequentially. |
| `.claude/commands/plan.md` | Dropped "Parallel with" field. Dependency info is now prose in a "Dependency notes" section. |
| `.claude/commands/batch.md` | Honest caveat about worktree decisions.jsonl. Added `--dry-run` flag. |
| `.claude/commands/ship.md` | Preflight reframed as "static checks + reviewer checklist". No more claims of dynamic outcome verification. |
| `.claude/commands/retro.md` | Reframed as pattern spotter with confidence levels. No more "self-improving template" framing. |
| `.claude/commands/scan-modules.md` | Leaves "Invariants" and "Known gotchas" sections empty with TODO note. |
| `.claude/commands/handoff.md` | Separates verifiable sections from reflection sections; prompts human review. |
| `.claude/commands/spec.md` | Removed the "every must-have is testable" validation theater step. |
| `.claude/commands/pair.md` | Temper "independent review" claim — honestly describes what the subagent catches and doesn't catch. |
| `.claude/commands/health.md` | Reports Δ vs. previous snapshot instead of made-up 🟢🟡🔴 scores. |
| `.claude/commands/postmortem.md` | Suspects ranked by concrete evidence, not fake probabilities. |
| `.claude/rules/learnings.md` | Dropped auto-assigned severity. |
| `.claude/rules/decisions.md` | Decision logging is now command-driven at specific events. |
| `.claude/rules/policies.md` | Pruned `requires:` vocabulary to 6 enforceable checks. |
| `.claude/policies/example-migrations-rollback.md` | Updated to use pruned vocabulary (`rollback-sql-present`). |
| `.claude/settings.json` | Stop hook reverted to simple `lint | tail -20` — v2.1's failure-capture hook was too noisy. Opt-in instructions in `init.sh` comments. |

Easiest upgrade path: delete the files above and re-run `init.sh` to get the fresh copies.

If you had customizations, diff and merge manually.

### Rollback (any version)

```bash
mv .claude .claude.broken
mv .claude.v1-backup .claude   # or the most recent working backup
```

---

## How it works

### The loop
```
/sync → /spec (high-stakes) → /plan → /implement → /ship → merge
           ↓                     ↓          ↓           ↓
        spec file            plan file   drift check  static checks
                             + DAG       + learnings  + reviewer checklist
                             notes       + modules    + policies
                                         + policies
                                                         ↓
                                                     /watch-pr
                                                     (review loop)
                                                         ↓
                                                      merged!
                                                         ↓
                                                     /health
                                                     (after merge, trend report)

Every 2-4 weeks: /retro → pattern spotter with evidence-based observations
On incidents:    /postmortem → structured reconstruction
For many issues: natural-language batch → /batch → parallel worktrees
```

### Batch mode is the primary interface

For work involving 2+ issues, describe it in natural language:

```
Implement PROJ-73, PROJ-71, PROJ-74 in parallel worktrees. Create branches,
implement, commit, push, and open PRs.
```

The template:
1. Recognizes this as a batch via `.claude/rules/batch-mode.md`
2. Parses issue IDs and flags
3. Confirms the list with you
4. (If `--dry-run`: reports readiness per issue without spawning anything)
5. Spawns sub-agents in isolated git worktrees
6. Each sub-agent runs the full loop for its issue
7. Returns a results table

See [BATCH_GUIDE.md](BATCH_GUIDE.md) for every pattern.

### Knowledge systems: three complementary layers

| Layer | Where | What | Reliability |
|-------|-------|------|-------------|
| **Positive** | `docs/modules/*.md` | How this feature works (key files, data model, flows) | High when written by humans or populated by `/implement` updates; lower for first-scan content from `/scan-modules` |
| **Negative** | `.claude/learnings/*.md` | Things that went wrong and why | High when captured at the moment of failure; lower when added later from memory |
| **Historical** | `.claude/decisions.jsonl` | Why a choice was made (command-emitted at specific events in v2.4) | High — entries are written at the moment of the event, not from reflection |

### Policy engine

`.claude/policies/*.md` are hard rules. The enforceable vocabulary (v2.4):

- `pair-mode` — command must be `/pair` or `/batch --pair`
- `spec-exists` — spec file must exist and not be in draft status
- `no-hardcoded-secrets` — grep diff for common secret patterns
- `rollback-sql-present` — migration must contain a rollback section
- `human-approval` — command must pause for explicit yes (halts in batch sub-agents)
- `linked-decision` — a decision log entry must exist for the current issue this session

Anything else needs an inline check in the policy body. See `.claude/rules/policies.md`.

### Plan dependency notes (no automated parallelism)

v2.4 keeps dependency information in plans as human-readable prose, but executes steps sequentially. Step-level parallelism within a single issue was tried in v2.1 and removed in v2.4 because sub-agents on the same branch race on commits and shared files.

If you want parallelism, it lives at the issue level via `/batch`. Each issue gets its own worktree — no races, no shared state.

### `/ship` preflight

Before opening a PR, `/ship`:
1. Runs static checks against each plan step's "Expected outcome" field — file exists, export exists, migration has the column, etc.
2. For behavioral outcomes (user can log in, endpoint returns 200), adds them to the PR body as an unchecked reviewer checklist
3. Reads the spec's "Must-haves" and does the same split (static vs manual)
4. Runs applicable policies

Unsatisfied auto-checkable must-haves block the PR unless explicitly overridden. Manual checks go in the PR description for the human reviewer.

**This is not behavioral verification.** The preflight can tell you a function exists in the diff; it can't tell you the function does the right thing. That's what the reviewer checklist is for.

### `/pair` — cheaper second opinion

The reviewer subagent sees the diff without the implementer's conversation context. Same underlying model, so it shares biases, but it gives a fresh pass focused only on review.

What it reliably catches:
- Missing null checks, obvious convention violations, textbook security bugs
- Things the implementer rationalized during implementation

What it doesn't reliably catch:
- Subtle architectural mismatches the implementer also wouldn't notice
- Domain-specific gotchas
- Anything requiring context the reviewer doesn't have

Use it for high-stakes changes, not as a replacement for human review on security-critical code.

### `/health` and `/retro`

- **`/health`** is fast and reports metrics with Δ from the previous snapshot. Run it after merges or weekly. No score.
- **`/retro`** is expensive; reads learnings, decisions, plans, git, Linear, modules. Produces observations with evidence and confidence levels, plus up to 5 proposals for the human to consider. Run every 2-4 weeks.
- **`/watch-pr`** polls a PR for new comments and proposes fixes. Never auto-applies blockers.

None of these self-improve the template. They surface patterns; humans decide what to change.

---

## Supported frameworks

| Framework | Formatter | Linter | Test runner |
|-----------|-----------|--------|-------------|
| Next.js | Prettier | ESLint | npm test |
| Vite/React | Prettier | ESLint | npm test |
| Angular | Prettier | ng lint | ng test |
| Python | Ruff | Ruff | pytest |
| Ruby | RuboCop | RuboCop | RSpec |
| Go | gofmt | golangci-lint | go test |
| Rust | rustfmt | clippy | cargo test |
| Node.js (generic) | Prettier | ESLint | npm test |

---

## Customization

- **Hooks**: Edit `.claude/settings.json` to change formatter or linter. v2.4 default is simple lint-on-Stop. To opt into the failure-capture buffer, see the comment block in `init.sh`.
- **Permissions**: Add project-specific allow/deny rules
- **MCP servers**: Add more to `.mcp.json` (Stripe, Sentry, Supabase, etc.)
- **Commands**: Edit any `.claude/commands/*.md`
- **Rules**: Add more `.claude/rules/ctx-*.md` for new feature areas (or run `/scan-modules`)
- **Policies**: Add `.claude/policies/*.md` for project rules (stick to the pruned vocabulary or use inline checks)
- **Learnings**: Add manually or let `/implement` capture them from failures

---

## File structure

```
your-project/
├── .claude/
│   ├── commands/                    # 21 slash commands
│   │   ├── pull-task.md
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── implement.md             # v2.4 sequential
│   │   ├── pair.md
│   │   ├── batch.md                 # v2.4 --dry-run
│   │   ├── continue.md
│   │   ├── ship.md                  # v2.4 honest preflight
│   │   ├── handoff.md               # v2.4 verifiable/reflection split
│   │   ├── undo.md
│   │   ├── sync.md
│   │   ├── push-task.md
│   │   ├── split-tasks.md
│   │   ├── scan-modules.md          # v2.4 empty invariants/gotchas
│   │   ├── retro.md                 # v2.4 pattern spotter
│   │   ├── review.md
│   │   ├── review-feedback.md
│   │   ├── fix-issue.md
│   │   ├── watch-pr.md
│   │   ├── health.md                # v2.4 Δ-reporting
│   │   └── postmortem.md            # v2.4 evidence-ranked suspects
│   ├── agents/
│   │   ├── reviewer.md
│   │   ├── test-runner.md
│   │   └── investigator.md
│   ├── rules/                       # 9 auto-loaded rules
│   │   ├── auto-context.md
│   │   ├── learnings.md             # v2.4 no auto-severity
│   │   ├── module-context.md
│   │   ├── decisions.md             # v2.4 command-driven
│   │   ├── plan-drift.md
│   │   ├── batch-mode.md
│   │   ├── policies.md              # v2.4 pruned vocabulary
│   │   ├── scheduled-jobs.md
│   │   └── git-workflow.md
│   ├── policies/
│   │   ├── README.md
│   │   ├── example-auth-pairing.md
│   │   ├── example-migrations-rollback.md  # v2.4 pruned vocab
│   │   └── example-secrets-check.md
│   ├── learnings/
│   │   ├── .gitkeep
│   │   └── archive/
│   ├── batches/                     # gitignored
│   ├── health/                      # committed
│   ├── retros/                      # committed
│   ├── watch-pr/                    # gitignored
│   ├── decisions.jsonl              # committed
│   ├── settings.json                # committed
│   └── state.json                   # gitignored
├── .mcp.json
├── BATCH_GUIDE.md
└── docs/
    ├── plans/
    ├── specs/
    ├── modules/
    └── postmortems/
```

---

## Version history

- **v2.4** — Honesty pass: removed step-level parallelism (broken), auto-assigned severity, judgment-driven decision logging; reframed `/scan-modules`, `/ship`, `/retro`, `/health`, `/pair`, `/postmortem`, `/handoff`; pruned policy vocabulary; added `/batch --dry-run`; reverted Stop hook to simple default
- **v2.3** — `/health`, `/watch-pr`, `/postmortem`, scheduled-jobs rule
- **v2.2** — `/spec`, policy engine, `/ship` preflight
- **v2.1** — `/batch` (parallel worktrees), `/undo`, `/handoff` v2, batch-mode NL detection
- **v2.0** — Module knowledge base, decision log, plan drift, `/scan-modules`, `/retro`, `/pair`
- **v1.6** — `/split-tasks`
- **v1.5** — Framework detection, auto-context rule, learnings system

---

## See also

- [BATCH_GUIDE.md](BATCH_GUIDE.md) — natural-language batch execution guide
- [CLAUDE_SNIPPET.md](CLAUDE_SNIPPET.md) — snippet to paste into your project's CLAUDE.md
- `.claude/rules/policies.md` — policy engine reference with the pruned vocabulary
- `.claude/rules/batch-mode.md` — NL batch detection rules
- `.claude/rules/decisions.md` — command-driven decision log format
- `.claude/rules/scheduled-jobs.md` — cron/CI integration guidance
