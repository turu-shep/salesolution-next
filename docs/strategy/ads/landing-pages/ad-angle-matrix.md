# Ad-angle matrix — problem × vertical

*Created 2026-06-17. Companion to [README.md](./README.md) (the strategy + rules).*

The six Intent-Index goals (`components/sections/GoalIndex.tsx`) mapped to paid ad
angles per vertical: the creative hook, the channel, where the click lands, and
which deserve a dedicated landing page first.

**Goals:** G1 show up in AI · G2 brand awareness · G3 more work coming in ·
G4 stop losing what you already pay for · G5 every call answered · G6 keep + win back.

**Doors (do not merge funnels):** Industrial → Book a Growth Call
(`/book-growth-call/`) or written audit (`/unlock-growth-audit/`). Local-service →
Revenue Leak Audit (Revenue Engine; interim `/book-growth-call/` until RE-203).

Reading the priority column: **LP-1** = build a dedicated landing page first ·
**LP-2/3** = test the angle to an existing page, build later if it wins ·
**Search-page** = the dual-use SEO outcome page is the destination (Google Search) ·
**N/A** = the owner doesn't frame their problem this way; skip.

---

## Home services (roofing, HVAC, plumbing, electrical) — Meta-first · Revenue Engine

The strongest paid fit in the book: geo-targetable, visual problems, loss-aversion
hooks, and a single falsifiable door (the Revenue Leak Audit).

| Goal | Creative angle (hook) | Channel | Lands on | Priority |
|---|---|---|---|---|
| **G5** every call answered | "On a roof? Every missed call is a booked job for whoever picked up." | Meta | Home-services "stop the leak" LP → Revenue Leak Audit | **LP-1** |
| **G4** stop losing leads | "You paid for that lead. Nobody called it back." | Meta | same LP (G5+G4 = one capture/response story) | **LP-1** |
| **G3** more booked jobs | "Book more of the jobs already calling you — no new ad spend." | Meta / Google | Home-services LP or `/revenue-engine/home-services/` | LP-2 |
| **G6** win back | "Last year's customers are this year's cheapest jobs." | Meta | `/revenue-engine/home-services/` | LP-3 |
| **G2** reviews / reputation | "Win the reviews that win the bid." | Meta | `/revenue-engine/home-services/` | LP-3 |
| **G1** found in the area | "Neighbors ask AI for a roofer near them. Is it you?" | Google / Meta | `/revenue-engine/home-services/` | LP-3 (weaker — narrow local fix, not the GEO service) |

## Dental — Meta-first · Revenue Engine (HIPAA)

Same shape as home services; the leak is front-desk + recall. Lead with chair-time.

| Goal | Creative angle (hook) | Channel | Lands on | Priority |
|---|---|---|---|---|
| **G5** every call answered | "Your busiest hour is your leakiest — calls missed during chair time are patients lost." | Meta | Dental "stop the leak" LP → Revenue Leak Audit | **LP-1** |
| **G4** stop losing | "Treatment plans accepted, then never followed up. Recall that never goes out." | Meta | same LP | **LP-1** |
| **G3** more patients | "Fill the schedule from the calls you already get." | Meta / Google | Dental LP or `/revenue-engine/dentists/` | LP-2 |
| **G6** reactivation | "Win back the patients who quietly drifted." | Meta | `/revenue-engine/dentists/` | LP-3 |
| **G2** reviews | "The reviews that get you picked over the practice down the street." | Meta | `/revenue-engine/dentists/` | LP-3 |
| **G1** found locally | "Someone asks AI for a dentist nearby. Does your name come up?" | Google / Meta | `/revenue-engine/dentists/` | LP-3 (weaker) |

## Industrial / technical B2B (distributors, manufacturers) — Google Search / LinkedIn · Growth Call

Meta is a weak fit here (you can't efficiently target a $5–75M distributor owner).
Run **Google Search** against the query-shaped SEO outcome pages, and LinkedIn for
account-level targeting. Angles are sharp; the funnel is slower (consultative sale).

| Goal | Creative angle (hook) | Channel | Lands on | Priority |
|---|---|---|---|---|
| **G1** show up in AI | "Ask ChatGPT for a part you stock. It names the manufacturer, not you." | Google Search / LinkedIn | `/services/ai-seo/` or industrial hub → Growth Call | **Search-page** (strongest industrial angle; dual-use SEO + paid) |
| **G3** more quotes | "More RFQs from the buyers already searching your parts." | Google Search | Industrial hub → Book a Growth Call | Search-page / LP-2 |
| **G4** stop losing quotes | "Your catalog is a parts dump buyers bounce off." | Google Search / LinkedIn | `/services/website-development-design-services/` or hub | LP-3 |
| **G6** win back accounts | "Win-back email to the accounts that went quiet." | LinkedIn / email | `/services/outbound-email-marketing-services/` | LP-3 |
| **G2** be the cited name | "Be the name the AI cites for your category, not the brand you resell." | LinkedIn | `/services/editorial-authority/` | LP-3 (awareness ≠ direct response — lowest paid priority) |
| **G5** every call answered | — | — | **N/A** (industrial owners don't frame it this way) |

---

## Build order (dedicated LPs first)

0. **Unblock RE-203 (step zero).** Stand up the real Revenue Leak Audit funnel — GHL
   form + calendar + the `/revenue-engine/audit-booked/` thank-you (noindex). Both
   LP-1s below are dead until this is live, and the thank-you page is the conversion
   endpoint that makes the whole validation phase measurable.
1. **Home services — "stop the leak" LP** (G5 + G4, one page) → Revenue Leak Audit.
   Best Meta fit, loss-aversion hooks, existing RE base.
2. **Dental — "stop the leak" LP** (G5 + G4, HIPAA) → Revenue Leak Audit.
   *Prereq: RE-203 + BAAs.*
3. **Industrial — G1 "AI names the manufacturer, not you"** as a Google Search page,
   built once and used for **both** organic citation and search ads → Growth Call / audit.

Then, for whichever Meta angles show traction in validation, promote G3 (more work)
to its own LP per local vertical. Hold G2/G6/G1-local as test-only until the
loss-aversion pages are proven.

## Notes that change the plan

- **Pair G5 + G4 on one page, don't split them.** Both are the capture/response leak;
  one "stop the leak" narrative per local vertical is stronger and fewer pages to build.
- **Loss aversion > volume promises.** "Stop losing what you pay for" (G4/G5) outpulls
  "get more" (G3) and is honest — the brand avoids volume guarantees. On local LPs the
  day-90 falsifiable guarantee is the closer; never port a guarantee to industrial.
- **Awareness goals (G2) are the weakest paid bets** everywhere — awareness rarely
  converts on a direct-response click. Keep them organic/retargeting, not cold paid.
- **Industrial paid ≈ the SEO outcome-page workstream.** Don't build separate paid LPs
  for industrial first; build the query-shaped outcome pages and point Google Search
  ads at them. Those outcome pages are a **dependency, not a built asset yet** — until
  they exist, industrial Search ads land on the relevant `/services/*` page or the hub.
  Note **G3 industrial is hub-only today** (no dedicated service page), so its
  "Search-page" priority is aspirational, not a pointer to an existing destination.
- **Industrial lands on indexed pages on purpose.** Unlike the noindex Meta LPs, the
  industrial Google Search destinations are the indexed dual-use SEO/hub pages —
  qualified search intent converts fine on a content page. (README §3.)
- **Dental compliance:** no client-side Meta Pixel/CAPI on any LP that captures patient
  data — server-side, PHI-stripped, BAA-covered only. A standard pixel on a dental
  booking LP is a HIPAA/CIPA exposure.
- **Blocker:** local-service paid is gated on **RE-203** (real Revenue Leak Audit embed;
  currently interim → `/book-growth-call/`). See build-order step 0 and [README.md](./README.md) §6.
