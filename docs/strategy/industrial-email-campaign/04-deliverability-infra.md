# 04 · Deliverability and the two-track start

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** blocked on G2 (account + domains) and G5 (Track 1 decision)

The repo has no outbound sending infrastructure at all. Resend is transactional and sits on the primary domain. HubSpot holds inbound form leads. There is no sequencer, no sending domain, no warm-up, no suppression list, no unsubscribe endpoint, no reply ingestion. All of it is net-new, and most of it is a purchase, not a build.

---

## 1. The physics we already published

These are not best practices we're adopting. They are promises on `/services/outbound-email-marketing-services/`, sold to clients, and they bind our own campaign. **[our page]**

| Promise, as published | The number |
|---|---|
| "We never send from your primary domain." | **2–5 dedicated outbound domains**, isolated |
| SPF / DKIM / DMARC alignment + isolated IP pools | required before any send |
| "Four-week warm-up runway before scaled sends" | **4 weeks** |
| Daily send volume per mailbox | **20–50, reputation-throttled** (agency column: "200+ · subscription maximum") |
| Bounce rate | **under 1.5–2%** ("triple-verified contacts") |
| Spam complaints | **under 0.3%** |
| First touches | plain text, no images, no tracking pixels |
| Reporting | sends, positive replies, booked meetings, sourced pipeline. **We do not report open rates.** |
| Total runway to first reply data, scaled track | **6–7 weeks.** "Faster than that is somebody skipping the deliverability layer." |

The last row is the reason this file has two tracks. Six to seven weeks of runway does not fit inside a 60-day revenue goal, and pretending otherwise is the failure mode this whole pack is written to avoid.

---

## 2. Track 1 — founder-manual, weeks 1–4 of sending (≈ Aug 10 – Sep 4)

### GATE:HUMAN — G5

**What it is.** 10–15 hand-written notes per day from Artur's established mailbox to the top-50 hot tier: verified addresses only, full personalization from a real scan, reply-first, no link in the first touch, instant suppression on any negative. Founder-led sales conducted over email, not a bulk campaign.

**The trade-off, straight.** It sends cold mail from or adjacent to the primary domain, which our own service page says we never do for clients. That is the whole objection and it doesn't have a clever answer. What separates it from what we criticize: volume capped at ≤15/day against an agency column of 200+; every address verified before it's touched; every observation scanned, not assumed; suppression same-day. It reads as one person writing to another because that is what it is.

**What it buys.** Reply data in week 1 instead of week 6. Roughly 250 contacts across weeks 1–4, which is the difference between the $60K case and the $25–40K case in [`01-goal-math.md`](01-goal-math.md).

**What it risks.** Reputation on `salesolution.net`, which also carries transactional mail (Resend acknowledgments, probe unlock emails) and the brand's own inbox. A complaint spike here damages more than a campaign.

**Artur decides one of two:**

- **Accept (recommended)** — with the caps written into the runbook: ≤15/day, verified-only, reply-first, no link in touch 1, instant global suppression, halt on the first complaint.
- **Decline** — Track 2 only. Concede roughly three weeks of the 60 and re-baseline the goal to the $25–40K base case. This is a defensible choice; it is not a free one.

Record the decision as G5 in [`campaign-ledger.md`](campaign-ledger.md) with the date. It changes the number in `01`.

---

## 3. Track 2 — the scaled track

Buy on day 1. Send in week 5. The four-week warm-up is the schedule; nothing compresses it.

### Domains

**2–3 fresh `.com` variants. Never `salesolution.net`.** Close enough that a reply looks legitimate, separate enough that a burned domain is disposable. Buy all of them on the same day so they warm in parallel — a domain bought a week late is a week of production lost at the far end.

### Mailboxes

**2–3 per domain**, so 6–9 total. Each gets a real name, a real photo, a real signature block, and a forwarding rule to a monitored inbox. Mailbox count is the throughput lever: the ramp ceiling is mailboxes × per-mailbox limit, and it is the only lever that doesn't violate a published promise.

### DNS, before the first warm-up email

| Record | Requirement |
|---|---|
| **SPF** | Single `v=spf1` record, sending provider included, ends `-all` |
| **DKIM** | Provider key published, signing verified with a test send |
| **DMARC** | `v=DMARC1; p=none; rua=mailto:…` to start, monitored, tightened to `p=quarantine` before production sends |
| **Custom tracking domain** | Per sending domain. Never a shared provider tracking domain. |
| **MX / return-path** | Aligned to the sending provider |
| **One-click unsubscribe** | `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers on **every** message, RFC 8058 |

The unsubscribe header is not optional and not a nicety. It is required at scale by Gmail and Yahoo, it is the cheapest complaint-rate insurance available, and a working opt-out is a CAN-SPAM requirement independent of any of that. *[playbook]*

### Warm-up

Four weeks, tool-managed warm-up pool, starting the day DNS validates. Zero cold sends from a warming domain — not "a few to test." The warm-up is the reason week 5 works.

### The ramp, weeks 5–8

Per-mailbox daily volume, throttled to reputation, never to a fixed schedule. If a mailbox's numbers wobble, it holds at the previous week's level or steps back; the table is a ceiling, not a plan.

| Week | Per mailbox / day | 6 mailboxes | 9 mailboxes |
|---|---|---|---|
| 5 | 20 | 120/day | 180/day |
| 6 | 30 | 180/day | 270/day |
| 7 | 40 | 240/day | 360/day |
| 8 | 50 | 300/day | 450/day |

Ceiling range **120–450/day**, which is where the ~1,200–1,500 Track 2 contacts in the capacity check come from. Working days only. Send window 4–7pm local, for the after-hours read. Never two touches to the same contact in the same hour.

---

## 4. Sending tool

**Instantly — recommended.** Three reasons, in order:

1. **Warm-up pool included**, so the four-week runway is a setting rather than a second vendor.
2. **Blocklist API**, so suppression can be synced from the campaign's own list instead of maintained twice by hand. Suppression drift is how a "take me off" turns into a complaint.
3. **Campaign API**, so stages 1–5 of [`05-automation-pipeline.md`](05-automation-pipeline.md) can push contacts and sequences from scripts instead of through paste-and-pray.

**Smartlead — the named-equal alternative.** Same three capabilities, different UI. Pick on the trial, not on the review sites.

Both are already on our own public vendor shortlist on the outbound service page **[our page]**, alongside Lemlist and Outreach. Recommending a tool to clients and then using something else is a small credibility leak that costs nothing to avoid.

**Cost:** ~$300–500 for the 60 days, including domains. **GATE:HUMAN — G2.**

**Not Resend.** It's the transactional sender on the primary domain. Cold volume through it burns the brand domain's reputation and the acknowledgment emails that inbound leads depend on.

---

## 5. Catch-all handling

Verification returns `accept_all` for domains that accept anything. Those addresses are neither valid nor invalid — the domain just doesn't say. They are not dropped and they are not mixed in.

**Quarantine them to their own sending domain**, at low volume, sent last. If that domain's bounce rate climbs, it climbs alone and the production domains are untouched. A catch-all address never enters a Track 1 batch.

---

## 6. Suppression

**One list. Global. Same day.**

- It is the **same list as the internal do-not-call list** in `docs/strategy/sales/07-compliance.md`. A prospect who says "take me off" on a phone call must not receive an email on Tuesday. One suppression concept, two channels.
- It syncs to the sending tool's blocklist via the blocklist API on every update. The tool's copy is a mirror, never the source of truth.
- **Honored on any phrasing.** "Stop," "not interested," "remove me," "please don't contact me again," or a bare "no" all suppress. We never make someone find the unsubscribe link to be left alone.
- **Target: same day.** The legal deadline is 10 business days *[playbook]*; the standard we hold is same-day, and the runbook puts it in the daily loop.
- Suppression covers **all channels**: email, calls, LinkedIn. A LinkedIn touch after an email opt-out is the fastest way to look like a spammer.
- Hard bounces suppress automatically. So do complaints, permanently.

---

## 7. The three red lines

Numeric, non-negotiable, checked weekly in stage 8.

| Line | Threshold | What happens when it trips |
|---|---|---|
| **Bounce** | **≥2%** on any domain | Halt that domain's sends. Re-verify the entire remaining list for that batch. Do not resume until the batch verifies clean. |
| **Complaints** | **≥0.3%** on any domain | Halt that domain **permanently**. Do not rehabilitate it. Move remaining contacts to a clean domain only after a copy review. |
| **Reply rate** | **under 5% by week 6** | Stop. The offer or the list is wrong, not the subject line. Rework both before sending again. |

The reply line is our own published standard, word for word: *"Under 5% means the offer or the list needs work — we'll say so in the diagnostic instead of burning another six weeks on the same list."* **[our page]** The same page promises clients **8–15% positive reply by week six** on a well-defined technical-B2B ICP. Our ICP is exactly that. We are measured against our own claim.

---

## 8. CAN-SPAM checklist — every message, every track

*[playbook]* Any single unchecked box is a violation, not a style issue.

- [ ] **Accurate from-line and header information.** Real name, real domain, no spoofing.
- [ ] **Subject line is not misleading.** It describes what the email is about.
- [ ] **Working unsubscribe in every message** — link plus the RFC 8058 one-click header.
- [ ] **Opt-outs honored within 10 business days.** Our standard is same day.
- [ ] **Valid physical postal address in the message body.**
- [ ] **Source URL and pull date retained per contact** (`02-icp-targeting.md` §6).
- [ ] **No personal-email harvesting.** `reveal_personal_emails` off at pull time.
- [ ] **Licensed-provider data used within ToS.** Never shared, never resold.
- [ ] **The email never denies being a sales approach.**

**The footer block**, assembled from `lib/business.ts`, which the founder confirmed on 2026-07-26:

```
IT Sale Solution LLC, a Florida limited liability company, doing business as Salesolution
17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160, US
connect@salesolution.net · 561-531-4339
```

> **GATE:HUMAN — G6, PF-8.** Three different addresses still appear on the live site and the NAP sweep is unconfirmed. CAN-SPAM requires a *correct* postal address, and a footer that disagrees with the website is worse than no footer. Confirm the sweep before the first send. See [`07-preflight-fixes.md`](07-preflight-fixes.md).

**EU/UK:** the campaign targets US contacts only (`person_locations: ["United States"]`). If a non-US contact ever enters the list, it needs documented legitimate interest and documented suppression under GDPR/PECR before it can be mailed. Simpler answer: don't let one in.

**Email only.** No SMS. A2P 10DLC needs registration plus written consent captured on a form; an emailed "sure, text me" does not qualify. **[our page]**
