# 04 — The agent machine

Nine named routines. Each is a prompt you run in a Claude Code session (or wire to a schedule later — see "Scheduling" at the bottom; nothing is auto-installed by this package). Agents draft and compute; **Artur sends, publishes, signs, and spends.** Every routine obeys the guardrails at the end of this file.

**Model/effort:** run everything at the session defaults (Opus subagents at max effort per `AGENTS.md` routing). Do not pass `model:`/`effort:` to economize.

---

## A1 — Morning Prospect Batch (daily, before the call block)

```
Read docs/handoff/company-strategy/v1/00-README.md §Rules and docs/strategy/sales/11-precall-scanner.md.

1. Run: node scripts/precall-scan.mjs --status. If unscanned leads < 40, run --scan --limit 100.
2. Query Sanity precallLead docs scanned in the last 24h (perspective:'raw'). Rank today's
   call list: severity of primaryLeak, then callback-window fit. Cap at 40.
3. For each: confirm the opener traces to a stored signal (never invent an observation).
4. Pull the cadence state (docs/strategy/sales/06-cadence-and-multitouch.md): list every
   prospect with an email/LinkedIn touch due today; draft those touches (plain text,
   reply-first, no link before touch 4, kill-list clean, humanizer pass).
5. Output one file: docs/strategy/sales/daily/YYYY-MM-DD-callblock.md — ranked list with
   openers + drafted touches marked DRAFT — FOUNDER SENDS.
Do not send anything. Do not modify precallLead docs.
```

## A2 — AI-Answer Sweep (industrial ammo; runs per new segment, refreshes weekly)

```
Input: a segment CSV (company, domain, category, region) from A6a/list building.
For each account (batch via the DataForSEO MCP / ai_optimization LLM-response endpoints):
1. Ask the live model set: "who stocks/sells [category] in [region]" and one part-level
   query if the catalog page reveals a flagship line. Record: named / not named / who was
   named instead. Store raw responses (screenshots or JSON) under
   docs/strategy/sales/sweeps/YYYY-MM-DD-<segment>/.
2. Run the probe scorer (lib/probe) against their domain; record the 4-category score.
3. Emit per-account opener lines that state ONLY observed results, e.g.:
   "I asked ChatGPT who stocks hydraulic fittings in the Southeast. It named [X] and [Y].
   You weren't in the answer. Report attached." Honesty gate: if we didn't run it, we
   don't say it — every line must cite its stored run file.
Output: segment ammo sheet appended to the segment file, marked DRAFT — FOUNDER SENDS.
```

## A3 — Audit-to-Proposal Drafter (on demand, same day as any audit/call)

```
Input: the audit record (form submission + founder's call notes + any PMS/CRM numbers).
1. Pick the template: docs/strategy/sales/proposals/templates/book-jobs-proposal-template.md
   or sell-product-proposal-template.md (motion decides; never blend).
2. Fill objectives → measures → value → options from the audit data only. A slot without
   real data gets CUT, not estimated. Claims only from docs/strategy/sales/_claims-library.md
   rows marked signed. If a claim was signed in 04-signoff-sheet.md but has no library row
   yet (C-06 was in this state), STOP and surface it — never silently drop a signed claim,
   never use one the library still gates.
3. Fee math per canon: install = max($30K, ~10% of modeled 12-month gain); check the 10:1
   test (< ~$250–300K modeled → recommend the sprint door or a decline, and say so).
4. Options named per ARCH-1 (book-jobs: "The leak sealed" / "Sealed, plus demand" /
   "The whole flow, run for you"). Staged billing 50/25/25 or 100%−5%. Guarantee verbatim,
   book-jobs only.
5. Humanizer pass. Output: proposals/drafts/YYYY-MM-DD-<prospect>.md marked
   DRAFT — FOUNDER REVIEWS AND SENDS SAME DAY.
```

## A4 — Content Runner (Tue + Thu)

```
1. Pick the next item by priority: SAL-411 support pieces first, then the Content Crush
   calendar order (pillars A, E, B before clusters). Read the Linear issue for its
   acceptance gates.
2. Run the engine pipeline (serp-research → draft → humanize → verify → analyze) to the
   project.yaml targets (2,000+ words, FK ≤ 8, verifier pass, analyzer ≥ 80). Vertical
   rule: examples span industrial / home services / dental.
3. node scripts/engine-to-sanity.mjs <article.html> --type <post|guide> → confirm the
   draft exists (perspective:'raw'; weak refs for unpublished targets).
4. Term capture: node scripts/glossary-queue.mjs add "..." --source <type>:<slug>.
5. Update the Linear issue (state + link), add the piece to the Wednesday publish queue:
   docs/handoff/company-strategy/v1/state/publish-queue.md.
Never publish. Never touch sanity/structure.ts without registering both files rule.
```

## A5 — Glossary Batch (weekly)

```
1. node scripts/glossary-queue.mjs list. Pick 5 terms: money-page-adjacent first
   (offer-spec sources), then career-path sources.
2. Author per the glossary standard (docs/strategy/glossary/): ≤60-word quotable
   shortDefinition, DefinedTerm schema fields, cluster links, vertical-spanning examples,
   enrichment check recorded ("enrichment: none needed" is a valid outcome).
3. Seed as drafts (weak refs). Log the batch in the publish queue for Wednesday.
```

## A6 — Link Placement Scout (weekly)

```
1. For the 6 drafts in docs/strategy/backlinks/guest-posts/: build/refresh the host
   candidate list (10/wk). Vet via DataForSEO: domain organic traffic ≥1K/mo real,
   ranks for its own head terms, topically adjacent, in-content placements visible.
   Reject listicle farms and link sellers.
2. Draft one pitch email per vetted host (plain, specific, references a real post of
   theirs). Mark DRAFT — FOUNDER SENDS.
3. Track state in docs/strategy/backlinks/placement-ledger.md (host, pitch date, status,
   live URL). Anchor discipline: the batch's one exact-match anchor is draft 03 — never
   add another.
```

## A7 — Visibility Tracker (weekly, Friday)

```
1. LLM mentions: query the DataForSEO ai_optimization endpoints for brand
   ("Sale Solution", salesolution.net) + money terms (geo agency, ai seo agency,
   aeo agency) + 2 coined-term candidates. Record who gets named.
2. SERP spot-check the SAL-411 cluster (positions for /services/ai-seo/).
3. Backlinks delta: backlinks_summary for salesolution.net (referring domains, rank).
4. GSC: if a fresh manual export exists in seo-project/data/, diff against the
   2026-06-15 baseline (impressions, clicks, AI/GEO share, new pages appearing).
5. Probe: our own score; unlock-lead count for the week (HubSpot source probe_v2).
Output: docs/handoff/company-strategy/v1/state/visibility-YYYY-WW.md — deltas only,
one page. First run records the BASELINE (this is SAL-406's stand-in until Brand
Radar prompts are configured; recommend doing both).
```

## A8 — EOD Pipeline Hygiene (daily, end of day)

```
1. Ingest any new call-log CSV in state/exports/ (the cockpit export is manual and
   per-browser: Artur clicks "Export CSV" in the cockpit and drops the file there —
   the Friday close-out slot in 05 §A exists for this); append to state/pipeline.md
   (dials, connects, booked, run, letters out, closes, by lane).
2. Linear: close issues completed today (with a one-line completion note), flag anything
   In Progress > 5 days untouched, create issues for new work only if it maps to a play.
3. Emit tomorrow's focus line: the single highest-leverage unblocked item per lane.
Keep it to 15 minutes of work. No new analysis.
```

## A9 — Weekly Operating Review (Monday — this is the master prompt's core loop, see 06)

```
1. Read state/pipeline.md, state/visibility-*.md, the publish queue, and 08-decision-queue.md.
2. Score last week vs the 02 §E planning numbers. Re-baseline dials-per-booked every
   2 weeks from real data.
3. Kill/scale: anything under floor for 2 weeks gets a fix or a kill proposal; anything
   over target gets a scale proposal. Write both as options, not decisions.
4. Surface the top 3 founder decisions for the week from 08 (with defaults).
5. Output: state/week-YYYY-WW.md — one page: numbers, reads, this week's play focus,
   decisions needed. Present it to Artur at the top of the session.
```

---

## Tool wiring

| Tool | Used by | Notes |
|---|---|---|
| `scripts/precall-scan.mjs` + Sanity `precallLead` | A1 | Needs `DFS_LOGIN`/`DFS_PASSWORD` (P0.6) |
| DataForSEO MCP (`dfs-mcp`) | A2, A6, A7 | LLM-mentions endpoints confirmed working this session |
| `lib/probe/` scorer + `/api/probe` | A2, A7 | Layer 1 is free/deterministic; AI reads spend per run |
| Content engine `.engine` + skills (`liori-content-pipeline`, `serp-research`, `humanizer`) | A4 | Publishing stays manual in `/studio` |
| `scripts/engine-to-sanity.mjs`, `scripts/glossary-queue.mjs` | A4, A5 | Env auto-loads from `.env.local` |
| Linear MCP (team SAL) | A4, A8, A9 | The close ritual is the culture fix |
| HubSpot (leads) + cockpit CSV exports | A7, A8 | Interim system of record per `08-metrics.md` |
| Apollo (optional) | list building for P3 | Manual MCP prep step per playbook v1; not wired into the app |

## Guardrails (bind every routine)

1. **Nothing external leaves an agent.** Emails, posts, pitches, proposals, publishes: DRAFT status until Artur acts. No exceptions.
2. **Claims discipline:** only signed rows from `_claims-library.md` in anything customer-facing; observed facts must cite their stored run; hedged framing for the soft stats ("industry estimates suggest…").
3. **Voice:** kill-list + humanizer on every customer-facing line; motion decides "we" vs "I"; jargon demoted to second clause per ICP rules.
4. **Compliance:** DNC honored instantly and logged; no SMS automation before A2P 10DLC; no PHI near the Meta Pixel; H1–H4 cards govern cold-contact conduct.
5. **Sanity:** drafts by default, `perspective:'raw'` to inspect, weak refs for unpublished targets, never re-run a seed over Studio edits.
6. **Git:** stage only your own files; never `git add -A`; house commit style.
7. **GATE:HUMAN list (08) is never bypassed** — an agent that hits a gated item stops and surfaces it.

## Scheduling

Run A1/A8 daily and A4/A5/A6/A7 on their days manually via the prompts above, or wire them as cron routines with the `schedule` skill once the rhythm proves out (recommended after week 2 — automate a routine only after it has run clean by hand twice). A9 stays interactive: it is the founder's meeting, not a background job.

## State directory

Routines write to `docs/handoff/company-strategy/v1/state/` (pipeline.md, publish-queue.md, visibility-*.md, week-*.md, next.md, exports/ for cockpit CSVs). Call-block sheets and sweep evidence stay under `docs/strategy/sales/` (daily/, sweeps/) where the sales tooling expects them. Create directories on first run. This keeps operating state out of the strategy docs and in one greppable place.
