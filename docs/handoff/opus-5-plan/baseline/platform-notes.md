# Platform evidence for verification (Next 16 / Vercel)

Gathered during phase 0/1 so the platform-dependent findings (F-003, F-005, the Turbopack advisory) can be settled from fact, not guesswork. Cite this in phase 2.

## Next 16 renamed `middleware` → `proxy`

The file convention is now `proxy.ts`, not `middleware.ts` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Training data calls it middleware; this version does not. Relevant docs for the header findings:

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/headers.md` — the `headers()` async function used by `lib/sales/auth.ts` and the probe routes.
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and `.../03-file-conventions/proxy.md` — proxy behavior.
- `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md` — forwarded-header / trusted-proxy behavior when self-hosting vs on Vercel.

## This app ships NEITHER middleware.ts NOR proxy.ts

Confirmed 2026-07-24: no `middleware.*`, `proxy.*` at repo root or `src/`. All auth gating is done in layouts (`app/sales/layout.tsx`) and route handlers, not at the edge.

**Consequence for the `next@16.2.6` "Middleware/Proxy bypass … using Turbopack" high advisory (baseline/deps.md):** the advisory is about bypassing checks performed *in middleware/proxy*. With no middleware/proxy layer, there is no middleware-enforced check to bypass — the gates run in server components/handlers that the advisory's vector doesn't reach. Provisional read: **not exploitable as described here.** Phase 2 lens-A verifier should confirm the advisory's exact mechanism against the version and downgrade/refute accordingly. Still worth tracking the `next` patch version for the separate cache-confusion advisory.

## Environment state — what can and cannot be exercised locally

Checked 2026-07-24 by listing **variable names only** from `.env.local` (values never read or echoed, per guardrails). This determines what phase 3's smoke checks can actually prove.

**Set locally:** `PROBE_GATE_SECRET`, `SALES_PASSWORD`, `SALES_SESSION_SECRET`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`, `DATAFORSEO_USERNAME`/`_PASSWORD`, `PROBE_AI_MOCK`, GA4 + Sanity + Calendly + pixel vars, `CRON_SECRET`, `SANITY_PREVIEW_SECRET`.

**NOT set locally** (documented in `.env.local.example` but absent):

| Missing | Consequence for testing |
|---|---|
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Captcha cannot be exercised locally at all** — the server-side verify is skipped when the secret is unset, and the widget doesn't render. Phase 3 smoke check 1 must say so rather than claim the forms are protected. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | **Both** limiters (`lib/rate-limit.ts` and the probe's `gate-server.ts`) run in per-instance memory locally. Any local test of an F-002 rate-limit fix proves the logic, not the production behavior. |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` | Live AI reads can't run locally — which is good. `PROBE_AI_MOCK` **is** set, so the probe AI path is free to exercise end to end. |
| `SANITY_WEBHOOK_SECRET`, `SENTRY_*`, `NEXT_PUBLIC_GTM_ID` | Webhook/error/tag paths unexercised locally. |
| `HUBSPOT_FGO_FORM_ID`, `HUBSPOT_AUDIT_FORM_ID` | FGO HubSpot delivery is **deliberately** off until the portal form exists ([full-growth-quote-submit.ts:65-69](../../../lib/lead-form/full-growth-quote-submit.ts#L65-L69), comment says so). The audit route falls back to `HUBSPOT_FORM_ID` ([submit-audit.ts:48](../../../lib/lead-form/submit-audit.ts#L48)), so it still delivers. |

Two name-drift claims I checked and **refuted before writing them down**, recorded so nobody re-opens them:

- `.env.local.example` documents `DFS_LOGIN`/`DFS_PASSWORD` while `.env.local` uses `DATAFORSEO_USERNAME`/`_PASSWORD`. Not a defect: [lib/probe/domain.ts:25-26](../../../lib/probe/domain.ts#L25-L26) reads **both**, either name works.
- `OPENAI_API_KEY` sits in `.env.local` but appears in no app code. Not dead: it's used by the operator script `scripts/_gen-industry-images.mjs:73`.

**Vercel production env is NOT readable from here** — the Vercel CLI isn't installed and the repo has no `.vercel` link. So whether `PROBE_GATE_SECRET` (F-001) and the delivery vars (F-014) are set **in production** cannot be settled from this machine. Both findings stay CONFIRMED-as-code-defects regardless, since the fix is to fail closed rather than degrade; but the *live vs latent* question is a dashboard check only Artur can do. Recorded rather than assumed.

## The build is Turbopack; dev is webpack

`next build` output prints "Next.js 16.2.6 (Turbopack)"; `package.json` pins only `dev` to `--webpack` (the documented Next-16-dev-flakiness workaround, known-deliberate). So production IS built with Turbopack — the advisory's precondition is met on the bundler axis; it's the missing middleware layer that removes the exposure, not the bundler.
