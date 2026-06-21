# /sales — cold-call playbook & cockpit

*Private, internal. Created 2026-06-19.*

This folder is the documentation root for **everything sales** — the cold-call strategy and the private `/sales` cockpit that runs it. It is internal: the live area at `salesolution.net/sales/` is password-gated and `noindex` (open on localhost, password-required in production). Not customer-facing.

It sells the two things the business sells, as two separate motions on the phone:
- **Revenue Engine** → local-service owners (roofers, dentists). Call books the **Revenue Leak Audit**.
- **Industrial services** → distributor/manufacturer owners ($5M–$75M). Call books a **Growth Call**.

The unlock for the Revenue Engine track: before dialing, we test the prospect's phone, Google profile, and site — so the opener names the **real leak we just found**. The cold call demonstrates the exact problem we sell against.

## The docs

| Doc | What it is |
|---|---|
| [00-build-and-cockpit-design.md](./00-build-and-cockpit-design.md) | The app: `/sales` routing, the password gate, the content data model, the cockpit UX, the logger, build order. |
| [01-strategy-overview.md](./01-strategy-overview.md) | The two-motion model, the one rule of every call, daily dial-math, how to run the cockpit. |
| [02-revenue-engine-roofing-script.md](./02-revenue-engine-roofing-script.md) | Full home-services (roofing-forward) script — pre-call, open, hook, discovery, pitch, close, branches. |
| [03-revenue-engine-dental-script.md](./03-revenue-engine-dental-script.md) | Full dental-practice script — front-desk gatekeeper, chair-time leak, HIPAA reassurance. |
| [04-industrial-script.md](./04-industrial-script.md) | Full industrial script — AI-villain hook, gatekeeper navigation, Growth Call close. |
| [05-objection-library.md](./05-objection-library.md) | The shared battle-card library (both motions) the cockpit search hits mid-call. |
| [06-cadence-and-multitouch.md](./06-cadence-and-multitouch.md) | Voicemail scripts + the call/email/LinkedIn multitouch that interlocks with the reply-first cold-email sequence. |
| [07-compliance.md](./07-compliance.md) | TCPA, DNC, call-recording consent — web-verified, with a safe-defaults checklist. |
| [08-metrics.md](./08-metrics.md) | The funnel, the per-call outcome enum (the logger contract), benchmarks, weekly review. |
| [09-sales-psychology.md](./09-sales-psychology.md) | The operator's manual on the craft itself — frames, push/pull, authority, reading people, pulling decision-makers in, questions, tonality, objections, closing, your own state, ethics, and how to make it instinct. Rendered at `/sales/psychology`. |
| [10-learning-and-skills.md](./10-learning-and-skills.md) | The beginner curriculum: the step-by-step path, the skills dashboard, and a clinically-sourced voice/English reference. Interactive tracker at `/sales/learn`. |

## Status

- Design approved 2026-06-19; the cockpit is **built** (2026-06-20) and live at `/sales/playbook` — the gate + `/sales` shell, the typed playbook data (`lib/sales/playbook/`), the renderer (track toggle, pre-call card, branching stage flow), the `/`-hotkey objection search, and the per-call logger with CSV/JSON export. Localhost is open; production needs `SALES_ENABLED` + the password.
- Content (`01`–`08`) authored via a multi-agent draft → adversarial red-team → finalize pass; compliance web-verified.
- Apollo list-building / CRM is a prep step run via the Apollo MCP between call blocks, not wired into the app (v1).
- **Owner-pending before live calls:** the `[VERIFY]` content items (price bands, the dental BAA list, that `561-531-4339` routes to Artur, the guarantee/terms confirmation) and the GHL/Apollo wiring.
