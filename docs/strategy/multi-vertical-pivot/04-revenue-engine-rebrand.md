# Revenue Engine rebrand — architecture + mocks

> Status: DRAFT for founder review (set 2026-06-28). The unified "we build Revenue Engines" spine, one engine per niche, naming "Revenue Engine for [niche]". Services become the shared **cylinder** library. See memory `revenue-engine-unified-brand`.

## 1. Architecture (v2 — two-axis, faceted taxonomy)

> Supersedes the prefix-by-funnel IA earlier in this doc's history (two URL prefixes, `/industries/*` for consultative and `/revenue-engine/*` for guaranteed). That model leaked the commercial motion into the URL. The mocks (sections 2-3) are kept; only the architecture changes.

One spine, one phrase: "We build Revenue Engines." Naming convention: "Revenue Engine for [niche]." The homepage is the umbrella (hero + chip picker + niche router); there's no separate index page to build or rank. The six `/services/*` pages are the shared **cylinder** library every niche references by deep-link. What changed in v2: how niches are filed, found, and sold now runs on two independent axes, and the URL went flat.

### The two-axis model

A niche carries two things, and they move independently. Keep them apart or the IA collapses back into the old industry-equals-funnel mistake.

**Axis 1 — Discovery taxonomy (how a visitor finds the niche).** Industries -> Niches, **many-to-many**. Industries are facets, not exclusive folders. A niche is **one canonical page** with **one primary industry**, cross-listed under every other industry it touches. Industry pages are faceted pillar hubs that link down into the niches; they don't own them. Pillar authority comes from internal linking, not URL nesting.

**Axis 2 — Commercial motion (how the niche sells).** Exactly one per niche. The motion sets the commercial model: the guarantee, the voice, the price disclosure, the primary CTA. It is page *content*, decided by the niche's **dominant revenue motion**, not by the industry label on the breadcrumb. It never appears in the path.

These don't move together. A niche can sit in an industry whose other niches sell one way and still sell the other way itself. The motion travels with the niche, not the folder. The breadcrumb tells you where a niche was filed for discovery; it does not tell you how the niche sells. If you ever reach for the guarantee because a niche is "medical," or drop it because a niche is "industrial," stop and check the motion. The motion is the only input to the commercial model.

### The four industries

| Industry | Motion -> commercial model | Example niches |
|---|---|---|
| **Home services** | book jobs -> day-90 guarantee · voice "I" · CTA Revenue Leak Audit | Roofing, HVAC, plumbing, electrical, garage doors, landscaping, pest control, solar |
| **Medical & aesthetics** | book appointments -> day-90 guarantee + HIPAA · voice "I" · CTA Revenue Leak Audit | Dentists, orthodontists, med spas / cosmetologists, dermatology, plastic surgery, chiropractic, optometry, vet |
| **Industrial / technical distribution** | sell product B2B -> no guarantee · voice "we" · published prices + 48h SOW · CTA Book a Growth Call | Hydraulics, fasteners, electrical / MRO, fluid power, automation, safety supply (distributors + manufacturers) |
| **Consumer / DTC brands** | sell product B2C -> no guarantee · voice "we" · published prices + 48h SOW · CTA Book a Growth Call | Jewelry & luxury (lead niche, confirmed), watches, home goods, apparel, specialty retail |

Two of the four run the book-jobs model (guarantee, "I"); two run the sell-product model (no guarantee, "we"). That's a coincidence of the current four, not a rule. The motion is a property of each niche.

### Facets, many-to-many, dual-parent handling

Most niches touch one industry. The ones that touch two or more pick their primary by **dominant revenue motion**, build one canonical page there, and get cross-listed under the others as a facet. A cross-listing is a **link** from the second industry's pillar to the niche's one canonical page, never a second page.

| Dual-parent niche | Touches | Primary (by dominant motion) | Motion -> terms | Cross-listed under |
|---|---|---|---|---|
| Med spas / cosmetologists | Medical & aesthetics, Consumer | **Medical & aesthetics** | book appts -> guarantee + HIPAA where clinical, "I" | Consumer (the aesthetics shopper browsing by brand) |
| Flooring (sell + install) | Home services, Consumer | **Home services** | book jobs -> guarantee, "I" (the money is the installed job, quoted and won like a contractor's) | Consumer (homeowner shopping materials first) |
| Medical-supply distributors | Industrial, Medical & aesthetics | **Industrial / technical distribution** | sell product B2B -> no guarantee, "we", published prices, 48h SOW; **no HIPAA layer**, the buyer is procurement | Medical & aesthetics (a clinic searching its supply category) |
| Local jeweler (storefront) | Consumer, local-service shape | **Consumer / DTC** | sell product B2C -> no guarantee, "we", published prices, 48h SOW; the storefront is a channel, the motion is retail | none yet (no second facet earned) |

**HVAC (residential vs commercial):** one niche, one canonical page. Residential HVAC books jobs through a homeowner who calls; commercial HVAC can drift toward bid contracts. Keep HVAC as a single Home-services niche on the book-jobs model, the dominant motion for the trade, and handle the commercial wrinkle as a page section, not a fork. If a real commercial-HVAC client or real search demand earns it later, it splits into its own niche then and sets its own motion then.

**Worked proof — same industry, opposite models.** A dental practice and a medical-supply distributor both show up under the Medical & aesthetics pillar; a visitor browsing that industry sees both. They sell nothing alike. The dental practice books appointments: day-90 guarantee, HIPAA layer, "I" voice, Revenue Leak Audit. The distributor sells product B2B: no guarantee, "we" voice, published price bands, 48-hour SOW, Book a Growth Call, no HIPAA on the commercial terms. The industry decided where each was findable. The motion decided how each sells.

**Lint guardrail (facets):** a cross-listing is an `<a>` to the canonical niche URL, never a route. Do not scaffold `/industries/medical-aesthetics/medical-supply/` or any nested industry+niche path. One niche, one page, many shelves.

### URL map + nav

A niche carries two things; only one touches the URL. Discovery taxonomy sets the breadcrumb; commercial motion stays in the copy and never appears in the path. So: **flat niche pages, faceted industry pillars, motion in the copy.**

**The rules:**

- **Flat niche URLs.** Every niche is `/revenue-engine/{niche}/`. No industry segment in the path. Page name: "Revenue Engine for [niche]."
- **Canonical page, one primary industry.** Each niche has one canonical URL and one primary industry. The breadcrumb shows the primary industry: `Home > Industries > Medical & aesthetics > Dentists`. Dual-parent niches pick their primary by dominant motion, then cross-list everywhere else.
- **Industry pillars are faceted indexes**, not parents in the path. They live at `/industries/{industry}/`, link **down** into every niche they touch (cross-listed niches included), and carry the industry-level pitch.
- **Authority comes from internal linking, not nesting.** Three link directions build the cluster: pillar -> niches (each pillar lists and links every niche under it), niche -> pillar (breadcrumb + a "part of" line to the primary, plus links to each cross-listed pillar), niche <-> sibling (niches sharing an industry cross-link).
- **One niche, many shelves.** A cross-listed niche is the *same URL* linked from each pillar. No duplicate pages, no thin variants.
- **Cylinders stay put.** The six `/services/*` slugs are frozen (they rank). A niche fires the cylinders that pay back for it and deep-links to each cylinder page for depth.

**Reserved-slug rule (must honor):** flat niche pages sit at the same level as the Sanity-backed top-level catch-all `app/(site)/[slug]/`. A static segment wins over `[slug]`, so a niche slug **permanently shadows** any blog/landing slug of the same name (a Sanity post at `roofing` would go silently unreachable). Niche slugs are **reserved-forever** for niche pages. Maintain a reserved-slug list and guard `generateStaticParams` in `app/(site)/[slug]/page.tsx` to exclude it. Write this into the build standard.

**URL table — umbrella + indexes**

| URL | Role | Status |
|---|---|---|
| `/` | Umbrella. "We build Revenue Engines." Hero + chip picker + niche router. **No industry modifier in H1/title** (brand/category only). | Exists |
| `/industries/` | Cross-industry index. Links to all four pillars. | Exists |
| `/services/` | Cylinder library directory. "Six cylinders. One engine." | Exists |
| `/revenue-engine/` | **Product page** — "the Revenue Engine": what it is, how it works (CAPTURE -> RESPOND -> BOOK -> RECOVER -> PROVE), proof, and a **convert CTA** (dual-router: pick your business -> Growth Call / Leak Audit). Parent of the niche pages; owns "revenue engine" product/system intent. The real "how it works" destination the mislabeled **Framework** menu link should point to. | Exists (repurpose) |

**URL table — industry pillars (build all four now)**

| Industry | URL | Motion -> terms | Status |
|---|---|---|---|
| Home services | `/industries/home-services/` | book jobs · guarantee · "I" · Revenue Leak Audit | NEW (from `/revenue-engine/home-services/`) |
| Medical & aesthetics | `/industries/medical-aesthetics/` | book appts · guarantee + HIPAA · "I" · **dual router** (see CTA rule) | NEW (from `/revenue-engine/medical/`) |
| Industrial / technical distribution | `/industries/industrial-distribution/` | sell product B2B · no guarantee · "we" · Book a Growth Call | Exists (keep slug, reframe) |
| Consumer / DTC brands | `/industries/consumer-brands/` | sell product B2C · no guarantee · "we" · Book a Growth Call | NEW (from `/revenue-engine/local-retail/`) |

**URL table — niche pages (flat; seed set, add the rest lazily)**

| Niche | URL | Primary industry (breadcrumb) | Also listed under | Motion | Status |
|---|---|---|---|---|---|
| Dentists | `/revenue-engine/dentists/` | Medical & aesthetics | — | book appts (guarantee + HIPAA) | Exists (live spine reference) |
| Jewelry & luxury | `/revenue-engine/jewelry/` | Consumer / DTC | Industrial (shared B2B-ecom catalog motion) | sell product (no guarantee) | NEW (lead consumer niche) |

**URL table — cylinder library (slugs frozen)**

| Cylinder | URL | Group |
|---|---|---|
| AI Search & GEO | `/services/ai-seo/` | Bring (gravity well) |
| Catalog AI | `/services/catalog-ai/` | Bring |
| Editorial Authority | `/services/editorial-authority/` | Bring |
| Outbound Email | `/services/outbound-email-marketing-services/` | Bring |
| Website Development | `/services/website-development-design-services/` | Convert |
| Full Growth Ownership | `/services/full-growth-ownership/` | Retain + the whole engine |

**Keyword ownership (lock — prevents same-query collisions on a DR-10 site):**

| Surface | Title / H1 target | Forbidden |
|---|---|---|
| Homepage `/` | brand + category umbrella ("We build Revenue Engines") | any industry modifier |
| Product `/revenue-engine/` | the product + how it works ("the Revenue Engine", "how the revenue engine works") | any industry / niche modifier |
| Industry pillar `/industries/{industry}/` | "{Industry} growth / marketing" | any niche-level modifier (city, trade-action) in H1/H2/title |
| Niche page `/revenue-engine/{niche}/` | "Revenue Engine for {niche}" + job-verb (e.g. "roofing lead recovery", "dental answering that books") | the industry's broad category term |
| Cylinder `/services/*` | cylinder head term ("AI SEO / GEO services", "catalog AI") | niche pages may *describe* a cylinder's effect but must **not** target its head keyword |

**Nav structure (this subsection is the single source for the four pillar hrefs; the remap references it):**

```
Industries            -> /industries/   (dropdown trigger; href is the index)
  Home services             -> /industries/home-services/
  Medical & aesthetics      -> /industries/medical-aesthetics/
  Industrial distribution   -> /industries/industrial-distribution/
  Consumer & DTC brands     -> /industries/consumer-brands/
  ---
  Featured engines: Dentists · Jewelry   (direct links to LIVE niche canonicals only)

Services              -> /services/   (label "Services"; dropdown header "The cylinders")
  Bring     AI Search & GEO · Catalog AI · Editorial Authority · Outbound Email
  Convert   Website Development
  Retain    Full Growth Ownership

Case Studies          -> /case-studies/
Framework             -> /future-proof-your-seo/
Insights              -> /category/blog/   (Articles, Guides, Learning Hub, Glossary, Tools)
Contact               -> /contact-me/
```

- Top-level label is **"Industries"** (the existing `/industries/` index stays the href). Industries are how a cold visitor self-selects; the "Revenue Engine for [niche]" name carries the brand on each page, not in the menu label.
- The dropdown lists the four pillars plus a short "featured engines" row linking the live niche pages directly, so demand pages aren't buried a click under a pillar. Featured-engine links point to **live niche canonicals only** (today: Dentists; Jewelry once built).
- Services dropdown keeps link text "Services" for the cold searcher and adds the header "The cylinders." Cylinders grouped Bring / Convert / Retain.
- **CTA is per-motion, set by the page, not the nav slot.** Sell-product pages show **Book a Growth Call** (`/book-growth-call/`); book-jobs/appointments pages surface **Revenue Leak Audit** on the page. The umbrella and indexes show both, routed by the chip picker.

### Existing-page remap + 301 plan

301s are static, applied at the edge via Next's `async redirects()` in `next.config`, which spreads the `Redirect[]` array exported from `lib/redirects.ts`. Each 301 is a new entry (`{ source, destination, permanent: true }`) under a dated comment. Trailing slashes are canonical — keep the slash on both sides. No middleware exists or is needed.

**Remap table:**

| Current route | Action | New canonical | Note |
|---|---|---|---|
| `/` | leave-alone | `/` | Umbrella. Repoint its section links to the new canonicals. |
| `/industries/` | keep | `/industries/` | Parent index; lists the four pillars. |
| `/industries/industrial-distribution/` | keep (promote) | same | Already at the pillar URL. Reframe as the Industrial pillar (sell product B2B, no guarantee, "we"). No redirect. |
| `/revenue-engine/home-services/` | move + 301 | `/industries/home-services/` | Becomes the Home-services pillar (book jobs, guarantee). |
| `/revenue-engine/medical/` | move + 301 | `/industries/medical-aesthetics/` | Becomes the Medical & aesthetics pillar. Renamed to match the locked industry name. |
| `/revenue-engine/local-retail/` | move + 301 | `/industries/consumer-brands/` | Becomes the Consumer / DTC pillar. **Move + motion flip** (see scrub step). "local-retail" is off-name. |
| `/revenue-engine/dentists/` | keep (reframe only) | `/revenue-engine/dentists/` | Niche, not a pillar. Slug is already the correct flat canonical under v2 — **no rename, no 301.** Reframe breadcrumb to primary industry = Medical & aesthetics; update the page's hard-coded metadata canonical. (See equity note.) |
| `/revenue-engine/` | keep (repurpose) | same | Becomes the **product page** (the Revenue Engine: what it is + how it works + proof + convert CTA, dual-router). Parent of the niche pages. Repoint the **Framework** menu link here from `/future-proof-your-seo/`. |
| `/services/*` (all six) | leave-alone | same | SEO money pages. Frozen. |
| `/revenue-engine/{audit-booked, flow-concepts, leak-concepts, full-preview, spine-preview}/` | leave-alone | same | Functional / preview routes. Out of the organic IA. |
| `/lp/home-services-revenue-leak/` | leave-alone | same | Campaign LP (separate route group). Not in the organic IA. |

**Equity note (narrowed):** the pillar renames are cheap — the `/revenue-engine/*` vertical paths are weeks old with near-zero external links or rankings. **Dentists is the exception.** It is the live spine reference at sitemap priority 0.8 and may already draw GSC impressions, so it is the highest-equity URL in scope. Under v2 its slug (`/revenue-engine/dentists/`) is already the correct flat canonical, so there is **nothing to 301** — only the breadcrumb and the page's hard-coded metadata canonical change. Check live GSC for the URL before touching it; if it has ranking signal, treat the metadata edits as the only change and monitor. Do not apply the blanket "cheap now / near-zero equity" claim to it.

**301s to append to `lib/redirects.ts`:**

```ts
// -- 2026-06-28: multi-vertical IA remap (industry pillars + flat niches) --
// Vertical pages MOVE up to /industries/{industry}/; the old path 301s.
// Niches are already flat — dentists keeps its slug, no redirect.
{ source: '/revenue-engine/home-services/', destination: '/industries/home-services/', permanent: true },
{ source: '/revenue-engine/medical/',       destination: '/industries/medical-aesthetics/', permanent: true },
{ source: '/revenue-engine/local-retail/',  destination: '/industries/consumer-brands/', permanent: true },
```

**Cleanups that ride with every move (a 301 alone leaves self-links pointing at a redirect hop):**

1. **Repoint internal links** to the new canonicals: `lib/navigation.ts` (the Industries dropdown currently points at the OLD `/revenue-engine/{medical,home-services,local-retail}/` — set the four pillar hrefs from the nav subsection above, featured-engine links to live niche canonicals only), `components/sections/{GoalIndex,IndustriesShowcase,WhoWeServe,HeroProbe,ProblemShift}.tsx`, `components/sections/revenue-engine/VerticalFork.tsx`, `components/layout/RevenueFooter.tsx`, and the homepage sections. Grep `revenue-engine/(home-services|medical|local-retail)` and `industries/industrial-distribution` before shipping.
2. **Update the sitemap registry — this is a test gate.** `lib/sitemap/registry.ts` (remove the old `u('/revenue-engine/{home-services,medical,local-retail}/')` entries, add the new `/industries/*` canonicals) **and** `lib/sitemap/registry.reconcile.test.mjs` (its regression pin `assert.ok(registeredPaths.has('/revenue-engine/medical/'))` must change to `/industries/medical-aesthetics/`). Skip this and `pnpm test` fails and the moved pages drop out of `sitemap.xml`.
3. **Update `lib/schema.ts`** breadcrumbs + JSON-LD so they emit the canonical URL, not the redirected one. Dentists' breadcrumb changes to the Medical & aesthetics primary.

**Consumer move is a motion flip — scrub step.** `/revenue-engine/local-retail/` to `/industries/consumer-brands/` is a move **and** a reframing (B2C product, no guarantee, "we"). The current page may carry book-jobs/guarantee "I"-voice copy. When moving it, grep the page for the `Guarantee` import, "day 90", "Revenue Leak Audit", and "I"-voice, and convert it to the sell-product commercial block. The move is not copy-neutral.

**Lazy niches are NOT redirects.** Un-built niches get no URL and no `lib/redirects.ts` entry. The pillar links the un-built niche's **card** to the nearest existing hub or a Growth Call. A niche enters `lib/redirects.ts` and the sitemap registry only when its real page is built. No placeholder 301s — a 301-then-un-301 when a real page lands is messy and can shed accrued equity.

**Sequencing (so nothing 404s mid-flight):**

1. Create the new pillar route dirs and move each page's code (`/industries/{home-services, medical-aesthetics, consumer-brands}/`), reframing each to its pillar role and correct motion (consumer gets the scrub step). Dentists stays put; edit only its breadcrumb + metadata canonical.
2. Add the three 301s above to `lib/redirects.ts`.
3. Repoint all internal links (cleanup 1).
4. Update `lib/sitemap/registry.ts` + `lib/sitemap/registry.reconcile.test.mjs` (cleanup 2) and `lib/schema.ts` (cleanup 3).
5. Delete the old pillar route dirs only after the moves land — the 301 then catches inbound links.
6. `npx tsc --noEmit` clean, lint changed files, `pnpm test` green (registry reconcile), `pnpm build` compiles, then verify each old pillar path returns a 301 to its new home.

### The two page templates

Two page types, one on each discovery role. The **industry pillar** is the broad-intent discovery page and the link hub. The **niche hub** is the conversion page. An industry has one pillar; a niche has one canonical hub. The pillar never tries to convert; the hub never tries to rank for the broad category. That split is what keeps them from eating each other.

The **umbrella** (homepage) and the **cylinders** (six `/services/*` pages) are unchanged and not re-specced here. The umbrella routes to pillars and hubs; the cylinders are the shared library every hub deep-links into.

**(a) Industry pillar template.** The broad-intent story for one industry and the internal link hub for every niche tagged to it. No price, no guarantee — those are set by the niche's motion, not the industry. Voice: industries whose niches mostly book jobs/appointments lean "I"; industries whose niches mostly sell product lean "we"; a mixed industry stays neutral firm voice ("we build") and lets each niche card carry its own. Section order:

1. **Pillar hero.** Eyebrow names the industry. Headline is the category-level promise in the trade's words. Lede states the shared leak at industry altitude, then "the version that's yours is one click down." No funnel CTA yet, just an anchor to the niche list. Keyword target: "{Industry} growth / marketing" — no niche modifier.
2. **The shared leak.** The one leak the whole industry shares, told once at the level true across every niche. The niche hub sharpens it to exact numbers.
3. **The mechanism.** "You've been sold pieces. We run the whole flow." Bring / Convert / Retain in one pass, plus Prove. The story, not the plan.
4. **The cylinders that fire across this industry.** Which of the six pay back for the category, each deep-linking to its `/services/*` page, pitched at the industry. The niche hub decides which are lit for a specific business.
5. **The faceted niche list — the link hub.** Every niche tagged to this industry as a card ("Revenue Engine for [niche]" + the niche's pain in its own words + a link to its hub). **Cross-listed niches are included and marked**, each linking to its one canonical hub (never duplicated). Un-built niches route their card to the nearest existing hub or a Growth Call.
6. **Relevant proof.** Case studies tagged to this industry, linking to `/case-studies/*`.
7. **Close.** A soft router. **CTA rule:** the pillar ships the **dual soft-router** CTA whenever any tagged niche — cross-listed included — carries a different motion than the industry default. Single CTA only when every tagged niche shares the motion. **The Medical & aesthetics pillar ships the dual router from day one,** because the taxonomy puts a sell-product medical-supply distributor under it. Home services flips to dual the moment a sell-product wrinkle (e.g. flooring) is tagged.

**The pillar must NOT** quote a price, render a guarantee block, or run the full conversion arc. Those live on the niche hub. The moment a pillar starts closing, it competes with its own children.

**(b) Niche hub template.** The conversion page. One niche, the full Revenue Engine arc, in that niche's language, proof, and numbers, with the commercial model rendered from the niche's **motion**. One canonical page per niche; one primary industry in the breadcrumb (chosen by dominant motion); cross-listed on every other pillar but never duplicated. Flat URL.

**The commercial block is driven by a typed `motion` field on the niche data object, NOT by industry/breadcrumb.** This is the single collision to lint for:

| | **book jobs / appointments** | **sell product** |
|---|---|---|
| Applies to | local-service: home services, medical & aesthetics | ecom / B2B: industrial, DTC brands |
| Voice | "I" | "we" |
| Guarantee | day-90 fee-beating guarantee (medical adds HIPAA) | none — "no guarantee on a count of quotes" |
| Pricing | published model, number in the audit; 90-day install, 3-mo minimum, client-funded ads | published price bands (Sprint / Operator Retainer / Full Growth Ownership); SOW in 48h; leave on 90 days' notice |
| Primary CTA | Revenue Leak Audit (GHL embed) | Book a Growth Call (+ written diagnostic) |
| Color-as-funnel | accent-orange | brand-blue |

Section order (the proven arc): **1.** Hero (eyebrow "Revenue Engine for [niche]", three-line headline cut to the niche, lede in the owner's words, founder spec-card rendered by motion, self-qualifier row + anchor nav). **2.** The leak, in this niche's numbers and scenes. **3.** The mechanism, voice by motion. **4.** The cylinder firing — only the cylinders that pay back are lit, each deep-linking to its `/services/*` page (book-jobs Convert shows the productized "answer + book" cylinder, no standalone money page); a niche page **may describe a cylinder's effect but must not target its head keyword**. **5.** The iteration loop (Prove made concrete). **6.** Proof — two revenue lines, the second should clear the fee. **7.** The commercial block — **exactly one** of guarantee (book-jobs; medical adds HIPAA) **or** no-guarantee + published-price band (sell-product); never both. **8.** Cylinder strip (six-card row, lit cylinders marked). **9.** Slim FAQ (three residual objections). **10.** Close (book-jobs -> Revenue Leak Audit; sell-product -> Book a Growth Call).

Section rhythm: light (leak) -> dark (mechanism) -> light (plan) -> dark (proof + guarantee/terms abutted) -> light (pricing) -> light (cylinders + FAQ) -> dark (close).

**Guardrail test (mirror the existing registry drift-guard pattern):** a niche with `motion === 'sell-product'` must **not** import `components/sections/revenue-engine/Guarantee`. Assert it in a test so an author can't wire the guarantee to a "medical" industry check.

**How pillar and niche avoid cannibalization:**

- **Intent split.** Pillar targets broad category intent ("home services marketing"); hub targets specific, modified intent ("roofing lead recovery"). On a DR-10 site neither outranks an authority for the head term anyway — the real risk is both wanting the same mid-tail ("roofing marketing"), which the keyword-ownership table forbids (no niche modifier on the pillar; the category term off the niche).
- **Role split.** The pillar is a link hub and a story; it withholds price, guarantee, and the closing arc, so it has nothing to win the high-intent searcher away from the hub with.
- **One canonical page per niche.** Cross-listing puts a *link* on several pillars; it never creates a second URL. No two URLs chase the same niche query.
- **Niche is not a cylinder.** Cylinder head terms ("AI SEO / GEO services", "catalog AI") belong to `/services/*` only; niche pages describe a cylinder's effect for that niche but don't target its keyword.
- **Breadcrumb discipline.** Each niche's breadcrumb names its one primary industry, so search and AI answers see a single home even when it's cross-listed.
- **Lazy-build.** Until a niche earns its own page it's a link to the nearest hub, never a thin skeleton sitting between the pillar and a real conversion page competing for the same words.

### The build discipline

Build the four industry pillars now (faceted indexes that link down into niches). Add niche pages **lazily** — only when a real client or real search demand earns one. Until a niche earns its page, the pillar routes its card to the nearest existing hub. No thin skeletons. The seed niches today are Dentists (live) and Jewelry (the lead consumer niche). Everything else in the four-industry niche lists stays a card on its pillar until it's earned.

### Resolved this round / still open

**Resolved (locked):**
- Two orthogonal axes: discovery taxonomy (many-to-many facets) vs commercial motion (one per niche). Motion sets the commercial model, not the industry.
- Flat niche URLs (`/revenue-engine/{niche}/`); faceted industry pillars (`/industries/{industry}/`); authority by internal linking, not nesting. Supersedes the two-prefix-by-funnel IA.
- The four industries and their default motions; dual-parent niches resolved by dominant motion (med spas -> Medical, flooring -> Home services, med-supply -> Industrial, local jeweler -> Consumer; HVAC stays one Home-services niche).
- Remap + 301 plan, registry/test cleanups, and the dentists exception (no 301 — slug already correct, breadcrumb/metadata only).
- The commercial block runs off a typed `motion` field with a guarantee-import lint test.
- Pillar CTA rule: dual router whenever any tagged niche differs in motion (Medical ships dual from day one).
- Reserved-slug rule for flat niches vs the Sanity `[slug]` catch-all.
- Keyword-ownership table (pillar = industry term, niche = "Revenue Engine for {niche}" + job-verb, cylinder head terms reserved to `/services/*`, homepage no industry modifier).
- **Industrial pillar converts** (fat pillar): the $5M–$75M distributor owner is one coherent buyer, so `/industries/industrial-distribution/` runs the full conversion arc; sub-trade niches (hydraulics, fasteners) are added later for SEO only. Home-services/medical stay thin pillars that route to niche hubs.
- **`/revenue-engine/` is the product page** (the Revenue Engine: what it is + how it works, CAPTURE→…→PROVE, + proof + convert CTA / dual-router), parent of the niche pages. The mislabeled **Framework** nav link (`/future-proof-your-seo/`) repoints here.

**Defaulted (unless overruled):**
- Consumer/DTC stays **jewelry-led**; add a second consumer niche only when earned.
- The recovered-revenue proof band is reused on sell-product niches but **scoped to the measurable lines** (recovered RFQs, reactivated accounts); share-of-wallet shown softly, no promise.

**Parked (sub-process — after the core rebrand ships):**
- **Airline-style first-screen CTA:** a hero widget that lets the visitor do the thing they came for immediately (the way an airline homepage puts "book a flight" right on the first screen) — e.g. pick business → see the leak/price → book, without scrolling. Explore as its own task once the pillars and niches land.

---

## 2. MOCK — Umbrella (the homepage)

### Hero

**Eyebrow:** We build Revenue Engines. One per business.

**Headline:**
Get found.
Win the sale.
Keep them coming back.

**Subhead:**
Buyers look you up and an algorithm sends them elsewhere. The ones who reach you slip through. The ones who buy never hear from you again. We close all three.

**Proof line (gets weight):**
One operator runs the whole flow. No markup on your ad spend. No lock-in.

**Front door (chip picker — "Which are you?"):**
- Industrial distributor → brand-blue → /industries/industrial-distribution/
- Dental or medical practice → accent-orange → /revenue-engine/dentists/
- Home-service contractor → accent-orange → /revenue-engine/home-services/
- Jewelry or luxury brand → brand-blue → /revenue-engine/jewelry/

*Pick one. The panel below switches to your business, and the button takes you to your engine.*

---

### The wedge

**Headline:**
You've been sold pieces. We run the whole flow.

**Body:**
A website from one vendor. Ads from another. A CRM from a third. None of them ever saw the other two, so customers fall into the gaps between them. A call rings out. A quote goes unchased. A buyer who already paid you once never hears from you again.

We don't sell you another piece. We build one system that brings the right work in, wins it, and keeps it coming back. One operator runs all of it.

**The loop line:**
Keeping customers feeds finding them. A repeat buyer or a referral costs almost nothing to win. A one-off campaign can't do that.

---

### Niche picker

**Headline:**
Pick the engine for your business.

**Subhead:**
The leak looks different in each one, and so does the fix. Find the version that's yours.

**Card 1 — Revenue Engine for Industrial Distributors** *(brand-blue)*
*Distributors and manufacturers, $5M–$75M.*
Their pain: Buyers ask AI for the part and your catalog never comes up. The RFQs that do land sit unworked.
The fix: Get your SKUs into the answers buyers see, win the quotes you already get, and pull back the accounts that went quiet.
CTA: See the engine →

**Card 2 — Revenue Engine for Dentists** *(accent-orange)*
*Single practices and groups.*
Their pain: The phone rings while you're with a patient and it goes to voicemail. Treatment plans get presented once and never followed up.
The fix: Answer every call, book the chair, and chase the plans and recalls that stall.
CTA: See the engine →

**Card 3 — Revenue Engine for Home-Service Contractors** *(accent-orange)*
*Roofing, HVAC, plumbing, electrical.*
Their pain: You're on a roof, the call goes unanswered, and you pay for leads nobody calls back. The estimate goes out and you never hear back.
The fix: Answer in seconds, book the job, and chase the estimates that stall.
CTA: See the engine →

**Card 4 — Revenue Engine for Jewelry & Luxury Brands** *(brand-blue)*
*Jewelry and high-consideration ecommerce.*
Their pain: Shoppers find a competitor in search and the carts they fill never close. Past buyers never come back.
The fix: Get found for what you sell, win the visit, and bring buyers back for the next piece.
CTA: See the engine →

*Not sure which fits? Book a Growth Call and we'll tell you straight.*

---

### The architecture — Bring / Convert / Retain

**Headline:**
Every engine runs on three strokes.

**Subhead:**
Different trade, same machine. Here's what each part does, and the hole it plugs.

**Bring — get the right work coming in**
Leak: They search and find a competitor.
Fix: Show up where buyers already look. Google, Maps, and AI answers. New demand, brought to your door.

**Convert — win the demand you already have**
Leak: They reach you and slip through.
Fix: Answer every call and message in seconds, book the job, and chase the quotes that stall. The demand you already have, turned into revenue.

**Retain — bring them back**
Leak: They buy once and never come back.
Fix: Win back the ones who looked and left, and sell again to the customers you already have. The cheapest growth there is.

**Capstone — Prove**
Every month, one report splits what your ads produced from what the system brought back. The honest test: the line the system recovered should clear what you pay us.

---

### The cylinders

**Headline:**
Six cylinders. One engine.

**Body:**
The strokes are the same everywhere. What fires inside them changes by business. We keep six capabilities in-house and fire the ones that pay back for your trade.

**Bring**
- AI Search & GEO — get cited in the answers buyers see. Most engines start here.
- Catalog AI — per-SKU work at scale, from 1,000 to 100,000-plus products.
- Editorial Authority — the pages that earn citations.
- Outbound Email — hand-built lists and sequences that get replies.

**Convert**
- Website Development — fast, schema-baked builds you own outright.
- Answer + book — every call and message handled in seconds, the job on the calendar. (Productized inside the local-service engine.)

**Retain + the whole engine**
- Full Growth Ownership — one operator runs all of it as a single motion.

*Your engine lights the cylinders that matter and names the rest. Each one links to its own page if you want the depth.*

---

### The loop

**Headline:**
We lean into whatever pays back hardest.

**Body:**
The monthly report doesn't just total the money. It shows which cylinder recovered the most. Maybe it was the calls you were missing. Maybe it was the quotes nobody chased. Whatever it was, the next month leans harder on it.

You're not paying for a fixed bundle that never changes. You're paying for an engine that gets tuned to your numbers, month after month.

---

### How we work

**Headline:**
How we work, in plain terms.

**One operator.**
The person who builds your engine is the person who runs it. No account managers, no handoffs, no five Slack channels with nobody owning the connection between them.

**No markup on your ad spend.**
If we run your ads, it's your account, at cost, zero markup. We don't resell your leads to anyone else.

**You own everything.**
Your website code, your data, your customer list, your Google profile. If you leave, the automations switch off and you keep all of it.

**No lock-in.**
Published model. You see how it's priced before we ever talk. After the minimum, leave on short notice with no clawback on work delivered.

*Pricing and guarantees vary by trade. You get the exact number on your hub, or in writing the same day you ask.*

---

### Close

**Headline:**
Find the hole. Then decide.

**Body:**
Most owners think they need more leads. They almost never do. The calls that ring out and the quotes nobody chased are usually a bigger hole than the ad budget. Start by seeing where yours is.

**Primary CTA (local-service):** Get your Revenue Leak Audit
**Secondary CTA (industrial / jewelry):** Book a Growth Call
**Microcopy:** 20 minutes. Free. Yours to keep, whether we work together or not.

---

## 3. MOCK — The Revenue Engine for Industrial Distributors (template niche hub)

# Revenue Engine for Industrial Distributors

URL: `/industries/industrial-distribution/` · Voice: "we" · No guarantee · Published prices · Primary CTA: Book a Growth Call

---

### 1. Engine Hero

**Eyebrow:** Revenue Engine for Industrial Distributors

**Headline (3 lines, full-contrast, ~48px):**
Get found. Win the quote. Keep the account.

**Lede (owner's words):**
A buyer asks an AI which supplier carries the part, and it names someone else. The RFQ that does reach you sits in an inbox over a long weekend. The account you won last year reorders from whoever emailed them first. We close all three.

**Founder spec-card:**
- Artur Shepel. We run every account ourselves.
- Published prices.
- SOW in 48 hours.
- Leave on 90 days' notice.

**Self-qualifier row:**
Built for distributors and manufacturers doing $5M–$75M. Not sure it's you? Read the leak first.

**Anchor nav (On this page):**
The leak · How the engine runs · The iteration loop · Proof · Pricing · FAQ

**Primary CTA:** Book a Growth Call
**Secondary:** Or get a written diagnostic first

---

### 2. The Leak

**Headline:**
You don't have a traffic problem. You have a handoff problem.

**Subhead:**
More clicks won't fix a quote nobody chased or an account nobody called back. The hole sits between the pieces, where one vendor's job ends and the next one's never picks up.

**Body — the three places a distributor leaks:**

**Discovery.** A buyer searches the part number, or asks an AI who stocks it. Your page is built for a human skimming, not a machine answering, so the answer names a competitor. You never see the search you lost.

**Conversion.** The RFQ lands. It's read in two days, quoted in four, and by then the buyer has three other numbers. The quote you sent is a quote you already half-lost on speed.

**Retention.** The account reorders, from someone else, because no one watched the gap or sent the email first. Repeat revenue is the cheapest revenue you have, and it walks out unattended.

**Closer:**
Every RFQ that didn't close is margin you already spent to win. The leak isn't the ad budget. It's everything the ad budget hands off to.

---

### 3. Five agencies, no accountability

**Headline:**
Five agencies. No accountability.

**Body:**
Five vendors. Five reports. Five Slack channels. Nobody owns the connection between them. The SEO shop doesn't talk to the catalog vendor. The web build doesn't know what the email list is doing. Each one was hired by someone who never saw the other two, and your buyers fall into the gaps.

That's the problem the engine is built to remove. One operator. One owner. The whole flow running as one motion.

---

### 4. The Mechanism

**Headline:**
You've been sold pieces. We run the whole flow.

**Body:**
A website, a catalog, an email list, an SEO retainer. Each sold by someone who never saw the other two. Buyers fall into the gaps between them. We run all of it as one system, so they don't.

**The three strokes (Bring → Convert → Retain):**

- **Bring — get the right work coming in.** Show up where buyers already look: search, the part-number query, the AI answer. New demand, brought to your door.
- **Convert — win the demand you already have.** Quote faster, on a site built to close, with the RFQ mechanics that turn an inquiry into an order.
- **Retain — bring the account back.** Reactivate the lapsed, sell deeper into the ones you have. The cheapest margin there is.

**Compounding loop:**
Retain feeds Bring. A repeat customer or a referral costs almost nothing to win. A one-off campaign can't do that.

**Trust line:**
No markup on your ad spend. We don't resell your leads. No lock-in.

**Handoff bridge:**
That's the flow. Here's how we run each part, and which cylinders fire for a distributor.

---

### 5. How the Engine Runs — the cylinder firing

**Headline:**
Three jobs. Six cylinders. One engine.

**Intro:**
Each cylinder is a service we run in-house. A distributor doesn't fire all six on day one. We light the ones that pay back first, then add the rest as the work compounds. Each one links to the full spec.

---

**BRING — get the right work coming in**

**Cylinder 1 — AI Search & GEO** → `/services/ai-seo/` · *most engines start here*
When a buyer asks an AI who carries the part, the answer should be you. We rewrite your pages so machines can read and quote them, engineer the citations that get you named, and run paid that survives an AI-first results page. This is the gravity well. Most distributors start here.

**Cylinder 2 — Catalog AI** → `/services/catalog-ai/` · *fires hardest for distributors*
A buyer searching one of 50,000 SKUs lands on a thin, duplicate page and bounces. We write per-product descriptions, structure them so machines can answer from them, link them so each SKU pulls the next, and build the FAQ a buyer (or an AI) actually asks. Per-SKU, across 1,000 to 100,000+ products.

**Cylinder 3 — Editorial Authority** → `/services/editorial-authority/`
Distributors win on knowing the application, not just stocking the part. We build the spec guides, sizing pages, and engineering Q&A hubs that get cited as the source. The authority layer that makes the rest rank.

**Cylinder 4 — Outbound Email** → `/services/outbound-email-marketing-services/`
Cold lists that land in the inbox and get a reply. We engineer the sender domain so you don't spam-folder, hand-build the vertical list, and run multi-touch sequences that branch on what the buyer does.

---

**CONVERT — win the demand you already have**

**Cylinder 5 — Website Development** → `/services/website-development-design-services/`
A fast site that closes the RFQ instead of stalling it. Performance build with a Core Web Vitals SLA written into the SOW, machine-readable product data baked in, plugin-thin, and you own the code. Plus the quote mechanics: the RFQ form, the spec sheet, the fast-reply path that beats a competitor on speed.

---

**RETAIN — bring the account back (and the whole engine assembled)**

**Cylinder 6 — Full Growth Ownership** → `/services/full-growth-ownership/` · *the engine, fully assembled*
One operator runs all of the above as one motion, plus the retention work: spotting the account that's gone quiet, the reorder that didn't come, the win-back email nobody sent. This is the default. The standalone cylinders are honest on-ramps to it.

**"Available, not firing yet" line:**
Cylinders we'll add as the engine earns it, not bolted on day one because a deck said so.

**Prove (capstone):**
And then, Prove. Every month we show which cylinder brought back the most, in your numbers, not ours.

---

### 6. The Iteration Loop

**Headline:**
We strengthen the cylinder that pays back hardest. Every month.

**Body:**
An engine isn't a launch. It's a thing you tune.

Each month the report shows which cylinder recovered the most margin: the RFQ speed work, the catalog pages, the reactivation emails. The next iteration leans into that one. If Catalog AI is what's clearing real orders, that's where the next month's hours go. If it's the cold-RFQ recovery, we shift there.

You're not paying for a fixed scope that ignores what's actually working. You're paying for an operator who reads the result and moves the weight to where it pays. That's the difference between five vendors defending their line item and one owner moving budget to the cylinder that earns it.

---

### 7. Proof

**Headline:**
Two lines on every report. The second one is the test.

**Subhead:**
Each month we split what your paid spend produced from what the system brought back. The honest read: the recovered line should justify what you pay us.

**Two revenue lines:**
- **Media-driven** — orders that came from the ad spend you funded.
- **System-driven** — the line the engine brought back. Recovered RFQs, reactivated accounts, deeper share of the wallet you already own.

**Honesty mechanic:**
Counted in your numbers, not estimated on our spreadsheet. We won't pretend a chart proves it. The structure does: two lines, our fee shown as its own row, and you decide if the second line earns the first.

---

### 8. Why no guarantee

**Headline:**
No guarantee on a count of quotes.

**Body:**
We don't promise you a number of RFQs by a date. A distributor's cycle is too long and too lumpy for that to mean anything, and anyone who promises it is selling you a metric, not margin.

What we'll do instead: publish the prices, show the work in week four, and put both revenue lines in front of you every month. If the system-driven line doesn't justify the fee, you'll see it before we do, and you can leave on 90 days' notice. That's the trade. No theater, no clawback fine print, no lock-in standing in for results.

---

### 9. Pricing & Engagement

**Headline:**
Three ways in. All priced. No discovery-call pricing games.

**Intro:**
You see the model before we ever talk. Pick the shape that fits, we tighten the scope on the first call, and you get the SOW in writing within 48 hours.

**The three shapes:**

**Sprint — $9K–$35K** · 4–6 weeks, fixed scope
One cylinder, installed and handed over. The catalog rewrite. The build. The GEO pass. For the distributor who knows the one thing that's broken.

**Operator Retainer — $4K–$15K/month** · 3-month minimum, no PMs
A few cylinders, run by the operator directly. Direct Slack to the person doing the work. For the owner who wants steady motion without hiring a marketing team.

**Full Growth Ownership — from $20K/month** · 3–6 month minimum · *the default*
The whole engine. One operator owns every cylinder, the iteration loop, and the report. This is the frame; the two above are on-ramps to it.

**Proof-of-fairness block — the per-SKU math, shown not hidden:**

**Headline:** The catalog math, in the open.

**Body:** When Catalog AI fires, here's exactly how it's priced. Per SKU, by volume, so you can do the arithmetic before the call.

- **Standard** — $3.00 down to $2.00 / SKU (min $3,000)
- **Pro** — $7.00 down to $5.00 / SKU (min $7,000)
- **Enterprise** — $15,000–$50,000+/month
- Ongoing maintenance: $1.00–$2.50 / SKU, 48-hour turn. Quarterly re-optimization at 25% of the per-SKU rate.

We publish this because the price isn't the risk. The handoff is. You'll never get a "depends on your needs" runaround from us. The number's on the page.

**Trust micro-line:**
Published prices. SOW in 48 hours. Leave on 90 days' notice.

---

### 10. The CMO-replacement anchor

**Headline:**
Priced against the hire you'd otherwise make.

**Body:**

**Versus a full-time growth hire.** A growth lead runs about $200K base plus benefits, equity, and recruiting. Call it $300K/year all-in. Full Growth Ownership is $20K–$35K/month. It ships faster, scales down on 30 days' notice, and carries no severance risk.

**Versus five separate retainers.** If you're already spending $20K+/month across disjointed vendors, you're paying a coordination tax to yourself, in your own hours. We collect a portion of that in exchange for doing the coordinating.

**Does it replace a CMO?** For most $5M–$25M distributors, yes. The exception is exit prep, raising capital, or building toward $50M+. (We've also placed three CMOs from our network in the last 18 months, no fee. If that's the real need, we'll say so.)

---

### 11. The two-state on-ramp

**Headline:**
Where's your engine right now?

**Two states, side by side:**

**No engine yet, or it's leaking.**
Buyers can't find you, RFQs stall, accounts drift, and you can't say what your marketing did last quarter. We build the whole engine and run it. Start with Full Growth Ownership, or light the gravity-well cylinder (AI Search) first and add from there.
→ Book a Growth Call

**Engine runs, but a cylinder's dead.**
The site's fine, the demand's there, but one part stopped paying back. The catalog's thin. The RFQ reply is slow. The cold list went quiet. We rebuild that one part and hand it back.
→ Start with a Sprint

**Bridge line:**
Either way, the first call tightens the scope and the SOW lands in 48 hours. No deck. No SDR loop.

---

### 12. Cylinder strip

**Headline:**
Six cylinders. One engine. Edited once, run everywhere.

**Intro:**
The same capability library powers every Revenue Engine we run. Here's the full set a distributor can fire. Each links to its spec.

- AI Search & GEO → `/services/ai-seo/` · Bring
- Catalog AI → `/services/catalog-ai/` · Bring
- Editorial Authority → `/services/editorial-authority/` · Bring
- Outbound Email → `/services/outbound-email-marketing-services/` · Bring
- Website Development → `/services/website-development-design-services/` · Convert
- Full Growth Ownership → `/services/full-growth-ownership/` · Retain + all three

**The 60/40 line:**
Buying one cylinder often produces 60% of the result it could. The other 40% comes from the cylinders compounding on each other. Most agencies don't have all six in-house, so they pretend that 40% doesn't exist. We're priced and built around it.

---

### 13. Slim FAQ

**Intro:**
The heavy objections are answered in the story above. Three that come up after:

**We're a manufacturer, not a pure distributor. Does this fit?**
Yes. The cylinders are the same; the framing shifts. For a manufacturer, Bring leans harder on application authority and the part-finder, and Retain leans on the distributor and rep network instead of end-buyer reorders. We tune which cylinders fire on the first call.

**Our catalog is 80,000 SKUs. Can you actually do per-product work at that scale?**
That's the normal case, not the edge case. Catalog AI is built for 1,000 to 100,000+ SKUs, priced per unit so you see the cost before you commit, with a 48-hour maintenance turn as the catalog changes.

**Why won't you just quote a flat price for everything?**
The per-cylinder prices are published. The total depends on which cylinders fire and at what volume, and we won't guess that before we've seen your catalog and your numbers. You'll have the full SOW, in writing, within 48 hours of the first call. No number invented to fill a silence.

---

### 14. Close

**Headline:**
One operator. One accountable owner. Your entire growth function.

**Body:**
Stop paying five vendors to defend five line items. Run the whole flow as one engine, tuned every month to the cylinder that pays back.

**Primary CTA:** Book a Growth Call
**Secondary:** Or get the written diagnostic first

**Reassurance line under the CTA:**
Response within 24 hours. A 30-minute call, no deck. A one-page diagnostic, no SDR loop. SOW in 48 hours.

---

## 4. Humanizer pass

**AI tells / buzzwords killed:**
- Umbrella wedge: removed the em-dash-style run-on 'wins it, and keeps it coming back, and one operator runs all of it' — split into two sentences ('...keeps it coming back. One operator runs all of it.') so the closer lands harder.
- Umbrella 'Proof and boundaries — the operator model' heading was internal scaffolding language; retitled the section to plain 'How we work' (the buyer reads 'how we work,' not 'boundaries / operator model').
- Industrial hero spec-card: changed 'Artur Shepel — we run every account ourselves' to 'Artur Shepel. We run every account ourselves.' Killed the decorative em-dash in a spec line.
- Industrial Leak subhead: 'The hole is between the pieces' → 'The hole sits between the pieces' (plain concrete verb instead of flat 'is').
- Industrial Retention bullet: cut the rule-of-three padding 'because no one watched the gap, flagged the silence, or sent the email first' down to 'because no one watched the gap or sent the email first' — kept the two load-bearing items, dropped the middle filler.
- Industrial handoff bridge: replaced em-dash 'each part — and which cylinders fire' with a comma.
- Industrial 'Available, not firing yet' line: replaced em-dash 'earns it — not bolted' with a comma.
- Industrial Prove capstone: 'And then — Prove.' → 'And then, Prove.' (comma over em-dash).
- Industrial section 8: replaced em-dash 'you'll see it before we do — and you can leave' with a comma.
- Industrial catalog block: 'here's exactly how it's priced — per SKU, by volume' → 'here's exactly how it's priced. Per SKU, by volume.' Period beats the em-dash and adds burstiness.
- Industrial catalog block: 'runaround from us — the number's on the page' → split into 'runaround from us. The number's on the page.'
- Industrial CMO anchor: split three em-dash clauses into sentences ('plus benefits, equity, and recruiting. Call it $300K/year all-in.' and 'no fee. If that's the real need, we'll say so.').
- Industrial two-state headings: 'No engine yet — or it's leaking' and 'Engine runs — but a cylinder's dead' → commas. Removed decorative em-dashes from the two state labels.
- Industrial FAQ: 'not a pure distributor — does this fit?' → 'not a pure distributor. Does this fit?' (the em-dash inside a question read as AI cadence).
- Stripped all the bracketed editorial color labels and parenthetical craft asides (e.g. '(brand-blue → ...)', '(verbatim reuse)', '(mechanism turn, "we" cut)') from the niche page body so the deliverable reads as page copy, not as annotated draft — kept the routing colors only where they're functional (umbrella chip picker).
- No surviving 'not just X but Y' constructions in body copy. Confirmed both flagged calculator lines stayed rewritten ('usually a bigger hole than the ad budget' on the umbrella close; 'reads the result and moves the weight to where it pays' on the loop). Left the two intentional 'You're not paying for X. You're paying for Y.' lines — they are a deliberate contrast, not the banned negation pattern, and they carry the offer.
- No buzzwords found to swap (leverage/robust/seamless/unlock/elevate/streamline all absent) — confirmed clean rather than introduced.

**Coherence notes:**
- Both pages now open on the identical full-arc promise in the same voice: umbrella 'Get found. / Win the sale. / Keep them coming back.' and industrial 'Get found. Win the quote. Keep the account.' Same three-beat, same 'We close all three.' payoff line in both ledes.
- Shared system is consistent end to end: engine = Bring / Convert / Retain (three strokes) + Prove capstone, and the six cylinders map to the same strokes on both pages (AI Search & GEO, Catalog AI, Editorial Authority, Outbound Email = Bring; Website Development = Convert; Full Growth Ownership = Retain + whole engine). The umbrella's 'Answer + book' Convert cylinder is correctly the local-service productized version, so it does not appear on the industrial hub — that's intended, not a gap.
- The wedge line 'You've been sold pieces. We run the whole flow.' is verbatim shared between umbrella wedge and industrial section 4, anchoring one belief across both.
- Compounding-loop line is consistent: umbrella 'Keeping customers feeds finding them. A repeat buyer or a referral costs almost nothing to win. A one-off campaign can't do that.' / industrial 'Retain feeds Bring. A repeat customer or a referral costs almost nothing to win. A one-off campaign can't do that.' Same idea, niche-appropriate first sentence.
- Guardrails respected. Industrial uses 'we' throughout, carries no day-90/quote guarantee (section 8 turns the absence into the trust signal), and publishes prices (Sprint/Retainer/FGO bands + per-SKU tiers). The umbrella quotes no price and no guarantee anywhere — it routes only, and explicitly defers both to the hubs ('Pricing and guarantees vary by trade').
- Spine phrasing 'We build Revenue Engines' is the umbrella eyebrow and the framing both pages run on. The same trust trio appears as a closer on both ('No markup on your ad spend... No lock-in' on the umbrella; 'Published prices. SOW in 48 hours. Leave on 90 days' notice.' on the industrial hub).
- Color-as-funnel is preserved and consistent: brand-blue = industrial + jewelry (consultative, Book a Growth Call), accent-orange = dental + home-services (productized, Revenue Leak Audit). The umbrella's dual CTA matches each hub's primary CTA.
- Remaining gap to flag for founder: the umbrella links a /revenue-engine/jewelry/ and /revenue-engine/home-services/ engine, but only the industrial hub is drafted here. The four niche cards on the umbrella promise a parallel 'pain → fix' structure and a published price/guarantee per hub — the home-services, dentists, and jewelry hubs need to ship in the same Bring/Convert/Retain + Prove shape (with their own voice: local hubs swap 'we' to 'I' per the variance table) before the umbrella's routing is fully honest.
