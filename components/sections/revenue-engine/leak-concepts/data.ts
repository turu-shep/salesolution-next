/**
 * Content for the four "TheLeak" replacement concepts, shown side by side on
 * /revenue-engine/leak-concepts/ for a pick-the-winner review.
 *
 * Three verticals on purpose: home-services (response-speed leak), medical
 * (elective + chair-time leak), retail (findability + repeat leak) — they
 * stress the concepts differently. Numbers trace to the researched stat bank;
 * anything not measured is labelled, never drawn as a fake proportion.
 */

export type Vertical = 'home-services' | 'medical' | 'retail'

export const VERTICALS: { key: Vertical; tab: string }[] = [
  { key: 'home-services', tab: 'Home services' },
  { key: 'medical', tab: 'Medical & aesthetics' },
  { key: 'retail', tab: 'Retail & brands' },
]

/** Concept 1 — annotated timeline. gapBefore renders a "dead time" spacer above the row. */
export type TimelineStep = {
  time?: string
  line: string
  sub?: string
  tone?: 'loss' | 'booked'
  gapBefore?: string
}

/** Concept 2 — evidence cards. One styled "artifact" + a column of copy. */
export type EvidenceRow = { left: string; right?: string; flag?: boolean }
export type EvidenceCard = {
  chrome: string
  rows: EvidenceRow[]
  annotation?: string
  kicker: string
  label: string
  body: string
  source?: string
}

/** Concept 3 — your-numbers calculator. */
export type CalcInput = {
  key: string
  label: string
  value: number
  format: 'number' | 'percent' | 'dollar'
  assumption?: string
}
export type CalcConfig = {
  inputs: CalcInput[]
  multiplier: number
  formula: string
  resultLabel: string
  sourceCaption: string
}

/** Concept 4 — same lead, two endings. */
export type Outcome = { time?: string; line: string; tone?: 'loss' | 'booked' }

export type LeakData = {
  label: string
  eyebrow: string
  headlineA: string
  headlineB: string
  intro: string
  closer: string
  timeline: { kicker: string; steps: TimelineStep[]; sourceCaption: string; note: string }
  evidence: { cards: EvidenceCard[]; note: string }
  calc: CalcConfig
  beforeAfter: {
    leftLabel: string
    rightLabel: string
    lost: Outcome[]
    won: Outcome[]
    sourceCaption: string
    note: string
  }
}

/** Optional per-section header override, so a saved concept can be reused with its own framing. */
export type HeaderOverride = Partial<
  Pick<LeakData, 'eyebrow' | 'headlineA' | 'headlineB' | 'intro' | 'closer'>
>

export const LEAK_DATA: Record<Vertical, LeakData> = {
  'home-services': {
    label: 'Home services',
    eyebrow: 'The three leaks',
    headlineA: 'Three places you lose customers.',
    headlineB: 'Most owners only fix one.',
    intro:
      'Before they reach you, when they reach you, and after they buy. The leak is bigger than the missed call.',
    closer: 'Every one of these is a customer you already had the right to win.',
    timeline: {
      kicker: 'How one job leaks',
      steps: [
        { time: '7:48 AM', line: 'A roof-estimate request comes in.', sub: 'They message two other roofers in the same minute.' },
        { time: '8:05 AM', line: "You're up on a roof. The call goes to voicemail." },
        { time: '9:31 AM', line: 'A competitor calls them back first.' },
        { time: 'Next day', line: 'You finally call back. The line is dead.', gapBefore: '~a day passes' },
        { line: 'Booked. With whoever answered first.', tone: 'booked' },
      ],
      sourceCaption: 'Average reply to a new lead: 42 hours. 23% never reply at all. (HBR, 2011)',
      note: "A typical week, not one customer's record.",
    },
    evidence: {
      cards: [
        {
          chrome: 'Google · roofers near me',
          rows: [
            { left: '1.  Apex Roofing', right: '4.9 ★ · 212 reviews' },
            { left: '2.  Summit Exteriors', right: '4.8 ★ · 167 reviews' },
            { left: '3.  Crown Roofing', right: '4.8 ★ · 143 reviews' },
            { left: '5.  You', right: 'below the fold', flag: true },
          ],
          annotation: 'where they look first',
          kicker: 'Bring · They never find you',
          label: "You're not in the top three",
          body: '42% of local clicks go to the first three results. They search for a roofer near them and never scroll to you.',
          source: 'Backlinko, local search study',
        },
        {
          chrome: 'iPhone · Recents',
          rows: [
            { left: 'Missed', right: '8:05 AM', flag: true },
            { left: 'Missed', right: '8:31 AM', flag: true },
            { left: 'Missed', right: '9:14 AM', flag: true },
            { left: 'Missed', right: '11:02 AM', flag: true },
            { left: 'Voicemail', right: '1:20 PM' },
          ],
          annotation: 'nobody called these back',
          kicker: 'Sell · They reach you, then slip through',
          label: 'Four missed calls before lunch',
          body: 'The crew is on a roof and the office is one person. Each missed call dials the next contractor on the list.',
          source: 'As many as 1 in 3 calls go unanswered',
        },
        {
          chrome: 'CRM · Past customers',
          rows: [
            { left: 'J. Alvarez', right: 'Roof replaced 2 yr ago · no contact', flag: true },
            { left: 'T. Okafor', right: 'Repair 18 mo ago · no contact', flag: true },
            { left: 'M. Cole', right: 'Won, then silent 14 mo', flag: true },
          ],
          kicker: 'Retain · They never come back',
          label: 'The customers you already won, gone quiet',
          body: 'Repeat work and referrals are the cheapest jobs you can book. Nobody followed up, so they call whoever shows up next time.',
          source: 'A 5% lift in repeat business raises profit 25–95% (Bain / HBR)',
        },
      ],
      note: 'Reconstructed from real audits. Names and numbers changed.',
    },
    calc: {
      inputs: [
        { key: 'missed', label: 'Calls you miss in a week', value: 12, format: 'number', assumption: 'on jobs, after hours, at lunch' },
        { key: 'close', label: "Jobs you'd win if you reached them", value: 30, format: 'percent', assumption: 'your close rate' },
        { key: 'value', label: 'Your average job', value: 1800, format: 'dollar' },
      ],
      multiplier: 52,
      formula: 'missed calls × close rate × average job × 52 weeks',
      resultLabel: 'walks out the door a year',
      sourceCaption: '23% of leads never get a reply. (HBR, 2011)',
    },
    beforeAfter: {
      leftLabel: 'Without a system',
      rightLabel: 'When the call gets answered',
      lost: [
        { time: '7:48 AM', line: 'Roof-estimate request comes in.' },
        { time: '8:05 AM', line: 'You’re on a roof. Voicemail.' },
        { time: 'Next day', line: 'You call back.' },
        { line: 'Gone. Booked someone else.', tone: 'loss' },
      ],
      won: [
        { time: '7:48 AM', line: 'Same request comes in.' },
        { time: '7:48 AM', line: 'Answered in seconds.' },
        { time: '9:00 AM', line: 'Site visit booked.' },
        { line: 'Booked. Same hour.', tone: 'booked' },
      ],
      sourceCaption: 'Average reply to a new lead: 42 hours. (HBR, 2011)',
      note: 'Same lead. The only thing that changed is who answered first.',
    },
  },

  medical: {
    label: 'Medical & aesthetics',
    eyebrow: "The practice's leak",
    headlineA: 'Your busiest hours',
    headlineB: 'are your leakiest.',
    intro:
      "Most owners blame the marketing. It is almost never the marketing. It is the calls during treatment nobody could pick up, and the high-value plans nobody circled back on.",
    closer: 'Every one of these is revenue you already earned the right to.',
    timeline: {
      kicker: 'How one patient leaks',
      steps: [
        { time: '11:40 AM', line: 'A new-patient call comes in during a hygiene appointment.', sub: 'A $6,000 case, comparing two practices.' },
        { time: '11:41 AM', line: 'The front desk is chairside. Voicemail.' },
        { time: '11:52 AM', line: 'They call the practice down the road.' },
        { time: 'Two days later', line: 'You call back. They are already in someone else’s chair.', gapBefore: 'two days pass' },
        { line: 'Booked. Somewhere that answered.', tone: 'booked' },
      ],
      sourceCaption: 'Industry-average reply to a new patient: 47 hours. (LeadSync, 2026)',
      note: "A typical week, not one patient's record.",
    },
    evidence: {
      cards: [
        {
          chrome: 'iPhone · Recents',
          rows: [
            { left: 'Missed', right: '10:12 AM', flag: true },
            { left: 'Missed', right: '11:40 AM', flag: true },
            { left: 'Missed', right: '2:05 PM', flag: true },
            { left: 'Voicemail', right: '3:30 PM' },
          ],
          annotation: 'all during chair time',
          kicker: '01 · The call during chair time',
          label: 'Missed calls while the chair is full',
          body: 'Your busiest hours are when new patients call. The front desk is already with someone.',
          source: 'As many as 1 in 3 calls go unanswered',
        },
        {
          chrome: 'PMS · Recall',
          rows: [
            { left: 'R. Alvarez', right: 'Last seen 16 mo · no contact', flag: true },
            { left: 'T. Okafor', right: 'Last seen 14 mo · no contact', flag: true },
            { left: 'J. Lin', right: 'Last seen 13 mo · no contact', flag: true },
          ],
          kicker: '02 · The patients who drifted',
          label: 'Overdue recall nobody followed up',
          body: 'A large share of your base is dormant. The reminder never went out, so they never came back.',
        },
        {
          chrome: 'Treatment plans',
          rows: [
            { left: '$5,400 implant', right: 'Presented · no follow-up · 19 days', flag: true },
            { left: '$2,800 crown', right: 'Presented · no follow-up · 9 days', flag: true },
          ],
          kicker: '03 · The plan presented once',
          label: 'High-value plans that went quiet',
          body: 'The plan was presented, the patient said they would think about it, and no one circled back.',
        },
      ],
      note: 'Reconstructed from real audits. Names and numbers changed.',
    },
    calc: {
      inputs: [
        { key: 'missed', label: 'New-patient calls you miss in a week', value: 8, format: 'number', assumption: 'during treatment, after hours' },
        { key: 'close', label: "Who'd book if you reached them", value: 35, format: 'percent' },
        { key: 'value', label: 'First-year value of a patient', value: 1200, format: 'dollar' },
      ],
      multiplier: 52,
      formula: 'missed calls × book rate × first-year value × 52 weeks',
      resultLabel: 'leaves the schedule a year',
      sourceCaption: 'Industry-average reply to a new patient: 47 hours. (LeadSync, 2026)',
    },
    beforeAfter: {
      leftLabel: 'Without a system',
      rightLabel: 'When the call gets answered',
      lost: [
        { time: '11:40 AM', line: 'New-patient call during chair time.' },
        { time: '11:41 AM', line: 'Voicemail.' },
        { time: 'Two days', line: 'You call back.' },
        { line: 'Already in someone else’s chair.', tone: 'loss' },
      ],
      won: [
        { time: '11:40 AM', line: 'Same call comes in.' },
        { time: '11:40 AM', line: 'Answered, every time.' },
        { time: 'Same day', line: 'New patient booked.' },
        { line: 'On the schedule.', tone: 'booked' },
      ],
      sourceCaption: 'Industry-average reply: 47 hours. (LeadSync, 2026)',
      note: 'Same patient. The only thing that changed is who answered first.',
    },
  },

  retail: {
    label: 'Retail & brands',
    eyebrow: "The shop's leak",
    headlineA: "They're searching for you.",
    headlineB: "They're finding someone else.",
    intro:
      "Most of what a local shop could earn never shows up as a sale. It leaks where you can't see it, and almost nobody plugs it.",
    closer: 'Every one of these is a customer you already earned, handed to someone else.',
    timeline: {
      kicker: 'How one customer leaks',
      steps: [
        { time: 'Tue 6:40 PM', line: 'They search "wood flooring brooklyn." You’re on page two.', sub: 'The top three get the clicks.' },
        { time: 'Tue 6:41 PM', line: 'They click a competitor in the map pack.' },
        { time: 'Thu', line: 'They buy elsewhere. You never knew they were looking.', gapBefore: 'they shop around for days' },
        { line: 'And last year’s customer? Never heard from again.', tone: 'loss' },
      ],
      sourceCaption: '42% of local clicks go to the top three results. (Backlinko)',
      note: "A typical week, not one customer's record.",
    },
    evidence: {
      cards: [
        {
          chrome: 'Google · Maps',
          rows: [
            { left: '1.  Modern Floors Co', right: '4.9 ★' },
            { left: '2.  Brooklyn Hardwood', right: '4.8 ★' },
            { left: '3.  Kings County Flooring', right: '4.7 ★' },
            { left: '6.  You', right: 'below the fold', flag: true },
          ],
          annotation: 'you, below the fold',
          kicker: '01 · Not in the top three',
          label: 'Your own neighborhood can’t find you',
          body: '42% of local clicks go to the first three. You are competing for the scraps below.',
          source: 'Backlinko, local search study',
        },
        {
          chrome: 'Analytics · Visitors',
          rows: [
            { left: 'First-time · 2 pages', right: 'Left', flag: true },
            { left: 'First-time · 1 page', right: 'Left', flag: true },
            { left: 'First-time · 3 pages', right: 'Left', flag: true },
          ],
          kicker: '02 · The shoppers who looked and left',
          label: 'They came, looked, and left',
          body: 'Most first-time visitors leave without buying. With no way to follow them, that interest is gone.',
        },
        {
          chrome: 'Customers',
          rows: [
            { left: 'A. Reyes', right: 'Last order 14 mo · never contacted', flag: true },
            { left: 'M. Cohen', right: 'Last order 11 mo · never contacted', flag: true },
          ],
          kicker: '03 · The customers you already won',
          label: 'The list that just sits there',
          body: 'A 5% lift in repeat business raises profit 25–95%. The people who already bought never hear from you.',
          source: 'Reichheld, Bain / HBR',
        },
      ],
      note: 'Reconstructed from real audits. Names and numbers changed.',
    },
    calc: {
      inputs: [
        { key: 'lapsed', label: "Customers who haven't returned (a month)", value: 60, format: 'number', assumption: 'bought once, never came back' },
        { key: 'rate', label: "Who'd buy again if asked", value: 20, format: 'percent' },
        { key: 'ticket', label: 'Your average order', value: 140, format: 'dollar' },
      ],
      multiplier: 12,
      formula: 'lapsed customers × win-back rate × average order × 12 months',
      resultLabel: 'in repeat business you never ask for',
      sourceCaption: 'A 5% lift in repeat business raises profit 25–95%. (Bain / HBR)',
    },
    beforeAfter: {
      leftLabel: 'Without a system',
      rightLabel: 'When you show up and follow up',
      lost: [
        { line: 'They search. You’re on page two.' },
        { line: 'They click a competitor.' },
        { line: 'They buy elsewhere.' },
        { line: 'You never knew.', tone: 'loss' },
      ],
      won: [
        { line: 'They search. You’re in the top three.' },
        { line: 'They look, they leave.' },
        { line: 'A reason to come back finds them.' },
        { line: 'They buy from you.', tone: 'booked' },
      ],
      sourceCaption: '42% of local clicks go to the top three. (Backlinko)',
      note: 'Same shopper. The only thing that changed is whether you showed up and followed up.',
    },
  },
}
