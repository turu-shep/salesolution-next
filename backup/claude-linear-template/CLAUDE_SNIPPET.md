## Task Management
- **Linear** is the task tracker. Connected via MCP (Linear MCP Server).
- `.claude/state.json` tracks the current in-progress task locally (gitignored).
- `.claude/learnings/` captures project-specific gotchas from failures and reviews.
- `.claude/decisions.jsonl` is the append-only decision log — command-driven entries at specific events (committed). See `.claude/rules/decisions.md`.
- `.claude/policies/` encodes hard rules enforced by commands. See `.claude/rules/policies.md` for the enforceable `requires:` vocabulary.
- `docs/modules/` is the positive knowledge base — one doc per feature area, auto-loaded via `.claude/rules/ctx-*.md`.
- `docs/specs/` is the acceptance-criteria directory — one spec per high-stakes issue, written before `/plan`.
- `docs/postmortems/` is the incident archive.
- Every commit must reference the Linear issue ID: `type(scope): description [PROJ-123]`
- Update Linear status as you work: Todo → In Progress → In Review → Done
- Add progress comments on Linear issues after completing each implementation step.

## Batch mode (preferred workflow for multi-issue work)

When you want to work on multiple issues at once, describe it in natural language:

```
Implement PROJ-73, PROJ-71, PROJ-74 in parallel worktrees. Create branches, implement, commit, push, and open PRs.
```

The template recognizes this (via `.claude/rules/batch-mode.md`) and routes to `.claude/commands/batch.md`. Sub-agents run in isolated git worktrees, each delivering one issue end-to-end. See `BATCH_GUIDE.md` in the template root for full usage patterns.

**Honest caveat:** sub-agent decisions and learnings are local to their worktrees until PR merge. The main repo's `.claude/decisions.jsonl` only gets a batch summary entry during the run, not per-issue decisions from sub-agents. See BATCH_GUIDE.md for details.

Common flags via natural language:
- "show me plans first" → `--review-plans`
- "in pair mode" → `--pair`
- "sequentially" → `--sequential`
- "don't open PRs" → `--no-ship`
- "dry run" / "what would this do" → `--dry-run` (report readiness without spawning sub-agents)

### Slash Commands

**Core workflow:**
| Command | Purpose |
|---------|---------|
| `/pull-task` | Pull next issue from Linear, decompose if large, create plan + branch |
| `/spec` | Write acceptance criteria before planning (strongly recommended for high-stakes issues) |
| `/plan` | Create an implementation plan with explicit step dependencies |
| `/implement` | Execute the next plan step sequentially — drift-checked, policy-checked, module-aware |
| `/pair` | Implement with a reviewer subagent on each chunk. Better than self-review; not a substitute for human review on security-critical code. |
| `/batch` | Run multiple issues in parallel isolated worktrees (prefer natural-language invocation) |
| `/continue` | Resume work — syncs with Linear, picks up where you left off |
| `/ship` | Run static checks against plan outcomes, generate reviewer checklist for behavioral items, open PR with Linear linking |
| `/handoff` | End session — write a continuity doc with verifiable + reflection sections (human should review the reflection before committing) |
| `/undo` | Safely revert the last implement step (git revert + state + decisions rollback) |

**Task management:**
| Command | Purpose |
|---------|---------|
| `/sync` | Show Linear dashboard, update local state |
| `/push-task` | Create a new Linear issue from Claude Code |
| `/split-tasks` | Decompose a feature/plan into detailed Linear issues with edge cases + UX specs |

**Knowledge & reflection:**
| Command | Purpose |
|---------|---------|
| `/scan-modules` | Bootstrap `docs/modules/` observable sections from the codebase (one-time; invariants/gotchas left empty for humans to populate over time) |
| `/retro` | Pattern spotter over learnings/decisions/plans with evidence and confidence levels. Produces observations and proposals for humans to consider — does not self-apply. |
| `/health` | Workflow + codebase metrics reported with Δ vs. previous snapshot. No score, no grade. |

**Quality:**
| Command | Purpose |
|---------|---------|
| `/review` | Review changes, post results to Linear |
| `/review-feedback` | Address PR review comments, push fixes, request re-review |
| `/watch-pr` | Poll a PR for new review comments, classify (nit/question/suggestion/blocker/out-of-scope), propose fixes (never auto-applies blockers) |
| `/fix-issue` | Fix a bug from Linear with root cause analysis |
| `/postmortem` | Structured incident reconstruction. Ranks suspect commits by concrete evidence, not made-up probabilities. |

## Deployment Pipeline
- **Linear → GitHub → Deploy** — branch naming auto-links to Linear
- Branch naming: `[issue-id-lowercase]-[short-description]` (e.g., `proj-123-timezone-support`)
- Commit format: `type(scope): description [PROJ-123]`
- PR description must include `Closes PROJ-123` for auto-close on merge
- Use `/ship` to create PR with proper format after all steps are done.

## Knowledge systems
- **Before modifying a feature area**, check `docs/modules/<area>.md` for key files, data model, and flows. Invariants and known gotchas may be empty on fresh scans — they're populated over time by `/implement` updates and `/retro` promotions.
- **Before writing non-trivial code**, grep `.claude/decisions.jsonl` for prior choices that might apply.
- **Decisions are logged automatically** by commands at specific events — you don't need to judge when to log. See `.claude/rules/decisions.md` for the event list.
- **When a failure reveals a gotcha**, create a learning in `.claude/learnings/` (no severity required — leave it blank or let `/retro` categorize later).
- **After a significant change**, update the relevant `docs/modules/*.md`.

## Policies
`.claude/policies/*.md` encode hard rules enforced before risky actions. The enforceable vocabulary is: `pair-mode`, `spec-exists`, `no-hardcoded-secrets`, `rollback-sql-present`, `human-approval`, `linked-decision`. Anything else needs an inline check in the policy body. The template ships example policies; review and adapt them. Overrides require explicit user consent and are logged as decisions.

## Spec-first flow (for high-stakes issues)
```
/spec <issue>          ← human clarifies WHAT
  ↓
/plan <issue>          ← AI proposes HOW (reads the spec)
  ↓
/implement / /pair     ← AI executes sequentially, drift-checked
  ↓
/ship                  ← AI runs static checks, generates reviewer checklist, opens PR
```

Batch version:
```
/spec PROJ-73 PROJ-71 PROJ-74  (sequential — specs need human judgment)
  ↓
Implement PROJ-73, PROJ-71, PROJ-74 in parallel worktrees (natural-language batch)
```
