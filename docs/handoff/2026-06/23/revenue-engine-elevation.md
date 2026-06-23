# Handoff — Revenue Engine site elevation (+ Sales HQ) · 2026-06-23

**Branch:** `revenue-engine-and-sales-hq`, fast-forward-merged into **local `main`**.
**Remote state:** local `main` is **14 commits ahead of `origin/main` — NOT pushed, NOT deployed.**
**Stack:** Next.js 16 (App Router) + Sanity. `pnpm`. Tailwind v4 with custom tokens. `dev` pinned to `--webpack`.
**Verified at every commit:** `npx tsc --noEmit` clean · `eslint` clean on changed files · `pnpm build` exit 0.

> One-line: the entire Revenue Engine page cluster (pillar + 4 verticals) was rebuilt onto the
> **Bring → Convert → Retain (+ Prove)** frame and elevated for conversion (shown-trust founder
> card, graphical FlowBlock/PlanByPillar, de-jargoned voice, route-aware slim footer,
> report → guarantee → pricing sequence). An internal password-gated **Sales HQ** (`/sales/*`)
> cold-call cockpit was also built earlier on the same branch.

---

## 0. Immediate state / open decisions

1. **Push/deploy decision (pending).** `main` holds everything locally but nothing has left the
   machine. Pushing `origin main` will likely trigger a **Vercel production deploy** of all of it
   to salesolution.net. Options: (a) `git push origin main` (publish + deploy), or (b) push the
   *branch* and open a PR so it deploys as a Vercel **preview** first. Artur to decide. **The push
   payload is 14 commits, not 11** — 3 of them (`8ed1e0d`, `d5893c3`, `ae579a5`: a `/industries/`
   showcase + a Sanity deprecation fix) predate this session (see §2).
2. **Increment 3 — the interactive calculator — is GATED.** It is the single biggest remaining
   lever and the only deliberately-unfinished piece. It needs a claims scrub in
   `components/sections/revenue-engine/leak-concepts/data.ts` (see §8) signed off by Artur
   (`GATE:HUMAN`) before the calculator can ship. Details in §9.
3. **Untracked scratch (not committed):** only `scripts/_section-shot.mjs` and
   `scripts/_footer-shot.mjs`. The other visual-loop scripts — `scripts/_re-shot.mjs` and
   `scripts/_shot-load.mjs` — are **already tracked/committed**, and `screenshots/` is **gitignored**.
   (So deleting `_re-shot.mjs` is a tracked-file change, not scratch cleanup.)
4. **Merged branch** `revenue-engine-and-sales-hq` still exists (== `main`). Safe to delete after
   the push decision.

---

## 1. Read these first (don't duplicate them here)

| Doc | What it is |
|---|---|
| `docs/strategy/multi-vertical-pivot/03-pillar-elevation-strategy.md` | **The thesis behind this work** — output of a 16-agent strategy workflow, adversarially verified. Shown-trust, the 3-increment plan, section-by-section copy+visual, claims map, build plan, open questions. **Start here for the page work.** |
| `docs/strategy/operating-concept-bring-convert-retain.md` | Canonical operating frame: Bring → Convert → Retain (+ Prove). The 5-step engine nests under it. |
| `docs/strategy/multi-vertical-pivot/02-revenue-engine-inject.md` | The RE-INJECT gap-audit + Next-native plan (Phases A–F). Tracks what's built vs left. |
| `docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md` | Story strategy / screen-by-screen storyboard (SB7 spine, ICP psychology, objection map). |
| `docs/strategy/sales/_claims-library.md` | **Approved Claims Library** — the only stats allowed on any RE surface, with sources (C-01…C-06). |
| `.agents/product-marketing-context.md` | Brand voice / positioning / ICP / kill-list (SSOT for copy). |

---

## 2. What shipped (commit arc on this branch)

```
10382f0  remove dead frame components + reconcile guarantee wording   ← cleanup
970a820  migrate local-retail vertical to the elevated frame
43ba72b  migrate medical/aesthetics vertical to the elevated frame
47087c0  migrate dentists vertical to the elevated frame
0a9d07f  migrate home-services vertical to the elevated frame
428393a  pillar — Increment 2: visual rhythm
1db694f  pillar — Increment 1: shown trust, de-jargon, route-aware footer
558e563  pillar: align to Bring -> Convert -> Retain frame
2547d27  reconcile /sales messaging to BCR (+ Prove)
0bef773  checkpoint in-progress RE site cluster + operating concept
a4acf25  add internal Sales HQ workspace (/sales) + RE injection plan
```

The first two (`a4acf25`, `0bef773`) are the earlier Sales HQ + RE-cluster build (§6). `2547d27`
reconciled messaging to BCR. `558e563` onward is this session's page-elevation work.

133 files changed across the branch (~15k insertions). The RE-elevation slice is the focus below.

> **`main` is 14 commits ahead of `origin/main`, not 11.** Below `a4acf25` sit 3 more unpushed
> commits — `8ed1e0d` (embed audit form + /industries/ index + remove dead /v2-1/), `d5893c3`
> (Sanity image-URL deprecation fix), `ae579a5` (/industries/ image-led showcase) — which predate
> this session but ship with any push/deploy of `main`.

---

## 3. The thesis (why the pages look like they do)

**Swap asserted trust for shown trust.** The old pages *told* the buyer (a skeptical, agency-burned,
time-poor local-service owner) exactly where he is most skeptical. The elevated pages *show*:

- a **named operator + named terms** above the fold (founder spec-card),
- a leak he can reason about,
- an **auditable method** ("How I report it", not an empty "Proof" section),
- a guarantee stated in **plain words** ("the revenue the system brings back…", not "system-attributed").

**Frame:** `Get found. Win the sale. Keep them coming back.` is Bring → Convert → Retain in owner
language. The 5-step engine **CAPTURE → RESPOND → BOOK → RECOVER → PROVE is frozen** and nests under
the 3 pillars (Bring=Capture · Convert=Respond+Book · Retain=Recover · Prove caps it).

**Visual line:** light = the facts (diagnosis), dark = the belief (conviction). The page paces via
`SectionRail` tone + glow, no new chrome. Brand blue = the CTA + the won marker + the system line;
orange (`accent-500`) = wayfinding (icons, step numbers, the loop arc).

---

## 4. Architecture & reusable patterns (the important part for a future agent)

All components live under `components/sections/revenue-engine/`. Pages compose them; **per-vertical
content lives in each page's `page.tsx`** as `*_GROUPS` / `*_LEAKS` / `*_FAQ` consts.

| Component | Role & how to reuse |
|---|---|
| `RevenueHero.tsx` | Hook + founder card. **Props:** `eyebrow`, `title`, `titleAccent?` (optional muted continuation), `lede`, `primaryCta`, **`founder?`** (the spec-card: `{name, src, caption, specs:[{label,value}]}`), `selfQualifiers?`, `videoUrl?` (reserved VSL slot), `anchors?`. Headline resized to ~56px full-contrast (was 96px two-tone). |
| `flow-concepts/FlowBlock.tsx` | The mechanism beat ("You've been sold pieces. I run the whole flow."). 3 pillar **icon badges** (search/phone/return-loop) + a dashed **Retain→Bring return-arc** (desktop-only, `sm:` gated) + the trust line. **Server component — no scroll animation.** Reads `PILLARS` from `flow-concepts/data.ts`. |
| `PlanByPillar.tsx` | The plan: 5 steps grouped under the 3 pillars. **Props:** `id`, **`groups?`**, **`prove?`** (defaults are roofing/home-services; pass per-vertical groups). Pillar icons head each group; step cards carry a **flat 1–5 number** computed from group offsets (pure, no render-time mutation — see the `starts` array). |
| `pillar-icons.tsx` | Shared `PillarIcon` (+ `BringIcon`/`ConvertIcon`/`RetainIcon`). Used by BOTH FlowBlock and PlanByPillar so the same mark = the same pillar. |
| `TheLeak.tsx` | The villain (stacked bar + 3 stat cards). Props: `eyebrow/headline/intro/leaks/closer` (defaults are roofing). Default headline de-jargoned to "…everything after the phone rings." Bar proportions labelled "illustrative." |
| `TwoRevenueLines.tsx` | **"How I report it"** (renamed from "Proof"). Dark, `glow="strong"`. The report split (media-driven vs system-driven) + the plain-words definition + a `[PROOF-SLOT]` for a real dashboard image. |
| `Guarantee.tsx` | The day-90 promise. **`abut?` prop** (opt-in): when true, `glow="none"` + a `-mt-12 md:-mt-16` pull so it reads as one dark field with the report above. **Only pass `abut` where the guarantee directly follows the dark report** (pillar + all 4 verticals do). |
| `RevenuePricing.tsx` | Published model + terms, **no public $ figure** (audit-delivered). The leak-vs-price anchor line was cut (unfalsifiable). |
| `AuditCTA.tsx` | The close — embeds `RevenueLeakAuditForm`. Every "Book a Revenue Leak Audit" CTA scrolls to `#audit`. |
| `Seasonality.tsx` | Home-services-only storm-surge reassurance. `tone="paper"` (a tonal break from the surface plan above it). |
| `Compliance.tsx` | Dental/medical-only HIPAA/BAA reassurance. `tone="paper"`. **BAA/HIPAA language is intentionally KEPT here** — that buyer expects it (per the claims library). |
| `FounderNote.tsx` | A larger founder block used by `full-preview` only — distinct from the hero's compact `founder` spec-card. |

**Shared layout:**
- `components/layout/SectionRail.tsx` — the section primitive. `tone` = `paper`/`surface`/`dark`; `glow` = `default`/`strong`/`quiet`/`none` (dark only); `size` = `sm`/`md`/`lg`. The light/dark rhythm comes from tone alternation, not chrome. `cn` is **plain string concat (no tailwind-merge)** — don't rely on className overriding the size padding; use margins for adjustments.
- `components/layout/FooterSwitch.tsx` (client) + `RevenueFooter.tsx` (server). `app/(site)/layout.tsx` renders `<FooterSwitch full={<Footer/>} slim={<RevenueFooter/>} />`. On `/revenue-engine/*` it serves the **slim local-service NAP footer**; everywhere else the industrial "Engineered to be cited." mega-footer. Both footers render server-side and are passed as props (so neither becomes a client component). ⚠ Caveat: Next serializes BOTH footers into the RSC flight payload, so `grep`-ing the HTML for footer copy is unreliable — verify which renders **visually**.

**Gated graphical assets (built, NOT on live pages):** `leak-concepts/Concept3Calculator.tsx`
(the his-own-numbers leak calculator) and `leak-concepts/Concept4BeforeAfter.tsx` ("Same lead,
two endings") are data-driven and powerful, but used only on `/revenue-engine/full-preview/` and the
internal showcase pages. They are **claims-gated** (their `leak-concepts/data.ts` cites unsourced
stats — see §8) and are **Increment 3** (§9).

---

## 5. Canonical page composition (apply this to any new RE page)

```
<div className="h-1.5 bg-brand-600" />            // top brand rule
RevenueHero (+ founder card)                      // light (paper)
TheLeak                                           // light (surface)
<div id="flow"><FlowBlock /></div>                // dark
PlanByPillar id="how" groups={…} prove={…}        // light (surface)
[Seasonality | Compliance]  (vertical-specific)   // light (paper) — tonal break; omit if none
TwoRevenueLines id="prove"                        // dark, glow strong   ("How I report it")
Guarantee id="guarantee" abut                     // dark, glow none, abutted
RevenuePricing id="pricing"                       // light
FAQ                                               // light
AuditCTA id="audit"                               // dark, size lg
// slim footer auto-applied via FooterSwitch
```

Anchors used by the hero nav: `#leak #flow #how #prove #pricing #faq #audit` (+ `#seasonality`
on home-services, `#compliance` on dentists/medical). **Order matters:** the report's closer
("if it doesn't clear the fee, the next section is for you") hands into the Guarantee, so the
guarantee must directly follow the report; pricing comes after (risk reversed before the price).

Per-vertical specifics already implemented:
- **home-services** — roofing/HVAC/plumbing/electrical; uses the PlanByPillar default groups; `Seasonality`.
- **dentists** — `DENTAL_GROUPS`; `Compliance` (HIPAA/BAA kept).
- **medical** — `MEDICAL_GROUPS` (elective/aesthetic); `Compliance`.
- **local-retail** — `RETAIL_GROUPS`; no reassurance section (plan → report directly).

---

## 6. The Sales HQ workspace (`/sales/*`) — earlier on this branch

A **private, password-gated, internal** cold-call cockpit (NOT customer-facing). Open on localhost;
in prod it `notFound()`s unless `SALES_ENABLED=true`, then shows an in-place login (signed httpOnly
cookie). Env (local only, `.env.local`): `SALES_ENABLED`, `SALES_PASSWORD`, `SALES_SESSION_SECRET`.

- Routes: `app/sales/{page,playbook,psychology,learn,drill,metrics,followups,cadence,compliance}`.
- Content as typed data: `lib/sales/playbook/*` (3 tracks + 39-card objection library), `lib/sales/learn/*`, `lib/sales/psychology.ts`.
- Components: `components/sales/*` (cockpit, drill, learn, metrics, followups).
- Gate: `app/sales/layout.tsx` + `lib/sales/auth.ts` + `app/api/sales/{login,logout}/route.ts`.
- `components/integrations/PublicOnly.tsx` keeps tracking/consent/chat OFF `/sales`.
- Docs: `docs/strategy/sales/00`–`10` + `_claims-library.md`. `app/robots.ts` disallows `/sales/`.

The guarantee-wording reconciliation (commit `10382f0`) touched the **docs** here (script/storyboard/
spec), not the rendered cockpit — the cockpit's typed data was already clean.

---

## 6b. Other surfaces in the same diff range (heads-up)

The `a4acf25~1..HEAD` range also touches surfaces **outside** the RE cluster + Sales HQ — mostly from
the `0bef773` checkpoint and the 3 pre-`a4acf25` commits:

- **`app/(campaign)/`** — a **paid-traffic landing page** (`lp/home-services-revenue-leak/page.tsx`,
  noindex, "Stop losing the jobs you already paid to win"). It has its **own route-group shell**
  (`(campaign)/layout.tsx`): no main nav, **no `FooterSwitch`**, its own minimal footer. It reuses
  `RevenueLeakAuditForm`. Edits to the `(site)` shell/footer/nav do **not** reach it.
- **Homepage / industrial sections** — `components/sections/{HeroProbe,WhoWeServe,AIOverviewMockup}.tsx`
  and `app/(site)/industries/industrial-distribution/page.tsx` were modified (earlier checkpoint /
  pre-work, not part of the RE elevation). A future agent diffing the range will see homepage changes
  unrelated to this session's work.

---

## 7. Build / verify / test

**Commands:** `pnpm dev` (--webpack) · `pnpm build` · `npx tsc --noEmit` (ignore pre-existing
`lib/lead-form/*` Zod errors) · `npx eslint <changed files>`.

**Visual-loop protocol (hard resource rules — the machine OOMs otherwise):** ONE dev server, ONE
browser, screenshots **serial**; analysis fanned out to **≤5 read-only agents** that only `Read` the
PNGs (never launch a browser/server); implementation + screenshotting are serial. "Max effort" = more
iterations, never more browsers/servers.

**Screenshot tooling (untracked scratch in `scripts/`):**
- `_re-shot.mjs <baseUrl> <route> <tag>` → desktop-hero / desktop-full / mobile-full into
  `screenshots/revenue-engine/<tag>/`. ⚠ **It `rmSync`s its output dir first** — if you also want
  section crops in the same dir, run `_re-shot` FIRST, then the section shots.
- `_section-shot.mjs <url> <selector> <out>` → viewport crop scrolled to a selector (e.g. `#flow`).
- `_footer-shot.mjs <url> <out>` → page bottom.
- `_shot-load.mjs <url> <out>` → desktop-full + mobile-full into `screenshots/<out>/` (**committed**,
  not scratch; does NOT rmSync; no hero/section crops).

**Local test URLs** (start `pnpm dev`; site uses trailing slashes):
- Pillar `/revenue-engine/` · home-services / dentists / medical / local-retail under it.
- Footer switch: compare any RE page (slim) vs `/` (industrial "Engineered to be cited.").
- Reference: `/revenue-engine/full-preview/` (noindex), `/revenue-engine/audit-booked/`.
- Internal showcase (noindex, scratch): `/revenue-engine/flow-concepts/`, `/revenue-engine/leak-concepts/`.

---

## 8. Gotchas / landmines

- **Claims discipline:** only stats in `_claims-library.md`, cited (C-01 "47 hours / LeadSync 2026";
  C-05 "as many as 1 in 3" — the hedge is the claim; C-06 estimate/plan close rates = qualitative
  only). **Never fabricate** testimonials/clients/results — use `[PROOF-SLOT]`. No review/rating
  JSON-LD until real reviews exist.
- **Pricing is audit-delivered** — NO public dollar figure for the package. (The old WordPress spec
  `revenue-engine-site-injection-spec.md` still shows a rate card — it is **superseded**; see the
  inject doc's "Resolved decisions.")
- **Guarantee wording:** live pages + the `/sales` script now say **"the revenue the system brings
  back doesn't beat my fee by day 90, I work free until it does."** The internal owned-metric name
  "system-attributed revenue" is retained in strategy docs, bridged to the client phrasing.
- **`Guarantee` `abut` is opt-in** — only pass it where the guarantee follows the dark report. On a
  page where it would follow a light section, the negative-margin pull would mis-overlap.
- **`leak-concepts/data.ts` has UNSOURCED claims** — "42 hours / 23% (HBR 2011)", "42% of local
  clicks (Backlinko)", "5% lift … 25–95% (Bain/HBR)", and "the map pack" jargon. These power the
  gated calculator/before-after. They **must be scrubbed (sourced or cut) with `GATE:HUMAN`** before
  Increment 3 ships. None of them touch the live pages today.
- **Next 16 dev is flaky** under load; `dev` is pinned to `--webpack`. Recover with
  `pkill -f "next dev"; rm -rf .next; pnpm dev`, then poll for stable 200s before screenshotting.
- **`cn` has no tailwind-merge** — class conflicts resolve by stylesheet order, not className order.
  Use margins, not padding overrides, for section spacing tweaks.

---

## 9. What's left / next steps

1. **Push/deploy decision** (§0.1).
2. **Increment 3 — the calculator** (gated): (a) scrub `leak-concepts/data.ts` claims (`GATE:HUMAN`);
   (b) wire `Concept3Calculator` into the leak beat (demote the bar) + `Concept4BeforeAfter`;
   (c) optionally A/B the contrarian hero ("You're not short on leads. You're losing the ones you
   already paid for."). Clamp the calculator's `annual/monthly` to 0 on `NaN`.
3. **RE-INJECT phases C–F** (see `02-revenue-engine-inject.md`): C = nav/homepage injection
   (DP-3 nav decision, homepage RE callout + footer link, cross-links from service pages);
   D = the 8-post content cluster; E = tracking/schema (FAQPage schema, fire `fbq('track','Lead')`
   + CAPI on audit submit, Google Ads conversion, confirm GA4 `generate_lead` fires on
   `/audit-booked/`); F = A/B (pillar hero leak vs flow framing).
4. **Housekeeping:** delete the merged branch after push; consider deleting the internal showcase
   pages (`/revenue-engine/flow-concepts/`, `/leak-concepts/`, `/full-preview/`) once the calculator
   is wired and they've served their review purpose.

---

## 10. Key file map (RE-elevation slice)

| Path | State | What |
|---|---|---|
| `app/(site)/revenue-engine/page.tsx` | M | Pillar — elevated frame, `PILLAR_GROUPS`. |
| `app/(site)/revenue-engine/{home-services,dentists}/page.tsx` | M | Verticals — elevated, per-vertical groups. |
| `app/(site)/revenue-engine/{medical,local-retail}/page.tsx` | A | Verticals — created old-frame in `0bef773`, elevated this session (so `A` vs the pre-branch base). |
| `app/(site)/revenue-engine/{full-preview,flow-concepts,leak-concepts}/page.tsx` | A | Noindex internal references/showcases. |
| `app/(site)/revenue-engine/audit-booked/page.tsx` | A | Audit form destination. |
| `app/(site)/layout.tsx` | M | Wires `FooterSwitch`. |
| `components/sections/revenue-engine/RevenueHero.tsx` | M | + `founder` prop, resized headline. |
| `components/sections/revenue-engine/PlanByPillar.tsx` | A | The plan (icons + 1–5 numbering). |
| `components/sections/revenue-engine/pillar-icons.tsx` | A | Shared pillar icons. |
| `components/sections/revenue-engine/flow-concepts/FlowBlock.tsx` (+ `data.ts`) | A | The mechanism beat. |
| `components/sections/revenue-engine/{TheLeak,TwoRevenueLines,Guarantee,RevenuePricing,Seasonality,Compliance}.tsx` | M | Back-half + reassurance components. |
| `components/sections/revenue-engine/{EngineVsFuel,HowItWorks,FiveSteps,GetFound}.tsx` | **D** | Deleted (replaced by FlowBlock/PlanByPillar). |
| `components/sections/revenue-engine/leak-concepts/*` | A | Gated calculator + before/after (Increment 3). |
| `components/layout/{FooterSwitch,RevenueFooter}.tsx` | A | Route-aware footer. |
| `components/forms/RevenueLeakAuditForm.tsx`, `app/api/revenue-leak-audit/route.ts`, `lib/lead-form/*` | A | Custom audit funnel (not GHL). |
| `app/(campaign)/layout.tsx` + `lp/home-services-revenue-leak/page.tsx` | A | Paid-traffic LP (noindex); own shell, no `FooterSwitch`; reuses the audit form. |
| `public/artur-shepel.jpg` | A | Founder photo (used by the hero spec-card). |
| `docs/strategy/multi-vertical-pivot/03-pillar-elevation-strategy.md` | A | The elevation strategy. |
| `docs/strategy/sales/_claims-library.md` | A | Approved Claims Library. |

---

*Authored 2026-06-23 (Claude, Opus 4.8) at the end of the elevation session. Everything described is
committed to local `main`; nothing is pushed. The elevation strategy doc (§1) is the single best
companion to this handoff.*
