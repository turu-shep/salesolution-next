# 01 · The $60K math

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** the verdict is the deliverable

Target: **$60,000 in signed Catalog AI revenue by day 60** (start ≈ 2026-08-01, day 60 = 2026-09-29).

This file works backwards from that number to the contact count, then says whether the contact count is reachable. It ends with a verdict that is less comfortable than the target.

---

## 1. What a deal is worth

Everything here is the published rate card. A prospect can read these prices before they reply.

| Tier | Entry rate | 10K–49,999 SKUs | 50K+ SKUs | Minimum |
|---|---|---|---|---|
| **Standard** | $3.00 / SKU | $2.50 / SKU | $2.00 / SKU | $3,000 (1,000 SKUs) |
| **Pro** *(featured, "Most common")* | $7.00 / SKU | $6.00 / SKU | $5.00 / SKU | $7,000 (1,000 SKUs) |
| **Enterprise** | From $15K/mo (50–99,999 SKUs) | $25K/mo (100–249,999) | $50K+/mo (250K+) | 50K SKU minimum; 6-month min, 30-day exit |

*[catalog pricing]*

Recurring, same source: new SKUs at **$1.00/SKU Standard, $2.50/SKU Pro**, included on Enterprise, 48-hour turnaround. Quarterly re-optimization at 25% of the tier price per SKU per quarter on Standard and Pro, included on Enterprise. Translation add-on $0.50/SKU. Standard → Pro upgrades charge the difference (~$4/SKU at tier 1) plus a reprocessing fee; most upgrade 60–90 days after Standard delivery.

None of the recurring revenue lands inside 60 days. The $60K target is install revenue only.

### Deal shapes to expect

| Shape | SKUs | Deal value |
|---|---|---|
| Standard, typical first deal | 3,000–8,000 | **$9,000–24,000** |
| Pro, typical first deal | 1,000–3,000 | **$7,000–21,000** |
| Angle-2 expansion (added SKUs off the line card) | 8,000–12,000 | **$24,000–36,000** |

The headline expansion case: **10,000 added SKUs × $3.00 = $30,000.** Two of those is the whole target.

> **[flag — settle before the first proposal]** 10,000 SKUs sits exactly on the published volume break. At the entry rate the same job is $30,000; at the 10K–49,999 rate it is $25,000. The rate card does not say which side of the boundary 10,000 falls on. That is a $5,000 question on the single biggest deal shape in the plan, and it should be answered on the page, not in a negotiation.

---

## 2. Three routes to $60K

| # | Route | Composition | What it needs |
|---|---|---|---|
| **i** | **Size** | 2 expansion deals ≈ $30K each | Angle 2 cleared (G3), Segment A prospects with long line cards, one of them closing fast |
| **ii** | **Blend** | 1 expansion + 2 mid-size Standard | Angle 2 cleared, plus normal Angle-1 throughput |
| **iii** | **Volume** | 4–6 smaller mixed deals ($9–21K each) | No Angle-2 dependency. Needs roughly double the closes and therefore double the top of funnel |

**Plan for (iii). Hunt for (i).** The list build, the send volume, and the capacity check below are all sized for the volume route, because that is the one that doesn't depend on an unsigned gate. Every Segment A expansion prospect that closes moves the plan toward (i) and buys back list volume that was never comfortable.

---

## 3. The funnel chain

All rates tagged **[playbook]** are population benchmarks from other people's campaigns. They are planning inputs. Nothing here goes in an email.

**Reply rate.** Manufacturing sends reply at **6.1%**; CEO/founder titles at **7.63%**; North America overall at **4.1%**. Campaign-average is 4–5.8%, with 5–10% counted as good. *[playbook]* Two structural multipliers apply and both are baked into `02-icp-targeting.md`: campaigns of ≤50 contacts reply **2.76× higher** than large blasts, and sending 1–2 contacts per company replies at **7.8% vs 3.8%** at ten or more. *[playbook]*

**Positive share.** Roughly **48% of replies** are positive. *[playbook]* Plan on 40–50%.

**Reply → close.** The reference model runs **500 emails → 25 replies → 8 positive → 4 meetings → 1 client**, with ~25% of proposals closing. *[playbook]* That model assumes a slow proposal cycle. Ours is faster for one specific reason: the free Catalog Snapshot already contains three-tier pricing computed against their actual SKU count, and the day-7 500-SKU pilot is the close mechanism, not a separate sale. Reply → signed can run 2–3 weeks.

### Working backwards

```
4–6 closes
  ← ~30–50 positive replies          (positive → close, snapshot + pilot accelerated)
  ← ~70–120 replies                  (positive ≈ 40–50% of replies) [playbook]
  ← ~1,400–2,000 contacts in sequence (reply 6–7.6% at owner titles, manufacturing) [playbook]
  ← ~2,500–3,500 raw Apollo pulls     (verification + dedupe culls 30–40%)
```

The 30–40% cull is not pessimism. Apollo email accuracy runs 60–80%, so raw sends bounce 20–40% against a 2% kill line — verification is mandatory and it throws away real rows. *[playbook]*

---

## 4. Capacity check — does the sending physics produce 1,400–2,000?

| Track | Window | Contacts it can reach |
|---|---|---|
| Track 1 — founder-manual, ≤15/day | weeks 1–4 | **~250** |
| Track 2 — warmed domains, ramped 20→50/mailbox/day | weeks 5–8 | **~1,200–1,500** |
| | **Total** | **~1,500–1,750** |

Inside the required range. At the bottom of it. There is no slack: a warm-up that slips a week, a domain that has to be halted for bounce, or a two-week gap in list replenishment takes the plan below its own floor. `04-deliverability-infra.md` is where that slack has to be protected, and `06-process-runbook.md` puts list replenishment in the weekly loop for exactly this reason.

---

## 5. The honest verdict

---

> **$60K closed-won by day 60 is top-quartile execution, not the expected outcome.**
>
> It requires all three of: the two-track start, calls riding on top of the emails, and **at least one expansion-size deal**.
>
> **The base case at benchmark execution is $25–40K closed plus $40–80K in live pilots and proposals by day 60.**
>
> Two levers close the gap, and only two. **Deal size** — hunt Segment A prospects with long line cards, because a $30K expansion deal is worth three small ones. And **speed to first send** — Track 1.
>
> Our own outbound page tells clients: *"Total runway to first reply data: six to seven weeks. Faster than that is somebody skipping the deliverability layer."* **[our page]** That is the physics of the scaled track and we do not get an exemption from it. The 60-day plan works only because Track 1 produces reply data in week 1 while Track 2 warms up behind it. If Track 1 is declined (G5), day 60 lands somewhere around where week 5 was supposed to be, and the honest target becomes $25–40K.
>
> Do not soften this anywhere else in the pack, in a proposal, or in a status update.

---

## 6. What gets tracked against it

Two lines, posted weekly into [`campaign-ledger.md`](campaign-ledger.md) and reviewed at day 45 and day 60:

1. **$ signed** — against $60K (stretch) and $25–40K (base).
2. **$ in live pilots and proposals** — against $40–80K (base).

A day-60 result of $30K signed and $70K in live pilots is the plan working. A day-60 result of $30K signed and $5K in pilots is the plan failing quietly, and the difference is only visible if both lines get posted every week.
