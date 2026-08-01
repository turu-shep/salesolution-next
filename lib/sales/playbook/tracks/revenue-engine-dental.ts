import type { Track } from '../types'

/**
 * Revenue Engine — dental practices call script.
 *
 * Verbatim encoding of docs/strategy/sales/03-revenue-engine-dental-script.md.
 * Lines are transcribed word-for-word (the prose doc is the source of truth);
 * only the structure is added. Mirrors the shape of revenue-engine-roofing.ts.
 */
export const revenueEngineDentalTrack: Track = {
  slug: 'revenue-engine-dental',
  motion: 'revenue-engine',
  subScript: 'dental',
  label: 'Revenue Engine — Dental practices',
  persona: 'A dentist or office manager whose front desk is mid-appointment when the new-patient line rings.',
  goal: 'Book the Revenue Leak Audit.',
  cta: { label: 'Revenue Leak Audit', href: '/revenue-engine/dentists/' },

  precall: {
    title: 'Pre-call leak check (3–4 minutes before I dial)',
    note: "I'm not researching. I'm collecting one true, specific thing I can say in the first ten seconds. Each finding becomes an opener line. Write it on the script before dialing. Rule for every finding below: I only say what actually happened. If I didn't really call, really submit the form, really see the rating — it doesn't go in my mouth. The whole call rests on the leak being real. One finding is enough. The strongest one leads. I don't dump the list. I name one real leak and stop.",
    items: [
      {
        action: "Call the practice first. Use a different number than I'll dial my pitch from.",
        detail: 'How many rings before a human picks up? Count them. Person, hold, auto-attendant tree, or voicemail? Call right at lunch (11:45–1:30 local). What happens then? That\'s their leakiest hour, and the one they\'ll argue is "just lunch" — I\'m ready for that (see the rebuttal in section 2). Voicemail? What does it say. Does it give a way to book, or just "leave a message"? Picked up? How long was I on hold before a person could actually talk.',
        openerFuel: 'Voicemail at lunch: "I called your office around half-twelve today. Got voicemail." — Six rings, then a person: "It rang six times before anyone picked up. And that\'s probably a quiet moment, not a busy one." — Auto-attendant maze: "I called and worked through three menus before I could ask one question."',
      },
      {
        action: 'Pull up the Google Business Profile. Fill in the real numbers. The bracketed parts are placeholders — never read "[RATING]" or a stale month out loud.',
        detail: 'Star rating and review count. Date of the last review. A practice that stopped getting reviews stopped asking. Recent reviews answered, or sitting there ignored? Online booking wired up, or phone-only? Hours right? Photos current? "Accepting new patients" anywhere obvious?',
        openerFuel: 'Finding to opener (fill in real values): "You\'ve got a [RATING], and the last review on it is from [MONTH]. You\'ve got happy patients. Nobody\'s asking them to say so." — No book button: "On your Google listing there\'s no way to book. A new patient has to call. We both know what happens to calls during the day."',
      },
      {
        action: "Test the website's booking path.",
        detail: 'From the homepage, how many clicks to request an appointment? Time it. Does the form work on a phone? Sane number of fields, or fourteen? Submit a real test request. Then watch for an auto-reply. Most of the time: silence. That\'s the new-patient leak in one move. New-patient info (insurance, first visit, financing) easy to find, or buried?',
        openerFuel: 'Finding to opener (only if I actually submitted it and actually got silence): "I sent a test request through your website\'s appointment form earlier today. Nothing\'s come back. No text, no email. If that\'s what a real new patient gets, that\'s the leak."',
      },
    ],
  },

  stages: [
    {
      id: 'open',
      title: 'Open',
      goal: "The front desk is the default first contact. They're my ally here, not the obstacle. The whole pitch is that I don't replace them. So I lead with who I need, not with the call I caught. The voicemail finding waits until I'm talking to the owner, where it's proof instead of a poke at the person who answered.",
      segments: [
        {
          id: 'open-frontdesk',
          role: 'primary',
          label: '2a. Reached the front desk (the default)',
          lines: [
            { say: "Hi, this is Artur. I'm not a patient, and I'm not selling you anything on this call. Who handles your new-patient phone line — is that you, the office manager, or the doctor?" },
            { note: 'Then stop. Let them route me.' },
          ],
        },
        {
          id: 'open-frontdesk-about',
          role: 'branch',
          label: "If they ask what it's about",
          lines: [
            { say: "Sure. I help dental practices catch the new-patient calls that slip through during chair time. I pulled a couple of numbers on your practice this morning and I'd like to walk the doctor or office manager through them. Two minutes, and they keep the numbers either way. Is that you, or someone else?" },
          ],
        },
        {
          id: 'open-frontdesk-is-owner',
          role: 'branch',
          label: 'If the front desk IS the owner or office manager (small practice, common)',
          lines: [
            { say: "Then you're exactly who I wanted. I'm not selling you a website. I help practices stop losing new patients on the calls nobody could get to. I pulled one number on your practice this morning. Can I tell you what I found, and you tell me if it's worth a real conversation?" },
          ],
        },
        {
          id: 'open-honesty-rule',
          role: 'callout',
          label: 'Honesty rule with whoever answers',
          lines: [
            { note: 'I never pretend to be a patient, a vendor they already use, or someone returning a call. If asked "do they know you?":' },
            { say: "No. First time I'm reaching out. That's why I'm being quick and specific." },
            { note: 'A burned buyer smells a fake intro instantly. Being straight is the trust signal.' },
          ],
        },
        {
          id: 'open-frontdesk-message',
          role: 'branch',
          label: 'If they try to take a message or wave me off',
          lines: [
            { say: "Fair, you're busy. Here's all I'd ask. Tell the doctor someone called about the new-patient calls that go to voicemail during the day, and that there's a way to catch them without replacing anyone on your team. If that's worth five minutes, my number's [___]. When are the phones quietest tomorrow — mid-morning?" },
          ],
        },
        {
          id: 'open-with-patient',
          role: 'branch',
          label: '2b. "The dentist is with a patient" (constant)',
          when: "Don't fight it. Use it, gently, never smug.",
          lines: [
            { say: "Of course. That's actually why I called. The doctor's chairside, the phone's ringing, and that call has to go somewhere. When are they usually free between patients — first thing, or after lunch? I'll call back then. And can I get their name, so I'm not starting cold?" },
            { note: 'Get the name. Get a window. Log it. Call back when I said I would.' },
          ],
        },
        {
          id: 'open-voicemail',
          role: 'variant',
          label: '2c. Reached voicemail myself',
          when: 'Short. One leak. One reason to call back. No pitch.',
          lines: [
            { say: "Hi, this is Artur Shepel. I'm not a patient. I help dental practices catch the new-patient calls that come in while the front desk is with someone. Nothing to buy on this call. I pulled a few numbers on your practice already, and they're yours to keep either way. I'd like to show the doctor or office manager what I found. I'm at [___]. I'll try again tomorrow morning when the phones are slower." },
          ],
        },
        {
          id: 'open-owner-direct',
          role: 'variant',
          label: '2d. Reached the owner or office manager directly (best case)',
          when: 'Permission first. Then the real leak.',
          lines: [
            { say: "Hi, is this Dr. [Name]? This is Artur. We've never spoken, so one thing and then you tell me if it's worth more. Fair?" },
            { note: 'Wait for the yes.' },
            { say: "I called your office around half-twelve today, and the new-patient line went to voicemail. That's not a knock on your team. They were with patients, which is where they should be. But a first-time caller who hits voicemail just dials the next practice on the list. That's the thing I fix. Can I take a couple minutes?" },
          ],
        },
        {
          id: 'open-owner-lunch',
          role: 'branch',
          label: 'If they push back: "We close for lunch, everyone knows that"',
          lines: [
            { say: "Right, and that's my point, not a dig. Lunch is exactly when somebody on their own lunch break finally has a second to call you. If your door's shut the same hour theirs is open, that's the leak. I don't know yet if it's only lunch or all day. That's what I'd measure." },
          ],
        },
        {
          id: 'open-owner-number',
          role: 'branch',
          label: 'If they cut in: "Hang on — how\'d you get my number, and is this a sales call?"',
          lines: [
            { say: "Both fair questions. Your number's the public one on your Google listing — same one a new patient would call. And yeah, I sell something, I won't pretend otherwise. But not today. Today I'm telling you about one leak I found this morning, free, and you decide if it's worth twenty minutes later. If it's not, you hang up and you've lost nothing. Want the thirty-second version?" },
          ],
        },
      ],
    },

    {
      id: 'hook',
      title: 'Hook',
      goal: "Two sentences, then stop. This isn't a speech. The shorter the leak frame, the more it sounds like something I found this morning instead of something I recite.",
      segments: [
        {
          id: 'hook-primary',
          role: 'primary',
          lines: [
            { say: "You know what a crown's worth, to the dollar. Nobody's counting the new-patient calls that hit voicemail at lunch. And that's the leak that costs the most, because a first-time caller who can't reach you books with whoever picks up — and takes the whole family with them." },
            { note: 'Pause. Let them react.' },
          ],
        },
        {
          id: 'hook-second-half',
          role: 'primary',
          label: 'If they engage, add the second half',
          lines: [
            { say: "And the bigger money's already in your charts. Treatment plans you presented that nobody circled back on. Patients overdue for recall that nobody called. You already did the clinical work to earn it. It's just sitting there unbooked. So I'm not here to send you more leads. You don't have a leads problem. You've got a leak." },
          ],
        },
      ],
    },

    {
      id: 'discovery',
      title: 'Discovery',
      goal: "Four to six questions. I'm diagnosing, not interrogating. After each answer, I shut up. I'm listening for: are they trying to grow, who covers the phone at the leaky hours, and whether any follow-up exists.",
      segments: [
        {
          id: 'disc-q1',
          role: 'question',
          label: 'Q1 — Are they even in the market (qualifier, soft on-ramp)',
          lines: [
            { say: "Are you actively trying to bring on more new patients right now, or are you about where you want to be?" },
          ],
          reads: {
            good: 'they want more. Any single-location practice taking new patients qualifies.',
            disqualifying: '"We\'re full, not taking new patients, retiring next year." Then say it straight: "Then the new-patient piece won\'t move much for you. The recall and treatment-plan side still might. Want me to look at just that, or should I get out of your hair?"',
          },
        },
        {
          id: 'disc-q2',
          role: 'question',
          label: 'Q2 — Who answers, when',
          lines: [
            { say: "When the front desk is mid-appointment, or it's lunch, or it's after five — who's answering the phone then?" },
          ],
          reads: {
            good: '"Voicemail," "the answering service," "nobody, honestly." That\'s the leak in their own words.',
            borderline: 'Watch — "we never miss a call": "That\'s the goal. Would you bet on it, though? I called at half-twelve today and got voicemail. Let me measure it for a week and we\'ll both know for sure." — Watch — "we use an answering service": "Most services take a message. They don\'t book the patient onto your calendar, they don\'t text back in seconds, and they never touch the treatment plans sitting in your charts. Does yours book, or just relay? That\'s usually the gap." — Watch — "our service is HIPAA-compliant, so we\'re covered": "Good, you should keep them. Compliance isn\'t the gap I\'m talking about. The gap is whether that message turns into a booked appointment before the patient calls someone else. A message in a voicemail box isn\'t a patient on your schedule."',
          },
        },
        {
          id: 'disc-q3',
          role: 'question',
          label: 'Q3 — What happens to the voicemail',
          lines: [
            { say: "When a new-patient call does hit voicemail, what actually happens to it? Walk me through it." },
          ],
          reads: {
            good: 'a vague answer. No system. That\'s the opening.',
            disqualifying: 'a tight, fast, texted-back-in-minutes process they actually run. Rare. If it\'s real, say so and move to recall and plans.',
          },
        },
        {
          id: 'disc-q4',
          role: 'question',
          label: 'Q4 — Unscheduled treatment',
          lines: [
            { say: "When you present a treatment plan and the patient says 'let me think about it,' what's the follow-up? Who owns chasing it down?" },
          ],
          reads: {
            good: '"Nobody, really," "we mean to," "it\'s on a sticky note." Money in the chart.',
            borderline: 'Watch — "our treatment coordinator\'s on it": "Good. Then I\'m adding the measurement and the after-hours catch, not replacing her."',
          },
        },
        {
          id: 'disc-q5',
          role: 'question',
          label: 'Q5 — Recall',
          lines: [
            { say: "How do overdue patients get back in the chair right now? Is that someone's job, or does it happen when it happens?" },
          ],
          reads: {
            good: 'manual, postcards, "when we remember." Easy to automate.',
          },
        },
        {
          id: 'disc-q6',
          role: 'question',
          label: 'Q6 — Who decides',
          lines: [
            { say: "If this turned out to be real money on the table, is bringing in something like this your call, or is there a partner or office manager in it with you?" },
          ],
          reads: {
            good: 'they decide, or they name who does.',
            disqualifying: 'committee of five, or a DSO with a fixed vendor stack. Note it. The audit\'s still useful, the close is slower. Be straight about the path.',
          },
        },
        {
          id: 'disc-disqualify',
          role: 'callout',
          label: 'Disqualify gracefully, always',
          lines: [
            { note: 'A true no — full, retiring, locked into a DSO contract — and I don\'t push.' },
            { say: "Sounds like you've got it handled. I'll let you go. If anything changes, you've got my number." },
            { note: 'A clean exit protects the brand with a buyer who\'s allergic to pressure.' },
          ],
        },
      ],
    },

    {
      id: 'pitch',
      title: 'Pitch',
      goal: "Only after they've named at least one leak themselves. Plain stakes. First person. Say what I don't do, fast.",
      segments: [
        {
          id: 'pitch-mechanism',
          role: 'primary',
          label: 'Here\'s what I\'d actually do — five jobs',
          lines: [
            { say: "Here's what I'd actually do. I put a system on top of your practice. Five jobs." },
            { say: "One. It answers every call, around the clock — lunch, after hours, all of it." },
            { say: "Two. A missed call gets a text back in seconds, so you don't lose the caller while they wait." },
            { say: "Three. A new-patient inquiry gets a reply in under a minute, gets booked straight onto your calendar, and gets reminders so they actually show." },
            { say: "Four. It works the money already in your charts. The treatment plans that stalled, the patients overdue for recall — followed up automatically." },
            { say: "Five. Every month it shows you, in plain numbers, what it brought in — on its own line, separate from what your ads did." },
          ],
        },
        {
          id: 'pitch-dont-do',
          role: 'callout',
          label: "What it doesn't do matters more — say it first",
          lines: [
            { say: "What it doesn't do matters more, so let me say it first. It doesn't replace your front desk. It catches the calls they physically can't, while they take care of the patient in the chair. I don't lock you into a year. I don't make you rip out your software. We book at the calendar level first, so you're live fast, then we scope deeper into Dentrix or Open Dental or whatever you run during setup. The 90-day install is on me." },
          ],
        },
        {
          id: 'pitch-ai-bot',
          role: 'branch',
          label: 'If they bring up "is this an AI bot talking to my patients?"',
          lines: [
            { say: "Your patients can always get a person. The system catches the call your team couldn't, takes the basics, and books the appointment. It never pretends to be human, and anyone who wants a person gets one. Think of it as a net under your front desk, not a replacement for their voice." },
          ],
        },
        {
          id: 'pitch-hipaa',
          role: 'callout',
          label: 'HIPAA — lead with the BAA, don\'t oversell',
          when: 'Read the [VERIFY] gate below first — this is the highest-liability line on the call.',
          lines: [
            { note: 'Say this only if the current BAA coverage is confirmed true today (see gate):' },
            { say: "And because this is a dental practice, patient data is handled correctly from day one. Every tool that touches patient information runs under a signed BAA — the call tracking, the texting, the CRM. Recording disclosures are built into the greeting per your state's rules. Your patient data stays in your systems; I run the engine on top of them, I don't copy your database. That's how I'm set up — not legal advice. Your compliance person reviews and signs off on the whole stack during onboarding, before a single call gets answered." },
            { note: "If BAA coverage isn't confirmed for every tool today, say this instead — don't assert it:" },
            { say: "Compliance is the first thing here, not an afterthought. Every tool that touches patient data has to be covered by a business-associate agreement before it goes live. Let me confirm the exact current list with my team and send it to you in writing, so your compliance person can check it before you commit to anything. I won't hand-wave that one." },
            { note: '[VERIFY — hard gate, matches RE3 in 05-objection-library.md] Do not assert "every tool has a BAA in place" on a live call until Artur confirms the current BAA coverage list. Asserting unconfirmed compliance to a regulated buyer is the highest-liability line in this deck. If it isn\'t confirmed, read the second version.' },
          ],
        },
        {
          id: 'pitch-guarantee',
          role: 'callout',
          label: 'The guarantee (say the core sentence verbatim — it must match the roofing script and the objection library word for word)',
          lines: [
            { say: "And I put the whole thing on the line, install included. Here's the guarantee: if the revenue the system brings back hasn't covered everything you've paid me — install and fees — by day 120, I work free until it has." },
          ],
        },
        {
          id: 'pitch-guarantee-math',
          role: 'branch',
          label: 'If they push: "covered everything you\'ve paid me — that sounds like a number you can make say anything"',
          lines: [
            { say: "Fair, and you should push on that. So here's the math, and it's only the math. We count three things. New patients the system booked off a call your front desk missed. Treatment plans it followed up that the patient then accepted. Overdue patients it brought back in. Each one is a real appointment with a real chart and a real production number — yours, in your dashboard, not mine. If it didn't book, it doesn't count. You can open the list and check any one of them against your schedule. I'd rather show you a smaller number you trust than a big one you don't." },
          ],
        },
        {
          id: 'pitch-price',
          role: 'branch',
          label: 'If they hit me with price, hard and early ("just tell me what it costs")',
          lines: [
            { say: "Fair. It's a flat monthly fee. No setup cost, no annual lock-in. It's sized to your practice, so I'd be guessing if I threw a number out on the phone. The audit gives you the real one in writing, same day. And if it's wildly outside your world, I'll tell you right now so neither of us wastes time." },
            { note: 'Note to self: never resell leads, never mark up their ads, never quote the monthly cold.' },
          ],
        },
      ],
    },

    {
      id: 'close',
      title: 'Close',
      goal: "Book the Revenue Leak Audit. It's a diagnosis, not a sales call. I'm measuring their front desk, not touching patient records.",
      segments: [
        {
          id: 'close-ask',
          role: 'primary',
          label: 'The audit ask',
          lines: [
            { say: "So here's what I'd suggest, and it costs you nothing. Give me about twenty minutes and I'll run a Revenue Leak Audit on your practice. I'll show you your own numbers. How many calls are actually getting missed, and when. How fast inquiries get a reply. What your Google profile's doing. Where follow-up's falling through. No patient data involved — I'm measuring the front desk, not looking at charts. Whatever I find is yours to keep, whether we ever work together or not." },
          ],
        },
        {
          id: 'close-pick',
          role: 'primary',
          label: 'The ask — make them pick, don\'t leave it open',
          when: 'Name the next two real openings I have. Offer the slow hours my own discovery surfaced, not the busy ones.',
          lines: [
            { say: "I've got [first real slot] or [second real slot] open. Which one lands in a quieter stretch for your phones?" },
            { note: 'Lock a real time. Confirm the invite goes to a real email. Confirm who\'ll be on it.' },
          ],
        },
        {
          id: 'close-catch',
          role: 'branch',
          label: 'If they hesitate — "what\'s the catch?"',
          lines: [
            { say: "No catch. I'd rather show you the leak than tell you about it. If the numbers aren't bad, you've spent twenty minutes and you keep them. If they are bad, you'll know exactly what it's costing you, and you can fix it with me or without me." },
          ],
        },
        {
          id: 'close-send-something',
          role: 'branch',
          label: 'If "send me something first"',
          lines: [
            { say: "Happy to. But the useful version is built on your numbers, not a generic deck. That's the whole audit. Give me twenty minutes and you walk away with something real instead of a brochure. [First slot] or [second slot]?" },
          ],
        },
        {
          id: 'close-email-finding',
          role: 'branch',
          label: 'If "just email me the finding, I don\'t want a call"',
          lines: [
            { say: "Done. I'll send the one leak I found this morning. Read it, and if it stings, the twenty-minute version shows you the other four and what they're costing you. I'll check back [day]. Fair?" },
            { note: 'capture the email, set the next touch, don\'t pretend the no was a yes.' },
          ],
        },
        {
          id: 'close-partner',
          role: 'branch',
          label: 'If "I need to talk to my partner / office manager"',
          lines: [
            { say: "Smart. Get them on the audit call. Easier for everyone to look at the same numbers at once than for you to relay it secondhand. Who is it, and what morning works for both of you?" },
          ],
        },
        {
          id: 'close-soft-no',
          role: 'branch',
          label: 'If a soft no / "not right now"',
          lines: [
            { say: "No problem. Want me to send you the one finding I already pulled, so you've got it when the timing's better?" },
            { note: 'then capture the email and follow the cold-email cadence.' },
          ],
        },
        {
          id: 'close-confirm',
          role: 'primary',
          label: 'Confirm and exit',
          lines: [
            { say: "Done. [Day] at [time], I'll send the invite to [email]. Twenty minutes, your numbers, yours to keep. Talk then. Thanks for the time, Doctor." },
          ],
        },
      ],
    },
  ],
}
