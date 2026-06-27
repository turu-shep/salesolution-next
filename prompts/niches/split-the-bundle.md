# Prompt: Split a bundled vertical into a dedicated niche page (Linear SS Niches · M2)

**Read `prompts/_CONTEXT.md` first**, then `prompts/niches/rework-existing-page.md` (the
section-by-section build mechanics are the same — this prompt adds the *new-page + information-
architecture* parts). This is a **money-page** task. Covers Linear **SAL-436** (scope decision, do it
first), **SAL-437…442** (the six dedicated builds), and **SAL-443** (turn the parents into hubs).

---

## Why
Two live pages bundle trades whose **lead pillar differs**, so neither page can lead correctly:
- `home-services` covers roofing/HVAC/plumbing (lead **Convert**) **and** electrical (leads **Bring**).
- `medical` covers med-spa (leads **Retain**) **and** plastic surgery (leads **Convert**).

A bundled page can't lead two pillars or rank for each trade's terms. M2 gives the high-value trades
their own page, each leading its own pillar and ranking for its own "{trade} near me" demand, with the
parents demoted to hubs.

## The source of copy — the brief
Same as the rework prompt. Each dedicated page is built from its brief at **`/strategy/niche/{slug}`**
(gated; open on localhost) / `lib/strategy/niches/briefs.generated.ts`. **Pull copy from the brief;
don't freewrite.** Obey the data-confidence gate (don't ship `unsupported`/`wrong` stats).

---

## Step 0 — lock the scope first (SAL-436)
Do not build pages until these are decided and written down:
- **Slugs:** recommend flat siblings of the existing pages — `app/(site)/revenue-engine/{slug}/page.tsx`
  for `roofing · hvac · plumbing · electrical · med-spa · plastic-surgery`. (Matches `dentists`,
  `home-services`, `medical`, `local-retail`.)
- **Parents stay as hubs**, not redirects — `home-services` and `medical` keep their URLs and existing
  inbound links; they become thin overviews that route to the dedicated pages (SAL-443). No redirects
  needed (the dedicated slugs are new).
- **Canonicals** self-referential per page; hub stays canonical to itself (keep it thin so it doesn't
  compete with the dedicated pages for the same query).
- **Nav + sitemap:** plan how the dedicated pages surface in `lib/navigation.ts`, the footer, and the
  sitemap.
- **Calculator:** decide whether each page reuses `WholeFlowLeak` with the trade's preset (see the
  presets table in `docs/strategy/revenue-engine/niche-research.md`).
Output: a short IA note + the confirmed slug list. That unblocks SAL-437…442.

## The six dedicated pages

| Linear | New page (slug) | Brief | Lead pillar | Top headline (from brief) | Reassurance |
|---|---|---|---|---|---|
| SAL-437 | `roofing` | `roofing` | Convert | "You were on a roof when the phone rang…" | storm season / insurance (`Seasonality`) |
| SAL-438 | `hvac` | `hvac` | Convert | "The AC dies at 9 on a Friday…" | two seasons + memberships (`Seasonality`) |
| SAL-439 | `plumbing` | `plumbing` | Convert | "The pipe bursts at 11 p.m…" | after-hours + membership (`Seasonality`) |
| SAL-440 | `electrical` | `electrical` | **Bring** | "You can't answer the phone wrist-deep in a 200-amp panel." | licensing/permits/safety + EV/panel/generator |
| SAL-441 | `med-spa` | `med-spa` | **Retain** | "You're an injector, not a marketer…" | cash-pay medical (`Compliance` + medical director) |
| SAL-442 | `plastic-surgery` | `plastic-surgery` | Convert | "You don't have a lead problem. You have a $9k consult that hit voicemail." | HIPAA + financing + before/after (`Compliance`) |

---

## Build a dedicated page (per SAL-437…442)

1. **Scaffold from the closest existing page**, don't start blank:
   - roofing/hvac/plumbing → copy `app/(site)/revenue-engine/home-services/page.tsx` (it has
     `Seasonality`).
   - electrical → copy `home-services/page.tsx` too, but **re-order to lead Bring** (see below).
   - med-spa/plastic-surgery → copy `app/(site)/revenue-engine/medical/page.tsx` (it has `Compliance`).
   Keep the shared spine: `RevenueHero → Concept2Evidence (leak) → FlowBlock → PlanByPillar →
   Concept4BeforeAfter (difference) → [Seasonality|Compliance] → TwoRevenueLines → Guarantee →
   RevenuePricing → FAQ → AuditCTA`, plus the `JsonLd`/`serviceSchema` block.

2. **Per-industry leak + difference data.** The shared `leak-concepts/data.ts` is keyed by 3 verticals
   (`home-services|medical|retail`) and is too coarse for a single trade. **Create a per-niche data
   object** for each dedicated page — add a small module
   `components/sections/revenue-engine/leak-concepts/niche-data.ts` exporting a `LeakData`-shaped
   object per slug (same `LeakData` type from `data.ts`), built from the brief:
   - `evidence.cards` ← the 3 `leak.points` (one per pillar): `kicker: "<Pillar> · <label>"`,
     `label`, `body: copy`, `source`.
   - `beforeAfter.lost` / `.won` ← `difference.lost` / `.won`; labels + `sourceCaption` from the brief.
   Pass it as `data={NICHE_LEAK['roofing']}` to `Concept2Evidence` and `Concept4BeforeAfter`, with the
   `header` from the brief. (Do **not** force-extend the global `Vertical` union — a per-niche module
   keeps the blast radius small.)

3. **Hero** from `brief.heading` (`options[0]` → `title`/`titleAccent`, `lede`). Keep the founder
   strip + anchors. Set `eyebrow` to the trade.

4. **Plan** from `brief.plan` (`PlanByPillar` `groups` + `prove`). Keep the full Bring→Convert→Retain
   machine; make the **lead pillar's group the most concrete**.

5. **Reassurance:** `Seasonality` (roofing/hvac/plumbing), `Compliance` (med-spa/plastic-surgery), and
   for **electrical** a small licensing/permits/safety section (new) — fill from `brief.reassurance`.

6. **FAQ** from `brief.faq`. **Language**: prefer `brief.language.wordsToUse`, purge `wordsToAvoid`.

7. **Metadata + JSON-LD:** unique `<title>`/description, `alternates.canonical` to the new URL, and
   `serviceSchema({ name, url: <new url>, description, category: 'Marketing' })` with the new URL.

### Electrical (SAL-440) — the one that leads Bring
Re-order the narrative so **Bring leads**: the hero is about being found ("electrician near me" + the
EV-charger / panel-upgrade / whole-home-generator demand wave); the first leak card is the Bring card;
the plan's Bring (Capture) group is the most concrete. Convert/Retain follow. Everything else is the
same spine.

---

## Turn the parents into hubs (SAL-443) — after the dedicated pages exist
- `home-services` → overview that routes to roofing/hvac/plumbing/electrical (use `RevenueHero`
  `selfQualifiers` links, as the pillar `/revenue-engine` page already does). Keep the shared
  FlowBlock / Guarantee / Pricing / FAQ; move the trade-specific depth onto the dedicated pages.
- `medical` → overview that routes to med-spa + plastic-surgery (+ dental).
- Update `lib/navigation.ts`, footer, sitemap to surface the dedicated pages; cross-link the pillar
  `/revenue-engine` page and siblings.
- Keep hubs **thin** so they don't compete with the dedicated pages for the same query; verify no
  duplicate-content overlap; canonicals self-referential.

## The data-confidence gate (hard rule)
Same as the rework prompt: the brief's `_verify.checked` flags each stat. **Never put an
`unsupported`/`wrong` stat on a public page** — use its `correction` or cut it and make the point in
plain operator voice. `electrical` and `med-spa` are `mostly-solid`; re-source or cut their residual
flags before publish.

## Voice & humanizer
Operator register (`_CONTEXT.md`). **Run the `humanizer` skill on all copy** before finalizing.

## Visual loop
One dev server, one browser, serial screenshots (memory `visual-loop-tooling`). Reuse a running
`pnpm dev`; never start a second server or `pnpm build` against a live dev server. Check each new page
with `node scripts/_visual-check.mjs <url> 1280 1000` and `… 390 844`; fix any overflow culprit.

## Definition of done (per dedicated page)
- [ ] New page at the agreed slug, scaffolded from the right template, full spine intact.
- [ ] Hero/leak/plan/difference/reassurance/FAQ all pulled from the brief; lead pillar unmistakable
      above the fold (electrical leads Bring).
- [ ] Per-niche leak/difference data wired (not the coarse 3-vertical default).
- [ ] Unique title/description, canonical to the new URL, `serviceSchema` URL correct.
- [ ] No `unsupported`/`wrong` stat on the page; `wordsToAvoid` purged; `humanizer` run.
- [ ] `npx tsc --noEmit` clean (ignore `lib/lead-form/*`), lint clean on changed files, `pnpm build`
      compiles.
- [ ] `curl -sL` the new URL returns 200 with the new hero/leak; visual-check 0 overflow at 1280/390.
- [ ] (SAL-443) parents are hubs that link the dedicated pages; nav + sitemap updated; no dup-content.
- [ ] Behind review until the owner approves; update the Linear issue.

## Do NOT
- Build pages before SAL-436 locks the slugs/IA.
- Force-extend the global `Vertical` union for one trade — use a per-niche data module.
- Redirect the parents (keep them as hubs); change other pages' URLs; publish a flagged stat.
- Freewrite copy the brief already provides.
