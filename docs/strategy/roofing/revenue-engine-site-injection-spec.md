# EPIC: RE-INJECT — Revenue Engine Package, Phased Website Injection

**Epic ID:** SS-RE-2026-06
**Target site:** Salesolution website (WordPress). *Assumption — if the target is a different property, only Phase 0 outputs change; the ticket structure is portable.*
**Executor:** Website maintenance agents (Agent Control Plane), via WordPress MCP server on the target box.
**Human owner:** Artur (approval gates marked `GATE:HUMAN`).
**Priority:** High. **Mode:** Gradual injection — no big-bang redesign, no disruption to existing pages or rankings.

---

## 0. OBJECTIVE

Introduce a new productized service — the **Revenue Engine** (working name, see Decision Point DP-1) — onto the website as a self-contained offer cluster: one pillar page, two vertical pages (home services contractors, dental practices), a supporting content cluster, and progressive site-wide integration (internal links → nav → homepage). Roll out in phases so that each increment is independently publishable, measurable, and reversible.

Success = the cluster is live, indexed, internally linked, converting visitors into "Revenue Leak Audit" bookings, with zero regression on existing pages.

---

## 1. WHAT WE ARE INJECTING (PRODUCT SPEC — source of truth for all copy)

### 1.1 The offer in one paragraph
A done-for-you, AI-powered revenue system for local service businesses (home services contractors; dental practices). The client buys ads separately, in their own ad account, at cost — or runs no ads at all. We install and operate the **engine** that converts demand into booked revenue: it answers every call 24/7, responds to every lead in under 60 seconds, books appointments directly to calendar, recovers revenue from unclosed estimates / unaccepted treatment plans / dormant customers, and proves its output in a dashboard that separates **system-driven revenue** from **media-driven revenue**.

### 1.2 Positioning (must survive every rewrite)
- **Engine vs. fuel.** Ads are fuel. The client owns the fuel. We build and run the engine. The engine produces revenue even with the fuel turned off.
- **The leak, not the faucet.** Local businesses lose more revenue to missed calls, slow follow-up, and abandoned estimates/treatment plans than they gain from incremental ad spend. We monetize what they already paid for.
- **Two revenue lines.** Every report splits revenue into media-driven (their fuel × our engine) and system-driven (recovered calls, estimate/treatment follow-up, reactivation, review-driven organic). The retention argument: line two alone exceeds the invoice.
- **No ad markup, no media dependency.** Compatible with an incumbent ads vendor ("keep your ads guy — our system makes his leads convert better").

### 1.3 The 5-step system (canonical names and order — do not rename, reorder, or merge)
1. **CAPTURE** — Conversion assets the client owns: dedicated landing pages, instant quote widget (home services) / financing-framed service pages with online booking (dental), Google Business Profile overhaul. Metric: conversion rate.
2. **RESPOND** — AI receptionist answering 100% of calls 24/7, missed-call text-back, sub-60-second AI SMS reply to every form fill. Metric: answer rate; after-hours bookings recovered.
3. **BOOK** — AI qualification scripts, direct calendar booking, reminder sequences. Every call recorded, transcribed, auto-classified. Metric: lead-to-appointment rate; show rate.
4. **RECOVER** — AI follow-up on unclosed estimates (contractors) / unaccepted treatment plans and overdue recall (dental); dormant database reactivation; automated review engine (reviews → map pack → organic calls). Metric: recovered revenue from leads already paid for.
5. **PROVE** — Attribution dashboard with the two revenue lines (1.2). Monthly report. For dental: front-desk conversion scoring. Metric: system-attributed revenue vs. fee.

### 1.4 Vertical skins
- **Home services** (roofing-forward; also HVAC, plumbing, electrical): instant quote widget, estimate-recovery sequence, storm/seasonal campaign templates, dispute-proof lead log (every lead recorded and classified).
- **Dental**: HIPAA-compliant stack (BAAs on all tooling), patient financing framing (monthly payment vs. sticker price), treatment-plan and recall follow-up, monthly front-desk scoring report.

### 1.5 Pricing (rate card — copy must match exactly; display rules in DP-2)
| System only (no media) | Florida | California |
|---|---|---|
| Home services | $2,997/mo + $2,500 setup | $3,997/mo + $3,000 setup |
| Dental | $3,997/mo + $3,000 setup | $4,997/mo + $3,500 setup |
| Media management add-on | +$997/mo | +$1,497/mo |
Terms: 90-day system install, 3-month minimum, month-to-month after. Media (if added): client-funded ad accounts, zero markup.

### 1.6 Guarantee (exact language, verbatim on pages)
> "If the revenue the system brings back doesn't beat my fee by day 90, I work free until it does." (Live wording, de-jargoned from the original "system-attributed revenue.")

### 1.7 Primary conversion action
Book a **"Revenue Leak Audit"** (free; we analyze missed calls, response time, GBP performance, and the estimate/treatment follow-up gap). One audit name across both verticals. Form/calendar embed provided via GHL (asset IDs supplied at Phase 2 — placeholder token `{{GHL_AUDIT_EMBED}}`).

### 1.8 Anti-personas (agents must not write copy courting these)
Businesses wanting cheap shared leads; franchises with locked corporate marketing stacks; anyone seeking guaranteed lead counts with no system access; practices unwilling to sign BAAs.

---

## 2. OPERATING RULES & GUARDRAILS (apply to every ticket)

### 2.1 Do-not-touch list (hard)
- The existing six service pages (AI Search & GEO, Catalog AI, Editorial Authority, Website Development, Outbound Email, Full Growth Ownership) — no edits except where a ticket explicitly adds one internal link block.
- Homepage hero, primary navigation, footer — frozen until their dedicated Phase 4 tickets, each `GATE:HUMAN`.
- Any URL in the Protected Pages List (produced in RE-001). No content, slug, title, or meta changes on protected pages other than explicitly ticketed link insertions.
- No slug changes or deletions of any existing published content. No redirects without a `GATE:HUMAN` ticket.

### 2.2 Approval gates and autonomy levels
- `GATE:HUMAN` — agent prepares the change as an unpublished draft + change manifest; human approves before publish. Applies to: all new top-level pages (Phases 1–2), nav/homepage/footer changes, anything touching protected pages beyond link insertion, pricing display.
- `AUTO:QA` — agent may publish after passing the self-QA checklist (2.5) and logging a manifest. Applies to: Phase 3 blog posts, internal link insertions per the linking map, schema additions on cluster pages, tracking tags on cluster pages.
- When uncertain which gate applies: default to `GATE:HUMAN`.

### 2.3 Change manifests and rollback
Every ticket produces a manifest: `/.agents/manifests/SS-RE-<ticket>.json` → `{ticket, timestamp, pages_touched[], diff_summary, revision_ids[], rollback: how_to_revert}`. Use WordPress revisions; never hard-delete. A phase is not Done until every manifest in it exists and rollback has been verified on one sample change.

### 2.4 Claims policy (hard)
- Only statistics from the Approved Claims Library (§4) may appear on any page, with the listed phrasing constraint and source.
- New stat → agent files it as a library addition (source URL, date, exact figure) in the manifest; usable only after `GATE:HUMAN` approval.
- **Never fabricate testimonials, client names, case studies, results, or review counts.** Where proof is structurally needed, insert the placeholder block `[PROOF-SLOT: awaiting first cohort data]` — these render as hidden in drafts and are listed in the manifest.
- No `AggregateRating`/review schema anywhere until real third-party reviews exist (DP-5).

### 2.5 Self-QA checklist (required before any publish, both gates)
1. Copy passes the Copy Standards (§3) — run the humanizer pass (`/mnt/skills/user/humanizer`) and log "remaining tells: none."
2. All claims traced to §4; all pricing matches §1.5 verbatim; guarantee verbatim §1.6.
3. Mobile render check; LCP < 2.5s on the page template; no layout shift from embeds.
4. All internal links resolve (no 404/redirect chains); canonical self-referencing; meta title ≤ 60 chars, description ≤ 155.
5. Schema (where ticketed) validates against schema.org; no review markup.
6. Tracking events fire in debug mode (Phase 5 pages).
7. Design tokens match the audit's Design System Extract (RE-002) — no new fonts, colors, or button styles.

---

## 3. COPY STANDARDS (voice + banned patterns)

### 3.1 Voice
Operator-to-operator. Numbers before adjectives. Short sentences mixed with longer ones. First person singular is allowed ("I install...") — Salesolution speaks as a builder, not a brochure. It is acceptable to name what we don't do (no ad markup, no lead reselling, no 12-month lock-in) — specificity about limits builds trust. Write like a person who runs the system, not one selling it.

### 3.2 Banned patterns (distilled from the humanizer skill — reject copy containing these)
- Significance inflation: "pivotal," "testament," "evolving landscape," "marks a shift," "underscores."
- Promotional stack-words: "seamless," "cutting-edge," "robust," "leverage," "unlock," "elevate," "supercharge," "game-changing."
- Negative parallelism: "It's not just X, it's Y."
- Superficial "-ing" trailers: "...ensuring growth," "...highlighting our commitment."
- Rule-of-three adjective chains; synonym cycling; em-dash overuse (max one per paragraph).
- Vague attribution: "industry observers," "studies show" without a §4 citation.
- Signposting: "Let's dive in," "Here's the thing."
- Fragmented headers (heading + one-line restatement).
- Emoji in body copy. Exclamation marks: max one per page, prefer zero.

### 3.3 Words/framings to use
"engine," "fuel," "leak," "recovered revenue," "booked," "answered," "system-driven vs media-driven," "your ad account, your data," "month-to-month after 90 days." Customer-language seeds: "we miss calls when we're on roofs"; "my front desk quotes prices instead of booking"; "I'm paying for leads nobody calls back."

---

## 4. APPROVED CLAIMS LIBRARY (v1)

| ID | Claim (max strength permitted) | Source | Status |
|---|---|---|---|
| C-01 | "The industry-average lead response time is 47 hours." | LeadSync 2026, via cosmeticsgrowth.com/cosmetic-dental-marketing-cost | VERIFIED — cite as "LeadSync, 2026" |
| C-02 | "Average non-branded Google Ads cost per lead for roofing: $124 (Q1 2026); 75th percentile $256." | searchlightdigital.io/roofing-google-ads-cost-per-lead | VERIFIED — use only on contractors page / blog |
| C-03 | "Qualified roofing leads typically cost $80–$220; competitive metros push above $300." | getbiddable.com/blog/average-cost-per-lead-for-roofing-contractors | VERIFIED |
| C-04 | "Practices are commonly advised to invest 5–8% of gross revenue in marketing." | optimizedgrowth.com/dental-marketing/vs/ | VERIFIED — phrase as guidance, not promise |
| C-05 | "Businesses miss as many as one in three inbound calls." | — | SOFTEN-OR-SOURCE: keep hedged ("as many as") until agent files a primary source for approval |
| C-06 | Any treatment-plan acceptance % or estimate close-rate % | — | DO NOT USE until sourced and approved; until then use qualitative phrasing ("a large share of estimates are never followed up") |

---

## 5. PHASE PLAN & TICKETS

Execute in order. A ticket is blocked until its dependencies are Done. One ticket = one manifest.

### PHASE 0 — Audit & Foundation (Week 1) — all `AUTO:QA` except RE-004

**RE-001 · Site inventory & Protected Pages List**
Pull full sitemap + post/page list via MCP. Pull top organic pages (GSC API if connected; else Ahrefs MCP `site-explorer-top-pages` for the domain). Output: `/.agents/audit/site-inventory.json` and `protected-pages.json` (top 20 pages by organic traffic + the six service pages + homepage). Acceptance: both files exist; protected list reviewed in next human session.

**RE-002 · Design System Extract**
From 3 representative existing pages, extract: page template/builder used, heading scale, body font, brand colors (hex), button component markup, section spacing, form styles. Output: `/.agents/audit/design-system.md`. All cluster pages must build from these tokens. Acceptance: a test section rendered with extracted tokens is visually indistinguishable from existing brand.

**RE-003 · Marketing context sync**
Create or update `.agents/product-marketing-context.md` (per the product-marketing-context skill structure) using §1 of this spec as source: overview, ICP (two verticals), pains, differentiation (engine vs. fuel), objections, voice, proof points (§4 only), goal (audit bookings). All downstream content tickets read this file first. Acceptance: file exists; no claims outside §4.

**RE-004 · Keyword validation** `GATE:HUMAN` (review only, cheap)
Via Ahrefs MCP (`keywords-explorer-*`), validate and rank target terms: contractors page — "roofing marketing system," "AI receptionist for contractors," "missed call text back service," "roofing lead follow up"; dental — "dental marketing without ads," "AI receptionist for dental office," "dental treatment plan follow up," "patient reactivation campaign"; pillar — "AI revenue system local business," "speed to lead service." Output: `/.agents/audit/keyword-map.json` with volume/KD and final H1/title assignments. Acceptance: every cluster page has one primary + 2–3 secondary terms assigned.

### PHASE 1 — Pillar Page (Week 1–2)

**RE-101 · Build pillar page** `GATE:HUMAN`
URL: `/revenue-engine/` (pending DP-1 name). Build per Page Spec §6.1, design tokens from RE-002, copy per §3, claims per §4. Publish state: **draft**. Acceptance: self-QA passes; manifest filed; draft link surfaced for approval.

**RE-102 · 5-step diagram**
Produce an inline SVG diagram of CAPTURE→RESPOND→BOOK→RECOVER→PROVE using brand colors from RE-002 (no stock imagery, no raster screenshots). Embed in pillar draft. Acceptance: renders crisp at 360px and 1200px widths; <40KB.

**RE-103 · Publish pillar — ORPHAN STAGE** (after human approval of RE-101)
Publish live, indexed, **not** in any nav/menu, no homepage links — discoverable by direct URL and sitemap only. This is injection stage 1 (see §7). Acceptance: live, indexed (`noindex` absent), zero nav references.

### PHASE 2 — Vertical Pages + Conversion Asset (Week 2–3)

**RE-201 · Contractors page** `GATE:HUMAN` — `/revenue-engine/contractors/`, per §6.2.
**RE-202 · Dentists page** `GATE:HUMAN` — `/revenue-engine/dentists/`, per §6.3.
**RE-203 · Audit booking embed** — integrate `{{GHL_AUDIT_EMBED}}` (form + calendar) on all three cluster pages; thank-you page `/revenue-engine/audit-booked/` (noindex). Acceptance: test submission flows to GHL pipeline; event fires (RE-501 dependency noted).
**RE-204 · Publish verticals — ORPHAN STAGE**, linked only from the pillar page and to it (cluster is internally complete but externally orphaned).

### PHASE 3 — Supporting Content Cluster (Weeks 3–6) — `AUTO:QA`, cadence 2 posts/week

**RE-301..308 · Eight posts**, each 1,200–1,800 words, each linking to exactly one vertical page + the pillar:
1. "What a missed call actually costs a roofing company" (C-05 hedged)
2. "Speed-to-lead: why 47 hours is the number killing your ad spend" (C-01)
3. "Roofing CPL in 2026: the math before you buy leads" (C-02, C-03)
4. "The estimate follow-up gap: revenue sitting in your CRM"
5. "Why your dental front desk is your real marketing budget"
6. "Treatment-plan follow-up: the highest-ROI campaign a practice can run" (C-06 rules apply)
7. "Patient reactivation: marketing to people who already chose you"
8. "Engine vs. fuel: a sane way to think about ads"
Acceptance per post: self-QA incl. humanizer pass; primary keyword from RE-004 in H1 + title; one contextual CTA block to the audit; manifest filed.

### PHASE 4 — Site-wide Gradual Injection (Week 4+)

**RE-401 · Contextual CTA insertion into existing posts** `AUTO:QA`
From site inventory, select existing posts with topical relevance ≥ threshold (agent scores 0–1 on overlap with cluster topics; insert only ≥0.6). Rules: max 1 CTA block per post, placed after the section of highest relevance, never inside the first screen, never on protected pages without the link-only exception, max 10 posts/week. Manifest lists every insertion with revision ID.
**RE-402 · Navigation entry** `GATE:HUMAN` — add "Revenue Engine" (or DP-1 name) to Services menu. Stage 3 of §7.
**RE-403 · Homepage services grid + footer link** `GATE:HUMAN` — add the package card to the homepage services section using the existing card component only. Stage 4 of §7.
**RE-404 · Cross-links from the six service pages** `GATE:HUMAN` — one short paragraph + link on the 2 most adjacent service pages only (likely AI Search & GEO, Full Growth Ownership). No other edits to those pages.

### PHASE 5 — Tracking & Optimization (Week 4+, parallel where unblocked)

**RE-501 · Events** `AUTO:QA` — GA4/GTM events on cluster pages: `audit_form_submit`, `audit_call_click`, `audit_calendar_booked`, `pricing_view`, `cta_click{source_page}`. Tracking phone number pool distinct from client campaigns.
**RE-502 · Schema** `AUTO:QA` — `Service` schema on pillar + verticals; `FAQPage` on pages with FAQ blocks; `Organization` sitewide if absent. No review/rating markup (§2.4).
**RE-503 · A/B test plan** `GATE:HUMAN` — using the ab-test-setup skill (`/mnt/skills/user/ab-test-setup`), propose first test: pillar hero headline A/B (leak-framing vs engine-framing), success metric `audit_form_submit` rate, with required sample size and runtime; do not launch without approval.

### PHASE 6 — Iterate (ongoing, monthly tickets)
**RE-601** Monthly: pull GSC queries + Ahrefs positions for cluster; file refresh tickets for pages with impressions-but-low-CTR (title/meta rewrites, `AUTO:QA`) and content gaps (new post proposals, human-reviewed list).

---

## 6. PAGE SPECS

### 6.1 Pillar — `/revenue-engine/`
Primary keyword: from RE-004. Sections, in order:
1. **Hero.** Headline direction: the leak, not the ads. Candidate A: "Your ads aren't the problem. What happens after the phone rings is." Candidate B: "Stop buying more leads. Start keeping the ones you pay for." Sub: one sentence of §1.1. CTA: "Book a free Revenue Leak Audit." No carousel, no video placeholder.
2. **The leak.** Three short blocks: missed calls (C-05 hedged), response time (C-01), abandoned estimates/treatment plans (qualitative per C-06). Each ends with the cost framing: "revenue you already paid to generate."
3. **Engine vs. fuel.** §1.2 verbatim logic, ≤120 words, plus one line: "Your ad account. Your data. Zero markup. Keep your ads vendor if you have one."
4. **The 5 steps.** RE-102 diagram + one block per step: what it is (2 sentences), the metric it moves (1 line). Canonical names from §1.3.
5. **Two revenue lines.** Explain the PROVE report split; describe the dashboard in words (no fake screenshot; `[PROOF-SLOT]` for a real one later).
6. **Vertical fork.** Two cards → contractors / dentists pages. One sentence each naming the skin features (§1.4).
7. **Pricing.** Per DP-2 (default: "Starting at $2,997/mo + setup. 90-day install, month-to-month after." + link to vertical pages for the full card).
8. **Guarantee.** §1.6, de-jargoned ("the revenue the system brings back ... beats my fee by day 90"), with one plain sentence on how that line is counted.
9. **FAQ** (FAQPage schema): "I already have an ads agency" / "Will the AI sound robotic?" (answer: caller can always reach a human; we A/B the scripts) / "What happens if I cancel?" (honest: the system is licensed during the engagement) / "Is this HIPAA-compliant?" (dental: yes — BAAs on every tool, details on the dental page) / "Do you guarantee lead volume?" (no — we guarantee the revenue the system can prove against the fee; volume promises are how lead vendors lie).
10. **Final CTA.** Audit embed (RE-203).

### 6.2 Contractors — `/revenue-engine/contractors/`
Roofing-forward, HVAC/plumbing/electrical named once. Sections: Hero ("Built for businesses that miss calls because they're on a roof"); The contractor's leak (after-hours calls in storm season, estimates never chased — C-02/C-03 allowed here for the "fuel is expensive, stop wasting it" angle); The 5 steps applied (quote widget under CAPTURE, estimate-recovery under RECOVER, dispute-proof lead log under PROVE); Seasonality block (hurricane-season demand spike — FL-aware, no fear-mongering); Pricing rows for home services (§1.5) + guarantee; FAQ (lead exclusivity, "do I need a new website?" — no, pages run alongside, "what about my Google rep who calls weekly"); Audit CTA.

### 6.3 Dentists — `/revenue-engine/dentists/`
Sections: Hero ("Your front desk is the most expensive marketing channel you're not measuring"); The practice's leak (unanswered calls during chair time, 47-hour response C-01, unaccepted treatment plans + overdue recall — C-06 rules); The 5 steps applied (financing framing under CAPTURE — monthly-payment presentation, treatment-plan & recall follow-up under RECOVER, front-desk scoring under PROVE); **Compliance block** (HIPAA: BAAs on call tracking, SMS, CRM; recording disclosures; plain language, no legal-advice phrasing); Pricing rows for dental + guarantee; FAQ ("Will this replace my front desk?" — no, it answers what they physically can't, "PMS integration?" — calendar-level first, deeper integrations scoped in install); Audit CTA.

---

## 7. GRADUAL INJECTION SEQUENCE (the "gradually" in this epic)

| Stage | State | Trigger to advance |
|---|---|---|
| 1. Orphan | Cluster live + indexed, zero links from existing site | All three pages approved & stable 7 days, no QA regressions |
| 2. Contextual links | RE-401 insertions + Phase 3 posts linking in | ≥10 referring internal pages AND first audit booking OR 14 days |
| 3. Navigation | Services menu entry (RE-402) | Human approval after reviewing stage-2 engagement |
| 4. Homepage + footer | RE-403, RE-404 | Human approval; ideally after first `[PROOF-SLOT]` is fillable |

Rollback at any stage = remove links/nav (manifests make this one operation); cluster pages themselves stay live.

---

## 8. INTERNAL LINKING MAP
- Every Phase 3 post → its vertical page (exact-match-adjacent anchor, varied) + pillar (brand/offer anchor).
- Pillar ↔ both verticals (bidirectional).
- Verticals → pillar pricing section.
- RE-401 insertions → audit CTA (pillar anchor), never deep-link pricing from old posts.
- The two adjacent service pages (RE-404) → pillar only.

## 9. TRACKING SPEC (summary)
Events per RE-501; conversion = `audit_calendar_booked` primary, `audit_form_submit` secondary. UTM convention for any future promotion: `utm_campaign=revenue-engine`, `utm_content=<page>-<section>`. Weekly agent report appended to `/.agents/reports/re-weekly.md`: sessions, CTA CTR, audits booked, per-page.

## 10. HUMAN DECISION POINTS (resolve before the gated ticket that needs them)
- **DP-1 · Package name.** "Revenue Engine" is the working name. Needed before RE-103. (Note: distinct positioning from Shepel Group's "Flywheel OS" — keep brands separate.)
- **DP-2 · Public pricing display.** Recommendation: publish "starting at" anchors + full rate card on vertical pages (transparency is a differentiator against discovery-call agencies). Needed before RE-101 approval.
- **DP-3 · Nav label + placement.** Needed at RE-402.
- **DP-4 · Audit offer name.** Default "Revenue Leak Audit." Needed before RE-101.
- **DP-5 · Proof slots.** When first cohort data/testimonials exist, file tickets to replace `[PROOF-SLOT]` blocks; only then consider review schema.

## 11. DEFINITION OF DONE (epic)
All Phase 0–5 tickets Done with manifests; cluster indexed; injection at Stage 3+; events verified with ≥1 real audit booking tracked end-to-end; zero ranking/traffic regression on Protected Pages (compare GSC clicks, 28-day pre/post, tolerance −5%); rollback tested once; §4 library contains no UNSOURCED claims on live pages.
