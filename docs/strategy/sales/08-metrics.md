# Metrics & the Call-Logger Model

*Internal. Not a script I read out loud. This is how I score the dialing so the calls get better and I book more. Read it once, set up the logger, then forget it and dial. If a number doesn't change a decision I make next week, it doesn't go in the log.*

This module measures the calls. The **scripts** — the word-for-word opener, the leak-reveal line, the booking close — live in the script modules, not here. **This logger is only as honest as those scripts are stable.** Every rate below (Reached-DM, Conversation→Booked) is defined against a line I'm supposed to say. If a script line is still moving, the rate built on it is measuring noise. Lock the script before I trust the funnel.

The whole thing exists to answer three questions:

1. **Am I dialing enough?** → the dial count.
2. **Am I getting through to the right person?** → the Reached-DM rate (§4).
3. **Once I'm in a real conversation, am I booking it?** → the Conversation→Booked rate (§4).

Every field and rule below traces back to one of those three. If a field doesn't, I cut it.

---

## 1. The funnel — seven stages, one observable definition each

One row per dial. A call reaches its furthest stage and stops. I log that stage plus one outcome (§2). Each stage is defined by **a fact I could point to on a recording**, not by how the call felt. No "landed," no "good energy," no half-credit.

| # | Stage | Counts when (observable) | Does NOT count |
|---|-------|--------------------------|----------------|
| 1 | **Dial** | I pressed call. Every attempt, including a redial after a hang-up. | Nothing — a dial is always a dial. |
| 2 | **Connect** | A live human said words back. Anyone: owner, spouse, front desk, the guy in the truck. | Voicemail, dead air, fax tone, "number no longer in service." Those are dials that didn't connect. |
| 3 | **Conversation** | I reached the decision-maker **and** they answered my reason-for-calling with at least one real back-and-forth. | I only got a gatekeeper. Or the owner said "not interested, take me off your list" inside the first few seconds and was gone. That connected. It's not a conversation. |
| 4 | **Pitch** | I named the leak I found, said what the audit/call is, and they heard the whole offer before they responded. The reason-for-calling fully landed in the air, whatever they do with it. | They cut me off before I got the offer out. Conversation, no pitch. |
| 5 | **Booked next-step** | A specific slot is on the calendar — audit or growth call — with a date, a time, and their spoken "yes, book it." | "Send me something." "Call me next week." Those are callbacks (§2), not bookings. |
| 6 | **Showed** | They were there at the booked time, live, and we ran the audit / had the call. | No-show. Or they bailed or rescheduled before it happened. |
| 7 | **Won** | Signed. Revenue Engine: agreement signed, install starts. Industrial: engagement signed. | A second meeting is not a win. A verbal "yeah, let's do it" is not a win until it's signed. |

**On "Conversation."** This is the most load-bearing definition in the doc, because two of my three steering rates run through it. So it's a fact, not a feeling. The test is binary: *did the decision-maker engage past the first beat, or not?* One real exchange about why I'm calling — even a hostile one — is a conversation. A reflex "nope" before I've said a full sentence is not. On dial 4 of a good morning and dial 38 of a brutal afternoon, that question gets the same answer. The day I start scoring "did it land" by gut, my two key rates start lying to me.

**No vanity metrics.** I don't track talk time, calls-per-hour as a goal, or "touches." Those reward looking busy. The only volume number that counts is **dials**, because it's the one thing fully inside my control. Everything downstream is a rate I raise by getting better, not by sitting on the phone longer.

---

## 2. The per-call OUTCOME enum — the logger contract

Every dial gets **exactly one** outcome from this closed list. No free-typing the outcome field, or the data turns to mush by week three. DNC is handled separately as a flag (below), not as an outcome, so a do-not-call request can never erase a connect from the denominators.

| Value | Means | Furthest stage (locked) | Motion |
|-------|-------|-------------------------|--------|
| `no-answer` | Rang out. No voicemail, or no box. | Dial | both |
| `voicemail-left` | Hit voicemail, left the message. | Dial | both |
| `wrong-number` | Not the business — reassigned, disconnected, dead line. Flag for list cleanup. | Dial | both |
| `gatekeeper-wall` | Live human, blocked from the owner. Front desk, "he's on a job," spouse taking a message. | Connect | both |
| `bad-fit-on-call` | Reached a human, plainly not the buyer — wrong size, wrong trade, no decision power and never will have it. Found it at the Connect beat. | Connect | both |
| `not-interested` | Reached the decision-maker, got a hard no. Log the objection that killed it. | Conversation | both |
| `interested-no-commit` | Reached the DM, real conversation, genuine interest — but no agreed next step and not a no. "Let me think, I'll get back to you," no time set. | Conversation | both |
| `callback-scheduled` | A real agreed time to call back, with a reason. "Tuesday after 4, when I'm off the roof." Not a brush-off. | Conversation, **or** Pitch if I delivered the full offer first | both |
| `disqualified` | I qualified them out, on purpose. Industrial under the $5M floor; out of service area; wrong trade for the system. This is **me** saying no, not them. | Connect if I caught it on the first beat; Conversation if it surfaced once we were talking | both |
| `booked-audit` | Revenue Leak Audit on the calendar, confirmed. | Booked next-step | revenue-engine |
| `drove-to-self-audit` | Owner won't take a call but will fill out the audit form himself. I sent him to it and confirmed he'll do it. The soft door for local-service. | Conversation | revenue-engine |
| `booked-growth-call` | Growth Call on the calendar, confirmed. | Booked next-step | industrial |
| `booked-diagnostic` | Industrial prospect took the written diagnostic at `/unlock-growth-audit/` as the step instead of a call. The soft door for industrial. | Booked next-step | industrial |

**Motion lock.** `booked-audit` / `drove-to-self-audit` are local-service only. `booked-growth-call` / `booked-diagnostic` are industrial only. A local-service prospect can never be `booked-growth-call`. If I ever reach for a cross-motion outcome, I've blurred the two motions and need to stop and re-check which list I'm dialing.

**Why `interested-no-commit` exists.** A four-minute call where the owner is genuinely warm but says "let me think" maps to none of the others. It's not a no (`not-interested`), not an agreed time (`callback-scheduled`), not me saying no (`disqualified`). Without its own bucket, those rows get dumped into `not-interested` and poison my most important rate. They're warm. They go in the callback queue, not the dead pile.

**Why `callback-scheduled` can credit Pitch.** If I delivered the whole offer and *then* they said "call me Tuesday," that's a pitch that happened — it shouldn't get undercounted as a mere conversation. Furthest stage is Pitch in that case, Conversation if they scheduled the callback before I got the offer out. Same on `disqualified`: stage is Connect if I caught the disqualifier on the first beat, Conversation if it surfaced once we were talking. The outcome value is the same; the stage field carries the distinction, off a checkbox, not a free edit.

### The DNC flag (separate from outcome)

`do_not_call` is a **boolean flag on the record**, not an outcome. When someone asks not to be called again — or it's a registry hit — I set the flag, log the real outcome and furthest stage the call actually reached, and suppress the contact forever. This way a DNC at the Connect or Conversation stage still counts in those denominators, because it happened, and the suppression list stays its own thing. An outcome of "DNC" with stage "any" would make the call uncountable. This doesn't.

### Fields per call (the full record)

| Field | Type | Notes |
|-------|------|-------|
| `dial_at` | datetime | Auto. When I pressed call. Local time + the prospect's time zone if it differs (time-of-day drives connect rate). |
| `ended_at` | datetime | Auto if the dialer gives it. Lets me reconstruct call length and, later, talk-time-to-booking. Optional. |
| `contact_id` | ref | Links to the Apollo contact / account. The join key (see §7). |
| `business_name` | text | Denormalized so the log reads without a lookup. |
| `motion` | enum: `revenue-engine` \| `industrial` | Set **from the list before I dial**, never guessed mid-call. Drives which outcomes are even legal for this row. |
| `track_detail` | enum: `roofing` \| `hvac` \| `plumbing` \| `electrical` \| `dental` \| `distributor` \| `manufacturer` | Sub-vertical. Drives which opener and which CTA. |
| `outcome` | enum (above) | Exactly one. Required. |
| `furthest_stage` | enum: Dial…Won | **Deterministically mapped from `outcome`** (see lock below). Not hand-editable. |
| `do_not_call` | boolean | The suppression flag. Default false. |
| `objection_hit` | enum (below) | The main objection that came up, if any. Closed list so it's countable. Blank if none. |
| `leak_observed` | text (short) | **Required when `motion = revenue-engine`.** The real leak I found pre-call: "VM after 5 rings, GBP missing hours, no text-back." The log won't save a local-service row without it (§5). |
| `gap_observed` | text (short) | The industrial equivalent. What I saw before dialing: "catalog quote-only, no part-number pages, ChatGPT names the manufacturer not them." Required-soft for industrial: if blank, the reason-for-call goes in `notes`. |
| `next_step` | text | What happens next and when. "Audit Thu 2pm" / "callback Tue 4pm" / "none." |
| `next_step_due` | date | Drives the callback queue. Null if nothing owed. |
| `notes` | text | Anything human — the detail I'll want when I dial them again. |
| `recording_url` | url | Optional. The recording, if the dialer captured it. |

**`furthest_stage` is locked, not editable.** It's derived from `outcome` by the fixed map in this section's table, with two branch cases (`callback-scheduled` and `disqualified`) carried by a checkbox, not a free edit. I never bump the stage "up because the call felt like it went further." If a call genuinely went further, that's a *different outcome*, and the outcome carries the stage. A human nudging this field by feel on a bad day breaks every rate in §4. So it can't be nudged.

**`objection_hit` closed list** (so objections are countable, not prose):
`been-burned` · `no-time` · `too-expensive` · `just-tell-me-price` · `lock-in-fear` · `have-an-ads-guy` · `already-have-someone` · `not-the-buyer` · `too-good-to-be-true` · `under-5m` (industrial floor) · `send-me-info` · `who-are-you` / `where-from`.

---

## 3. Benchmarks — I don't have a trustworthy one yet

I have no external benchmark I'd bet a decision on. Published cold-call rates are all over the map and mostly come from vendors selling dialers, so I'm not pasting four rows of laundered numbers into a spec and grading a normal day against them.

**The only benchmark is my own trailing four weeks.** Until I've logged ~200 dials, I don't compare myself to anything — I dial, log honestly, and let the data stack up. After ~200 dials I have my own connect rate, my own Reached-DM rate, my own Conversation→Booked rate, and *those* become the line. Each month, last month is the bar.

One thing to keep me calm before the data exists: **most dials end in no-answer or voicemail. That's the job, not a failure.** A day of 40 dials and 2 real conversations is the connect rate doing exactly what connect rates do. I don't rewrite a working script over a normal-bad afternoon.

**The bet I'm running** (stated as a bet, not a fact): a founder dialing owners with a *specific real leak* I found on their own phone and Google profile should convert conversations to bookings better than a generic SDR reading a list. That's the whole reason the leak-led opener exists. It's **untested until my own log proves it** — which is exactly what §6 Q4 checks.

---

## 4. Leading vs lagging — and the three rates I steer by

**Lagging** (the scoreboard; I can't move it directly this week): Showed · Won · Revenue from won deals.

**Leading** (the inputs; in my control today): Dials · Connects · Reached-DM · Conversations · Pitches landed · Booked next-steps.

The chain runs left to right:

**dials → connects → reached-DM → conversations → bookings → (later) shows → wins.**

I fix it left to right. If bookings are low, I do **not** start by dialing more. I look one stage left and find where the drop actually is. Volume is the last lever, not the first.

**The three rates that answer the three questions:**

| Question | Rate | What a bad number means |
|----------|------|-------------------------|
| Am I dialing enough? | **Dials vs my weekly floor** (`[SET: dials/week — Artur to fix the number after the first 200 dials]`) | Below floor: nothing else this week is diagnostic. I just didn't dial. |
| Am I getting through to the right person? | **Reached-DM rate** = Conversation stage ÷ Connect stage. (Connects that died at `gatekeeper-wall` or `bad-fit-on-call` are the ones I'm *not* getting through on.) | Low: I'm reaching humans but not the owner. List quality, timing, or my gatekeeper handling — not my pitch. |
| Once I'm in, am I booking it? | **Conversation→Booked rate** = bookings ÷ Conversation stage | Low: I'm getting the owner and losing the close. The script or the leak I'm leading with — not the list, not the volume. |

The Reached-DM rate is the whole reason `gatekeeper-wall` and `bad-fit-on-call` are separate outcomes both sitting at Connect: their **count** is the gap between "someone answered" and "I got the owner." Split them out and question 2 has a number. Lump them in and it doesn't.

The one number I protect every single day: **dials.** It's the only one I fully control no matter how the calls go.

---

## 5. The pre-dial gate (local-service) — the bet, enforced by the log

The leak-led opener is the whole bet (§3). So the highest-leverage rule in this playbook isn't a metric — it's a gate I clear **before** I press call on any local-service prospect:

1. **Call their main line myself.** Does it ring out to voicemail? How many rings? If I leave a message, how long until anyone calls back? (Often: never. That's the call.)
2. **Pull up their Google Business Profile.** Hours missing? Few or stale reviews? No recent posts? Can a customer even message it?
3. **Open their website on my phone.** Is there a fast way to call or text, or is it a contact form nobody checks?

Whatever I find goes in `leak_observed` **before the dial** — and the log won't save a `revenue-engine` row without it. That's the bet enforced by the schema instead of remembered by the dialer. Skip the gate and I've got nothing real to open with. I'm just another SDR with a list.

Industrial has no live phone to test the same way, so the gate is lighter: a 60-second look at their catalog and one AI query ("best supplier for [their part type]" in ChatGPT — do they show up, or does it name the manufacturer instead?). That goes in `gap_observed`, or the reason-for-call goes in `notes`.

---

## 6. Weekly review — five questions, fifteen minutes, log open

I'm hunting the one stage that's bleeding, not running a full audit. Same five every week.

1. **Did I hit my dial floor?** Total dials vs the weekly floor (`[SET: dials/week]`). If no — stop. Nothing else this week is diagnostic; I just didn't dial enough. Fix that first, read the rest next week.
2. **Where's the funnel narrowest?** Walk dial → connect → reached-DM → conversation → booked. Find the stage with the steepest drop **versus my own trailing average**, not versus any outside number. That's this week's bottleneck — one stage, not five.
3. **Is it a gate problem or a close problem?** This is the fork question 2 sets up. If Reached-DM is low, it's the list, the timing, or the gatekeeper — don't touch the script. If Reached-DM is fine but Conversation→Booked is low, it's the script or the leak — don't touch the list.
4. **Is the leak actually landing?** (Local-service.) Read `leak_observed` on `booked-audit` rows against `not-interested` and `interested-no-commit` rows. When I led with a specific real leak — their dead voicemail, their stale GBP — did it book more than when I winged it? If yes, that's the bet paying off, and I never dial a local prospect again without clearing the §5 gate. If the booked rows and the dead rows have equally specific leaks, the leak isn't the variable — look at the close.
5. **Which objection keeps killing me?** Sort `objection_hit` by count. If `been-burned` or `just-tell-me-price` is top three weeks running, my opener isn't pre-empting it. Fix the script, not the list.

**The callback queue comes first, always.** Before any of the five, pull every row where `next_step_due ≤ today`, plus every open `interested-no-commit` and `callback-scheduled`. These are warmer than any cold number. They get called Monday morning, before I touch a fresh list.

**Monthly:** recalibrate. Replace any placeholder expectation with my own trailing rates. After the first month, the only benchmark is me, last month.

---

## 7. How phone bookings connect to the site's tracking — and the honest gap

This is the part I can't fudge, so I'll say it straight. I checked the code; these aren't guesses.

**A phone booking does not show up in the website analytics. There is no automatic path from "I booked them on this call" to a tracked conversion on the site.** Two things are unwired right now:

- **No Meta Lead event.** In `lib/analytics.ts`, `track()` dispatches only to `window.gtag` (line 234) — it never calls `fbq`. The Meta Pixel fires PageView and nothing else. So a phone-booked audit is invisible to Meta. *(Verified against the file, 2026-06-19.)*
- **No conversion fires on the confirmation page.** `app/(site)/revenue-engine/audit-booked/page.tsx` carries a comment calling it "the single place a conversion fires" (lines 8–13), but the component has no `track()`, no `gtag('event', …)`, no `fbq`. Nothing fires there yet. *(Verified against the file, 2026-06-19. Matches the channel-funnel playbook's launch-blocker list.)*

**So the cold-call log is the system of record for phone bookings.** I never infer a phone booking from site analytics — it would undercount them to roughly zero.

**The rule, up front: count cold-call bookings by counting `booked-audit` (or `booked-growth-call`) rows in this log. Nowhere else.** Two booking sources, kept separate:

| Booking came from… | Recorded in | Counts as |
|--------------------|-------------|-----------|
| **The phone (me, cold)** | This log + Apollo (the `booked-*` outcome mirrored to an Apollo task/stage). Manual. | A cold-call booking. |
| **The site** (GHL audit embed / growth-call form) | The site funnel, once the GHL embed ID lands and the Lead/conversion events are wired. | An inbound booking. |

**The double-count trap, and the one rule that defuses it.** A prospect I cold-called later books *himself* through the site — now he's in both places. Dedupe on the **prospect's phone number** (normalized to E.164), with **email** as the fallback match. The Apollo `contact_id` is the internal join key, but the GHL site embed won't carry Apollo's ID, so phone-then-email is the field both sides actually share. When the site funnel goes live, I dedupe cold + inbound on phone, then email, before I sum anything. Same failsafe the audit route already uses for GA4 (dedupe on `submissionId`). Until the site side is wired, there's nothing to dedupe against — the phone log stands alone.

**Bottom line:** "how many audits did cold calling book this month" comes from **counting `booked-audit` rows in this log**, not from a chart in GA4 or Meta. I log the booking the second the slot hits the calendar, live on the call. If it's not logged, it didn't happen.

---

*One rule outranks the rest: `motion` is set from the list before I dial, the legal outcomes follow from it, and a Revenue Engine prospect is never logged as a growth call. The second rule: the log won't save a local-service row without the leak I found before dialing. That's the bet, written into the schema so I can't skip it.*
