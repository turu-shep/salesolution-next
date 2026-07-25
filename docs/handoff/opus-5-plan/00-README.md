# Opus 5 program — audit, harden, and score the site

**Created:** 2026-07-24 · **Owner:** Artur · **Status:** ready to run

Two goals at once, and they don't conflict:

1. **Improve the product.** Find and fix what's actually wrong across security, compliance, code quality, UX, performance, technical SEO, and the funnels themselves.
2. **Evaluate the model.** Opus 5 replaced 4.8. Every finding gets attributed to the model that found it, the model that verified it, and the model that fixed it, so at the end there's a scorecard instead of an impression.

The second goal is why this is a phased pack and not one big "clean up the repo" session. Attribution only means something if the phases are separated: **find → verify → fix**, never one agent doing all three.

---

## Run order

Each phase is a standalone prompt. Paste it into a fresh session. They share state through one file: [findings-ledger.md](findings-ledger.md).

| # | Phase | Prompt | Output |
|---|-------|--------|--------|
| 0 | Baseline | [02-phase-0-baseline.md](02-phase-0-baseline.md) | `baseline/` — build, test, Lighthouse, axe, bundle numbers |
| 1 | Audit wave 1 (probe + funnel) | [03-phase-1-audit-probe-funnel.md](03-phase-1-audit-probe-funnel.md) | New OPEN findings in the ledger |
| 2 | Verify + triage | [04-phase-2-verify-and-triage.md](04-phase-2-verify-and-triage.md) | Every finding CONFIRMED or REFUTED, severity set |
| 3 | Fix waves | [05-phase-3-fix-waves.md](05-phase-3-fix-waves.md) | Merged branches, ledger rows FIXED |
| 4 | Repo sweep | [06-phase-4-repo-sweep.md](06-phase-4-repo-sweep.md) | Wave 2 findings — everything outside probe + funnel |
| 5 | Scorecard | [07-phase-5-scorecard.md](07-phase-5-scorecard.md) | `scorecard.md` + `model-notes.md` |
| — | Known-deliberate list | [08-known-deliberate.md](08-known-deliberate.md) | Read by every audit phase; grows each wave |

Phases 2 and 3 repeat per wave. Phase 4 feeds back into 2 and 3.

Rough shape: one session for phase 0, one for phase 1, one for phase 2, then one per fix wave — call it eight to twelve sessions end to end, and the fix waves are where it actually varies. Nothing forces you to run them consecutively; the ledger is the handoff, so the program survives being picked up weeks later.

**Two checkpoints where you stop and reassess rather than pressing on:**

After the first triage, look at the precision number. If it comes back below ~40%, the audit prompts are inviting speculation and the fix is the prompt, not the model — rewrite the lens instructions and re-run phase 1 before fixing anything. Fixing a low-precision ledger means shipping changes that mostly didn't need making.

After the security wave, before starting the next one, confirm production is healthy. Merging ships (see phase 3). A broken deploy discovered three waves later is very hard to attribute.

**Before phase 0:** the working tree has 26 uncommitted files, including the whole probe system. Commit it or snapshot it to a branch. Audits against a dirty tree can't be attributed, and fixes can't be reviewed.

---

## Guardrails

[01-guardrails.md](01-guardrails.md) is required reading for every phase. It's the do-not-touch list — GATE-signed copy, the case-study fact ledger, generated files, the content engine submodule, Sanity publishing — plus the three endpoints that bill per call. A sweep that ignores it will trample decisions that were expensive to make, or run up an invoice proving a rate limit works.

[08-known-deliberate.md](08-known-deliberate.md) is required reading for the audit phases. It lists what looks like a defect and is a decision: no CSP, unsigned probe tokens, no CTAs on the learning hub, manual Sanity publishing. Every refuted-because-intentional finding gets appended to it, so precision improves wave over wave.

---

## Model routing

Ambient settings already do most of this: `CLAUDE_CODE_SUBAGENT_MODEL=opus` sends every subagent and workflow agent to Opus 5, and `CLAUDE_CODE_EFFORT_LEVEL=max` outranks everything else.

- **Never pass `model:` or `effort:` in `agent()` calls.** The env vars win anyway, and hardcoding them corrupts the attribution data this program exists to collect.
- **Main loop:** Opus 5 by default. Switch to Fable for phase 2 (triage judgment) and phase 5 (scorecard) if you want a second opinion on the hard calls — and record the switch in the ledger's `verified-by` column, since that's exactly the comparison worth having.
- **Ultracode** is welcome on phases 1, 2, and 4. Those are fan-out shaped. Phases 0, 3, and 5 are mostly sequential.

---

## The ledger contract

One row per finding, in [findings-ledger.md](findings-ledger.md). Never delete a row — REFUTED findings are data about model precision, which is half the eval.

```
### F-042 · S2 · security · OPEN
**Where:** lib/probe/fetch.ts:113
**Claim:** One sentence. What is wrong.
**Failure scenario:** Concrete inputs or state → the wrong outcome. No hand-waving.
**Found by:** opus-5 (phase 1, lens A)
**Verified by:** —
**Fixed by:** —
**Notes:** —
```

**Severity:** S1 exploitable, data-losing, or legally exposed · S2 real user or revenue impact · S3 quality and maintainability · S4 nit.

**Status:** `OPEN` → `CONFIRMED` or `REFUTED` → `FIXED`, `PROPOSED` (copy or positioning, needs your sign-off), or `DEFERRED` (real, not now, reason recorded).

**Dimensions:** `security` · `privacy` · `compliance` · `correctness` · `quality` · `ux` · `a11y` · `perf` · `seo` · `flow`.

---

## Fix authority

**Code, config, and tests: fix autonomously** in verified waves. Build must compile, tests must pass, screenshots for anything visual.

**Copy, pricing, positioning, and any GATE-signed decision: do not edit.** Write the finding as `PROPOSED` with the suggested rewrite in the notes and stop. If a fix genuinely can't land without touching approved copy, that's a `PROPOSED` too.

Every fix wave ends on its own branch. Run `/code-review ultra` before merging.

---

## What the ledger already knows

Recon on 2026-07-24 found six things before phase 1 started. Four are confirmed by direct file read and are seeded as CONFIRMED; two need the verify pass.

- **F-001** — `PROBE_GATE_SECRET` falls back to a hardcoded string that is published in this repo. Anyone can forge the gate cookie. **Correction (phase 2):** this was originally written up here as live in production. It is not. `lib/probe/gate-server.ts` exists only on local `main`, which is 12 commits ahead of the `origin/main` that Vercel deploys — so F-001 is a **pre-launch** defect. Same fix, different urgency. See the "Deployment state" section at the top of the ledger.
- **F-004** — `LeadMagnetForm` is a stub. It **is** genuinely live on `/future-proof-your-seo/` (confirmed present on `origin/main`), it promises a checklist in 60 seconds, and it `console.log`s the email and throws it away.

**The deployment split matters more than any single row.** Production runs a self-contained *probe v1* (one 515-line route, no rate limiting at all — that is **F-094**, an S1 the phase-1 lenses all missed because they read the unshipped v2). The whole v2 probe system — gate, AI read, token reports, scorer, limiter — is local-only. Read the ledger's "Deployment state" section before triaging: 28 wave-1 findings target code that has never shipped.

F-004 is not a code-quality nit. It's collecting personal data under a promise the system never keeps, which puts it in the compliance bucket as well as the revenue one.

One more thing the recon proved by accident: it reported F-004's mounting component at `components/sections/EmailCaptureSection.tsx`, which doesn't exist. The real path is `components/sections/future-proof/EmailCaptureSection.tsx` — right file, right line, wrong directory. The finding was sound and the citation was not. That is exactly the class of error phase 2 exists to catch, and exactly why a verifier that didn't open the file doesn't get a vote.

Also worth knowing: **`npx tsc --noEmit` is clean and all 34 tests pass.** `AGENTS.md` still tells agents to ignore pre-existing `lib/lead-form/*` Zod errors — those are gone, and the instruction should be deleted so it stops granting a blanket excuse.

---

## Done looks like

- Every S1 and S2 either FIXED, PROPOSED, or DEFERRED with a written reason.
- Baseline numbers re-measured after the fix waves, both sets in `scorecard.md`.
- Untested risk surface has tests: the SSRF layer, the gate codec, the session HMAC, the rate limiter.
- `model-notes.md` says something specific about how Opus 5 did — precision on findings, quality of fixes, where it was wrong — with ledger IDs as evidence.
