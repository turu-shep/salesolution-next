---
name: plan
description: Create an implementation plan for a feature or task, with explicit step dependencies
---

Think hard about how to implement: $ARGUMENTS

## Process

### 1. Gather context
- If a Linear issue ID is provided, fetch full issue details from Linear
- **If a spec exists** for the issue (`docs/specs/<issue-id>.md`), read it first — the spec is the source of truth for acceptance criteria and non-goals
- If no spec exists and the issue is non-trivial (touches auth, payments, data, multiple domains), suggest running `/spec` first (but don't block — allow the user to skip)
- Read CLAUDE.md for project conventions and constraints
- Read any matching `docs/modules/*.md` (look up via `.claude/rules/ctx-*.md` globs matching the likely affected files)
- Search the codebase for related files, similar patterns, and reusable components
- Check `.claude/learnings/` for gotchas related to affected areas
- Grep `.claude/decisions.jsonl` for prior decisions touching the likely files

### 2. Identify dependencies
For each step you identify, determine:
- **Files**: which files it creates or modifies
- **Depends on**: which earlier steps must complete first. Be strict — only list a dependency when there's a real data or API contract (one step produces a structure the next consumes). Two steps touching the same file are not automatically dependent unless there's a real ordering reason.

### 3. Create the plan
Save to `docs/plans/<issue-id-or-descriptive-name>.md`:

```markdown
# [ISSUE-ID] Title

**Linear**: [link, if applicable]
**Spec**: [link to docs/specs/<issue-id>.md, or "none"]
**Complexity**: S / M / L / XL
**Estimated steps**: N

## Learnings to watch for
[Any relevant entries from .claude/learnings/ — or "None"]

## Module docs referenced
- [List of docs/modules/*.md this plan depends on — or "None"]

## Prior decisions
- [Relevant entries from .claude/decisions.jsonl — or "None"]

## Dependency notes
Explain which steps must come before which, and why. This is for human readability — `/implement` executes steps sequentially regardless.

Example:
> Steps 1-2 produce the database schema. Step 3 depends on Step 1 (uses the new column). Steps 4-5 are UI work that consumes Step 3's API.

## Steps

⬜ **Step 1**: <description>
   - Files: <list of files to create/modify>
   - Depends on: none
   - Tests: <what to test>
   - Expected outcome: <what "done" looks like — used by /ship to generate reviewer checklist>

⬜ **Step 2**: <description>
   - Files: <list>
   - Depends on: Step 1 (reason: uses the exported type from X)
   - Tests: <what to test>
   - Expected outcome: <what "done" looks like>

[...]

## Risks & open questions
- [Anything uncertain, needs a decision, or could go wrong]

## Out of scope (from spec)
- [Things explicitly NOT being done — copied from the spec's non-goals, if present]
```

### 4. Validate the plan
Before saving, check:
- Every step's "Depends on" references an earlier step (or "none")
- Every step has an "Expected outcome" (required so `/ship` can generate the reviewer checklist)
- No circular dependencies

### 5. Sync with Linear
If there's a Linear issue:
- Add a comment: "Implementation plan created — [N] steps, estimated [S/M/L/XL]"
- If the plan has >8 steps, suggest `/split-tasks` to decompose into sub-issues instead

### 6. Check policies
Read `.claude/policies/*.md`. If any policy applies to files in the plan (e.g. auth changes require `/pair`), surface it at the end of the plan output:

```
⚠ Policies applicable to this plan:
- auth-pairing → Step 3 touches lib/auth/*, must be run with /pair
- migrations-rollback → Step 1 is a migration, must include rollback SQL
```

The user should see these BEFORE starting implementation.

DO NOT write any code yet. Only produce the plan.
