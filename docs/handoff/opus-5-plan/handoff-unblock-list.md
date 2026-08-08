# Handoff — what only Artur can unblock

**Written:** 2026-07-24, closing the Fable 5 session that authored the pack and reviewed `review/security-hotfix`.

Ledger state at the time of writing: **70 CONFIRMED, 15 REFUTED, 4 FIXED**, 97 rows adjudicated. Phase 2 is complete. The bulk of remaining work is phase 3 fix waves.

This file exists because nine findings are stuck on facts that cannot be read from the repo. `baseline/platform-notes.md` records why: Vercel production env is not readable from this machine, there is no `.vercel` link and no CLI, and the guardrails forbid the network probing that would settle it. Each one is a dashboard lookup that takes a minute and moves a finding between "theoretical" and "live."

---

## The checks, ranked by what they decide

**0. Are `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set in Production?**

Added after the smoke run, and it outranks everything below it because it decides whether the fixes on `review/security-hotfix` are worth what they look like. **Every throttle observed during smoke testing ran on the in-memory fallback**, which is per-process. On serverless that means one counter per warm instance, reset on every cold start — so a brute-forcer spreading requests across instances gets a fresh budget each time, and the login limit that fixes F-002 is far weaker than 5-per-15-minutes reads.

The fallback is deliberate and it warns (see `08-known-deliberate.md`), but it was designed as degradation, not as the production configuration. If Upstash is unset in Vercel, set it before treating F-002 or F-094 as closed.

**0b. Is `SALES_ENABLED` set to `"true"` in Production?**

Locally it is not, so `/sales` and `/strategy` return 404 before ever asking for a password — the smoke run needed an explicit override to test the gates at all. Confirm production runs with it on, or the cockpit is unreachable; confirm it is *only* on in production, or the gate is exposed where you did not intend.

**1. Does Vercel's edge overwrite inbound `x-forwarded-for` with the true client IP, or append to it?** (F-097)

This single answer decides the value of every rate limit on the site. Each limiter — the login throttle that fixes F-002, the probe throttle that fixes F-094, and all three lead-form limits — keys on the leftmost `x-forwarded-for` value. If the edge overwrites it, they all bind and F-097 is latent. If it appends or passes through, an attacker rotating the header gets a fresh budget per request and none of them bind, including the brute-force protection just written for the password gates.

Nothing else on this list has that blast radius. `node_modules/next/dist/docs/` has no guidance (zero hits for `x-forwarded-for`) and `@vercel/functions` is not installed, so this is a vendor-doc or dashboard question.

**2. Are `RESEND_*` and the `HUBSPOT_*` form IDs actually set in Production?** (F-014)

All three lead handlers treat "no delivery channel configured" as success: they log the lead, return `ok: true`, and send the visitor to a thank-you page. If any of those are missing in production, leads are being dropped silently right now, and the visitor has no way to know. Same failure class as the stub `LeadMagnetForm` — worth checking first if you only check one thing on this list for revenue reasons rather than security ones.

**3. Is `TURNSTILE_SECRET_KEY` set in Production?** (F-049)

The client renders the widget whenever the public site key is set, but the server only verifies when the separate secret is set. If the secret is missing, rotated, or expired, all three forms accept any submission with no bot check, nothing logs, and the widget still renders — so the gap is invisible in the UI. Worse, the success response returns the channel status, so one submitted lead reveals whether the check is enforced.

**4. Is `PROBE_GATE_SECRET` set in Production?** (F-001)

Latent today because the probe is unshipped. It becomes live the moment the probe merges. If unset, the gate cookie is forgeable with a secret published in this repo and the email capture is decorative. Check before the probe deploys, not after.

**5. Is `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` set in Production?** (F-022)

Decides whether HubSpot tracking is actually loading on every public page without a consent check. The consent bridge its own comment points at does not exist in the repo.

Also on the list but lower leverage: **F-025** (withdrawing analytics consent leaves the `_ga` cookie and the server-side GA4 path unchecked) and **F-064** (all three `verifyTurnstile` copies call `res.json()` without checking `res.ok`, so a non-JSON response from Cloudflare escapes as an unhandled exception). F-064 is a straight code fix and needs no dashboard check.

---

## Decisions, not lookups

**Merge and ship `review/security-hotfix`.** It closes F-094, a live S1: the deployed `/api/probe` is an unauthenticated, unthrottled, internet-facing URL fetcher. It also closes the unthrottled password gates (F-002) and the host-header bypass (F-003). Verified at commit `7ba38a4` — `tsc` clean, tests pass, build compiles, full diff read. Merging deploys to production. The pre-merge review is in [review-security-hotfix.md](review-security-hotfix.md).

**The smoke checks have been run.** Report: `docs/handoff/opus-5-plan/smoke-checks-security-hotfix.md`, commit `20d8ae0` on `review/security-hotfix`. **Verdict: functionally safe to merge** — nothing the branch changed is broken and every legitimate path still works.

Both gates admit the correct password, set the session cookie, and survive reloads; a wrong password returns 401 and the sixth attempt returns 429 with `Retry-After: 900`. Alternating between the two login routes still cuts off at six, which proves the shared `rl:login` budget works as intended. All three lead forms render, reject malformed and schema-invalid payloads with 400, reject cross-origin POSTs with 403, and throttle at the sixth request. All eight child sitemaps resolve, 143 URLs. Thirteen pages produced zero uncaught exceptions and zero first-party console errors.

Two things it could not run: **end-to-end lead delivery** was skipped on purpose, because HubSpot and Resend are configured locally while `TURNSTILE_SECRET_KEY` is not — a valid payload would have written a real CRM record and sent real mail with no captcha in front. Running it needs a sandbox portal and a throwaway inbox. The probe path was skipped because the v2 code isn't on this branch.

**Do not load-test any rate limit to verify it.** `/api/probe` bills DataForSEO per distinct domain. Read the limiter and reason about the window.

---

## New from the smoke run — needs ledger intake

Four observations that are not yet ledger rows. I have deliberately not assigned them F-numbers: other sessions are editing the ledger concurrently and racing on IDs would corrupt it. Whoever next opens the ledger should number these and verify them properly.

**The two login routes did not get the same-origin check.** F-019 added one to the other four public POST handlers; `/api/sales/login` and `/api/strategy/login` were left out. An inconsistency in a security fix is worth a row on its own, whether or not it turns out to be exploitable.

**F-097's app-side half is now demonstrated, not inferred.** During smoke testing, sending a fresh `X-Forwarded-For` after hitting a 429 restored the budget immediately. Be precise about what that proves: the *application* trusts the header. It does **not** prove Vercel passes it through, because nothing sat in front of the local server. The platform question in check 1 above is still the one that decides severity — but the app-side behavior is no longer a hypothesis.

**An Upstash outage costs roughly 4.3 seconds per request**, against 13ms healthy — about 330x, measured, driven by client retries. F-034 correctly stopped a Redis blip from returning 500s, and the cost of that resilience is a request that hangs instead. Worth a perf row and possibly a shorter timeout.

**`RATE_LIMIT_CONFIG` is now a dead export** left over from the pre-policy limiter. Cleanup nit.

---

## Settled — do not re-litigate

Two findings I raised earlier in the program have since been adjudicated with better evidence than I had, and both should stay closed:

- **F-005 (XFF spoofing in the probe) — REFUTED on reachability.** The file containing `clientIp` exists only in unpushed local commits, so it does not run in production. The live-code version of this concern is tracked separately as F-097 above.
- **F-009 (test runner cannot load TypeScript) — REFUTED.** The runner situation was corrected; `pnpm test` now reports 34 passing. Writing the tests it unblocked immediately surfaced F-096, a latent dead-code bug.
