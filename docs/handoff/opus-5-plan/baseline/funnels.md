# Baseline — funnel inventory

**Measured:** 2026-07-24 at commit `dd66f3c` (local build incl. probe v2) · **Mapped by:** opus-5 (phase 0 agent, direct read of every page component, CTA href, form handler, and API route). Indexability from per-page `metadata.robots` + `lib/sitemap/registry.ts` + `app/robots.ts`.

This is the map the flow/UX/SEO lenses audit against. The **Flags** section at the end lists candidate defects — phase 1 owns turning them into ledger rows with failure scenarios; nothing here was fixed.

---

## Global facts

| Fact | Evidence |
|---|---|
| `app/robots.ts` blocks only `/api/`, `/studio/`, `/dev/`, `/sales/`, `/strategy/`. Everything else crawlable unless the page exports `robots:{index:false}`. | `app/robots.ts:19` |
| Sitemap is a hand-maintained static registry, not a crawl. Indexable-but-unregistered = "indexable, not submitted". | `lib/sitemap/registry.ts:60-107` |
| The five registered lead-gen landing pages: `/unlock-growth-audit/`, `/future-proof-your-seo/`, `/book-growth-call/`, `/constraint-sprint/`, `/catalog-snapshot/`. | `registry.ts:101-107` |
| `FinalCTARail` closes the homepage AND `/services/`, `/industries/`, `/book-growth-call/`, `/unlock-growth-audit/`, `/future-proof-your-seo/`, `/constraint-sprint/`, `/catalog-snapshot/`, `/revenue-engine/` — always the same two doors: `/book-growth-call/` + `/revenue-engine/`. | `components/sections/FinalCTARail.tsx:36,58` |
| **No GHL/GoHighLevel/LeadConnector embed exists anywhere.** The Revenue-Engine audit is a native form posting to `/api/revenue-leak-audit`. (Strategy docs describe a GHL embed; code disagrees.) | repo-wide grep |
| Calendly is env-gated: `/book-growth-call/` renders `CalendlyEmbed` only when `NEXT_PUBLIC_CALENDLY_URL` is set, else a `LeadForm`. Two funnels ship from one URL depending on env. | `components/sections/book-call/BookCallHero.tsx:17,84-98` |

## Funnel 1 — Industrial (home → services/industries → `/book-growth-call/`)

| Step | URL | CTA text | Target | Indexable |
|---|---|---|---|---|
| 0. Global header | any | `Book a Growth Call` | `/book-growth-call/` | n/a (`lib/navigation.ts:53-56`) |
| 1. Hero lane chip | `/` | `Industrial` → `See the industrial playbook` | `/industries/industrial-distribution/` | Yes (`HeroProbe.tsx:40-45,171-190`) |
| 2. Industries card | `/` | `See the industrial playbook` | `/industries/industrial-distribution/` | Yes (`WhoWeServe.tsx:110-112`) |
| 3. Goal index escape | `/` | `See every part of the engine` | `/services/` | Yes (`GoalIndex.tsx:193-199`) |
| 4. Evidence | `/` | `Book a Growth Call` | `/book-growth-call/` | Yes (`Evidence.tsx:105-110`) |
| 5. Signals | `/` | `Industrial readiness audit` | `/unlock-growth-audit/` | Yes (`Signals.tsx:129-140`) |
| 6. Home close | `/` | `Book a Growth Call` | `/book-growth-call/` | Yes (`FinalCTARail.tsx:36-52`) |
| 7a. Industries hub | `/industries/` | `See the industrial playbook` | `/industries/industrial-distribution/` | Yes (`IndustriesShowcase.tsx:44-45`) |
| 7b. Services hub | `/services/` | **no hero CTA** — chips + anchors only | `/services/{slug}/`, `#engine`… | Yes (`ServicesHubHero.tsx:55-90`) |
| 8. Services § Engagement | `/services/` | `Book a Growth Call` | `/book-growth-call/` | — (`EngagementShapes.tsx:104-110`) |
| 9. Industrial pillar hero | `/industries/industrial-distribution/` | `Book a Growth Call` / `Or get a written diagnostic first` | `/book-growth-call/` / `/unlock-growth-audit/` | Yes (`…/page.tsx:358-374`) |
| 10. On-ramp cards | same | `Book a Growth Call` / **`Start with a Sprint`** | `/book-growth-call/` / **`/book-growth-call/`** | — (`…/page.tsx:872-898`) |
| 11. **Conversion A** | `/book-growth-call/` | Calendly widget, or form `Book my call` | Calendly / `POST /api/lead` → `/unlock-growth-audit/thank-you/` | Yes (`BookCallHero.tsx:84-98`) |
| 12. FAQ escape | `/book-growth-call/` | `free 15-minute Growth Audit` | `/unlock-growth-audit/` | — (`page.tsx:107-115`) |
| 13. Close | `/book-growth-call/` | `Book a Growth Call` (**self-link**) + `Revenue Leak Audit` | self + `/revenue-engine/` | — (`page.tsx:142`) |
| 14. **Conversion B** | `/unlock-growth-audit/` | `Book my free audit` ×2 | `POST /api/lead` → thank-you | Yes (`AuditHero.tsx:71-78`, `AuditFormSection.tsx:73-80`) |
| 15. Close | `/unlock-growth-audit/` | `Book a Growth Call` + `Revenue Leak Audit` | `/book-growth-call/`, `/revenue-engine/` | — |
| 16. Terminal | `/unlock-growth-audit/thank-you/` | `Read recent insights` / `Browse guides` | `/category/blog/` / `/guides/` | **No** (noindex,nofollow) |

## Funnel 2 — Revenue Engine (home → pillar/verticals → leak audit)

| Step | URL | CTA text | Target | Indexable |
|---|---|---|---|---|
| 1. Hero lane chips | `/` | `See it for medical & aesthetics` / `…home services` / `…consumer brands` | `/industries/medical-aesthetics/` · `/industries/home-services/` · `/industries/consumer-brands/` | Yes (`HeroProbe.tsx:46-62`) |
| 2. Home close door 2 | `/` | `Revenue Leak Audit` | **`/revenue-engine/`** (pillar — no form there) | Yes (`FinalCTARail.tsx:58-75`) |
| 3. Goal-index escape | `/` | `or how the whole engine runs` | `/revenue-engine/` | — (`GoalIndex.tsx:202-208`) |
| 4. Pillar hero | `/revenue-engine/` | **`Book a Revenue Leak Audit`** | **`/industries/home-services/#audit`** (roofing page, for every vertical) | Yes (`page.tsx:130-134`) |
| 5. Self-qualifiers | same | `I run a dental practice` / `See all industries` | `/revenue-engine/dentists/` / `/industries/` | — (`page.tsx:135-138`) |
| 6. Niche router | same | `See the home services engine` / `See the dental practices engine` / `Sell a product…? See all industries` | respective pages | — (`page.tsx:246-281`) |
| 7. Pillar close | same | `Book a Growth Call` + `Revenue Leak Audit` (**self-link**) | `/book-growth-call/` + self | — (`page.tsx:207`) |
| 8a–c. Verticals | `/industries/home-services/`, `/industries/medical-aesthetics/`, `/revenue-engine/dentists/` | `Book a Revenue Leak Audit` | `#audit` (same page) | Yes |
| 8d. Consumer brands | `/industries/consumer-brands/` | **`Book a Growth Call`** | **`/book-growth-call/`** (industrial funnel — the two funnels merge here) | Yes (`page.tsx:259-261,306,384`) |
| 9. **Conversion** | `#audit` band | headline `Book a free Revenue Leak Audit.` · submit **`Show me the leak →`** · alt `Call or text {phone}` | `POST /api/revenue-leak-audit/` → `/revenue-engine/audit-booked/` | inherits page (`AuditCTA.tsx:28-57`, `RevenueLeakAuditForm.tsx:240`) |
| 10. Terminal | `/revenue-engine/audit-booked/` | `See how the Revenue Engine works` | `/revenue-engine/` | **No** (noindex) |
| — Paid entry | `/lp/home-services-revenue-leak/` | same form + `Show me the leak →` | same handler | **No** (noindex) |

Noindex strays with no funnel role: `/revenue-engine/full-preview/`, `/spine-preview/`, `/leak-concepts/`, `/flow-concepts/`.

## Funnel 3 — Probe (hero scan → report → AI read → unlock → audit door)

| Step | URL | CTA text | Target | Indexable |
|---|---|---|---|---|
| 1. Hero probe form | `/` | `Score this page →` | `POST /api/probe/` (in-place) | Yes (`HeroProbe.tsx:279-286`) |
| 2. Result primary | `/` | **`See the full report →`** | `/ai-readiness/{token}/` | — (`HeroProbe.tsx:375-383`) |
| 3. Result secondary | `/` | `Or skip ahead: get the full audit →` | `/unlock-growth-audit/` | — |
| 4. Report | `/ai-readiness/[token]/` | `Copy link` / LinkedIn share | clipboard / LinkedIn | **No** — noindex, `force-dynamic` (`page.tsx:24,37-40`) |
| 5. AI read intro | same | **`Run the AI read →`** | `POST /api/probe/ai` | — (`AIReadPanel.tsx:139-147`) |
| 6. Gate (free run spent) | same | `That was the free run…` → **`Unlock`** | `POST /api/probe/unlock` → auto-retries read | — (`AIReadPanel.tsx:195-226`) |
| 7. Exhausted (6 runs) | same | `Get the full audit →` | `/unlock-growth-audit/?site={host}&probe={score}` | — (`AIReadPanel.tsx:237-244`) |
| 8. **Rate-limited** | same | **no CTA, no retry — prose only, dead end** | — | — (`AIReadPanel.tsx:248-253`) |
| 9. Unavailable/unreachable | same | `Try again →` | re-POST | — (`AIReadPanel.tsx:255-273`) |
| 10. Report audit door | same | `Get the full audit →` + `Score another page →` | audit + `/` | — (`page.tsx:308-323`) |
| 11a. Error: bot-walled | same | `Get the full audit →` + `Back to the probe →` | audit + `/` | — (`page.tsx:120-128`) |
| 11b. Error: broken token / invalid / rate-limited / unreachable | same | **`Back to the probe →` only** (no cta prop) | `/` | — (`page.tsx:73-108,130-137`) |
| 12. Conversion | `/unlock-growth-audit/` | `Book my free audit` (`?site=` prefills) | `POST /api/lead` | Yes (`LeadForm.tsx:137-145`) |
| — Methodology | `/ai-readiness/methodology/` | links back to `/` only, no conversion CTA | `/` | Yes, in sitemap (`registry.ts:88`) |

**Gate policy:** 1 free AI run, email unlocks 6 total; HMAC httpOnly cookie `ss_probe_gate`, 180-day age (`lib/probe/gate.mjs`, `gate-server.ts`). Token = base64url of the URL; nothing stored server-side; **every report view re-scans**.

## Funnel 4 — the five registered landing pages + two extra lead surfaces

| # | URL | Primary CTA | Handler | Thank-you | Indexable |
|---|---|---|---|---|---|
| 1 | `/unlock-growth-audit/` | `Book my free audit` | `POST /api/lead` | `/unlock-growth-audit/thank-you/` | Yes |
| 2 | `/future-proof-your-seo/` | `Get the checklist` → submit **`Get my protection plan`** | **NONE — client-side `console.log` stub** (F-004) | `/unlock-growth-audit/thank-you/` | Yes |
| 3 | `/book-growth-call/` | Calendly or `Book my call` | `POST /api/lead` | `/unlock-growth-audit/thank-you/` | Yes |
| 4 | `/constraint-sprint/` | `Apply for a sprint` | `POST /api/lead` | `/constraint-sprint/thank-you/` | Yes |
| 5 | `/catalog-snapshot/` | `Get the free snapshot` ×2 | `POST /api/lead` | `/catalog-snapshot/thank-you/` | Yes |
| + | `/full-growth-quote/` | 3-step form | `POST /api/full-growth-quote/` | own thank-you | **No** (`index:false,follow:true`) |
| + | `/contact-me/` | `Send my details` | `POST /api/lead` | **`/unlock-growth-audit/thank-you/`** | Yes (`registry.ts:78`) |

## API routes — what happens to a submission

| Route | Destination | Turnstile | Zod | Rate limit |
|---|---|---|---|---|
| `POST /api/lead` | Turnstile → HubSpot Forms → Resend → GA4 MP events. No Sanity. **No channels configured → `console.log` + `ok:true`** | env-gated (`submit.ts:33-45`) | Yes | `lib/rate-limit.ts` 5/10min |
| `POST /api/revenue-leak-audit` | same shape, flat GA4 `value:220`; HubSpot form id is `HUBSPOT_AUDIT_FORM_ID ?? HUBSPOT_FORM_ID` ([submit-audit.ts:48](../../../lib/lead-form/submit-audit.ts#L48)) | env-gated | Yes | same |
| `POST /api/full-growth-quote` | same + auto-ack email to lead; generic `submit-failed` errors | env-gated | Yes | same |
| `POST /api/probe` | fetch + score, nothing persisted | **No** | **No** (typeof + SSRF guard) | `limits.mjs` probe: 30/h,100/d per IP, no global |
| `POST /api/probe/ai` | re-fetch + re-score + Claude (`claude-haiku-4-5` default, `PROBE_AI_MODEL` override); gate cookie rewritten | **No** | **No** | gate + ai: 6/h,10/d per IP, **200/d global** |
| `POST /api/probe/unlock` | best-effort HubSpot contact + Resend; unlock regardless of delivery outcome; body admits "email is UNVERIFIED" | **No** | **No** (one regex) | unlock: 5/h,20/d per IP, 100/d global |

DataForSEO lookups: separate global ledger 500/day (`lib/probe/domain.ts:74-77`).

---

## Flags (candidate defects for phase 1 — not yet ledger rows unless numbered)

**Stubs / handlers:**
1. `/future-proof-your-seo/` form is a stub; page promises "checklist arrives instantly", nothing is sent = **F-004** (already CONFIRMED).
2. All three lead routes return 200 + thank-you when no delivery channel is configured = **F-014** (opened in phase 0).
3. Turnstile is opt-in per env on every form — unset secret = no captcha server-side, silently.
4. Probe routes have no schema validation and no Turnstile; `/api/probe/unlock` creates HubSpot contacts off one regex.

**CTA ↔ landing mismatches:**
5. `Start with a Sprint` (industrial on-ramp) → `/book-growth-call/`, not `/constraint-sprint/`.
6. Homepage close `Revenue Leak Audit` ("About 20 minutes…") → `/revenue-engine/` pillar which has **no form**.
7. `/revenue-engine/` main CTA `Book a Revenue Leak Audit` → `/industries/home-services/#audit` — a dental/med-spa visitor lands on "Roofing · HVAC · plumbing" with home-services leak options.
8. `/industries/consumer-brands/` is pitched as a Revenue-Engine vertical but converts into the industrial funnel (`Book a Growth Call`); the two funnels the code insists must not merge, merge here.
9. Four forms (`book-growth-call` call booking, `contact-me`, `future-proof` checklist, audit) all terminate on `/unlock-growth-audit/thank-you/`, which reads "Audit is being prepared… expect the written diagnosis within 24 hours" — wrong promise for three of the four.
10. The action is named three ways along one path: `Book a Revenue Leak Audit` → heading `Get your free Revenue Leak Audit` → button `Show me the leak →`.

**Self-referential closes:**
11. `FinalCTARail` offers the current page as a next step on `/book-growth-call/` and `/revenue-engine/`.
12. All lead-gen landing pages close with `FinalCTARail`, whose two doors are *other* offers — the page's own conversion is not one of them.

**Dead ends:**
13. AI-read rate-limited state: prose only, no retry, no CTA (`AIReadPanel.tsx:248-253`).
14. Three of four probe error states drop to `/` with no conversion offer (only bot-wall gets the audit door).
15. `/unlock-growth-audit/thank-you/` — terminus for four funnels; only links: blog + guides. No booking, no case studies.
16. `/constraint-sprint/thank-you/` — one link, to the blog, for a $12–24k applicant.
17. `/ai-readiness/methodology/` — indexable, in sitemap, zero conversion CTA (may be deliberate as authority page — check known-deliberate escape hatch).
18. `/services/` hub hero has no primary CTA; first conversion is below the fold in `EngagementShapes`.
19. `/industries/` hub has no conversion CTA of its own.

**Indexability / attribution:**
20. `/full-growth-quote/` noindex but targeted by CTAs from indexable pages (deliberate per `registry.ts:56-57` comment — verify).
21. `/api/probe/unlock` records HubSpot `pageUri` `https://salesolution.net/ai-readiness/` — **a URL that 404s** (no index route exists).
22. `PROBE_GATE_SECRET` hardcoded fallback = **F-001** (already CONFIRMED).
23. Two rate-limiting systems with no shared budget; unlock (HubSpot-writing) bounded by probe budget, not lead budget.
