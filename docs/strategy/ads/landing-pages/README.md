# Paid traffic & landing pages — strategy

*Created 2026-06-17. Owner: Artur. Companion to [ad-angle-matrix.md](./ad-angle-matrix.md).*

Where this came from: the homepage now opens (organic) with the **Intent Index**
(`components/sections/GoalIndex.tsx`) — six owner-voice "I want to ___" goals that
route to the right funnel. The question this doc answers: those same goals are a
paid-acquisition map. How do we run ads against them, and where do we send the
click?

---

## 1. The core rule: an SEO page is not a paid landing page

They serve opposite readers. Don't make one page do both — it under-converts *and*
under-ranks.

| | SEO / citation page | Paid landing page |
|---|---|---|
| Reader | Found you via a query, browsing | Clicked an ad you paid for, impatient |
| Job | Rank, get cited, answer the topic fully | One conversion, now |
| Nav | Full site nav + internal links + depth | Stripped header, no exits |
| Tone | Comprehensive, neutral | Tunnel-vision, one promise, one CTA |
| Index | Indexed | `noindex` (so it never competes with the SEO page) |
| Lives at | `/services/*`, `/industries/*`, hubs | A campaign space (e.g. `/lp/<vertical>-<angle>/`) |

A paid push means **dedicated campaign landing pages**, separate from the
outcome/SEO pages described in the SEO outcome-page workstream.

## 2. The winning structure for paid: model A

Three ways to point paid traffic at this business. Ranked.

- **Model A — ad per problem × vertical → its own matched, single-funnel LP. (Use this.)**
  The page continues the exact promise the ad made; one funnel, one door, one CTA.
  Highest conversion, cleanest attribution.
- **Model B — ad → vertical hub → visitor self-selects the problem.** A fallback for
  broad/awareness campaigns or before LPs exist. The hubs already exist
  (`/revenue-engine/home-services/`, `/revenue-engine/dentists/`, the industrial hub).
  Converts worse — you inserted a decision step into impatient paid traffic.
- **Never: paid → the homepage Intent Index.** It's cross-vertical *and* a
  self-select — two conversion-killers. Self-select is right for *organic browsers*
  (that's the Intent Index's job), wrong for paid.

Why model A wins: **message match** (every step between ad-promise and CTA bleeds
conversion — you already paid for the click), **one funnel/one door** (no "which
are you?"), and **per-angle attribution** (read CPA/ROAS per problem, A/B test
headlines).

## 3. Channel fit — Meta is for local-service, not industrial

This shapes everything. FB/Meta is interruption advertising, geo-targetable, and
consumer-adjacent — a strong fit for **home services and dental** (the Revenue
Engine), a weak fit for **industrial** (you can't efficiently target the owner of
a $5M–$75M distributor on Meta; it's a high-consideration B2B sale).

| Vertical | Best paid channels | Funnel / door |
|---|---|---|
| Home services (roofing, HVAC, plumbing, electrical) | **Meta** (top), Google Local/PMax, Google Search | Revenue Engine → **Revenue Leak Audit** |
| Dental | **Meta** (top), Google Search, Local | Revenue Engine → **Revenue Leak Audit** (HIPAA) |
| Industrial / technical B2B | **Google Search** (intent), LinkedIn, trade | **Book a Growth Call** / written audit |

So "FB ads for each problem on each vertical" is really: **FB ads for the local
verticals**, and **Google Search ads for industrial**.

> **Two clarifications.** (1) The *query-shaped SEO outcome pages* are a
> **dependency, not a built asset yet** — until they exist, industrial Search ads
> land on the relevant `/services/*` page or the industrial hub. (2) Industrial
> Search ads deliberately **break the noindex/stripped-LP rule below**: the search
> intent is already qualified, so an indexed dual-use content page (SEO + paid)
> converts fine. The noindex, nav-stripped LP rule is for **Meta cold-interruption
> traffic** (the local verticals), where you manufacture the intent and must remove
> every exit.

## 4. Landing-page hygiene (every paid LP)

- One CTA, matching the funnel's door. Above the fold or one scroll down.
- Strip the site header/nav (reduce exits). `noindex`. *(This is for Meta
  cold-traffic LPs. Google Search → industrial intentionally lands on the indexed
  dual-use page instead — see §3.)*
- Hero mirrors the ad headline/creative (scent).
- Vertical-specific proof (the Revenue Engine's falsifiable day-90 guarantee is a
  real conversion asset on local LPs — **never invent a guarantee for industrial**;
  that side is no-guarantee by policy).
- Fast (Core Web Vitals) — paid traffic bounces on slow loads and platforms reward speed.
- Per-angle UTMs + the existing `data-cta` convention; Meta Pixel + Conversions API.
  **Dental exception:** no client-side Pixel on any LP that captures patient data —
  use server-side, PHI-stripped conversions through BAA-covered tooling only. A
  standard pixel on a dental booking page is a HIPAA/CIPA exposure.

## 5. Sequence — validate cheap, then build

The six goals × three verticals is a **planning matrix, not a build list**.

1. **Validate with spend.** Run the ad angles, sending to the best *existing* page
   (vertical hub / service page) as interim. Spend tells you which problem × vertical
   actually resonates. Define the conversion event up front and fire it on the
   booking thank-you page (planned `/revenue-engine/audit-booked/`, noindex) — without
   a defined endpoint you can't read ROAS per angle.
2. **Build LPs for winners only.** For the 2–3 angles with traction, build dedicated
   conversion LPs.
3. **Reuse the copy.** The Intent Index *stakes* are ad-headline seeds (e.g. *"The
   phone rings while you're on a roof… the 9pm lead books with whoever picked up
   first."*) — owner-voice problem lines that need a CTA/offer appended to become a
   full ad. `GoalIndex.tsx` is the creative bank.

Operational caution: small, operator-led team. Start with one vertical, 1–2 angles,
prove ROAS, then scale the matrix.

## 6. Prerequisites / blockers

- **RE-203 (hard blocker for local-service paid):** the Revenue Leak Audit funnel is
  still an interim redirect to `/book-growth-call/` (`components/sections/revenue-engine/AuditCTA.tsx`,
  pending the GHL embed). Do **not** spend on home-services/dental paid until the real
  audit form + calendar is live — you'd be paying for clicks into a half-wired funnel.
- **Dental:** BAAs/HIPAA on any tooling that touches patient data, **and no
  client-side Meta Pixel/CAPI on PHI-capturing LPs** (server-side, PHI-stripped only).
  A standard pixel on a dental booking LP is a compliance landmine.
- **LP space:** decide the route convention (e.g. `/lp/`) and `noindex` it before launch.

---

See [ad-angle-matrix.md](./ad-angle-matrix.md) for the per-cell creative angles,
destinations, and build order.
