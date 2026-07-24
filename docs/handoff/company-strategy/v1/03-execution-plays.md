# 03 — Execution plays

Eleven plays. P0 and P1 are sequenced; P1.5 runs in week 1; P2–P6 run in parallel once P0 clears; P7–P8 are gated; P9 is continuous. Each card names the owner split (founder vs agent), the definition of done, and the one metric that says it's working. Agent prompts live in [04-agent-machine.md](04-agent-machine.md); founder decisions in [08-decision-queue.md](08-decision-queue.md).

---

## P0 — Turn the key (target: 48–72 hours)

**Objective:** everything already built is live, delivering, and measured. Nothing new gets built until this card closes.

Steps (verify each — several may already be done; the working tree has uncommitted probe work):

1. **Ship local work.** Commit the working tree deliberately (probe v2 files, `public/llms.txt`, section edits — stage your own files, never `git add -A`), push `main` (6 commits ahead), confirm Vercel deploy goes green.
2. **Verify SAL-432.** The dentists-rework branch `seo-geo-readiness-fixes` no longer exists. Confirm the Retain-first rework is in `main` (check `/revenue-engine/dentists/` copy leads on cold treatment plans + recall); if lost, recover from the Linear issue's checklist.
3. **Vercel env — leads and booking (the silent-loss fix):** HubSpot + Resend vars per `lib/lead-form/` + `lib/probe/unlock`, `NEXT_PUBLIC_CALENDLY_URL`. Then send one test lead through LeadForm AND the Revenue Leak Audit form; confirm both arrive (HubSpot record + email), not just 200s.
4. **Vercel env — probe Layer 2:** `ANTHROPIC_API_KEY`, `PROBE_GATE_SECRET`, `UPSTASH_REDIS_REST_URL`/`_TOKEN`, `DATAFORSEO_USERNAME`/`_PASSWORD`; **remove `PROBE_AI_MOCK`**. Founder reviews report/methodology/AI-panel copy (GATE:HUMAN rows in `docs/strategy/offer-research/alignment/home.md` §H–§K). Run one real AI read end-to-end.
5. **Vercel env — measurement + gates:** `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` (server-side failsafe), `SALES_ENABLED`/`SALES_PASSWORD`/`SALES_SESSION_SECRET` (cockpit in prod).
6. **Local env — scanner:** `DFS_LOGIN`/`DFS_PASSWORD` in `.env.local`; run `node scripts/precall-scan.mjs --status`, then a first `--seed-search` + `--scan --limit 25` smoke batch.
7. **Own-probe hygiene:** confirm `/llms.txt` serves 200 in prod and homepage `<title>` ≤60 chars; re-run the probe on salesolution.net and record the new score.
8. **Fix the known one-liner:** `<AuditCTA id="audit" vertical="dental" />` on the medical pillar if not already staged into main (MED-8.3 — signed).
9. **[VERIFY] pack with Artur (one sitting, ~30 min):** current guarantee/terms wording as spoken, monthly price bands for both motions (deliberately not in repo), dental BAA list, `561-531-4339` routing, GHL audit-embed/calendar state (RE-203 remainder). Log answers into the cockpit's verify checklist.
10. **Linear hygiene reset:** create the two missing probe issues from `docs/handoff/2026-07/09/linear-before-launch-issues.md`, close everything this card completes, mark SAL-404 superseded by SAL-411 (as its own text instructs).

**DoD:** a stranger can run the probe including the AI read; a test lead lands in HubSpot + inbox from both forms; the cockpit opens in prod; the scanner has scanned 25 real leads; prod == local `main`; the [VERIFY] answers are written down.
**Metric:** hours to close this card. Everything else waits on it.

---

## P1 — Beautiful Smiles: decide it (target: ≤14 days)

**Objective:** the live $30K dental deal reaches a signed rate letter or a clean no.

1. **File C-06 into the claims library first.** The sign-off sheet signed it (MED-8.1, 2026-07-07) but `docs/strategy/sales/_claims-library.md` still carries the stale DO-NOT-USE row — and every drafting agent obeys the library, so without this one-file edit the linchpin stat gets stripped from the proposal. Write the sourced row (Henry Schein One 2026 Catalyst Index, 45% avg / 75% top-decile).
2. Run the real Revenue Leak Audit on the practice (missed-call test, GBP, site, treatment-plan follow-up questions per the proposal's §6 checklist). Agent assembles data; founder makes the observed-fact calls.
3. Fill every `[SLOT]` in `docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md` from audit/PMS data. A slot that can't be filled gets cut, not guessed.
4. Decide C-06 usage on the call (quantitative) vs qualitative — founder's call per the pre-call checklist.
5. Book and run the 20–25-min post-audit call (Objectives → Measures → Value → Mechanism → Options). Hinge line verbatim.
6. Same-day rate letter (agent drafts from the master within the hour; founder edits + sends).

**DoD:** rate letter sent same-day after the call, or a documented disqualify.
**Metric:** days from today to decision.

---

## P1.5 — Warm book sweep (week 1, parallel with P1)

**Objective:** the highest-conversion revenue first. Seven attested engagements exist (F-01: industrial, jewelry, motorsports, wood flooring, dental, roofing, manufacturing) plus whatever proposals went quiet — and the plan otherwise opens on the two coldest channels there are.

1. Founder lists the book: the F-01 seven + every proposal or conversation dormant ≤12 months. Agent builds a one-pager per account: what was delivered, current state of their site/GBP/AI answer (fresh scanner + probe + sweep runs), and one concrete next-value idea priced per canon.
2. Three asks per account, founder's voice, one call or email each: (a) **expansion** — the next cylinder, retainer, or FGO where the relationship supports it; (b) **referral** — one name in their trade; (c) **consent** — a named testimonial or case-study window/disclosure decision (feeds P5 directly; Liori consent is already recorded, name only).
3. Warm close-rate expectation is 30–50% on right-sized asks. These calls also pressure-test pricing language before the cold lanes repeat it.
4. Every touch logged in the pipeline like any lane.

**DoD:** every book account touched once with a specific ask; outcomes logged.
**Metric:** warm-sourced revenue + referrals + consents inside 30 days.

---

## P2 — Dental outbound lane (daily, from week 1)

**Objective:** a permanent, scanner-armed founder call block producing booked audits in dental.

1. Agent seeds the scanner per metro config (start: the practice-dense metros nearest existing presence — founder picks 2 in 08) and scans 100/night.
2. Each morning the cockpit holds a ranked call list: leak found, opener drafted from the stored signal, callback timing. Founder runs the 90-min block on the dental track (`/sales/playbook`), logs every call (the logger enforces `leak_observed`).
3. 8-touch cadence per `06-cadence-and-multitouch.md`; agent drafts the email touches for founder send; suppression on any hard no.
4. Every completed audit → same-day 3-option rate letter (agent-drafted from the book-jobs template).
5. Friday: export the call log CSV; agent computes dials→connects→booked and re-baselines every 2 weeks.

**DoD (setup):** first 5 call blocks completed with logged outcomes.
**Metric:** booked audits/week (target 2–3 from this lane); dials per booked (re-baselined).

---

## P3 — Industrial outbound lane (from week 1–2)

**Objective:** a founder email+LinkedIn+call motion putting Growth Calls on the calendar with $5–75M distributors.

**Validation gate first:** zero search volume means nobody competes here — and also that demand is unproven. The lane opens as a 2-week test (2 segments, ≤100 accounts total). It earns its permanent daily block only if reply rate ≥2% or ≥1 Growth Call books by week 3. If it fails: shrink to LinkedIn-only while the authority engine builds, re-angle the offer, re-test in month 2.

1. **List:** agent builds segments of ≤50 (sub-vertical × region; start with hydraulics/fluid-power and fastener/MRO adjacents — domains where the claims banks and case-study material already live). Apollo if the key exists; manual build otherwise. Two lists, never merged with book-jobs.
2. **Ammo:** the AI-answer sweep (04/A2) runs the actual ChatGPT/AI check per account ("who stocks [category] in [region]") and stores named/not-named evidence + screenshots. Probe scores per domain ride along.
3. **Sequence:** reply-first plain-text emails, observed fact in line one, no link until touch 4–5, one-click unsubscribe, ramped sending. LinkedIn connect + comment as the parallel touch. Calls to engagers per the industrial track.
4. **Door:** Growth Call (15–30 min) → 48h SOW; sprint offered as the skeptic's door (credits 100% to install ≤90 days).
5. **LinkedIn founder motion:** 2 posts/week from real artifacts (AI-answer screenshots, probe findings, data-study cuts). Agent drafts; founder edits + posts.

**DoD (setup):** first two segments (≤100 accounts) sequenced with sweep-armed openers; sender hygiene verified (SPF/DKIM/DMARC aligned).
**Metric:** Growth Calls booked/week (target 1–2); reply rate per batch (floor: 2%; pause + fix under 1%).

---

## P4 — Probe as the public wedge (week 2+)

**Objective:** the deployed probe generates inbound emails and outbound ammunition.

1. Deployed in P0. Then: LinkedIn post with salesolution.net's own before/after score and the fixes (dogfooding as proof).
2. Fold into outbound: industrial touches can carry "your site reads [score] on the AI-readiness probe — report attached" (Layer-1 scores are free to generate; every claim traces to the stored run).
3. Pitch one piece to the ICP's own media (DSG/MDM newsletters) pairing the probe with data-study #1 findings.
4. Watch the unlock funnel (email unlocks 6 AI reads → HubSpot source `probe_v2`): agent reports weekly signups + which domains ran it.

**DoD:** probe public + first distribution post live + unlock leads flowing into HubSpot.
**Metric:** probe runs/week; unlock emails/week (the new inbound line).

---

## P5 — Proof: make it publishable (weeks 1–4)

**Objective:** from "no publishable case study" to two live studies + a verified claims surface.

1. Founder clears the case-study gates in one sitting (08 lists them): disclosure decision per study (the ledger's own test: "does a single client's CRM produce these exact numbers?"), real windows for #2–#5, execute the Northern Hydraulics rename on the noindex v2-1 composite (the decided resolution in `AGENTS.md`).
2. Agent then edits the two least-blocked studies to locked status, attaches source artifacts named in `fact-ledger.md`, founder publishes.
3. Sweep for regressed fabricated proof (ARCH-3 strays: "42 sprints", "42 e-commerce brands", "60% of builds") — grep the live routes, confirm none render.
4. Place the Liori named line (consent recorded: name only, no outcome claims) where the consumer surface already expects it.
5. Claims work: fix the C-07…C-09 numbering collision (medical vs home-services), then queue §B claims rows (C-07…C-13 + industrial bank) for founder sign-off in batches of 5 — each signed row upgrades a page from qualitative to quantified.

**DoD:** 2 studies live with disclosure badges; zero fabricated strays; claims library gaining signed rows weekly.
**Metric:** signed claims rows; live studies.

---

## P6 — Authority engine (continuous; agent-run; founder publishes Wednesdays)

**Objective:** the citation/authority machine runs at fixed cost in founder attention, in the priority order the data supports.

1. **SAL-411 first** — retarget `/services/ai-seo/` on the buyer cluster (ai seo agency / geo agency / aeo agency, KD 3–15), capture-and-subvert copy ("one senior operator, not an agency layer"), close SAL-404 as superseded. This is the one SERP play with winnable difficulty.
2. **Guest posts:** vet hosts for the 6 drafted posts (real ≥1K organic traffic, ranks for own terms, in-content placement), pitch, place; track live links. Anchor discipline is already designed (one exact-match across the batch).
3. **Content cadence 2/week** through the engine (`liori-content-pipeline` + `serp-research`), pillar-first (A GEO, E money page support, B AI Overviews), each piece → `scripts/engine-to-sanity.mjs` → Sanity draft → founder Wednesday publish block. Term capture after every piece (`scripts/glossary-queue.mjs add … --source`).
4. **Data study #1 (this month):** "We asked [ChatGPT/AI] N industrial part-and-spec questions; here's who gets named" — via the DataForSEO LLM endpoints. Publish as the citation magnet; cut per-category findings into industrial outreach ammo and the DSG/MDM pitch. One study/month thereafter.
5. **Glossary drain:** 15–20 terms/month from the 110-term queue, seeded as drafts, interlinked per the glossary architecture.
6. **Tracking live (SAL-406):** stand up Brand Radar prompts and/or the DataForSEO LLM-mentions baseline for brand + money terms + coined terms. Record the baseline; report weekly deltas.

**DoD (steady state):** 2 pieces + 1 batch published/week; links being placed; tracker reporting.
**Metric:** referring domains + AI citations (the hub's own KPIs); publish count vs plan.

---

## P7 — Paid ignition (GATED: not before week 4)

**Gates, all hard:** P0 conversion wiring done (Meta `Lead` via CAPI or pixel event, Google Ads conversion on `/revenue-engine/audit-booked/`), TCPA/A2P 10DLC registered, first proof live (P5), GHL calendar + auto-text-back working (RE-203 remainder), budget signed (08).

1. Start with the built home-services "stop the leak" LP (`app/(campaign)/lp/home-services-revenue-leak/`) per the ads plan's Model A; one vertical, 1–2 angles.
2. Proposed test budget $1.5–3K/mo (GATE:HUMAN), 2-week kill/scale review against cost-per-booked-audit.
3. Dental ads only after the HIPAA route-gating (Pixel stripped from PHI-capturing LPs) is verified.

**Metric:** cost per booked audit vs the call lane's implied cost.

---

## P8 — Referrals + partnerships (from week 4)

**Objective:** a second demand source that doesn't consume call-block hours.

1. **Referral ritual:** scripted ask at day-90 settlement of every install (and at rate-letter send for warm no's). Book-jobs voice, one ask, no incentive games.
2. **White-label GEO for web/SEO agencies (sell-product wholesale):** the market channel is proven ($2–6K/mo resale bands). Agent researches 20 candidate agencies (no GEO practice, real client bases), founder pitches 3. Fulfillment = the existing cylinders under their brand.
3. **Dental density:** one study-club/supplier-rep relationship motion in the focus metros; the Beautiful Smiles result (when it exists) is the door-opener.
4. **Distributor media:** the data study pitched to DSG/MDM (P4/P6 crossover) is the industrial version of partnership — borrowed trust from the ICP's own sources.

**Metric:** partner-sourced conversations/month by day 90.

---

## P9 — Pipeline hygiene + measurement (continuous)

**Objective:** the numbers stay true and the backlog stays honest.

1. EOD agent run: ingest call-log exports, update the pipeline snapshot, close shipped Linear issues, flag stalls (nothing sits In Progress >5 days without a note).
2. Weekly funnel report: dials → connects → booked → run → letters → closes per lane; content shipped; links live; citations; probe runs. One page, Monday review input.
3. Fix-forward the instrumentation gaps as they block decisions (Meta Lead event, Google Ads conversion, GA4 account-side settings audit) — each is a small ticket, not a project.
4. Keep the interim system of record honest: the cold-call log for phone outcomes (per `08-metrics.md`), HubSpot for leads, the rate-letter/SOW ledger for pipeline value.

**Metric:** the Monday report exists, is current, and needed no manual archaeology.
