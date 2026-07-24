# Company Strategy v1 — sell the services

**Date:** 2026-07-20 · **Produced by:** deep-research session (10 research streams: 6 internal recon, 3 external market studies, 1 demand-data pull) · **Owner:** Artur (founder sign-offs marked GATE:HUMAN) · **Mission:** maximize service revenue across both motions with the one founder-operator the company has. This package is the strategy, the execution system, and the prompts that run it.

**Status: PROPOSED.** Nothing here overrides signed canon (`docs/strategy/offer-research/00-offer-architecture.md` D1–D12 + §16, `04-signoff-sheet.md`). Where this package sets a number canon doesn't (targets, budgets, cadences), the number is a proposal until Artur signs it in `08-decision-queue.md`.

## The strategy in one paragraph

Five weeks of building produced a complete sales machine — cockpit, scripts, scanner, probe, proposal templates, signed offer architecture, a content engine — and almost none of it is turned on. Zero cold calls logged. Zero content shipped from a 24-issue calendar. Zero case studies publishable. Six commits sit unpushed; production is behind local. The bottleneck is not assets, positioning, or pricing. It is founder hours on the selling motion plus a last mile of keys, pushes, and sign-offs measured in days. So: **turn the key (P0), put the founder on a daily diagnostic-led selling block in two focus verticals (dental + industrial), and let agents produce every input that isn't a live conversation** — lists, scans, openers, drafts, proposals, content, links, reports. Everything else in this package is machinery for that sentence.

## Reading order

| # | File | What it is | Read when |
|---|------|-----------|-----------|
| 00 | this file | Orientation + kernel | First, always |
| 01 | [01-diagnosis.md](01-diagnosis.md) | Where the business actually is: assets, blockers, demand map, competitive reality, constraint ranking | Before questioning any strategy choice |
| 02 | [02-strategy.md](02-strategy.md) | The strategy: guiding policy, focus decision, channel plan per motion, funnel math, 90-day arc, targets | Before planning any week |
| 03 | [03-execution-plays.md](03-execution-plays.md) | Play cards P0–P9 (plus P1.5, the warm-book sweep): steps, owner, tools, DoD, metric | When executing |
| 04 | [04-agent-machine.md](04-agent-machine.md) | The agent roster: 9 named routines with their prompts, cadences, tool wiring, guardrails | When setting up or running automation |
| 05 | [05-operating-cadence.md](05-operating-cadence.md) | The weekly operating system: founder week, KPIs, Linear hygiene, review ritual | Every Monday |
| 06 | [06-master-prompt.md](06-master-prompt.md) | The prompts: session kickoff, weekly review, daily batch | To start any execution session |
| 07 | [07-research-appendix.md](07-research-appendix.md) | External research with sources: demand data, market studies, stats bank with provenance flags | When you need a number or a citation |
| 08 | [08-decision-queue.md](08-decision-queue.md) | Every open founder decision, with a default and what it unblocks | Artur reads this one first |

## How to run this

Paste the **kickoff prompt** from [06-master-prompt.md](06-master-prompt.md) into a fresh Claude Code session. It loads this package, checks live state (git, env, Linear, pipeline), and executes the highest-priority unblocked play. Repeat daily. Monday sessions run the weekly review prompt instead.

## Rules that bind every session run under this strategy

1. **Signed canon wins.** D1–D12 + §16 corrections, the §A sign-offs, the claims library (`docs/strategy/sales/_claims-library.md`), the kill-list and voice rules (`.agents/product-marketing-context.md`). This package never relitigates them.
2. **No fabricated proof, ever.** Claims come from the claims library or they don't ship. [VERIFY]-gated call blocks are not read live until Artur confirms them.
3. **Agents draft; the founder sends, publishes, signs, and spends.** No outreach is sent, no page published, no dollar committed by an agent alone.
4. **Ship before build.** While a P0 item is open, no new asset gets built. A finished thing that isn't live counts as zero.
5. **Decline, don't discount.** The floor formula (`max($30K, ~10% of modeled 12-month gain)`) and the 10:1 test are load-bearing. Below floor → sprint door or a clean no.
6. **Two motions, never merged.** Sell-product (we / published prices / no guarantee / Growth Call) and book-jobs (I / value-in-audit / day-90 guarantee / Revenue Leak Audit) keep their separate voices, doors, stats, and lists.
7. **Compliance is absolute.** TCPA/DNC per `docs/strategy/sales/07-compliance.md`. A "stop calling" is honored instantly and logged.

## What changed since the last handoffs

This package absorbs and supersedes the open threads in `docs/handoff/2026-06/*` and `docs/handoff/06/*` as strategy inputs (they remain the implementation reference for their specific builds). It does not supersede `docs/handoff/2026-07/09/*` (homepage flow + before-launch issues) — those are P0 work items here.
