# 01 — Diagnosis: where the business actually is

Everything below was verified 2026-07-20 against the repo, Linear, DataForSEO, and external research. Internal claims carry file paths; external claims carry sources (full detail in [07-research-appendix.md](07-research-appendix.md)).

## A. The headline

The company built a complete revenue machine in five weeks and has not turned it on. Every funnel, script, tool, and price is designed, signed, or one config step from live. What does not exist is motion: no logged calls, no shipped content, no placed links, no running ads, no closed Linear issues, and a production site that is six commits behind local work.

This is the core finding because it inverts the usual agency problem. There is nothing left to figure out before selling can start. The strategy's job is to allocate founder hours to selling and let agents keep the machine fed.

## B. Asset inventory vs. blockers

| Asset | State | Exact blocker | Unblock effort |
|---|---|---|---|
| Sales cockpit `/sales/playbook` (3 tracks, 39 objection cards, logger) | LIVE (localhost; prod gated) | `SALES_ENABLED`, `SALES_PASSWORD`, `SALES_SESSION_SECRET` in Vercel | minutes |
| Pre-call scanner (`scripts/precall-scan.mjs` → Sanity `precallLead`) | BUILT, never run | `DFS_LOGIN` / `DFS_PASSWORD` in `.env.local` | minutes + first seed run |
| Probe Layer 1 (deterministic score, homepage band) | LIVE in prod | — | — |
| Probe Layer 2 (AI read, gated report at `/ai-readiness/[token]/`) | BUILT, verified locally | Vercel: `ANTHROPIC_API_KEY`, `PROBE_GATE_SECRET`, Upstash pair, DataForSEO pair; remove `PROBE_AI_MOCK`; copy review (GATE:HUMAN) | hours |
| Lead delivery (LeadForm + Revenue Leak Audit form) | LIVE routes | **Silent-loss risk:** without HubSpot + Resend env vars, forms return 200 and the lead only hits a server log (`lib/lead-form/submit-audit.ts:72-80`) | minutes to set + one end-to-end test |
| Growth Call booking | LIVE | Calendar only renders with `NEXT_PUBLIC_CALENDLY_URL`; otherwise degrades to a form | minutes |
| Beautiful Smiles proposal (dental, $30K/$37.5K/$46.5K) | CALL-READY v4 | Needs the live audit run to fill every `[SLOT]` (`docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md`) | one audit + one call |
| Offer architecture + per-vertical specs | SIGNED (D1–D12 + §16; §A rows) | §B: 23 rows open — pages ship qualitative until signed per row | founder session |
| Homepage flow rework | DONE on local `main` | **6 commits unpushed** → prod behind (`git log origin/main..main`) | one push + deploy check |
| `public/llms.txt` | EXISTS locally | Unpushed (part of the "we fail our own probe" fix; homepage `<title>` length still to verify) | rides the push |
| Content calendar (24 issues, SAL-408→431) | SPECCED, week 5 of 8 by due dates | Zero articles produced; engine→Sanity bridge exists (`scripts/engine-to-sanity.mjs`), publish is manual | agent cadence + founder publish |
| Glossary queue | 110 terms queued, 0 consumed (`docs/strategy/glossary-queue.json`) | No authoring pass scheduled | agent cadence |
| Guest-post batch (6 drafts targeting the money keywords) | DRAFTED + humanized, not placed (`docs/strategy/backlinks/guest-posts/`) | Host vetting + pitching never started | agent + founder sends |
| Paid ads plan (Meta/Google per vertical) | PLANNED, $0 spending | No Meta `Lead` event, no Google Ads conversion fires, TCPA/A2P 10DLC unregistered, GHL calendar + auto-text-back open (RE-203 — a cross-doc work label from the 2026-06 handoffs and ads docs, not a Linear issue) | days, gated |
| Case studies (5 seeded in Sanity) | NONE publishable | Disclosure decisions ×5 unconfirmed, real windows missing on 4, Northern Hydraulics rename not executed (`docs/strategy/case-studies/fact-ledger.md`) | founder decisions + editing |
| GA4 measurement | SHIPPED in code | `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` not in Vercel prod → server-side failsafe is a no-op (`docs/strategy/ga4.md`) | minutes |
| AI-citation tracking (SAL-406) | NOT live | Brand Radar prompts not stood up. Note: the DataForSEO LLM-mentions endpoint answered in this session, so the "add-on off plan" blocker recorded for SAL-426 appears stale — re-verify | hours |
| SAL-432 dentists rework (Retain-first re-lead) | Marked done on branch `seo-geo-readiness-fixes` in Linear | **That branch no longer exists** (only `main` + `origin/add-sitemap-index`). Verify the work landed in `main` or recover it | one check |

## C. The selling reality

- **Linear is a planning surface, not an execution tracker.** Team SAL: 40 open issues, **zero ever completed** across the team's entire history. The only state transition ever recorded is one Todo→In Progress (SAL-432, 2026-06-27).
- **The cockpit has no evidence of use.** The call logger is localStorage-based with a manual "Export CSV" button (`components/sales/cockpit/CallLogger.tsx`); no export has ever been ingested anywhere and no metrics doc has been updated since build. The export is per-browser and manual — the cadence has to name that founder step or the data never leaves the cockpit.
- **The playbook's own targets** (`docs/strategy/sales/01-strategy-overview.md`, `08-metrics.md`): 40–100 dials per booked next-step, 3 booked audits/week, re-baseline every 2 weeks. None of it has started.
- **One active deal:** Beautiful Smiles (dental). Proposal call-ready since 2026-07-07; the audit that fills it has not been run.
- Founder hours over the last five weeks (inferred from git + docs): close to 100% build and research, ~0% outbound motion.

## D. Proof state

What a skeptical buyer can be shown today:

| Proof asset | Usable now? |
|---|---|
| Live diagnostics (probe score, pre-call scan findings, AI-answer check) | **Yes — the strongest current proof.** Observed facts about the buyer's own business; the playbook is built around them |
| Day-90 guarantee (book-jobs, verbatim-locked) | Yes, with a wording conflict to reconcile at DQ-1: the signed baseline is `Guarantee.tsx` ("doesn't **beat my monthly fee** by day 90"), while the objection library's verbatim block (`05-objection-library.md:29`) says "more money than **it costs you**" — a materially bigger promise. Confirm against the Tsx baseline before reading live |
| The six `lib/stats.ts` aggregates ($378M / 91% / 2.5x / NPS 96 / 5.2x / $575k) | Sell-product surfaces only, never book-jobs (`_claims-library.md:47`) |
| C-06 dental case-acceptance claim (45% avg / 75% top-decile, Henry Schein One 2026) | **Signed 2026-07-07 (MED-8.1) but never filed into `_claims-library.md`, which still says DO-NOT-USE** — P1 files the row before the Beautiful Smiles call, or drafting agents will strip the stat |
| Case studies | **No.** All five gated; both hydraulics studies hard-blocked on the Northern Hydraulics naming hazard |
| Liori Diamonds (consumer proof) | Named line only, no outcome claims (consent recorded, `04-signoff-sheet.md` D-C4) |
| Fabricated-proof strays ("42 sprints", "42 e-commerce brands", "60% of builds…") | **Removed per ARCH-3 default** — verify none regressed to a live page |

Consequence: selling can start now on diagnostics + guarantee + signed claims. Case studies are the scale unlock, not the start gate.

## E. Demand map (what the data says about where buyers are)

**Search demand (DataForSEO, US, monthly):**

| Cluster | Volume | Trend | Read |
|---|---|---|---|
| "ai seo" | 8,100 | cooling from 12,100 peak | Category head; informational |
| "ai receptionist" | 5,400 | **rising** (3,600 → 5,400) | The one commercial term still climbing — Revenue Engine tailwind |
| "generative engine optimization" | 4,400 | cooling | Category head |
| "answer engine optimization" | 2,400 | flat | Category head |
| "ai seo agency" / "ai seo services" | 1,000 each | rising | Buyer intent, $79–82 CPC, KD 8 |
| "geo agency" | 590→880 | rising | Buyer intent, KD 15 — SAL-411's target |
| "aeo agency" | 480→590 | rising | Buyer intent, KD 3–9 |
| Industrial vocabulary ("distributor seo" 10, "catalog seo" 10, "ai readiness audit" 0) | ~zero | — | **No search path to the industrial buyer. Outbound only.** |
| "dental answering service" | 170 at **$195 CPC** | — | Tiny volume, real money — local capture matters later, not first |

**Who owns the money SERPs:** an AI Overview citing a fixed agency set, then agency service pages and agency-written listicles. No tools rank. salesolution.net's backlink rank (199) is the lowest of every measured competitor (Percepture 254 → Thrive 483). **Outranking is a multi-quarter climb; being cited/listed is the nearer door** — LLM answers in this category cite Reddit, media, and reference sites, not agency pages.

**Buyer behavior (sourced in 07):** 51% of B2B software buyers now start research in an AI chatbot (G2, Mar 2026, n=1,076); 94% of digital leaders plan to increase AEO/GEO spend in 2026 (Conductor); AI referrals convert 2–23× better than organic in multiple datasets (Ahrefs: 0.5% of visits → 12.1% of signups). The pitch "buyers ask AI now" is well-armed.

**Industrial ICP readiness (DSG 2025):** ~70% of distributors touch genAI tools, 63% stuck in exploration/pilot, 25% doing nothing (down from 47%). Aware enough to buy, immature enough to need an operator. DSG/MDM are the buyer's own trusted sources — citable cold.

## F. Competitive reality

**Book-jobs (Revenue Engine):** the AI-receptionist tech layer is commoditizing. Avoca raised $125M at a $1B valuation selling nearly this exact promise to home services; Jobber, Podium, Weave, ServiceTitan, Housecall Pro all ship native AI answering. SaaS pricing sits at $99–$399/mo; DFY GHL agencies charge $297–$2,500/mo + $497–$3,000 setup. **The $30K install cannot be sold as an AI receptionist install.** It survives only as what it already is on paper: a six-foundation business-system install priced against a $55K–$120K vendor-assembled alternative and a modeled ≥$250–300K recovery. The durable wedges are exactly the offer's existing design: done-for-you accountability, month-to-month honesty (Podium's BBB "D-" and lock-in complaints are the wedge), a monthly report that proves revenue, and diagnosis-first selling. Timing: mid-curve — ~40% of contractors use some AI, 39% "don't understand what AI could do" — and the window narrows as native features spread.

**Sell-product (GEO/industrial):** "we do GEO" is now undifferentiated — every SEO agency bolted it on, $200M+ of VC funds the tool layer. The market's standard land motion is a prompts-based visibility audit at $500–$5K; retainers cluster $2–10K/mo mid-market, $8–25K premium. Sale Solution's edge is not the category label; it is (1) the niche — industrial distribution, where generalists lack credibility and the technical-catalog problem is real, (2) the diagnostic-led motion it already built (probe + AI-answer check = the standard land motion, productized better), and (3) selling outcomes into a buyer whose vocabulary has zero search volume — meaning competitors aren't in that channel either. Nobody else is cold-calling $5–75M distributors about the AI answer. That channel is empty and the scripts for it are written.

**Outbound benchmarks (2026):** cold-email reply average ~3.4%; batches under 50 recipients average 5.8%; meetings 0.5–2.5%; Google/Yahoo sender rules enforced (SPF/DKIM/DMARC, one-click unsubscribe, <0.3% complaints). Email+LinkedIn two-channel lifts replies 23–31%. For a solo founder selling high-trust services, small personalized batches + founder-brand LinkedIn beat volume.

## G. Authority + site reality

- Backlink profile: 142–252 referring domains depending on index, backlink rank 199, spam score 26, with 75 blogspot links — **part of the profile is junk, and no doc anywhere addresses cleanup/disavow.** New decision required (see 08).
- GSC baseline (2026-06-15): ~520 impressions/mo, ~5 clicks/mo, AI/GEO theme ≈5% of impressions. The hub (glossary: 20 seeded at launch + 30 more per `docs/strategy/glossary/glossary.md` batch-2 — two older docs still say 20, so **verify the live count in Studio at P0**; 7 career paths; roadmap milestones M0–M6 shipped) is early but pre-positioned: `/career-paths/` pulled impressions at position ~5 with zero content.
- The authority machine's payoff KPI (AI citations / referring domains) has **no live tracker** (SAL-406 open).
- Own probe score: 69 ("Gaps") — llms.txt fix exists locally, unpushed. An AI-search firm failing its own probe is a credibility landmine in any outbound that links the probe.

## H. Constraint ranking (what actually limits revenue, in order)

1. **Founder-hour allocation.** ~0% of hours on selling motion. No strategy fixes anything until this flips.
2. **The last mile.** Keys, pushes, merges, one audit, a handful of sign-offs. Days of work gating everything built.
3. **Proof depth.** Enough to start (diagnostics + guarantee + C-06). Not enough to scale cold trust; case studies + a citation track record unblock that.
4. **Measurement.** GA4 prod vars, conversion events, citation tracking. Fixable in parallel; the cold-call log is the interim system of record (per `08-metrics.md`).
5. **Authority.** Real, compounding, slow. Fixed cadence — never allowed to eat selling hours.

One structural risk rides on top: **capacity**. Closing installs creates 60-day delivery obligations on the same founder. The unset capacity number N (HS-1/CAP — "installs per quarter") is not cosmetic; it is the throttle on every target in 02. Proposed default: N=3/quarter (GATE:HUMAN, see 08).
