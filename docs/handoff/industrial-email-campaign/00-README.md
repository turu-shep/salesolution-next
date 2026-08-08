# Industrial cold-email campaign — build it, launch it, run it for 60 days

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** blocked on G1–G7

The strategy is written. This is the build order.

**What exists:** a complete strategy pack at [`../../strategy/industrial-email-campaign/`](../../strategy/industrial-email-campaign/) — the goal math and its honest verdict ([`01-goal-math.md`](../../strategy/industrial-email-campaign/01-goal-math.md)), the three segments with literal Apollo payloads ([`02-icp-targeting.md`](../../strategy/industrial-email-campaign/02-icp-targeting.md)), the sequences and objection counters ([`03-angles-and-copy.md`](../../strategy/industrial-email-campaign/03-angles-and-copy.md)), the sending infrastructure and its red lines ([`04-deliverability-infra.md`](../../strategy/industrial-email-campaign/04-deliverability-infra.md)), an eight-stage pipeline with paste-ready prompts and script specs ([`05-automation-pipeline.md`](../../strategy/industrial-email-campaign/05-automation-pipeline.md)), the 60-day calendar and operating loops ([`06-process-runbook.md`](../../strategy/industrial-email-campaign/06-process-runbook.md)), and nine pre-flight fixes ([`07-preflight-fixes.md`](../../strategy/industrial-email-campaign/07-preflight-fixes.md)). Start at [`00-README.md`](../../strategy/industrial-email-campaign/00-README.md). State lives in [`campaign-ledger.md`](../../strategy/industrial-email-campaign/campaign-ledger.md).

**What doesn't exist:** a sender. No sequencer, no sending domains, no warm-up, no suppression list, no unsubscribe endpoint, no reply ingestion. Also no `apollo-pull.mjs`, no working CSV parser, and a scanner that can't authenticate against DataForSEO because of an env-name mismatch. Those are phases 1 and 2.

**Why this is phased instead of one long session.** Two reasons that don't overlap. First, four of the five phases are blocked on something outside a session's control — a paid Apollo key, a domain purchase, a four-week warm-up clock, and Artur's signature on seven gates. A session that tries to run straight through will fabricate its way past a blocker rather than stop at it. Second, the phases have genuinely different shapes: phase 1 is careful copy-adjacent editing, phase 2 is scripting with tests, phase 3 is a metered API run with a call budget, phase 4 is judgment against signed gates, and phase 5 repeats weekly for two months. Bundling those into one context costs quality on all five.

---

## Run order

Each phase is a standalone session. They share state through one file: [`campaign-ledger.md`](../../strategy/industrial-email-campaign/campaign-ledger.md).

| # | Phase | Reads | Output |
|---|-------|-------|--------|
| **1** | **Pre-flight fixes** | [`07-preflight-fixes.md`](../../strategy/industrial-email-campaign/07-preflight-fixes.md) | PF-5, PF-6, PF-7, PF-9 fixed and committed. PF-1, PF-2, PF-3, PF-4, PF-8 written up as PROPOSED with the exact suggested rewrite, and **stopped**. Ledger rows updated. |
| **2** | **Build the scripts** | [`05`](../../strategy/industrial-email-campaign/05-automation-pipeline.md) stages 1–3 | `scripts/apollo-pull.mjs` per the spec · the `parseCsv()` replacement with a quoted-comma fixture test · the DFS env alias · `precall-scan.mjs` extended to seed domain-first from an Apollo CSV. |
| **3** | **List build + 50-domain scan pilot** | [`02`](../../strategy/industrial-email-campaign/02-icp-targeting.md) + [`05`](../../strategy/industrial-email-campaign/05-automation-pipeline.md) stages 1–3 | 2,500–3,500 raw pulls → verified buckets → 1,400+ seated contacts with full lineage. 50 domains scanned in-session via the DataForSEO MCP, per-prospect JSON written. |
| **4** | **Copy freeze** | [`03`](../../strategy/industrial-email-campaign/03-angles-and-copy.md) + [`05`](../../strategy/industrial-email-campaign/05-automation-pipeline.md) stages 4–5 | Observation lines drafted against real pilot scan data. All three QA lints run. Sequences frozen. **Runs only after G3, G4, and G7 are signed.** |
| **5** | **Launch + the weekly loop** | [`06`](../../strategy/industrial-email-campaign/06-process-runbook.md) | Campaigns live in the tool. Then one session per week for eight weeks: scan batch, draft, lint, replenish, compute the metrics row. |

**Phase 3 needs a stated batch limit before it runs.** DataForSEO bills per call at roughly 5 calls per prospect; 200 domains is ~1,000 calls. Say the number out loud, then run.

**Two checkpoints where you stop rather than press on.** If the reply rate is under 5% by week 6, the offer or the list is wrong and no amount of copy iteration fixes it — that is our own published standard and it applies to us. If less than $20K is signed at day 45, stop adding breadth and shift the mix toward expansion-size prospects.

**G2 is the gate to clear today, before phase 1.** Warm-up is four weeks and it starts the day DNS validates. Every other gate can be decided in week 0 without costing anything; that one cannot.

---

## Guardrails

**GATE-signed copy is untouchable.** Anything marked `GATE:HUMAN` in the pack or in `.tsx` source is signed and does not get edited, improved, or "tightened." If a fix can't land without touching it, that's a `PROPOSED` row and a stop. Copy, pricing, and positioning follow the same rule; code, config, and tests get fixed autonomously.

**Never pass `model:` or `effort:`** in `agent()` calls, agent frontmatter, or workflow stages. `CLAUDE_CODE_SUBAGENT_MODEL=opus` and `CLAUDE_CODE_EFFORT_LEVEL=max` are set in user settings and win anyway; hardcoding them corrupts attribution for no benefit.

**Publishing into Sanity is manual.** There is no HTML → Portable Text converter. Content lands as drafts and Artur publishes in `/studio`.

**Three APIs bill per call: DataForSEO, Apollo, and OpenAI.** State the batch limit before any run that touches them. Apollo's `email` field on search results is credit-metered on top of the subscription. No unbounded loops, no "let's just scan the whole list and see."

**Never send to an unverified address.** Apollo email accuracy runs 60–80% against a 2% bounce kill line. Verification is the only thing standing between this campaign and a dead sending domain. `risky` and `unknown` are skips, not gambles.

**Never invent an observation.** If a scan field is null, the fallback line runs — unchanged. Not "approximately," not a derived range, not a plausible guess. One fabricated AI-answer result destroys the entire premise of the pitch, which is that we actually checked. This is also the campaign's single largest reputational risk and the easiest one for a model to walk into.

**Suppression is global and same-day.** Any phrasing counts. Email, calls, and LinkedIn together. It shares one list with the internal do-not-call list in `docs/strategy/sales/07-compliance.md`.

**The campaign is the product demo.** Every promise on `/services/outbound-email-marketing-services/` binds our own sends — 2–5 dedicated domains and never the primary, four-week warm-up, 20–50/mailbox/day, bounce under 1.5–2%, complaints under 0.3%, plain text, no open-rate reporting, six-to-seven-week runway on the scaled track. Breaking one of those inside our own campaign is a positioning bug before it is an ops bug: we sell this exact service, and the shortcut is visible to anyone who reads both.

**Industrial door only.** Primary CTA is a reply. Artifact is `/catalog-snapshot/`. Booking is `/book-growth-call/`. No contact in this campaign ever sees a Revenue Engine door, no email carries a guarantee, and no email quotes a client name or a case-study number.

---

## Model routing

Fable plans, Opus executes. The main loop holds decisions; bounded execution — reading, pulling, scanning, drafting, linting, mechanical edits — gets delegated. Phases 1, 2, and 3 are pure execution and belong on Opus end to end. Phase 4 has a judgment component. Phase 5 is weekly execution with one judgment call in it (the kill/scale review), and that call is Artur's.

---

## The ledger contract

One shared state file: [`../../strategy/industrial-email-campaign/campaign-ledger.md`](../../strategy/industrial-email-campaign/campaign-ledger.md).

One row per gate, per decision, and per weekly metric. **Never delete a row** — a declined gate and a bad week are both data. Corrections are written inline as amendments underneath the original, never by editing it, so the wrong version stays visible.

```
### G3 · gate · OPEN
**Decision:** One sentence. What Artur is choosing between.
**Blocks:** What cannot happen until this is signed.
**Specified in:** file · section
**Signed:** —
**Notes:** —
```

Status: `OPEN` → `SIGNED` | `DECLINED` for gates · `OPEN` → `FIXED` | `PROPOSED` | `DEFERRED` for pre-flight items. Severity is the house scale: S1 exploitable or legally exposed · S2 real user or revenue impact · S3 quality · S4 nit.

**A session may append weekly-metrics rows and may flip a PF row to `FIXED` with the commit reference. Gate rows are Artur's alone.** No session signs a gate, and no session softens one.

---

## What the ledger already knows

Seven gates, all OPEN, all Artur's:

- **G1** — Apollo paid tier + `APOLLO_API_KEY`. Blocks all list building.
- **G2** — Instantly or Smartlead account + 2–3 domains, ~$300–500. Blocks Track 2. **Longest lead time in the pack: four-week warm-up starts the day DNS validates.**
- **G3** — Angle 2: expansion framing, dropship language, manufacturer brand naming, and whether the Catalog AI page gets an expansion block. "Dropship" appears nowhere in the repo — a full-corpus grep returned zero hits, so this is new positioning with no approved copy behind it.
- **G4** — the three new objection counters. No documented counter exists for any of them.
- **G5** — Track 1 founder-manual sending. **This one changes the revenue number in `01`.** Declining costs roughly three weeks of the 60 and moves the honest target to $25–40K.
- **G6** — the four gated pre-flight items (PF-2, PF-3, PF-4, PF-8).
- **G7** — confirm the booking link the reply CTA hands out. Two minutes to close.

Nine pre-flight items, all OPEN:

- **PF-1** · S2 · `CatalogCaseStudyCallout.tsx:24` still carries "Qualified leads doubled inside two quarters" — a sentence the fact ledger killed. Prospects clicking through from our email land on a claim we retracted internally.
- **PF-2** · S2 · The campaign targets $5M–$75M; `/catalog-snapshot/` says $2M–$50M.
- **PF-3** · S3 · The same page calls 1,000+ SKUs a strong fit and under 200 a skip, leaving 200–999 in both buckets.
- **PF-4** · S2 · `/catalog-snapshot/` may be replaced or merged under pivot Phase 3, and E2's UTM'd link points at it.
- **PF-5** · S3 · `brand/tools.yaml` says no tools are live; two are.
- **PF-6** · S3 · `precall-scan.mjs:43` reads `DFS_LOGIN`/`DFS_PASSWORD`; `.env.local` has `DATAFORSEO_USERNAME`/`DATAFORSEO_PASSWORD`. One line, and it unblocks the whole personalization engine.
- **PF-7** · S3 · `parseCsv()` has no quote handling; Apollo exports with commas in company names will corrupt rows.
- **PF-8** · S2 · NAP sweep unconfirmed, three addresses live on-site, and CAN-SPAM requires a correct one in every message.
- **PF-9** · S4 · `ss local env` at repo root — a second secret store that will drift.

**One open question the pack raises and does not answer:** 10,000 SKUs sits exactly on the published volume break. At the entry rate an expansion deal is $30,000; at the 10K–49,999 rate it is $25,000. That is a $5,000 gap on the single biggest deal shape in the plan, and it should be settled on the rate-card page before the first proposal, not in a negotiation.

---

## Done looks like

- [ ] **G1–G7 all `SIGNED` or `DECLINED`** in the ledger, each with a date. A declined gate is a finished gate.
- [ ] **PF-1 through PF-9 all `FIXED`, `PROPOSED`, or `DEFERRED`** with a written reason.
- [ ] **1,400–2,000 verified contacts in sequence**, every row carrying `source_url`, `pulled_at`, `source_provider`, `segment`, `verify_state`, and `annual_revenue`.
- [ ] **50 domains scanned** in the pilot, per-prospect JSON written, and the observation lines drafted from it show a fallback rate under 50%.
- [ ] **Sequences live in the sending tool** — micro-campaigns of ≤50, one segment and one angle each, plain text, blocklist synced, throttled to the current warm-up stage.
- [ ] **A weekly metrics row posted every Friday**, including the bad weeks. No gaps.
- [ ] **Bounce under 2% and complaints under 0.3%** on every sending domain, every week.
- [ ] **Both dollar lines tracked against the verdict in [`01-goal-math.md`](../../strategy/industrial-email-campaign/01-goal-math.md)** — `$ signed` against $60K stretch / $25–40K base, and `$ in live pilots and proposals` against $40–80K base.
- [ ] **A written day-60 decision in the ledger** — continue, scale, or rework — with the reason. No decision means day 61 defaults to "keep going," which is the one option nobody chose.
