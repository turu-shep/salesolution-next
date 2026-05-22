# Changelog

## [2.0.0] — 2026-03-26

### Added
- **Persistent Codebase Memory** — `knowledge-graph.json` stores file hashes, dependency maps, scores, and persona flags across sessions. Delta analysis uses git diff to only re-analyze changed files and their dependents. Drops weekly cycle time from 3–5h to 30–60min after first run.
- **Multi-Persona Descent** — Three expert lenses (Architect, User, Adversary) run at every descent level. Each persona has distinct evaluation criteria, flag prefixes, and scoring weights. Cross-persona promotion: 2+ personas flagging the same item → auto P1 minimum, 3 personas → auto P0.
- **Business Impact Scoring** — Every task gets an impact classification: Revenue Blocking, Revenue Degrading, Milestone Blocking, Milestone Degrading, Operational Risk, Technical Debt, or No Business Impact. Revenue-affecting tasks include dollar estimates based on PROJECT-CONTEXT revenue data.
- **Documentation Drift Detection** — During ascent, cross-references all listed documentation against actual code. Produces `drift-report.md` with per-assertion status (Confirmed / Drifted / Unverifiable), severity rating, and fix direction (Fix Code / Fix Doc / Manual Decision).
- **Delta Run session format** — New 30–60min session type that loads the knowledge graph, diffs against git, and only re-analyzes stale files.
- **Quadruple Validation** — Judgment phase adds Check 4 (Business Impact) to the existing triple validation. Findings with no business impact capped at P3.
- **Persona calibration in analysis-params.md** — Persona weights adjust based on project stage and focus areas.
- **Revenue context in PROJECT-CONTEXT.md** — New §4.5 for transaction value, volume, and revenue model.
- **Documentation inventory in PROJECT-CONTEXT.md** — New §5.2 listing all docs to cross-reference for drift.
- **Knowledge graph JSON schema** — Formal schema in `schemas/knowledge-graph.schema.json`.
- **Example files** — `examples/knowledge-graph-example.json`, `examples/drift-report-example.md`.

### Changed
- **Descent protocol** — Now runs MAP → Architect → User → Adversary → Combine at every level instead of a single generic pass.
- **Scoring** — Combined scores use persona-weighted adjustments instead of flat scoring.
- **Recommendations format** — Tasks now include Business Impact, Impact Detail, Revenue Effect, and Personas fields.
- **Health scorecard** — New columns for per-persona scores, drift count, and analysis mode (Full/Delta).
- **Cross-cut patterns** — Now tagged by detecting persona.
- **Repo structure** — Reorganized into `templates/`, `schemas/`, `examples/` directories.

### Unchanged
- Core recursive descent → ascent → cross-cut → judgment → action flow
- PROJECT-CONTEXT.md sections 1–4 (excluding 4.5), 5 (excluding 5.2), 6, 7
- Action phase rules and limits
- Session summary format (extended, not replaced)
- Evolution and append-safety rules

## [1.0.0] — 2026-03-26

### Added
- Initial release: recursive descent analysis (Levels 0–3) with pruning
- PROJECT-CONTEXT.md input template
- Universal AGENT-TEMPLATE.md protocol
- 5-dimension scoring (Completeness, Robustness, Code Quality, Security, Test Coverage)
- Triple validation for task judgment
- Action phase with test generation and small bug fixes
- Health scorecard with trend tracking
- Multiple session formats (Full, Level-only, Action-only, Re-score, Post-PR)
