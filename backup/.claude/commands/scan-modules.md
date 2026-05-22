---
name: scan-modules
description: Analyze the codebase and bootstrap observable module docs under docs/modules/
---

Scan the codebase and propose an initial module knowledge base: $ARGUMENTS

**What this command actually does:** Reads the codebase and produces module docs filled with the *observable* sections — key files, data model, flows. It leaves "Invariants" and "Known gotchas" EMPTY with a TODO note, because those come from hard-won experience, not first-read analysis. Trying to synthesize invariants from a first scan produces plausible-sounding fabrications.

Run this once as a bootstrap. The empty sections get populated organically over time — `/implement` updates module docs after significant changes, and `/retro` promotes recurring learnings into the gotchas sections.

## Process

### 1. Survey the codebase
- Read CLAUDE.md and any existing architecture docs
- List top-level source directories (`src/`, `app/`, `lib/`, `components/`, etc.)
- Identify the project's primary organizing dimension:
  - Feature-based (directories named after features)
  - Layer-based (api/, ui/, db/, services/)
  - Domain-based (auth/, billing/, users/)
- Check `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` for third-party integrations — each is usually its own module

### 2. Identify module candidates
Propose modules using these heuristics:
- **3+ related files across layers** (API + UI + DB for the same concept)
- **External service integration** (Stripe, Auth0, Daily, Resend, etc.)
- **Cross-cutting concern** (auth, permissions, routing, state management)
- **Business-critical flow** (checkout, onboarding, booking)

Target 6-15 modules. Fewer than 6 means the project is small enough not to need this. More than 15 means you're over-splitting — merge related ones.

### 3. Show the proposal
Before writing files, show the user:
```
Proposed modules (N total):

1. <name> — <one-line purpose>
   Files: <key paths>
   Glob: <pattern for ctx rule>

2. ...
```

Wait for user confirmation or adjustments.

### 4. Write the module docs — observable sections only

For each confirmed module, create `docs/modules/<module-name>.md`:

```markdown
# <Module Name>

## Purpose
<One paragraph, derived from actually reading the key files and their comments/docstrings>

## Key files
- `path/to/file` — <role, based on what the code does>
- `path/to/dir/` — <role>

## Data model
<Tables, types, entities actually found in the code. If the module is stateless, write "N/A — stateless">

## Core flows
### <Flow name>
<Step-by-step walkthrough based on the code, not invented. If you can't trace a flow end-to-end from the code, write "To be documented" and move on.>

## Invariants
_(To be populated by the team over time. `/scan-modules` cannot reliably infer invariants from a first read — they come from hard-won experience. Add entries here when `/implement` or a postmortem reveals a rule that must hold.)_

## Known gotchas
_(Populated from `.claude/learnings/` via `/retro` promotion, or manually added. Empty on first scan.)_

## Integration points
<External services or other modules that this module depends on or is used by — only list ones you can see in the code>

## Last updated
<YYYY-MM-DD> — initial scan by /scan-modules (observable sections only)
```

**Do not fabricate entries for Invariants or Known gotchas.** An empty section with the TODO note is correct and honest. A populated section with made-up content is worse than nothing.

### 5. Write the ctx rules
For each module, create `.claude/rules/ctx-<module-name>.md`:

```markdown
---
globs: ["<pattern1>", "<pattern2>"]
---

Before modifying <module-name> code, read `docs/modules/<module-name>.md` for context on the key files, data model, and flows.

After significant changes, update that module doc to reflect the new state.
```

Use specific glob patterns. Avoid `**/*` — that would load every doc on every edit.

### 6. Write an index
Create or update `docs/modules/README.md` with a table of the new modules and their glob patterns.

### 7. Report
Summarize:
- Modules created
- Glob coverage (source directories NOT covered by any module)
- Modules whose Invariants/Gotchas sections are empty (all of them, by design)
- Suggested next steps:
  - Run a single issue through `/implement` on each module to populate the Last updated field with real content
  - Run `/retro` after some weeks to promote learnings into Gotchas sections

## Important

- **Do not overwrite existing module docs.** If `docs/modules/<name>.md` already exists, skip it and note in the report.
- **Do not create empty/placeholder docs.** If you can't meaningfully describe a module from the code, don't create it.
- **Read before you write.** Every claim in the Key files, Data model, and Core flows sections should be grounded in the actual code.
- **Leave Invariants and Known gotchas empty.** This is not laziness — it's honesty. These sections are hard to get right without real experience in the code, and fabricated content misleads future sessions.
- **This is a one-time bootstrap.** Ongoing updates happen through `/implement` and `/retro`, not this command.
