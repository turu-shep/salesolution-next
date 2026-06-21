import type { Skill } from './types'

const M = '/sales/psychology'

/**
 * The skill set, grouped by category. Each skill lists the params to master (the
 * components), the observable "proficient when" criteria, and drills. The learner
 * tracks a level per skill on the dashboard. Grounded in the call scripts and the
 * psychology manual (linked).
 */
export const SKILLS: Skill[] = [
  // ── Foundations ───────────────────────────────────────────────────────────
  {
    id: 'two-motions',
    category: 'foundations',
    name: 'The two motions & the one rule',
    summary: "Which call you're on, and the only thing it's for: book the next step, never sell.",
    params: [
      'Revenue Engine → roofers / HVAC / plumbers / dentists → book the Revenue Leak Audit',
      'Industrial → distributor / manufacturer owners ($5M–$75M) → book the Growth Call',
      "The one rule: you're booking, not closing — no price, no full-system pitch on the dial",
      'Never mix the two scripts or the two lists',
    ],
    proficientWhen: [
      'You can say in one sentence what each motion books and why you never sell on the cold call',
      'You never quote a price or pitch the whole system on a dial',
    ],
    drills: [
      "Say it before every block, out loud: \"I'm booking, not closing.\"",
      'Write the two motions and their CTAs from memory',
    ],
    link: { label: 'Cockpit', href: '/sales/playbook' },
  },
  {
    id: 'know-your-offer',
    category: 'foundations',
    name: 'Know your offer cold',
    summary: 'What the audit / Growth Call is, the terms, the guarantee — verbatim where it matters.',
    params: [
      'The Revenue Leak Audit: free, ~20 minutes, their numbers to keep either way',
      "The Growth Call: 30 minutes, what you'll show them",
      'The verbatim blocks — guarantee, terms, audit offer — word for word',
      "What you DON'T do: no markup on ads, no reselling leads, no lock-in",
    ],
    proficientWhen: [
      'You can state the guarantee and the terms verbatim, without notes',
      'You can explain the offer in plain words a tired owner gets in ten seconds',
    ],
    drills: [
      'Cover the page and recite the guarantee + terms verbatim',
      'Explain the audit to a friend in two sentences',
    ],
    link: { label: 'Cockpit', href: '/sales/playbook' },
  },
  {
    id: 'pre-call-check',
    category: 'foundations',
    name: 'The pre-call leak / AI check',
    summary: 'Find the one true thing before you dial — the leak (Revenue Engine) or the AI answer (industrial).',
    params: [
      'Revenue Engine: call their line, time the callback, check the Google profile + site',
      'Industrial: ask ChatGPT / Google AI who sells their parts; check whether their catalog is searchable',
      'Write the one finding at the top of the contact card',
      'Only ever claim what you actually observed — no bluffing a finding',
    ],
    proficientWhen: [
      'Every contact has a real, specific finding written before you dial',
      "You never bluff a leak you didn't actually check",
    ],
    drills: [
      'Run the full pre-call check on 5 prospects and write the opener line for each',
      'Time yourself: a clean check in under 3 minutes',
    ],
    link: { label: 'Cockpit pre-call card', href: '/sales/playbook' },
  },

  // ── Voice & English ───────────────────────────────────────────────────────
  {
    id: 'vocal-warmup',
    category: 'voice',
    name: 'Vocal warmup & stamina',
    summary: 'Warm the voice before a block and protect it so it lasts 60–90 minutes without strain.',
    params: [
      '5-min warmup before every block: straw/"ooo" phonation, gentle hums, lip trills, pitch glides (sirens) — all easy, no pushing',
      'Hydrate (~64 oz/day, sip steadily); breathe low from the belly; never push volume from the throat',
      'Water + 30–60s of silence every ~20–30 min; micro-rest between dials; cool down after a long block',
      'Throat-clearing harms the cords — sip and swallow instead. Don’t whisper to rest (soft easy speech is gentler)',
      'Red flags → stop and see an ENT/SLP: pain, hoarseness lasting >2 weeks, or voice loss',
    ],
    proficientWhen: [
      'Your voice still feels fine at the end of a 60-minute block',
      'You warm up every single time, without skipping it',
    ],
    drills: [
      'Do the 5-min warmup daily, even off the phone, until it’s automatic',
      'Belly-breath check: hand on belly, inhale so it pushes out, exhale slow on "sss" — 5 reps before each block',
      'Record the first and last call of a block — your voice should sound the same',
    ],
  },
  {
    id: 'pace-pause',
    category: 'voice',
    name: 'Pace & the pause',
    summary: 'Slow down on purpose; let silence do the work after a question or the ask.',
    params: [
      'A deliberately slow first sentence — slower than feels natural',
      'The 3-second pause after a question or the ask (count it in your head)',
      'Breathe at phrase boundaries, not mid-thought',
      "Don't rush to fill silence — that's the prospect's turn",
    ],
    proficientWhen: [
      'You hold a full 3-second pause after the ask without caving',
      'A recording of you sounds calm and unhurried, not fast',
    ],
    drills: [
      'Read the opener at half your instinct speed; record and check it still sounds natural',
      "Count \"one, two, three\" in your head after every ask before you speak again",
    ],
    link: { label: 'Manual: tonality', href: `${M}#tonality-and-delivery-the-voice-is-the-instrument` },
  },
  {
    id: 'clarity',
    category: 'voice',
    name: 'Clarity & enunciation (non-native)',
    summary: 'Be understood the first time — crisp consonants, the right stressed word, easy-to-say lines.',
    params: [
      'Prosody first: stress, rhythm, and intonation matter more for being understood than perfect individual sounds',
      'Hit the content words (nouns, verbs, numbers); let the small words (the, of, to, a) go light and quick',
      'Script exact lines so you improvise less — lower mental load means clearer speech and less strain',
      'Rewrite lines around sounds that trip you; pick easy, common words ("use," not "utilize")',
      'Handle "sorry, say that again?" by slowing down and re-saying — never speeding up or apologizing',
    ],
    proficientWhen: [
      'A stranger understands every word of your opener on the first listen',
      "You don't stumble on your scripted lines",
    ],
    drills: [
      'Shadow a clear, slow speaker 10–15 min/day — repeat aloud, copy the rhythm and intonation',
      "Record your opener; have someone mark any word they didn't catch; drill those words",
      'Mark the stressed word + a ↓ on the last word of each scripted line; practice landing them',
    ],
    link: { label: 'Manual: tonality', href: `${M}#tonality-and-delivery-the-voice-is-the-instrument` },
  },
  {
    id: 'tonality',
    category: 'voice',
    name: 'Tonality: calm, confident, warm',
    summary: 'On a cold call the voice carries most of it — calm, downward inflection, zero neediness.',
    params: [
      'Downward inflection — statements end down, not up like a question',
      'Kill upspeak and neediness (fast + rising = "please buy from me")',
      'Warmth — the smile they can hear in your voice',
      'Match their energy first, then lead it down to calm',
    ],
    proficientWhen: [
      'Your statements land down, not as questions',
      "You sound like you're not in a hurry and don't need the booking",
    ],
    drills: [
      '"Hey, is this Mike?" — record it until it sounds warm and calm',
      'Say one line rising, then falling; feel and hear the difference',
    ],
    link: { label: 'Manual: tonality', href: `${M}#tonality-and-delivery-the-voice-is-the-instrument` },
  },

  // ── The call ──────────────────────────────────────────────────────────────
  {
    id: 'the-open',
    category: 'the-call',
    name: 'The opener',
    summary: 'Leak first, you second, the ask third — with an easy out baked in.',
    params: [
      'The observed finding first, who you are second, the small ask third',
      "The easy out folded in (\"figured you were out on a job\")",
      'A soft assumption ("might"), never a hard guess that could be wrong',
      'Pick the opener variant that matches what you actually found',
    ],
    proficientWhen: [
      'You open on the observed leak from memory, calm, in under 20 seconds',
      'You hand the easy out before they have to reach for one',
    ],
    drills: [
      'Cover-and-say all 3 opener variants from memory',
      'Rotate verticals: a roofer, then a dentist, then a distributor',
    ],
    link: { label: 'Manual: orientation', href: `${M}#what-this-really-is-and-the-one-move-under-all-of-it` },
  },
  {
    id: 'discovery',
    category: 'the-call',
    name: 'Discovery & questions',
    summary: 'Ask, then shut up — make them say the problem and its cost in their own words.',
    params: [
      'Open questions ("what happens when a call comes in and you\'re on a roof?")',
      'Labels ("it sounds like the follow-up is where it slips")',
      'The pause after the question',
      'Let THEM name the leak and the cost, not you',
    ],
    proficientWhen: [
      'You ask, then stop — they fill the silence',
      'They name the leak in their own words',
    ],
    drills: [
      'Write 5 discovery questions for each motion',
      'On a role-play, count your words vs theirs — aim to say less',
    ],
    link: { label: 'Manual: questions & silence', href: `${M}#questions-silence-and-letting-them-sell-themselves` },
  },
  {
    id: 'the-pitch',
    category: 'the-call',
    name: 'The pitch (only when they’re in)',
    summary: "The mechanism in plain stakes plus what you don't do — short, because the audit sells, not you.",
    params: [
      'Only pitch after they’ve named a leak themselves',
      'The mechanism in plain stakes (the five things, in their words)',
      "What you DON'T do — the trust line",
      'Stop after the guarantee; don’t oversell',
    ],
    proficientWhen: [
      'You only pitch after they’ve admitted a leak',
      'You can give the mechanism + don’t-do list + guarantee cleanly, then stop',
    ],
    drills: [
      'Recite the five-part mechanism + don’t-do + guarantee from memory',
      'Practice stopping — say the guarantee, then go silent',
    ],
    link: { label: 'Cockpit (Pitch stage)', href: '/sales/playbook' },
  },
  {
    id: 'the-close',
    category: 'the-call',
    name: 'The close',
    summary: 'Book the next step, not the sale — a small, safe yes.',
    params: [
      'Shrink the yes ("20 minutes, free, you keep the numbers either way")',
      'Confirm the slot first, then get the contact',
      'Offer a when, not a whether (the assumptive next step)',
      'The three soft-closes: "think about it", "just email me", "I\'m slammed"',
    ],
    proficientWhen: [
      'You book the next step instead of selling the system',
      'You handle the three soft-closes without pushing',
    ],
    drills: [
      'Drill the slot-then-contact sequence',
      'Role-play each soft-close until the comeback is automatic',
    ],
    link: { label: 'Manual: the close', href: `${M}#the-close-as-a-chain-of-small-yeses` },
  },

  // ── Psychology ────────────────────────────────────────────────────────────
  {
    id: 'frames-status',
    category: 'psychology',
    name: 'Frames & status',
    summary: 'Hold your frame without arguing inside theirs; status through competence and calm.',
    params: [
      "Hold your frame when challenged — don't argue inside theirs",
      'Status from competence + calm, never dominance or one-upping',
      'Reframe "no" into "not yet / wrong fit"',
      'Stay owner-to-owner',
    ],
    proficientWhen: [
      "You don't get pulled into their frame under \"are you selling me something?\"",
      'You stay calm and certain when challenged',
    ],
    drills: ['Read the frames section; write 3 reframes for common pushbacks'],
    link: { label: 'Manual: frames & status', href: `${M}#frames-and-status-whose-reality-wins` },
  },
  {
    id: 'push-pull',
    category: 'psychology',
    name: 'Push / pull & disqualifying',
    summary: 'Calm indifference to the one outcome attracts; the honest takeaway is the strongest pull.',
    params: [
      "Calm indifference to this one booking (you have forty more names)",
      'The honest takeaway ("you might not be a fit — let me check")',
      'Disqualify when it’s true — the strongest pull there is',
      'Scarcity only when it’s literally real',
    ],
    proficientWhen: [
      'You can genuinely walk away, and it shows in your voice',
      "You disqualify a bad-fit prospect cleanly without stretching them into a maybe",
    ],
    drills: [
      'Once a day, disqualify someone you could have stretched',
      'Say your walk-away out loud before a block: "I\'m fine if half these aren\'t a fit."',
    ],
    link: { label: 'Manual: push / pull', href: `${M}#push-and-pull-attraction-by-takeaway` },
  },
  {
    id: 'authority',
    category: 'psychology',
    name: 'Authority',
    summary: 'Earn it through their own numbers, not bragging; diagnose before you prescribe.',
    params: [
      'Earn authority with a real fact you found, not credentials',
      'The doctor frame: diagnose before you prescribe; the doctor doesn’t chase',
      'Measure THEIR authority — do they actually decide?',
      'Strategic humility raises status, it doesn’t lower it',
    ],
    proficientWhen: [
      'You establish authority with the leak you found, not a pitch about yourself',
      'You qualify who actually decides, gracefully',
    ],
    drills: ['Practice the "is this your call, or is there a partner I\'d want in the room?" line'],
    link: { label: 'Manual: authority', href: `${M}#authority-measuring-theirs-earning-yours` },
  },
  {
    id: 'reading-room',
    category: 'psychology',
    name: 'Reading the room & the decision-maker',
    summary: 'Read temperature with no face; get the real decider into the conversation.',
    params: [
      'Read temperature from tone + answer length + whether they ask back',
      'Decision-maker vs influencer vs blocker',
      'Pull the decider in with micro-commitments and questions they must answer',
      'Get an absent decider into the audit, not relayed secondhand',
    ],
    proficientWhen: [
      'You can tell a soft no from a real one',
      'You get the real decider engaged, or into the room',
    ],
    drills: ['After each call, note: who actually decides, and did I reach them?'],
    link: { label: 'Manual: pulling the decision-maker in', href: `${M}#pulling-the-decision-maker-into-the-conversation` },
  },
  {
    id: 'threat-trust',
    category: 'psychology',
    name: 'Lowering the threat response',
    summary: 'A cold call trips their guard — lower it with permission, honesty, and never cornering them.',
    params: [
      'Permission up front ("ten seconds and you can hang up")',
      "Name what you DON'T do, early",
      'Honesty as a pattern-interrupt — the thing the spammer won’t do',
      'Never corner them; the moment they feel trapped, you’ve lost',
    ],
    proficientWhen: [
      'Burned buyers stay on the line past your first lines',
      'You never trigger fight-or-flight',
    ],
    drills: ['Drill the burned-buyer response from memory'],
    link: { label: 'Manual: lowering the threat response', href: `${M}#lowering-the-threat-response-trust-at-the-speed-of-a-cold-call` },
  },
  {
    id: 'objection-handling',
    category: 'psychology',
    name: 'Objection handling',
    summary: 'Hear what the objection really is, agree then redirect, one re-ask then let go.',
    params: [
      'Tell what an objection is — reflex, test, request for reassurance, or real constraint',
      "Agree first, then redirect — never argue",
      'Pre-empt the predictable ones before they’re raised',
      'One re-ask, then route to email or the door — no third push',
    ],
    proficientWhen: [
      'You take the 6 most common objections live without arguing',
      'You let a soft no go after one re-ask, calmly',
    ],
    drills: [
      'Use the cockpit objection search live — hit "/" and read the card',
      'Role-play the top objections per motion until the comeback is automatic',
    ],
    link: { label: 'Manual: objections', href: `${M}#objections-as-psychology-what-theyre-really-saying` },
  },

  // ── Your head ─────────────────────────────────────────────────────────────
  {
    id: 'your-state',
    category: 'your-head',
    name: 'Your head: nerves, neediness, recovery',
    summary: "Outcome-independence is the root skill — there's always another owner on the next dial.",
    params: [
      'Outcome-independence — the next dial matters more than this one',
      'A pre-block ritual to get calm and into state',
      "Not taking \"no\" personally",
      'Recovering fast after a brutal call so it doesn’t poison the next ten',
    ],
    proficientWhen: [
      "A bad call doesn't bleed into the next three",
      "You dial calm because there's always another owner",
    ],
    drills: [
      'The 10-second reset after a bad call (breath, shoulders, next card)',
      'Write a weekly booking target, not a per-call one',
    ],
    link: { label: 'Manual: your own head', href: `${M}#your-own-head-neediness-abundance-and-recovering-from-a-bad-call` },
  },
]
