import type { Track } from '../types'

/**
 * Industrial / technical-distribution cold-call script.
 *
 * Verbatim encoding of docs/strategy/sales/04-industrial-script.md.
 * Lines are transcribed word-for-word (the prose doc is the source of truth);
 * only the structure is added. Stage 6 (follow-up email), the branch
 * cheat-sheet, and the rules list are intentionally omitted — they aren't
 * spoken call stages.
 */
export const industrialTrack: Track = {
  slug: 'industrial',
  motion: 'industrial',
  subScript: null,
  label: 'Industrial / technical distribution',
  persona: 'The owner or president of a $5M–$75M distributor or manufacturer.',
  goal: 'Book a Growth Call.',
  cta: { label: 'Book a Growth Call', href: '/book-growth-call/' },

  precall: {
    title: 'Stage 0 — Pre-call research (5 minutes, before you dial)',
    note: 'Do this for every account. The opener is built from what you find. No finding, no opener. Move on. Write the three findings on a sticky before you dial: AI named: ______ (not him) · Catalog problem: ______ · Human note: ______',
    items: [
      {
        action: 'Ask the AI what his buyers ask. Open ChatGPT and Google\'s AI. Run the real buyer query for his category and region:',
        detail: '"Who sells [hydraulic fittings / bearings / industrial fasteners] in [his metro or state]?" · "Best distributor for [his product class] near [region]." · "Where can I buy [a specific spec or part he carries]?" Write down who the AI names. One of these is true: It names a competitor → "It named [competitor], not you." It names Amazon or the manufacturer direct → "It pointed buyers to Amazon and to [OEM] direct. Past you." It names nobody local, or gives a mush answer → "It couldn\'t name one distributor in your area. Including you." It names him → rare, and good. A-tier prospect. Still call.',
        openerFuel: 'Your name came up, so you\'re doing something right. I called because most of your category\'s invisible to it, and I want you to stay the one it picks.',
      },
      {
        action: 'Check whether the AI can even read his catalog. Open his site. In 60 seconds, find one:',
        detail: 'Prices are quote-only. No number anywhere. You can\'t search by part number or spec, or the search returns junk. Product pages are thin — the same copy the manufacturer publishes, nothing of his own. The catalog is a PDF or a contact form, not real pages. Pick the worst one. That\'s your second concrete observation.',
      },
      {
        action: 'One human fact.',
        detail: 'Years in business, family-owned, a line he\'s known for. One line, so the call sounds like a person called, not a list.',
      },
    ],
  },

  stages: [
    {
      id: 'open',
      title: 'Open (get to the owner)',
      goal: 'You\'ll usually hit a gatekeeper. Be honest, be short, give her an easy reason to pass you through. You\'re not hiding the ball. You\'ve got one specific thing for the owner.',
      segments: [
        {
          id: 'open-gatekeeper',
          role: 'primary',
          label: '1A — Gatekeeper picks up',
          lines: [
            { say: `Hi, this is Artur. Could you put me through to [Owner first name]?` },
            { note: `(Calm. Like you've called before. Then stop.)` },
          ],
        },
        {
          id: 'open-gk-regarding',
          role: 'branch',
          label: `If: "What's this regarding?"`,
          lines: [
            { say: `It's about how [Company] shows up in ChatGPT. A competitor's coming up instead of you. Thirty seconds with [Owner] and he can tell me if he cares. Is he around?` },
          ],
        },
        {
          id: 'open-gk-busy',
          role: 'branch',
          label: `If: "He's busy / in a meeting."`,
          lines: [
            { say: `No problem. When's he usually at his desk, morning or afternoon? I'll catch him then instead of bugging you twice.` },
            { note: `(You're asking her to help you, not to gatekeep. Most will.)` },
          ],
        },
        {
          id: 'open-gk-no-sales',
          role: 'branch',
          label: `If: "He doesn't take sales calls."`,
          lines: [
            { say: `Fair. I wouldn't either. This isn't a pitch, it's something I found about how buyers see [Company] in the AI now. If he doesn't care, he'll say so in 20 seconds and I'm gone. Can you put me through?` },
          ],
        },
        {
          id: 'open-gk-real-door',
          role: 'branch',
          label: 'If she still won\'t: find the real door.',
          lines: [
            { say: `All good. Who'd be the right person if not [Owner] — whoever owns the website?` },
            { note: `(The e-commerce manager is sometimes the real buyer. If she only offers an email, take it, send the Stage 6 email, mark for a second dial.)` },
          ],
        },
        {
          id: 'open-vm-1',
          role: 'variant',
          label: '1B — Voicemail, first attempt',
          when: 'Under 20 seconds. One concrete hook, your number twice, no pitch.',
          lines: [
            { say: `Hi [Owner], it's Artur Shepel. I asked ChatGPT who sells [product class] in [region], and it named [competitor], not [Company]. That's a leak, and it's fixable. I'll send a short email so you've got it in writing. If you'd rather just talk, I'm at [number]. That's [number again]. Thanks.` },
          ],
        },
        {
          id: 'open-vm-2',
          role: 'branch',
          label: '1B-2 — Voicemail, second attempt (dial 2, a few days later)',
          when: 'Reference the first. Don\'t restart cold.',
          lines: [
            { say: `[Owner], it's Artur again, the ChatGPT thing I left you a few days back. I ran it once more this morning, same result: still naming [competitor] for your parts, not you. I'll keep it short. I'm at [number], [number again]. If it's easier, just reply to the email I sent. Thanks.` },
          ],
        },
        {
          id: 'open-vm-3',
          role: 'branch',
          label: '1B-3 — Voicemail, third and last attempt (dial 3)',
          when: 'Close the loop honestly. No nagging.',
          lines: [
            { say: `[Owner], Artur, last one from me. Short version: when buyers ask the AI who sells [product class] near you, your name's not in the answer. That's quotes you'll never see ring. Fixing it is the whole reason I called. Everything's in the email I sent. If it's not a now thing, no worries, I'll leave it there. [number]. Take care.` },
          ],
        },
        {
          id: 'open-send-email',
          role: 'branch',
          label: '1C — "Send me an email"',
          when: 'Don\'t fight it. Use it.',
          lines: [
            { say: `I'll do that. What's the best address? I'll keep it to the one screenshot of what the AI said and why your name's missing. If it's worth ten minutes after you read it, you tell me. If not, no follow-up.` },
            { note: `(Then actually send Stage 6. The email earns the callback the call didn't.)` },
          ],
        },
        {
          id: 'open-owner-cold',
          role: 'primary',
          label: '1D — Reached the owner cold (hook-first opener)',
          when: 'This is the moment. Cold-call honesty, then the leak, then a tiny ask, in that order, in one breath. Don\'t waste the window describing the call. Land the hook.',
          lines: [
            { say: `[Owner], it's Artur — cold call, I'll be 20 seconds and you can hang up on me. I asked ChatGPT who sells [product class] in [region], and it named [competitor], not you. That's the whole reason I called. Want the 20 seconds?` },
          ],
        },
        {
          id: 'open-owner-go',
          role: 'branch',
          label: `1D → "Go ahead."`,
          goto: 'hook',
          lines: [
            { note: `→ Stage 2.` },
          ],
        },
        {
          id: 'open-owner-who',
          role: 'branch',
          label: `1D → "Who is this? What company?"`,
          goto: 'hook',
          lines: [
            { say: `Artur Shepel, Sale Solution. Small shop, it's me on the phone. I do this for distributors your size. I'm not calling to drop client names, I'm calling because I found your gap. Want to hear it?` },
            { note: `→ Stage 2.` },
          ],
        },
        {
          id: 'open-owner-never-heard',
          role: 'branch',
          label: `1D → "I've never heard of you / what have you done?"`,
          goto: 'hook',
          lines: [
            { say: `You wouldn't have. I'm a one-man shop, not a big agency. So don't take my word for any of it. Type 'who sells [product class] in [region]' into ChatGPT after we hang up and look at the answer. That's the whole pitch. Worth 20 seconds now?` },
            { note: `→ Stage 2.` },
          ],
        },
        {
          id: 'open-owner-number',
          role: 'branch',
          label: `1D → "How'd you get my number?"`,
          goto: 'hook',
          lines: [
            { say: `It's on your own site, under the rep list. Same place I found the rest of what I called about. Twenty seconds and I'll tell you what I found?` },
            { note: `→ Stage 2.` },
          ],
        },
        {
          id: 'open-owner-bad-time',
          role: 'branch',
          label: `1D → "Bad time."`,
          lines: [
            { say: `No problem. Better in an hour, or tomorrow morning?` },
            { note: `(Book it like an appointment. Repeat the time back. See 1F.)` },
          ],
        },
        {
          id: 'open-not-interested',
          role: 'branch',
          label: '1E — "We\'re not interested" (the reflex, before you\'ve said anything)',
          when: 'This is a reflex, not a decision. He doesn\'t know what he\'s turning down yet. Don\'t argue. Agree, then drop the one finding.',
          lines: [
            { say: `Yeah, you don't know what I've got yet, so that's the right instinct. One sentence, then hang up if it's nothing: I asked ChatGPT who sells [product class] in [region], and it named [competitor], not you. That's costing you quotes that never ring. Twenty seconds, or should I let you go?` },
          ],
        },
        {
          id: 'open-not-interested-engages',
          role: 'branch',
          label: '1E → Engages',
          goto: 'hook',
          lines: [
            { note: `→ Stage 2.` },
          ],
        },
        {
          id: 'open-not-interested-still',
          role: 'branch',
          label: `1E → "Still not interested."`,
          lines: [
            { say: `Understood. I'll email you the screenshot so it's not lost. Have a good one.` },
            { note: `(Send Stage 6. Don't push. This one's one-and-done, no second dial.)` },
          ],
        },
        {
          id: 'open-booked-callback',
          role: 'branch',
          label: '1F — Calling back a booked callback',
          when: 'He told you to call at 2. Don\'t get re-screened from scratch. Anchor to the appointment he made.',
          goto: 'hook',
          lines: [
            { say: `Hi [Owner], it's Artur. You told me to catch you around 2, so here I am. Still a decent two minutes? … Good. Quick refresher on why I called: ChatGPT's naming [competitor] for your parts, not you. Let me show you what I mean.` },
            { note: `(Then straight into Stage 2.)` },
          ],
        },
      ],
    },

    {
      id: 'hook',
      title: 'Hook (the villain, in his words)',
      goal: 'He\'s listening. Name the problem the way he\'d say it at his own counter. No charts. No "GEO." No "citation share." Plain stakes, then hand it off fast.',
      segments: [
        {
          id: 'hook-primary',
          role: 'primary',
          lines: [
            { say: `Here's why I called. Your buyers — engineers, maintenance, procurement — a lot of them don't start on Google anymore. They ask ChatGPT or that AI box at the top of Google 'who sells this part,' and they go with the name it gives them.` },
            { say: `I ran that for your category. It gave me [competitor / Amazon / the manufacturer direct]. Not you.` },
            { say: `So your phone's quieter and the quotes are thinner. And it feels like Amazon and the manufacturers are eating business that used to be yours. Because they are, across your whole category.` },
            { note: `(Then hand it to him. The hand-off makes him test his own memory, not give you a free exit.)` },
            { say: `When's the last time you typed your own parts into ChatGPT to see who comes up?` },
          ],
        },
        {
          id: 'hook-never',
          role: 'branch',
          label: `If "Never have."`,
          goto: 'discovery',
          lines: [
            { say: `Most owners haven't. I did it for you this morning, and your name wasn't in the answer. That's the leak. Two quick questions and you'll see if it's real for you.` },
            { note: `→ Stage 3.` },
          ],
        },
        {
          id: 'hook-fine',
          role: 'branch',
          label: `If "We're doing fine, quotes are good."`,
          goto: 'discovery',
          lines: [
            { say: `Good, genuinely. Here's the thing about fine, though. The AI's already steering the buyers who don't know you yet to [competitor]. You won't feel that as a drop. You'll feel it as growth that just doesn't show up. Worth two questions to see if it's happening to you?` },
            { note: `→ Stage 3.` },
          ],
        },
        {
          id: 'hook-just-seo',
          role: 'branch',
          label: `If "This is just SEO. Every one of you calls about this."`,
          goto: 'discovery',
          lines: [
            { say: `Most of those calls are about Google rankings. This is different. This is whether the AI even says your name when it answers. Don't take my word for it. Type 'who sells [product class] in [region]' into ChatGPT right now and tell me if you're in it.` },
            { note: `(Let him look. His own blank screen does the work.) → Stage 3.` },
          ],
        },
        {
          id: 'hook-pay-agency',
          role: 'branch',
          label: `If "We pay a guy / an agency for this already."`,
          goto: 'discovery',
          lines: [
            { say: `Then here's a free test of whether they're earning it. Ask them what your name does inside ChatGPT for your top parts. If they've got a real answer, I'm wasting your time and I'll say so. If they go quiet, that's the gap I called about. Either way you learn something. Two questions?` },
            { note: `→ Stage 3.` },
          ],
        },
      ],
    },

    {
      id: 'discovery',
      title: 'Discovery (4–6 questions, his vocabulary)',
      goal: 'You\'re qualifying and building the case at once. Ask in his language: quotes, RFQs, counter sales, line card. One question, then quiet. Listen more than you talk.',
      segments: [
        {
          id: 'disc-q1',
          role: 'question',
          label: 'Q1 — the trend.',
          lines: [
            { say: `Compared to last year, are your quotes and RFQs up, flat, or down?` },
          ],
          reads: {
            good: 'Down or flat → the pain is real. Good.',
            borderline: 'Up → "Good. So this is about protecting that, not fixing it."',
          },
        },
        {
          id: 'disc-q2',
          role: 'question',
          label: 'Q2 — where buyers come from now.',
          lines: [
            { say: `When a new customer finds you these days, where's it coming from? Reps and referrals, or people finding you cold online?` },
          ],
          reads: {
            good: '"All reps and referrals, almost nothing online" → big gap, big upside. Good.',
          },
        },
        {
          id: 'disc-q3',
          role: 'question',
          label: 'Q3 — the AI test, said back to him.',
          lines: [
            { say: `When somebody asks ChatGPT for your kind of parts, have you ever typed it in yourself?` },
            { note: `"No" → "Try it after we hang up. I'll tell you what I saw this morning: it named [competitor], not you."` },
            { note: `"Yeah, and we don't show up" → "Right, so you've already felt it. That's exactly the leak I called about. It's fixable, and that's the whole conversation."` },
          ],
        },
        {
          id: 'disc-q4',
          role: 'question',
          label: 'Q4 — the catalog.',
          lines: [
            { say: `On your own site, can a buyer find a part by part number or spec and get a price? Or does most of it route to 'call for a quote'?` },
            { note: `"Mostly quote-only, search is rough" → "That's exactly why the AI skips you. And it's fixable."` },
            { note: `"Actually our site's good, you can search by part number and see pricing" → "Good. Then your catalog's not the problem. Your problem's the other half: whether the AI knows to trust it and pull your name into the answer. That's the part I'd dig into."` },
          ],
        },
        {
          id: 'disc-q5',
          role: 'question',
          label: 'Q5 — the line-card threat.',
          lines: [
            { say: `Are you losing any line-card business to Amazon, or to the manufacturer selling direct around you?` },
          ],
          reads: {
            good: '"Yeah, that\'s real" → the villain is named and felt. You\'re close.',
          },
        },
        {
          id: 'disc-q6',
          role: 'question',
          label: 'Q6 — the size of the leak (only if it\'s flowing).',
          lines: [
            { say: `Ballpark, what's a typical order or quote worth to you? Hundreds, low thousands, more?` },
            { note: `This sizes the leak in his own head, without you quoting anything. A few missed quotes a month at $4K each lands harder than any pitch you could make.` },
          ],
        },
        {
          id: 'disc-bridge',
          role: 'callout',
          label: 'Bridge into the pitch (when discovery goes well)',
          when: 'Don\'t slide into a pitch. Ask for it. This buyer respects that.',
          lines: [
            { say: `Okay, I've got enough. Want me to tell you in three lines what I'd actually do about it?` },
            { note: `(Yes → Stage 4.)` },
          ],
        },
        {
          id: 'disc-disqualify',
          role: 'branch',
          label: 'Disqualify branch — under $5M, handled with respect',
          when: 'If revenue is clearly under the floor — small shop, one location, "it\'s just me and two guys" — don\'t take the call. Don\'t sell him something he can\'t use yet.',
          lines: [
            { say: `Straight with you. What I do is built for distributors and manufacturers doing eight figures and up, where a few extra quotes a month pays for the work. At your size, I'd be selling you something you don't need yet. Here's what I'd actually do in your shoes. Go to ChatGPT, ask it who sells your parts in your area, see what it says. If your name's not there, get your products onto real pages with real specs and prices. That one move does most of the work, for free.` },
            { note: `Then capture the referral the script just earned:` },
            { say: `Give me your email and I'll send you a one-pager on those free fixes. No follow-up, no pitch. When you cross eight figures, you'll already have it. Fair?` },
            { note: `(Get the email. Send the Stage 6 email, trimmed to the free-fixes version. He remembers the guy who told him the truth and saved him money. That's a referral, and a future client.)` },
          ],
        },
        {
          id: 'disc-disengage',
          role: 'branch',
          label: 'Disengage branch — wrong fit, real objection',
          when: 'If he\'s genuinely not the buyer, or genuinely not interested after the hook, leave clean:',
          lines: [
            { say: `Fair enough. Sounds like this isn't a now thing. I'll send you the one screenshot of what the AI said so you've got it. If it changes, you know where I am. Appreciate the minute.` },
          ],
        },
      ],
    },

    {
      id: 'pitch',
      title: 'Pitch (short, plain, name what you don\'t do)',
      goal: 'Only pitch after he\'s confirmed at least one real pain and said yes to the bridge. Three lines of what you do, then the trust line. Demote every piece of jargon. You\'re not explaining the work on a cold call. You\'re earning a Growth Call.',
      segments: [
        {
          id: 'pitch-three-lines',
          role: 'primary',
          label: 'Three lines of what you do',
          lines: [
            { say: `Here's the whole thing in three lines.` },
            { say: `One. I make you the company the AI names when buyers ask for your parts, so you get found before they find a competitor or Amazon.` },
            { say: `Two. I fix your site so it actually answers them. Searchable by part number and spec, real product pages the AI can read. You stop losing quotes you already earned.` },
            { say: `Three. One team builds it and runs it. Not ten vendors you have to herd. One operator, one system.` },
          ],
        },
        {
          id: 'pitch-dont-do',
          role: 'callout',
          label: 'Then name what you don\'t do. Fastest trust signal for this buyer.',
          lines: [
            { say: `And so you know what this isn't. I'm not selling you guaranteed rankings. Nobody honest can. I'm not a big agency that hands you off to a 24-year-old. It's me on your account. If your category's too small or your catalog's a lost cause, I'll tell you on the next call instead of taking your money.` },
            { note: `(Stop. Let it sit. Then the close.)` },
          ],
        },
      ],
    },

    {
      id: 'close',
      title: 'Close (book the Growth Call)',
      goal: 'One ask. Small and specific. The written diagnostic is the lower door, offered only if he hesitates.',
      segments: [
        {
          id: 'close-direct-ask',
          role: 'primary',
          label: '5A — The direct ask',
          lines: [
            { say: `So here's what I'd suggest. Not a sales meeting, a Growth Call. Thirty minutes. I'll walk you through exactly what I'm seeing. What the AI says about your category, where you're leaking quotes, and the two or three things I'd fix first.` },
            { say: `I've got Thursday morning or Friday afternoon open. Which is easier?` },
            { note: `(Then stop talking. The next person to speak names a time.)` },
          ],
        },
        {
          id: 'close-ask-picks-time',
          role: 'branch',
          label: '5A → Picks a time',
          lines: [
            { note: `→ 5C, lock it.` },
          ],
        },
        {
          id: 'close-ask-cost',
          role: 'branch',
          label: `5A → "How much does this cost?"`,
          lines: [
            { note: `→ 5D.` },
          ],
        },
        {
          id: 'close-ask-send-first',
          role: 'branch',
          label: `5A → "Send me something first."`,
          lines: [
            { note: `→ 5B.` },
          ],
        },
        {
          id: 'close-ask-partner',
          role: 'branch',
          label: `5A → "I'd need my [partner / GM / son] in on it."`,
          lines: [
            { say: `Smart, bring him. Thirty minutes, whoever needs to hear it. What morning works for both of you?` },
            { note: `→ 5C.` },
          ],
        },
        {
          id: 'close-lower-door',
          role: 'branch',
          label: '5B — The lower door (written diagnostic)',
          when: 'If a live call is too much, offer the written version. Same value, no calendar.',
          lines: [
            { say: `No problem, let's not even book a call yet. I'll run a short written diagnostic on you. What the AI says about your category, where I see quotes leaking, in writing. You read it on your own time. If it's worth a conversation after, we book one. If not, you keep it. Fair?` },
            { note: `(Get the email. Confirm it back. Set a real follow-up: "I'll have it to you by Tuesday, and I'll check in Thursday. That work?")` },
          ],
        },
        {
          id: 'close-lock-time',
          role: 'primary',
          label: '5C — Lock the time and set the agenda',
          when: 'Once he names a slot, make it stick:',
          lines: [
            { say: `Done, Thursday at 9. I'll send a calendar hold. Which email? … Got it. I'll come with your category pulled up live, the spots where I see quotes slipping, and the two or three things I'd fix first. Bring whoever runs the website if you want them on. Thirty minutes, hard stop. Talk Thursday, [Owner].` },
            { note: `(Say the day, time, and email back to him out loud before you hang up. Confirmed appointments survive. Vague yeses don't.)` },
          ],
        },
        {
          id: 'close-how-much',
          role: 'branch',
          label: '5D — "How much does this cost?"',
          when: 'Don\'t loop on "it depends." Acknowledge the dodge, give him a floor, then steer back.',
          lines: [
            { say: `I know 'it depends' is annoying, so let me be straight. It's not a $500 thing and it's not a $50K thing. Where it lands depends on your catalog and what you actually need, and I won't pin it tighter without seeing it. That'd be guessing, and you'd catch me guessing. That's what the Growth Call's for. Thursday or Friday?` },
            { note: `(If he keeps pushing for a number: "Honestly, I price it after I see the catalog, not before. If that's a dealbreaker, tell me now and I won't waste your Thursday." Then quiet.)` },
          ],
        },
      ],
    },
  ],
}
