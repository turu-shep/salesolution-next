# Prompt: Connect GSC + web analytics so the site is measurable (Linear SAL-405)

**Read `prompts/_CONTEXT.md` first.** Revenue/ops task, separate from the hub. Linear "SS SEO" **SAL-405**.

> **Status update (supersedes the 2026-06-14 snapshot below):** GSC *is* now connected to the
> Ahrefs project (`Salesolution`, id 5379899, verified 2026-06-15 — see
> `docs/strategy/career-path/08-gsc-baseline-2026-06-15.md`). The web-analytics / tracking-install
> part of this task may still apply; re-check before acting. The "not connected" framing below is
> the original ticket context, kept for history.

## Why
As of 2026-06-14 **nothing on salesolution.net is measurable**: Google Search Console is not
connected to the Ahrefs project ("No GSC data available"), and Ahrefs Web Analytics shows 0
visitors/90 days (tracking likely not installed). Until this is fixed, you can't measure the
glossary's impressions/citations, the geo-agency page, or anything else.

## This task is part config (owner) + part code (agent)
Be explicit about which steps the agent can do vs which need the owner's account access.

### Agent can do (in this repo)
1. **Audit current analytics wiring.** Check how analytics is set up — look for GA4 / tag config
   (`docs/strategy/ga4.md` documents the intended setup), any `<Script>`/gtag in
   `app/layout.tsx` or a consent/analytics component (`public/consent-default.js`,
   `lib/analytics.ts`). Confirm whether the tracking script actually loads in production and fires
   (respecting the cookie-consent gating).
2. **Fix any code gap** that prevents analytics from loading/firing (e.g. missing env var, script
   not mounted, consent default blocking everything). Make the minimal change; verify locally.
3. **Verify Search Console can confirm the site:** ensure the property's verification method is
   in place (DNS or an `app` verification file / meta tag). If a verification meta tag/file is the
   chosen method, wire it.

### Owner must do (flag clearly, can't be done from code)
- Add/confirm the GSC property and submit the sitemap (`/sitemap.xml`).
- Connect GSC to the Ahrefs project so impression/click data flows.
- Confirm the GA4 property ID / analytics account.

## Also (hub hygiene)
- Once analytics is live, **exclude `/career-paths/*` and `/glossary/*` from conversion goals and
  retargeting** (junk-traffic rule — that traffic isn't buyers). This is a GA4/Ads config step for
  the owner; note it.

## Definition of done
- A clear split: what you changed in code (verified) vs the owner's checklist for GSC/GA4.
- `next build` compiles; analytics script confirmed loading locally.
- Update Linear SAL-405. Reference: `docs/strategy/career-path/07-research-backlog.md` §2.
