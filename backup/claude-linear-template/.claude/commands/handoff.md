---
name: handoff
description: End session cleanly, commit WIP, write a continuity doc, update Linear
---

End the current work session cleanly and write a continuity doc that lets the next session pick up without wasted exploration: $ARGUMENTS

**Honest framing:** The most valuable fields in this doc (what was tried and rejected, confidence per step) depend on Claude reflecting accurately on the session. That reflection is imperfect — some "rejected approaches" will be accurate, some will be plausible-sounding confabulation. The doc is better than nothing, but treat its contents as prompts for your own memory, not ground truth. If the current session had you (the human) actively steering, you should edit the doc before committing it.

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
Reflect on the session. This section is less reliable than the ones above. Be honest about that:
- What approaches did you explore? Which were abandoned?
- What files were explored but turned out to be dead ends?
- What did the user push back on or reject?
- What assumptions turned out wrong?

Prefer to ASK the user explicitly rather than infer: "Anything specific from this session that should go in the 'what we tried' section? I can list what I remember, but you probably remember more accurately."

### 3. Write the continuity doc

Save to `docs/plans/<issue-id>-handoff-<YYYY-MM-DD-HH-MM>.md`:

```markdown
# Handoff — <ISSUE-ID> <title>

**Session ended:** <ISO-8601 timestamp>
**Branch:** `<branch-name>`
**Last commit:** `<sha> — <subject>`
**Plan:** `docs/plans/<issue-id>.md`
**Progress:** Step <N>/<total>

## Next action
<One sentence — literally the next thing to do. "Re-run step 3 after resolving the rate-limit question from decisions.jsonl ts 2026-04-10T14:32Z">

## Confidence per remaining step
Optional — include only for steps where you have specific reason to doubt the plan. Blank is fine.
- Step N: <concern, if any>
- Step N+1: <concern, if any>

## Completed this session (verifiable)
- Step N: <description> ✅
- Step M: <description> ✅

## Decisions logged this session (verifiable)
Cross-reference to `.claude/decisions.jsonl` by timestamp:
- <ts>: <one-line summary>
- <ts>: <one-line summary>

## Learnings captured this session (verifiable)
- `.claude/learnings/<file>.md` — <one-line summary>

## What the session tried (Claude's recollection — may be incomplete)
Best-effort reflection on the work. If you (the human) can correct or add anything, edit this section before committing.

- Tried <approach X> for <problem Y>. <Why it was abandoned, if abandoned.>
- Explored `<file/area>` — the relevant piece was <brief note>

## Files that should not be touched without re-planning
Only list files where there's a concrete reason they shouldn't be edited. "Files I edited" is not a reason; "file is in a half-migrated state" is.

- <file> — <specific reason>

## Open questions (if any)
- <Question> — <who can answer>

## Blockers (if any)
- <External dependency, missing access, pending review>
```

Sections marked "verifiable" come from concrete log entries. Sections marked "Claude's recollection" are reflection — treat them as drafts the user should review.

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
- "Before I commit this handoff, anything in the 'what the session tried' section to correct or add?"

This gives the user a chance to fix the unreliable section before it's committed.

## Integration with `/continue`

The next `/continue` or session-start `auto-context` reads `handoffFile` from state.json first, uses the "Next action" line as the opening suggestion, and respects the "Files that should not be touched" list. The verifiable sections get weight; the "Claude's recollection" section gets treated as context hints, not facts.

## Batch mode

If invoked after a `/batch` session, iterate over every blocked/failed issue in the batch manifest and write one handoff doc per issue. Each handoff is generated from its own worktree's artifacts. Report a table at the end: issue ID → handoff file → next action.
