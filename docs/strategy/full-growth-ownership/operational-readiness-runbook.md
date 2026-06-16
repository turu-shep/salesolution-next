# Full Growth Ownership — Operational Readiness Checklist & Runbook

Internal runbook for Artur. Read top to bottom before sending the first link to `/full-growth-quote/`. Everything below assumes the FGO funnel from spec §9–10.

---

## 1. Pre-launch checklist

Don't drive traffic until every box is checked. Each one is a place a lead can silently fall through the floor.

### Landing + qualifier
- [ ] `/full-growth-quote/` landing page is live in production and renders both shapes (A — Fractional GTM Engineer; B — 4-in-1 Coordinated Retainer)
- [ ] Qualifier form submits end-to-end on the **production** domain (not just localhost) — fill it in as a real lead and confirm a 200, not a console error
- [ ] Turnstile widget renders on the form and a failed/blank token is rejected server-side
- [ ] Form validation rejects garbage (missing email, empty company) with a usable error, not a silent fail
- [ ] Submission writes/forwards to where you'll actually see it (see routing below)

### It reaches you
- [ ] A test submission lands in your personal inbox via `RESEND_TO_EMAIL` within a minute
- [ ] The lead email contains everything you need to triage: name, company, email, ARR/size, which services, free-text context
- [ ] Auto-acknowledgment email fires to the **submitter** ("got it — 1-page diagnostic within 24h, with a suggested call time") and isn't landing in spam — send a test to a Gmail and an Outlook address
- [ ] `RESEND_FROM_EMAIL` is on a verified domain (SPF/DKIM/DMARC pass), not a generic address that trips spam filters

### You can close
- [ ] Calendar link is live and bookable, points at the right 30-min event, and is the value in `FGO_CALENDAR_URL` (or the `NEXT_PUBLIC_CALENDLY_URL` fallback)
- [ ] SOW template for **Shape A** (Fractional GTM Engineer — flat by company size, 6-mo min) is drafted and ready to personalize
- [ ] SOW template for **Shape B** (4-in-1 Coordinated Retainer — priced by service count, 3-mo min) is drafted and ready to personalize
- [ ] Stripe payment links and/or wire instructions are ready to paste — billing is monthly **in advance**, so you need to collect before kickoff
- [ ] One sample 1-page diagnostic is fully written end-to-end (real-looking company) so you're filling a proven template under SLA, not designing one at 11pm
- [ ] You've done one full dry run: fake submission → email lands → diagnostic filled → reply sent → calendar booked → SOW personalized

---

## 2. Environment variables this funnel depends on

Set these in the production environment (Vercel project settings, not just `.env.local`). The pipeline is built to **degrade gracefully** — a missing optional var logs to console and skips that step rather than 500-ing the form — but a missing *required* var means leads vanish.

### Required — the funnel is broken without these
| Var | What it does | If missing |
|---|---|---|
| `RESEND_API_KEY` | Authenticates the Resend client that sends both the lead-notification and the auto-ack emails | No email sends at all. Submission may still 200 but you never hear about it — silent lead loss. |
| `RESEND_FROM_EMAIL` | The verified `From:` address on both emails | Sends fail or land in spam. Must be on a domain you've verified in Resend (SPF/DKIM). |
| `RESEND_TO_EMAIL` | Your personal inbox the lead notification routes to | The notification has nowhere to go — you don't find out a lead came in. |

### Strongly recommended — anti-spam / abuse
| Var | What it does | If missing |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | Server-side verification of the Cloudflare Turnstile token | Verification is skipped — form still works but is open to bot spam. Set this before any public traffic. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Renders the Turnstile widget client-side (public, ships to browser) | Widget doesn't render; with no client token there's nothing to verify. Pair it with the secret key — both or neither. |

### Optional — scheduling
| Var | What it does | If missing |
|---|---|---|
| `FGO_CALENDAR_URL` | The booking link surfaced to qualified leads / in the auto-ack | Falls back to `NEXT_PUBLIC_CALENDLY_URL`. |
| `NEXT_PUBLIC_CALENDLY_URL` | Fallback calendar link used site-wide | If both are unset, no booking link is shown — you send one by hand in your diagnostic reply. Not fatal, just manual. |

### Deferred — not wired yet, leave unset for launch
| Var | What it's for | Status |
|---|---|---|
| `HUBSPOT_PORTAL_ID` / `HUBSPOT_FGO_FORM_ID` | Mirror submissions into a dedicated HubSpot FGO form/pipeline (the `fgo_*` properties map automatically) | Wired in code, dormant until both vars are set. Unset = no CRM sync; the code skips it silently. Set the portal + a dedicated FGO form id, then create the `fgo_shape`, `fgo_services`, `fgo_revenue_band`, `fgo_headcount_band`, `fgo_marketing_spend_band`, `fgo_best_time`, `fgo_notes` contact properties to start capturing. |
| `GA4_MEASUREMENT_ID` / `GA4_API_SECRET` | Server-side Measurement-Protocol failsafe for the `generate_lead` + `full_growth_quote_request` conversion on qualifier submit | Wired. Unset = no *server* echo fires; the client gtag events still fire (consent permitting). Set both to harden conversion capture against ad-blockers. |

Rule of thumb: the **three `RESEND_*` vars are non-negotiable** for launch. Turnstile pair before public traffic. Everything else is graceful-degradation or deferred.

---

## 3. The 24-hour SLA runbook

A qualifier just landed. The promise is a **written 1-page diagnostic + a suggested call time within 24 hours**. Do this, in order, same day if possible:

1. **Read the lead email** (`RESEND_TO_EMAIL` inbox). Pull: company, ARR/size, which of the five services they flagged, and the free-text context. Form a first read on Shape A vs Shape B before you open the template — size/complexity leans A, "we just want 2–4 services coordinated" leans B.
2. **Open the 1-page diagnostic template** (your proven sample is the scaffold). Save a new copy named for the client.
3. **Fill it** — keep it to one page: current-state read, the 1–2 highest-leverage moves, which shape fits and why, rough monthly range from the pricing bands (don't over-commit a number — "Foundation band, ~$20K/mo, confirmed in SOW"). Operator-grade, no fluff.
4. **Send it** — reply directly to the submitter. Attach/inline the diagnostic, state the recommended shape, and include the suggested call time + booking link (`FGO_CALENDAR_URL`). One clear next action.
5. **Log it** — record the lead somewhere durable (sheet/Notion/CRM): name, company, date in, shape leaning, price band, status = "diagnostic sent." This is your pipeline until HubSpot is wired.
6. **Set the SOW reminder** — task for within 48h of the call: "draft SOW for {{client_name}} ({{shape}}, {{monthly_price}})." Per spec the written SOW goes out within 48h of the call; don't let it slip — the in-advance billing means SOW → payment link → kickoff is the critical path.

SLA target: diagnostic out in **under 24h**, every time. Speed is the differentiator at this tier.

---

## 4. What to expect (volume + the trap)

Ramp math from spec §10. These are qualifier submissions, not closes — this tier is low-volume, high-consideration, slow to compound.

| Period | Qualifiers / mo | Closes / mo |
|---|---|---|
| Months 1–2 | ~2–5 | 0–1 |
| Months 3–4 | ~5–10 | 0–2 |
| Months 5–6 | ~8–15 | 1–3 |
| Months 9–12 | meaningful volume | compounds toward **$60–150K MRR** |

What this means in practice:
- **Months 1–3 are seeding, not harvesting.** A month with zero closes is on-plan. Judge it on qualifier flow and diagnostic quality, not signed deals.
- **It compounds late.** The meaningful MRR ($60–150K) shows up around months 9–12. Don't kill the channel in month 4 because it hasn't paid out.

### The trap (read this twice)
**Do not push FGO at the cost of the productized tiers in months 1–3.** FGO is slow, high-touch, and seductive — one $25K/mo close feels better than ten small ones. But in the early months the productized tiers are what pay the bills and build the case studies that *make FGO credible*. If you starve the productized funnel to chase a handful of FGO whales, you'll have neither when month 6 arrives. FGO is the compounding upside layered **on top of** a healthy productized base — not a replacement for it.
