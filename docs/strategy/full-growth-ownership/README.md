# Full Growth Ownership — operator pack

Internal templates and runbook for the FGO premium tier. Public-facing
assets live in code:

- Landing page — [app/(site)/services/full-growth-ownership/](../../../app/(site)/services/full-growth-ownership/)
- Qualifier form + thank-you — [app/(site)/full-growth-quote/](../../../app/(site)/full-growth-quote/)
- Submit pipeline (team notify + auto-ack + HubSpot) — [lib/lead-form/full-growth-quote-submit.ts](../../../lib/lead-form/full-growth-quote-submit.ts)
- API route — [app/api/full-growth-quote/route.ts](../../../app/api/full-growth-quote/route.ts)

## This folder

| File | Use |
|---|---|
| [operational-readiness-runbook.md](operational-readiness-runbook.md) | **Start here.** Pre-launch checklist, env vars, 24h SLA runbook, volume math + the trap. |
| [SOW-shape-a-fractional-gtm.md](SOW-shape-a-fractional-gtm.md) | Fill-in SOW for Shape A (Fractional GTM Engineer — flat by company size, 6-mo min). |
| [SOW-shape-b-coordinated-retainer.md](SOW-shape-b-coordinated-retainer.md) | Fill-in SOW for Shape B (Coordinated Retainer — priced by service count, 3-mo min). |
| [sample-1page-diagnostic.md](sample-1page-diagnostic.md) | The 24h diagnostic template + one worked sample to adapt for the first submissions. |
| [measurement-loop.md](measurement-loop.md) | What the qualifier measures in GA4/HubSpot, the funnel to build, and the signals to watch before re-tuning the page. |

## Flow, end to end

1. Buyer submits `/full-growth-quote/` → `POST /api/full-growth-quote/`.
2. Pipeline fires: Turnstile verify → HubSpot (when configured) → team
   notification to `RESEND_TO_EMAIL` → submitter auto-ack.
3. Artur replies within 24 business hours with a filled
   [1-page diagnostic](sample-1page-diagnostic.md) + suggested call time.
4. Within 48h of the call: a personalized SOW from the matching template.
5. Stripe link / wire → kickoff (billing is monthly **in advance**).

Reference spec: the Full Growth Ownership page spec (§3 qualifier, §4 pricing,
§9 operational readiness, §10 volume expectations).
