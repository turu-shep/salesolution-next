# Compliance — TCPA / DNC / Call Recording

**For:** Artur Shepel, dialing prospects myself, from Florida (North Miami Beach, FL 33160).
**This is operator guidance, not legal advice.** Anything marked **[VERIFY WITH COUNSEL]** needs a lawyer before I rely on it. Keep the SAFE DEFAULTS card by the dialer; read the rest once.

The short version: I'm one person making manual, live cold calls to businesses. That's the lowest-exposure way to do this. Most of these rules stay easy as long as I dial by hand, keep my hours clean, run a kill-list, and never fire a text off a verbal yes. Two things actually bite: any automation pointed at a cell phone, and recording in an all-party state. Handle those two and the rest is discipline.

This module is the compliance overlay. The opener, gatekeeper handling, and the leak-teardown live in the script modules ([02](./02-revenue-engine-roofing-script.md), [03](./03-revenue-engine-dental-script.md), [04](./04-industrial-script.md)) and the objection library ([05](./05-objection-library.md)). This one tells me what I can and can't do while I run those.

**Scope:** this overlay governs phone calls, voicemail, SMS, and email. The LinkedIn touch in the cadence module ([06-cadence-and-multitouch.md](./06-cadence-and-multitouch.md)) falls under LinkedIn's User Agreement instead — manual, personal connection invites, no automation or scraping — not the TCPA/TSR. Keep it light, and when someone opts out anywhere, suppress them there too.

---

## 0. The one box that covers half my list — owner cell phones

Most Revenue Engine targets are sole-proprietor roofers, HVAC guys, and small dental practices. Their "business number" is the owner's personal cell. That one fact drives most of my risk, because the law treats that cell as a **residential consumer line** for three separate rules at once:

- **Do-Not-Call.** If it's on the registry, the B2B exemption doesn't reliably save me. Scrub it.
- **Autodialer / artificial voice.** No automation pointed at it. Dial it by hand.
- **Quiet hours.** The 8 a.m.–9 p.m. window applies, because the TCPA treats wireless numbers as residential with no business-use carve-out.

So the rule for my number-one list is one line: **scrub it, dial it by hand, dial it 9–7 their local time.** A Florida firm has filed 100-plus quiet-hours suits since late 2024 at $500–$1,500 per text or call, and the hook is exactly this — owner cells treated as residential. That's the lane I stay out of by following that one line. ([Buchalter — quiet-hours litigation surge](https://www.buchalter.com/insights/one-florida-firm-is-targeting-ecommerce-brands-with-tcpa-class-actions-claiming-that-promotional-text-messages-sent-outside-of-8am-9pm-are-illegal-the-industry-is-fighting-back-and-heres-wh/))

The sections below are the detail behind that one line.

---

## 1. Do-Not-Call: where I actually stand

**The DNC-registry B2B exemption is real, but narrow.** The FTC's Telemarketing Sales Rule keeps business-to-business calls out of the National Do-Not-Call rules, except calls selling nondurable office or cleaning supplies. So calling a distributor's published main line to pitch a service sits outside the registry. ([FTC — Complying with the TSR](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule); primary text: [16 CFR Part 310, eCFR](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-310))

**The 2024 amendment closed part of that carve-out.** As of the FTC's 2024 TSR Final Rule, the misrepresentation prohibitions and the recordkeeping requirements now reach B2B calls that used to be fully exempt. The DNC-registry exemption for ordinary B2B still holds, so my core conclusion stands. But "B2B is exempt" is no longer a blanket statement: I have to tell the truth on the call and keep records, business buyer or not. ([Hunton — 2024 TSR B2B amendment](https://www.hunton.com/insights/legal/telemarketing-sales-rule-changes-remove-exception-for-business-to-business-calls-and-impose-new-recordkeeping-requirements))

**The registry itself only lists personal numbers.** Business and fax lines aren't on it. ([FTC — National DNC Registry FAQs](https://consumer.ftc.gov/national-do-not-call-registry-faqs))

**The gray area that matters for me** is the owner cell from Section 0. A personal mobile the owner registered on the DNC list doesn't automatically lose its protection just because he runs a business off it. Mixed-use lines, home-based businesses, and personal cells used for work can fall back under DNC protection. So if a number is on the registry, I honor it even when it's technically a business. The safe move is to scrub. ([donotcallprotection.com — B2B DNC compliance, plain-English explainer](https://www.donotcallprotection.com/blog/business-to-business-b2b-do-not-call-compliance))

**Established business relationship:** an existing relationship gives extra cover under the consumer DNC rules, but I'm calling strangers, so I don't lean on it. It's a bonus when a past requester or old client calls back, not a license to dial a listed number cold. **[VERIFY WITH COUNSEL]** before building anything that depends on it.

**State law can be stricter than federal.** Some states run their own do-not-call regimes and their own telemarketer-registration statutes, so the federal B2B exemption isn't a 50-state pass. The states most likely to have a registration or licensing requirement I'd need to check first: Florida (my home state), plus Texas, Louisiana, Mississippi, and a handful of others run telemarketing-registration programs. I call from Florida into many states. **[VERIFY WITH COUNSEL]** before any high-volume multistate dialing, and confirm Florida's caller rules plus the rules of the states I dial into most. ([MS Law Group — Ninth Circuit B2B DNC](https://mslawgroup.com/ninth-circuits-do-not-call-decision-effects-b2b-callers/))

### My internal do-not-call list is non-negotiable

This one covers everyone, B2B included. It's the cheapest compliance I'll ever do.

- I keep a **company-specific internal do-not-call list.** Anyone tells me to stop, they go on it, and the next dial never happens. ([FTC — TSR guidance](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule))
- I **honor it immediately**, and at the absolute outside within 10 business days. Hanging up on them or arguing the pitch first are both violations. ([PossibleNOW — opt-out fines, explainer](https://www.possiblenow.com/resources/do-not-call-solutions/can-you-be-fined-for-contacting-a-customer-who-previously-opted-out/))
- They stay on it **forever**, unless they opt back in themselves.

**Say it calmly, then stop:**

> "Done. You're off my list, you won't hear from me again. Take care."

No apology, no grovelling. Then log it. A sheet or the CRM with a hard DO NOT CALL flag is enough. What matters is the next dial never goes out.

---

## 2. TCPA: manual vs. automated, and the wire it lands on

The federal Telephone Consumer Protection Act is where the dollar penalties live: $500 to $1,500 per call or text. Two things flip my exposure — how I dial, and what kind of number I hit.

**Manual, live, one-at-a-time calls are my safe lane.** TCPA's consent burden is built around autodialers, prerecorded messages, and artificial or AI voice. A human pressing the buttons and talking live carries the least risk. I keep it manual and I'm clear of the worst of it.

**The moment a call hits a wireless number, automation flips it.** Calls to cell phones using an autodialer, a prerecorded message, or an artificial/AI voice need prior express consent, and prior express *written* consent when the call is telemarketing. A cold call has neither. ([Nextiva — TCPA checklist, explainer](https://www.nextiva.com/blog/tcpa-compliance-checklist.html))

What that means in practice:

- **No auto-dialer or power-dialer into cold cells.** I dial by hand.
- **No prerecorded or AI-voice cold calls.** No ringless voicemail drops, no "press 1" robocalls, no AI voice agent placing cold outbound. The Revenue Engine's voice tooling answers *inbound* calls for a client who consented. That's a different posture. Cold *outbound* with an artificial voice is the trap. **[VERIFY WITH COUNSEL]** before any AI-voice outbound, ever.
- A live human dialing a cell by hand is generally fine. Add automation to that wireless number and I need consent I don't have. So: manual only into cells.

### The 2025 landscape, current as of June 2026

Three FCC items get cited. Here's where they actually stand.

- **One-to-one consent rule: dead.** It would have required separate consent per individual seller. The Eleventh Circuit vacated it on **January 24, 2025**, one business day before its January 27 effective date, holding the FCC overstepped. The FCC then repealed it. Not in force. ([Wiley — 11th Cir. vacates the rule](https://www.wiley.law/alert-UPDATE-11th-Circuit-Vacates-FCCs-One-to-One-TCPA-Consent-Rule), [Nat'l Law Review](https://natlawreview.com/article/eleventh-circuit-vacates-tcpa-one-one-consent-rule-eve-effective-date))

- **Consent-revocation rule: in force since April 11, 2025.** People can revoke consent for calls and texts by **any reasonable means**. I can't force one keyword or one channel. I honor a revocation within **10 business days**. For texts, the rule names these opt-out words specifically: stop, quit, end, revoke, opt out, cancel, unsubscribe. ([Womble Bond Dickinson — revocation rule](https://www.womblebonddickinson.com/us/insights/blogs/new-fcc-tcpa-consumer-consent-revocation-mandates-effective-april-11-2025))

- **The "revoke-all" piece is delayed.** That provision would make one opt-out kill all future calls and texts from me on unrelated topics. A January 2026 FCC order pushed it to **January 31, 2027**. So the cross-topic requirement isn't in effect yet, but the rest of the revocation rule is. ([Consumer Financial Services Law Monitor, Jan 2026 — revoke-all delayed to Jan 31, 2027](https://www.consumerfinancialserviceslawmonitor.com/2026/01/fcc-further-extends-effective-date-for-tcpa-revoke-all-rule/))

The takeaway: honor "stop calling me" and "stop texting me" fast, by whatever words they use. Same internal-list discipline as DNC.

**One thing the law no longer lets me lean on.** In June 2025 the Supreme Court (*McLaughlin v. McKesson*) held that a trial court doesn't have to follow the FCC's reading of the TCPA. Plain version: even a friendly FCC ruling isn't the shield it used to be — a judge can read the statute differently. So I don't build my dialing around "the FCC said it's fine." I stay conservative and assume the strict reading. That's the whole reason the SAFE DEFAULTS card runs tighter than the bare minimum. ([Faegre Drinker — McLaughlin v. McKesson](https://www.faegredrinker.com/en/insights/publications/2025/6/supreme-court-decides-mclaughlin-chiropractic-associates-v-mckesson-corp))

---

## 3. Calling hours and caller ID

**Hours: 8 a.m. to 9 p.m. in the prospect's local time.** That's the TSR window. For me it's not a courtesy. Because the owner's cell counts as a residential line (Section 0), the window applies to my core list, and breaking it is the same $500–$1,500 bite as a DNC violation. I call from Florida (Eastern) into every zone, so the math is on me: 9 p.m. Pacific is midnight my time. The trap is the West Coast roofer I want to catch "after hours." ([ActiveProspect — TSR guide, explainer](https://activeprospect.com/blog/telemarketing-sales-rule-guide/))

There's an open fight over whether a recipient's prior consent turns the quiet-hours window off. A petition's been sitting at the FCC since 2025, still undecided as of spring 2026. It doesn't help me anyway — I'm calling cold, with no consent, so the window applies flat. I don't wait on that petition; I just call inside the hours. ([Troutman — FCC seeks comment on the quiet-hours petition](https://www.troutman.com/insights/fcc-seeks-comments-on-petition-to-address-tcpa-quiet-hours/))

My hard rule, not a rule of thumb: **dial 9 a.m.–7 p.m. in the recipient's zone** and I'm never near the line. West Coast means I don't dial before noon Eastern.

**Caller ID: show a real, working number that traces to me.** FCC rules require a telemarketer to transmit a caller ID number, and where possible the name, of the caller or the party the call is for, reachable during business hours so people can ask not to be called again. ([FCC — unwanted communications](https://www.fcc.gov/enforcement/areas/unwanted-communications), [Kelley Drye — caller ID FAQ](https://www.kelleydrye.com/viewpoints/client-advisories/frequently-asked-questions-on-caller-id-technology))

**No spoofing.** The Truth in Caller ID Act bars knowingly transmitting misleading or inaccurate caller ID with intent to defraud, harm, or wrongfully get something of value. ([FCC — spoofing guide](https://www.fcc.gov/consumers/guides/spoofing))

For me this is easy, and it sells. I **call from my real Sale Solution number, the one that rings back to me.** No local-presence "neighborhood" numbers that rotate area codes. For a trust-first buyer who's been burned, a spoofed-looking local number is the wrong first impression anyway. The number I dial from is the number on my site. **[VERIFY WITH COUNSEL]** if I ever route through a tracking or forwarding number. It has to trace back to me and not mislead.

---

## 4. Call recording

### The default: I don't record cold calls

Recording cold dials buys me almost nothing and creates four problems at once: a permission line that invites a "no," an implied-consent gray zone, the all-party state-list risk, and a hang-up moment before I've earned a second. So the default is simple. **I don't record cold calls.**

I don't need a recording to run the Revenue Leak Audit. The numbers come from *their* phone, *their* Google profile, *their* site. Not from a tape of my pitch.

Recording earns its place later, on the booked audit call, where I get clean consent up front in writing or out loud before anything substantive. The rest of this section is for that call, and for the rare cold call where I decide a recording is worth it.

### One-party vs. all-party

Most states let one party (me) consent to recording. **All-party states need everyone on the call to consent.** Florida is all-party, and a violation can be a felony here. ([NextPhone — call recording laws by state, 2026 explainer](https://www.getnextphone.com/blog/call-recording-laws-by-state); primary: [Recording Law — two-party-consent states 2026](https://www.recordinglaw.com/party-two-party-consent-states/))

**The all-party-consent 12 — the must-ask list:**

California, Connecticut, Delaware, Florida, Illinois, Maryland, Massachusetts, Montana, New Hampshire, **Oregon**, Pennsylvania, Washington. ([Recording Law 2026](https://www.recordinglaw.com/party-two-party-consent-states/), [World Population Review — two-party consent 2026](https://worldpopulationreview.com/state-rankings/two-party-consent-states))

Edges to flag, not memorize:
- **Nevada** is all-party for telephone recording under *Lane v. Allstate* (1998), even though it reads one-party on paper. Treat Nevada as all-party for phone.
- **Connecticut and Oregon** split by call type (phone vs. in-person). I treat both as all-party for phone safety.
- **Michigan** leans one-party after a 2021 decision but has a messy history. Treat as all-party if I want zero risk.
- Different sources count the list at 11 to 13 depending on how they handle these edges. **[VERIFY WITH COUNSEL]** for the exact, current status of any state I record in often.

On Florida's felony point: it's a third-degree felony under Fla. Stat. § 934.03, but a first offense without an illegal purpose drops to a misdemeanor, plus civil exposure around $1,000. Directionally, "can be a felony" is the right deterrent. I don't overstate it past that. ([Recording Law — Florida § 934.03](https://www.recordinglaw.com/party-two-party-consent-states/florida-recording-laws/))

### If I do record: the rule and the line

**The safe rule: get consent on every recorded call, in every state.** I call from an all-party state into a mix of states. One disclosure on every call, and there's nothing to track.

Say it in the first ten seconds, before anything substantive:

> "Heads up, I record so I quote you right. Fine to keep that on?"

The benefit ("quote you right") lands before the ask. Wait for an audible yes. If they say no:

> "No problem, shutting it off now."

And actually stop. **In an all-party state, silence is not consent.** No audible yes means I don't record, full stop. The line that "if they keep talking, that reads as consent" does not hold in Florida or the other 11 — that's the exact gray zone that creates the felony exposure. So: clear yes, or no recording.

That disclosure also does sales work. It's calm, it's honest about *why*, and "so I quote you right" signals the careful operator, not the agency that burned them.

**If they get suspicious — "why are you recording me?"** Don't get defensive. Plain answer:

> "Only so I get your numbers right and don't make you repeat them. Happy to shut it off — your call."

Then do whatever they say. If it's killing the call, kill the recording and keep talking. The recording is never worth the rapport.

---

## 5. The bridge to the SMS auto-reply (A2P 10DLC + written consent)

This is where the cold call connects to the GHL text-back in the repo. The audit-confirmation text that fires after someone books can't legally go out until two things are true.

**A. The 10DLC campaign is registered.** Since **February 1, 2025**, AT&T, T-Mobile, and Verizon **block** unregistered A2P business SMS. Not throttle. Block. I have to register the brand and each messaging campaign with The Campaign Registry before any automated text reliably delivers. The auto-text-back lane (RE-203 in the repo) is gated on this. ([Telnyx — unregistered 10DLC blocked Feb 1, 2025](https://telnyx.com/resources/unregistered-10dlc-is-ending), [Sakari — 10DLC opt-in compliance, explainer](https://sakari.io/blog/meeting-10dlc-compliance-with-opt-ins))

**B. Express written consent is captured on the surface before the text fires.** Marketing and automated texts require documented express written consent: a checkbox, a form opt-in, or a keyword opt-in. A verbal "yeah, text me" doesn't meet that standard for marketing. And consent is per campaign. Consent to book an audit isn't consent to promo texts. ([Sakari — 10DLC opt-ins](https://sakari.io/blog/meeting-10dlc-compliance-with-opt-ins))

So for the cold-call to text handoff:

- **A verbal "sure, text me the link" is not enough to fire the GHL confirmation.** The consent has to be captured in writing on a surface — the audit booking form or the landing-page form — with a visible consent line and the standard disclosures: message frequency, "msg & data rates may apply," STOP to opt out, link to terms and privacy.
- The on-call move is to send them to the form and let the form collect the consent. The form firing is what makes the text legal.
- A one-off personal text from my own phone (not automated, not a campaign blast) is a different, lower-risk thing. The moment it routes through GHL automation, the 10DLC and written-consent rules apply. **[VERIFY WITH COUNSEL]** on where my personal follow-up texts end and an automated A2P campaign begins.

**The spoken handoff line:**

> "I'll text you one link. Two minutes, and it shows you exactly where your calls are leaking, then books the audit. The form's how it texts you back — that's the only text you'll get from me."

"The only text you'll get" does the consent reassurance and the anti-spam trust work in one breath.

The express-consent copy on the capture surface (the LP form and any instant form) is already flagged as the near-term blocker in the channel playbook. I don't run the SMS lane until both the registration and the consent line are live.

---

## 6. Voicemail

Cold dialing means hitting voicemail all day. **A live voicemail I leave myself, by hand, is fine.** It's not a prerecorded message and not a ringless drop, so it's outside the autodialer/artificial-voice rules. What's banned is the automated kind: ringless voicemail drops and prerecorded message blasts. So I leave manual voicemails one at a time, in my own voice, inside the same 9 a.m.–7 p.m. local window, and I don't use any tool that drops voicemail without ringing the phone.

Keep it short, and name the real thing I saw so it doesn't sound like a robocall:

> "Hey [name], Artur Shepel, Sale Solution, down in Miami. I called your main line a few minutes ago and it rang out to voicemail — that's actually why I'm calling. Two-minute thing about the calls you're probably missing. Ring me back at [number] when you've got a sec. Thanks."

If the leak I found was a long hold or a dead website instead, swap that one detail in. The voicemail names the specific thing, or I don't leave it.

---

## On-call branches (the comebacks)

**"Is this a sales call?" / "Are you trying to sell me something?"**

The fastest trust test on the whole call. Lying here is the one thing that turns a legal call into a problem. Be straight, then pivot to what's in it for them.
> "Honestly, yeah, eventually — I run a system that books more of your jobs. But that's not why I called today. I called your line a minute ago and it [went to voicemail / sat on hold 90 seconds]. I'll show you what that's costing you whether or not we ever work together. Two minutes?"

If they still want off, that's a no, and a no gets the opt-out line.

**Opt-out — "stop calling me."**
> "Done. You're off my list, you won't hear from me again. Take care."

Log it immediately as a permanent block.

**Opt-out, stronger — "take me off all your lists / off the internet."**
> "You got it. Off everything on my end, for good."

Revoke-all isn't legally mandatory until 2027, but operationally I log it as a full block across topics, not just this campaign.

**"How'd you get this number? This is my personal cell. I'm on the Do Not Call list."**

The most likely confrontation I'll get, because so many targets are owner cells. Don't argue, don't explain how I sourced it, don't apologize twice.
> "Fair question, and you're right to ask. I'm taking you off right now — you won't hear from me again."

Then scrub that number and add it to the internal list before the next dial.

**"Just email me / put it in writing, I'm driving."**

Take it. Email sidesteps the 10DLC and written-consent problem completely, and "I'm driving" is a real safety reason to get off the phone.
> "Smart, you're driving — I'll get off. I'll email you the two-minute teardown of where your calls are leaking. What's the best address?"

If they won't give an email either, that's a soft no. Thank them and move on. No pushing.

**Recording — prospect goes silent (only relevant if I'm recording at all).**

In an all-party state, silence isn't a yes. Stop the recording and keep talking, or ask once more plainly:
> "Just so I'm clear — okay to keep the recording on, or want me to shut it off?"

No clear yes, no recording.

**Handoff — "just tell me the numbers now, I'm not filling out a form."**

Don't fight it. Give one number out loud, then route off SMS:
> "Fair enough. Quick one: I called your line earlier and got [voicemail / a 90-second hold]. That alone is roughly [X] missed jobs a month at your ticket. Want the full teardown? I'll email it instead of text — no form."

Email sidesteps the 10DLC and written-consent problem completely. Use it as the fallback any time the form is friction.

---

## SAFE DEFAULTS — the card by the dialer

Follow all of these and I'm clean without a lawyer on standby.

1. **Dial by hand.** No auto-dialer, no power-dialer, no prerecorded message, no AI voice on cold outbound. One human, one call.
2. **Call 9 a.m.–7 p.m. in the prospect's local time, not mine.** West Coast means no dialing before noon Eastern. This is a hard rule, because owner cells count as residential.
3. **Show my real number** — the one on salesolution.net that rings back to me. Never spoof, never rotate local-presence numbers.
4. **Scrub personal cells against the DNC registry** before dialing Revenue Engine prospects on mobiles. On the list means skip it, even if it's "a business."
5. **Keep the internal Do-Not-Call list.** Anyone says stop, they go on it, I honor it on the spot, forever. Same for "stop texting."
6. **Default: don't record cold calls.** If I do record, get an audible yes first. Florida is all-party, and so are 11 other states plus Nevada. Silence is never a yes in an all-party state.
7. **Never fire the GHL text off a verbal yes.** The booking form captures the written consent that makes the confirmation text legal. No shortcuts.
8. **No automated texts until the 10DLC campaign is registered** and the express-consent line is live on the form.
9. **Honor every opt-out fast** — within 10 business days, sooner is better — across calls and texts, by whatever words they use.
10. **If asked, say it's a sales call.** Then pivot to their leak. Never deny it.
11. **Log it and keep the log.** Who opted out, when, and the source list. Retain opt-out and DNC records. The TSR recordkeeping standard sets how long. The record is the defense.

### Needs counsel before I rely on it — [VERIFY WITH COUNSEL]

- Any **multistate, high-volume** dialing program. State DNC and telemarketer-registration laws (Florida, Texas, Louisiana, Mississippi, and others) can be stricter than federal. Confirm Florida's caller rules plus my top destination states.
- Any **AI-voice or automated outbound** to wireless numbers. Highest exposure I could create.
- The exact **current all-party-consent list and edges** (Nevada, Connecticut, Oregon, Michigan) if I record in any of them often.
- Where my **personal hand-texts** stop and an **automated A2P campaign** begins.
- Whether I can ever rely on an **established business relationship** to call a DNC-listed number.
- **Record-retention specifics** under the 2024 TSR amendment — what to keep and for how long.

---

**Sources**

*Primary (load-bearing):*
- FTC — [Complying with the Telemarketing Sales Rule](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule) · [16 CFR Part 310 (eCFR)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-310) · [National DNC Registry FAQs](https://consumer.ftc.gov/national-do-not-call-registry-faqs)
- FCC — [Unwanted communications](https://www.fcc.gov/enforcement/areas/unwanted-communications) · [Spoofing guide](https://www.fcc.gov/consumers/guides/spoofing)
- 2024 TSR B2B amendment — [Hunton](https://www.hunton.com/insights/legal/telemarketing-sales-rule-changes-remove-exception-for-business-to-business-calls-and-impose-new-recordkeeping-requirements)
- TCPA one-to-one vacatur — [Wiley](https://www.wiley.law/alert-UPDATE-11th-Circuit-Vacates-FCCs-One-to-One-TCPA-Consent-Rule) · [Nat'l Law Review](https://natlawreview.com/article/eleventh-circuit-vacates-tcpa-one-one-consent-rule-eve-effective-date)
- TCPA revocation rule — [Womble Bond Dickinson](https://www.womblebonddickinson.com/us/insights/blogs/new-fcc-tcpa-consumer-consent-revocation-mandates-effective-april-11-2025)
- Revoke-all delay to Jan 31, 2027 — [Consumer Financial Services Law Monitor (Jan 2026)](https://www.consumerfinancialserviceslawmonitor.com/2026/01/fcc-further-extends-effective-date-for-tcpa-revoke-all-rule/)
- *McLaughlin v. McKesson* (FCC orders not binding on trial courts), June 2025 — [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2025/6/supreme-court-decides-mclaughlin-chiropractic-associates-v-mckesson-corp)
- Quiet-hours litigation surge — [Buchalter](https://www.buchalter.com/insights/one-florida-firm-is-targeting-ecommerce-brands-with-tcpa-class-actions-claiming-that-promotional-text-messages-sent-outside-of-8am-9pm-are-illegal-the-industry-is-fighting-back-and-heres-wh/) · quiet-hours consent petition pending — [Troutman](https://www.troutman.com/insights/fcc-seeks-comments-on-petition-to-address-tcpa-quiet-hours/)
- Recording-consent states — [Recording Law — two-party 2026](https://www.recordinglaw.com/party-two-party-consent-states/) · [Florida § 934.03](https://www.recordinglaw.com/party-two-party-consent-states/florida-recording-laws/) · [Nevada / *Lane v. Allstate*](https://www.recordinglaw.com/united-states-recording-laws/one-party-consent-states/nevada-recording-laws/) · [World Population Review — two-party 2026](https://worldpopulationreview.com/state-rankings/two-party-consent-states)
- A2P 10DLC blocking — [Telnyx (Feb 1, 2025)](https://telnyx.com/resources/unregistered-10dlc-is-ending)

*Plain-English explainers (confirmation, not authority):*
- [donotcallprotection.com — B2B DNC](https://www.donotcallprotection.com/blog/business-to-business-b2b-do-not-call-compliance) · [DNC.com — B2B exemptions FAQ](https://www.dnc.com/faq/are-there-exemptions-b2b-calls) · [PossibleNOW — opt-outs](https://www.possiblenow.com/resources/do-not-call-solutions/can-you-be-fined-for-contacting-a-customer-who-previously-opted-out/) · [MS Law Group — Ninth Circuit B2B](https://mslawgroup.com/ninth-circuits-do-not-call-decision-effects-b2b-callers/) · [Nextiva — TCPA checklist](https://www.nextiva.com/blog/tcpa-compliance-checklist.html) · [ActiveProspect — TSR guide](https://activeprospect.com/blog/telemarketing-sales-rule-guide/) · [Kelley Drye — caller ID FAQ](https://www.kelleydrye.com/viewpoints/client-advisories/frequently-asked-questions-on-caller-id-technology) · [NextPhone — recording laws 2026](https://www.getnextphone.com/blog/call-recording-laws-by-state) · [Kixie — recording laws](https://www.kixie.com/sales-blog/what-are-the-laws-governing-call-recordings/) · [Sakari — 10DLC opt-ins](https://sakari.io/blog/meeting-10dlc-compliance-with-opt-ins) · [CallHub — 10DLC 2025](https://callhub.io/blog/compliance/10dlc-2025-registration-callhub/)
