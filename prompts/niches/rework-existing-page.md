# Prompt: Rework a Revenue Engine vertical page from its niche brief (Linear SS Niches · M1)

**Read `prompts/_CONTEXT.md` first.** This is a **money-page** task (not the learning hub). It turns
a researched, fact-checked **copy-angle brief** into a sharper live landing page. One run = **one
page**. Covers Linear **SAL-432** (dentists), **SAL-433** (local-retail), **SAL-434** (home-services),
**SAL-435** (medical).

---

## Why
The four live Revenue Engine pages all lead on **Convert** (the missed call). The niche research says
the *lead pillar differs by trade* — and a page that leads with the wrong pillar buries its strongest
hook. This task re-leads each page on the pillar the buyer actually feels, in the buyer's own words,
without changing the URL.

The three pillars (full frame in `docs/strategy/operating-concept-bring-convert-retain.md`):
**Bring** (get found) → **Convert** (win the ones who reach you) → **Retain** (bring them back) → **Prove**.

## The source of copy — the brief (do not invent copy)
Every line you need is already written and fact-checked in the brief. Pull from it; don't freewrite.
- Read it: **`/strategy/niche/{slug}`** (gated — open on localhost; `SALES_ENABLED=true` in prod).
- Or read the typed data directly: **`lib/strategy/niches/briefs.generated.ts`** (type in `./types.ts`).
  Each `NicheBrief` has: `heading.options[]` (title/accent/why), `heading.lede`,
  `leak.{eyebrow,headlineA,headlineB,intro,points[],closer}` (3 `points`, one per pillar, each with
  `label`, `copy`, `stat`, `source`), `plan.{leadPillar,pillars[],prove}`, `difference.{lost[],won[]}`,
  `reassurance.{sectionTitle,intro,bullets[]}`, `faq[]`, `language.{theirWords,wordsToUse,wordsToAvoid}`,
  `keyStats[]`, `sources[]`, and `_verify` (the stat audit — see the gate below).

## The four pages

| Linear | Page file | Brief slug(s) | Re-lead to | Reassurance section |
|---|---|---|---|---|
| SAL-432 | `app/(site)/revenue-engine/dentists/page.tsx` | `dental` | **Retain** (cold treatment plan + recall) | HIPAA/BAA + PMS (`Compliance`) |
| SAL-433 | `app/(site)/revenue-engine/local-retail/page.tsx` | `local-retail` | **Bring** (findability, map pack) | in-store+online unified (new section) |
| SAL-434 | `app/(site)/revenue-engine/home-services/page.tsx` | `roofing` `hvac` `plumbing` `electrical` | **Convert** (keep), broaden past "on a roof" | seasonality (`Seasonality`) |
| SAL-435 | `app/(site)/revenue-engine/medical/page.tsx` | `med-spa` `plastic-surgery` | Convert hero + strong Retain beat | HIPAA (`Compliance`) |

## Read first
1. `prompts/_CONTEXT.md` · 2. `docs/strategy/operating-concept-bring-convert-retain.md` ·
3. `.agents/product-marketing-context.md` (voice, kill-list, objection library) ·
4. the brief for this page · 5. the current page file (improve it, keep what works).

---

## Do this — section by section
Map the brief to the page's existing components. Section copy comes from the brief; only the lead
emphasis and wording change.

1. **Heading** (`RevenueHero` — props `eyebrow`, `title`, `titleAccent`, `lede`, `primaryCta`,
   `founder`, `anchors`). Use the brief's **`heading.options[0]`** as `title` + `titleAccent` (the
   sharpest option; the other options are alternates to A/B later). Use `heading.lede` for `lede`.
   Keep the founder strip and anchors.

2. **The leak** (`Concept2Evidence`). The 3 evidence cards live in
   **`components/sections/revenue-engine/leak-concepts/data.ts`**, keyed by vertical
   (`home-services` | `medical` | `retail`) under `evidence.cards`. The `header={…}` prop only
   overrides eyebrow/headlines/intro/closer — **to change the 3 cards' copy you must edit `data.ts`**.
   For each of the brief's `leak.points` (Bring/Convert/Retain), set the matching card:
   `kicker: "<Pillar> · <short label>"`, `label: point.label`, `body: point.copy`,
   `source: point.source`. Set `header` from `leak.{eyebrow,headlineA,headlineB,intro,closer}`.
   Put the **lead pillar's card first** so it reads as the headline leak.

3. **The plan** (`PlanByPillar` — props `id`, `groups: PillarGroup[]`, `prove: Step`). Keep the full
   Bring→Convert→Retain machine. Tune each `step.what`/`step.metric` to this trade from
   `brief.plan.pillars`, and make the **lead pillar's group the most concrete** (it's where the page's
   promise lands). Set `prove` from `brief.plan.prove`.

4. **The difference** (`Concept4BeforeAfter`). Uses `beforeAfter.lost[]` / `beforeAfter.won[]` in the
   same `data.ts` entry. Replace them with `brief.difference.lost` / `.won`; set the header from
   `brief.difference.{headlineA,headlineB,intro}`.

5. **Reassurance** — the section that proves we know the trade. Use the right component:
   `Compliance` (dental, medical), `Seasonality` (home-services), or a small new section for retail
   ("one system for the floor and the website"). Fill from `brief.reassurance` (`sectionTitle`,
   `intro`, `bullets[]`).

6. **FAQ** (`FAQ` — props `id`, `eyebrow`, `headline`, `kicker`, `items: QA[]`, `defaultOpenFirst`).
   Replace `items` with `brief.faq` (q → `q`, a → `<p>{a}</p>`). Keep 5–6.

7. **Language** — across the whole page, prefer `brief.language.wordsToUse`; purge every term in
   `brief.language.wordsToAvoid`. The brief's `theirWords` are the phrases that should appear.

Leave `FlowBlock`, `TwoRevenueLines`, `Guarantee`, `RevenuePricing`, `AuditCTA`, and the
`JsonLd`/`serviceSchema` block in place. Update the page `metadata` (title/description) and the
`serviceSchema` description to match the new lead angle.

## The data-confidence gate (hard rule)
The brief's `_verify.checked` flags each stat `confirmed | plausible | unsupported | wrong`.
**Do not put an `unsupported` or `wrong` stat on a public page.** Use its `correction`, or cut the
number and make the point in plain operator voice. `med-spa` and `electrical` briefs are
`mostly-solid` and carry residual flags — check before using their numbers. When in doubt, a
confident plain claim beats a fragile percentage.

## Voice & humanizer
Operator register (see `_CONTEXT.md`): terse, declarative, "X, not Y", concrete, no hype. **Run the
`humanizer` skill on all copy before finalizing** (global instruction): kill em-dash overuse, "not
just X but Y", rule-of-three padding, hedging, buzzwords; vary sentence length; lead with the outcome
in the owner's words. Don't announce that you humanized it.

## Per-page specifics
- **Dentists (SAL-432):** hero leads with the **cold $5k treatment plan**, not "front desk." Retain
  (treatment-plan follow-up + overdue-recall reactivation) is the hero step in the plan and the first
  leak card. Keep Convert (chair-time calls) as the second beat. Compliance section: BAA + Dentrix /
  Open Dental / Eaglesoft.
- **Local-retail (SAL-433):** hero leads with **findability** ("photograph the tag, buy online" / "who
  sells X near me"). Bring first leak card (map pack, Local Inventory). Add a reassurance section on
  one system across the floor + the website.
- **Home-services (SAL-434):** keep **Convert** but broaden the hero so a roofer, HVAC tech, and
  plumber all see themselves — rotate or neutralize the "on a roof" language using the 3 trade
  headlines. **Electrical leads Bring** — handle it lightly here; it gets its own page in M2 (SAL-440).
- **Medical (SAL-435):** keep the high-ticket-consult (Convert) hero for plastic surgery, add the
  med-spa **Retain** rebooking beat. Note the two specialties want different lead pillars — this page
  is split in M2 (SAL-441/442). Do **not** publish med-spa's 2 flagged stats.

## Visual loop (when checking the result)
One dev server, one browser, serial screenshots (see memory `visual-loop-tooling`). Reuse a running
`pnpm dev`; never start a second server or run `pnpm build` against a live dev server. Check the page
with `node scripts/_visual-check.mjs <url> <w> <h> [out.png]` at desktop (1280) and mobile (390);
fix any overflow culprit it reports.

## Definition of done
- [ ] Hero, leak (3 cards re-led), plan, difference, reassurance, FAQ all pull from the brief; lead
      pillar is unmistakable above the fold.
- [ ] Every `wordsToAvoid` term gone; copy reads in the trade's language.
- [ ] No `unsupported`/`wrong` stat on the page; every remaining stat traces to a real source.
- [ ] `humanizer` run on all new copy.
- [ ] `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors), lint clean on
      changed files, `pnpm build` compiles.
- [ ] `curl -sL http://localhost:3000/revenue-engine/<page>/` shows the new hero/leak; visual-check
      reports 0 page overflow at 1280 and 390.
- [ ] Change seeded behind review / not published live until the owner approves.
- [ ] Update the Linear issue (check the boxes; note any stat you had to cut).

## Do NOT
- Freewrite copy when the brief already has it. Pull from the brief.
- Change the URL, retire shared sections, or relitigate the Bring→Convert→Retain frame.
- Publish a flagged stat. Split the bundled pages here — that's M2 (`split-the-bundle.md`).
