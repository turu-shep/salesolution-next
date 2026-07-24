# Phase 2 — Verify and triage

Every `OPEN` finding gets attacked before it earns a fix. This phase exists because the most expensive failure mode in an audit isn't a missed bug — it's a confident, wrong finding that gets "fixed," breaking working code and burning trust in the whole ledger.

It's also the sharpest measurement in the program. **Finding precision — what fraction of what a model reported survives adversarial review — says more about model quality than finding volume ever will.** A model that reports 60 findings with 30% precision is worse than one reporting 20 at 85%.

Run after each audit wave.

---

## How verification works

Each finding goes to verifiers **prompted to refute it**, not to assess it. The burden of proof sits on the finding, and uncertainty resolves to REFUTED.

- **S1 and S2:** three verifiers, each with a different lens — *does the code actually do this*, *is it reachable in production*, *does it actually cause harm*. Majority rules. Perspective diversity matters more than verifier count; three identical skeptics agree with each other, not with reality.
- **S3 and S4:** one verifier. Cheap findings don't deserve expensive process.

A verifier must read the code path, not reason about it from the finding text. Verdicts that never opened the file don't count.

**Platform-dependent findings** (F-003 host header, F-005 forwarded-for) need real evidence about Vercel and Next 16 behavior, from `node_modules/next/dist/docs/` or vendor docs. "Probably fine on Vercel" is not a verdict. If it can't be settled from documentation, mark it CONFIRMED with an explicit uncertainty note and let the fix be defensive — the cheap hardening usually costs nothing.

---

## Prompt

> Read `docs/handoff/opus-5-plan/00-README.md` and `01-guardrails.md` first.
>
> Adversarially verify every `OPEN` finding in `findings-ledger.md`, then triage the survivors.
>
> **Verification.** For each OPEN finding, spawn verifiers whose job is to **refute** it. S1 and S2 get three with distinct lenses — (1) does the code do what the finding claims, reading the actual path; (2) is it reachable in production, given deploy config, env, and platform behavior; (3) does it cause real harm, and how bad. S3 and S4 get one. Majority verdict wins. **Uncertainty resolves to REFUTED** — the finding carries the burden.
>
> A verifier that didn't open the file doesn't get a vote. Reasoning from the finding text is exactly the failure this phase exists to catch.
>
> For platform-dependent findings, get evidence from `node_modules/next/dist/docs/` or vendor documentation. If it can't be settled, mark CONFIRMED with the uncertainty written down and prefer a defensive fix.
>
> **Ledger updates.** Set status `CONFIRMED` or `REFUTED` on every row — never delete a refuted one, it's eval data. Record `Verified by: <model>`. Adjust severity where verification changed the picture, and say why in Notes.
>
> **When a finding is refuted because the behavior turned out to be intentional, append it to `08-known-deliberate.md`** with the reason and an escape hatch describing what would make it a real finding. That file is the main lever on precision — a model can't avoid reporting a deliberate decision nobody told it about, and every entry you add stops the next wave from spending a verify cycle on it.
>
> **Triage.** For every CONFIRMED finding, decide one of:
> - **FIX** — code, config, or tests. Assign to a wave: security → correctness → quality/tests → UX/a11y → perf → SEO → flow.
> - **PROPOSED** — the fix would touch customer-facing copy, pricing, positioning, or a GATE-signed decision. Write the proposed change in Notes. **Do not edit it.**
> - **DEFERRED** — real, not now. Written reason required.
>
> Group the FIX set into waves that can each be verified independently. Flag findings whose fixes collide, and order them so a later fix doesn't undo an earlier one.
>
> **Output** → `docs/handoff/opus-5-plan/triage-wave-<n>.md`: the fix plan wave by wave with ledger IDs, the PROPOSED list with the copy suggestions written out for my sign-off, the DEFERRED list with reasons, and a **precision line** — findings reported, confirmed, refuted, and the resulting percentage, per lens and overall. That number is the eval.
>
> **Guardrails.** Verification changes no code. Update the ledger count table before finishing.

---

## Workflow shape

Pipeline, not barrier: each finding verifies as soon as its verifiers return, and nothing waits on the slowest one.

```js
const OPEN = /* parse OPEN rows from findings-ledger.md */
const verified = await pipeline(
  OPEN,
  (f) => parallel(
    (f.severity === 'S1' || f.severity === 'S2'
      ? ['does the code actually do this — read the path',
         'is it reachable in production — deploy config, env, platform behavior',
         'does it cause real harm — and how bad']
      : ['does the code actually do this — read the path']
    ).map((lens) => () =>
      agent(`Try to REFUTE this finding via: ${lens}\n\n${JSON.stringify(f)}\n\n` +
            `Read the actual code. Default to refuted=true when uncertain — the finding carries the burden of proof.`,
            { label: `verify:${f.id}`, phase: 'Verify', schema: VERDICT }))),
  (votes, f) => ({ ...f, confirmed: votes.filter(Boolean).filter((v) => !v.refuted).length > votes.length / 2 }),
)
```

---

## Done when

No `OPEN` rows remain for this wave, every CONFIRMED row has a wave assignment or a DEFERRED reason, `triage-wave-<n>.md` exists with the precision numbers, and the count table matches the rows.
