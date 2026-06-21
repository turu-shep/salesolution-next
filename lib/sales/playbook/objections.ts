import type { Objection } from './types'

/**
 * The shared objection library (both motions).
 *
 * Verbatim encoding of docs/strategy/sales/05-objection-library.md.
 * Spoken lines are transcribed word-for-word (the prose doc is the source of
 * truth); only the structure is added. Reused blocks (THE GUARANTEE, THE TERMS,
 * THE AUDIT OFFER, EMAIL 1) are inlined verbatim where a card references them.
 */
export const OBJECTIONS: Objection[] = [
  // Section 1 — Gatekeeper
  {
    id: 'G1',
    label: '"What\'s this regarding?"',
    triggers: [
      "What's this regarding?",
      'What is this about?',
      'What is this regarding?',
      'Regarding what?',
    ],
    category: 'gatekeeper',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Your main line rang out to voicemail a few minutes ago — that's actually why I'm calling. Two minutes with [Owner] about it. Is he around?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Quick one for [Owner] about how [Company]'s coming up when buyers search for parts. Is he in?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `No problem. What's his direct email? I'll send him the two numbers I pulled and stay out of your hair.` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `Lead with the observed fact, not your mission. "I help shops stop losing jobs" pattern-matches to a pitch by word six — so it's cut. "Your line rang out to voicemail" makes them curious instead.`,
  },
  {
    id: 'G2',
    label: '"He\'s not available." / "He\'s in a meeting."',
    triggers: [
      "He's not available.",
      "He's in a meeting.",
      'He is not available right now',
      'He is busy',
      'He stepped out',
    ],
    category: 'gatekeeper',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `Figured. Is mornings generally better, or should I try mid-afternoon?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `All good. Can I grab his direct email so I'm not going through the front line every time?` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `A binary ("morning or afternoon") is easier to answer than an open schedule question, and it assumes a callback instead of asking permission to be turned away.`,
  },
  {
    id: 'G3',
    label: '"Put it in an email to info@ / sales@."',
    triggers: [
      'Put it in an email to info@',
      'Send it to sales@',
      'Email info@',
      'Send it to our general inbox',
    ],
    category: 'gatekeeper',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `I can do that. Honestly, that info@ box is half of what I'd ask him about — it's usually where leads go to sit. Does he have a direct email so it lands in front of him?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `info@ works if that's easier — I'll keep it to one short note so it doesn't get buried.` },
    ],
    sendAfter: 'Then EMAIL 1 to info@.',
    why: `On RE this is the problem — a shared inbox nobody works, which you probably saw on their site. You turn the brush-off into your own evidence without arguing.`,
  },
  {
    id: 'G4',
    label: '"Are you selling something?"',
    triggers: [
      'Are you selling something?',
      'Is this a sales call?',
      'Are you trying to sell me something?',
      'What are you selling?',
    ],
    category: 'gatekeeper',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `Eventually, sure, if it's a fit. Right now I've got two numbers on [Company]'s phone and Google profile I'd rather show him than sell him on. Is he the right person?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `No problem — his direct email and I'll send the numbers over.` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `One "yes," then pivot to proof. Three stacked hedges ("eventually, maybe, if it's a fit") read as squirming. A burned gatekeeper screens evasion, not honesty.`,
  },
  {
    id: 'G5',
    label: '"That\'s my husband\'s / wife\'s thing — he\'s not here." (small-shop spouse)',
    triggers: [
      "That's my husband's thing",
      "That's my wife's thing",
      "He's not here",
      "She's not here",
      "That's my spouse's thing",
    ],
    category: 'gatekeeper',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Got it — and you probably catch half these calls yourself. When the phone rings and nobody can grab it, where's it going right now — voicemail, your cell?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `Fair. What's the best number or email for [Owner]? I called the main line earlier and it went to voicemail — that's the thing I'd want to show him.` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `In a small trade the spouse is often the one losing the calls and the real influencer. Don't talk past them. Hand them the same fact and they'll carry it to the owner.`,
  },
  {
    id: 'G6',
    label: '(Dental) Office manager answers.',
    triggers: [
      'Office manager answers',
      'This is the office manager',
      'I run the front desk',
      'I manage the office',
    ],
    category: 'gatekeeper',
    motions: ['revenue-engine'],
    subScripts: ['dental'],
    responses: [
      {
        lines: [
          { say: `You're probably the right person, actually. Quick one — when the front desk is checking a patient in and two calls come in at once, what happens to the second one? Voicemail, or does it ring out?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `Makes sense. I help practices stop losing the calls that hit during chair time. Worth 20 minutes with you and the doctor to look at your numbers?` },
      { note: `If not, get the email.` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `The office manager isn't a wall to get past — they own the phones and often steer the decision. Speak to their actual problem (the second simultaneous call), not the doctor's.`,
  },

  // Section 2 — Reflex brush-offs
  {
    id: 'B1',
    label: '"Not interested." (before they\'ve heard anything)',
    triggers: [
      'Not interested.',
      "I'm not interested",
      "We're not interested",
      'Not interested before hearing anything',
    ],
    category: 'brush-off',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Fair — you don't know what it is yet. Ten seconds and you can hang up: I called your line last night at 6:40 and got voicemail. No callback yet. If that was a customer, he's calling the next roofer on the list right now.` },
          { note: `(stop — let them answer)` },
          { note: `If "we catch those / I check voicemail": "Good — how fast does the callback usually go out? Past about five minutes, most people have already called the next name on the list."` },
          { note: `If "we don't miss calls": "Then you're ahead of most. The one I hit last night went to voicemail though — want me to send you what I saw, and you tell me if it's a fluke?"` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Fair, you don't know me. Ten seconds — I asked Google's AI this morning who sells [category] in [region]. Want me to tell you whether it named you, and hang up either way?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `No worries — I'll send you the one thing I saw and get out of your hair.` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `The reflex "no" is to the interruption, not to an offer you haven't made. You replace the interruption with one true, specific fact about their business. Curiosity beats the reflex. Note: don't say "leak" out loud here — say the missed call and the next roofer, which is the picture in his head already. Honesty gate on B1 (IND): only say "I asked the AI" if you actually ran it and have the result in front of you. If they say "show me" and you bluffed, you're the last guy. Run the query before you dial, or change the opener.`,
  },
  {
    id: 'B2',
    label: '"Just email me." / "Send me some info."',
    triggers: [
      'Just email me.',
      'Send me some info.',
      'Email me the details',
      'Send me information',
    ],
    category: 'brush-off',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `I will. So I send the right thing and not a generic deck — when a call comes in and you can't pick up, where's it going right now?` },
          { note: `(stop — let them answer)` },
          { note: `If they give you an answer (voicemail / cell / receptionist): "Got it. I'll send you the two numbers I already pulled on that. Best email — your direct, or is info@ easier?" (stop — let them answer)` },
          { note: `If "we don't miss calls" / "it's covered": "Then you're in good shape. I'll send you what I saw last night anyway — one minute to read — and you tell me if it's nothing." Get the email.` },
        ],
      },
    ],
    hold: [
      { note: `Send it. Keep it to EMAIL 1 — one observation, no brochure, the CTA is a question. Don't dump a deck.` },
    ],
    sendAfter: 'Send EMAIL 1 — one observation, no brochure, CTA is a question. No deck.',
    why: `"Just email me" is the polite end of a call. You agree instantly so there's no friction, then earn one answer that makes the email land warm. The "it's covered" branch keeps you from going silent when they don't play along.`,
  },
  {
    id: 'B3',
    label: '"We\'re not looking for anything right now."',
    triggers: [
      "We're not looking for anything right now.",
      'Not looking for anything',
      "We're all set",
      "We're not in the market",
    ],
    category: 'brush-off',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Makes sense — most shops aren't looking, the missed calls just sit in the background. I'm not asking you to buy anything. I found one specific thing on your end this morning. Can I tell you what it was, and you decide if it's worth 20 minutes later?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Right, and I'm not pitching a project. The way buyers find parts changed, and most owners can't see it happen. When's the last time a new buyer told you they found you through Google or an AI search?` },
          { note: `(stop — let them answer)` },
          { say: `Right — that channel moved, and most catalogs got skipped without the owner ever knowing. That's the thing I'd check.` },
        ],
      },
    ],
    hold: [
      { note: `EMAIL 1. Mark warm-later, not dead.` },
    ],
    sendAfter: 'EMAIL 1. Mark warm-later, not dead.',
    why: `Separate "not buying today" from "not worth knowing about." They've only refused the first. The IND question survives "I don't track that" — it asks what they'd remember, not a metric they may not have.`,
  },

  // Section 3 — "We already have someone"
  {
    id: 'C1',
    label: '"We already have a marketing guy / an agency."',
    triggers: [
      'We already have a marketing guy',
      'We already have an agency',
      'We have someone doing marketing',
      'We work with an agency',
    ],
    category: 'competitor',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Good — you should. I'm not here to replace your ads guy. Keep him. He brings the calls in. I make sure the calls that come in actually book. Different job. The leads he sends you — do they get a text back in under a minute, or do they sit?` },
          { note: `(stop — let them answer)` },
          { note: `If "I don't run ads": "Even simpler, then. It's your own calls and referrals we're talking about — and I called your line last night, it went to voicemail. Those are the calls going to the next guy."` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Glad to hear it. Has he shown you the actual AI answer for [category] — where you land when a buyer asks ChatGPT who sells this part?` },
          { note: `(stop — let them answer)` },
          { say: `If he has and you're named, you're set and I'll leave you alone. If he hasn't, that's the new part, and it's where most catalogs are getting skipped.` },
        ],
      },
    ],
    hold: [
      { say: `Send me his last report — I'll tell you straight if there's a gap, no charge.` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `Burned owners brace for "fire your guy." You say "keep him," which kills the fight, then carve out the slice he isn't covering. On IND, ask the verifying question first — don't hand them the exit before they've shown they can't answer it.`,
  },
  {
    id: 'C2',
    label: '"My nephew / kid / someone in-house handles it."',
    triggers: [
      'My nephew handles it',
      'My kid handles it',
      'Someone in-house handles it',
      'We do it in-house',
    ],
    category: 'competitor',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `That's fine for a lot of it. Here's the one thing a part-timer can't do: answer the phone and text a customer back at 8pm on a Saturday. I called your line after hours last night and got voicemail — that's the exact gap. Who's catching those?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `No knock on them. The question is whether they can rebuild your product pages so the AI reads your catalog and names you over the manufacturer. That's a specific job. Has anybody checked whether ChatGPT names you right now?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `RE → THE AUDIT OFFER: "Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not."` },
      { note: `IND → "I'll run your name through the AI and send you what comes back."` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `Don't insult the nephew — the owner will defend him. Respect him and isolate the one task that needs a system or a specialist, tied to something you actually observed.`,
  },
  {
    id: 'C3',
    label: '"We get plenty of word-of-mouth / referrals." (RE)',
    triggers: [
      'We get plenty of word-of-mouth',
      'We get plenty of referrals',
      'We get all our work from referrals',
      "It's all word of mouth",
    ],
    category: 'competitor',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Best kind of work there is — keep it. But word-of-mouth still rings your phone. I called that phone last night and got voicemail. A referral that hits voicemail doesn't always wait around — he's got the next guy's number too. Stop dropping those calls and you close more of the work you're already winning.` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `I'll pull your missed-call count, it's yours either way.` },
      { note: `THE AUDIT OFFER: "Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not."` },
    ],
    sendAfter: 'Then EMAIL 1.',
    why: `Agree referrals are gold, then show the problem hits every call, not just paid ones — and you've got the voicemail to prove it's real for them.`,
  },

  // Section 4 — Price
  {
    id: 'P1',
    label: '"What does it cost?" / "Just give me a number."',
    triggers: [
      'What does it cost?',
      'Just give me a number.',
      'How much is it?',
      "What's the price?",
    ],
    category: 'price',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `I won't make up a number on the phone — it depends on your volume and your area, and you'd know I was guessing. Here's the real version.` },
          { say: `Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not.` },
          { say: `and the price comes out of what's actually being missed, in writing, same day. Want it?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `I'm not going to quote you cold — it'd be a made-up number and you'd know it. The Growth Call scopes what's actually wrong first. Thirty minutes, I look at where you're getting skipped, then I tell you what it'd take. No number before I've looked. That's the deal.` },
        ],
      },
    ],
    hold: [
      { note: `RE → the Revenue Leak Audit booking link.` },
      { note: `IND → the Growth Call, or the written diagnostic at /unlock-growth-audit/ as the secondary door.` },
    ],
    sendAfter: 'RE → Revenue Leak Audit booking link. IND → Growth Call or /unlock-growth-audit/.',
    why: `Refusing to invent a number is the trust signal to a burned buyer. You swap "how much" for "let's find what you're missing first," which is a better hook anyway.`,
  },
  {
    id: 'P2',
    label: '"Ballpark it. Hundreds or thousands?"',
    triggers: [
      'Ballpark it.',
      'Hundreds or thousands?',
      'Just ballpark it',
      'Give me a range',
    ],
    category: 'price',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `It's a monthly system, not a one-time fee, and it's built to bring in more than it costs. But I'd be guessing at the real number till I see your call volume. Twenty minutes on the audit and you've got a figure tied to your actual numbers, not my ballpark. Fair?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Depends how much is broken — a catalog cleanup is one thing, running the whole channel is another. That's what the call sorts out. I'd rather scope it than throw you a range that's useless.` },
        ],
      },
    ],
    hold: [
      { note: `RE → THE GUARANTEE: "Here's the guarantee. If the system doesn't bring in more money than it costs you by day 90, I work for free until it does." — then the audit link.` },
      { note: `IND → the Growth Call.` },
    ],
    sendAfter: 'RE → THE GUARANTEE, then the audit link. IND → the Growth Call.',
    why: `Give them the shape (monthly, guarantee-backed) without a fake number, then trade the ballpark for a real one.`,
  },
  {
    id: 'P3',
    label: '"That\'s probably out of our budget." (no number quoted yet)',
    triggers: [
      "That's probably out of our budget.",
      'Out of our budget',
      "We probably can't afford it",
      "That's too expensive for us",
    ],
    category: 'price',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `You might be right — but you're guessing at a number I haven't given you. Flip it: if the audit shows even a couple of missed calls a week were real jobs, that answers the budget question on its own. If it doesn't, I'll tell you, and we don't work together. Twenty minutes to find out?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Could be. The Growth Call's free, and if what it'd cost doesn't come back to you in quotes, I'll say so on the call and we leave it there.` },
        ],
      },
    ],
    hold: [
      { note: `RE → the audit.` },
      { note: `IND → the Growth Call or written diagnostic.` },
    ],
    sendAfter: 'RE → the audit. IND → the Growth Call or written diagnostic.',
    why: `They've objected to a price you never said. Don't argue it — point out they're guessing, and offer to replace the guess with their own real number. No invented counts.`,
  },

  // Section 5 — Trust / burned
  {
    id: 'T1',
    label: '"I\'ve been burned by agencies before."',
    triggers: [
      "I've been burned by agencies before.",
      'Burned by an agency',
      'Had a bad experience with an agency',
      'Got burned before',
    ],
    category: 'trust',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Then you'll hate half of what's out there, and you should. So here's what I don't do. No markup on your ads. I don't resell your leads to three other roofers.` },
          { note: `(stop — let it land, then:)` },
          { say: `No 12-month contract. Ninety days to build it, three months minimum so it gets a fair shot, then month to month — leave anytime with 30 days' notice. When you leave, you keep your ad account, your data, and your Google profile. I don't hold any of it.` },
          { say: `Here's the guarantee. If the system doesn't bring in more money than it costs you by day 90, I work for free until it does.` },
          { say: `If any of that sounds like the last guy, tell me and I'll let you go.` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Makes sense. A lot of this got sold on 'guaranteed rankings' and a monthly report nobody read. I don't guarantee rankings — nobody honestly can. What I'll do on the call is show you exactly where you're getting passed over in the AI answers, and what fixing it looks like. If it's vague, you walk.` },
        ],
      },
    ],
    hold: [
      { note: `EMAIL 1 — plain text, one true observation, no deck. Burned buyers trust restraint.` },
    ],
    sendAfter: 'EMAIL 1 — plain text, one true observation, no deck.',
    why: `Agree with the distrust instead of fighting it, then list concrete things you refuse to do. Specifics about your own limits read as honest. Promises read as the last guy. Don't read THE TERMS and THE GUARANTEE back to back as one breath — pause after "three other roofers" so the don't-do list lands before you talk terms. Use the "tell me and I'll let you go" exit once across a call, not as a tic.`,
  },
  {
    id: 'T2',
    label: '"How do I know you\'re any different?"',
    triggers: [
      "How do I know you're any different?",
      'What makes you different?',
      "Why should I believe you're different",
      "How are you different from the rest?",
    ],
    category: 'trust',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `You don't yet — and I'm not going to ask you to take my word.` },
          { say: `Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not.` },
          { say: `If a pitch came before the proof, you'd be right to be suspicious. So the proof comes first.` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Fair. The difference is I'll show you the actual AI answer for your category before I ask for anything. If it names a competitor instead of you, that's not my opinion — it's on your screen. We start from what's true.` },
        ],
      },
    ],
    hold: [
      { note: `Send the thing you pulled — the two numbers, or the AI result. Then the door.` },
    ],
    sendAfter: 'Send the thing you pulled (the two numbers, or the AI result). Then the door.',
    why: `"You don't know yet" is honest and unexpected. Then you replace trust me with see for yourself, which is the whole positioning.`,
  },
  {
    id: 'T3',
    label: '"Send me references. Who else have you worked with?"',
    triggers: [
      'Send me references.',
      'Who else have you worked with?',
      'Got any references?',
      'Who are your clients?',
    ],
    category: 'trust',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `Totally fair to want them — and I'll get you references after this call. The reason I lead with your own numbers is they're about you, not somebody else's shop. If the math on your business doesn't make the case, no reference will. So let me show you your own numbers first — then if you still want references, you've got them.` },
          { note: `(stop — let them answer)` },
          { note: `(Do NOT name a client or quote a case-study number on a cold call.)` },
        ],
      },
    ],
    hold: [
      { note: `Book the audit/call. After the call, send approved references through the proper channel.` },
    ],
    sendAfter: 'Book the audit/call. After the call, send approved references through the proper channel.',
    why: `Don't dodge the ask and don't reframe it away — wanting references is a legitimate procurement reflex. Acknowledge it, then reprioritize: their own data is more persuasive, and it keeps you off the thin ice of name-dropping you can't verify. Hard rule for this section: never invent a client name, a stat, or a result. "Northern Hydraulics" and all client names are off-limits in scripts. If they push for proof you can't source live, the proof is their own numbers. Everything else is a [VERIFY] follow-up after the call.`,
  },

  // Section 6 — Timing
  {
    id: 'TM1',
    label: '"Now\'s a bad time." / "I\'m slammed."',
    triggers: [
      "Now's a bad time.",
      "I'm slammed.",
      'This is a bad time',
      "I'm busy right now",
    ],
    category: 'timing',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `I bet. Two ways to go: I give you the one number I pulled in 30 seconds right now, or you name a better time and I call back then. Which is easier?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `Get the callback time and the direct email. EMAIL 1 in between.` },
    ],
    sendAfter: 'Get the callback time and the direct email. EMAIL 1 in between.',
    why: `"Bad time" is usually true and a soft no. You give them an easy exit and a tiny hook, so the call doesn't just die. Use this two-option move once per prospect, not on every timing card.`,
  },
  {
    id: 'TM2',
    label: '"Call me back next quarter / after the season."',
    triggers: [
      'Call me back next quarter',
      'Call me after the season',
      'Reach out next quarter',
      'Try me after the busy season',
    ],
    category: 'timing',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `I'll put it in the calendar. One thing before I go — during your busy season, is the phone ringing more than usual, or less?` },
          { note: `(stop — let them answer)` },
          { say: `Right — more. So that's when the most calls are slipping past, when you've got the least time to catch them. Let me just send you your missed-call number today, and we talk for real in [month].` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Will do. Quick thing — the AI-answer work isn't a switch you flip, it takes a few months to move. So if we wait till [later], we're really starting then. No pressure today. Let me send you where you stand now, so it's ready when you are.` },
        ],
      },
    ],
    hold: [
      { note: `Book the callback. Send the observation now. Tag for nurture.` },
    ],
    sendAfter: 'Book the callback. Send the observation now. Tag for nurture.',
    why: `Honor the no, then plant one honest reason the cost is real now. On RE, make them say "more" instead of you asserting it — same truth, no squeeze. No fake deadline, ever — that blows your credibility with this exact buyer.`,
  },

  // Section 7 — "Doing fine / too good to be true"
  {
    id: 'F1',
    label: '"We\'re doing fine." / "We\'re busy enough."',
    triggers: [
      "We're doing fine.",
      "We're busy enough.",
      "We're good",
      "Business is fine",
    ],
    category: 'brush-off',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Good — that's the right time to fix this, when you're not desperate. Here's the thing about busy: busy is exactly when calls get missed, because you're on a job and the phone's ringing. I called your line during business hours yesterday and got voicemail. Want me to pull how many of those happened last month? It's free.` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Glad to hear it. Most owners I talk to were doing fine too — right up until the quotes got quieter and they couldn't say why. Not saying that's you. Worth 30 seconds to check whether the AI names you or a competitor for your parts. Want me to look while we're on?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `Send the observation. Mark warm-later.` },
    ],
    sendAfter: 'Send the observation. Mark warm-later.',
    why: `"Fine" is a feeling. The missed-call count and the AI answer are facts. Offer to swap one for the other — and you've already got the voicemail to make it real.`,
  },
  {
    id: 'F2',
    label: '"Sounds too good to be true." / "Does this even work?"',
    triggers: [
      'Sounds too good to be true.',
      'Does this even work?',
      'This sounds too good to be true',
      'Does it actually work?',
    ],
    category: 'trust',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { note: `Say (RE, roofing):` },
          { say: `Good instinct — if someone promised me guaranteed jobs I'd hang up too. So here's the boring version. I don't promise leads. The calls you already get and the quotes you already send go to the next guy when nobody answers fast enough — I fix that. The proof isn't my chart. It's your dashboard, in plain math.` },
          { say: `Here's the guarantee. If the system doesn't bring in more money than it costs you by day 90, I work for free until it does.` },
          { say: `That's the whole thing. No magic. Just a system that answers the phone faster than you can while you're on a roof.` },
        ],
      },
      {
        label: 'Dental',
        motions: ['revenue-engine'],
        lines: [
          { note: `Say (RE, dental): same setup, ending:` },
          { say: `...just a system that picks up the calls your front desk can't get to when they're checking a patient in.` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `I get the skepticism — there's a lot of snake oil in this corner. I won't tell you I can guarantee a ranking; nobody can. What I can do is show you today whether the AI names you or skips you, and why. If it skips you, I can tell you the three reasons, and they're fixable. That's it. No magic.` },
        ],
      },
    ],
    hold: [
      { note: `RE → the audit (proof on their numbers).` },
      { note: `IND → run their name through the AI live or in follow-up.` },
    ],
    sendAfter: 'RE → the audit (proof on their numbers). IND → run their name through the AI live or in follow-up.',
    why: `Side with the skepticism, then lower the claim until it sounds true. Boring and specific beats exciting and vague for this buyer. The day-90 guarantee makes "too good" testable.`,
  },

  // Section 8 — Fit / size
  {
    id: 'S1',
    label: '"We\'re too small for this." / "We\'re not Caterpillar." (IND)',
    triggers: [
      "We're too small for this.",
      "We're not Caterpillar.",
      "We're too small",
      "We're not a big company",
    ],
    category: 'fit',
    motions: ['industrial'],
    responses: [
      {
        lines: [
          { say: `You're probably not Caterpillar, and you don't need to be — this is built for owners between five and seventy-five million, not the giants. So I'm not wasting your time: roughly how many people on your sales and counter side?` },
          { note: `(stop — let them answer)` },
          { note: `If "why do you ask / I'm not telling you my revenue": "Fair — I'm only checking you're past about five million, where this starts to pay back. North of that, you're exactly who it's for. Under it, I'll tell you straight it's too early."` },
        ],
      },
    ],
    hold: [
      { note: `In range → the Growth Call.` },
      { note: `Under $5M → graceful exit (S3), not a pitch.` },
    ],
    sendAfter: 'In range → the Growth Call. Under $5M → graceful exit (S3), not a pitch.',
    why: `Naming the band tells them where they fit, and the honest disqualifier makes the qualifier credible. Asking headcount is less intrusive cold than asking revenue outright — and gives you the same read.`,
  },
  {
    id: 'S2',
    label: '"We\'re a small shop, this is overkill." (RE)',
    triggers: [
      "We're a small shop, this is overkill.",
      "This is overkill for us",
      "We're just a small shop",
      "That's overkill for a shop our size",
    ],
    category: 'fit',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Small shops are who this is for. A big outfit has a front desk that answers every call. You're on the roof — you are the front desk, and you can't be in two places. I called your line yesterday and got voicemail, which is the proof. The system's the receptionist you can't afford to hire yet. How many calls do you figure you miss in a week?` },
          { note: `(stop — let them answer)` },
        ],
      },
      {
        label: 'Dental',
        motions: ['revenue-engine'],
        lines: [
          { note: `Say (RE, dental small practice):` },
          { say: `Small practices lose the most, because your one front-desk person can't check in a patient and answer two ringing lines at once. I called yours yesterday during business hours and got voicemail. That's the gap.` },
        ],
      },
    ],
    hold: [
      { note: `THE AUDIT OFFER — the missed-call count proves it: "Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not."` },
    ],
    sendAfter: 'THE AUDIT OFFER — the missed-call count proves it.',
    why: `Flip "too small" into "exactly the right size." A solo or small operator has the worst phone coverage, so the problem is bigger, not smaller — and you observed it.`,
  },
  {
    id: 'S3',
    label: 'Under $5M / clearly out of fit (IND) — graceful disqualify',
    triggers: [
      "We're under five million",
      "We're a small operation",
      "We're not that big",
      'Below five million in revenue',
    ],
    category: 'fit',
    motions: ['industrial'],
    responses: [
      {
        lines: [
          { say: `Straight with you — what I do starts to pay back north of about five million in revenue. Below that, the math doesn't come back fast enough to be worth your cash, so I'm not going to pitch you. Two things that'll actually help you right now, free: fill out your Google Business Profile completely, and get your top products onto your site with real specs and part numbers. Do those, and call me when you're bigger. No hard feelings.` },
        ],
      },
    ],
    hold: [
      { note: `Nothing to sell. Optionally one line: "want me to email you that two-item checklist?" Don't book them.` },
    ],
    sendAfter: 'Nothing to sell. Optionally email the two-item checklist. Don\'t book them.',
    why: `A clean no builds more reputation than a stretched yes. A small owner you treated straight refers the bigger ones.`,
  },

  // Section 9 — Revenue Engine specials
  {
    id: 'RE1',
    label: '"I already have an answering service / a receptionist."',
    triggers: [
      'I already have an answering service',
      'I already have a receptionist',
      'We have someone answering the phones',
      'We have a receptionist',
    ],
    category: 'competitor',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Good — keep them. Two questions. Do they answer at 8pm on a Saturday, or just business hours? And when they take a message, who texts that customer back, and how fast? I called your line after hours last night and got voicemail — so something's getting past them. An answering service takes a message. This texts back in seconds, any hour, and walks the customer toward booking. They work together.` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `THE AUDIT OFFER — measure the after-hours and follow-up gap specifically: "Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not."` },
    ],
    sendAfter: 'THE AUDIT OFFER — measure the after-hours and follow-up gap specifically.',
    why: `Don't trash their service — name the two things it doesn't do: after-hours, and fast text-back. That's where the money goes, and you've got an after-hours voicemail to prove it. Say "walks them toward booking," not "books the job" — don't overclaim that the booking is automatic.`,
  },
  {
    id: 'RE2',
    label: '"I\'m literally on a roof right now." / "I\'m with a patient."',
    triggers: [
      "I'm literally on a roof right now.",
      "I'm with a patient.",
      "I'm on a roof",
      "I'm in the middle of something",
    ],
    category: 'timing',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Then you just proved my whole point, and I'll get off the phone. That's the problem — right now, while you're up there, your phone's ringing and somebody's getting voicemail. That's the exact call this fixes. Text me a good time at this number and I'll send you how many of those you're missing. Go work — talk soon.` },
        ],
      },
    ],
    hold: [
      { note: `Text the observation. One line. Then EMAIL 1.` },
    ],
    sendAfter: 'Text the observation. One line. Then EMAIL 1.',
    why: `The interruption itself is the demonstration — you couldn't script better proof than them being unreachable mid-call. Respect them and exit fast; that builds the goodwill that gets the callback.`,
  },
  {
    id: 'RE3',
    label: '"Is this HIPAA-compliant?" (dental)',
    triggers: [
      'Is this HIPAA-compliant?',
      'Is this HIPAA compliant?',
      'Are you HIPAA compliant?',
      'What about patient data / HIPAA?',
    ],
    category: 'trust',
    motions: ['revenue-engine'],
    subScripts: ['dental'],
    responses: [
      {
        label: 'Dental',
        motions: ['revenue-engine'],
        lines: [
          { note: `Say (only if confirmed true today — see gate below):` },
          { say: `Yes — and I'm glad you asked, because a lot of marketing tools aren't, and they don't tell you. Every tool that touches patient info is covered by a BAA: the call tracking, the texting, the CRM. I'll send you the list so you can check it yourself before you commit to anything.` },
        ],
      },
      {
        label: 'Dental',
        motions: ['revenue-engine'],
        lines: [
          { note: `If not yet confirmed:` },
          { say: `Compliance is the first thing — every tool that touches patient data has to be covered by a business-associate agreement. Let me confirm the exact current list with my team and send it to you in writing before you commit to anything. I won't hand-wave that one.` },
        ],
      },
    ],
    hold: [
      { note: `Send the BAA list / compliance one-pager once confirmed.` },
    ],
    sendAfter: 'Send the BAA list / compliance one-pager once confirmed.',
    why: `A dentist asking this is testing whether you take compliance seriously. Naming the BAA-covered surfaces (calls, SMS, CRM) and offering them in writing is the credible answer. "Yes, totally" isn't. Note: the "if confirmed" version says "BAA" because a dentist knows the term; the unconfirmed version spells it out so you're not parroting an acronym you can't yet back. [VERIFY — hard gate] Do not assert "every tool has a BAA in place" on a live call until Artur confirms the current BAA coverage list. Asserting unconfirmed compliance to a regulated buyer is the highest-liability line in this deck. If unconfirmed, read the second version, not the first.`,
  },
  {
    id: 'RE4',
    label: '"I don\'t do contracts." / "What\'s the lock-in?"',
    triggers: [
      "I don't do contracts.",
      "What's the lock-in?",
      'No contracts for me',
      "What's the commitment?",
    ],
    category: 'trust',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Then we'll get along.` },
          { say: `No 12-month contract. Ninety days to build it, three months minimum so it gets a fair shot, then month to month — leave anytime with 30 days' notice. When you leave, you keep your ad account, your data, and your Google profile. I don't hold any of it.` },
          { say: `Here's the guarantee. If the system doesn't bring in more money than it costs you by day 90, I work for free until it does.` },
          { say: `The reason I don't need a long lock-in is the guarantee does that work — not a contract.` },
        ],
      },
    ],
    hold: [
      { note: `Send the written terms. EMAIL 1, reply-first.` },
    ],
    sendAfter: 'Send the written terms. EMAIL 1, reply-first.',
    why: `Lock-in is the burned buyer's deepest fear. You answer it with exact, short terms and "you keep your stuff" — the opposite of every agency that trapped them. Read THE TERMS verbatim so it matches T1 word for word.`,
  },
  {
    id: 'RE5',
    label: '"Are you reselling me the same leads three other guys get?"',
    triggers: [
      'Are you reselling me the same leads three other guys get?',
      'Are these shared leads?',
      'Do other people get the same leads?',
      'Is this a shared lead pool?',
    ],
    category: 'trust',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `No. That's lead-vendor stuff, and I don't do it. No shared pool. I'm not selling you contacts at all. I work the calls and customers you already get — your phone, your ads, your referrals — and make more of them book. Every call's recorded and logged to you. Nobody else gets them.` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `THE AUDIT OFFER — it's literally their own call data, which proves it's not shared: "Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not."` },
    ],
    sendAfter: `THE AUDIT OFFER — it's literally their own call data, which proves it's not shared.`,
    why: `Draw a hard line between you and the lead vendors that burned them. The proof — their own logged calls — is built into the offer.`,
  },
  {
    id: 'RE6',
    label: '"I tried automation like this and it was a robot that annoyed customers."',
    triggers: [
      'I tried automation like this and it was a robot that annoyed customers.',
      'It was a robot that annoyed customers',
      'I tried a bot and it was terrible',
      "I don't want a robot answering",
    ],
    category: 'trust',
    motions: ['revenue-engine'],
    responses: [
      {
        lines: [
          { say: `Yeah, I've heard the horror stories — a bot that traps people and they can't reach a human. That's not this. A caller can always get to a person. The automation just handles speed — texting back in seconds so the customer doesn't go cold — but it never blocks anyone from reaching you. And I tune the scripts every week off the real calls, so it sounds like your shop, not a call center.` },
          { note: `(stop — let them answer)` },
          { note: `If "how do I know it won't sound like a robot": "You'll hear it before it goes live — I'll walk you through a real call flow on the audit, in your words, and you sign off on it. If it ever sounds off after that, that's on me to fix that week."` },
        ],
      },
    ],
    hold: [
      { note: `Offer to walk them through a real call flow on the audit.` },
    ],
    sendAfter: 'Offer to walk them through a real call flow on the audit.',
    why: `Validate the real bad experience, then draw the specific line — always reaches a human, tuned weekly, you sign off before it's live — that separates a good system from the junk they tried. The branch handles the comeback ("prove it won't") instead of leaving it hanging.`,
  },

  // Section 10 — Industrial specials
  {
    id: 'IND1',
    label: '"SEO doesn\'t work for us. We tried it, it did nothing."',
    triggers: [
      "SEO doesn't work for us.",
      'We tried SEO, it did nothing.',
      "SEO doesn't work for a parts catalog",
      'SEO was a waste of money',
    ],
    category: 'competitor',
    motions: ['industrial'],
    responses: [
      {
        lines: [
          { say: `I believe you — old-style SEO mostly doesn't work for a parts catalog. But that's not what I'm calling about. The game changed: buyers ask ChatGPT and Google's AI 'who sells this part,' and the AI gives one answer. If you're not in it, you never get the click. That's different from ranking on page one. Want me to ask the AI who sells [category] in [region] and tell you if you're in it?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `Run the query, send the result. Then the Growth Call.` },
    ],
    sendAfter: 'Run the query, send the result. Then the Growth Call.',
    why: `Separate the old SEO that failed them from the AI-answer work that's new. Their failed SEO is evidence the old way is dead, not an objection.`,
  },
  {
    id: 'IND2',
    label: '"Amazon\'s killing us anyway. Nothing we can do."',
    triggers: [
      "Amazon's killing us anyway.",
      'Nothing we can do about Amazon',
      "We can't compete with Amazon",
      "Amazon's taking all our business",
    ],
    category: 'competitor',
    motions: ['industrial'],
    responses: [
      {
        lines: [
          { say: `Amazon's brutal, no argument. But here's what's changed in your favor: when a buyer asks the AI for a specific part or a cross-reference, Amazon's listing is often a pile of third-party junk — and a real distributor with clean specs and part numbers can get named over it. You can't out-Amazon Amazon. You can out-specific them. Want me to show you where you stand in those answers right now?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `The AI-answer check for their parts, then the Growth Call.` },
    ],
    sendAfter: 'The AI-answer check for their parts, then the Growth Call.',
    why: `Don't deny the threat — denial loses credibility. Find the specific opening inside it: technical part queries where Amazon is weak and a specialist wins on precision.`,
  },
  {
    id: 'IND3',
    label: '"Our customers don\'t buy online. They call our reps."',
    triggers: [
      "Our customers don't buy online.",
      'They call our reps.',
      'Our buyers order by phone',
      "We don't sell online",
    ],
    category: 'fit',
    motions: ['industrial'],
    responses: [
      {
        lines: [
          { say: `Right, and most of them always will — engineers and buyers want a rep. But ask how they decide who to call. More and more, they ask Google's AI or ChatGPT 'who sells this part in [region]' first, and they call whoever it names. So this isn't about selling online instead of through your reps. It's about being the name the AI hands them, so the call comes to your reps and not a competitor's. Your reps still close it. They just need the phone to ring. When's the last time you checked who the AI names for your line?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `I'll check whether the AI names you for [category] and send it over.` },
      { note: `Then the Growth Call.` },
    ],
    sendAfter: 'Check whether the AI names them for [category] and send it over. Then the Growth Call.',
    why: `Concede the true thing — they buy by phone — and move the fight upstream to who gets the call, where the AI now decides and their rep model doesn't reach. The closer is a real question that exposes a blind spot, not a flat "make sense?" that begs a "no."`,
  },
  {
    id: 'IND4',
    label: '"We don\'t have time for a marketing project right now."',
    triggers: [
      "We don't have time for a marketing project right now.",
      'No time for a marketing project',
      "We're too busy for marketing",
      "We don't have bandwidth for this",
    ],
    category: 'timing',
    motions: ['industrial'],
    responses: [
      {
        lines: [
          { say: `Fair — you're running a business, not a marketing department. The Growth Call's 30 minutes, and most of the work after it is on my side, not yours. I'm not handing you a project to manage. The one reason I'd not sit on it: the AI-answer work takes a few months to move, so the longer you wait, the longer till it pays. No pressure today — want me to send you where you stand, so it's ready when you are?` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { note: `The written diagnostic at /unlock-growth-audit/ — they read it on their own time. Nurture via cadence.` },
    ],
    sendAfter: 'The written diagnostic at /unlock-growth-audit/. Nurture via cadence.',
    why: `Remove the labor fear ("this is on me, not you"), give an honest non-pushy reason not to wait, and offer a no-meeting door.`,
  },

  // Section 11 — Compliance & cold-call hygiene
  {
    id: 'H1',
    label: '"Where did you get my number?" / "How\'d you get this?"',
    triggers: [
      'Where did you get my number?',
      "How'd you get this?",
      'How did you get my number?',
      'Where did you get this number?',
    ],
    category: 'hygiene',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `Straight answer — your number's listed publicly for [Company], on your site and your Google profile. I'm not working off a bought list. I call owners directly when I see something worth a heads-up, and yours had one.` },
          { note: `(stop — let them answer)` },
        ],
      },
    ],
    hold: [
      { say: `Fair to ask — I'll send the one thing I found by email instead and leave it with you.` },
      { note: `Don't argue it. Then EMAIL 1, or close out if they decline.` },
    ],
    sendAfter: 'Then EMAIL 1, or close out if they decline.',
    why: `The question is testing whether you're a spammer. A specific, true source ("your public listing, not a bought list") separates you from the robocall they expected.`,
  },
  {
    id: 'H2',
    label: '"Take me off your list." / "Stop calling." / "Do not call me again."',
    triggers: [
      'Take me off your list.',
      'Stop calling.',
      'Do not call me again.',
      'Remove me from your list',
    ],
    category: 'hygiene',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        lines: [
          { say: `Done. I'll take you off right now and you won't hear from me again. Sorry to bother you — have a good one.` },
          { note: `Then: Hang up. Log the number to your internal do-not-call list immediately. No second pitch, no "before you go," no email. A stop request ends every motion.` },
        ],
      },
    ],
    sendAfter: `Hang up. Log the number to your internal do-not-call list immediately. No second pitch, no "before you go," no email. A stop request ends every motion.`,
    why: `This isn't persuasion — it's the law and your reputation. The fastest, cleanest exit is the only right answer. One more word here is how you earn a complaint.`,
  },
  {
    id: 'H3',
    label: "You reach the OWNER's voicemail (what you say when you get the beep)",
    triggers: [
      "Owner's voicemail",
      'I reached voicemail',
      'Got the beep',
      'Leaving a voicemail for the owner',
    ],
    category: 'hygiene',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `Hi [Owner], it's Artur. I called your main line earlier and it went to voicemail — that's actually why I'm calling. I pulled a couple of quick numbers on your phone and your Google profile that you'll want to see. No pitch — I'll text them to this number, and you tell me if they're worth 20 minutes. Thanks.` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `Hi [Owner], it's Artur. I asked Google's AI this morning who sells [category] in [region], and I want to show you what came back about [Company]. No pitch, takes a minute. I'll follow up by email — reply if you want the screenshot. Thanks.` },
        ],
      },
    ],
    sendAfter: 'Send EMAIL 1 the same day. The voicemail and the email reference the same observation.',
    why: `Short, specific, one reason, one easy next step. A voicemail that names a real thing about their business gets a callback. A generic "I'd love to connect" gets deleted.`,
  },
  {
    id: 'H4',
    label: '(After the email) "I saw your email. Not interested."',
    triggers: [
      'I saw your email. Not interested.',
      'Got your email, not interested',
      'I read your email, no thanks',
      'Saw the email, not for us',
    ],
    category: 'brush-off',
    motions: ['revenue-engine', 'industrial'],
    responses: [
      {
        label: 'RE',
        motions: ['revenue-engine'],
        lines: [
          { say: `No problem at all — appreciate you saying so straight. Last thing and I'll leave it: the voicemail I flagged was real, so if the phone ever feels quieter than it should, that's the first place I'd look. Either way, I won't keep calling. Take care.` },
        ],
      },
      {
        label: 'IND',
        motions: ['industrial'],
        lines: [
          { say: `No problem at all — appreciate you saying so straight. Last thing and I'll leave it: the AI named [competitor / nobody], not you, for [category] today. So if the quotes ever feel quieter than they should, that's the first place I'd look. Either way, I won't keep calling. Take care.` },
        ],
      },
    ],
    sendAfter: 'Mark closed-polite. No further dials. If they ever reply later, restart warm.',
    why: `They engaged enough to read it, so respect that with a clean exit that leaves one useful idea behind. Pushing here converts a soft no into a complaint — and a clean goodbye keeps the door open for a later inbound. The IND tail uses the AI result you actually pulled, not the RE voicemail line — keep the observation true to the motion.`,
  },
]
