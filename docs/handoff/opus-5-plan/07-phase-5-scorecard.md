# Phase 5 — Scorecard and model notes

Two deliverables. `scorecard.md` says what happened to the project. `model-notes.md` says what happened to the model. Keep them separate — the first is a project record, the second is an evaluation, and blending them produces a document that's useless for both.

Run after the fix waves. Consider running the main loop on the other model here: if the waves ran on Opus 5, a Fable read of the same ledger is a second opinion on the calls that mattered.

---

## Prompt

> Read `docs/handoff/opus-5-plan/00-README.md`, the full `findings-ledger.md`, every `triage-wave-*.md`, and everything in `baseline/`.
>
> Produce two documents.
>
> ### 1 — `docs/handoff/opus-5-plan/scorecard.md`
>
> What changed about the project.
>
> - **Before and after**, side by side, from the baseline files and the post-wave re-measurements: build time, bundle and first-load JS on the heaviest routes, Lighthouse scores per page, axe violations by impact, test count and what's now covered that wasn't.
> - **Findings by dimension and severity**, with fixed / proposed / deferred counts.
> - **What actually got safer.** Name the attack or failure that is now closed, in plain terms. "Forged gate cookies no longer bypass the email gate" beats "hardened authentication."
> - **What's still open**, with the reason and what it would take.
> - **The five things I should do next**, ranked, with effort estimates.
>
> Numbers only where they were measured. A gap marked "not measured" is fine; an invented number invalidates the document.
>
> ### 2 — `docs/handoff/opus-5-plan/model-notes.md`
>
> How the model did. This is the eval, and it's only worth writing if it's honest — a glowing writeup with no failures listed is evidence the analysis was shallow, not that the model was flawless.
>
> - **Precision per wave and overall:** reported, confirmed, refuted, percentage. Per lens too — which lenses produced signal and which produced noise. This is the headline number.
> - **What the refuted findings had in common.** The failure *mode* is more useful than the count. Did it hallucinate APIs? Miss that a guard already existed upstream? Reason about the code instead of reading it? Apply generic Next.js knowledge that this version invalidates? Name the pattern.
> - **Fix quality.** How many fixes landed clean on the first attempt. How many needed rework. How many broke something else. How many were larger than the finding called for — scope creep is a real failure mode and this program's guardrails were designed to catch it.
> - **Judgment calls.** Where the model correctly stopped and asked instead of proceeding. Where it should have stopped and didn't. Where it deferred to a guardrail that it could have argued with, and where it overrode one it shouldn't have.
> - **Where it was strongest and weakest**, with ledger IDs as evidence for every claim. No unsupported adjectives.
> - **Fable vs Opus 5**, if both ran phases: where their verdicts differed and who was right in hindsight. Small sample, so report it as anecdote and label it that way — don't dress it up as a benchmark.
> - **What this program should do differently next time.** The pack is a first draft; the run is the test of it.
>
> **Guardrails.** Every claim about model performance cites ledger IDs. If the data doesn't support a conclusion, write "insufficient evidence" and move on. This document's only value is being trusted later.

---

## Ledger hygiene at the end

- Every row has a terminal status: `FIXED`, `PROPOSED`, `DEFERRED`, or `REFUTED`.
- Count table matches the rows.
- `PROPOSED` rows are collected into one list for Artur, each with the concrete change written out and the sign-off it needs.
- Anything `DEFERRED` that's still worth doing becomes a Linear issue on team **SAL**, project **SS SEO**, linked back to its ledger ID.

## Reading the precision number

Some calibration so the number doesn't get over-read.

**Above ~80%** is strong — a model reporting findings it has genuinely verified against the code.
**Around 50–70%** is normal for an adversarial audit and still useful; the verify pass is doing its job.
**Below ~40%** means the audit prompts are inviting speculation, and the fix is the prompt, not the model.

**Precision is not the only axis.** A model that reports three findings at 100% precision and misses the stub form that's been silently discarding leads is worse than one reporting fifteen at 70% that catches it. Recall matters and this program doesn't measure it directly — the closest proxy is what phase 4 finds on surfaces phase 1 already swept, and what `/code-review ultra` catches that the ledger missed. Note both.
