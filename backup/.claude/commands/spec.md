---
name: spec
description: Write structured acceptance criteria for an issue before planning
---

Write an acceptance spec for: $ARGUMENTS

A spec is a small, dense document that pins down WHAT success looks like before any planning or coding starts. The most valuable field is "non-goals" — it's the thing that prevents scope creep mid-implementation.

## When to run `/spec`

**Strongly recommended for:**
- Any issue touching auth, payments, permissions, data migrations, or other high-stakes areas
- Issues where the Linear description is one sentence and needs expansion
- Issues with multiple stakeholders or unclear trade-offs
- Anything being batched (`/batch` sub-agents can't ask clarifying questions in real time)

**Skip for:**
- Small bug fixes with an obvious root cause
- Routine chores (dependency bumps, test additions)
- Work that strictly follows an existing pattern

If you're not sure, run it. A 5-minute spec saves hours of mid-implementation thrash.

## Process

### 1. Gather raw material
- Fetch the Linear issue via MCP — read description, comments, linked issues, labels
- Read any linked docs, design files, or tickets mentioned in the issue
- Check `docs/modules/` for the area the issue touches
- Check `.claude/decisions.jsonl` for prior decisions on the same or similar scope
- Check `.claude/learnings/` for gotchas in the area

### 2. Draft the spec

Save to `docs/specs/<issue-id>.md`:

```markdown
# [ISSUE-ID] <Title>

**Linear:** [link]
**Status:** draft | approved | implemented
**Spec written:** <YYYY-MM-DD>

## User story
As a <role>, I want <capability> so that <outcome>.

(Write one line per affected user type if multiple.)

## Context
1-3 sentences: why this matters now, what pain it solves, what metric it moves.

## Must-haves (acceptance criteria)
Concrete, testable statements. Each one should be something a human reader can judge pass/fail without running a debugger.

- [ ] <Criterion 1>
- [ ] <Criterion 2>
- [ ] <Criterion 3>

## Nice-to-haves
Things that would be great but are NOT required for this issue to ship. These can become follow-up issues.

- <Nice-to-have 1>
- <Nice-to-have 2>

## Non-goals (what this explicitly does NOT do)
**This is the most valuable section.** List things that are tempting to include but are out of scope. Be specific — vague non-goals don't prevent scope creep.

- <Thing this is NOT solving, even though it's adjacent>
- <Thing this is NOT refactoring, even though it's tempting>
- <Related user flows NOT being improved here>

## Failure modes
What could go wrong? For each, what should the system do?

- **<Failure mode 1>**: <expected behavior>
- **<Failure mode 2>**: <expected behavior>

## Open questions
Things that need a human decision BEFORE planning can proceed. Don't paper over these with assumptions.

- <Question 1> — <who can answer>
- <Question 2>

## Success metrics
How will we know this worked AFTER it ships?

- <Metric 1>
- <Metric 2>

(If no metric applies, write "N/A — internal change, no user-facing metric")

## Dependencies
- **Blocks:** <issues that can't proceed until this ships>
- **Blocked by:** <issues that must ship first>
- **Shares files with:** <issues that touch the same files — important for batch mode>
```

### 3. Write it honestly
Don't pad empty sections just to fill the template. If "Nice-to-haves" is genuinely empty, write "None." If "Success metrics" don't apply, write "N/A." An honest short spec is more useful than a padded long one.

A few quality hints for the human writing the spec:
- Can you read each must-have out loud and check it against a finished feature without debugging? If not, make it more concrete.
- Is "Non-goals" empty? You probably haven't thought hard enough — there's almost always something tempting nearby that should be explicitly cut.
- Are there "Open questions" you're tempted to paper over with assumptions? Don't. Write them down and block on them.

(These are hints for the human, not checks for Claude to run. Claude will happily rubber-stamp any spec it writes — the quality gate is human review.)

### 4. Sync with Linear
- Add a comment on the Linear issue linking to the spec file
- Copy the "Must-haves" and "Non-goals" sections into the Linear description
- If there are "Open questions", add a `needs-decision` label or change status to "Blocked"

### 5. Handle open questions
If there are open questions that block planning:
- STOP here
- Do NOT proceed to `/plan`
- Output the questions prominently
- Suggest pinging the relevant humans

If there are no blockers:
- Suggest next command: `/plan <issue-id>` (the plan command will read this spec automatically)

### 6. Log the spec
Append to `.claude/decisions.jsonl`:
```json
{"ts":"...","issue":"PROJ-123","type":"spec","non_goals":N,"open_questions":N,"must_haves":N}
```

## Important

- **Specs are small.** Aim for 1 page. Longer than 2 pages → run `/split-tasks` on the issue.
- **Non-goals is non-optional in practice.** Skipping this section is how scope creep starts.
- **Specs are NOT plans.** A spec says WHAT. A plan says HOW. Don't write implementation steps here.
- **Specs CAN change.** If an open question is answered later, update the spec and log it as a decision.

## Batch mode

If invoked with multiple issue IDs (`/spec PROJ-123 PROJ-124 PROJ-125`), write one spec per issue. Process them sequentially — specs need human judgment, don't parallelize. Report a table at the end showing which have open questions blocking planning.

## Spec-first flow

For high-stakes work:
```
/spec <issue>     ← human clarifies WHAT
  ↓
/plan <issue>     ← AI proposes HOW (reads the spec)
  ↓
/implement        ← AI executes (reads the plan)
  ↓
/ship             ← AI generates reviewer checklist from spec must-haves
```

For batch mode with specs, write all specs first, then `/batch` the implementation.
