# Revenue Engine — website injection: current state, gap-audit & Next-native plan

**Status:** active execution plan (consolidated 2026-06-21). **Owner:** Artur (`GATE:HUMAN` marks approval gates).

This consolidates three things that had drifted apart: the original site-injection spec
(`docs/strategy/roofing/revenue-engine-site-injection-spec.md`, written for WordPress), the
`00-phase-plan.md` pivot blueprint, and the now-canonical operating concept
(`docs/strategy/operating-concept-bring-convert-retain.md`, dated today). It is the single
source for what's left to ship the Revenue Engine cluster — and it supersedes the spec's
WordPress execution model, its GHL embed, and its public rate card (see Resolved decisions).

> The headline: the cluster is **largely already built and live**. This is consolidate-and-finish,
> not greenfield. The remaining work is frame-alignment, the gradual injection (nav/homepage),
> the content cluster, and tracking — not building pages from zero.

---

## Resolved decisions (these override the original spec)

1. **Platform — Next.js + Sanity, not WordPress.** The spec's WP MCP / page-builder / WP-revisions execution model does not apply. The WP→Next mapping is already recorded in `00-phase-plan.md` (§"WordPress spec → Next.js mapping"): publish-as-draft → **branch + preview deploy**; WP revisions → **git revert + `lib/redirects.ts`**; manifest → PR (optionally a JSON note under `.agents/manifests/`); `GATE:HUMAN` = review before merge to `main`; `AUTO:QA` = merge after self-QA.
2. **Frame — Bring → Convert → Retain (+ Prove)** is canonical and **supersedes "engine vs. fuel"** (operating-concept doc). The spec's §1.2 ("engine vs fuel must survive every rewrite") is updated to this. The 5-step engine (CAPTURE → RESPOND → BOOK → RECOVER → PROVE) is **preserved**, nested under the pillars: Bring = CAPTURE · Convert = RESPOND + BOOK · Retain = RECOVER · Prove = PROVE. Component naming standardizes **"Sell" → "Convert."**
3. **Pricing — audit-delivered, no public dollar figures.** The spec's §1.5 FL/CA rate card and DP-2 ("publish pricing") are **overridden.** Keep the live stance: *"Published model. No games on a call"* + terms, the number comes in the audit (`RevenuePricing.tsx`). The built-but-unused `RevenueRateCard.tsx` stays dormant.
4. **Audit funnel — already built, custom, working.** It is a native React form (`RevenueLeakAuditForm.tsx`) → Turnstile → HubSpot → Resend → `/revenue-engine/audit-booked/`. The spec's `{{GHL_AUDIT_EMBED}}` (RE-203) and the pivot plan's "GHL embed blocker" are **resolved/dropped** — this un-gates everything the pivot plan said was waiting on GHL.
5. **Names kept:** package = **Revenue Engine** (working name); audit = **Revenue Leak Audit**.
6. **Claims policy kept** (spec §2.4 / §4): only Approved-Claims-Library stats, with sources; never fabricate proof — use `[PROOF-SLOT]`; no review/rating schema until real reviews exist.

Canonical sources to read first (don't duplicate them here): the operating concept; the spec's
§1 product spec; this repo's `.agents/product-marketing-context.md` (Revenue Engine section).

---

## Gap-audit — what's built vs. what's left

| Area | Status | What's left |
|---|---|---|
| **Pillar `/revenue-engine/`** | ✅ Built (all spec §6.1 sections) | Align to Bring→Convert→Retain (currently engine-vs-fuel). |
| **Verticals** | ✅ **Exceeds spec** — `home-services`, `dentists`, `medical`, `local-retail` (spec asked for 2; we have 4) | Align all four to the new frame (operating-concept: "not yet wired into the live vertical pages"). |
| **Audit form + `/audit-booked/`** | ✅ Custom, live, working | Nothing — drop the GHL embed entirely. |
| **Pricing** | ✅ Decided (audit-delivered) | Nothing — keep `RevenuePricing`; leave `RevenueRateCard` dormant. |
| **Service schema** | ✅ `serviceSchema` on all 5 RE pages | — |
| **FAQPage schema** | ❌ Pages have FAQ blocks, no FAQPage schema | Add FAQPage schema (RE-502). |
| **Frame on live pages** | ⚠️ Bring→Convert→Retain built on homepage hero + `/full-preview/`, **not** on the live pillar/verticals | Port the treatment from `/full-preview/` into the live pages (Phase B). |
| **Nav** | ⚠️ In "Who We Serve" submenu; orphan stage ended (in sitemap, indexed) | Decide: keep submenu vs. add top-level "Revenue Engine" (DP-3). |
| **Homepage callout + footer** | ❌ No `/revenue-engine` link from `app/(site)/page.tsx` | Add the Revenue Engine callout card + footer link (RE-403). |
| **Cross-links from service pages** | ❌ | Link the 2 most adjacent service pages → pillar (RE-404). |
| **Contextual CTA insertion** | ❌ | Insert audit CTAs into relevant existing posts, relevance ≥0.6, ≤10/wk (RE-401). |
| **Content cluster (8 posts)** | ❌ None (`/guides/` has no RE content) | Build the 8-post cluster (Phase D). |
| **GA4 events** | ✅ Plumbed in `lib/analytics.ts` (`generate_lead`, `audit_request`, `audit_lead_form`, `revenue_leak_audit_form`) | Confirm the conversion actually fires on `/audit-booked/` (the comment claims it; the channel-funnel-playbook flagged it as not firing — **verify**). |
| **Meta Lead event** | ❌ `track()` is gtag-only; pixel fires PageView only | Fire `fbq('track','Lead')` on submit + server CAPI, dedup on `submissionId` (RE-501). |
| **Google Ads conversion** | ❌ (per channel-funnel-playbook) | Import GA4 `generate_lead` as an Ads conversion, or fire `gtag('event','conversion')` on `/audit-booked/`. |
| **A/B test** | ❌ | First test: pillar hero leak-framing vs engine-framing (RE-503), `GATE:HUMAN`. |
| **Approved Claims Library** | ⚠️ Claims live inline in page data with sources (e.g. "47 hours" → "LeadSync, 2026") | Formalize as one doc; reconcile C-01 status with the cockpit (see Open items). |
| **Manifests / process** | ❌ No `.agents/manifests/` | Use PRs as the manifest (+ optional JSON note). |
| **Canonical product spec** | ⚠️ `.agents/product-marketing-context.md` + `01-pillar-storyboard.md` still carry the old frame | Update both to Bring→Convert→Retain; make the spec §1 the one SSOT the **site + the `/sales` cockpit** both read. |

---

## The remaining work, phased (Next-native)

Each ticket = one PR (the manifest). Gates as marked. Reuse existing components and the
`RE-002` design tokens — no new fonts/colors/button styles.

### Phase A — Reconcile the source of truth (docs only, low risk)
- **A1** Update `.agents/product-marketing-context.md` + `01-pillar-storyboard.md` to Bring→Convert→Retain (+Prove); fold the spec's §1 product spec into it as the single SSOT shared with the `/sales` cockpit. `GATE:HUMAN` (positioning).
- **A2** Formalize the **Approved Claims Library** as a doc; reconcile C-01 ("47 hours") across the website (cited "LeadSync, 2026") and the cockpit (gated `[VERIFY]`). One stance. `GATE:HUMAN`.

### Phase B — Frame alignment on the live cluster (the real content work) · `GATE:HUMAN` per page
- **B1–B5** Port the Bring→Convert→Retain treatment from `/full-preview/` + the homepage into the live pillar and the four verticals: swap engine-vs-fuel → the FlowBlock ("I run the whole flow"), the leak block, the Plan grouped under the pillars, and "Sell" → "Convert." Each page: branch → preview → review → merge. Run the humanizer + self-QA (spec §2.5) before each.

### Phase C — Finish the gradual injection (the "gradually") · staged
- **C1** Nav decision + entry (DP-3) — keep "Who We Serve" or add top-level "Revenue Engine." `GATE:HUMAN`.
- **C2** Homepage Revenue Engine callout card (existing card component only) + footer link. `GATE:HUMAN`.
- **C3** Cross-links from the 2 adjacent service pages (likely AI Search & GEO, Full Growth Ownership) → pillar, one paragraph + link, no other edits. `GATE:HUMAN`.
- **C4** Contextual CTA insertion into relevant existing posts (relevance ≥0.6, ≤1 block/post, ≤10/wk, never protected pages, never first screen). `AUTO:QA`.

### Phase D — Content cluster (8 posts) · `AUTO:QA`, 2/week
Build the 8 posts (spec §5 Phase 3) via the content engine + humanizer; each links to exactly one vertical + the pillar; primary keyword in H1+title; one contextual audit CTA; claims per the Library.

### Phase E — Tracking + schema completion · `AUTO:QA`
- **E1** Fire `fbq('track','Lead')` on audit submit + server-side CAPI (dedup on `submissionId`).
- **E2** Confirm/wire the Google Ads conversion on `/audit-booked/`.
- **E3** Add FAQPage schema to pages with FAQ blocks.
- (Distinct call-tracking-number pool is a service-delivery item, not a website task — noted, out of scope here.)

### Phase F — A/B + iterate · `GATE:HUMAN` to launch
- **F1** First A/B: pillar hero leak-framing vs engine/flow-framing, metric `audit_form_submit` rate.
- **F2** Monthly: GSC queries + Ahrefs positions for the cluster → refresh tickets (titles/meta `AUTO:QA`, content gaps human-reviewed).

---

## Gradual injection state (the §7 sequence, updated)

| Stage | State | Status |
|---|---|---|
| 1. Orphan | Cluster live + indexed, no links in | ✅ Done (in sitemap) |
| 2. Contextual links | "Who We Serve" submenu + cluster cross-links | ⚠️ Partial (submenu yes; content cluster + CTA insertions pending → Phase C/D) |
| 3. Navigation | A clear Revenue Engine entry | ⚠️ Submenu only; top-level pending DP-3 (C1) |
| 4. Homepage + footer | RE callout card + footer link | ❌ Pending (C2) |

Rollback at any stage = revert the PR; cluster pages stay live.

---

## Open items needing a human call
- **DP-3 (nav):** keep "Who We Serve" submenu as the entry, or add a top-level "Revenue Engine"?
- **C-01 reconciliation:** is "LeadSync, 2026" a source we stand behind for the "47 hours" stat (then un-gate it in the cockpit too), or do we gate it everywhere and soften the page copy?
- **Out of scope here** (separate workstreams): Catalog AI / v2-1 rehoming (pivot Phase 3); the live call-tracking-number pool (service delivery).
