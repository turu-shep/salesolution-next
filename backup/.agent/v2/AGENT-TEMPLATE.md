# Recursive Descent Analysis Agent v2.0

> **This file is a self-contained task for Claude Code.**
> Read it fully before doing anything. Then execute the protocol exactly as written.
> Do not skip phases. Do not combine descent levels. Do not generate tasks until the Ascent is complete.
> You are permitted to write tests and fix small bugs (< 20 lines) during the Action phase only — if permissions allow.

---

## 0. PHASE 0 — CONTEXT INGESTION & INITIALIZATION

### 0.1 — Read Project Context

1. Read `.agent/PROJECT-CONTEXT.md` — the developer's input defining product, market, milestones, team, and permissions.
2. If `.agent/PROJECT-CONTEXT.md` does not exist → **STOP. Tell the developer to fill it out.** Do not proceed with a generic analysis.
3. Read `CLAUDE.md` (or equivalent project constitution) if it exists.
4. Read any architecture/module documentation referenced in PROJECT-CONTEXT §5.
5. If `.agent/` has files from a prior session, read ALL of them — especially `knowledge-graph.json` and `health-scorecard.md`.

### 0.2 — Generate Analysis Parameters

Create `.agent/analysis-params.md`. This bridges developer context and agent protocol.

```markdown
# Analysis Parameters — Generated [DATE]

## Product Understanding
- Product type: [SaaS / Marketplace / Tool / API / Consumer app / etc.]
- Core transaction: [from PROJECT-CONTEXT §1]
- User roles: [from PROJECT-CONTEXT §1]
- Business model: [from PROJECT-CONTEXT §1]
- Stage: [from PROJECT-CONTEXT §1]
- Transaction value: [from PROJECT-CONTEXT §4.5 or "unknown"]
- Current volume: [from PROJECT-CONTEXT §4.5 or "pre-launch"]

## Stack Summary
- Framework: [detected from code or PROJECT-CONTEXT §4]
- Database: [detected]
- Auth: [detected]
- Payments: [detected, if any]
- Deployment: [detected]
- Test framework: [detected]
- Key libraries: [detected — only architecture-relevant ones]

## Milestones
### Milestone 1: [Name]
- Blocker test: [from input]
- Systems required: [agent's mapping of which code areas]
- Readiness estimate: [initial guess — refined after descent]

### Milestone 2: [Name]
[same]

### Milestone 3: [Name]
[same]

## Focus Areas (derived from PROJECT-CONTEXT §4 + §7)
### Focus A: [Highest priority]
- Why: [milestone + pain point mapping]
- Where to look: [specific directories/files]

### Focus B: [Second]
- Why:
- Where to look:

### Focus C: [Third]
- Why:
- Where to look:

## Explicitly Deprioritized
[From PROJECT-CONTEXT §3 — agent will NOT recommend tasks in these areas]

## Persona Calibration
Based on stage "[stage]", focus areas, and business model:
- Architect weight: [0.5–2.0] — [rationale]
- User weight: [0.5–2.0] — [rationale]
- Adversary weight: [0.5–2.0] — [rationale]

Calibration guidance:
- Pre-revenue marketplace → User 1.8, Adversary 1.3, Architect 0.7
- Live SaaS with paying users → Adversary 1.5, User 1.2, Architect 1.2
- Internal tool, early build → Architect 1.5, User 1.0, Adversary 0.5
- API/infrastructure product → Architect 1.8, Adversary 1.5, User 0.5

## Business Impact Calibration
- Transaction value: [from PROJECT-CONTEXT or "unknown"]
- Revenue model: [from PROJECT-CONTEXT]
- Stage multiplier: [pre-revenue → "delayed launch" / revenue → "$X per broken transaction"]

## Documentation Drift Scope
Documents to cross-reference against code:
- [path]: [type of assertions — conventions, architecture, API format, etc.]
- [path]: [type]

## Agent Permissions
- Code modification: [None / Tests only / Tests + small fixes / Tests + fixes + refactors]
- Off-limits files: [list]
- Task tracker: [type] — MCP available: [Yes/No]

## Scoring Thresholds
Based on stage "[stage]" and team "[structure]":
- "Good enough" threshold: [5–7 depending on stage]
- Refactor appetite: [Low / Medium / High]
- Test expectation: [Minimal / Critical paths / Comprehensive]
```

### 0.3 — Initialize or Load Knowledge Graph

**If `.agent/knowledge-graph.json` exists (returning session):**
1. Read the knowledge graph fully
2. Determine changed files:
   - If git repo: `git diff --name-only [graph.last_commit]..HEAD`
   - If not git: compare stored hashes against current file hashes
3. For each changed file: find all dependents in the graph → mark as stale
4. Write the delta analysis scope to session log
5. Proceed to §1 (Descent) in **delta mode** — only analyze stale files

**If `.agent/knowledge-graph.json` does NOT exist (first run):**
1. This is a full traversal — expect 3–5 hours
2. The knowledge graph will be built during descent
3. Proceed to §1 (Descent) in **full mode**

### 0.4 — Session Log Entry

Append to `.agent/session-log.md`:
```
---
## Session: [DATE]
Started: [TIME]
Mode: [Full Cycle / Delta Run / Level-only / etc.]
Product: [name]
Stage: [stage]
Knowledge graph: [Loaded — n files, n stale | First run — building from scratch]
Milestones: [M1] → [M2] → [M3]
Focus areas: [A], [B], [C]
Permissions: [summary]
Prior session: [date or "first run"]
```

---

## 1. THE DESCENT

### 1.0 — Architecture

```
THE DESCENT (top-down, with pruning)
  Level 0: App Shell     — entry points, routing, providers, global boundaries
  Level 1: Module        — each feature area as a cohesive unit
  Level 2: Component     — each component/service within a flagged module
  Level 3: Function      — each function/handler within a flagged component

At every level:
  1. MAP (structural inventory — once, shared)
  2. THREE PERSONA PASSES (Architect → User → Adversary)
  3. COMBINE SCORES
  4. DESCENT DECISION (go deeper or prune)
```

### 1.1 — Descent Rules

**Scoring at every level:** After the three persona passes, compute combined scores:
```
Final Score = Base Score + (Architect Adjustment × Architect Weight)
                        + (User Adjustment × User Weight)  
                        + (Adversary Adjustment × Adversary Weight)
Capped at 0 minimum, 10 maximum.
```

**Descent decision:**
- Final score ≤ 5 on ANY dimension → **mandatory descent**
- Final score 6–7 on any dimension AND module is milestone-critical → **conditional descent**
- Final score above "good enough" threshold on ALL dimensions → **prune**

**Delta mode rule:** In delta mode, only descend into stale files (changed + dependents). For non-stale files, inherit all prior scores and flags from knowledge-graph.json. Note inherited items explicitly.

**Knowledge graph update:** At every level, for every file analyzed, update the in-memory knowledge graph with: new hash, new scores, new flags, current date, descent level reached.

---

### 1.2 — The Three Personas

These run at EVERY descent level, after the structural map.

#### Persona 1: The Architect
```
Identity: Senior software architect reviewing for maintainability and correctness.

Evaluates:
- Separation of concerns (logic in right layers?)
- Dependency direction (no circular imports, no upward deps?)
- Change impact radius (modifying this file — how many others break?)
- Convention compliance (does it follow CLAUDE.md / project rules?)
- Testability (could you unit test this in isolation?)
- Scalability patterns (survives 10x users?)

Scoring influence:
- Code Quality: × 2.0
- Test Coverage: × 1.5
- Other dimensions: × 1.0

Flag prefix: [ARCH-NNN]
```

#### Persona 2: The User
```
Identity: Product designer reviewing through the end-user's eyes.

Evaluates:
- First-time experience (obvious what to do?)
- Loading states (what does the user see while waiting?)
- Error states (useful message or cryptic failure?)
- Empty states (helpful guidance or blank void?)
- Success feedback (confirmation proportional to action importance?)
- Flow continuity (can user complete the task without getting lost?)
- Responsive layout (works on ICP's actual devices?)
- Copy quality (written for the ICP, not developers?)

Scoring influence:
- Completeness: × 2.0
- Robustness: × 2.0
- Other dimensions: × 0.5

Flag prefix: [USER-NNN]
```

#### Persona 3: The Adversary
```
Identity: Security engineer and chaos tester trying to break things.

Evaluates:
- Auth bypass (access without login?)
- Authorization holes (access other users' data? IDOR?)
- Input manipulation (malformed data? missing fields? XSS?)
- Payment manipulation (prices changed client-side? amount verified server-side?)
- Race conditions (double booking? double charge? concurrent mutations?)
- Information leakage (stack traces? DB schema? internal IDs in errors?)
- Webhook spoofing (signature verified? replay attacks?)
- Privilege escalation (customer accessing admin functions?)

Scoring influence:
- Security: × 3.0
- Robustness: × 1.5
- Other dimensions: × 0.5

Flag prefix: [ADV-NNN]
```

#### Cross-Persona Promotion
```
Same file/function flagged by 2 personas → auto-promote to P1 minimum in judgment
Same file/function flagged by 3 personas → auto-promote to P0
```

---

### 1.3 — Level 0: App Shell

Scope: top-level application structure.

**Map** (adapt to project's framework):
```
### Entry Points
[all entry points: pages, routes, API endpoints, CLI commands, workers, cron]

### Routing / Navigation
[route groups, auth-protected vs. public, navigation hierarchy]

### Global Infrastructure
- Root layout / App wrapper: [providers, wrappers]
- Middleware: [checks, redirects]
- Global error boundary: [exists? catches what?]
- Global loading state: [exists? shows what?]
- Auth flow: [login → session → redirect → authenticated state]

### Data Layer
- Database: [what, how accessed]
- External APIs: [integrations]
- State management: [client-side approach]
```

**Architect pass → User pass → Adversary pass**
Each produces flags and score adjustments.

**Combined scores:**
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Route completeness | | | | | |
| Global error coverage | | | | | |
| Auth integrity | | | | | |
| Infrastructure health | | | | | |

**Descent decision per area:** DESCEND (with rationale) or PRUNE.

---

### 1.4 — Level 1: Module Descent

A "module" = cohesive feature area. Grouping depends on project type.

For each module marked DESCEND in Level 0:

```
## Module: [Name]

### Boundary
- UI: [pages, components, views]
- Logic: [services, utilities, business rules, hooks]
- Data: [API routes, models, queries]
- Types: [type definitions]
- Tests: [existing test files]
- Docs: [existing documentation]

### Data Flow
[Primary data flow through this module]

### Milestone Relevance
- M1: [Critical / Relevant / Not needed]
- M2: [Critical / Relevant / Not needed]
- M3: [Critical / Relevant / Not needed]

### Core Transaction Involvement
[Does this module participate in the core transaction? How?]
```

**Architect pass → User pass → Adversary pass**

**Combined scores:**
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | | | | | |
| Robustness | | | | | |
| Code Quality | | | | | |
| Security | | | | | |
| Test Coverage | | | | | |

**Cross-persona flags:** List any file/function flagged by 2+ personas.

**Descent decisions per component/file:**
- Mandatory descent: files >300 lines, files handling auth/payments/core transaction, files with 0 tests on milestone-critical path, files the developer flagged as pain points
- Otherwise: use combined scores + milestone relevance

---

### 1.5 — Level 2: Component / Service Descent

For each file marked DESCEND in Level 1:

```
## Component/Service: [Name] ([line count] lines)

### Responsibility
[What it does in context of its module]

### Internal Map
- Inputs: [props, parameters, injections]
- State: [internal state]
- Side effects: [API calls, DB queries, external calls]
- Outputs: [renders, returns, emits, writes]
- Error paths: [what can go wrong, what is handled]

### Classification
- Pure logic / UI / Mixed
- Business logic that belongs elsewhere: [Yes — what / No]
- Could be split: [Yes — into what / No]
- Tested: [Yes / Partially / No]
```

**Architect pass → User pass → Adversary pass**

For user-facing components, the User persona also fills:
| UX State | Status | Details |
|----------|--------|---------|
| Loading | ✅ / ⚠️ / ❌ | |
| Error | ✅ / ⚠️ / ❌ | |
| Empty | ✅ / ⚠️ / ❌ | |
| Success | ✅ / ⚠️ / ❌ | |
| Disabled/pending | ✅ / ⚠️ / ❌ | |
| Responsive | ✅ / ⚠️ / ❌ | |

**Combined scores, flags, descent decision to Level 3.**

---

### 1.6 — Level 3: Function Descent

Deepest level. Only for: core transaction functions, auth/permission functions, payment functions, flagged functions, database mutations on critical paths.

```
## Function: [name] in [file path]

### Signature
[full signature with types]

### Logic Trace
[Step-by-step in plain language]

### Edge Cases
| Edge Case | Handled? | How | Risk if unhandled |
|-----------|----------|-----|-------------------|

### Architect Assessment
[testability, separation of concerns, dependency analysis]

### User Assessment
[error messages shown to user, feedback quality, recovery options]

### Adversary Assessment
- Auth verified: [Yes — how / No]
- Authorized: [role/permission check / No]
- Input validated: [schema / manual / no]
- Injection safe: [parameterized / no]
- Rate limited: [yes / no / N/A]
- Race condition: [scenario / no]
- Idempotency: [yes / no / N/A]
- Transaction wrapping: [yes / no / should be]

### Verdict
- Correct: [Yes / Mostly / No — describe]
- Milestone blocker: [Yes — which / No]
- Fix complexity: [XS / S / M / L]
- Personas flagging: [which — determines auto-promotion]
```

No further descent. All findings feed into the Ascent.

---

### 1.7 — Knowledge Graph Update (during descent)

For every file analyzed at any level, update the in-memory graph entry:

```json
{
  "path": "/app/api/bookings/create/route.ts",
  "hash": "[SHA-256 of current contents]",
  "last_analyzed": "[today's date]",
  "descent_level_reached": 3,
  "module": "booking",
  "dependencies": ["/lib/stripe/create-intent.ts"],
  "dependents": ["/components/booking/BookingForm.tsx"],
  "scores": {
    "completeness": 6, "robustness": 3, "quality": 5, "security": 4, "test_coverage": 2
  },
  "flags": {
    "architect": ["ARCH-012: inline business logic"],
    "user": ["USER-008: no loading feedback during payment"],
    "adversary": ["ADV-003: session auth only", "ADV-007: no rate limit"]
  },
  "cross_persona": true,
  "milestone_critical": ["M1", "M2"]
}
```

For files in delta mode that were NOT re-analyzed, keep their existing entry unchanged.

After the entire descent is complete, write `.agent/knowledge-graph.json` with:
```json
{
  "version": "2.0",
  "project": "[name from PROJECT-CONTEXT]",
  "last_session": "[today's date]",
  "last_commit": "[current git HEAD hash or 'no-git']",
  "total_files": 0,
  "files_analyzed_this_session": 0,
  "files_inherited": 0,
  "files": { ... },
  "modules": {
    "[name]": {
      "files": ["..."],
      "scores": { ... },
      "milestone_relevance": { ... },
      "last_full_descent": "[date]"
    }
  }
}
```

---

## 2. THE ASCENT

After descent reaches bottom for each branch, roll findings up.

**Output file:** `.agent/ascent.md`

### 2.1 — Roll-Up Protocol

**Level 3 → 2:** Function findings revise component scores.
```
### [ComponentName] — Post-Descent Revision
- Architect-driven adjustments: [list flags and score changes]
- User-driven adjustments: [list]
- Adversary-driven adjustments: [list]
- Cross-persona promotions: [n items flagged by 2+ personas]
- Original scores → Revised scores: [table]
```

**Level 2 → 1:** Component health aggregates to module.
```
### Module: [Name] — Post-Descent Revision
- Components analyzed deeply: [n] / [total]
- Components pruned: [n]
- Original → Revised scores: [table]
- Delta from prior session: [if knowledge graph has prior data]
```

**Level 1 → 0:** Module health aggregates to app.
```
### App — Post-Descent Summary
- Modules analyzed: [n], pruned: [n]
- Healthiest: [name] ([score])
- Weakest: [name] ([score])
- App health: [weighted average — milestone-critical modules × 2]
```

### 2.2 — Documentation Drift Detection

Run AFTER roll-ups, BEFORE core transaction trace. The agent has now read all code during descent and has full context.

**Protocol:**

1. Read each document listed in analysis-params.md "Drift Scope"
2. Extract verifiable assertions (naming conventions, structural patterns, architecture claims, workflow descriptions)
3. For each assertion, check against what the code actually does (using descent data and direct file reads if needed)
4. Classify each assertion as: Confirmed / Drifted / Unverifiable
5. For drifted assertions, determine severity and fix direction

**Output file:** `.agent/drift-report.md`

```markdown
# Documentation Drift Report — [DATE]

## Summary
- Documents analyzed: [n]
- Assertions checked: [n]
- Confirmed (code matches): [n] ([%])
- Drifted (code disagrees): [n] ([%])
- Unverifiable: [n]

## Drift Findings

### Document: [path]

#### DRIFT-[NNN]: [assertion summary]
- Document says: "[quote or paraphrase the assertion]"
- Document location: [file, section/line]
- Code reality: [what the code actually does, with file paths]
- Severity: High / Medium / Low / Info
- Fix direction: Fix Code / Fix Doc / Manual Decision
- Milestone impact: [if fixing this matters for a milestone — which one]
- Recommended action: [specific — "Update 4 API routes to use standard format" not "fix the drift"]
```

### 2.3 — Core Transaction Trace

Crosses module boundaries. Now that descent is complete, trace the core transaction end-to-end.

```markdown
## Core Transaction: [from PROJECT-CONTEXT §1]

### Step [N]: [Name]
- Where: [route/component/function]
- Architect view: [structural assessment]
- User view: [experience assessment]
- Adversary view: [security assessment]
- Status: ✅ / ⚠️ / ❌
- Notes:

[Repeat for each step. Add or remove steps as appropriate for THIS product's transaction. Do not force a fixed number of steps.]

### Transaction Summary
- Steps complete: [n/total]
- Critical gaps (❌): [list]
- Risk areas (⚠️): [list]
- M1 ready: Yes / No
- M2 ready: Yes / No
- M3 ready: Yes / No
```

---

## 3. CROSS-CUT ANALYSIS

Scan all findings laterally across modules.

**Output file:** `.agent/cross-cut.md`

### 3.1 — Pattern Detection

Collect every flag from every level. Group by pattern.

```markdown
## Pattern: [Name]
- Detected by persona(s): [Architect / User / Adversary]
- Instances: [n]
- Locations:
  1. [file] — [brief]
  2. [file] — [brief]
- Root cause: [why this keeps happening]
- Systemic fix: [one fix for all instances]
- Systemic effort: [XS/S/M/L]
- Individual effort × n: [comparison]
- Leverage ratio: [effort saved by systemic approach]
```

Common patterns to scan (adapt to project):
1. Missing UX states across components
2. Auth inconsistency across routes
3. Business logic in UI layer
4. Missing input validation on server endpoints
5. Unhandled async errors
6. Duplicate logic across 3+ files
7. Type safety gaps (any types, unchecked casts)
8. Server data in client state
9. Inconsistent API response format
10. Missing test coverage on feature areas

### 3.2 — Cross-Module Dependency Risks

```markdown
### [Module A] → [Module B]: [risk description]
- Coupling type: [import / shared state / implicit convention]
- Change cascade: [what breaks in A if B changes]
- Decouple how: [specific approach]
```

### 3.3 — Business-Implementation Gap Analysis

Compare PROJECT-CONTEXT claims against code reality:

```markdown
## Gap: [Feature/capability from PROJECT-CONTEXT]
- Context says: [what it should do]
- Code does: [what it actually does — or "not implemented"]
- Severity: Critical (blocks milestone) / Moderate / Minor / None
- Milestone: [which]
```

---

## 4. JUDGMENT & TASK GENERATION

**Input:** Re-read `.agent/descent.md`, `.agent/ascent.md`, `.agent/drift-report.md`, `.agent/cross-cut.md`, and `.agent/analysis-params.md` before starting.

**Output:** `.agent/judgment.md` and `.agent/recommendations.md`

### 4.1 — Quadruple Validation

Every finding runs four checks:

**Check 1 — Multi-Level Evidence:**
Visible at 2+ descent levels → validated.
Single level only → cap at P2, mark "single-level — manual review needed."

**Check 2 — Milestone Alignment:**
Advances M1/M2/M3 → proceed, tag with milestone.
Does not advance any milestone → cap at P3.
In the explicitly deprioritized list → DISCARD.

**Check 3 — Effort/Impact for This Team:**
From PROJECT-CONTEXT §4 (team structure):
- Solo → small focused tasks, no XL refactors unless blocking
- Small team → moderate refactors okay
- Offshore contractors → extremely specific tasks with clear validation

**Check 4 — Business Impact:**
```
Core transaction affected → Revenue Blocking or Degrading
Milestone blocker test affected → Milestone Blocking
Milestone quality affected → Milestone Degrading
Failure likely under real usage → Operational Risk
Future changes harder → Technical Debt
None of the above → No Business Impact → P3 maximum
```

**Cross-persona auto-promotion:**
- 2 personas flagged → P1 minimum (overrides check results)
- 3 personas flagged → P0 (overrides everything except DISCARD for deprioritized areas)

Document every decision in `.agent/judgment.md`:
```
### Finding: [description]
- Source: Level [n], [file path], Persona: [which]
- Check 1 (multi-level): PASS / FAIL
- Check 2 (milestone): PASS ([which]) / FAIL
- Check 3 (effort/impact): PASS / FAIL
- Check 4 (business impact): [level]
- Cross-persona: [2/3 flag → auto-promote] or [single persona]
- Verdict: P0 / P1 / P2 / P3 / DISCARD
```

### 4.2 — Business Impact Classification

For Revenue Blocking and Revenue Degrading findings, estimate impact:

```
Based on PROJECT-CONTEXT:
- Transaction value: $[X]
- Weekly transactions: [N]
- Issue affects: [all / subset]

Revenue Blocking: $[X] × [N] lost per week until fixed
Revenue Degrading: $[X] × [N] × [est. conversion drop %] lost per week
```

### 4.3 — Priority Definitions

```
P0 — Blocking
  Revenue Blocking or Milestone Blocking impact.
  3-persona cross-flag. Auth bypass. Data loss. Payment integrity.
  → Fix before next demo or user test.

P1 — High Value
  Revenue Degrading or Milestone Degrading impact.
  2-persona cross-flag. Systemic pattern (5+ instances).
  Core flow UX gaps. Webhook reliability.
  → Fix within current work week.

P2 — Meaningful
  Operational Risk or validated single-level finding.
  Test gaps on critical paths. Component refactors reducing bug risk.
  → Schedule for next sprint.

P3 — Backlog
  Technical Debt. Single-level findings. Non-milestone work.
  Items in deprioritized list that weren't discarded.
  → Track, don't create issues.
```

### 4.4 — Drift Task Integration

Drift findings from `.agent/drift-report.md` enter the judgment pipeline as regular findings:
- High severity drift on milestone-critical docs → P1 candidate
- Medium severity → P2 candidate
- Low/Info → P3

Drift tasks tagged `[DRIFT]` in recommendations.

### 4.5 — Dependency Ordering

```markdown
## Task Dependency Graph

### Foundation (must be done first)
- [task] → enables: [list]

### Dependent (require a foundation task)
- [task] → requires: [task], enables: [list]

### Independent (any order)
- [task]

### Critical Path
1. [task] — [why first]
2. [task] — [depends on #1]
3. ...
```

### 4.6 — Effort Clustering

Group tasks touching the same files into single work sessions:

```markdown
## Cluster: "[Name]" (~[hours])
Theme: [connection]
Files: [list]
Tasks:
1. [task] ([effort])
2. [task] ([effort])
Combined: [actual effort accounting for shared context]
```

### 4.7 — Task Format

```markdown
---

## [PRIORITY]-[NUMBER]: [Title]

**Priority:** P0 | P1 | P2 | P3
**Focus Area:** [from analysis-params Focus A/B/C or category]
**Milestone:** 1 / 2 / 3 / None
**Effort:** XS (<30min) | S (30min–2h) | M (2–4h) | L (4–8h) | XL (2+ days)
**Cluster:** [name] | Independent
**Depends on:** [task ID] | None
**Enables:** [task IDs] | None
**Personas:** [which flagged this — e.g., "User (primary), Adversary (secondary)"]

**Business Impact:** Revenue Blocking | Revenue Degrading | Milestone Blocking | Milestone Degrading | Operational Risk | Technical Debt
**Impact Detail:** [2-3 sentences connecting code issue to business outcome]
**Revenue Effect:** [$ estimate if Revenue Blocking/Degrading, or N/A]

**Risk if ignored:** [one sentence]

### Evidence
- Level [n]: [finding, file, persona]
- Level [n]: [corroboration, file, persona]
- Cross-cut: [pattern, if applicable]
- Drift: [drift finding, if applicable]

### What is wrong
[2-4 sentences. File paths. No generalities.]

### What to do
1. [Step — name the file, function, pattern]
2. [Step]
3. [Step]

### Validation
- [ ] [Testable condition 1]
- [ ] [Testable condition 2]

### Task tracker issue (if tracker available)
**Title:** [ready-to-paste]
**Label:** bug | feature | refactor | security | performance | docs
**Priority:** Urgent (P0) | High (P1) | Medium (P2) | Low (P3)
```

### 4.8 — Recommendations File Structure

```markdown
# [Project Name] — Agent Recommendations v2.0
**Generated:** [DATE]
**Product:** [name] | **Stage:** [stage]
**Analysis mode:** [Full / Delta — n files analyzed, n inherited]
**Descent findings:** [n] | **Cross-cut patterns:** [n] | **Drift findings:** [n]
**Validated tasks:** [n] | **Discarded:** [n]

## Health Summary
- App health: [X/10] (prior: [Y/10], delta: [±Z])
- Weakest module: [name] ([score]) — flagged by: [personas]
- Strongest module: [name] ([score])
- Core transaction: [n/total steps ✅]
- Documentation drift: [n drifted] / [n checked] ([%] compliance)
- M1 readiness: [%] — blockers: [list or "none"]
- M2 readiness: [%] — blockers: [list or "none"]
- M3 readiness: [%] — blockers: [list or "none"]

## Critical Path (dependency-ordered execution sequence)
[P0 → P1 tasks in the order they should be done, with rationale]

---

## P0 — Blocking ([n] tasks, ~[effort])
[tasks]

## P1 — High Value ([n] tasks, ~[effort])
[tasks]

## P2 — Meaningful ([n] tasks, ~[effort])
[tasks]

## P3 — Backlog ([n] tasks)
[tasks]

---

## Effort Clusters
[grouped sessions]

## Systemic Fixes (from Cross-Cut)
[patterns → single fixes]

## Documentation Drift Fixes
[drift tasks]

## Business-Implementation Gaps
[features that should exist but don't]

## Discarded Findings
[every discarded finding with reason]

## Task Tracker Import (P0 + P1)
[ready-to-paste titles]
```

---

## 5. ACTION PHASE

Permission-gated. Check `.agent/analysis-params.md` permissions before any code change.

### 5.1 — Permission Check
- "Analysis only" → skip entire phase
- Allowed actions → proceed within those bounds only

### 5.2 — Rules (always apply)

**For every code change:**
1. Log in `.agent/action-log.md` BEFORE writing code
2. Run linter after change
3. Run tests if they exist for affected area
4. Commit format from CLAUDE.md or default: `fix(agent): [description] [AGENT-DATE]`

**Never modify:** off-limits files, migrations, env files, vendor code, CLAUDE.md, AGENT.md

**Bug fix limits:** ≤ 20 lines, ≤ 2 files, no new deps, no new routes, no schema changes

### 5.3 — Test Generation

For critical paths with zero coverage:
```
## Test: [filename].test.[ext]
- Covers: [function/component] in [path]
- Priority: [P0/P1/P2]
- Cases: 1. Happy path  2. Error case  3. Edge case
```

Priority: core transaction > auth > payments > flagged edge cases

### 5.4 — Knowledge Graph Update After Action

After every code change in Action phase:
1. Recompute hash for modified files
2. Update the knowledge graph entry for those files
3. Mark dependents as "may need re-analysis next session"
4. Write updated knowledge-graph.json

### 5.5 — Action Log

```markdown
## Action Phase — [DATE]
### Tests written: [n] — [file paths]
### Bugs fixed: [n] — [file: description, lines changed]
### Knowledge graph entries updated: [n]
### Lint: ✅ / ❌
### Tests: ✅ / ❌ / N/A
```

---

## 6. HEALTH SCORECARD

**Output file:** `.agent/health-scorecard.md` — persists across sessions.

### 6.1 — Dimensions (0–10)

| Dim | 0 | 5 | 10 |
|-----|---|---|-----|
| Completeness | Stub | Happy path works, gaps | All milestone flows done |
| Robustness | No error handling | Some states handled | All UX states covered |
| Code Quality | Massive files, duplication | Some structure | Clean, right-sized |
| Security | No auth/validation | Present, inconsistent | Comprehensive |
| Test Coverage | Zero | Some non-critical | Critical paths covered |

Threshold calibration by stage (from analysis-params).

### 6.2 — Scorecard Format

```markdown
# [Project Name] Health Scorecard
## Updated: [DATE] | Overall: [X/10]

| Module | Compl | Robust | Quality | Security | Tests | Overall | ARCH | USER | ADV | Drift | Trend |
|--------|-------|--------|---------|----------|-------|---------|------|------|-----|-------|-------|
| [mod]  | /10   | /10    | /10     | /10      | /10   | /10     | /10  | /10  | /10 | [n]   | ↑↓→   |

## Core Transaction: [n/total ✅]
## Doc Drift: [n drifted] / [n checked] ([%])
## Milestones: M1 [%] | M2 [%] | M3 [%]

## History
| Date | Overall | Weakest | Transaction | Drift% | M1 | M2 | M3 | Tasks | Fixes | Mode |
|------|---------|---------|-------------|--------|----|----|----|----- |-------|------|
| [date] | /10 | [mod] | /N | [%] | [%] | [%] | [%] | [n] | [n] | Full/Delta |
```

---

## 7. SESSION FORMATS

### Full Cycle (3–5h, first run or periodic deep refresh)
```
Read .agent/AGENT.md. Full cycle.
Phase 0 → Descent (all levels) → Ascent → Cross-Cut → Judgment → Action → Scorecard.
Build/rebuild knowledge graph.
```

### Delta Run (30–60min, the standard weekly/daily session)
```
Read .agent/AGENT.md. Delta run.
Load knowledge graph. Diff since last session. Re-analyze changed + dependents only.
Ascent → Cross-Cut → Judgment → Action → Scorecard.
```

### Context + Descent Only (2–3h, first run split across days)
```
Read .agent/AGENT.md. Phase 0 and Descent only. Build knowledge graph.
Stop after writing descent.md and knowledge-graph.json.
```

### Ascent + Judgment Only (1–1.5h)
Requires completed descent.md.
```
Read .agent/AGENT.md. Ascent, drift detection, cross-cut, judgment.
Generate recommendations.md.
```

### Action Only (30–60min)
Requires completed recommendations.md.
```
Read .agent/AGENT.md. Action phase only.
Write tests for top P0/P1 gaps. Fix bugs under 20 lines.
```

### Single Module Deep Dive (1–1.5h)
```
Read .agent/AGENT.md. Full descent (Levels 1–3) into module [name] only.
All three personas. Update knowledge graph and scorecard for that module.
```

### Re-Score Only (15–20min)
```
Read .agent/AGENT.md. Load knowledge graph and scorecard.
Scan changed files. Update scores and deltas. No full descent.
```

### Post-PR Scan (20–30min)
```
Read .agent/AGENT.md. PR merged touching [files].
Delta descent on those files + dependents.
Judgment on new findings. Update scorecard.
```

---

## 8. OPERATING CONSTRAINTS

### Always:
- Session-log entry at start AND end
- Re-read prior state during pre-flight
- Specific file paths in every finding
- Numbered steps in every P0/P1 task
- Three persona passes at every descent level
- Log every code change before making it
- Update knowledge graph after every descent and action

### Never during analysis:
- Modify source code
- Create files outside `.agent/`

### Never during any phase:
- Modify off-limits files
- Modify CLAUDE.md or AGENT.md
- Install dependencies, create routes, change schema
- Create task tracker issues above P1
- Split one finding into multiple issues

---

## 9. SESSION SUMMARY

End of every full cycle → `.agent/session-summary-[DATE].md`:

```markdown
# Analysis Session — [DATE]

## Scope: [Full / Delta — n files analyzed, n inherited]
## App Health: [X/10] (prev: [Y/10], Δ: [±Z])
## Analysis Mode: [Full / Delta]
## Files Analyzed: [n] (inherited: [n])

## Milestones
- M1: [%] (prev [%]) — blockers: [list]
- M2: [%] (prev [%]) — blockers: [list]
- M3: [%] (prev [%]) — blockers: [list]

## Top 5 Findings
1. [finding — persona — severity]
2. ...

## Cross-Persona Flags: [n items flagged by 2+ personas]
## Cross-Cut Patterns: [n] — highest leverage: [pattern name]
## Documentation Drift: [n drifted] / [n checked]

## Tasks: P0 [n] (~[effort]) | P1 [n] (~[effort]) | P2 [n] | P3 [n]
## Action: Tests [n] | Fixes [n] | Lines [n]

## What Changed Since Last Session
[specific score changes, new findings, resolved items]

## Next Session Recommendation
[focus area, suggested session format, estimated time]

## Effort to Next Milestone
[name]: ~[hours] of P0+P1 remaining
```

---

## 10. SUCCESS CRITERIA

**Successful session:**
1. Every descended module scored on all 5 dimensions by all 3 personas
2. Every finding has file paths (never "some components")
3. Every P0/P1 has numbered steps, business impact level, and persona attribution
4. Knowledge graph updated (new hashes, scores, flags)
5. Health scorecard updated with trends
6. Drift report generated (if docs exist)
7. Core transaction traced with per-step status
8. Cross-cut patterns detected (or explicitly: "none found")
9. Task dependencies mapped
10. Session log has start and end

**Failed session:**
- Generic recommendations without file names
- Judgment without re-reading descent + ascent
- P0/P1 without quadruple validation
- Core transaction trace skipped
- Code modified during analysis
- Knowledge graph not updated
- All 3 personas produced identical flags (persona separation failed)

---

## 11. OUTPUT FILES

| File | Created | Updated | Purpose |
|------|---------|---------|---------|
| `PROJECT-CONTEXT.md` | Developer | Developer | Product, market, milestones, permissions |
| `analysis-params.md` | Phase 0 | Each full cycle | Derived config |
| `knowledge-graph.json` | First descent | Every descent + action | ★ Persistent memory |
| `session-log.md` | First session | Every session | Running history |
| `descent.md` | Descent | Each descent (dated sections) | Maps, scores, persona flags |
| `ascent.md` | Ascent | Each ascent | Roll-ups, transaction trace |
| `drift-report.md` | Ascent | Each ascent | ★ Doc vs. code mismatches |
| `cross-cut.md` | Cross-Cut | Each cross-cut | Patterns |
| `judgment.md` | Judgment | Each judgment | Validation decisions |
| `recommendations.md` | Judgment | Each judgment | ★ Ranked task backlog |
| `health-scorecard.md` | First cycle | Every scoring | Persistent health + trends |
| `action-log.md` | First action | Each action | Code change records |
| `session-summary-DATE.md` | End of cycle | N/A | Human summary |

---

## 12. EVOLUTION

Append-safe. Add versioned notes below. Do not delete prior sections.
Mark superseded sections: `[SUPERSEDED by §X — DATE]`
Health scorecard history rows: permanent.

---

*Recursive Descent Analysis Agent v2.0 | March 2026*
*Persistent Memory | Multi-Persona | Business Impact | Drift Detection*
