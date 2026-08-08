# 06 · The 60-day runbook

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** ready to run once G1, G2, G5 are signed

Start: **2026-08-01** (day 1). Day 60: **2026-09-29**.

Day 1 lands on a Saturday, so the first working day is **Monday 2026-08-03**. Every send count in this file is working days only.

---

## The calendar

### Week 0 · Aug 1–7 · clear the gates and build the list

Nothing sends this week. Everything that blocks a send gets cleared, in this order.

| Day | Task | Blocks |
|---|---|---|
| **Mon Aug 3** | **Buy the domains and the Instantly account (G2).** 2–3 fresh `.com` variants, 6–9 mailboxes. Publish SPF, DKIM, DMARC, the one-click unsubscribe header, and a custom tracking domain per sending domain. | Everything downstream. Warm-up is 4 weeks and it starts the day DNS validates. A domain bought Friday is a week of production lost at the far end. |
| **Mon Aug 3** | **Start warm-up** on every mailbox the moment DNS resolves. Zero cold sends from a warming domain. | Week 5 |
| **Mon Aug 3** | **Buy the Apollo paid tier (G1).** `APOLLO_API_KEY` into `.env.local`. | Stage 1 |
| **Tue Aug 4** | **Ship the pre-flight fixes** — [`07-preflight-fixes.md`](07-preflight-fixes.md). All nine move today: the four autonomous ones (PF-5, PF-6, PF-7, PF-9) land; PF-1 goes to Artur as `PROPOSED` with the exact rewrite attached, so the decision is a yes/no rather than a drafting job; the four G6 items (PF-2, PF-3, PF-4, PF-8) go to Artur as gate decisions. | Traffic to `/catalog-snapshot/`, the CAN-SPAM footer |
| **Tue–Wed Aug 4–5** | **Build the scripts.** `apollo-pull.mjs`, the CSV parser swap, the DFS env alias, the scan extension. Specs in [`05`](05-automation-pipeline.md). | Stages 1–3 |
| **Wed–Thu Aug 5–6** | **Pull and verify Segments A and B.** 2,500–3,500 raw → verified buckets. Segment C waits until A and B are seated. | Stage 6 |
| **Thu Aug 6** | **Run the 50-domain scan pilot in-session** via the DataForSEO MCP. No new keys needed. This is what proves the copy before a cent of sending spend. | Stage 4 |
| **Fri Aug 7** | **Draft-freeze the sequence copy** against the pilot's real scan output. Run all three QA lints on the frozen set. | Week 1 |
| **Fri Aug 7** | **Artur signs or declines G3, G4, G5, G6, G7.** Record each in the ledger with the date. | Angle 2, Track 1, reply CTA |

**If G5 is declined**, weeks 1–4 have no sending in them. Say so out loud on Aug 7, re-baseline the target to the $25–40K base case in [`01`](01-goal-math.md), and use weeks 1–4 for list depth and scan coverage instead.

### Weeks 1–2 · Aug 8–21 · Track 1 live

- **Track 1 sends open Mon Aug 10** and run four weeks of sending, through **Fri Sep 4**. 10–15 hand-written notes/day from Artur's mailbox to the top-50 hot tier. Verified addresses only. Full personalization from a real scan. Reply-first, no link in touch 1.
- **Calls ride on top**, days 1, 7, and 13 of each contact's cadence. Calling rides on the email; it doesn't replace it. The voicemails already reference "the note I sent earlier this week," so the email has to have gone first.
- **Snapshots turn in 2 business days.** No exceptions — the 2-day promise is on the page and it is the campaign's only visible proof of operating discipline.
- **Warm-up keeps running.** Do not touch it, do not test it with a real send.
- **First metrics row posts Fri Aug 14.**

### Weeks 3–4 · Aug 22–Sep 4 · depth

- **Track 1 continues** into the next 100–150 contacts, closing its four-week window on **Fri Sep 4** ([`04`](04-deliverability-infra.md) §2).
- **List to 1,500+ verified.** Segment C pulls here. Replenishment is a weekly task from now on, not a one-time build.
- **Scan batch 2** — the next 150–200 domains, scripted this time (path B).
- **First pilots close** from week-1 replies. The day-7 500-SKU pilot is the close mechanism, so a reply on Aug 11 can be a signed pilot by the end of August.
- **Warm-up completes ≈ Aug 31** — four weeks from the Aug 3 DNS start. Verify every mailbox's reputation before the first production send rather than assuming the four weeks did their job.

### Weeks 5–8 · Sep 1 – Sep 29 (day 60) · Track 2 production

Track 2 production begins **Tue Sep 1**, the day after warm-up completes. Its ramp weeks are counted from there — week 5 is Sep 1–5, week 6 Sep 8–12, week 7 Sep 15–19, week 8 Sep 22–26, with Sep 29 the day-60 review. The first four days overlap Track 1's last week; both run, and the daily loop covers both.

- **Ramp per [`04`](04-deliverability-infra.md) §3:** week 5 at 20/mailbox/day, week 6 at 30, week 7 at 40, week 8 at 50. Ceiling 120–450/day depending on mailbox count. The table is a ceiling, not a schedule — a wobbling mailbox holds or steps back.
- **Micro-campaigns of ≤50**, one segment and one angle each.
- **Weekly metrics and a kill/scale review every Friday.** By week 6 the reply rate is real data, and the 5% line applies. **[our page]**
- **Pipeline compounds:** week-5 replies close inside weeks 6–8.

### Day 45 · Mon Sep 14 · the checkpoint

Read the ledger's `$ signed` column.

> **If under $20K signed at day 45:** stop adding breadth. Shift the mix toward expansion-size prospects — Segment A, longest line cards, largest visible catalogs — and go call-heavy on every warm reply already in hand. A $30K expansion deal closing in the last two weeks does more than 400 additional sends will.

This is a written trigger with a number on it, not a vibe check. Record the decision in the ledger either way, including "above $20K, no change."

### Day 60 · Tue Sep 29 · the review

Close the ledger against the two verdict lines from [`01`](01-goal-math.md):

- **$ signed** vs $60K stretch / $25–40K base.
- **$ in live pilots and proposals** vs $40–80K base.

Then decide one of three: **continue** as-is, **scale** (more mailboxes, more segments, more list), or **rework** (the 5% reply line **[our page]** tripped, or the offer didn't land). Write the decision and the reason into the ledger. A day-60 review with no written decision means day 61 defaults to "keep going," which is the one option nobody chose.

---

## The daily loop

Every working day, in this order. Roughly 60–90 minutes outside of Track 1 writing.

1. **Reply triage first, before anything else.** SLA is **2 hours during send windows** — our own published promise. **[our page]** Route by the table in [`05`](05-automation-pipeline.md) stage 7.
2. **Suppression, same day.** Every negative, every "take me off," every hard bounce goes onto the master list and syncs to the tool blocklist before the day ends. Email, calls, and LinkedIn all at once. This is the one task that never gets deferred to tomorrow.
3. **Send window 4–7pm recipient-local.** Track 1 notes get written and sent inside it. Track 2 batches get released into it. Working days only; never two touches to the same contact in the same hour.
4. **Track 1 quota: 10–15, hard cap.** Not "15 unless it's going well."
5. **Bounce and complaint glance.** Two numbers, ten seconds. If bounce is climbing toward 2% or a complaint appeared, act today — see the red lines in [`04`](04-deliverability-infra.md) §7. Both thresholds are our own published standard. **[our page]**
6. **Snapshot commitments.** Anything promised two business days ago ships today.

---

## The weekly loop — every Friday

1. **Post the metrics row** into [`campaign-ledger.md`](campaign-ledger.md): sends, replies, positive, snapshots delivered, pilots started, $ signed, bounce %, complaint %. **Post it even when it's bad.** A ledger with a gap in it is a ledger nobody trusts at day 60.
2. **Kill/scale review** against the rules in [`05`](05-automation-pipeline.md) stage 8. A segment at 2× benchmark *[playbook]* doubles its share next cycle, and the volume comes from the weakest segment rather than from the total. A segment under half of benchmark after 200 sends pauses — and check the observation quality before blaming the copy, because a batch full of `[FALLBACK]` lines is a scan problem.
3. **Replenish the list.** Pull, verify, and post-filter enough to keep 2–3 weeks of sending queued. Running the list dry in week 6 costs more than any copy problem.
4. **Run the scan batch** for next week's sends. 50–200 domains, budgeted — DataForSEO bills per call, roughly 5 calls per prospect.
5. **Re-verify anything older than 30 days** before it enters a second sequence.
6. **Read the two verdict lines.** Not just $ signed. Signed money with no pipeline behind it is the plan failing quietly.

---

## Who does what

**Artur only.** These do not delegate.

- Every gate decision (G1–G7) and every ledger row that records one.
- Track 1: writing and sending the notes. That's the whole point of Track 1 — it's founder-led sales, and a delegated version of it is just cold email from the primary domain.
- Reply triage inside the 2-hour SLA. "Senior operator" means Artur.
- Any price posture on a live conversation, and any proposal.
- The day-45 and day-60 decisions.

**An AI session does the rest.** Each weekly session gets asked for the same four things, in this order:

1. **Run the scan batch** for next week's sends and write the per-prospect JSON. State the batch size and the call budget before starting.
2. **Draft the observation lines** from that JSON, then run all three QA lints and return the fails, not a summary of the fails.
3. **Replenish and verify the list** — pull, post-filter on revenue, dedupe to 1–2 per company, write the lineage columns.
4. **Compute the metrics row** from the tool's export and hand back the exact line to paste into the ledger. Do not let a session write to the ledger's gate rows; those are Artur's.

The build sessions that come before all of this — pre-flight fixes, scripts, list build, copy freeze — are sequenced in [`../../handoff/industrial-email-campaign/00-README.md`](../../handoff/industrial-email-campaign/00-README.md). That file is what gets pasted into a fresh session. This one is what gets read once the campaign is already running.
