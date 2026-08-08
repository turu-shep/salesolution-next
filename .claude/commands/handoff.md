---
name: handoff
description: End session cleanly, commit WIP, write a continuity doc, update Linear
---

End the current work session cleanly and write a continuity doc that lets the next session pick up without wasted exploration: $ARGUMENTS

**Honest framing:** The most valuable fields in this doc (what was tried and rejected, confidence per step) depend on Claude reflecting accurately on the session. That reflection is imperfect — some "rejected approaches" will be accurate, some will be plausible-sounding confabulation. The doc is better than nothing, but treat its contents as prompts for your own memory, not ground truth. If the current session had you (the human) actively steering, you should edit the doc before committing it.

**Scope:** this command writes the backward-looking *continuity doc*. Forward-looking *handoff packages* (`docs/handoff/<slug>/`, including "do the handoff by phases") are a different artifact governed by `.claude/rules/handoff-packages.md` — follow that rule instead when a package is requested. If this session was executing a package, also update the package's status as part of step 3: CLOSEOUT **plus** the version/program README status row if shipped, otherwise a status line in the version/program README.

## Process

### 1. Commit work in progress
- Run `git status` to check for uncommitted changes
- If there are changes:
  - Stage and commit with: `wip(scope): [partial description] [ISSUE-ID]`
  - Push to remote
- If clean, skip

### 2. Gather handoff material

**From `.claude/state.json`:** current issue, branch, plan file, step progress

**From the plan file:** last completed step (✅), next step (⬜), any re-planned steps

**From git history this session:**
```bash
git log --oneline --since="<session start>" --format="%h %s"
```

**From `.claude/decisions.jsonl` (this session only):**
Filter for entries matching current issue ID with `ts` > session start. These are the concrete choices logged during the session. These are reliable — they were written at the moment the decision was made.

**From `.claude/learnings/` (new this session):**
`ls -lt .claude/learnings/*.md | head` — any files created since session start.

**From the conversation — what was tried:**
Reflect on the session **chronologically**, one entry per approach: hypothesis → what changed → result **with numbers** → why it worked or was abandoned. Failed approaches are the most expensive thing for the next session to rediscover — they matter more than the successes, which git already records. This section is less reliable than the ones above. Be honest about that:
- What approaches did you explore? Which were abandoned, and on what evidence?
- What files were explored but turned out to be dead ends?
- What assumptions turned out wrong?

**From the conversation — user feedback (REQUIRED):**
Collect EVERY piece of direction the user gave this session: corrections, rejections, preferences, frustrations, "don't do X" statements. These are the highest-value, most-often-lost content in a handoff — a preference stated once and dropped gets re-violated next session.

Draft both sections best-effort from the conversation. The explicit ask to the user happens once, at step 6, against the written doc — don't ask twice.

**From the previous handoff (chain continuity):**
If `state.json.handoffFile` pointed at a prior handoff for this issue when the session started, this doc is its successor. Diff plan vs. reality: what did the prior handoff say would happen, and what actually happened? Note any identifiers from the prior handoff (files, functions, flags) that no longer exist.

### 3. Write the continuity doc

Save to `docs/plans/<issue-id>-handoff-<YYYY-MM-DD-HH-MM>.md`:

```markdown
# Handoff — <ISSUE-ID> <title>

**Session ended:** <ISO-8601 timestamp>
**Branch:** `<branch-name>`
**Last commit:** `<sha> — <subject>`
**Plan:** `docs/plans/<issue-id>.md`
**Progress:** Step <N>/<total>
**Prior handoff:** `<path, if this is a successor — omit otherwise>`

## Next action
<One sentence — literally the next thing to do. "Re-run step 3 after resolving the rate-limit question from decisions.jsonl ts 2026-04-10T14:32Z">

## Since last handoff (only if a prior handoff exists)
3-8 bullets: what the prior handoff planned vs. what actually happened this session.
- Planned <X> → <what actually happened>

## Stale references (only if any)
Identifiers from the prior handoff/plan that no longer exist in the codebase:
- `<file/function/flag>` — <what replaced it>

## Confidence per remaining step
Optional — include only for steps where you have specific reason to doubt the plan. Blank is fine.
- Step N: <concern, if any>
- Step N+1: <concern, if any>

## Completed this session (verifiable)
Quantify outcomes: never "improved X" — always "X went from <before> to <after>".
- Step N: <description> ✅
- Step M: <description> ✅

## Decisions logged this session (verifiable)
Cross-reference to `.claude/decisions.jsonl` by timestamp:
- <ts>: <one-line summary>
- <ts>: <one-line summary>

## Learnings captured this session (verifiable)
- `.claude/learnings/<file>.md` — <one-line summary>

## What the session tried (Claude's recollection — may be incomplete)
Chronological, one entry per approach. Best-effort reflection — if you (the human) can correct or add anything, edit this section before committing.

- <Approach X> for <problem Y>: hypothesis <H> → changed <what> → result <numbers/observation> → <why kept or abandoned>
- Explored `<file/area>` — the relevant piece was <brief note>

## User feedback & preferences (REQUIRED)
Every piece of direction the user gave this session — corrections, rejections, preferences, frustrations. Empty only if the session was fully autonomous with zero user input.

- "<what the user said/corrected>" → <how future sessions should behave>

## Files that should not be touched without re-planning
Only list files where there's a concrete reason they shouldn't be edited. "Files I edited" is not a reason; "file is in a half-migrated state" is.

- <file> — <specific reason>

## Open questions (if any)
- <Question> — <who can answer>

## Blockers (if any)
- <External dependency, missing access, pending review>
```

Sections marked "verifiable" come from concrete log entries. Sections marked "Claude's recollection" are reflection — treat them as drafts the user should review.

**Post-write self-check** — before moving on, verify against the written doc; rewrite thin sections rather than shipping them:
- [ ] "Next action" is one concrete sentence, not a list
- [ ] Specific file/function names present where the doc makes claims (no hand-waving)
- [ ] Outcomes quantified (from X to Y, never bare "improved"/"fixed")
- [ ] "User feedback & preferences" captures every correction from this session
- [ ] Abandoned approaches include *why* they were abandoned
- [ ] If a prior handoff exists: "Since last handoff" is filled in, and stale references were checked (section present only if any were found)

### 4. Post to Linear
Add a structured comment on the Linear issue with:
- The "Next action" line (front and center)
- Link to the handoff doc in the repo
- A short version of the verifiable sections

### 5. Update state
Update `.claude/state.json`:
- `lastActivityTimestamp`: now
- `handoffFile`: path to the handoff doc
- `handoffNotes`: the one-line "next action"

### 6. Summary for the current user
Show the handoff doc path and ask:
- "Before I commit this handoff, anything to correct or add in 'What the session tried' or 'User feedback & preferences'?"

This gives the user a chance to fix the unreliable sections before they're committed.

## Integration with `/continue`

The next `/continue` or session-start `auto-context` reads `handoffFile` from state.json first, uses the "Next action" line as the opening suggestion, and respects the "Files that should not be touched" list. The verifiable sections get weight; the "Claude's recollection" section gets treated as context hints, not facts.

## Batch mode

If invoked after a `/batch` session, iterate over every blocked/failed issue in the batch manifest and write one handoff doc per issue. Each handoff is generated from its own worktree's artifacts. Report a table at the end: issue ID → handoff file → next action.
