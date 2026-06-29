# Phase-1 final items — /revenue-engine/ product page + nav rework (PLAN)

> Status: PLAN (set 2026-06-28), decision-ready. Output of the plan-revenue-engine-product-page-and-nav workflow (understand → design → red-team → synthesize). Build in batches; Batch 2 is gated by founder decision #1. Companion to 05-rebrand-build-plan.md.

# Phase-1 Final Plan: The `/revenue-engine/` Product Page + Nav Rework

This consolidates the two designs and applies every red-team must-fix. It is decision-ready. Build only after the founder resolves the gating decisions in §3 (chiefly the audit-form destination).

---

## 1. The `/revenue-engine/` product page

### 1.1 The content-migration decision (what happens to the current local-service funnel)

`/revenue-engine/` today is the **single-motion (book-jobs) local-service funnel**: dark `RevenueHero` with the `#audit` CTA + founder spec-card ("I run every account myself", 90-day setup) + Phase-5 `selfQualifiers`, then `TheLeak` → `FlowBlock` → `PlanByPillar` → `TwoRevenueLines` → `Guarantee` → `RevenuePricing` → `FAQ`. **The form is a native React form on niche pages via `AuditCTA`; the parent page's hero CTA is an in-page `#audit` anchor.** There is no GHL embed and no `AuditCTA` on the parent today (verified) — but the parent hero, footer, and three homepage routers all *point at* an `#audit` that the funnel expects to exist somewhere on this URL.

Decision: **repurpose in place** (slug unchanged, no 301, no equity loss). Strip every motion-specific element; keep the motion-neutral mechanism components after a copy scrub. Nothing is lost — the guarantee, price, "I"-voice, and calculator all survive on the niche pages.

| Element (current location) | Decision | Survives where |
|---|---|---|
| `RevenueHero` local eyebrow + founder spec-card + `selfQualifiers` (Phase-5 paths) + `#audit` CTA | **Reframe** to the product (see §1.2); drop the spec-card here; repoint or drop self-qualifiers to live canonicals; change CTA (see §1.4) | niche taxonomy on `/industries/` + niche pages |
| `TheLeak` (book-jobs bleed) | **Light generalize** to a cross-vertical "where revenue leaks across the whole flow" beat, or fold into the mechanism | — |
| `FlowBlock` (Bring→Convert→Retain track + loop, "I run the whole flow") | **Collapse to a 2–3 sentence wedge banner**, neutralize "I"→"we" (red-team M3 — see §1.2) | niche pages keep the full visual + "I" |
| `PlanByPillar` (5-step spine) | **Keep — the sole owner of the stroke→step frame on this page**; vertical-agnostic prose | niche pages keep trade-specific prose (divergent strings, §1.3) |
| `TwoRevenueLines` (Prove) | **Keep**, copy-scrub off fee/"I" phrasing | niche pages |
| `Guarantee` | **Remove** (book-jobs only) — verified it survives on **dentists** (line 326) AND **home-services** (line 173) | dentists, home-services |
| `RevenuePricing` | **Remove** (price is set by motion) — survives on dentists (329) + home-services (176) | dentists, home-services |
| `FAQ` (lead-volume/shared-leads/patient-privacy) | **Replace** with product/methodology FAQs | niche pages |
| `WholeFlowLeak` calculator | **Not on this URL today — do not add.** Inherently single-motion; carries the existing GATE:HUMAN math sign-off | dentists, spine/full-preview (both `noindex`) |
| "I"-voice everywhere | **Neutralize to firm "we"** on reused components | niche pages keep founder voice |

**Preview routes are safe:** `spine-preview` and `full-preview` are both `robots: index:false` (verified). The "I"→"we" neutralization on shared `FlowBlock`/`TwoRevenueLines` will bleed into them cosmetically, but they don't compete in search and are explicitly disposable ("Delete once a direction is locked"). Accept the bleed; do not fork the components.

### 1.2 Section-by-section plan (components named, red-team M3 applied)

Build every section on `SectionRail` (preserves the sticky-header `[data-section-tone]` light/dark inversion). Run the **humanizer** skill on hero + FAQ + wedge copy before finalizing.

1. **Hero — `RevenueHero`, reframed, tone light/paper.** The one place the concept leads (§1.5). Eyebrow `The Revenue Engine`; H1 = product name + its plain-stakes job in one breath (no industry modifier); sub-line states the wedge as fact (one system that runs the whole sale, not six disconnected tools). Remove the local eyebrow and the founder spec-card. Repoint or drop `selfQualifiers` to **live canonicals only** (`/revenue-engine/dentists/`, `/industries/`) — the current three point at Phase-5 paths. New CTA per §1.4. Anchors: `#what #how #cylinders #prove #pick`.

2. **The wedge — collapsed `FlowBlock` (banner form), tone dark.** Red-team M3: do **not** render the full connected-track visual here. 2–3 sentences: "You've been sold pieces. We run the whole flow," + the trust line (no markup / no resold leads / no lock-in). `PlanByPillar` is the only place the Bring→Convert→Retain frame appears in full on this page, so the page never triple-states the triptych.

3. **How it works (deep mechanism) — `PlanByPillar`, fed a shared `lib` const.** The five-step **CAPTURE → RESPOND → BOOK → RECOVER → PROVE** spine, grouped Bring/Convert/Retain, flat 1–5 numbering, each step = what it does + the metric it moves. **This is the depth the homepage triptych deliberately omits** (homepage shows 3 strokes; this shows 5 steps). Lift the page's inline `PILLAR_GROUPS`/`PILLAR_PROVE` into a shared const — **share the data shape, not the prose** (§1.3).

4. **Six cylinders, one engine — NEW section, `SectionRail`.** FrameworkTimeline never lists the six cylinders, so the product page owns this cleanly with zero homepage overlap. The six services grouped Bring/Convert/Retain, each a one-line "what it fires" + a **deep-link to its `/services/{slug}/` page**. Name and describe them; do **not** target their head keywords.

5. **The iteration loop — short beat.** "We don't set it and leave. Every cycle we read the two revenue lines and re-aim the weakest cylinder." Methodology depth the homepage lacks.

6. **Prove — `TwoRevenueLines`, tone dark, copy-scrubbed.** The two-revenue-lines mechanic (new revenue won / revenue recovered), motion-neutral (strip fee/"I").

7. **Operator credibility — `FounderNote` (recommended).** "You work with the operator, not a rotating team." No guarantee, no price. Replaces the removed spec-card.

8. **Convert CTA — `FinalCTARail` + a niche router (§1.4).**

9. **FAQ — `FAQ`, product/methodology questions.** What is a Revenue Engine; how is this different from buying point tools; do I have to take all six cylinders; how do you prove revenue. Emit FAQ schema.

**JSON-LD:** keep `serviceSchema` (rewrite name/description off "roofers and dental practices" to the cross-vertical product); add `BreadcrumbList` and a `CollectionPage`/`itemListSchema` expressing product→niche children. **ItemList must list live canonicals only** (Dentists, `/industries/` once live) — never Phase-5 paths, or you emit structured data pointing at 404s.

**Metadata:** rewrite title from "Revenue Engine · Convert demand into booked revenue" to "how the revenue engine works" intent; keep it distinct from the homepage brand title (homepage = brand umbrella, product = how-it-works). Canonical stays `/revenue-engine/`. Rewrite the description off "roofers and dental practices." Note: the current **H1 carries no industry modifier already** ("Get found. Win the sale. Keep them coming back.") — only the eyebrow does, and it goes.

### 1.3 Copy direction (red-team M4 — divergent prose)

The shared `PILLAR_*` const is a **data-shape contract only**. Product-page step copy stays **vertical-agnostic** ("booked work," "the whole sale"); niche copy stays **trade-specific** ("roofs," "patients"). Identical strings on a DR-10 domain risk Google collapsing product and dentists/home-services — enforce divergent prose, not shared strings. Voice: firm "we," operator register, "X, not Y."

### 1.4 The convert CTA + the orphaned-funnel fix (red-team HIGH)

The product page is single-purpose-as-explainer, so its on-page close is the **dual-motion soft-router `FinalCTARail`** (already reused on `/industries/`): card A "You sell a product → **Book a Growth Call**" (`/book-growth-call/`); card B "You book jobs → **Revenue Leak Audit**." No single price, no single guarantee, no embedded form. Add a second strip (adapt `VerticalFork`) routing DOWN to live niche canonicals (**Dentists**) + `/industries/`.

**But removing the `#audit` form orphans the site-level book-jobs funnel** (verified): the **parent hero CTA itself** (`href: '#audit'`, line 148), `RevenueFooter` (`/revenue-engine/#audit`, line 70), `FinalCTARail` card B (bare `/revenue-engine/`, line 56), `Signals` (line 143), and `GoalIndex` rows g-found/g-reviews/g-bookjob/g-coldquote (lines 65/74/92/110) all expect a form on this URL. After removal there is no form and `#audit` is a dead anchor.

**Required fix, shipped in the same PR as the reframe (gated by the founder decision in §3.1):** repoint the **site-level book-jobs router** to a page that has the form. Recommended default: **`/revenue-engine/home-services/#audit`** (the broadest book-jobs niche; it renders `AuditCTA`). Surfaces to update together:
- `FinalCTARail.tsx` line 56 card-B href → `/revenue-engine/home-services/#audit`
- `RevenueFooter.tsx` line 70 → same (kills the dead anchor)
- `Signals.tsx` line 143 → same
- `GoalIndex.tsx` job-verb rows (65, 74, 92, 110) → niche pages; **keep only the methodology row** (line 83 "See the Revenue Engine") on the product page (red-team HIGH intent-mismatch fix)
- new product-page hero CTA: not `#audit` — point card B / the audit ask at the home-services form too.

**Telemetry:** new `data-cta` values for the product close (e.g. `book_call__re_product_close`, `revenue_leak_audit__re_product_router`, `niche_dentists__re_product_router`). Do not reuse `revenue_leak_audit__hero` (assumed the on-page form).

### 1.5 "The concept leads here" (the one allowed exception)

Site rule is value-first; `/revenue-engine/` is the explicit exception — the concept is the subject. Keep it concrete: eyebrow carries the category, H1 names the product **and** its job in plain stakes (not "The Revenue Engine" floating alone), sub-line states the wedge as fact, and within the first screen-and-a-half the reader sees the five named steps + six named cylinders with real `/services/*` links. Concept leads; mechanism proves it immediately.

### 1.6 Keyword target

`revenue engine` + `how the revenue engine works` (product/methodology intent no surface owns). **Forbidden:** any industry/niche modifier in H1/title/eyebrow. Boundaries: homepage = brand umbrella; pillars = "{industry} growth"; niches = "Revenue Engine for {niche}" + job-verb; `/services/*` = cylinder head terms (product page names them, doesn't target them). `DemandSystem`'s "See how the engine works" → `/revenue-engine/` stays correct.

---

## 2. Nav rework

### 2.1 The spec contradiction (resolved)

The rebrand doc's §1 nav code block keeps `Framework → /future-proof-your-seo/`; the remap table says repoint Framework to `/revenue-engine/`. **Follow the remap table + task brief:** "Framework" is **relabeled "The Revenue Engine" and repointed to `/revenue-engine/`.** The code block is stale on that row.

### 2.2 Target structure (label → href)

| # | Top label | href | Children | Status |
|---|---|---|---|---|
| 1 | **Services** | `/services/` | (cylinders dropdown = separate enhancement, **defer**) | live |
| 2 | **Industries** | `/industries/` | Industrial distribution → `/industries/industrial-distribution/` (live) · Medical & aesthetics → `/revenue-engine/medical/` · Home & local services → `/revenue-engine/home-services/` · Retail & consumer brands → `/revenue-engine/local-retail/` — **children stay on current live targets until Phase 5** | **label ship now; children Phase 5** |
| 3 | **Case Studies** | `/case-studies/` | — | unchanged |
| 4 | **The Revenue Engine** | `/revenue-engine/` | — | **ship now (replaces Framework)** |
| 5 | **Insights** | `/category/blog/` | Articles · Guides · Learning Hub · Glossary · Tools · **+ AI Search Readiness → `/future-proof-your-seo/`** | unchanged + 1 child |
| 6 | **Contact** | `/contact-me/` | — | unchanged |

Six top-level items, same count as today — no overflow risk. CTA stays the single global `Book a Growth Call`; per-motion routing lives in page bodies (`FinalCTARail`), not the header — the header has no page-motion context.

### 2.3 `lib/navigation.ts` edits

**Ship now (both ends live):**
- **A** — line 20: `label: 'Who We Serve'` → `'Industries'`. Leave children untouched.
- **B** — line 30: remove `{ label: 'Framework', href: '/future-proof-your-seo/' }`; add `{ label: 'The Revenue Engine', href: '/revenue-engine/' }`.
- **C** — append to Insights children (after line 43): `{ label: 'AI Search Readiness', href: '/future-proof-your-seo/' }`.
- **D** — update the stale comments (lines 15–19, 32–34) so they describe Industries + the Revenue-Engine repoint, not the old "Who We Serve"/Framework story.

**Phase 5 (DO NOT ship before pillar dirs exist — verified `/industries/{home-services,medical-aesthetics,consumer-brands}/` do NOT exist; repointing now 404s the menu):** repoint Industries children to the four pillar canonicals + a "Featured engines: Dentists" row, landed with the `lib/redirects.ts` 301s. The "Featured engines" divider needs a `NavChild` type extension (`divider?`/`group?`) + a render branch in both `Header.tsx` and `MobileNav.tsx` — defer with Edit D.

### 2.4 Consumer / hardcoded-ref fixes

- **`Header.tsx`** — fully generic over `primaryNav`; **no edit** (verified: no hardcoded nav labels, only `data-cta` literals; line 171 `book_call__primary_nav` is correct, leave it).
- **`MobileNav.tsx`** — generic over nav data; **no structural edit**. **Fix the real analytics bug:** line 116 `data-cta="audit__primary_nav"` links to `/book-growth-call/` but mislabels it — change to `book_call__primary_nav` to match Header. Ship in Batch 1.
- **`WhoWeServe.tsx`** — line 93 eyebrow `'Who we serve'` → `'Industries'`; update the line-16 comment. Its four card hrefs point at the same old `/revenue-engine/*` paths — **repoint with Edit D in Phase 5**, not now.
- **`app/(site)/industries/page.tsx`** — line 17 title `'Who we serve · Industries'` → lead with **Industries** (e.g. `'Industries'` or `'Industries · Who we serve'`); update the line-7 comment. Ship in Batch 1.
- **Do NOT touch** `industries/industrial-distribution/page.tsx` line 856 "Who we serve" — that is an in-page section heading on the industrial hub, not the index label. Leave it.

### 2.5 Framework / `/future-proof-your-seo/` resolution

**Keep the page, keep the route, no redirect.** It's a live built page (AI Search Readiness Checklist), sitemap priority 0.8 with wired CTA ids. Repointing the "Framework" label only strips its menu entry — **relocate it into Insights as "AI Search Readiness"** (Edit C), its natural home per the original nav comment. **Never 301 `/future-proof-your-seo/` → `/revenue-engine/`** — different pages; a redirect destroys the checklist. No sitemap-registry edit needed (no route created/moved/retired): both `/future-proof-your-seo/` (line 95) and `/revenue-engine/` (line 76) stay registered unchanged.

### 2.6 Mobile + footer

- **MobileNav** — all nav-data edits flow through automatically; only the line-116 `data-cta` fix.
- **Footer (Phase-5-coupled, but the dead anchor is a Batch-1 conversion regression — fix with the product page):** `FooterSwitch.tsx` (line 20) forces the slim `RevenueFooter` on every `/revenue-engine/*` path by prefix, so the cross-vertical product page gets the local-service footer with a now-dead `/revenue-engine/#audit` link. **Required with the product-page PR:** either narrow `FooterSwitch` to niche paths (exclude bare `/revenue-engine/`) or give the product page the sitewide footer, AND repoint `RevenueFooter` line 70 to the audit form's new home (§1.4). `RevenueFooter` `revenueEngineLinks` (lines 11–15) hardcode three Phase-5 paths — repoint those with the Phase-5 link cleanup (line 11 "How it works" → `/revenue-engine/` label is now *accurate* — keep it).

### 2.7 Sequencing + verification (nav)

**Batch 1 (this task):** Edits A/B/C/D (navigation.ts) · WhoWeServe eyebrow + comment · industries/page.tsx title + comment · MobileNav line-116 fix. Do not touch Industries children, footer paths, or the registry.

**Batch 2 (Phase 5, blocked):** build the 3 pillar dirs → add 3 × 301 to `lib/redirects.ts` → Edit D (children + featured row) + WhoWeServe card hrefs → RevenueFooter link repoint + FooterSwitch rethink → registry update (remove old `/revenue-engine/*` pillar entries — note the reconcile test only catches *missing* routes, not *stale* ones, so this removal is manual). **Hard rule:** never repoint Industries children before the pillars + 301s exist.

---

## 3. Open decisions for the founder (must-resolve, with recommendations)

1. **Where does the site-level book-jobs audit form live after `AuditCTA` leaves the parent?** This gates the whole reframe (sets `FinalCTARail` card B, `Signals`, `RevenueFooter` line 70, `GoalIndex` rows, the product hero CTA, and `FooterSwitch`). **Recommend:** repoint the site-level book-jobs router to **`/revenue-engine/home-services/#audit`** (broadest book-jobs niche, already carries the form). No new landing page to build. Update all surfaces in the reframe PR.

2. **FlowBlock: full visual or wedge banner?** **Recommend: collapse to a 2–3 sentence wedge banner**; let `PlanByPillar` be the sole owner of the Bring→Convert→Retain frame on this page (avoids stating the triptych twice on-page + tripling the homepage).

3. **Shared `PILLAR_*` const — confirm prose diverges?** **Recommend: yes — share the data shape only.** Product copy vertical-agnostic, niche copy trade-specific, to avoid duplicate-content collapse.

4. **Lock the section label "Industries" once.** **Recommend: apply identically** to navigation.ts label, WhoWeServe eyebrow, industries/page.tsx H1+title (grep-verified surfaces; the industrial-distribution in-page heading is excluded). No footer column or BreadcrumbList currently renders "Who We Serve" (grep clean), so the four files above are the complete set.

5. **Day-90 Guarantee survives a book-jobs niche after parent removal?** **Confirmed — verified on dentists (326) AND home-services (173).** Safe to remove from the parent.

6. **FooterSwitch scope.** **Recommend: narrow to niche paths** (exclude bare `/revenue-engine/`) so the product page gets the sitewide footer. Coupled to decision 1.

7. **GSC traffic on bare `/revenue-engine/`.** Pull GSC for the exact URL before shipping; if meaningful local-service query traffic exists, decision 1's router fix is urgent (not just hygiene). On a DR-10 site this is likely thin, but verify.

8. **Nav CTA stays global `Book a Growth Call`?** **Recommend: yes** — per-motion nav CTA needs a motion prop threaded from every page into the layout; not justified now. Motion routing lives in page bodies.

---

## 4. Build order + Definition of Done

### Batch 1 — nav (ships independently, no route changes)
1. `lib/navigation.ts`: Edits A/B/C/D.
2. `components/sections/WhoWeServe.tsx`: eyebrow + comment.
3. `app/(site)/industries/page.tsx`: title + comment.
4. `components/layout/MobileNav.tsx`: line-116 `data-cta` fix.

**DoD (Batch 1):** `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors) · `pnpm lint` clean on changed files · `pnpm test` green incl. `registry.reconcile.test.mjs` **unchanged** (no route touched — if it fails you changed a registered route, back out) · `pnpm build` compiles · confirm `sitemap.xml` still contains both `/future-proof-your-seo/` and `/revenue-engine/`. **Visual loop** (one `--webpack` dev server, one browser): hover **Industries** → four children show (old targets, intentional); **The Revenue Engine** appears where Framework was, links `/revenue-engine/`; open **Insights** → "AI Search Readiness" → `/future-proof-your-seo/`; test mobile slide-out (children expand, CTA fires `book_call__primary_nav`); confirm header light/dark inversion over a dark hero (no regression). Click `/industries/`, `/revenue-engine/`, `/future-proof-your-seo/` → all 200, no 404, no redirect hop.

### Batch 2 — product page reframe + the orphaned-funnel fix (gated by §3.1)
Repurpose `/revenue-engine/page.tsx` per §1.2 + the shared `lib` `PILLAR_*` const (divergent prose) + the router repoints in `FinalCTARail`, `Signals`, `GoalIndex`, `RevenueFooter`, `FooterSwitch` (§1.4, §2.6). Seed any new generic numbers as **drafts** under the existing **GATE:HUMAN** sign-off.

**DoD (Batch 2):** tsc/lint/build clean · run **humanizer** on hero + wedge + FAQ before finalizing · no industry/niche modifier in H1/title/eyebrow · JSON-LD ItemList lists live canonicals only · every changed router target returns 200 with a working `#audit` form (no dead anchor) · **visual loop** on the product page: hero reads as product-led-but-concrete, `FlowBlock` is the banner (not the full track), `PlanByPillar` owns the strokes, six-cylinder links resolve to `/services/*`, `FinalCTARail` dual-router + niche router both fire correct `data-cta`, section tone inversions hold on `SectionRail`.

### Batch 3 — Phase 5 (out of scope; documented dependency)
Pillar dirs → 301s → nav Edit D + WhoWeServe hrefs → footer/registry cleanup. Hard rule from §2.7 applies.