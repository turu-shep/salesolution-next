# Vercel Deploy Guide

End-to-end deployment of the Next.js rebuild to Vercel — from "blank Vercel account" to "live at salesolution.net". Allow ~30 minutes for a first-time deploy, ~5 minutes for subsequent ones.

## 0. Prereqs

You should have:

- A GitHub account (or GitLab / Bitbucket) with this repository pushed to it
- A Vercel account ([vercel.com/signup](https://vercel.com/signup))
- All env vars from [.env.local.example](../../.env.local.example) gathered (some are optional)
- Access to your domain registrar to update DNS at cutover

## 1. Push the repo to Git (if you haven't yet)

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git init
git add .
git commit -m "Initial commit: salesolution.net Next.js rebuild"
git branch -M main
git remote add origin git@github.com:<you>/salesolution-next.git
git push -u origin main
```

Confirm `.env.local` is gitignored (it is — see `.gitignore`). Never commit secrets.

## 2. Connect the repo to Vercel

1. Open <https://vercel.com/new>
2. Click **Import** next to your repo
3. **Project name**: `salesolution-net`
4. **Framework preset**: Vercel auto-detects Next.js — leave it
5. **Root directory**: `./` (default — the project root is at the repo root)
6. **Build command**: leave default (`pnpm build`)
7. **Output directory**: leave default
8. **Install command**: leave default (`pnpm install`)
9. Click **Environment Variables** → paste in everything from `.env.local`
   (see § Environment variable checklist below)
10. Click **Deploy**

First build takes 3–4 minutes. The preview URL becomes available at `https://<project>-<hash>.vercel.app`.

## 3. Environment variable checklist

Required for the production build to succeed and basic site to function:

| Var | Required | Notes |
|-----|----------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ | Same as `.env.local` |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ✅ | `2026-05-19` |
| `SANITY_API_READ_TOKEN` | ✅ | Viewer token; needed for draft mode |
| `SANITY_API_WRITE_TOKEN` | optional | Only if AI agents create drafts in prod |
| `SANITY_PREVIEW_SECRET` | optional | Needed for Studio's "Preview" buttons |
| `SANITY_WEBHOOK_SECRET` | optional | Needed for instant cache invalidation on Studio edits |

To enable lead-form submission delivery:

| Var | Required | Notes |
|-----|----------|-------|
| `HUBSPOT_PORTAL_ID` + `HUBSPOT_FORM_ID` | Either + Resend below | Primary CRM destination |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` + `RESEND_TO_EMAIL` | Either + HubSpot above | Email notification |

To enable analytics + ad tracking:

| Var | Required | Notes |
|-----|----------|-------|
| `NEXT_PUBLIC_GA4_ID` | optional | `G-XXXXXXXXXX` — get from GA4 → Admin → Data Streams |
| `NEXT_PUBLIC_GTM_ID` | optional | `GTM-XXXXXXX` — overrides GA4 if set |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | optional | `AW-17897120027` (same as WP site) |
| `NEXT_PUBLIC_META_PIXEL_ID` | optional | `1246284374271362` (same as WP site) |
| `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | optional | HubSpot browser tracker |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | optional | Bot check on forms |

In Vercel: **Project → Settings → Environment Variables**. Add each, scope to "Production, Preview, Development" unless otherwise needed.

## 4. First preview verification

While DNS still points to the old WordPress site:

1. Open the Vercel preview URL
2. Check `/`, `/services/`, `/category/blog/`, a sample post, `/contact-me/`
3. Submit the contact form once — confirm 200, confirm a lead landed in HubSpot (or Resend)
4. Open `/studio/` — confirm Sanity admin loads
5. Run [Google Rich Results Test](https://search.google.com/test/rich-results) against the preview URL — expect Organization + Article (on posts) + Product (on the pricing page) + FAQPage (where applicable) + BreadcrumbList

## 5. Wire the Sanity webhook to the preview URL first

Per [sanity-webhook-setup.md](sanity-webhook-setup.md), point the webhook at:

```
https://<your-vercel-preview-host>/api/revalidate/
```

Smoke test: edit a post in Studio → refresh on preview → change appears within ~5 seconds.

## 6. Custom domain — staging-only first

Add `staging.salesolution.net` (or any subdomain you own) in Vercel:

1. Project → Settings → Domains → Add → `staging.salesolution.net`
2. Vercel shows the CNAME to set at your DNS provider
3. Add the CNAME — propagation takes minutes to a few hours
4. Once live, re-verify everything at the staging URL

## 7. Cutover plan (Step 15)

When ready to flip production:

### T-7 days
- Lower the TTL on `salesolution.net` A / CNAME records to **300 seconds (5 min)** at your DNS provider
- This means DNS changes propagate fast and rollback is fast if needed
- Verify the preview URL one more time end-to-end

### T-2 days
- Final content sync: any blog edits made on the WordPress site since the last migration get re-imported via Sanity Studio
- Lock content edits on WordPress (no new posts during transition)

### Cutover hour (pick a low-traffic window — typically Tuesday 10am ET or similar)
1. Take a final WordPress backup
2. In Vercel: **Settings → Domains → Add → `salesolution.net`** (also `www.salesolution.net`)
3. At your DNS provider:
   - `salesolution.net` A record → Vercel's IP (`76.76.21.21`)
   - `www.salesolution.net` CNAME → `cname.vercel-dns.com`
4. Watch DNS propagation via [dnschecker.org](https://dnschecker.org)
5. Once live:
   - Curl every URL in `docs/strategy/scripts/parity-check.mjs` (already validated against your local) but now `--new=https://salesolution.net`
   - Verify GA4 realtime, Meta Events Manager, HubSpot lead test
   - Update the Sanity webhook URL to the production domain
   - Submit `https://salesolution.net/sitemap.xml` to Google Search Console immediately

### Post-cutover (T+24h)
- Compare 24h traffic to 7-day pre-cutover GA4 baseline
- Check Search Console for 4xx/5xx spikes
- Run Lighthouse on 5 production URLs
- Keep WordPress origin warm (read-only) for at least 30 days as fallback

## 8. Rollback plan

If anything breaks badly within the first 24h:

1. At DNS provider: revert A record to the WordPress origin IP
2. Within 5–10 minutes (because TTL is low), traffic flows back to WordPress
3. Diagnose the Next.js issue, fix, retry the cutover

Vercel also supports instant rollback from the dashboard: **Deployments → click a previous deployment → Promote to Production**.

## 9. Vercel-specific gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Cold start on serverless functions | First request after idle | Acceptable for marketing; ISR caches output |
| `next/image` blocks on remote CDN | New domain not in `remotePatterns` | Add to `next.config.ts` and redeploy |
| `revalidateTag()` doesn't work on Hobby | Tag-based revalidation is Pro+ | Plan accordingly OR use timestamp-based `revalidate` |
| Edge runtime needed for some routes | Specific perf goals | Default Node runtime is fine for this site |
| Vercel Analytics enabled by default | Extra script | Disable in Project Settings → Analytics if you don't want it |

## 10. Cost estimate

For this site's traffic profile (< 100k visits/month, mostly cacheable static pages):

- **Hobby plan**: Free. Includes 100 GB bandwidth/month, 100 GB-hours serverless. Comfortable fit.
- **Pro plan**: $20/user/month. Required if you need `revalidateTag`, advanced analytics, longer build times, or > 1 team member.

Recommended: start on **Hobby**, upgrade only if a feature genuinely needs Pro (most likely `revalidateTag` for the Sanity webhook revalidation flow).

## 11. Post-launch monitoring

Set up in Vercel:

- **Speed Insights** (free, Real User Monitoring of Core Web Vitals)
- **Logs**: tail with `vercel logs --follow` from the CLI

Plus external:

- **Search Console** at <https://search.google.com/search-console>
- **Sentry** for error tracking ([install instructions](https://vercel.com/integrations/sentry))
- **Uptime monitoring** (e.g., Better Stack or UptimeRobot)
