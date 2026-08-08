---
name: health
description: Compute workflow + codebase metrics and report changes since the last snapshot
---

Run a health check on the project: $ARGUMENTS

**What this command actually does:** Collects concrete metrics (git counts, file counts, staleness diffs) and reports them, optionally with a trend vs. the previous run. It does NOT produce absolute "your project is healthy" scores — those would depend on thresholds I made up. Instead it surfaces *changes* so you can spot drift.

Use it after every merge or on a weekly cadence. It's read-only and fast.

## Process

### 1. Gather metrics

**Git activity (last 30 days)**
- Commits: `git log --since="30 days ago" --oneline | wc -l`
- Authors: `git log --since="30 days ago" --format="%ae" | sort -u | wc -l`
- Hottest files: `git log --since="30 days ago" --name-only --format="" | sort | uniq -c | sort -rn | head -10`

**Issue velocity (via Linear MCP, last 30 days)**
- Issues shipped (Done)
- Issues still In Progress
- Issues blocked
- Issues that bounced In Review → In Progress multiple times (churn count)

**Plans**
- Total plans in `docs/plans/`
- Plans with all steps ✅ (completed)
- Plans with any ⬜ steps AND no activity in 14+ days (stale)
- Plans written in last 30 days

**Specs**
- Total specs in `docs/specs/`
- Specs with `Status: approved` vs `draft`
- Specs with open questions (blocked)

**Learnings**
- Total entries in `.claude/learnings/`
- New in last 30 days
- Learnings referencing files that no longer exist (archival candidates)

**Decisions**
- Total entries in `.claude/decisions.jsonl`
- New in last 30 days
- Policy overrides in last 30 days
- Decisions with `supersedes` (prior decisions overturned)
- Top files referenced (files with high decision density = hot spots)

**Module docs**
- Total docs in `docs/modules/`
- Docs with `Last updated` > 60 days ago AND their referenced files HAVE changed since (stale)
- Source directories with no module doc coverage

**Policies**
- Total policies in `.claude/policies/`
- Policies that fired in the last 30 days (grep decisions.jsonl for `type: policy-override` and for any ship/implement entries referencing policy checks)
- Policies never triggered in 30 days (either perfect OR glob is broken — flag for inspection)

**Tests**
- Run `pnpm test` only if it completes in <30s
- Otherwise skip and note "test runner slow — skipped"

**Batches**
- Total batches in `.claude/batches/`
- Success rate (shipped / total across all batches in the period)

### 2. Load prior snapshot
If `.claude/health/<previous>.md` exists, load its numbers for trend comparison.

### 3. Produce the report

```markdown
# Health — <date>

## Metrics

### Volume (30d)
| Metric | Now | Prev | Δ |
|--------|-----|------|---|
| Commits | N | N | ↑/↓/→ |
| Issues shipped | N | N | ↑/↓/→ |
| Learnings added | N | N | ↑/↓/→ |
| Decisions logged | N | N | ↑/↓/→ |
| Policy overrides | N | N | ↑/↓/→ |

### Knowledge staleness
| Metric | Now | Prev | Δ |
|--------|-----|------|---|
| Module docs total | N | N | ↑/↓/→ |
| Module docs stale | K | K | ↑/↓/→ |
| Learnings total | N | N | ↑/↓/→ |
| Learnings referencing missing files | K | K | ↑/↓/→ |
| Specs total | N | N | ↑/↓/→ |
| Specs with open questions | K | K | ↑/↓/→ |

### Workflow
| Metric | Now | Prev | Δ |
|--------|-----|------|---|
| Plan completion rate | X% | X% | ↑/↓/→ |
| Stale plans (⬜ + no activity 14d+) | N | N | ↑/↓/→ |
| Issue churn count | N | N | ↑/↓/→ |
| Batch success rate | X% | X% | ↑/↓/→ |

## Hot spots
Files touched 5+ times in 30 days:
| File | Commits | Has module doc? | Has learnings? |
|------|---------|----------------|----------------|
| `<file>` | N | ❌ | ❌ |

Files with no module coverage AND 3+ recent commits are candidates for manual module docs or a `/scan-modules` re-run on that area.

## Policy activity
| Policy | Triggered (30d) | Overrides | Last fired |
|--------|----------------|-----------|------------|
| no-hardcoded-secrets | N | 0 | Nd ago |
| content-drafts-only | N | 0 | Nd ago |

Policies never triggered in 30 days: inspect the glob pattern.

## Flagged items (read-only — this command does NOT fix anything)

### Stale module docs
- `docs/modules/<name>.md` — last updated <date>, files changed <date>
- ...

### Learnings referencing missing files
- `.claude/learnings/<name>.md` → references `<file>` (not found)
- ...

### Stale plans
- `docs/plans/<name>.md` — last ⬜ activity <date>
- ...

## Suggestions (optional, low-confidence)
Up to 3 things worth considering, each with a concrete reason. If nothing stands out, leave this section empty.
- <Suggestion> — <why>
```

### 4. Save the report
Write to `.claude/health/<YYYY-MM-DD>.md` for future trend comparison.

### 5. Log it
Append to `.claude/decisions.jsonl`:
```json
{"ts":"...","type":"health","stale_modules":N,"plan_completion":X,"batch_success":X,"policy_overrides_30d":N}
```

## Important caveats

- **This command reports numbers, not judgments.** There's no 🟢🟡🔴 "your project is healthy" score — those would depend on arbitrary thresholds. Look at the Δ columns: are things getting better, worse, or staying the same?
- **The "Suggestions" section is deliberately limited.** Health is observational; acting on the metrics is the human's job. Bigger analysis work belongs in `/retro`.
- **Don't run quality checks that take >30s.** If the test suite is slow, skip it.
- **Good output = boring output.** A healthy project produces a report with small Δs and nothing flagged. Don't invent problems to look busy.
- **Posting the report is optional.** The file in `.claude/health/` is the artifact.

## Batch mode

Not applicable — health is a single-repo snapshot.
