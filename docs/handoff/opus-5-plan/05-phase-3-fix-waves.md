# Phase 3 — Fix waves

Land the CONFIRMED findings. One wave per session, one branch per wave, each proven before the next starts.

Waves are ordered so that a fix never lands on top of code that's about to be rewritten:

1. **Security** — F-001, F-002, F-003, plus whatever wave 1 confirmed
2. **Correctness** — wrong answers in business logic
3. **Quality & tests** — the untested risk surface, especially `lib/probe/fetch.ts`, the gate codec, the session HMAC, the rate limiter
4. **UX & accessibility** — WCAG AA, states, mobile
5. **Performance** — CWV causes, redundant per-request work
6. **SEO & GEO** — metadata, sitemap drift, `llms.txt`, indexability
7. **Flow** — funnel continuity and CTA consistency

Security and correctness ship first because everything after them is easier to verify on a foundation that isn't moving.

---

## Prompt

> Read `docs/handoff/opus-5-plan/00-README.md`, `01-guardrails.md`, and `triage-wave-<n>.md` first.
>
> Fix wave: **<name>**. Findings: **<IDs>**.
>
> **Branch first:** `git checkout -b fix/<wave-name>-<yyyy-mm-dd>`. Never fix on `main`.
>
> **For each finding, in this order:**
> 1. Re-read the code and confirm the finding still describes reality. Triage may be hours or days old. If it's stale, say so and skip it — don't fix a finding that already dissolved.
> 2. Write a **failing test first** where the logic is testable. The runner is bare `node --test lib/` with no TypeScript loader, so `.mjs` modules are directly testable and `.ts` may need extraction or a loader. If adding a loader is the right call, that's its own finding and its own decision — don't smuggle it into a fix.
> 3. Make the **smallest fix that removes the failure scenario.** Not the most elegant refactor. Adjacent improvements are new ledger rows, not free riders on this diff.
> 4. Prove it: the new test passes, `npx tsc --noEmit` clean, `pnpm lint` clean on changed files, `pnpm test` green, `pnpm build` compiles. Anything visual gets before-and-after screenshots via `scripts/_visual-check.mjs`.
> 5. Update the ledger row: status `FIXED`, `Fixed by: <model>`, and one line in Notes on what changed and why that removes the scenario.
>
> **Commit per finding**, message referencing the ID: `fix(F-012): reject forged gate cookies when PROBE_GATE_SECRET is unset`. Per-finding commits keep the diff reviewable and the attribution clean.
>
> **Stop and ask when** a fix needs a product decision (F-004's "does the checklist actually exist" is exactly this shape), when it would touch copy, pricing, positioning, or a GATE-signed decision, when it needs a new dependency, or when the real fix turns out to be five times larger than triage assumed. Mark the row `PROPOSED`, write what you'd do, move on to the next finding. Don't stall the wave on one blocked row.
>
> **Guardrails.** No opportunistic refactors. No copy edits — if copy must change, humanizer applies and it needs sign-off first. No Sanity publishing. No dependency upgrades unless a finding is specifically about one. Read `node_modules/next/dist/docs/` before writing routing, caching, or metadata code.
>
> **Finish with:** the wave summary — fixed, proposed, deferred, with IDs; the full verification output, pasted not paraphrased; and anything you noticed while fixing that belongs in the ledger as a new OPEN row.

---

## After each wave

**Merging to `main` ships to production.** The repo is git-connected to Vercel (`docs/strategy/vercel-deploy.md`), so a merge is a deploy, not a checkpoint. Treat every merge as a release.

Before merging, run the smoke checks below on the branch. Then run `/code-review ultra` — it's user-triggered and billed, so it's Artur's call rather than the session's, but the security and correctness waves earn it.

### Smoke checks before any merge

Build and tests passing don't prove the funnels still work. Verify on a local production build (`pnpm build && pnpm start`):

1. All three lead forms submit and reach their thank-you pages: `/api/lead`, `/api/revenue-leak-audit`, `/api/full-growth-quote`. Confirm the request returns 200 and the redirect fires. (Turnstile needs its keys; if it can't be exercised locally, say so rather than assuming.)
2. The probe path runs end to end: hero scan → `/ai-readiness/[token]/` → AI panel → email unlock. Use `PROBE_AI_MOCK=1` and one fixture domain.
3. Both gated areas still let you in: `/sales` and `/strategy` with the password, and the session cookie survives a reload.
4. `/sitemap.xml` returns 200 and its child sitemaps resolve.
5. Any page whose components the wave touched renders without console errors.

After a security wave specifically, confirm the thing you hardened still *allows the legitimate path*. The failure mode of a security fix isn't leaving the hole open — it's locking out real users. F-002's rate limit must not lock Artur out of `/sales` on a mistyped password, and F-003's `NODE_ENV` guard must not break local dev.

### If a merge breaks production

Vercel keeps prior deployments; roll back through the dashboard rather than pushing a follow-up fix under pressure. Then reopen the ledger row with status `CONFIRMED` and a note on what the fix broke. A fix that had to be reverted is one of the most informative rows in the whole ledger for phase 5 — record it, don't quietly re-fix it.

Re-run the phase 0 measurements after the performance and accessibility waves and save them as `baseline/after-<wave>.md`. That's the before-and-after the scorecard is built on.

---

## Notes on specific seeded findings

**F-001 (gate secret).** Check the Vercel env before writing the fix — if `PROBE_GATE_SECRET` is already set in production, this is latent rather than live, and the fix is still the same: fail closed instead of degrading to a published default.

**F-002 (login rate limit).** `lib/rate-limit.ts` already exists and guards the lead routes; reuse it rather than writing a second limiter. Tighter window than the lead routes — a password gate has no legitimate high-frequency use. Splitting `/sales` and `/strategy` onto separate passwords and secrets is a larger change; if triage promoted it to its own row, do it in this wave while the auth code is already open.

**F-003 (host header).** Fix defensively regardless of the verdict on exploitability: require `process.env.NODE_ENV !== 'production'` before the localhost branch is reachable at all. One line, no behavior change in dev, closes the question permanently.

**F-004 (stub form).** Two halves. The code half — POST to a real handler matching the other three lead routes, with Turnstile, Zod, and rate limiting — lands here. The product half, whether the promised checklist exists to be delivered, is Artur's call. If it doesn't exist, taking the section down beats collecting emails against a promise nothing keeps. Mark that half PROPOSED.
