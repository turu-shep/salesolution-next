# Voicemail + multitouch cadence

This is the part of the cold call you'll use most, because most dials don't get picked up. The voicemail's only job is to earn a callback or set up the next touch. It doesn't sell. The leak sells.

Read this with the channel-funnel playbook open. Calling rides on top of the cold email, it doesn't replace it. The email is reply-first: a question, never a link, until deep in the sequence. Every touch points back to the last one so you sound like one person following up, not three channels firing at random.

Two motions. Never run a contact through both.

- **Revenue Engine** goes to local-service owners (roofing, HVAC, plumbing, electrical, dental). The voicemail names a leak you actually found on their phone or profile. The ask is the Revenue Leak Audit.
- **Industrial** goes to owners and presidents of $5M to $75M distributors and manufacturers. The ask is a Growth Call. The written diagnostic at `/unlock-growth-audit/` is the back door for the owner who won't book a call but will read.

The phone number in every script is **561-531-4339** (`lib/business.ts`). **[VERIFY]** before this ships: confirm that line rings to Artur directly. If it routes to a desk or voicemail, every script below is broken.

---

## Rule zero: find the real leak before you dial

This is the whole edge. A generic voicemail gets deleted at second three. A voicemail that names the exact thing wrong with their phone gets a callback, because you just proved the problem by living it.

Before you dial a local-service prospect, four minutes of work:

1. **Call the main line yourself.** Note what actually happens. Straight to voicemail? Rings out? Picked up, then put on a long hold? Time it. Then wait and see if anyone calls the number back (almost nobody does).
2. **Pull up the Google Business Profile.** Note the review count, the date of the last review, whether the hours look current, whether anyone replies to reviews.
3. **Open the website on your phone.** Note whether it loads fast, whether there's a tap-to-call button, whether there's any way to book.

Now you have a real finding. The voicemail names that one thing. Not "businesses like yours miss calls." Their line, today, did this.

For industrial, the pre-call work is different. Ask ChatGPT and Google's AI where to buy their kind of parts and note whether the answer names them, a competitor, or Amazon. Then run a part-number search on their own site and note what it does. The voicemail names that gap, plainly.

**The honesty gate.** Only claim a leak you actually observed. If your test call got picked up fast and the profile looks fine, you don't have a missed-call leak. Don't invent one. If you have no clean finding, skip the voicemail and move that contact to the email-only track. A made-up leak is worse than no call.

---

## Voicemail discipline (every script below obeys these)

- **Under 20 seconds.** That's about 45 to 55 spoken words. Longer and the callback rate drops and you start to sound like a pitch.
- **One observed finding, then stop.** No price. No product. No "I help businesses like yours." The first voicemail earns curiosity about their own number. That's all.
- **Name and number twice.** Once at the top, once at the end, said slow. Most callbacks die because nobody caught the number.
- **Reference the last touch when there's been one.** "I sent you a note" ties the channels together.
- **Calm. No urgency, no scarcity.** No "limited spots," no "before I close my calendar." This buyer is burned. Fake urgency reads as a scam and you lose them.
- **One em-dash per voicemail, at most.** In a spoken line, an em-dash makes you rush two clauses together, which is exactly what makes you sound like a salesperson. Use full stops. Let the lines breathe.

---

## Revenue Engine voicemails

### RE-VM1: first voicemail, leak-led

Lead with the finding. No process narration, no offer.

> "Hi [First name], it's Artur Shepel. My number's 561-531-4339.
> I called your main line just now and it went to voicemail. That's the reason I'm calling. When that happens during business hours, those callers usually just dial the next company. I can show you how many you're losing off your own line.
> Call me back when you've got two minutes. Again, Artur, 561-531-4339. Thanks, [First name]."

About 55 words. If your test call rang out instead of hitting voicemail, swap line two: *"I called your line twice today and it rang out both times."* Say what happened, not what you suspect.

**HVAC / plumbing / electrical** (trade-neutral, since this covers three trades):

> "...I tested your phone today. Rang four times, then voicemail. When you're out on a job, those calls don't wait around. They dial the next guy in the search. I can show you how many that adds up to in a month. Call me back. Artur, 561-531-4339."

**Dental** (never reference patients or any caller detail):

> "...I called your front desk this morning and got voicemail. When that line's busy, it's usually a new patient calling around, and they book with whoever picks up. I can show you roughly how many of those you're missing a month. Call me back. Artur, 561-531-4339."

### RE-VM2: second voicemail, ties to the email

Use after RE-VM1 went unreturned and email #1 went out. Reference the email, then bring a second, different finding so you're not repeating yourself.

> "Hey [First name], Artur again. 561-531-4339. I sent you a note earlier this week about the calls going to voicemail.
> One more thing I noticed. Your last Google review is from [month/year]. When it's that old, you start dropping below the shops that show up first when someone Googles a [roofer/plumber/etc.] nearby.
> Both of those, I can show you the real number. Reply to my email or call me. 561-531-4339."

**If there's no clean second finding** (the profile's current, reviews are recent), don't manufacture one. Tie back to the same leak with a softer second touch:

> "Hey [First name], Artur again. 561-531-4339. Following up on my note from earlier this week about the missed calls. The offer's simple. About twenty minutes, I show you your own numbers, and they're yours to keep. No pitch on the call. Reply to the email or give me a ring. 561-531-4339."

### RE-VM3: last voicemail, the clean break

The final spoken touch. Say it's the last one. Pick the walk-away posture and hold it. Don't re-pitch in the same breath you say you're leaving.

> "[First name], it's Artur. Last time I'll leave one. 561-531-4339.
> I'm not going to keep calling you. If the missed calls aren't costing you enough to spend twenty minutes on, no problem at all.
> If they are, you've got my number. Take care."

Naming it as the last call gets more callbacks than another pitch would. Saying you'll stop, and meaning it, is the trust signal.

### What you never say in a Revenue Engine voicemail

- **The price.** It depends on trade, location, and scope, and it comes in the audit, in writing, the same day. Quote it cold and you kill the audit.
- **A lead count or "guaranteed leads."** The guarantee is revenue the system can prove, not volume.
- **Anything that sounds like you sell or resell ads.** You don't. If they call back asking, that's where the de-position line fires (see the live-answer branches below): no markup on your ads, you don't resell leads, keep your ads guy.

---

## Industrial voicemails

The voice shifts. Owner to owner, but this buyer measures in quotes and revenue. AI literacy is "somewhat," so you can say ChatGPT and "Google's AI answer" cold. You can't say GEO, schema, citation share, or CTR. Lead with the finding, not your job title.

### IND-VM1: first voicemail, the AI-answer gap

> "Hi [First name], Artur Shepel. 561-531-4339.
> I asked ChatGPT this morning where to buy [their category] and it sent buyers to [competitor / Amazon], not you. That's quote work walking past your door.
> Fixing that is what I do. Worth a short call. Artur, 561-531-4339. Thanks."

If you can't confirm the AI named a specific competitor, don't invent one. Soften to: *"...and it didn't name you at all."*

### IND-VM2: second voicemail, the leaked-quote angle

Ties to the email. Pivots to the second villain: quotes that come in and nobody chases.

> "[First name], Artur again. 561-531-4339. Following up on my email from earlier this week.
> The other half of what I see with distributors: quotes come in, nobody chases them, and good phone work goes to waste.
> I put together a short written rundown of where I'd look on your end. No call needed if you'd rather just read it. Reply to my email and I'll send it over. Artur, 561-531-4339."

That written rundown is the `/unlock-growth-audit/` diagnostic, the secondary door for the owner who won't book but will read.

### IND-VM3: last voicemail, the clean break

> "[First name], it's Artur. Last one. 561-531-4339.
> If getting found in the AI answers and chasing your open quotes isn't near the top of the list right now, I'll get out of your way.
> If it is, I'm easy to reach. 561-531-4339. Appreciate the time."

---

## The live-answer script (the one that books)

Three dials per prospect exist to produce this. Everything else is the fallback. When they pick up, you have about ten seconds before they decide whether this is a sales call worth ending. Lead with the finding, the same one your voicemail would have named.

### RE live opener (Revenue Engine)

> "Hi [First name], it's Artur Shepel. I'll be quick. I called your main line a few minutes ago and it went to voicemail, so I figured I'd try you direct.
> Here's why I called. I think you're losing calls during the day to whoever the customer dials next, and I can show you the actual number off your own line. Takes about twenty minutes, costs you nothing. Two quick questions and I'll get out of your hair. Is that line the main way jobs come in?"

Then shut up and let them answer. If yes, you've confirmed the leak matters. If no, ask which line does and pivot to that one.

### IND live opener (industrial)

> "Hi [First name], Artur Shepel. I'll keep it short. I asked ChatGPT this morning where to buy [their category] and it pointed buyers at [competitor / Amazon] instead of you. For a company your size, that's quotes you never see.
> One question so I'm not wasting your time. When a new buyer can't find you that way, are most of your quotes still coming from reps and repeat accounts? Or do you need the phone ringing with new ones?"

Then listen. Their answer tells you whether the AI gap is a real problem for them right now.

### Live-answer objection branches (word for word)

Script these. They're the most common live moments, and improvising them is where booked calls get lost.

**"Is this a sales call?"** Don't dodge it. Name it and de-risk it.
> "Fair question. Down the road, yeah, I'd want to earn your business. But the thing I'm offering today costs you nothing. I show you your own numbers, you keep them, and if it's not useful you never hear from me again. That fair?"

**"I'm busy / I'm on a job / I've got a patient."** Don't push. Trade thirty seconds for a callback.
> "Course you are. That's the whole problem I called about. Give me thirty seconds now, or pick a better time. Which is easier?"
> If thirty seconds: deliver the finding in one breath and ask for the audit. If a better time: lock a specific window and confirm the number to call.

**"I already pay a guy for leads / for ads."** This is the most common one from a burned local owner. Promote the de-position line here, don't bury it.
> "Good. Keep him. I'm not in the ads business. No markup on your ad spend, I don't resell anybody's leads, and I'd never tell you to fire your ads guy. What I do is make the leads he's already buying actually turn into booked jobs. Right now a chunk of them are hitting voicemail, and the audit just shows you how big that chunk is. Worth twenty minutes?"

**"Just tell me the price."** Anchor against the leak before any number, and the real number isn't yours to quote cold.
> "I'd be guessing if I threw a number at you now, because it depends on your trade, your area, and what you actually need. So here's the honest version. The audit shows you what the missed calls are costing you first. Then the price comes in writing, same day, and it's built to land under the leak. If it doesn't, there's nothing to talk about."

**"Send me something / email me."** Treat it as a yes-to-email, not a brush-off you fight. Confirm the address and the next step.
> "Will do. I'll send the short version to [confirm email]. Shoot me one line back telling me if the missed-call thing rings true, and I'll set up the twenty minutes. Sound good?"

**Industrial "we're doing fine on Google."** Acknowledge, then separate Google from the AI answer.
> "Glad to hear it, and I'm not knocking your Google. This is a different thing, though. When a buyer asks ChatGPT or Google's own AI answer for your kind of parts, that's a separate result. Right now it's naming [competitor / Amazon], not you. That's the gap I'd want to look at. Worth a short call to walk through it?"

**"Send me info" (industrial).** Point at the written diagnostic, the natural "info."
> "Happy to. There's a short written rundown that tells you where you're leaking quotes and whether the AI names you. I'll send the link to [confirm email]. If you'd rather talk it through after you read it, my calendar's a click away in there."

---

## The multitouch cadence

Each touch references the last. The email stays reply-first: a question, never a link, until the LP/diagnostic link appears once, with a UTM, in email #2. Don't over-touch. If a channel heats up (an open, a reply, a profile view), slow the others and let it run.

**Working days only.** Skip weekends and holidays. Spread touches across the day:

- **Calls:** first thing in their morning (9am their local time at the earliest — that's the hard compliance floor in [07-compliance.md](./07-compliance.md) §3, never dial before it), or lunch (11:30 to 1). Owners who are on jobs answer at those edges, not at 2pm.
- **Email:** send to land for the after-hours read (4 to 7pm), when the owner clears the inbox.
- Don't stack two touches in the same hour.

### Revenue Engine cadence (~15 working days)

| Day | Channel | What you do | References |
|---|---|---|---|
| 1 | Research + Call | Test the phone, pull the GBP, open the site. Dial. Picked up → **live opener**. No answer → **RE-VM1**. | the test call |
| 1 | Email #1 | Reply-first. One observation, one question, no link. *"Called your line today and it went to voicemail after four rings. Is that normal during the day, or did I just catch a bad moment?"* | the call |
| 3 | LinkedIn | Connect, no pitch. *"Saw you run [company]. Left you a voicemail about something I noticed on your phone line. No agenda, just figured you'd want to know."* If you can't find the owner's profile, skip this touch. Don't connect with a stranger to hit a quota. | the VM |
| 4 | Email #2 | Reply to your own thread. Add the second finding (profile / cold quotes). **The audit link goes here**, UTM'd, framed as optional. *"Two things I'd want to know if it were my shop. Want me to send the 20-minute breakdown, or just give you the number over the phone?"* | email #1 |
| 6 | Call | Dial again, different time of day. No answer → **RE-VM2**. | emails + VM1 |
| 9 | Email #3 | Short. The honest fork. *"Should I keep this on your radar, or is now just not the time? Either's a fine answer."* No link. | the thread |
| 12 | Call | Final dial. No answer → **RE-VM3**. | everything prior |
| 15 | Email #4 | Breakup. One line, no link, no guilt. *"Closing the loop on my end. If missed calls ever start costing you jobs, I'm at 561-531-4339. Otherwise I'll leave you to it."* | the VM3 break |

Up to 3 calls (each with a voicemail), 4 emails, 1 LinkedIn. Eight touches over three weeks. The link appears once, on day 4, as the easy option, not the ask.

### Industrial cadence (~15 working days)

Same skeleton, slower hand, more respect for a busy owner's inbox. The "send info" door is the written diagnostic, not a landing page.

| Day | Channel | What you do | References |
|---|---|---|---|
| 1 | Research + Call | Check what the AI names for their category and parts. Run a part-number search on their site. Dial. Picked up → **live opener**. No answer → **IND-VM1**. | the AI check |
| 1 | Email #1 | Reply-first, one question, no link. *"Asked ChatGPT about [category] this morning and it pointed buyers at [Amazon / a competitor] instead of you. Is getting found that way on your radar yet, or still early?"* | the call |
| 3 | LinkedIn | Connect, plain note. *"Left you a voicemail. Noticed the AI answers aren't naming [company] for your line card. Thought you'd want a heads-up."* No profile for the owner (common with older distributor owners)? Skip it. Don't count a touch you can't make cleanly. | the VM |
| 5 | Email #2 | Same thread. Second villain (leaked quotes) + the diagnostic as the soft door. **Diagnostic link here**, UTM'd, optional. *"Want the short written rundown of where I'd look, the AI gap and the quotes that go cold? Or would 15 minutes on the phone be easier?"* | email #1 |
| 7 | Call | Different time of day. No answer → **IND-VM2**. | emails + VM1 |
| 10 | Email #3 | The fork. *"Worth a conversation, or should I check back next quarter?"* No link. | the thread |
| 13 | Call | Final dial. No answer → **IND-VM3**. | all prior |
| 15 | Email #4 | Breakup. *"I'll stop here. If fewer quotes and the AI naming Amazon over you becomes the thing to fix, I'm at 561-531-4339."* (No email address spoken; nobody catches one in a voicemail, and this is the email itself, so the reply path is already there.) | the VM3 break |

**Disqualify gracefully below $5M.** If a live call or your research shows they're under the floor, stop the cadence and say so straight:
> "Honest answer: the system I run is built for distributors past about five million in revenue. Below that, I'd be charging you for more than you need. If you want, I'll point you toward someone who fits your size. And if you cross that line, call me."

Offering the referral is what turns the disqualification into goodwill. Have one or two names ready before you make these calls.

---

## Outcome → next-touch map

Every common outcome, with exactly what you send or do next and when.

| Outcome | What it means | Next touch + when | Destination |
|---|---|---|---|
| **No answer** | Voicemail or rang out | Leave the matching voicemail. Send the reply-first email **the same day**. Stay on the cadence. | none yet (no link until day 4/5) |
| **Gatekeeper wall** | Front desk or office manager blocks you | Don't pitch the gatekeeper. *"Totally get it. It's not a pitch. I called the main line this morning and noticed something on the phone setup [owner] would want thirty seconds on. Better to email them, or catch them at a quieter time?"* If they push (*"What's it regarding?"* or *"He doesn't take sales calls"*): *"Fair. It's literally about a missed call I ran into when I dialed in today. Thirty seconds, no slides. What's the best way to reach him?"* Get the email or a callback window. | email, reply-first |
| **"Email me" (Revenue Engine), warm** | They asked because they're interested | Send within the hour while you're fresh. Audit page link **only if they asked for the offer**. *"Here's the 20-minute Revenue Leak Audit. Your actual missed-call number, free to keep: [audit page, UTM'd]."* Then a call 3 days later. | Revenue Leak Audit page |
| **"Email me" (Revenue Engine), cold brush-off** | A polite way to end the call | Still send, same day, but reply-first, no link. *"Good talking, [First name]. As promised, the short version: I tested your line today and it went to voicemail mid-afternoon, which usually means a few jobs a week walking to the next guy. Want me to pull the real number, or is now not the time?"* | none yet (reply-first) |
| **"Send info" (Industrial)** | Brush-off or interest, treat both as yes-to-email | Send same day. The written diagnostic is the natural "info." *"Here's the written growth diagnostic. It tells you where you're leaking quotes and whether the AI names you: `/unlock-growth-audit/` [UTM'd]. Rather talk it through? My calendar's at `/book-growth-call/`."* | `/unlock-growth-audit/` primary, `/book-growth-call/` secondary |
| **Live objection ("I already pay a guy" / "is this a sales call?" / "just tell me the price")** | The most common live moment | Run the matching live-answer branch above, word for word. The de-position line (no markup, no reselling leads, keep your ads guy) fires on the ads objection, not buried in a footnote. | toward the audit / growth call |
| **Soft no ("not right now / maybe later")** | Timing, not a real no | Don't push, don't hand them the exit. *"Fair enough. Want me to check back in a quarter? If it's never, just say so and I'll leave you be."* If a quarter: drop from active cadence, set a 90-day reminder, send one short confirming email. If never: treat as a hard no. | none, relationship hold |
| **Booked** (audit or growth call) | The win | Send the calendar invite **within five minutes**, with the join link and a one-line "what to expect." Revenue Engine: *"I'll have your numbers pulled before we talk. Nothing to prepare."* Stop all other cadence touches immediately. | the booking confirmation |
| **No-show / reschedule** | They booked, then missed | Same-day, no guilt. *"Missed you today. Want to grab another twenty minutes this week, or has the timing gone sideways? Either's fine."* One reschedule attempt. If they no-show that too, drop to a single breakup email and stop. | rebook link |
| **Hard no / "take me off your list"** | Done | Stop everything, same minute. *"Done. Won't reach out again. If anything changes, you've got my number."* Suppress across email, call, and LinkedIn. | suppress |

**The rule under all of it:** if they engage on any channel, lead with that channel and pause the rest. A reply to email #1 means you reply, not robotically dial them on day 6 like nothing happened.

---

## List hygiene and when to retire a contact

Deliverability is reputation, and one sloppy channel poisons the others. Carry these as house rules (targets to hold, not measured performance):

- **Verify addresses before the first send.** Bad addresses spike bounces and drag down the sending domain for everyone on the list. Hold bounce rate under ~2% and spam complaints under ~0.3%.
- **One owner, one cadence at a time.** Never run a contact through both the Revenue Engine and the industrial sequences. A roofer angle landing on a distributor owner burns trust and looks automated.
- **Sole-proprietor contractors on a personal Gmail run a higher complaint rate.** Lean on the call and the voicemail for them. Go lighter on email.
- **Suppress on a hard no, a "take me off," and a bounce. Immediately, across all three channels.** A LinkedIn touch after someone asked off the email list is the fastest way to look like a spammer.
- **LinkedIn is a manual, optional touch**, governed by LinkedIn's own User Agreement — keep connection invites personal and low-volume, no automation or scraping tools. It sits outside the call/SMS/email legal framework in [07-compliance.md](./07-compliance.md), but a stop request still means stop here too.

**Retire a contact when:**

1. They asked you to stop. Permanent suppression, no exceptions.
2. The full cadence ran (eight touches, ~three weeks) with zero engagement: no answer, no open, no reply, no profile view. Move to long-term nurture or drop. Don't re-run for at least 90 days, and only with a genuinely new reason (a new leak, a new trigger).
3. The email hard-bounced or the number's dead. Pull it. Don't keep dialing a disconnected line.
4. They're disqualified: under the $5M industrial floor, or a local-service business too small to have a leak worth fixing. Mark the reason so you don't re-add them in three months.
5. Three "check back later" deferrals with nothing moving. That's a polite no wearing a calendar reminder. Retire it.

A retired contact isn't a failure. A clean list that protects the sending domain is worth more than ten more dials into a number nobody answers.
