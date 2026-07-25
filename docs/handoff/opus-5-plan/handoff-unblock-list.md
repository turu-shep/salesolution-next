# Handoff — what only Artur can unblock

**Written:** 2026-07-24, closing the Fable 5 session that authored the pack and reviewed `review/security-hotfix`.

Ledger state at the time of writing: **70 CONFIRMED, 15 REFUTED, 4 FIXED**, 97 rows adjudicated. Phase 2 is complete. The bulk of remaining work is phase 3 fix waves.

This file exists because nine findings are stuck on facts that cannot be read from the repo. `baseline/platform-notes.md` records why: Vercel production env is not readable from this machine, there is no `.vercel` link and no CLI, and the guardrails forbid the network probing that would settle it. Each one is a dashboard lookup that takes a minute and moves a finding between "theoretical" and "live."

---

## The checks, ranked by what they decide

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

**Run the smoke checks first.** Delegated to an agent at the close of this session; if that run is lost, the checklist is in [05-phase-3-fix-waves.md](05-phase-3-fix-waves.md#smoke-checks-before-any-merge). The two that matter: both gated areas still admit a correct password, and all three lead forms still submit. `lib/rate-limit.ts` was rewritten underneath all of them, and F-003's fix means a local production build now demands the `/sales` password where it previously did not.

**Do not load-test any rate limit to verify it.** `/api/probe` bills DataForSEO per distinct domain. Read the limiter and reason about the window.

---

## Settled — do not re-litigate

Two findings I raised earlier in the program have since been adjudicated with better evidence than I had, and both should stay closed:

- **F-005 (XFF spoofing in the probe) — REFUTED on reachability.** The file containing `clientIp` exists only in unpushed local commits, so it does not run in production. The live-code version of this concern is tracked separately as F-097 above.
- **F-009 (test runner cannot load TypeScript) — REFUTED.** The runner situation was corrected; `pnpm test` now reports 34 passing. Writing the tests it unblocked immediately surfaced F-096, a latent dead-code bug.
