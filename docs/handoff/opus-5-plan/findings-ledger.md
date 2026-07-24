# Findings ledger

Single source of truth for the Opus 5 program. One row per finding. **Never delete a row** — refuted findings measure model precision, which is half the point.

Format, severity scale, and status values: see [00-README.md](00-README.md#the-ledger-contract).

## Counts

| Status | S1 | S2 | S3 | S4 |
|---|---|---|---|---|
| OPEN | 0 | 5 | 5 | 0 |
| CONFIRMED | 2 | 2 | 0 | 0 |
| REFUTED | 0 | 0 | 0 | 0 |
| FIXED | 0 | 0 | 0 | 0 |
| PROPOSED | 0 | 0 | 0 | 0 |
| DEFERRED | 0 | 0 | 0 | 0 |

Update this table at the end of every phase.

---

## Seeded — recon, 2026-07-24

Found by a read-only recon pass before phase 1. F-001 through F-004 were confirmed by direct file read during the same session; F-005 and F-006 are claims that still need the phase 2 verify pass.

---

### F-001 · S1 · security · CONFIRMED

**Where:** [lib/probe/gate-server.ts:15-23](../../../lib/probe/gate-server.ts#L15-L23)

**Claim:** `PROBE_GATE_SECRET` falls back to the hardcoded string `'dev-insecure-probe-gate-secret'` in production, warning once to the console and continuing.

**Failure scenario:** The fallback value is committed to this repo. If the env var is unset in Vercel, anyone who reads the source can forge an `ss_probe_gate` cookie with `unlocked: true` and `runs: 0`, skipping the email capture entirely and re-arming it at will. The email gate — the entire point of the probe funnel — becomes decorative, and forged cookies drive Anthropic spend up to the remaining IP and global caps.

**Found by:** opus-5 (recon) · **Verified by:** fable-5 (direct read, 2026-07-24) · **Fixed by:** —

**Notes:** Fix is to throw in production when the var is missing rather than degrade. A probe that 500s is a visible, fixable outage; a probe with a public secret is a silent one. Check Vercel env before deploying — this may already be set, which would make it latent rather than live.

---

### F-002 · S1 · security · CONFIRMED

**Where:** [app/api/sales/login/route.ts:34](../../../app/api/sales/login/route.ts#L34), [app/api/strategy/login/route.ts](../../../app/api/strategy/login/route.ts)

**Claim:** Neither login route is rate limited, so `SALES_PASSWORD` can be brute forced at request speed.

**Failure scenario:** `lib/rate-limit.ts` exists and guards all three lead routes at 5 requests per 10 minutes, but the two password routes call `verifyPassword` with no limiter in front. A script can try passwords as fast as the platform answers. The password compare is correctly constant-time, which prevents a timing leak and does nothing about volume. Both areas share one password *and* one session secret (`lib/strategy/auth.ts` re-exports the sales primitives), so one guess opens `/sales` and `/strategy` together — client proposals, pricing, and niche strategy.

**Found by:** opus-5 (recon) · **Verified by:** fable-5 (direct read, 2026-07-24) · **Fixed by:** —

**Notes:** Wire the existing `rateLimit` helper into both routes, tighter than the lead routes. Splitting the two areas onto separate passwords and secrets is a second, larger fix worth its own row if phase 2 agrees.

---

### F-003 · S2 · security · CONFIRMED

**Where:** [lib/sales/auth.ts:18-21](../../../lib/sales/auth.ts#L18-L21), consumed by [app/sales/layout.tsx:33](../../../app/sales/layout.tsx#L33)

**Claim:** The gate opens for any request whose `Host` header looks local, and the host header is client-controlled.

**Failure scenario:** `isLocalHost` accepts `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, and **anything ending in `.local`**, reading from `headers().get('host')`. If any layer between the client and the app forwards an attacker-supplied Host — a proxy, a preview alias, a misrouted custom domain — `/sales` and `/strategy` open with no password. Exploitability depends on how Vercel handles unknown Host values, which is exactly what phase 2 needs to determine.

**Found by:** opus-5 (recon) · **Verified by:** fable-5 (code path confirmed; **exploitability on Vercel not yet tested**) · **Fixed by:** —

**Notes:** Regardless of the verdict, the hardening is one line and free: require `process.env.NODE_ENV !== 'production'` before the localhost branch is even considered. Dev convenience shouldn't be reachable from a production request at all. Fix it in the security wave and let phase 2 decide the severity for the scorecard.

---

### F-004 · S2 · privacy · CONFIRMED

**Where:** [components/forms/LeadMagnetForm.tsx:53-58](../../../components/forms/LeadMagnetForm.tsx#L53-L58), mounted at [components/sections/future-proof/EmailCaptureSection.tsx:67](../../../components/sections/future-proof/EmailCaptureSection.tsx#L67) on `/future-proof-your-seo/`

**Claim:** The form is a stub. It logs the submission to the console, sleeps 600ms, and redirects to the thank-you page. Nothing is sent anywhere.

**Failure scenario:** A visitor fills in email, revenue range, organic share, traffic type, and timeline. The page tells them "We send the survival checklist + a personalised risk score within 60 seconds." They get a thank-you page and nothing else, ever. Every lead from this funnel has been lost for as long as the stub has been live, and the promise on the page is one the system cannot keep.

**Found by:** opus-5 (recon) · **Verified by:** fable-5 (direct read, 2026-07-24) · **Fixed by:** —

**Notes:** The mounting component's own docstring says it drops in "the working LeadMagnetForm" — the code and its comment disagree, which is probably how this survived.

Two problems in one row, and they get different treatment. The code fix — POST to a real handler alongside the other three lead routes, with Turnstile, Zod, and rate limiting to match — lands autonomously. Whether the checklist actually exists to be delivered is a **business question for Artur**, not a code decision. If it doesn't exist, the honest interim move is taking the section down rather than continuing to collect. Flag that as PROPOSED and don't decide it in a fix session.

---

### F-005 · S2 · security · OPEN

**Where:** [lib/probe/gate-server.ts:39-43](../../../lib/probe/gate-server.ts#L39-L43), and `lib/rate-limit.ts`

**Claim:** `clientIp` trusts the leftmost value of the client-supplied `x-forwarded-for` header, so every IP-keyed rate limit can be evaded by sending a random value.

**Failure scenario:** If the leftmost XFF entry is attacker-controlled, a script rotates the header per request and the probe caps (30/h, 100/d), the AI caps (6/h, 10/d), the unlock caps, and the lead-form caps all stop binding. Only the global daily AI ceiling survives, which turns a spend cap into a spend target. Phase 2 must determine what Vercel actually guarantees here — the platform may prepend or normalize, and `x-vercel-forwarded-for` may be the trustworthy header.

**Found by:** fable-5 (recon review, 2026-07-24) · **Verified by:** — · **Fixed by:** —

**Notes:** Do not fix before verifying. Reading the wrong header breaks rate limiting in the opposite direction. Read the Next 16 and Vercel docs on forwarded headers first.

---

### F-006 · S3 · security · OPEN

**Where:** [lib/probe/fetch.ts:113-115](../../../lib/probe/fetch.ts#L113-L115)

**Claim:** DNS rebinding window in the SSRF guard. `assertHostnameIsPublic` resolves the hostname and checks the IP, then `fetch()` resolves it again independently, so a hostname with a short TTL can answer public on the first lookup and private on the second.

**Failure scenario:** Attacker controls a domain with a 1-second TTL. First resolution returns a public IP and passes the check. The fetch resolves again and gets `169.254.169.254` or an internal address. The rest of the layer is solid — scheme allowlist, private-range blocks, 3-redirect cap, 5s timeout, 2MB cap — so this is the one seam.

**Found by:** opus-5 (recon) · **Verified by:** — · **Fixed by:** —

**Notes:** Real but narrow, and the practical impact depends on what a serverless function can reach. Verify reachability before spending effort; a full fix means pinning the resolved IP through the connection, which is awkward in the runtime. `lib/probe/fetch.ts` has no tests at all — that gap is worth more than this finding.

---

## Phase 0 — measurement findings, 2026-07-24

Found while establishing the baseline. Nothing was fixed.

---

### F-007 · S3 · quality · OPEN

**Where:** [package.json](../../../package.json) `lint` script, [eslint.config.mjs](../../../eslint.config.mjs)

**Claim:** `pnpm lint` is effectively unusable — bare `eslint` with ignores for only `.next/`, `out/`, `build/`, so it lints the `.engine/` submodule, the legacy `seo-project/` tree, and all of `docs/`; it produced zero output in 5 minutes before being killed.

**Failure scenario:** Any agent or CI step that runs the documented `pnpm lint` check hangs or times out, so the check gets skipped in practice — which is how 44 source errors accumulated (F-008). The repo's own definition of done ("lint clean on changed files") can't be executed as written.

**Found by:** fable-5 (phase 0) · **Verified by:** — · **Fixed by:** —

**Notes:** Scoped run (`npx eslint app components lib sanity scripts`) completes in 10.7s. Fix candidate: add ignores (or scope the script). Baseline: `baseline/toolchain.md`.

---

### F-008 · S3 · quality · OPEN

**Where:** `app/`, `components/`, `lib/` (list in `baseline/toolchain.md`)

**Claim:** The source tree has 44 eslint errors and 9 warnings: 25× `@next/next/no-html-link-for-pages` (legal pages using `<a>` for internal routes), 6× `react-hooks/set-state-in-effect`, 4× `react-hooks/purity`, 4× `react-hooks/immutability`, plus unused vars and unescaped entities. Error files include `components/forms/LeadForm.tsx` and `components/forms/FullGrowthQuoteForm.tsx`.

**Failure scenario:** `<a href>` to internal pages forces full document reloads off the legal pages; the react-hooks violations (setState-in-effect, purity, immutability in the two lead forms) are the exact rule class that produces render loops and stale-state bugs under React 19 concurrency — and today no check would catch a new one (F-007).

**Found by:** fable-5 (phase 0) · **Verified by:** — · **Fixed by:** —

**Notes:** Fix in the quality wave after F-007 makes linting runnable.

---

### F-009 · S2 · quality · OPEN

**Where:** [package.json](../../../package.json) `test` script (`node --test lib/`), Node v20.16.0

**Claim:** The test runner cannot load TypeScript at all — Node 20.16 predates type stripping and the `--test` glob only matches `.js`-family files — so 67 of 72 `lib/` files, including every top-risk module (`probe/fetch.ts`, `sales/auth.ts`, `probe/gate-server.ts`, `rate-limit.ts`, `probe/token.ts`, `probe/ai.ts`, `lead-form/submit.ts`), are structurally untestable, not merely untested.

**Failure scenario:** Wave 3 tries to write the failing-test-first fixes the program requires for the SSRF layer and the auth code and cannot; a regression in any of those modules ships with `pnpm test` green at 34/34.

**Found by:** opus-5 (recon, pre-identified in the phase 0 brief) · **Verified by:** opus-5 (phase 0 tests-map agent, direct measurement) · **Fixed by:** —

**Notes:** **Blocks wave 3. Decision for Artur** — options and trade-offs in `baseline/tests.md §5`; recommendation is a `tsx` loader now and a separate Node 24 LTS upgrade (Node 20 is past EOL, see `deps.md`). Related: F-013.

---

### F-010 · S2 · perf · OPEN

**Where:** `https://salesolution.net/` (production homepage)

**Claim:** Homepage LCP is 4,194ms on desktop with no CPU throttle (Lighthouse 13.4, perf score 78) — the worst vital on the site, on the funnel entry page.

**Failure scenario:** FCP is 470ms and speed index 1,051ms, so paint starts fast and then the LCP element lands ~3.7s later — a late-arriving hero element. Mobile will be worse. Every funnel starts here; a 4.2s LCP is ranking and bounce drag on the exact page the ads and probes point at.

**Found by:** fable-5 (phase 0, Lighthouse) · **Verified by:** — · **Fixed by:** —

**Notes:** Cause not yet diagnosed (measurement only). Note production predates the local homepage rework — lens F must re-measure locally and diagnose against current code, not just the deployed build. Baseline: `baseline/vitals.md`.

---

### F-011 · S3 · perf · OPEN

**Where:** `https://salesolution.net/book-growth-call/`

**Claim:** Total page weight is 5.95MB — triple any other page — because the Calendly embed chain loads Wistia, Sentry, ZoomInfo, navattic, ctfassets, ketch and Optanon (two consent managers) alongside the site's own ~2MB stack.

**Failure scenario:** The buyer clicks "Book a Growth Call" on a phone in a warehouse office and pays a 6MB download to see a calendar; Lighthouse scores stay green only because the chain loads late.

**Found by:** fable-5 (phase 0, Lighthouse) · **Verified by:** — · **Fixed by:** —

**Notes:** Vendor chain, so options are containment (facade/click-to-load embed), not deletion. Two consent managers on one page is also a lens B question.

---

### F-012 · S2 · a11y · OPEN

**Where:** All 8 baseline pages (local prod build, commit `dd66f3c`)

**Claim:** 122 serious axe violations, concentrated in two rules: `color-contrast` (116 nodes across every page — the first flagged node on every page is the same shared-component selector `.xl\:inline`) and `target-size` (6 homepage HeroProbe example-toggle buttons under 24px, WCAG 2.2).

**Failure scenario:** Low-vision users can't read the muted text pairs anywhere on the site (WCAG 2.2 AA 1.4.3 fails on every page); the homepage probe example chips are too small to hit reliably on touch.

**Found by:** fable-5 (phase 0, axe-core) · **Verified by:** — · **Fixed by:** —

**Notes:** One token-level fix likely clears most of the 116 — lens E identifies the exact token/class pairs. Full node lists in session `axe-results.json`; method in `baseline/a11y.md`.

---

### F-013 · S3 · quality · OPEN

**Where:** [lib/sitemap/registry.reconcile.test.mjs](../../../lib/sitemap/registry.reconcile.test.mjs) (header comment lines 22–25)

**Claim:** The sitemap test never executes the module it guards — it regexes `registry.ts` source text for `u('…')` literals — so it stays green if the module fails to compile or its XML serializers (`toUrlsetXml`, `toIndexXml`) emit invalid output.

**Failure scenario:** An escaping or `<lastmod>` regression makes Google reject the whole sitemap document while `pnpm test` shows 34/34 green — a false-confidence failure worse than having no test.

**Found by:** opus-5 (phase 0, tests-map agent) · **Verified by:** — · **Fixed by:** —

**Notes:** Consequence of F-009 (the workaround exists because `.ts` can't be imported). Fix properly once the runner decision lands: execute the serializers and assert on output.

---

### F-014 · S2 · correctness · OPEN

**Where:** [lib/lead-form/submit.ts:72-86](../../../lib/lead-form/submit.ts#L72-L86), `lib/lead-form/submit-audit.ts:72-80`, `lib/lead-form/full-growth-quote-submit.ts:122-131`

**Claim:** All three lead submit handlers treat "no delivery channel configured" as success — they `console.log` the lead, return `ok: true`, and the user is redirected to the thank-you page. Only the FGO handler guards one half-configuration (`RESEND_API_KEY` without `RESEND_TO_EMAIL`).

**Failure scenario:** One renamed or missing env var in Vercel (`HUBSPOT_FORM_ID`, `RESEND_TO_EMAIL`, …) and every lead from all three funnels is silently dropped while every visitor sees "we received your details" — the F-004 stub failure mode reproduced at the infrastructure level, with no error, no alert, no retry, no queue.

**Found by:** opus-5 (phase 0, tests-map + funnel agents independently) · **Verified by:** — · **Fixed by:** —

**Notes:** The dev-ergonomics intent ("don't punish the user locally") is legitimate; the fix is to fail loudly (5xx or alert) when `NODE_ENV === 'production'` and zero channels are configured. Whether production env is currently complete needs a Vercel dashboard check — same class as F-001's deploy-env caveat.

---

## Wave 1 — probe + funnel

_Phase 1 appends here._

## Wave 2 — repo sweep

_Phase 4 appends here._
