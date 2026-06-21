# Channel → funnel-structure playbook

*Created 2026-06-18. Companion to [README.md](./README.md) + [ad-angle-matrix.md](./ad-angle-matrix.md).*

The LP we built (`/lp/home-services-revenue-leak/`) is one tool. It is **not** the
right funnel for every traffic source. This is the canonical "where does each
source go" reference. It extends the README (Meta = local / Google Search =
industrial; noindex stripped LPs; RE-203 blocker) — it doesn't replace it.

**Judge every paid lane on cost-per-BOOKED-audit, not raw CPL.** Fast follow-up
(GHL auto-text-back, RE-203) is the equalizer that makes the low-friction lanes
work. Until it ships, local-service paid stays gated (README §6) and the LP can
only honestly promise "within one business day."

## Decision matrix

| Source | Funnel | Destination | Door | Why |
|---|---|---|---|---|
| **Google Search** — problem-aware ("missed calls costing me jobs", "answering service for roofers") | RSA, one tight theme per ad group, query→H1 match | **This LP** + call assets + a call-only ad group for the "answering" theme | LP form **and** tap-to-call | Intent already exists; the page only needs scent-match. The LP is the best tool for this channel. |
| Google Search — broad/informational | Hold from cold paid | Organic / retargeting | — | Doesn't convert on a stripped LP. Weakest paid bet. |
| **Meta/IG cold** (~90% mobile interruption) | **Dual-lane**, one Leads objective | **Lane 1 (workhorse): native Lead Ad / Instant Form** (Higher-intent type). Lane 2 (test): the LP, once it has proof + a Lead event | Instant form (in-app) / LP form | Cold visitors never asked; instant forms = lowest friction/CPL, highest volume. **Conditional on GHL sub-minute follow-up.** |
| **Meta/IG warm + retargeting** (LP abandoners, engaged local visitors, lookalikes) | The LP is the destination by design | **This LP**, proof-led creative; deep-link abandoners to `#audit` | LP form (+ hero tap-to-call) | Trust already paid for; warm people convert on reassurance you stage on a page you control. The LP's home turf. |
| **Your own list / GHL contacts / past requesters** | Direct outreach first | Personal SMS/email from Artur; LP as the confirm link | Reply / LP form | Don't pay Meta to retarget people you can text for free. |
| **Cold email** | The sequence *is* the funnel | Reply-to-Artur (primary); LP as a secondary UTM'd link deep in email 2–3 | Email reply → hand-booked / LP form | Reputation-gated channel; links are a deliverability liability. Reply-first beats click-first. |

**One-line summary:** the LP is great for Search + warm/retargeting, OK-once-fixed for cold-Meta clicks, and a *secondary* door for cold email. It is the right tool for everything **except being the primary cold-Meta funnel.**

## Meta/IG verdict (the owner's question)

Run **two capture lanes; don't pick one in the abstract.** "Instant forms always win" is false.

- **Cold prospecting → Instant Forms (default).** In-app, pre-filled, no page load → lowest CPL, highest volume, and it sidesteps the "trust on a cold page" problem the LP has today (no social proof, slower load). Use the **"Higher intent"** form type (adds a review step — trades a little volume for far less junk). Add 1–2 qualifying questions mapped exactly to our Zod enums so leads land clean in the same pipeline.
- **Warm / retargeting / lookalikes → the LP.** The only place to stage the leak story, proof, and the day-90 guarantee before they convert.
- **Click-to-Messenger / WhatsApp** — situational; wins for conversational offers if you can reply fast (or run a qualifying bot). A test, not the spine.
- **Click-to-call** — for the highest-intent slice; secondary CTA, not primary cold.
- **Test first:** Instant Form (Higher-intent) vs. the LP, same objective + audience, judged on **cost-per-booked-audit.** Turn on **Conversion Leads** optimization once GHL can send booked/qualified status back, so Meta optimizes toward leads that book, not raw submits.

**The deciding axis is speed-to-lead, not page-vs-no-page.** An instant-form lead decays in *minutes* (people forget a pre-filled tap in 30 seconds). Instant forms beat the LP for this brand **if and only if** GHL fast follow-up exists — that's **RE-203, still unwired**. Until then you can't run the instant-form lane at its advantage.

## Google Search specifics
Tight ad-group themes; query → RSA → H1 message-match. Run **both** the LP form and tap-to-call, plus a **call-only ad group** for "missed calls / answering service" (a roofer searching that at 9pm wants to talk). Note: call-only can't be retargeted and loses the data trail — keep the LP for typers + the retargeting trail.

## Cold email specifics
Reply-first sequence (3–5 plain-text steps, one personalized observation each); CTA = a question, not a link. LP link only in email 2–3 with a UTM. Deliverability is non-negotiable in 2026: SPF/DKIM/DMARC with alignment, RFC 8058 one-click unsubscribe, spam-complaint rate under ~0.3%. US B2B is generally OK under CAN-SPAM; non-US needs a lawful basis (GDPR/CASL). Treat sole-proprietor contractors on personal Gmail as a higher-complaint, list-hygiene risk.

## Retargeting / warm
Three concentric audiences: hot LP-abandoners → `#audit` deep-link; warm local-only engaged → proof-led creative; owned list → direct outreach + reinforcement. **Scope audiences local-only** (never retarget a distributor owner with a roofer ad — funnel separation). Frequency caps; exclude converters (audit-booked + GHL "booked"); 30/90-day windows. Advantage+ with custom audiences as a *seed*, not the primary lever.

## Conversion tracking — VERIFY BEFORE SPEND (launch blockers)
The workflow read the repo and found gaps that make spend blind:
1. **No Meta Lead event.** `lib/analytics.ts` `track()` dispatches only to gtag, never `fbq`. The Meta Pixel mounts site-wide (`components/integrations/MetaPixel.tsx` → `app/layout.tsx`) and fires **PageView only** — so retargeting/lookalikes work, but there's no `Lead` signal to optimize toward. Fix: fire `fbq('track','Lead')` on submit **and** a server-side **CAPI Lead** from `app/api/revenue-leak-audit/route.ts` (dedupe on `submissionId` as `event_id` — copy the GA4 Measurement-Protocol failsafe pattern already in that route).
2. **No Google Ads conversion fires anywhere** (Search launch blocker). The `/revenue-engine/audit-booked/` comment claims it's "the single place a conversion fires," but nothing does. Pick one: import the GA4 `generate_lead` event as an Ads conversion in the Google Ads UI, **or** add a `gtag('event','conversion', {send_to:'AW-…/<label>'})` on the thank-you page behind Consent Mode. Verify in Ads conversion diagnostics before spending or Smart Bidding has no signal.
3. **Add social proof to the LP** (lifts every channel, decisive for cold Meta): a recovered-revenue figure, 1–2 short reviews, license/years/metro, or the founder's face. The bare loss-aversion H1 + form is high-bounce on the lowest-trust traffic. *Use real, approved proof — do not fabricate.*

## Compliance (carry these — currently the near-term legal exposure)
- **TCPA / A2P 10DLC** — the SMS auto-reply (GHL) texts a number you captured: requires **express-consent language on every capture surface** (LP form + instant form) and a **registered 10DLC campaign**. This is the near-term home-services blocker, independent of HIPAA.
- **Dental / PHI** — the Meta Pixel mounts via the **shared root layout**, so a future dental LP must be **route-gated out of the pixel** (not just "don't paste the snippet"). Server-side, PHI-stripped, BAA-covered conversions only; Enhanced Conversions OFF on the dental variant.

## Open decisions (owner)
1. **RE-203 go/no-go** — ship the GHL form + calendar + instant SMS before any local-service spend, or run one small Search-form test first (honest "one business day" copy) while it's built. Nothing scales honestly until it ships.
2. **Conversion tracking before spend** — choose how the Google Ads conversion fires, and approve building the Meta client Lead event + server CAPI. Today: zero Ads conversion, Meta PageView only.
3. **First Meta test** — approve Instant Form (Higher-intent) vs. LP head-to-head on cost-per-booked-audit, plus the TCPA/10DLC express-consent copy for the SMS auto-reply.
