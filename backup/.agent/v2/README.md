# Recursive Descent Analysis Agent v2.0

A Claude Code-powered system that analyzes any codebase through three expert lenses (Architect, User, Adversary), remembers what it analyzed across sessions, ties every finding to business impact, and catches when your documentation drifts from your code.

**New in V2.0:** Persistent memory (30–60 min weekly sessions instead of 3–5h), multi-persona analysis, business impact scoring, documentation drift detection.

---

## What's in this repo

```
recursive-descent-agent/
├── README.md                              ← You are here
├── CHANGELOG.md                           ← Version history
├── IMPLEMENTATION-GUIDE.md                ← Deep technical guide for V1→V2.0 changes
├── V2-ROADMAP.md                          ← Future versions (V2.1, V2.2)
├── templates/
│   ├── AGENT-TEMPLATE.md                  ← The agent protocol (drop into any project)
│   └── PROJECT-CONTEXT.md                 ← Input template you fill out per project
├── schemas/
│   └── knowledge-graph.schema.json        ← JSON schema for the persistent memory
└── examples/
    ├── knowledge-graph-example.json       ← What a populated knowledge graph looks like
    └── drift-report-example.md            ← What drift detection produces
```

---

## Quick start (5 minutes to first run)

### 1. Set up the agent in your project

```bash
mkdir -p .agent
cp /path/to/this-repo/templates/AGENT-TEMPLATE.md .agent/AGENT.md
cp /path/to/this-repo/templates/PROJECT-CONTEXT.md .agent/PROJECT-CONTEXT.md
```

### 2. Fill out PROJECT-CONTEXT.md (~15 min)

Open `.agent/PROJECT-CONTEXT.md` and fill in all seven sections. The most important fields:

- **§1 Core transaction** — the one thing that must work. The entire priority system hinges on this.
- **§3 Milestones** — what "done" looks like, with blocker tests.
- **§3 Does NOT matter** — prevents the agent from recommending work you'll ignore.
- **§4.5 Revenue context** *(V2.0)* — enables dollar-value business impact scoring.
- **§5.2 Documentation locations** *(V2.0)* — tells the agent which docs to cross-reference for drift.

### 3. First run in Claude Code (3–5 hours)

```
Read .agent/AGENT.md. This is the first run.
Execute full protocol: Phase 0 → Descent → Ascent → Cross-Cut → Judgment → Action → Scorecard.
Build the knowledge graph during descent.
```

This is the slowest session — it builds the knowledge graph from scratch. After this, sessions are 30–60 minutes.

### 4. Subsequent sessions (30–60 min)

```
Read .agent/AGENT.md. Delta run.
Load knowledge-graph.json. Diff against git since last session.
Re-descend into changed files and dependents only.
Update all outputs.
```

---

## Session commands cheat sheet

| Time | Command |
|------|---------|
| **3–5h** | `Read .agent/AGENT.md. Full cycle: Phase 0 → Descent → Ascent → Cross-Cut → Judgment → Action → Scorecard.` |
| **30–60min** | `Read .agent/AGENT.md. Delta run. Load knowledge graph, diff since last session, re-analyze changes only.` |
| **2–3h** | `Read .agent/AGENT.md. Phase 0 and Descent only. Build knowledge graph.` |
| **1–1.5h** | `Read .agent/AGENT.md. Ascent + drift detection + cross-cut + judgment. Descent is complete.` |
| **1–1.5h** | `Read .agent/AGENT.md. Full descent into module [NAME] only. All three personas.` |
| **30–60min** | `Read .agent/AGENT.md. Action phase only. Write tests, fix P0 bugs.` |
| **20–30min** | `Read .agent/AGENT.md. Post-PR scan. Files changed: [LIST]. Update scorecard.` |
| **15–20min** | `Read .agent/AGENT.md. Re-score only. Update scorecard from recent changes.` |

### Recommended weekly cadence

```
Monday     Full Cycle or Delta Run + Deep Dive       2–3h
Tuesday    Descent Level 3 on flagged areas           1–2h
Wednesday  Ascent + Cross-Cut + Judgment              1–1.5h
Thursday   Action Phase (tests + fixes)               1–2h
Friday     Re-Score + summary + task tracker import   30min
```

---

## What V2.0 produces

After a full cycle, your `.agent/` folder contains:

| File | What it is |
|------|-----------|
| `analysis-params.md` | Agent's derived config from your PROJECT-CONTEXT |
| **`knowledge-graph.json`** | ★ Persistent memory — file hashes, dependencies, per-persona scores |
| `descent.md` | Structural maps with Architect/User/Adversary flags at every level |
| `ascent.md` | Rolled-up scores, core transaction trace |
| **`drift-report.md`** | ★ Where your documentation disagrees with your code |
| `cross-cut.md` | Patterns repeated across modules (systemic fixes) |
| `judgment.md` | Validation decisions with business impact scoring |
| **`recommendations.md`** | ★ THE MAIN OUTPUT — prioritized tasks with revenue impact |
| `health-scorecard.md` | Module health tracking with per-persona scores and trends |
| `action-log.md` | Tests written and bugs fixed |
| `session-summary-DATE.md` | Human-readable summary |

---

## What's different from V1

| | V1 | V2.0 |
|---|-----|------|
| **Re-analysis** | Full codebase every time (3–5h) | Delta via knowledge graph (30–60min) |
| **Analysis voice** | Single generic perspective | 3 personas: Architect, User, Adversary |
| **Task justification** | Effort + priority | + Business impact with revenue framing |
| **Documentation** | Reads docs, trusts them | Cross-references docs vs. code, flags drift |
| **Memory** | None between sessions | Persistent knowledge graph |
| **Output audience** | Developers | Developers + business stakeholders |
| **Auto-promotion** | Manual priority only | 2+ personas flag same item → auto P1/P0 |

---

## Tips

**Filling out PROJECT-CONTEXT:**
- "Core transaction" is the single most important field. If wrong, the agent optimizes for the wrong thing.
- "Does NOT matter" saves more time than the goals field.
- Revenue context (§4.5) can be approximate — even "$100-200 per transaction" helps.

**Running sessions:**
- First run is slow. Split across 2 days if needed (Day 1: descent, Day 2: the rest).
- Delta runs are the normal mode after the first run — use them as your default.
- If the knowledge graph feels stale, do a full cycle to rebuild it.

**Reading the output:**
- `recommendations.md` is the only file most people need to read.
- P0 tasks with "Revenue Blocking" impact are the highest-signal items.
- Cross-persona flags (flagged by 2+ personas) are almost always real problems.
- `drift-report.md` often reveals bugs hiding in plain sight.

**On .gitignore:**
- `knowledge-graph.json` can be large — consider .gitignoring it.
- Or commit it if you want persistent memory across machines.
- `recommendations.md` is usually worth committing — it's your audit trail.

---

## Further reading

- **IMPLEMENTATION-GUIDE.md** — technical deep-dive on every V2.0 feature
- **V2-ROADMAP.md** — what's coming in V2.1 (user journeys, competitive analysis, ADRs) and V2.2 (self-improving judgment, E2E test generation, session planning)
- **schemas/knowledge-graph.schema.json** — formal schema for the knowledge graph
- **examples/** — real examples of what the agent produces
