import type { Track } from '../types'

/**
 * Revenue Engine — home-services (roofing-forward) call script.
 *
 * Verbatim encoding of docs/strategy/sales/02-revenue-engine-roofing-script.md.
 * Lines are transcribed word-for-word (the prose doc is the source of truth);
 * only the structure is added. This file is the reference shape for the other tracks.
 */
export const revenueEngineRoofingTrack: Track = {
  slug: 'revenue-engine-roofing',
  motion: 'revenue-engine',
  subScript: 'roofing',
  label: 'Revenue Engine — Roofing & home services',
  persona: "A roofing / HVAC / plumbing / electrical owner who's on a roof when the phone rings.",
  goal: 'Book the Revenue Leak Audit.',
  cta: { label: 'Revenue Leak Audit', href: '/lp/home-services-revenue-leak/' },

  precall: {
    title: 'Pre-call leak check (before you dial)',
    note: 'Five minutes per prospect. Open with the single most concrete leak you found — one finding, stated flat, no wind-up. If you found three, you still lead with one.',
    items: [
      {
        action: "Call their main line, from a number that isn't yours.",
        detail: 'Person, or voicemail? How fast? Note the greeting and the exact minute. If a callback comes, note how long it took.',
        openerFuel: 'I called your main line at 9:40 this morning. Rang four times, went to voicemail.',
      },
      {
        action: 'Time the callback.',
        detail: 'If you left a voicemail or filled a form, start a timer. No callback in 30 minutes is the most common finding. By the next day, that’s the whole pitch.',
        openerFuel: "Left a message about a roof this morning. Still nothing back. That's actually why I'm calling.",
      },
      {
        action: 'Check the Google Business Profile.',
        detail: 'Phone number right? Hours right, or closed when they’re clearly working? Review count and rating, reviews answered or ignored, any unanswered Q&A.',
        openerFuel: "Your Google page says you close at 5. I'm guessing the phone still rings after that and nobody's catching it.",
      },
      {
        action: 'Test the website and the "get a quote" path — with a test number, never a real-looking job.',
        detail: 'Loads on a phone? Find the quote form, submit a short obvious test (throwaway email + a number you control), start the callback timer. Any text-back, any auto-reply, or does it vanish?',
        openerFuel: 'I ran a quick check on your quote form about an hour ago, the way a homeowner would. Nothing came back. No text, no call.',
      },
      {
        action: "Quick scan: owner's name, rough size, roofing or mixed trade.",
        detail: "Get the owner's first name — you're calling him, not “the business.” Truck/crew count, anything that hints at size. Sets up qualifying later; don't lead with it.",
      },
    ],
  },

  stages: [
    {
      id: 'open',
      title: 'Open',
      goal: 'Leak first, then name, then the ask. Use the reject-line ("then you can hang up") once per call.',
      segments: [
        {
          id: 'open-var-vm',
          role: 'variant',
          label: 'Variant A — straight to voicemail',
          lines: [
            { say: 'Is this Mike? … Mike, I called your main line about twenty minutes ago. Rang four times, went to voicemail.' },
            { say: "I'm Artur. You don't know me. I help roofers stop losing the calls they're already paying to win. Give me ten seconds on why that matters, then you can tell me to get lost." },
            { note: "Wait for the yes. Don't fill the silence." },
          ],
        },
        {
          id: 'open-var-callback',
          role: 'variant',
          label: 'Variant B — slow or no callback on a form',
          lines: [
            { say: 'Is this Mike? … Mike, about an hour ago I checked your quote form, the way a homeowner would. Nothing came back. No text, no call.' },
            { say: "I'm Artur, you don't know me. That gap right there — a real job request lands and nobody catches it in time — that's the thing I fix for roofers. Ten seconds and you decide if it's worth more?" },
          ],
        },
        {
          id: 'open-var-afterhours',
          role: 'variant',
          label: 'Variant C — no after-hours answer',
          lines: [
            { say: "Mike? … Your Google page says you close at 5. I'd bet the phone still rings after that and on weekends, and a chunk of those go to voicemail and never get a callback." },
            { say: "I'm Artur, you don't know me. I help roofers catch those calls. Not by hiring anybody. Can I give you the one-minute version?" },
          ],
        },
        {
          id: 'open-branch-cost',
          role: 'branch',
          label: 'If "What’s this cost?"',
          when: 'Can hit at any stage — have it ready.',
          lines: [
            { say: "Fair question, and I won't dodge it. But any number I throw out right now is a guess, and a guessed price is worth nothing to you. It depends on your trade and your volume. You get the real number in writing the same day as the audit. Not pulled out of the air on a cold call." },
            { note: 'Then go back to wherever you were. Never quote a number cold.' },
          ],
        },
        {
          id: 'open-branch-have-service',
          role: 'branch',
          label: 'If "I already have someone answering the phones / I use a service"',
          lines: [
            { say: "Good, that helps. Then this isn't about replacing her. It's the calls that hit when she's already on the other line, and the after-hours and weekend ones. That's where it leaks even for guys who staff the phone. Sound like your setup, or is it tighter than that?" },
          ],
        },
        {
          id: 'open-branch-gatekeeper',
          role: 'branch',
          label: 'If gatekeeper / spouse / office answers',
          lines: [
            { say: "Morning. Is Mike around? … No worries. It's Artur, he doesn't know me. Quick context so I'm not wasting your time: I called the main line earlier and it went to voicemail. I help roofers catch the calls that slip through there. Is Mike the right person for that, or is that you?" },
          ],
        },
        {
          id: 'open-branch-gatekeeper-me',
          role: 'branch',
          label: 'Gatekeeper → "that’s me / I handle the phones"',
          goto: 'hook',
          lines: [
            { say: "Then you're exactly who I want — you'd know better than anyone how many ring through when it's busy. Here's the quick version." },
            { note: 'Go to Hook. Then bridge to the owner before you book:' },
            { say: "This makes sense to you so far. When it comes to actually putting it in, is that Mike's call, or yours and Mike's together? I'd want him on the audit too so he hears it from me, not secondhand. Can the three of us grab a quick twenty minutes?" },
          ],
        },
        {
          id: 'open-branch-gatekeeper-job',
          role: 'branch',
          label: 'Gatekeeper → "he’s on a job / call back later"',
          lines: [
            { say: "Totally. When's he usually off the roof and near a phone — end of the day? I'd rather catch him at a decent time than bug him up a ladder." },
            { note: 'Lock a window, get a direct number if it’s offered.' },
          ],
        },
        {
          id: 'open-branch-gatekeeper-about',
          role: 'branch',
          label: 'Gatekeeper → "what’s this about?" (screening)',
          lines: [
            { say: "Fair. I called your line this morning and it went to voicemail. I help roofers stop missing those. Two-minute thing. If it's not for Mike, he'll know in the first sentence." },
          ],
        },
        {
          id: 'open-branch-who',
          role: 'branch',
          label: 'If "Who is this?"',
          lines: [
            { say: "Artur. I help roofers stop losing calls and quotes. I'm not a lead seller, and I'm not pitching you marketing. I called because I tested your line this morning and saw a gap I can fix. Ten seconds and you'll know if it's worth your time." },
          ],
        },
        {
          id: 'open-branch-number',
          role: 'branch',
          label: 'If "How’d you get my number?"',
          lines: [
            { say: "It's public, right on your Google listing. That's actually how I found you — I tested the line, saw a gap I see a lot, and called. Want the ten-second version?" },
            { note: "It's publicly listed. Say that plainly and move on. Don't get defensive about lists he hasn't accused you of." },
          ],
        },
        {
          id: 'open-branch-fakeform',
          role: 'branch',
          label: 'If "So you filled out a fake form on my site?"',
          lines: [
            { say: "I used a test number so nobody on your end chased a ghost. But yeah, that's the point. I went through exactly what a homeowner goes through, and it dead-ended. That dead end is the thing I'm calling about. If a real customer hit the same wall this morning, they already called the next roofer." },
          ],
        },
        {
          id: 'open-branch-leave-vm',
          role: 'branch',
          label: 'I reached voicemail myself (leave one or not?)',
          when: 'First or second try: hang up, the live opener is stronger. Third try, or hard to catch live: leave one.',
          lines: [
            { say: "Mike, it's Artur. You don't know me. I called your main line earlier and it went to voicemail, which is actually why I'm calling. I help roofers catch the jobs that slip through there. No pitch, no lead-selling. I'll try you again, or reach me at [number]. That's it." },
            { note: "Under twenty seconds. Name the leak — it's the only reason he'd call back." },
          ],
        },
        {
          id: 'open-branch-he-calls-back',
          role: 'branch',
          label: 'He calls YOU back off that voicemail',
          when: 'Warm, high-intent — answer it like this.',
          goto: 'hook',
          lines: [
            { say: "This is Artur. … Mike, thanks for calling back. So here's why I rang. I called your main line earlier and it went to voicemail, and catching those missed calls is exactly the thing I help roofers with. You've already done the part most guys don't — you called back. Most homeowners won't. Got two minutes for me to show you what I mean?" },
            { note: "He called you. He's interested. Slow down, don't oversell, route to the Hook." },
          ],
        },
      ],
    },

    {
      id: 'hook',
      title: 'Hook',
      goal: "The money frame, his words. Two beats and a question, then stop.",
      segments: [
        {
          id: 'hook-primary',
          role: 'primary',
          lines: [
            { say: "Here's the thing most roofers don't see. You're not short on leads. You're losing the ones you've already got." },
            { say: "The call that rings out while you're up on a roof — that homeowner just called the next guy. The money was already spent making your phone ring. The job still walked." },
            { say: 'That hit home, or am I off?' },
            { note: 'Then stop. Let him react. Agreeing out loud → discovery. Pushback → good, discovery handles it.' },
          ],
        },
        {
          id: 'hook-branch-tried',
          role: 'branch',
          label: 'If "We tried something like this and it didn’t work"',
          lines: [
            { say: "I hear that a lot, and honestly it's why most roofers won't even take this call. So let me ask straight — what did you try, and where did it fall apart?" },
            { note: 'Let him answer. Then match the fix to the exact failure he names (below).' },
          ],
        },
        {
          id: 'hook-branch-shared-leads',
          role: 'branch',
          label: 'Failure → shared / resold leads',
          lines: [
            { say: "Yeah. They sold the same homeowner to four roofers and you raced three other trucks to the door. I don't touch your leads. Nobody else gets your calls." },
          ],
        },
        {
          id: 'hook-branch-markup',
          role: 'branch',
          label: 'Failure → markup on ad spend',
          lines: [
            { say: "So they marked up your ads and you could never see the real number. Your ads run on your account, at cost. I never touch that spend." },
          ],
        },
        {
          id: 'hook-branch-lockin',
          role: 'branch',
          label: 'Failure → locked in, no results',
          lines: [
            { say: "Twelve-month contract, no way out, nothing to show. There's no annual lock-in here, and there's a line I put in writing about results — I'll get to it." },
          ],
        },
        {
          id: 'hook-branch-noproof',
          role: 'branch',
          label: 'Failure → no proof it worked',
          lines: [
            { say: "Right, you couldn't tell if it did anything. That's the whole last piece of what I build — a dashboard with your numbers, so you're not taking my word for it. You see the calls we caught and the jobs we booked." },
          ],
        },
        {
          id: 'hook-branch-robot',
          role: 'branch',
          label: 'Failure → a robot that annoyed customers',
          lines: [
            { say: "Yeah — a bot that traps people and they can't get a human. That's not this. A caller can always reach a person. The automation only handles speed — texting back in seconds so the homeowner doesn't go cold — it never blocks anyone from reaching you. And I tune it every week off your real calls, so it sounds like your shop, not a call center. You'll hear the whole call flow on the audit and sign off before it ever goes live." },
          ],
        },
        {
          id: 'hook-callout-proof',
          role: 'callout',
          label: 'Then offer the proof',
          lines: [
            { say: "So here's the only thing I'd ask. Don't take my word that I'm different. Let me show you, in your own numbers, whether there's even a leak worth fixing. Twenty minutes, and you keep whatever I find. Worth that?" },
          ],
        },
      ],
    },

    {
      id: 'discovery',
      title: 'Discovery',
      goal: 'Make him say the leak, qualify him. Ask, then shut up.',
      segments: [
        {
          id: 'disc-q1',
          role: 'question',
          label: 'Q1 — size',
          lines: [{ say: 'Roughly how big are you these days? Couple trucks, couple crews?' }],
          reads: {
            good: 'Multiple trucks or crews, been at it years. Real call volume to leak.',
            borderline: 'One truck but busy and growing, runs some paid. Keep going.',
            disqualifying: 'One guy, part-time, just starting, no real lead flow. Disqualify gracefully (see close).',
          },
        },
        {
          id: 'disc-q2',
          role: 'question',
          label: 'Q2 — lead source',
          lines: [{ say: 'How are leads coming in right now? Google ads, Angi, referrals, your own site?' }],
          reads: {
            good: 'Spending on something (ads / Angi / LSA) or steady inbound. Demand coming in that’s leaking out.',
            disqualifying: '"All word of mouth, I turn work away," zero paid, full book. He doesn’t feel the leak. Note it, don’t force it.',
          },
        },
        {
          id: 'disc-q3',
          role: 'question',
          label: 'Q3 — who catches the call',
          lines: [{ say: "When you're up on a roof and the phone rings, who catches it?" }],
          reads: {
            good: '"Nobody," "voicemail," "my wife when she can," "I call back at night." That’s the leak, in his words.',
            borderline: '"My office manager, mostly." Probe overflow and after-hours: "And when she’s already on a call, or it’s a Saturday?"',
            disqualifying: 'Full-time office manager, every call answered in two rings, every lead texted same hour. Rare. Pivot to the quote-follow-up leak in Q4.',
          },
        },
        {
          id: 'disc-q4',
          role: 'question',
          label: 'Q4 — cold quotes',
          lines: [{ say: 'When you send a quote and the homeowner goes quiet, what happens to it?' }],
          reads: {
            good: '"Nothing," "I forget about it," "I mean to follow up and don’t." Dead estimates are pure recovered revenue.',
            disqualifying: 'If capture and follow-up are both already tight, he’s not my buyer. Say so on the spot: "Honestly? Then you’ve already plugged the two leaks I fix. I’m not going to invent a problem to sell you. If the phone ever starts getting away from you, call me. Otherwise you’re in better shape than most guys I talk to."',
          },
        },
        {
          id: 'disc-q5',
          role: 'question',
          label: 'Q5 — job value',
          lines: [{ say: "Ballpark, what's a booked job worth to you? Average roof?" }],
          reads: {
            good: 'Any real number. A 9-to-15k job means one recovered call a week is real money.',
            borderline: 'Not disqualifying, just data. If he won’t say, move on — you’ll get it in the audit.',
          },
        },
        {
          id: 'disc-q6',
          role: 'question',
          label: 'Q6 — decision-maker',
          lines: [{ say: "If this turns out to make sense, is it your call, or is there a partner I'd want in the room?" }],
          reads: {
            good: '"It’s me," or names one partner. Clear path.',
            borderline: 'Committee, franchise rules, "corporate handles marketing." Find who actually decides and route there.',
          },
        },
        {
          id: 'disc-bridge',
          role: 'callout',
          label: 'Read the room, then bridge',
          when: 'If two or three of Q3/Q4 come back as "yeah, that’s me, that’s a mess," he’s feeling it.',
          lines: [
            { say: "Okay. Sounds like the leak's real. Want me to walk you through how I'd plug it? Two minutes." },
            { note: 'If he’s flat and defensive across all of them and runs no paid leads, don’t push. Leave the door open (see disqualify branch in Close).' },
          ],
        },
      ],
    },

    {
      id: 'pitch',
      title: 'Pitch',
      goal: 'Only after he feels it. The mechanism, in plain stakes. The audit does the real selling.',
      segments: [
        {
          id: 'pitch-mechanism',
          role: 'primary',
          label: 'The five-part mechanism',
          lines: [
            { say: "So here's what I'd put in. Five things, all aimed at the leak you just described." },
            { say: 'One — every call gets answered, day or night, even when you’re on a roof. Not a phone tree. A real person picks up.' },
            { say: 'Two — when a lead comes in, it gets a text back in seconds. Whoever replies first usually books the job. Right now the homeowner books whoever calls back first, and too often that’s not you.' },
            { say: 'Three — it books the estimate onto your calendar. No phone tag.' },
            { say: 'Four — the quotes that go cold get chased for you, automatically. A dead estimate gets one more real shot at booking.' },
            { say: 'Five — you see all of it. A dashboard with the calls we caught, the jobs we booked, the revenue we pulled back. Your numbers, not my say-so.' },
            { note: '[VERIFY] before saying the reply-time stat aloud: the "47 hours" figure is Artur’s framing, not an audited study. Until sourced, use the plain version: "whoever replies first usually books the job."' },
          ],
        },
        {
          id: 'pitch-dont-do',
          role: 'callout',
          label: "What I don't do — say this slowly. It's the trust.",
          lines: [
            { say: "And here's what I don't do, because odds are you've been burned before." },
            { say: "I don't mark up your ads. They run on your account, you own them, at cost. I never touch that spend." },
            { say: "I don't resell your leads. No shared pool. Nobody else gets the same homeowner. Every call's recorded and logged to you." },
            { say: "Keep your ads guy. I'm not replacing him. I make his leads actually book." },
            { say: "On terms — no 12-month contract. Ninety days to build it, three months minimum so it gets a fair shot, then month to month — leave anytime with 30 days' notice. When you leave, you keep your ad account, your data, and your Google profile. I don't hold any of it." },
            { say: "And here's the guarantee, and I put it in writing. If the system doesn't bring in more money than it costs you by day 90, I work for free until it does. That's measured on your own dashboard — the calls we caught, the quotes we recovered — not my say-so. On me, not you." },
            { note: "Stop. Don't sell past the guarantee. Go to the close." },
          ],
        },
      ],
    },

    {
      id: 'close',
      title: 'Close',
      goal: 'Book the Revenue Leak Audit, not the contract. Confirm the slot first, get contact second.',
      segments: [
        {
          id: 'close-ask',
          role: 'primary',
          label: 'The ask',
          lines: [
            { say: "I'm not asking you to decide anything today. Here's the next step." },
            { say: 'I do a free Revenue Leak Audit. About twenty minutes. I show you what I found testing your line, your quote form, and your Google page, plus where a roofer your size usually leaks. You keep all of it, hire me or not. Worst case, you walk away knowing where the gaps are.' },
            { say: "I've got Tuesday morning or Thursday afternoon open. Which works better?" },
          ],
        },
        {
          id: 'close-confirm',
          role: 'primary',
          label: 'Confirm the slot, then get contact',
          lines: [
            { say: "Thursday at 2 — that work for you? … Good. What's the best cell to reach you on? I'll personally shoot you a reminder the morning of — that's me texting you, not some automated system. Twenty minutes, and you'll have numbers most owners never pull together in one place." },
            { note: 'Read the slot back out loud: "Thursday, 2pm, I’ll call this number." Then wrap.' },
          ],
        },
        {
          id: 'close-branch-slammed',
          role: 'branch',
          label: 'If "I don’t have twenty minutes / I’m slammed"',
          when: 'The most common honest objection — handle it, don’t push past it.',
          lines: [
            { say: "I get it, you're on roofs all day, that's the whole problem we're talking about. So I'll come to you. Pick the worst time for a meeting and the best time for you — 6 in the morning before the crews roll, or after 7 at night. Twenty minutes, on the phone, no driving, no slideshow. And the thing you walk away with is your own missed-call and lost-quote numbers. When's the dead hour in your day?" },
            { note: 'If he still can’t: "Fine. I’ll text you one line so you’ve got my number. When the phone starts getting away from you, you reach out and we run it then." Don’t drag a slammed owner into a slot he’ll no-show.' },
          ],
        },
        {
          id: 'close-branch-neither',
          role: 'branch',
          label: 'If "Neither of those works"',
          lines: [
            { say: "No problem. Give me a day that does and I'll work around your schedule. Mornings before the crews roll out, or after 6 — whatever's easiest on you." },
          ],
        },
        {
          id: 'close-branch-think',
          role: 'branch',
          label: 'Soft-close — "I need to think about it"',
          lines: [
            { say: "Fair, and I'd rather you did. So let me make it nothing to think about." },
            { say: "The audit isn't the decision. It's just me showing you your own numbers. The missed calls, the response time, the leaking quotes. You keep them no matter what. If they're small, you've lost twenty minutes and you tell me to get lost. If they're big, then you've actually got something to think about." },
            { say: "Thinking about it without the numbers is just guessing. Let's get you the numbers first. Thursday at 2, or is Tuesday better?" },
          ],
        },
        {
          id: 'close-branch-email',
          role: 'branch',
          label: 'Soft-close — "Just send me some info / email me"',
          lines: [
            { say: "I'll send one line confirming I'm real and what the audit is. But the part that matters is your numbers, and I can only show you those live, because they're yours. That's the whole audit. Twenty minutes, and you keep what we find. Which day's easier — Tuesday or Thursday?" },
            { note: 'If he insists you send something anyway: send the one-line confirmation, set a callback. Don’t refuse a reasonable ask outright — that reads cagey.' },
          ],
        },
        {
          id: 'close-branch-references',
          role: 'branch',
          label: 'If "Who else have you done this for? Got a roofer I can call?"',
          lines: [
            { say: "Honest answer — I keep my clients' names and numbers off cold calls. I wouldn't hand your name and revenue to some stranger who dialed me either. What I can do is walk you through exactly how it works, with your own numbers, on the audit. And if you want a reference after that, I'll ask a client first and connect you direct. That fair?" },
            { note: 'Never name a client or quote an unapproved case study. The proof on this call is the leak you found on his own phone.' },
          ],
        },
        {
          id: 'close-branch-not-interested',
          role: 'branch',
          label: 'Qualified but a flat "not interested"',
          when: 'Keep the door open, don’t re-pitch.',
          lines: [
            { say: "Got it, no problem. I'm not going to talk you into it. You've got my number now. If the phone starts getting away from you — more calls than you can catch, quotes going cold — call me and we'll run the audit then. That's it. Appreciate the minute, Mike." },
          ],
        },
        {
          id: 'close-branch-disqualify',
          role: 'branch',
          label: 'Disqualify gracefully (too small, no leak, not ready)',
          lines: [
            { say: "Honest answer — I don't think I'd be worth the money for you yet. You're not leaking enough calls to make my fee pay for itself, and I'm not going to take it when the math doesn't work. Get the volume up, and if the phone starts getting away from you, call me. I'll leave you my number. No pitch." },
            { note: 'Disqualify clean and warm. A roofer who remembers you told him not to hire you is a referral and a future client.' },
          ],
        },
        {
          id: 'close-wrap',
          role: 'primary',
          label: 'Wrap (booked)',
          lines: [
            { say: "Good. Thursday at 2, I'll call this number, takes twenty minutes. Talk Thursday, Mike." },
          ],
        },
      ],
    },
  ],
}
