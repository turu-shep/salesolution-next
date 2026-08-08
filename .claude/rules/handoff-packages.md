# Handoff Packages

Two artifacts share the word "handoff" — do not confuse them:

| Artifact | Location | Direction | Governed by |
|---|---|---|---|
| **Continuity doc** (`/handoff`) | `docs/plans/<issue>-handoff-<ts>.md` | Backward — what this session did, so the next one can resume | `.claude/commands/handoff.md` |
| **Handoff package** | `docs/handoff/<slug>/` | Forward — pre-planned work a fresh session executes end-to-end | This rule |

Create a package when Artur asks for one ("handoff package", "package this", "write a handoff package for X") or when a strategy/research arc ends with runnable work meant for a fresh session. ("Write a handoff" for the *current session's* work means the `/handoff` continuity doc, not a package.) Artur executes packages by opening the folder and pasting its `PROMPT.md` — the entire format serves that flow.

## Two shapes

### 1. Single package (default)

```
docs/handoff/<feature-slug>/
  PROMPT.md                        — paste-ready, pre-filled for THIS folder. Start here.
  00-README.md                     — mission, scope, gates, Linear, success criteria, context loading
  01-current-state.md              — verified anchors against a named commit
  02-implementation-direction.md   — steps, open decisions, verification, risks
  CLOSEOUT.md                      — written by the EXECUTING session, never pre-written
```

### 2. Phased package ("do the handoff by phases")

When Artur says to do the handoff **by phases** (or the work naturally spans multiple phases of a feature/task/goal/strategy), keep the same 4-doc format but give **each phase its own sub-folder**:

```
docs/handoff/<program>/
  README.md            — execution map (see contract below)
  PROMPT.md            — SHARED execution protocol (numbered steps + ## Variants)
  phase-1-<slug>/      — a full package: PROMPT.md + 00 + 01 + 02 (+ CLOSEOUT when executed)
  phase-2-<slug>/
  ...
```

When the program spans **versions**, insert version folders; phases nest inside versions, never the reverse:

```
docs/handoff/<program>/
  README.md
  PROMPT.md
  vX.Y/
    README.md          — phase map table (Phase | Folder | Status, + Gate column when any phase is gated)
    phase-N-<slug>/
```

The version README gets a dated `> Reality check` note when reality has diverged from the ladder since the version was planned (work shipped early, out of order, or differently); its absence means "nothing diverged".

Rules for phased packages:
- **Only decision-free, runnable phases get packaged.** Gated phases (GATE:HUMAN pending) live as rows in the README's "Gated (NOT packaged)" table until their gate clears.
- The program `README.md` carries: pointer to the strategy layer, a dated state note against a commit, the structure explanation, a **Runnable today** table (`Package | Delivers | Collisions`), the gated table, and Linear guidance (what to mint, what NOT to duplicate).
- The shared `PROMPT.md` holds the protocol once — but it **never substitutes** for per-phase prompts.
- **Every phase folder still gets its own `PROMPT.md`** — non-negotiable (Artur flagged its absence twice). It references the shared protocol by path in one line, then adds *Package-specific notes*: pre-taken **[default]** decisions spelled out, hard do-not-touch lines in bold, which Linear draft to create from, explicit owner-loop items ("publishing the seeded drafts happens in /studio by me — leave them drafts, tell me when ready"; "Vercel env var X is set by me — fail soft until then"), and a declared parallelization stance — a `## Variants` batch line naming the worktree-safe siblings when batching is safe, or an explicit ordering/prohibition line in the notes when it isn't.

## Per-file contracts

**`PROMPT.md` (per-folder)** — a paste-ready block, path pre-filled (no `<PLACEHOLDER>` the user must edit). Must include: load-context-first ordering, the execution-brief step ending in **"Wait for my go"** (decisions marked **[default]** are taken and logged without asking), a `## Variants` section with at least a research-only variant ("stop after the execution brief"), and a parallelization stance somewhere in the prompt (Variants batch line when worktree-safe, ordering/prohibition note when not).

**`00-README.md`** — opens with `**Written:** <date>, against \`main\` @ \`<sha>\`. Execute with <PROMPT path>.` Then:
- `## Mission` — one paragraph, includes why-now and what breaks today
- `## Scope` — `**IN:**` numbered / `**OUT:**` explicit, with parked items marked "own issue if wanted"
- `## Gates` — what must be true to run; state `None` explicitly, listing any **[default]** decisions to take and log. GATE:HUMAN items (pricing, offers, case-study facts, publishing) are gates, not steps.
- `## Linear` — issue title to mint (team SAL), prior art to cite, do-NOT-duplicate list (verified against Linear at write time), create-from-draft pointers when applicable
- `## Success criteria` — numbered and concretely walkable ("open /glossary/term → hovercard renders → alias 301s"), not vibes. These are the package's KPIs.
- `## Context loading` — module docs, learnings, specs, strategy docs, and decision-log greps to load before code. (Shared protocols reference this section — it is required, not optional.)

**`01-current-state.md`** — titled `# 01 — Current state (verified <date>, main @ <sha>)`. Per-area verified behavior with `file:line` anchors; hard guards labeled explicitly ("lead-API rate-limit contract — **do not weaken**").

**`02-implementation-direction.md`** — optional framing sentence (design principle / ordering rationale), then the implementation sections in whatever shape fits the work — a `## Steps` list, per-item `## N. <thing>` headings, or workstream headings — each with `file:line` targets and **[default]** markers where a decision is pre-taken. Then, universally:
- `## Open decisions` — each with a **[default]** or an explicit "owner decides" flag
- `## Verification` — concrete QA walks (production checks on `salesolution.net`, or localhost dev-server walks — remember Next dev flakiness: one dev server, stable 200s before screenshots) plus regression assertions ("existing glossary pages byte-identical", "sitemap diff empty")
- `## Risks` — short, concrete, mitigation baked into the line

**`CLOSEOUT.md`** — added by the executing session when the package ships. Header: `**Executed:** <date> (<session mode>)`, `**Linear:**`, `**Branch/PR:**`, `**Owner actions pending:**` (e.g. Studio publishing). Then:
- `## What shipped` — mapped to the numbered IN-scope items. **Quantify: never "improved" — always "from X to Y".**
- `## Verification` — test counts, build/lint results, walk outcomes
- `## What we tried` — only when non-trivial dead ends occurred: chronological `hypothesis → change → result (with numbers) → why abandoned`. Failed approaches are the most expensive thing for the next session to rediscover.
- `## Owner actions required`
- `## Discrepancies vs. the package` — where code beat docs (proves the drift-check loop ran)
- `## Deferred / residuals`
- `## Interplay with sibling packages` — how siblings should consume this work, in either execution order

## Hard rules

1. **Per-folder `PROMPT.md`, always.** A shared protocol at the program root is the rulebook; it never replaces the per-folder paste-ready prompt. Write `PROMPT.md` as part of the package skeleton, not as an afterthought.
2. **Commit-stamp everything.** Packages state the sha they were written against; when in-flight parallel sessions make HEAD unstable, the accepted substitute is a dated branch-state note naming the in-flight work plus a mandatory collision re-check at execution start. At execution time, `01` claims are drift-checked using `.claude/rules/plan-drift.md`'s detection/classification mechanics — but the package PROMPT **pre-authorizes the resolution**: follow the code and log the discrepancy (CLOSEOUT §Discrepancies + a decision entry) without stopping. Plan-drift's STOP-and-ask applies only when drift invalidates the package's approach or opens a gate.
3. **Scope is a contract.** `00 §Scope OUT` stays out even when adjacent code invites it; parked items become Linear issues, not code. One package = one Linear issue = one PR unless `00` says otherwise; PRs target `main`.
4. **Collision notes are load-bearing.** The Runnable table's Collisions column and each phase-PROMPT's parallelization stance are what makes batch mode safe. Declare them for every package in a phased set.
5. **Two-layer doctrine.** `docs/strategy/<program>/` is the *why* (version ladder, theses, gates); `docs/handoff/<program>/` is the *runnable*. Scope disputes resolve against the strategy layer.
6. **Chain hygiene.** When reality has diverged from a predecessor's plan, the successor package (or version README) opens with a dated reality-check — a `> Reality check` blockquote or 3–8 bullets — comparing planned vs. shipped and flagging identifiers that no longer exist ("stale references"). Never trust a prior package's "current state" without re-reconnaissance — check its CLOSEOUT first.
7. **Density discipline.** Target 25–45 lines per doc, anchor-heavy, zero filler. A package is a briefing, not a novel — line-count minimums incentivize padding and are explicitly rejected here.
8. **Closeouts feed forward.** When a phase closes out, update the program/version README status so the Runnable table stays true.

## Post-write self-check (before presenting a package)

Verify, and rewrite thin sections rather than shipping them:
- [ ] Every package folder has its own `PROMPT.md`, path pre-filled, "wait for my go" present
- [ ] `00` opens with the Written-against stamp (sha, or dated branch-state note when HEAD was unstable); `01`'s title carries the verified-at stamp
- [ ] Success criteria are walkable by a human, numbered
- [ ] The Linear do-not-duplicate list was actually checked against Linear (or a drafts-file pointer is used when Linear is down — never invent issue IDs)
- [ ] Collisions/parallelization declared for every package in a phased set
- [ ] Specific file:line anchors present in `01`; no section is hand-waving

## Legacy

Everything in `docs/handoff/` and `emails/handoff/` written before this rule landed (2026-08-08) predates the contract and varies in structure — e.g. `docs/handoff/2026-07/…` date folders, `docs/handoff/opus-5-plan/`, `emails/handoff/industrial-contact-list/`. Read them for content, not format — do not "fix" them retroactively. New packages follow this rule; this rule (ported from the Field Advisor template Artur developed it in) is format-authoritative until a first Salesolution package written under it exists to point to.
