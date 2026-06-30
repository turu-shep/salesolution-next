# Handoff: `/services/` hub — the engine-as-base, value-first

**Date:** 2026-06-29 · **Branch:** main · **Status:** shipped (committed to main, not pushed)
**Purpose:** hand off the `/services/` hub so it can be continued in a fresh chat. The rest of the rebrand (homepage, `/revenue-engine/`, nav, all 12 cylinder pages) is separate — see `05-rebrand-build-plan.md`.

**Updated 2026-06-30 (second pass):** hero discipline tags now deep-link to their cylinder pages; the vendor count was aligned (five → six) and the combinations table de-jargoned; the pricing block was reframed from generic shapes into the structural **engine base ($30K one-time) + cylinder add-ons** model, closed by a cost-of-inaction value-anchor. Details inline below.

---

## What the page is now (the thesis)

`/services/` presents the firm's work as **one system** (decommoditise) made **concrete** (de-vague). The strategic problem it solves:
- A single service ("just SEO", "just ads") is a **commodity** — bought alone, without the system, it under-delivers. So the engine is what makes each part worth more than a point-buy.
- "We install a Revenue Engine" is **vague** and is ~3 months of work nobody can picture. So the recognizable disciplines (SEO, GEO, local SEO, content, ads, website dev) make the system concrete.

Model: **the Revenue Engine is the base we install; the cylinders are the parts that bolt on top** (the ones we fuel, support, improve). Thesis line on the page: *"A part on its own is just a tool. Bolted to the engine, it compounds."*

**Clean split from `/revenue-engine/`:** `/revenue-engine/` = how the whole system works + the niche router. `/services/` = the concrete work we do + the system that makes it not-a-commodity.

---

## Current arc (value-first — value must land on the first screen)

| # | Section (component) | Job |
|---|---|---|
| 1 | **`ServicesHubHero`** (compact, NEW) | Hook "One system, not six vendors." + the recognizable disciplines as scannable **tags** (AI Search & GEO · Local SEO · Content · Catalog · Website Dev · Paid Ads · Outbound · Reviews) + lede + CTAs + anchor nav. |
| 2 | **`EngineBase` `#engine`** (dark, NEW) | The Revenue Engine as the **installed base** (~90 days) with the **cylinders as the parts that bolt on top** — a layered visual: pillar-grouped part-chips → a connector rail ("all of it runs on the base") → the weighted engine base block. |
| 3 | **`SixCylinders` `#cylinders`** | The 12-cylinder catalog (shared with the `/revenue-engine/` product page), grouped Bring/Convert/Retain, each deep-linked to `/services/{slug}/`. |
| 4 | **`HowServicesCombine` `#combinations`** | *Supporting:* the 60/40 compounding argument, "five agencies, no accountability", + a combinations table with typical monthly spend. (Demoted here from the prime second-screen slot — it's supporting, not the main story.) |
| 5 | **`PickAService` `#pick`** | "Where does your system start?" entry-point list. |
| 6 | **`EngagementShapes` `#engagement`** | **Reworked 2026-06-30:** structural engine-as-base pricing — a $30K one-time base block (the Revenue Engine install, ~90 days / 3-month engagement) → "Add cylinders" ($4–15K/mo each) + "Full Growth Ownership" (from $20K/mo), closed by the **"The fee isn't the expensive part"** cost-of-inaction anchor and the "prove one part first" footnote. |
| 7 | **`FAQ` + `FinalCTARail`** | Hub FAQ + the sitewide dual-door close. |

`app/(site)/services/page.tsx` composes these. `CompositeBar weight="hero"` + breadcrumb JSON-LD at the top.

---

## Components & files

- **NEW** `components/sections/services/ServicesHubHero.tsx` — compact bespoke hub hero (server component). The shared `ServicesHero` runs at `md:text-[6rem]`, right for a 2-3 word cylinder-page title but a full-screen wall for the hub's longer line — hence a bespoke compact hero. Disciplines tags are non-interactive labels; anchors hard-coded.
- **NEW** `components/sections/services/EngineBase.tsx` — dark. Auto-derives the part-chips from `CYLINDER_GROUPS` by pillar; **excludes Full Growth Ownership** from the chips (it's the whole-engine tier, not a bolt-on part). Base block has foundation weight (brand top-edge + fill + shadow). Links to `/revenue-engine/`.
- **Reworked 2026-06-30** `EngagementShapes.tsx` — was generic Sprint/Retainer/Full Growth; now the structural base + add-ons block (see arc row 6). Base price **$30K one-time** (founder-supplied). Diverges on purpose from the per-service `EngagementModel` (the cylinder pages keep Sprint/Retainer/Full Growth). The cost-of-inaction anchor copy came from a judge-panel workflow + a humanizer pass.
- **Edited 2026-06-30** `HowServicesCombine.tsx` — "Five agencies" → "Six vendors" (aligns the hero count); three table "fit" cells de-jargoned ("AIO citation share", "two-layer content strategy", "pipeline motion supported by visible expertise").
- **Edited 2026-06-30** `ServicesHubHero.tsx` — the 8 discipline tags are now `Link`s to `/services/{slug}/` (were non-interactive labels).
- **Reused unchanged:** `SixCylinders` (shared w/ product page — do NOT reframe it for the hub only), `PickAService`, `FAQ`, `FinalCTARail`.
- `app/(site)/services/page.tsx` — metadata updated to the "run as one system" framing.
- Strategy note: `docs/strategy/multi-vertical-pivot/05-rebrand-build-plan.md`, Phase 2 "↳ Refined 2026-06-29" block.

---

## Decisions already made (don't relitigate without reason)

- **Cylinder PAGES keep the light `ServicesHero`** (founder confirmed); only the **hub** got a bespoke compact hero.
- `EngineBase` pulls from `CYLINDER_GROUPS` so it auto-syncs as the catalog changes. FGO excluded from chips.
- **Value-first ordering**: engine + parts BEFORE the supporting combinations table (founder feedback: "the value should be visible fast, not on the 4th screen").
- Two visual-loop passes done: (1) the `EngineBase` visual (foundation weight + connector), (2) the value-first hero compaction + reorder.
- **Pricing is engine-as-base (2026-06-30):** the hub prices a **$30K one-time base install** + monthly cylinder add-ons + Full Growth. Founder chose the *structural* reframe over a narrative one, knowing it **diverges from the per-service pages** (which keep Sprint/Retainer/Full Growth) — the hub tells the engine story, the service pages don't.
- **Show price, anchored (2026-06-30):** price stays visible (it qualifies the buyer and is on-brand vs the agency runaround). It's reframed against the cost of *inaction* — current $15–40K/mo spend, no accountable owner, demand leaking — so the fee reads as the cheap line. "Parts shown twice" (EngineBase chips vs SixCylinders) was reviewed and **left as-is**.

---

## Open / candidate next steps for `/services/`

**Done in the 2026-06-30 pass:** discipline-tag deep-links · count alignment (five → six) · table de-jargon · pricing reframe (structural base + add-ons) + cost-of-inaction value-anchor.

Still open:
- **Parts shown twice**: `EngineBase` previews the parts as chips, then `SixCylinders` lists them again. Reviewed 2026-06-30 and **left as-is**; revisit if the section reads redundant in testing.
- **Sprint price** is unreconciled across the site (ai-seo `$12–24k` vs the industrial pillar umbrella `$9–35K` vs website-dev `$15–35K`). The hub no longer shows a "Sprint" price (folded into the base + the "prove one part first" footnote), but the per-service pages still disagree. Confirm a canonical number if one is wanted.
- **`$30K base` consistency**: the hub now states a $30K one-time base install; that number doesn't appear on the per-service pages or `/revenue-engine/`. Decide whether to propagate it or keep it hub-only.
- **Hero hook** "One system, not six vendors." — punchy but sparse; could test variants. (The 8 discipline tags vs the literal "six" is a deliberate rhetorical count, not a bug.)
- The EngineBase chip for a cylinder with no slug renders "Coming soon" — currently all 12 are built, so none show; keep the branch for future catalog changes.
- **Count audit (from the `/revenue-engine/` chat, 2026-06-30) — for you to reconcile.** That chat de-counted all "six cylinders / six services" copy on `/revenue-engine/` + the industrial pillar (catalog is **12**, house style drops the count) and deliberately did **not** touch your `/services/` files. Two cross-cutting items surfaced:
  - **Incumbent "six vendors" vs site-wide "five vendors".** Your hub hero + the `/services/` and `consumer-brands` metadata + `EngagementShapes`/`HowServicesCombine` say **six**; the FGO pages + industrial pillar say **five agencies/vendors**. You flagged the hub "six" as deliberate — fine, but pick one incumbent count site-wide so they stop disagreeing.
  - **`ServicesTabs` H2 "Six services. One operator-led team."** renders **5** tabs (+ FGO callout) — a count mismatch either way, stale against the 12-catalog. `FullGrowth*` "five services" understates the 12 FGO can run (de-count like EngagementShapes' count-free "every cylinder"). Dead `ServicesByLeak`/`ServicesSystem` carry stale "six" comments (low priority).
