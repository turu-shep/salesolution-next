# Industrial cold-email campaign — Catalog AI, 60 days to $60K

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** ready to run, gated (G1–G7 unsigned)

This pack is the whole campaign written down: who we email, what we say, what sends it, what checks it, and what the money has to do for the 60 days to have been worth running. It exists as eight files instead of one because the phases run in separate sessions and share state through a ledger, not through a conversation.

**The goal:** $60,000 in new Catalog AI revenue, signed, inside 60 days. Start ≈ 2026-08-01. Day 60 = 2026-09-29. `01-goal-math.md` says plainly what that requires and what the base case looks like instead. Read that file first — it is the one that decides whether the rest is worth building.

**The door:** industrial only. Primary CTA is a reply. The artifact is the free Catalog Snapshot at `/catalog-snapshot/`. Call booking is `/book-growth-call/`. No contact in this campaign ever sees a Revenue Engine door, and nothing in it carries a guarantee.

---

## The two angles

**Angle 1 — "The AI answer skips your catalog."** CLEARED. Runs day 1. It matches the live offer (we rewrite the catalog they already have), the objection library, and the two on-file emails written in Artur's voice. The mechanism is three steps: their product pages read like everyone else's because 40+ distributors run the same manufacturer copy and the AI deduplicates it; the manufacturer ends up looking like the expert; the AI can't read their catalog. Ladder: reply → free Catalog Snapshot in 2 business days → day-7 500-SKU pilot → full catalog.

**Angle 2 — "The line-card gap."** DRAFTED, GATE:HUMAN before a single send. Not "add brands you don't carry" — **"you're authorized on lines you barely list."** Their line card says Parker, Enerpac, Rexroth; their site lists a fraction of those SKUs. We expand the listed SKUs from manufacturer product data the distributor can obtain and provide, which keeps the offer's stated exclusion intact ("we use source data you provide"), and every added page is built to be cited. Most of those lines already move special-order or dropship, so added SKUs are demand capture, not inventory risk.

Angle 2 is where the size is. Angle 1 is where the certainty is. The plan runs Angle 1 immediately and holds Angle 2 behind G3.

---

## File map

| File | What's in it |
|------|--------------|
| `00-README.md` | This file. Goal, angles, gates, where to start. |
| [`01-goal-math.md`](01-goal-math.md) | Deal shapes off the published rate card, the three $60K scenarios, the funnel chain, the capacity check, and the honest verdict. |
| [`02-icp-targeting.md`](02-icp-targeting.md) | Three segments, Apollo payloads as literal JSON, disqualifiers, packing rules, lineage requirement. |
| [`03-angles-and-copy.md`](03-angles-and-copy.md) | The sequences, subjects, variables contract, and the three new objection counters. **Written separately — do not edit from this pack's sessions.** |
| [`04-deliverability-infra.md`](04-deliverability-infra.md) | Domains, DNS, warm-up, the ramp table, sending tool, suppression, and the three red lines. |
| [`05-automation-pipeline.md`](05-automation-pipeline.md) | Eight stages, each with its tool, its inputs and outputs, its gate, and the runnable prompt or script spec. |
| [`06-process-runbook.md`](06-process-runbook.md) | The 60-day calendar, the daily and weekly loops, the day-45 checkpoint, who does what. |
| [`07-preflight-fixes.md`](07-preflight-fixes.md) | Nine things to fix before traffic reaches the pages. |
| [`campaign-ledger.md`](campaign-ledger.md) | The shared state file. Gates, pre-flight items, weekly metrics. One row each, never deleted. |

---

## Source tags

Every external number in this pack carries where it came from. Three tags, used everywhere:

- **[playbook]** — a cold-email benchmark from the marketing-skills reference set. Population averages across other people's campaigns, not ours. Treat as a planning input, never as a promise to a prospect.
- **[our page]** — a promise already published on salesolution.net, mostly on `/services/outbound-email-marketing-services/`. Binding. Breaking one of these inside our own campaign is a positioning bug before it is an ops bug.
- **[catalog pricing]** — the published rate card at `/services/catalog-ai/`. Real prices a prospect can read.

Anything without a tag is a decision made in this pack, and it belongs in the ledger.

---

## Gates summary

Seven decisions only Artur makes. Six of them block sends. They are seeded as OPEN rows in [`campaign-ledger.md`](campaign-ledger.md).

| Gate | The decision | Blocks | Specified in |
|------|--------------|--------|--------------|
| **G1** | Buy the Apollo paid tier and put `APOLLO_API_KEY` in `.env.local`. | All list building. | [`05`](05-automation-pipeline.md) stage 1 |
| **G2** | Instantly (or Smartlead) account + 2–3 sending domains. ~$300–500 for the 60 days. | Track 2 entirely. Warm-up is 4 weeks, so this is the longest-lead gate in the pack. | [`04`](04-deliverability-infra.md) |
| **G3** | Angle 2: approve the expansion framing, the dropship language, and naming manufacturer brands in outbound. | Every Angle-2 send. Angle 1 runs without it. | [`00`](00-README.md) above, [`03`](03-angles-and-copy.md) |
| **G4** | Approve the three new objection counters (can't-sell-what-we-don't-stock, offshore data entry, "our system can't handle it"). | Reply handling on Angle 2. | [`03`](03-angles-and-copy.md) |
| **G5** | Track 1: accept founder-manual sending from the established mailbox for days 1–28, or wait for warm-up and concede ~3 weeks of the 60. | The 60-day goal itself. See the verdict in [`01`](01-goal-math.md). | [`04`](04-deliverability-infra.md) |
| **G6** | The four pre-flight GATE items: revenue-band mismatch, SKU-floor contradiction, `/catalog-snapshot/` URL stability, NAP sweep. | Sending traffic to `/catalog-snapshot/` and shipping the CAN-SPAM footer. | [`07`](07-preflight-fixes.md) |
| **G7** | Confirm the booking link the reply CTA hands out (`NEXT_PUBLIC_CALENDLY_URL` vs `/book-growth-call/`). | Positive-reply triage. | [`05`](05-automation-pipeline.md) stage 7 |

G2 is the one to clear today. Everything else can be decided in week 0; a four-week warm-up bought on day 8 does not produce a week-5 send.

---

## Run order

The build runs as five phases, each a fresh session, sequenced in [`../../handoff/industrial-email-campaign/00-README.md`](../../handoff/industrial-email-campaign/00-README.md). That is the file you paste from. This pack is what those sessions read.

Short version: pre-flight fixes → build the scripts → build the list and pilot the scan on 50 domains → freeze the copy once the gates are signed → launch and run the weekly loop.
