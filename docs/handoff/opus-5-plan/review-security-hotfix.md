# Pre-merge review — `review/security-hotfix`

**Reviewed:** 2026-07-24 · **Branch:** `review/security-hotfix`, 3 commits ahead of `origin/main` · **Reviewer:** Fable 5

This branch is cut from `origin/main` rather than local `main`, so it carries the security fixes for **live production issues only** and none of the unshipped probe rewrite or the program docs. That separation is the point: it can ship today without waiting on the probe.

## What it fixes

| Finding | Severity | Live before this branch? |
|---|---|---|
| F-094 | S1 | **Yes.** The deployed `/api/probe` had no rate limiting, no captcha, no cookie gate, and no auth — an unauthenticated internet-facing URL fetcher billed to us. |
| F-002 | S1-in-effect | **Yes.** Both password gates were unthrottled, so one shared password was brute-forceable at request speed. |
| F-003 | S2 | **Yes.** `isLocalHost` read the client-supplied `Host` header, so `Host: anything.local` reached the open-gate branch in production. |
| F-019 | S2 | **Yes.** Missing same-origin checks on the public POST handlers. |
| F-034 | S2 | **Yes.** An Upstash blip 500'd every form on the site. |

Nine files, +222/−46. Scope is limited to `lib/rate-limit.ts`, `lib/sales/auth.ts`, the new `lib/same-origin.ts`, and the five route handlers that consume them.

## Verification run

| Check | Result |
|---|---|
| `npx tsc --noEmit` | exit 0, clean |
| `pnpm test` | 8/8 pass |
| `pnpm build` | compiles, route table renders |
| Diff review | Read in full. Policy-based limiter is a sound refactor; `LOGIN_POLICY` at 5 per 15 min leaves room for typos, which is the right trade — locking the owner out is this fix's real failure mode, not leaving the door open. |

The test count is 8 rather than the 34 seen on local `main` because the probe test suites live with the unshipped probe code.

## What is NOT verified

**Functional smoke checks have not been run.** Types, tests, and build all pass, and none of them prove a form still submits or a gate still opens. Before merging, run the checklist in [05-phase-3-fix-waves.md](05-phase-3-fix-waves.md#smoke-checks-before-any-merge). Two items matter most here:

1. **`/sales` and `/strategy` still let you in with the password.** F-003's fix makes `isLocalHost` return `false` whenever `NODE_ENV === 'production'`, so a local `pnpm build && pnpm start` run now requires the password where it previously did not. That is correct behavior and it will look like a regression if you are not expecting it.
2. **The three lead forms still submit.** `lib/rate-limit.ts` was rewritten under all of them.

**The two riskiest files ship with zero tests.** `lib/rate-limit.ts` (141 lines changed) and `lib/same-origin.ts` (new) have no test coverage, and not by choice — see F-009 below.

## Limitations this branch knowingly carries

**F-005 is open and now load-bearing.** Every limiter added here keys on the leftmost value of the client-supplied `x-forwarded-for` header. That is exactly the spoofable pattern F-005 describes, so an attacker rotating the header evades both the login throttle (F-002) and the probe throttle (F-094). The fixes are still a large improvement over nothing — they stop unsophisticated abuse and every accidental hammering — but the controls are weaker than they read, and F-005 has quietly become the thing holding two shipped security controls together. It deserves promotion above its current S2 and a real answer about which header Vercel guarantees.

**F-009 blocks the tests this branch should have had.** The runner cannot load TypeScript: Node 20.16 predates type stripping, and `node --test lib/` only matches `.js`-family files. 67 of 72 files under `lib/` are structurally untestable, including both files this branch changes. Phase 3 requires a failing test before each fix and that was not possible here. Until F-009 is decided — newer Node, a loader, or extracting logic to `.mjs` — every security fix ships unproven at the unit level.

## Merging

**Merging to `main` deploys to production.** The repo is git-connected to Vercel. Run the smoke checks first, and `/code-review ultra` is worth the spend on a security wave — it is user-triggered, so it is Artur's call.

If a merge breaks production, roll back through the Vercel dashboard rather than pushing a follow-up fix under pressure, then reopen the ledger row with what the fix broke.
