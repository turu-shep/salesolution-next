# Handoff: `/services/` hub — the engine-as-base, value-first

**Date:** 2026-06-29 · **Branch:** main · **Status:** shipped (committed to main, not pushed)
**Purpose:** hand off the `/services/` hub so it can be continued in a fresh chat. The rest of the rebrand (homepage, `/revenue-engine/`, nav, all 12 cylinder pages) is separate — see `05-rebrand-build-plan.md`.

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
| 6 | **`EngagementShapes` `#engagement`** | Sprint / Operator Retainer / Full Growth pricing shapes (generic, service-agnostic). |
| 7 | **`FAQ` + `FinalCTARail`** | Hub FAQ + the sitewide dual-door close. |

`app/(site)/services/page.tsx` composes these. `CompositeBar weight="hero"` + breadcrumb JSON-LD at the top.

---

## Components & files

- **NEW** `components/sections/services/ServicesHubHero.tsx` — compact bespoke hub hero (server component). The shared `ServicesHero` runs at `md:text-[6rem]`, right for a 2-3 word cylinder-page title but a full-screen wall for the hub's longer line — hence a bespoke compact hero. Disciplines tags are non-interactive labels; anchors hard-coded.
- **NEW** `components/sections/services/EngineBase.tsx` — dark. Auto-derives the part-chips from `CYLINDER_GROUPS` by pillar; **excludes Full Growth Ownership** from the chips (it's the whole-engine tier, not a bolt-on part). Base block has foundation weight (brand top-edge + fill + shadow). Links to `/revenue-engine/`.
- **Reused unchanged:** `SixCylinders` (shared w/ product page — do NOT reframe it for the hub only), `HowServicesCombine`, `PickAService`, `EngagementShapes`, `FAQ`, `FinalCTARail`.
- `app/(site)/services/page.tsx` — metadata updated to the "run as one system" framing.
- Strategy note: `docs/strategy/multi-vertical-pivot/05-rebrand-build-plan.md`, Phase 2 "↳ Refined 2026-06-29" block.

---

## Decisions already made (don't relitigate without reason)

- **Cylinder PAGES keep the light `ServicesHero`** (founder confirmed); only the **hub** got a bespoke compact hero.
- `EngineBase` pulls from `CYLINDER_GROUPS` so it auto-syncs as the catalog changes. FGO excluded from chips.
- **Value-first ordering**: engine + parts BEFORE the supporting combinations table (founder feedback: "the value should be visible fast, not on the 4th screen").
- Two visual-loop passes done: (1) the `EngineBase` visual (foundation weight + connector), (2) the value-first hero compaction + reorder.

---

## Open / candidate next steps for `/services/`

- **Disciplines tags** in the hero are non-interactive labels — consider deep-linking each to its cylinder page.
- **Parts shown twice**: `EngineBase` previews the parts as chips, then `SixCylinders` lists them again. Decide whether `EngineBase` should drop the chip list (keep just the base block as the concept) and let `SixCylinders` own the parts, or keep the preview.
- **Pricing reframe**: `EngagementShapes` is generic (Sprint/Retainer/Full Growth per service). The engine-as-base model argues for reframing pricing as **engine base install + cylinder additions** — not yet done.
- **`HowServicesCombine`** table copy ("Pipeline motion supported by visible expertise") drifts agency-abstract; de-jargon candidate. It still says **"Five agencies"** while the hero now says "a stack of separate vendors" / "six vendors" — align the count.
- **Sprint price** is unreconciled across the site (ai-seo `$12–24k` vs the industrial pillar umbrella `$9–35K` vs website-dev `$15–35K`). Confirm a canonical number if one is wanted.
- **Hero hook** "One system, not six vendors." — punchy but sparse; could test variants or make the disciplines richer.
- The EngineBase chip for a cylinder with no slug renders "Coming soon" — currently all 12 are built, so none show; keep the branch for future catalog changes.
