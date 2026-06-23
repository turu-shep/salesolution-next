# Handoff — Homepage multi-vertical repositioning + paid landing-page funnel

*Session handoff. Scope: the homepage repositioning, the services-section
rethink, the paid-ads strategy docs, and the first paid landing page (home
services). Written so the work can be resumed cold.*

All code below is **already committed** (commits `a1e2654` multi-vertical pivot
checkpoint, `e9b2af8` GoalIndex, `0bef773` Revenue Engine cluster). Working tree
is clean.

---

## TL;DR — what this session did

1. **Repositioned the homepage** from industrial-only to a **multi-vertical
   front door** with a "one leak, two faces" spine and a **split, keep-both-doors**
   architecture (the two funnels never merge).
2. **De-commoditized the services section.** Replaced the flat "six services" menu
   with the **Intent Index** (a "what do you want" goal picker). Moved the two
   industrial service concepts to the industrial hub as an **A/B still to be picked**.
3. **Wrote the paid-ads + landing-page strategy** (3 docs) — including the
   traffic-source → funnel matrix and the conversion-tracking launch blockers.
4. **Built the first paid landing page** (home services "stop the leak") end to
   end: nav-stripped route group, native audit form, API + channel orchestration,
   noindex thank-you (which also gives RE-203 its conversion endpoint).
5. **Made the platform call:** HubSpot for the industrial pipeline + **GHL for the
   Revenue Engine** delivery (RE-203 should be built in GHL). Recommendation
   accepted in principle; not yet implemented.

---

## Standing constraints (do not violate)

- **Two funnels, DO NOT MERGE.** Industrial → Book a Growth Call (`/book-growth-call/`)
  / written audit (`/unlock-growth-audit/`). Local-service (Revenue Engine) →
  Revenue Leak Audit (`/revenue-engine/*`).
- **Honesty / no-guarantee on the industrial side.** Only the Revenue Engine has a
  falsifiable day-90 guarantee — never invent one for industrial.
- **ICP language:** owners, not marketers. Industrial measures in quotes/RFQs/revenue
  (not ARR/pipeline/CTR/coverage); no cold "schema/GEO/CTR". Run the **humanizer** on
  customer-facing copy. SSOT: `.agents/product-marketing-context.md`.

---

## What changed, by area

### 1. Homepage — multi-vertical ("one leak, two faces")
Section order (`app/(site)/page.tsx`): Hero → DemandSystem → ProblemShift →
WhoWeServe → FrameworkTimeline → **GoalIndex** → EngagementModel → Evidence →
Operator → Signals → FAQ → FinalCTARail.

- `components/sections/HeroProbe.tsx` — universal promise H1 ("Win the customers you
  already pay for") + both-leaks subhead + **two lane CTAs** (industrial hub / Revenue
  Engine). Probe/mockup kept as discovery-side proof.
- `components/sections/ProblemShift.tsx` — rebuilt as **two faces**: discovery leak
  (industrial, the AI/clicks chart) + response leak (local-service, the 1-in-3 /
  47-hr stats), each with its own door.
- `components/sections/WhoWeServe.tsx` — audience splitter. **Now four cards**
  (Industrial · Medical & aesthetics · Home & local services · Retail & consumer
  brands) routing to their hubs. *(Expanded from 3 → 4 after the build; see open
  item #6.)*
- `components/sections/Signals.tsx` — checklist broadened to both leaks; dual door.
- `components/sections/FinalCTARail.tsx` — one door per funnel.
- `components/sections/Operator.tsx`, `FAQ.tsx` — de-industrialized (FAQ Q4 → "Does
  this work for my business?").
- `app/(site)/page.tsx` — cross-vertical meta description.

### 2. Services section — de-commoditized
- **`components/sections/GoalIndex.tsx`** (NEW) — the **Intent Index**: six
  owner-voice "I want to ___" rows, each routing to one funnel per click (industrial =
  brand-blue, Revenue Engine = accent-orange). Funnel carried in a mono **tag** + a
  sentence-case label; 01–06 ordinals; row hover. All links in static HTML (crawlable).
  Visual pass done (5-agent analysis loop). Locked decisions: keep 6 goals · G2 →
  editorial-authority · keep WhoWeServe (two self-selects stay distinct by axis +
  rows-vs-cards format).
- **`components/sections/ServicesByLeak.tsx`** (NEW, Option A "Two leaks → the fix")
  and **`components/sections/ServicesSystem.tsx`** (NEW, Option B "The Answer Engine")
  — the two industrial service concepts. **Moved to the industrial hub**
  (`app/(site)/industries/industrial-distribution/page.tsx`) as an amber-banner-labeled
  **A/B comparison — NOT YET DECIDED** (see open item #3).
- Old `components/sections/ServicesTabs.tsx` — retired from the homepage + industrial
  hub. **Still used by `/services/ai-seo/`**, so do not delete it.

### 3. Paid-ads strategy — `docs/strategy/ads/landing-pages/`
- `README.md` — SEO-page ≠ paid-LP; model A (ad→matched LP) vs B (hub self-select);
  channel fit (Meta = local / Google Search = industrial); LP hygiene; sequencing;
  blockers (RE-203, TCPA/10DLC, dental pixel route-gating).
- `ad-angle-matrix.md` — the 6 goals × verticals as a campaign map; build order;
  Meta-by-temperature note.
- `channel-funnel-playbook.md` — traffic-source → funnel matrix; Meta verdict
  (instant forms cold + LP warm, conditional on GHL); Google Search / cold-email /
  retargeting specifics; **conversion-tracking launch blockers**; compliance.

### 4. Home-services paid LP (the build)
- `app/(campaign)/layout.tsx` (NEW) — nav-stripped route group for paid LPs (logo +
  click-to-call only; inherits root analytics/consent).
- `app/(campaign)/lp/home-services-revenue-leak/page.tsx` (NEW) — the LP, **noindex**,
  single funnel, Revenue-Engine voice, loss-aversion (G5+G4), day-90 guarantee,
  hero tap-to-call. URL: `/lp/home-services-revenue-leak/`.
- `components/forms/RevenueLeakAuditForm.tsx` (NEW) — native form, **home-services
  fields** (name, mobile, business, trade, "where it hurts", optional email/website) —
  not the industrial e-commerce schema.
- `lib/lead-form/revenue-leak-audit-schema.ts` + `lib/lead-form/submit-audit.ts` (NEW)
  — dedicated Zod schema + channel orchestration (Turnstile + HubSpot + Resend,
  env-gated, no-ops cleanly in dev).
- `app/api/revenue-leak-audit/route.ts` (NEW) — POST handler (rate-limit + validate +
  submit + GA4 Measurement-Protocol failsafe).
- `app/(site)/revenue-engine/audit-booked/page.tsx` (NEW) — **noindex** conversion
  thank-you. This is the page **RE-203** needs; any RE audit form should redirect here.
- `lib/analytics.ts` — added `revenue_leak_audit_form` to the `FormId` union (clean
  per-funnel measurement).

---

## Open decisions / next steps (prioritized)

1. **RE-203 — build in GHL (hard blocker for ALL local-service paid).** The GHL
   form + calendar + instant SMS/auto-text-back is unwired (`submit-audit` =
   Turnstile + HubSpot + Resend only). Route the audit LP into GHL (optional HubSpot
   mirror). On-site `components/sections/revenue-engine/AuditCTA.tsx` still interim-
   redirects to `/book-growth-call/` — repoint at the real flow once GHL is live.
2. **Conversion tracking before any spend (launch blockers).** (a) No Meta **Lead**
   event — `lib/analytics.ts` `track()` only dispatches to gtag, never `fbq`; add
   `fbq('track','Lead')` on submit + a server **CAPI Lead** in the audit route
   (dedupe on `submissionId`). Confirm `NEXT_PUBLIC_META_PIXEL_ID` set. (b) **No
   Google Ads conversion fires anywhere** — import GA4 `generate_lead` as an Ads
   conversion or add a `gtag('event','conversion')` on `audit-booked`. Verify in
   platform before spend.
3. **Services A/B on the industrial hub.** Recommendation: **Option B (Answer
   Engine)** — Option A ("two leaks") duplicates that page's existing "two sides" (§2)
   + "why the AI skips you" (§3). When decided: delete the loser, remove the amber
   banners, point the `#services` anchor at the winner.
4. **Compliance.** TCPA / A2P-10DLC express-consent copy on every SMS capture
   surface (LP + Meta instant form) + a registered 10DLC campaign. For a future
   dental/medical LP: the Meta Pixel mounts via the **shared root layout**, so it
   must be **route-gated out of the pixel** (not just snippet-omitted); server-side,
   PHI-stripped, BAA-covered only.
5. **Env wiring (makes the LP actually deliver leads).** `RESEND_API_KEY` +
   `RESEND_TO_EMAIL` (and/or `HUBSPOT_PORTAL_ID` + `HUBSPOT_AUDIT_FORM_ID`),
   Turnstile keys, `NEXT_PUBLIC_META_PIXEL_ID`, the Google Ads conversion id, and
   the GHL account. Until set, leads only log server-side.
6. **Reconcile the 4th/expanded verticals.** WhoWeServe now routes Medical &
   aesthetics → `/revenue-engine/medical/` and Retail → `/revenue-engine/local-retail/`.
   But GoalIndex G5 + the ad-angle matrix still reference `/revenue-engine/dentists/`.
   **Verify** `/revenue-engine/dentists/` still resolves (or redirects to `/medical/`)
   and extend: GoalIndex routing, the ad-angle matrix, and future LPs to cover
   medical/aesthetics + retail (currently only home-services has an LP).
7. **Social proof on the LP** — a recovered-revenue figure / 1–2 reviews / license +
   metro / founder face. Lifts every channel, decisive for cold Meta. **Use real,
   approved proof — do not fabricate.**
8. **Platform split implementation** — wire the Revenue Engine funnel to GHL while
   keeping HubSpot for the industrial pipeline (env-gated, additive). See the platform
   recommendation summarized below.

---

## Platform decision (HubSpot vs GHL) — recommendation

Not either/or — right tool per layer:
- **Industrial pipeline (consultative B2B) → HubSpot.** Keep it; the lead form
  already posts there.
- **Revenue Engine (your own local-service capture + client delivery) → GHL.** It's
  built for multi-client local-service ops: white-label sub-accounts, SMS-first +
  10DLC, missed-call-text-back, booking, reviews, client dashboards, flat pricing.
  RE-203 belongs here.
- The audit LP should post into GHL for the RE funnel (mirror to HubSpot optional).
  Additive, env-gated — nothing breaks before GHL is wired.

*(Consider saving this as a standalone stack-decision note in `docs/strategy/` — not
yet created.)*

---

## How to run / verify

- `npm run dev` (pinned `--webpack`; if it throws `module factory`/`routes-manifest`,
  `pkill -f "next dev"; rm -rf .next; npm run dev`).
- `npx tsc --noEmit` — currently clean (ignore pre-existing `lib/lead-form/*` Zod
  notes if any surface).
- Key URLs: `/` (homepage + Intent Index) · `/industries/industrial-distribution/`
  (the A/B) · `/lp/home-services-revenue-leak/` (the LP, noindex) ·
  `/revenue-engine/audit-booked/` (thank-you).
- LP form smoke test (dev, no channels → 200): `curl -X POST localhost:3000/api/revenue-leak-audit/`
  `-H 'Content-Type: application/json' -d '{"fullName":"Test","phone":"5615551234","company":"Test","trade":"roofing","leak":"missed-calls"}'`
- Visual loop tooling: no Playwright MCP — `npm i --no-save playwright` + a temp
  script through ONE browser, serial (see `scripts/_visual-check.mjs`).

## Pointers
- Positioning/voice SSOT: `.agents/product-marketing-context.md`
- Ads strategy: `docs/strategy/ads/landing-pages/` (README → matrix → channel playbook)
- Pivot blueprint: `docs/strategy/multi-vertical-pivot/00-phase-plan.md`
- NAP/identity: `lib/business.ts` · routes: `lib/navigation.ts` · analytics: `lib/analytics.ts`
