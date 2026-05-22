---
name: retro
description: Read recent workflow artifacts and produce a checklist of patterns worth considering
---

Run a retrospective on the project's workflow artifacts: $ARGUMENTS

**What this command actually does:** Reads learnings, decisions, plans, Linear activity, and module docs, and produces a structured checklist of observations and proposals. It's a pattern spotter, not an oracle. The output is material for a human retro meeting, not a list of changes to apply automatically.

Expect 2-3 useful suggestions per run and several noise ones. Sort the output yourself.

## Process

### 1. Gather raw material

Read the following (scope = last 30 days by default, or whatever $ARGUMENTS specifies):

**Learnings** (`.claude/learnings/*.md`)
- How many were added?
- Which areas of the codebase do they cluster around?
- Which ones reference files that no longer exist? (archival candidates)

**Decisions** (`.claude/decisions.jsonl`)
- How many entries?
- What alternatives keep coming up? Same decision re-evaluated = possibly missing a rule.
- Any entries with `type: policy-override`? → policy may be wrong or may need refinement.
- Any `supersedes` entries? → prior decisions that were overturned.

**Plans** (`docs/plans/*.md`)
- Completion rate (plans with all ✅ vs. plans with any ⬜)
- Plans abandoned mid-way (stale with ⬜ steps from >14d ago)
- Plans re-written often (git log on the plan file with >2 commits)

**Linear issues** (via MCP)
- Issues that took noticeably longer than similar historical ones
- Issues that bounced In Review → In Progress multiple times (churn signal)
- Issues closed without a merge

**Git history**
- `git log --since="30 days ago" --format="%s"` — commit message patterns
- Files touched most often → hot spots

**Module docs** (`docs/modules/*.md`)
- Which have `Last updated` >60 days but cover code that HAS changed in the last 60 days? (stale — their referenced files moved beneath them)
- Which source directories have no module doc coverage?

### 2. Look for patterns

Read through the gathered material and note what stands out. Here are the patterns that are usually worth noting:

**Same-thing-twice patterns:**
- Same decision logged 3+ times = the team keeps re-debating it → worth codifying somewhere
- Same learning category in the same area 3+ times → the area needs better docs or a policy
- Same class of policy override 3+ times → the policy is either wrong or needs refinement

**Staleness:**
- Module docs older than the code they describe
- Learnings referencing files that no longer exist
- Plans with `⬜` steps and no activity in 14+ days

**Workflow friction:**
- Plans abandoned mid-way → `/plan` may be producing unrealistic decompositions
- Issues bouncing In Review ↔ In Progress → `/review` may be missing something
- Large gaps between plan write and plan execution → drift risk

**Unused assets:**
- Commands never invoked in the period (grep shell history or decisions.jsonl)
- Policies that never triggered (glob may be wrong, or policy is dead)
- Rules that never fired (no matching files edited recently)

### 3. Produce the report

Output this structure:

```markdown
# Workflow Retro — <date range>

## Volume
- Learnings added: N
- Decisions logged: N
- Plans executed: N (X% completion rate)
- Issues shipped: N
- Policy overrides: N

## Observations

### Observation 1: <title>
**Evidence:** <specific data points — file names, learning IDs, commit hashes, decision timestamps>
**Interpretation:** <what this suggests — be cautious about causation>
**Possible next step:** <a concrete thing the team could consider>
**Confidence:** low | medium | high

### Observation 2: ...
```

Every observation must cite concrete evidence. If you can't point to specific files or entries, don't include it.

**Important:** Mark each observation with a confidence level.
- **High**: Same pattern appears 3+ times in the raw data. Hard to argue with.
- **Medium**: Pattern appears 2 times OR once with strong signal (e.g. a policy override on a security-critical file).
- **Low**: Single occurrence. Probably noise, but flag it because it's easy to miss otherwise.

### 4. Freshness report

A mechanical section (no interpretation):

```markdown
## Freshness

### Stale module docs (may mislead Claude)
| Module | Last updated | Code last changed | Status |
|--------|-------------|-------------------|--------|
| auth | 2026-01-15 | 2026-04-02 | STALE |

### Hot spots without module coverage
- `src/<dir>/` — N commits in 30d, no module doc → candidate for manual module doc or `/scan-modules` re-run

### Learnings with missing referenced files
- `.claude/learnings/<name>.md` references `<file>` which no longer exists → archive candidate

### Policies with zero triggers
- `<policy>` — never triggered in the period. Check the glob pattern.
```

### 5. Proposals (explicit, not applied)

At the end, list concrete proposals the human could consider. Do NOT apply any of these automatically.

```markdown
## Proposals to consider

1. **<short title>** — <1 sentence>
   Rationale: <from observations above>
   Files: <what would change>
   Confidence this would help: low / medium / high

2. ...
```

Limit to 5 proposals. If there are more candidates, note "N more in Appendix" and list them below. The human should be able to skim the top 5 and say "yes to 2, maybe to 1, ignore the rest" in under a minute.

### 6. Save the report
Write to `.claude/retros/<YYYY-MM-DD>.md`. `/health` and the next `/retro` can compare across reports.

### 7. Log the retro
Append to `.claude/decisions.jsonl`:
```json
{"ts":"...","type":"retro","period":"last-30-days","observations":N,"proposals":N,"high_confidence":N}
```

## Important caveats

- **This is a pattern spotter, not a decision maker.** Proposals are suggestions for the human to evaluate. Not a worklist to execute.
- **Evidence is required.** Every observation and proposal must cite specific files, commits, or log entries. Handwavy "I think the team would benefit from..." is not allowed.
- **A quiet retro is a good retro.** Don't invent problems. If there's nothing interesting, say so.
- **Confidence matters.** Low-confidence observations should be clearly marked — they're the noise the human should skim past fastest.
- **Don't run this more than every 2-4 weeks.** It's expensive to read everything, and patterns need time to accumulate.

## Batch mode

Not applicable — retro is a single snapshot across the whole repo.
