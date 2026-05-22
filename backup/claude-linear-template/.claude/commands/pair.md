---
name: pair
description: Implement a plan step with a parallel reviewer agent catching issues before commit
---

Pair-program the next plan step: $ARGUMENTS

You are running in pair mode: one implementer (you, the main agent) and one reviewer (spawned as a subagent). The reviewer sees the diff without the implementer's conversation context and gives a second opinion before the code is committed.

**Honest framing on "independence":** The reviewer subagent runs the same underlying model and shares training biases with the implementer — it's not as independent as a different human or a different model family. What it DOES get you:
- A fresh read of the diff without the implementer's own rationalizations
- A separate pass focused only on review, not on making the change work
- Reliable detection of common issues (missing null checks, obvious convention violations, textbook security bugs)

What it does NOT reliably catch:
- Subtle architectural mismatches the implementer also wouldn't notice
- Domain-specific gotchas the main agent already missed
- Anything that requires context the reviewer doesn't have

It's cheaper than a human review and better than self-review. Don't expect it to replace a human reviewer on security-critical paths.

## When to use `/pair`

- High-stakes changes (auth, payments, data migrations, security-sensitive code)
- Areas with a history of bugs or review churn (check `.claude/learnings/` and `/retro` findings)
- New patterns the codebase doesn't have yet
- When you want higher confidence without running full CI

Don't use for trivial changes — the reviewer overhead isn't worth it.

## Process

### 1. Load context like `/implement`
- Read `.claude/state.json` to find the current issue and plan
- Read the plan file, find the next ⬜ step
- Run the plan-drift check from `.claude/rules/plan-drift.md`
- Read relevant learnings and module docs

### 2. State the plan for this step
Before any edits, output a brief:
```
Step N: <description>
Files: <list>
Approach: <1-3 sentences>
Learnings applied: <list or "none">
Risk areas: <things the reviewer should pay extra attention to>
```

### 3. Implement in reviewable chunks
Break the step into chunks. A chunk is a self-contained edit that can be reviewed in isolation — typically one file, or one function across 2-3 files.

For each chunk:

**a. Make the edits** using Edit/Write tools.

**b. Spawn the reviewer** as a subagent (use the `reviewer` agent type if available, otherwise `general-purpose`). Pass it:
- The diff (via `git diff <chunk-files>`)
- The plan step description
- The risk areas you flagged
- Path to relevant learnings and module docs
- Instruction: "Review this chunk. Report PASS / WARN / FAIL for: correctness, convention compliance, security, edge cases. For each issue, cite file:line and propose the fix. Under 300 words."

**c. Wait for the reviewer's report.**

**d. Triage the feedback:**
- **FAIL**: Fix it immediately before the next chunk. Do not proceed past a FAIL.
- **WARN**: Judgment call. Either fix now, or log as a decision in `.claude/decisions.jsonl` explaining why you chose to proceed.
- **PASS**: Continue.

**e. Log significant reviewer catches** as learnings if the issue was non-obvious — this is exactly the kind of knowledge the learnings system exists to capture.

### 4. After all chunks pass
- Run the normal verification: lint, type-check, tests
- Mark the plan step done (⬜ → ✅)
- Commit with the Linear issue ID
- Update `.claude/state.json`
- Add progress comment on Linear: "Completed step N/total (pair mode) — reviewer caught X issues"

### 5. Record the pair session
Append to `.claude/decisions.jsonl`:
```json
{"ts":"...","issue":"PROJ-123","step":N,"type":"pair-session","chunks":N,"reviewer_issues":{"fail":N,"warn":N,"pass":N},"learnings_created":N}
```

This lets `/retro` measure whether pair mode is catching real issues or just adding friction.

## Reviewer prompt template

When spawning the reviewer subagent, use this exact prompt shape so its output is predictable:

```
You are a code reviewer in a pair-programming session. Review this diff for a single chunk of work.

## Context
- Task: <Linear issue title>
- Plan step: <description>
- Risk areas to focus on: <list>
- Relevant learnings: <paths>
- Relevant module docs: <paths>

## Diff
<paste `git diff` output>

## Your job
Report PASS / WARN / FAIL for each of:
1. Correctness — does it do what the plan step says?
2. Convention compliance — does it follow CLAUDE.md and relevant rules?
3. Security — any injection, missing auth, exposed secrets, unsafe defaults?
4. Edge cases — null handling, empty states, error paths, concurrency?

For each non-PASS, cite file:line and propose a specific fix. Under 300 words total. Be direct — no preamble.
```

## Important

- **The reviewer is not the author.** Do not let it rewrite the code for you — it reports, you fix. This keeps responsibility clear.
- **Don't argue with the reviewer.** If it flags something you disagree with, either fix it or log a decision explaining your reasoning. Don't just dismiss it silently.
- **Keep chunks small.** A chunk larger than ~150 lines diluted the reviewer's attention. Split it.
- **If the reviewer keeps finding the same issue**, that's a learning — write it so future sessions catch it without needing pair mode.
