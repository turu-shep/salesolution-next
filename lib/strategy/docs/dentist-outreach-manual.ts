/** The dentist outreach motion, written for the marketing partner who opens
 * conversations and books audits — rendered at /strategy/offers/dentist/outreach/
 * (gated, noindex, no runtime fs, per the /sales docs convention).
 *
 * Split out of the former dentist-partner-brief.ts on 2026-07-28: the offer itself
 * (deliverables, value, pricing, targeting) moved to ../dentist-offer/data.ts and
 * renders at /strategy/offers/dentist/. This module keeps the instructional half —
 * role split, language, claims, cadence, copy, compliance, objections, status.
 *
 * Every fact traces to the strategy docs: docs/strategy/offer-research/
 * (medical-dental-offer-spec.md, 00-offer-architecture.md, 04-signoff-sheet.md,
 * 06-deliverable-value-ledger.md), docs/strategy/sales/ (01, 03, 05, 06, 07, 08, 09,
 * _claims-library.md), the live dental page, and lib/strategy/niches/briefs.generated.ts.
 * Content canaries live in dentist-offer.test.mjs — the never-name rules and the
 * drafts gate are test-enforced. Re-verify against the source files before editing
 * any quoted block. */
export const DENTIST_OUTREACH_MANUAL_MD: string = `
# Dentist outreach manual

Updated 2026-07-28 · Split out of the dentist partner brief. Everything here traces to the strategy docs. The NEVER list is binding.

The offer itself — what gets installed, what each piece is worth, what it costs, and who it is for — is at /strategy/offers/dentist/. Read it first. This document is the motion: how a conversation starts and how an audit gets on the calendar.

## 1. How to use this / role split

You start conversations with US dental practice owners and book them into a 20-minute Revenue Leak Audit. That is the job. Artur runs the audit, prices it the same day in writing, closes, installs, and operates the system.

**Booking, not closing.** Say it before you dial. You are not selling on the call and you are not quoting a price on the call. You are getting 20 minutes on the calendar. A price thrown into a vacuum anchors wrong and makes you sound like every agency that already called them.

| Step | Who | What happens |
|---|---|---|
| Pre-call leak check | You | 3–4 minutes. Collect one true, specific thing about this practice. |
| First contact to booked audit | You | Call, voicemail, email, LinkedIn. The audit is the only ask. |
| The audit | Artur | About 20 minutes, their numbers, no patient data. |
| Rate letter | Artur | Same day, in writing, three options. |
| Close, install, operate | Artur | Install by day 60. Guarantee settles day 120, counted from signing. |

**Hand off the observed leak with the booking.** The Revenue Engine call log will not save a row without one — the leak you personally found is the whole edge, and Artur opens the audit with it.

**Read before the first dial:** the offer sheet at /strategy/offers/dentist/ (what they actually get), section 4 (language), section 5 (what you may and may not claim), section 9 (compliance). Section 8 is drafts. Nothing in it goes out until Artur signs it.

## 2. The offer, and the one price rule

**The Revenue Engine**, dental skin, live at /revenue-engine/dentists/. It works the revenue already sitting in the practice — presented treatment plans that never got scheduled, overdue recall — then catches the new-patient calls the front desk cannot get to, and proves what it brought back. Deliverables, timeline, terms, tiers, and the value behind every line: /strategy/offers/dentist/.

**Public and citable. This is the only price line that goes to a prospect:**

> "Installs start at $30,000. The exact number comes from the audit — in writing, same day."

That is the whole public position. It is on the page, so you are not leaking anything by repeating it. If they push for a number on the call:

> "The model's published on the page. Your exact number comes out of what we just measured — you'll have it in writing today."

**Price talk past that line is Artur's.** Not yours, not on a first call, not "roughly." Route it to the audit. Retainer tiers, the fee model, and the internal floor are on the offer sheet, internal only. Do not quote them and do not improvise a monthly figure.

**The guarantee is verbatim or it is nothing.** One sentence, on the offer sheet and on the live dental page, and it never gets paraphrased. A prospect who hears two versions of it decides you are making it up. Say it as written or say nothing about the guarantee:

> "If the revenue the system brings back hasn't covered everything you've paid me — install and fees — by day 120, I work free until it has."

Three mechanics travel with it, and you should be able to answer each cold. It counts everything the practice has paid, install and fees, not the monthly fee on its own. The clock is 120 days from signing, not from install. And the remedy is work, not money — there is no refund on the install. The sentence was re-cut on 2026-07-28; any older version that settles against the monthly fee by day 90 is dead, including the one still floating in the June call scripts.

**Three things are not in the install.** Say them plainly if they come up: deeper practice-software integrations past calendar write-back are retainer work; anything chairside belongs to the practice, because Artur installs the system, trains the front desk, and tracks recall, reopened plans, and booked chairs with them; and the audit itself touches no patient data — it measures the front desk, it does not look at charts.

**Superseded — do not use.** The June cold-call scripts still describe the offer as a flat monthly fee with no one-time install cost, and instruct the caller never to name a monthly figure cold. That predates the July pricing architecture, which publishes the install floor. The scripts were never updated. Their pricing lines are dead; everything else in them still holds.

## 3. Qualifying on the call

Tier A, B, and C profiles, the modeled recovery each one supports, and the disqualifier list are on the offer sheet at /strategy/offers/dentist/. What follows is how you find out which one you are talking to.

**Who decides.** The owner-dentist. But the office manager owns the phones and often steers the decision, so treat them as an ally, not a wall — the whole pitch is that nobody gets replaced. Authority check, on the call:

> "When something like this makes sense, is that your call, or does your office manager weigh in?"

A four-location dental group is still a Revenue Engine prospect, not an industrial one.

**Screening questions:**

- "Pull your unscheduled-treatment report — what's the total, and how much did you present last 12 months?" (Any practice-management system prints this. It is the strongest artifact in the whole motion.)
- Annual collections.
- Do they place and restore full arches in-house?
- Active-patient count, and roughly what share has lapsed.

**Buy triggers:** a stack of unscheduled treatment plans; recall running overdue; calls hitting voicemail during chair time; burned by an agency that sent rankings reports while the phone stayed quiet; an exit horizon, where practice value is suddenly the conversation.

**Disqualify gracefully.** When the offer sheet's not-a-fit list matches what you are hearing, stop and don't push. A clean exit protects the name with a buyer who is allergic to pressure.

## 4. Language

**Their words, verbatim.** Use these, not your paraphrase of them:

- "The phone rings when we're chairside and there's nobody to grab it"
- "They accept the treatment plan and then never schedule"
- "I present a $5k implant case and they go shopping around for a cheaper quote"
- "Half my recall is overdue and nobody's calling them"
- "I don't want it to sound like a robot answering my phone"
- "I'm not trying to replace my front desk, I just need the overflow caught"

**Say this:** front desk · the phone · chair time · treatment plan · case acceptance · unscheduled treatment · overdue recall · hygiene · new patient · consult · implant case · veneers · production · holes in the schedule · empty chairs · reactivation · books the appointment · signed BAA · your practice software (Dentrix, Open Dental, Eaglesoft) · answered every call · no annual contract.

**Never say this:**

- **"Leads."** Say "new patients" or "calls."
- **"Consumers."** Say "patients."
- Kill-list words: leverage, seamless, robust, elevate, unlock, supercharge, empower, streamline, omnichannel, funnel, CTR, schema, GEO, patient acquisition cost, holistic growth, cutting-edge AI, game-changer, best-in-class, impressions, rankings.
- **"Leak," as if it were their word.** "Revenue Leak Audit" is the name of the offer — say the name. Out loud, name the real thing: the missed call, the voicemail at lunch, the case that booked somewhere else.
- Any unexplained acronym. PMS, BAA, PHI, GEO, schema, map pack all read as friction cold. Expand it on first use or cut it.
- **Any competitor, platform, or vendor name**, in anything a prospect reads or hears. The banned list is brand/competitor-policy.yaml — check it there; it is deliberately not reproduced in this manual.

**Register.** First person "I", never "we" — this is one operator, and the partner motion does not change that on the delivery side. Short sentences. Numbers before adjectives. "X, not Y." Name what you don't do early. No manufactured urgency, ever.

## 5. Assets and claims

| URL | What it is | Use it for |
|---|---|---|
| /revenue-engine/dentists/#audit | The audit band on the dental page. The form is inline. | **The conversion point.** Every booking goes here. |
| /revenue-engine/dentists/ | The dental page: leak calculator, the five steps, HIPAA and practice-software block, the two-line report, the guarantee, the published floor, FAQ. | Send when they want to read first. |
| /revenue-engine/ | How the engine works. No price and no guarantee on that page, by design. | Background only. |
| /industries/medical-aesthetics/ | The medical pillar. | Context, rarely needed. |
| /revenue-engine/audit-booked/ | Where the form lands after submit. | Nothing. Never send this link. |

**Three warnings on the links.** There is no standalone audit page and no dental booking calendar — the audit link is an anchor on the dental page and the form sits inline, so one scroll and they are done. The site header and footer both point at /book-growth-call/, and the /revenue-engine/ hero points at the home-services audit, so always send the dental deep link rather than "go to the site." And **/book-growth-call/ and /unlock-growth-audit/ are the industrial funnel** — different buyer, different offer. Never send either to a dentist.

**What the form asks:** name, mobile, practice name, "Where it hurts most," plus optional email and website. Trade is set to dental automatically. The five options are good language in their own right:

- Patients can't find us when they search
- Calls get missed during chair time
- Treatment plans get presented, then go cold
- Overdue recall and past patients never come back
- Can't tell what marketing actually works

**The calculator** on the dental page takes seven sliders and shows the annual leak split across Bring, Convert, and Retain, a conservatively recovered figure, a 12-month projection, and the install payback line. Its printed assumptions: 2% of missed nearby searches become a case; the engine recovers 40% of Bring, 60% of Convert, 50% of Retain; it rounds down. Those defaults and recovery rates are illustrative starting points, not signed-off claims. Never present a calculator output as a promise or as this practice's number — the audit replaces every estimate with their real figures.

### Approved claims

| ID | Say it exactly like this | The rule |
|---|---|---|
| C-01 | "The industry-average reply to a new lead is 47 hours." | Cite LeadSync, 2026, the first time. It is the **industry** average, never this practice's number. |
| C-04 | "Practices are commonly advised to invest 5–8% of gross revenue in marketing." | Guidance, never a promise. The point is making that spend convert, not spending more. |
| C-05 | "Businesses miss as many as one in three inbound calls." | The hedge "as many as" is load-bearing. It is the claim. Dropping it overstates. |
| F-01 | Seven verticals shipped, dental among them. Founder-attested. | The count is the length of a list. Do not round up, do not name the practice, do not name a city. |

Also fine to say: the guarantee verbatim, the terms, the published $30,000 floor, and "installed by day 60, paid back by day 120."

### NEVER — binding

- **There is no dental case study, testimonial, or cohort number.** None exists anywhere. Nothing you write or say may imply one — no "practices like yours saw," no anonymized results, no illustrative client story.
- **No headline proof stats from the services side.** The dollars-driven, retention, ROI-multiple, and NPS figures in lib/stats.ts are industrial case-study numbers. They are banned on every Revenue Engine surface and in every dental conversation. Do not blend them in.
- **No lead-count promises and no ranking promises.** Not "X new patients a month," not first page, not the map pack.
- **The treatment-plan acceptance percentage is proposed for clearing, not cleared.** The source turned out to be public — a Henry Schein One press release, May 2026 — so it is filed as VC-01, with the retention decline as VC-02, in docs/strategy/offer-research/06-deliverable-value-ledger.md §4. It renders on the live dental page, and the canonical claims library still carries that row as DO NOT USE. Until Artur signs it: qualitative only, a large share of presented plans never get scheduled.
- **Every value number on the offer sheet is internal.** Bought-alone prices, cost-of-inaction figures, and the value stack are proposal-call material in Artur's hands. None of it goes in an email or on a first call.
- **The kill list in docs/strategy/offer-research/06-deliverable-value-ledger.md §3 is binding** — the 67% competitor stat, chair-hour dollar figures, the $1M unscheduled average, the IBM breach figure, and the rest listed there never appear in anything a prospect reads or hears.
- **Never name the active dental deal, and never name the practice behind the shipped-vertical count.** Neither has recorded naming consent. Internal reference only.
- **Never say "you can't get sued."** The compliance build closes the easy openings. That is the claim, and it comes with not-legal-advice wording.
- **No fake deadlines, no invented scarcity, no "this price ends Friday."**
- **No roofing cost-per-lead figures.** C-02 and C-03 are roofing-only numbers. They never appear on a dental call.

## 6. Motion and cadence

**The funnel — seven stages, each defined by a fact you could point to on a recording, not by how the call felt.**

| Stage | Counts when |
|---|---|
| Dial | You pressed call. Every attempt. |
| Connect | A live human said words back. Anyone. |
| Conversation | You reached the decision-maker and they answered your reason for calling with at least one real back-and-forth. |
| Pitch | You named the leak, said what the audit is, and they heard the whole offer before responding. |
| Booked next-step | A specific slot on the calendar, with a date, a time, and a spoken yes. "Send me something" is not a booking. |
| Showed | They were there and the audit ran. |
| Won | Signed. Agreement signed, install starts. A verbal "let's do it" is not a win. |

**Before you dial — 3 to 4 minutes.** You are not researching, you are collecting one true, specific thing you can say in the first ten seconds. Call the practice from a different number than you will pitch from. Count the rings. Note what you got: a person, a hold, an auto-attendant tree, or voicemail. Call once right at lunch, 11:45 to 1:30 their time — that is their leakiest hour and the one they will argue is "just lunch." Listen to the voicemail greeting: does it give a way to book, or just "leave a message"? Open the Google profile and the website.

**The honesty rule. This is not negotiable.** "I only say what actually happened." If you did not really call, really submit the form, really see the rating, it does not go in your mouth. And: "The only hard number I cite about THIS practice is the leak I personally observed in the pre-call check." One finding leads. Do not dump the list. If you did not get to look, say so and offer to — never bluff an observation you don't have.

**One rebuttal, one re-ask, then let go.** If it is still no after that, route to email and get off the phone. With a burned buyer, the second hard push is how you become the last guy who called.

**Eight touches over 15 working days** — three calls each with a voicemail, four emails, one LinkedIn. The link appears once, on day 4, as the easy option, never as the ask.

| Day | Touch | Note |
|---|---|---|
| 1 | Call, then voicemail | Picked up, use the live opener. No answer, leave RE-VM1. |
| 1 | Email #1 | Reply-first. One observation, one question, no link. |
| 3 | LinkedIn | Connect, no pitch. Can't find the owner's profile? Skip it. Don't connect with a stranger to hit a quota. |
| 4 | Email #2 | Reply to your own thread, add a second finding. **The audit link goes here**, UTM'd, framed as optional. |
| 6 | Call | Different time of day. No answer, second voicemail referencing the email. |
| 9 | Email #3 | Short. The honest fork. No link. |
| 12 | Call | Final dial. |
| 15 | Email #4 | Breakup. One line, no link, no guilt. |

**What a booked audit actually is:** about 20 minutes with Artur. Their own numbers — how many calls are getting missed and when, how fast inquiries get a reply, what the Google profile is doing, where follow-up drops. **No patient data involved** — it measures the front desk, it does not look at charts. Whatever it finds is theirs to keep whether they ever work with him or not. The full close is in section 7, verbatim; use it as written. Then make them pick, don't leave it open:

> "I've got [first real slot] or [second real slot] open. Which one lands in a quieter stretch for your phones?"

Offer the slow hours your own pre-call check surfaced, not the busy ones.

## 7. Copy bank — approved

**Written in Artur's first person. Adapt the attribution when you send it as yourself — the words stay, the name changes.** Section 8 has those adaptations, and they are drafts. The callback number in the voicemail and the breakup email rings Artur. Sending as yourself, that becomes your number, and Artur gets named as the operator who runs the audit.

**Cold-call opener, front desk:**

> "Hi, this is Artur. I'm not a patient, and I'm not selling you anything on this call. Who handles your new-patient phone line — is that you, the office manager, or the doctor?"

Then stop. Let them route you.

**Owner-direct, after the observed leak:**

> "I called your office around half-twelve today, and the new-patient line went to voicemail. That's not a knock on your team. They were with patients, which is where they should be. But a first-time caller who hits voicemail just dials the next practice on the list. That's the thing I fix. Can I take a couple minutes?"

**The hook — two sentences, then stop:**

> "You know what a crown's worth, to the dollar. Nobody's counting the new-patient calls that hit voicemail at lunch. And that's the leak that costs the most, because a first-time caller who can't reach you books with whoever picks up — and takes the whole family with them."

**The close:**

> "So here's what I'd suggest, and it costs you nothing. Give me about twenty minutes and I'll run a Revenue Leak Audit on your practice. I'll show you your own numbers. How many calls are actually getting missed, and when. How fast inquiries get a reply. What your Google profile's doing. Where follow-up's falling through. No patient data involved — I'm measuring the front desk, not looking at charts. Whatever I find is yours to keep, whether we ever work together or not."

**Voicemail RE-VM1, dental.** Never reference patients or any caller detail:

> "...I called your front desk this morning and got voicemail. When that line's busy, it's usually a new patient calling around, and they book with whoever picks up. I can show you roughly how many of those you're missing a month. Call me back. Artur, 561-531-4339."

**Email #1** — reply-first, plain text, no link, and the ask is a question:

> Subject: your line at [Company]
>
> [Name] — I called your main number [day/time] and it went to voicemail. No callback yet as of this morning.
>
> Not pitching anything. I pulled two quick numbers on your phone and your Google profile. Want me to send them over?
>
> — Artur

**Email #4, the breakup:**

> "Closing the loop on my end. If missed calls ever start costing you jobs, I'm at 561-531-4339. Otherwise I'll leave you to it."

## 8. Partner-voiced sequences — DRAFTS

> **GATE:HUMAN — Drafts. Not approved for sending until Artur signs off.**

> **Superseded for sending, 2026-08-01 — section 12 is what gets sent.** Artur sends the dental email himself now; this section stays on the page only in case a partner motion is ever revived.

You speaking as yourself, naming Artur as the operator who runs the audit. Built off the approved copy in section 7 and the cadence in section 6.

**Slot rule:** every prospect-specific fact is a [SLOT: ...] you fill from something you actually observed. Nothing here is pre-filled with plausible-looking data. If you can't fill a slot from what you saw, cut the line. Don't guess it.

**Email 1 — day 1. No link.**

> Subject: your new-patient line
>
> [Name] — I called your main number [SLOT: day and time you called] and got [SLOT: what actually happened: voicemail after N rings, a long hold, the auto-attendant]. No callback yet.
>
> Not pitching you anything. I work with Artur Shepel. He fixes the calls that come in during chair time and the treatment plans that go quiet after you present them.
>
> Is that normal during the day, or did I catch you at a bad moment?
>
> — [Your name]

**Email 2 — day 4. Reply to your own thread. The link goes here.**

> Subject: Re: your new-patient line
>
> One more thing I noticed: [SLOT: the second finding you actually saw, e.g. the Google profile, how old the last review is, the website form, the voicemail greeting].
>
> Two things I'd want to know if it were my practice. Artur runs a 20-minute Revenue Leak Audit. He'll show you how many calls you're missing and when, how fast inquiries get answered, what your Google profile is doing, and where follow-up drops. No patient data. He's measuring the front desk, not looking at charts. Yours to keep either way.
>
> Want the twenty minutes, or should I just send you the two numbers? Book it here: https://salesolution.net/revenue-engine/dentists/?utm_source=partner&utm_medium=email&utm_campaign=dental-audit#audit
>
> — [Your name]

**Email 3 — day 9. The honest fork. No link.**

> Subject: Re: your new-patient line
>
> Should I keep this on your radar, or is now just not the time? Either's a fine answer.
>
> — [Your name]

**Email 4 — day 15. Breakup. No link, no guilt.**

> Subject: Re: your new-patient line
>
> Closing the loop on my end. If the calls that hit during chair time ever start costing you cases, Artur's the one I'd send you to. I'm at [SLOT: your number]. Otherwise I'll leave you to it.
>
> — [Your name]

**LinkedIn — day 3. Connect, no pitch.**

> Saw you run [SLOT: practice name]. Left you a voicemail about something I noticed on your new-patient line. No agenda, just figured you'd want to know.

**Call opener — front desk:**

> "Hi, this is [your name]. I'm not a patient, and I'm not selling you anything on this call. Who handles your new-patient phone line — is that you, the office manager, or the doctor?"

**Call opener — owner, after the observed leak:**

> "Hi, is this Dr. [SLOT: name]? This is [your name]. We've never spoken, so one thing, then you tell me if it's worth more. Fair?
>
> I called your office [SLOT: the time you actually called] and the new-patient line [SLOT: what actually happened]. That's not a knock on your team. They were with patients, which is where they should be. But a first-time caller who hits voicemail dials the next practice on the list. That's the thing Artur fixes. He'll show you the size of it in about twenty minutes. Can I take a couple minutes?"

**The ask:**

> "Artur's got [SLOT: first real slot] or [SLOT: second real slot] open. Which one lands in a quieter stretch for your phones?"

## 9. Compliance rails — non-negotiable

Operator guidance, not legal advice. Two things actually bite: automation pointed at a cell phone, and recording in an all-party state. Handle those and the rest is discipline. Exposure runs **$500 to $1,500 per call or text**, and a Florida firm has filed more than a hundred quiet-hours suits since late 2024 on exactly this.

Most dental targets answer on the owner's personal cell, and the law treats that cell as a residential line for three rules at once: Do-Not-Call, autodialer, and quiet hours. So the rule for the whole list is one line: **scrub it, dial it by hand, dial it 9 to 7 their local time.**

1. **Dial by hand.** No auto-dialer, no power dialer, no prerecorded message, no AI voice on cold outbound, no ringless voicemail drops. Leave voicemails yourself, one at a time, in your own voice.
2. **9am to 7pm in the prospect's local time**, not yours. A West Coast practice means nothing before noon Eastern. Hard rule.
3. **Show a real number that rings back to a person.** Never spoof, never rotate local-presence numbers.
4. **Scrub personal cells against the national DNC registry** before dialing. On the list means skip it, even when it is "a business."
5. **Keep an internal do-not-call list.** Anyone says stop, they go on it, honored on the spot, forever. Same for "stop texting." Suppress them on every channel, including LinkedIn.
6. **Don't record cold calls.** Florida is all-party, and so are eleven other states plus Nevada. Silence is never a yes.
7. **Never fire a text off a verbal yes.** Written consent comes from the form, and no automated texting happens until the A2P 10DLC campaign — the carrier registration that makes business texting legal — is live.
8. **If they ask whether it's a sales call, say yes.** Then go back to what you observed. Never deny it.
9. **Honor every opt-out fast**, within ten business days and sooner if you can, across calls, texts, and email, in whatever words they use.
10. **Log it and keep the log** — who opted out, when, and from which list. The record is the defense.
11. **LinkedIn is different.** Manual personal invites, no automation, no scraping. That runs under LinkedIn's terms, not the phone rules. Keep it light.

**The BAA gate — the highest-liability line in the whole deck.** Never assert that every tool has a Business Associate Agreement in place until Artur confirms the current coverage list. Asserting unconfirmed compliance to a regulated buyer is how this goes badly. Until it is confirmed, use this, as written:

> "Compliance is the first thing here, not an afterthought. Every tool that touches patient data has to be covered by a business-associate agreement before it goes live. Let me confirm the exact current list with my team and send it to you in writing, so your compliance person can check it before you commit to anything. I won't hand-wave that one."

## 10. Objection quick sheet

**"I'm not trying to replace my front desk."** Then you want the same thing. Nobody gets replaced. The system takes what they physically can't: the call that rings mid-procedure, the 8pm inquiry, and the stack of unscheduled plans and overdue recall nobody has time to work between check-ins. If your front desk answered every call now, I'd have nothing to sell you.

**"Is it HIPAA compliant?"** Yes, and you get it in writing before go-live. Every tool that touches patient data runs under a signed Business Associate Agreement. A recorded patient call is protected health information, stored under HIPAA access rules, not dumped in a generic call log. None of this is a verbal assurance, it's paperwork you hold. **Gate: do not assert the current tool list until Artur confirms it — use the fallback in section 9.**

**"Do we have to switch practice software?"** You keep it. The system books into your real schedule and writes back — Dentrix, Open Dental, Eaglesoft. No second calendar, nothing to migrate. The specific hookup for your software gets confirmed in the audit, before any money moves.

**"We tried an answering service and patients hated it."** An answering service takes a message; the patient still isn't booked. This one books, into your real calendar, and the caller can always reach a person. Every call is recorded, so you hear exactly what it sounds like before it ever answers for you. And the phone is the smaller half — most of what this recovers comes from working your unscheduled plans and overdue recall, which no answering service ever touched.

**"$30,000? My whole marketing budget isn't much more."** Practices are commonly advised to invest 5–8% of gross revenue in marketing. For a $2M practice that's $100,000 to $160,000 a year, most of it spent chasing strangers. The install is a one-time fraction of that, aimed at the other end: the calls that already dialed your number and the plans you already presented. At a $6,000 average case, it clears with five of them. And the guarantee is written against that whole number, install included, not against the monthly.

**"Will it sound like a robot?"** It only picks up what's already going unanswered — voicemail, after hours, the 40th call at 4pm. Those callers get a fast, human-sounding reply and a booked time instead of voicemail, and they can always reach a real person. Your team stays the face of the practice.

**"Agencies sent me rankings reports while the phone stayed quiet."** I don't report impressions or rankings. I report booked appointments and the revenue the follow-up brought back, in your own numbers.

**"Do you guarantee lead volume?"** No. The guarantee is revenue the system can prove against everything you have paid — install and fees — not lead counts.

**"Are you reselling me the same leads?"** No. That's lead-vendor stuff. No shared pool, and I'm not selling you contacts at all. I work the calls and patients you already get, and make more of them book. Every call's recorded and logged to you.

The full library is 39 cards in docs/strategy/sales/05-objection-library.md, 33 of which apply to a dental caller.

## 11. Status and open items

Read this before you promise anything.

- **Zero dental proof.** No case study, no testimonial, no measured dental number exists. A first cohort candidate is in the pipeline and stays unnamed. Proof slots stay empty until there is real dashboard data.
- **BAA coverage list unconfirmed.** The highest-liability gate open right now. Use the fallback line in section 9 until Artur confirms it.
- **The treatment-plan acceptance row was never filed.** It was approved for the live page but never added to the canonical claims library, where it still reads DO NOT USE. It is now proposed for clearing as VC-01, with VC-02 alongside it, on a public Henry Schein One press release from May 2026 (06 ledger §4). Still not usable until Artur signs.
- **The value ledger's claim rows are unsigned.** VC-01 through VC-10 in docs/strategy/offer-research/06-deliverable-value-ledger.md §4 are proposed, not cleared. The numbers on the offer sheet are internal until those rows sign.
- **The pre-call scanner is built but not running** — it is waiting on API keys. Do the pre-call check by hand, which is what section 6 describes anyway.
- **The audit form does not post to a CRM embed.** It posts to HubSpot and sends an email through Resend. If either is unconfigured the form still reports success and only logs the lead, so confirm a test submission actually lands before you send volume at it.
- **The June call scripts predate the July pricing architecture.** Their flat-monthly, no-install-cost framing is dead. The published floor is current. Everything else in those scripts still holds.
- **Three blocks carry a verify gate** — the guarantee wording, the terms, and the audit offer. Confirm with Artur before reading any of them on a call. Same for whether the published number rings him directly.
- **Calculator defaults are unsigned.** The preset numbers and the recovery rates on the dental page are illustrative starting points, flagged in the code as needing review. Never quote them as findings.
- **Compliance ownership for a partner motion has not been scoped.** Every rule in section 9 was written for one founder dialing his own list from Florida. Who scrubs the DNC registry, who holds the internal do-not-call list, whose caller ID shows, who owns the "leak I personally observed" honesty gate — none of that is decided. **Flag it with Artur before dialing at volume.**
- **The offer sign-off sheet is only partly signed.** Section B and several claims rows are still open, and the anchor-ladder decision is parked. Build nothing from unsigned rows.
- **The taught layer is drafted and unsigned.** The monthly numbers call, front-desk coaching, and the quarterly re-aim note are proposed in docs/strategy/offer-research/05-dental-fd7-tier2-draft.md. Do not promise any of them.

## 12. Artur-voiced sequences — hybrid evidence — DRAFTS

> **GATE:HUMAN — Drafts. Not approved for sending until Artur signs off.**

Two founder decisions, 2026-08-01, and both are binding here.

**Artur sends it.** The partner persona in section 8 is retired for sending. The name on the mailbox, the name in the sign-off, and the person who runs the audit are the same person, so the copy stops explaining who is who. First person singular throughout, one operator writing to one owner.

**Nobody calls.** No dialer, no voicemail drops, no assistant working a list. Section 6's three calls and the LinkedIn touch are not part of this campaign. It is four emails on working days 1, 4, 9 and 15, and every hook has to stand up without a call behind it.

**Evidence is hybrid** — two grades of the same discipline, one observation you can point at.

- **Base, for the whole list.** What the scan saw from outside: a Google profile with no way to book, a site that gives a phone number and nothing else, review replies that stopped months ago, an AI answer that names three practices near them and not theirs. One finding, dated where a date exists.
- **Hot tier, email 1 only.** A real form test. Send a genuine new-patient question through the practice's own website form, log the time it went in, then log what came back and when. Emails 2, 3 and 4 are identical across both tracks.

**Running the form test honestly.** Ask something you would actually want answered: do they take new patients, what is the wait for an implant consult. Real name, real address, no invented patient and no invented symptom — nothing that puts a clinician on a hook. Send it inside their posted opening hours, so the reply window you are measuring is a fair one. Log the submission time, the reply time, and what the reply said. The email reports what happened and stops there. Section 6's honesty rule governs all of it: if it did not happen, it does not go in the email. Silence is a legitimate result and usually the strongest one.

### Slot contract — never pre-filled

Every prospect-specific fact is a merge field, filled per lead from something that was actually observed. No fallbacks, no defaults, nothing generated. A lead missing a field for its track is not ready to send.

| Field | Track | What fills it | Where it comes from |
|---|---|---|---|
| first_name | both | The owner-dentist's first name. | List build |
| company_name | base | The practice name the way they write it. | List build |
| slot_1 | base | The primary leak, written as one finished sentence that can follow a full stop, dated where a date exists. | Scan output |
| slot_2 | both | The second finding, same rules, never a restatement of slot_1. On a hot-tier lead the form test carried email 1, so slot_2 is the strongest thing the scan found. | Scan output |
| form_day_time | hot tier | When the form went in. Written to follow the word website with no leading preposition: "last Tuesday at 9:40am". | Form-test log |
| form_result | hot tier | What came back and how long it took, in one sentence. | Form-test log |

**The callback number is a constant, not a slot.** Artur is always the sender, so it is the same digits on every lead on both tracks. It appears once, in email 4, written as a placeholder for Artur to fill before launch. Section 11 still has whether the published number rings him directly as an open verify item — settle that first.

**Email 1 — base — day 1. The whole list. No link.**

> Subject: one thing I saw looking up [Company]
>
> [Name] — I went looking for your practice the way a new patient would. [SLOT: slot_1]
>
> Not pitching anything. I fix the calls that come in during chair time and the treatment plans that go quiet after you present them.
>
> Is that already on your list, or is it news?
>
> — Artur

**Email 1 — hot tier — day 1. Form test. No link.**

> Subject: I sent a question through your website form
>
> [Name] — I sent a new-patient question through the form on your website [SLOT: form_day_time]. [SLOT: form_result]
>
> Not a knock on your team. They were with patients, which is where they should be. But someone shopping an implant doesn't wait. They fill in the next form on the list.
>
> Not pitching anything. That's the thing I fix. Is that the usual turnaround, or did I catch a bad week?
>
> — Artur

**Email 2 — day 4. Shared by both tracks. The audit link goes here, and only here.**

> Subject: (same thread — no new subject line)
>
> Here's what I'd suggest, and it costs you nothing.
>
> Give me twenty minutes and I'll run a Revenue Leak Audit on your practice. Your own numbers. How many calls are getting missed, and when. How fast inquiries get a reply. What your Google profile's doing. Where follow-up falls through. No patient data. I'm measuring the front desk, not looking at charts. Whatever I find is yours to keep, whether we ever work together or not.
>
> Reply with a stretch of the week that's quiet for your phones and I'll send times. Or book it yourself: https://salesolution.net/revenue-engine/dentists/?utm_source=partner&utm_medium=email&utm_campaign=dental-audit#audit
>
> — Artur

**Email 3 — day 9. Shared by both tracks. Second finding, then the honest fork. No link.**

> Subject: (same thread — no new subject line)
>
> One more thing I noticed: [SLOT: slot_2]
>
> One of those is a bad day. Two is a pattern. It's what I'd want somebody to tell me if it were my practice.
>
> Should I keep this on your radar, or is now just not the time? Either's a fine answer.
>
> — Artur

**Email 4 — day 15. Shared by both tracks. Breakup. No link, no guilt.**

> Subject: (same thread — no new subject line)
>
> Closing the loop on my end. If the calls that come in during chair time ever start costing you cases, I'm at [NUMBER: the line that rings Artur, filled in before launch]. Otherwise I'll leave you to it.
>
> — Artur

**Four rules that travel with this section.**

1. **One link, in email 2, exactly as written above.** No link in 1, 3 or 4. No shortener, no tracking redirect, no second URL anywhere.
2. **Emails 2, 3 and 4 carry no subject line** so they land in the same thread as email 1. That is what lets both tracks share them, and it is why the subject is written as blank rather than as a "Re:" line.
3. **Nothing from section 5's NEVER list appears here** — no price, no guarantee wording, no proof numbers, no case study, no calculator output. The audit is the only ask, and it is free.
4. **Section 9 reaches email too.** Any stop request is honored on the spot, suppressed on every channel, and logged (rules 5, 9, 10). Section 11's open item stands: nobody has scoped who holds the suppression list.
`
