import type { Category, DentistOffer, SectionMeta } from './types'

/**
 * The dentist offer as a product sheet — what the install contains, category by
 * category, with the value of each deliverable. Rendered by
 * components/strategy/DentistOfferSheet.tsx at /strategy/offers/dentist/.
 *
 * Migrated 2026-07-28 from the markdown module it replaced
 * (lib/strategy/docs/dentist-offer-sheet.ts, deleted). Content is byte-preserved:
 * every fact, number, source name, quote, and rule sentence carried over as-is.
 * Only the structure changed — paragraphs became labeled rows.
 *
 * Editing rules: `figure` is a pull-out of a sentence-leading amount only, so
 * `figure + ' ' + detail` must still read as the original sentence. `source`
 * holds the parenthetical attribution that trailed the sentence. Re-verify
 * against docs/strategy/offer-research/ before changing any quoted block.
 */

const WEB_AND_PRESENCE: Category = {
  number: '1',
  name: 'Web and presence',
  stages: ['CAPTURE'],
  purpose:
    'Turns high-value searches into booked consults, on assets the practice keeps. This is the CAPTURE stage, and it starts on day 1 because it has the longest lag.',
  deliverables: [
    {
      name: 'A new website.',
      what: "A 10–20 page custom build, in the practice's name.",
      whyItMatters:
        'Every ad, article, and profile in the install points at this site. It is the only asset in the install a practice can lose by not owning it.',
      value: [
        {
          label: 'Bought alone',
          figure: '$6,000–$20,000',
          detail: 'bought alone at 2026 market rates.',
          source:
            "Clutch's web-design pricing guide, cross-checked against published agency package rates",
          tier: 'verified',
        },
        {
          label: 'Dental-specific range',
          detail: 'Dental-specific estimates run $3,500–$30,000+.',
          tier: 'none',
        },
        {
          label: 'Subscription alternative',
          detail:
            'The subscription alternative has no published price at all: three dental-site vendors checked on 2026-07-27 quote only, so buying that way means renting the site.',
          tier: 'none',
        },
      ],
    },
    {
      name: 'The accessibility compliance build.',
      what: 'WCAG 2.1 AA plus the policy pack, built into the site rather than bolted on.',
      whyItMatters:
        'A practice that skips it is exposed on the one surface a plaintiff can review without ever walking in the door.',
      value: [
        {
          label: 'Bought alone',
          figure: 'Roughly $2,500–$7,500',
          detail:
            'for the build, sitting inside published vendor pricing: an audit at $2,000–$7,000, a small-business audit-plus-fix at $1,500–$3,500, remediation at $250–$550 a page.',
          source: 'all directional, all priced by firms that sell remediation',
          tier: 'directional',
        },
        {
          label: 'Cost of inaction',
          detail:
            "Florida recorded 961 federal website-accessibility filings in 2025, second behind New York's 1,021 and nearly double its own 470 in 2024, against 3,117 nationally, up 27%.",
          source: 'Seyfarth Shaw ADA Title III tracker, March 2026',
          tier: 'none',
        },
        {
          label: 'Overlays',
          detail:
            "Overlay widgets don't protect — a quarter of 2024's accessibility suits landed on sites already running one, and the FTC took a $1,000,000 order against the largest overlay vendor in April 2025 for claiming automatic compliance.",
          tier: 'none',
        },
        {
          label: 'Legal hook',
          detail:
            'The legal hook is universal: a dental office is a public accommodation under ADA Title III, 42 U.S.C. §12181(7)(F), settled by Bragdon v. Abbott, 524 U.S. 624 (1998) — a service case against a dental practice, never a website ruling.',
          tier: 'none',
        },
        {
          label: 'Medicaid scope',
          detail:
            "Scoped separately: practices billing Medicaid or CHIP have until May 11, 2027 to meet WCAG 2.1 AA, or May 10, 2028 under 15 employees, which covers about 43% of dentists per HHS's own analysis. Not every practice. Not a deadline that has passed.",
          source: 'HHS §504, 89 FR 40066, extended by 91 FR 25496',
          tier: 'none',
        },
      ],
    },
    {
      name: 'Service pages that quote a monthly payment.',
      what: 'Treatment pages that present a monthly number instead of a sticker price.',
      whyItMatters:
        'Patients price the money before they price the procedure, and a sticker price ends the conversation.',
      value: [
        {
          label: 'Page copy',
          detail:
            'Page copy prices separately at roughly $60–$300 a page, or $400–$1,200 for one optimized dental page of 750–1,000 words.',
          tier: 'directional',
        },
        {
          label: 'Reconciliation',
          detail:
            'It is folded into the website row in the reconciliation rather than counted twice.',
          tier: 'none',
        },
        {
          label: 'Cost of inaction',
          detail:
            '58% of dental patients say care is not affordable, 67% research financing against 58% researching the procedure itself, and 49% are very or extremely likely to use financing once the cost reaches $1,000.',
          source: 'CareCredit/Synchrony, Dental Lifetime of Care',
          tier: 'none',
        },
      ],
    },
    {
      name: 'Google Business Profile overhaul.',
      what: 'The profile rebuilt and kept current, owned by the practice.',
      whyItMatters:
        'It is the first thing a nearby search shows, and often the only thing a patient reads before dialing.',
      value: [
        {
          label: 'Bought alone',
          figure: 'Roughly $300–$500',
          detail:
            'one-time and $125–$400 a month to manage, directional vendor pricing; the published ceiling for managed local work is $799–$1,299 a month per location.',
          tier: 'directional',
        },
        {
          label: 'Cost of inaction',
          detail:
            'Cost of inaction is thinner than the category deserves: the only real profile-performance study is seven years stale and vendor-run, and it has to be labeled that way every time.',
          source:
            'BrightLocal, 2019, 45,000 businesses, medians of 1,009 searches and 14 calls a month, with only 5% of views producing an action',
          tier: 'none',
        },
        {
          label: 'Current direction',
          detail:
            'Current direction comes from the Whitespark ranking-factors survey of 47 experts: review and behavioral signals up, citations down.',
          source: 'November 2025',
          tier: 'none',
        },
      ],
    },
    {
      name: 'A review engine.',
      what: 'New reviews landing steadily instead of in bursts, with one binding delivery rule: a reply never references any patient detail — no treatment, no visit, no date, not even confirmation that the reviewer is a patient. Replies thank, they invite an offline conversation, and they say nothing else. That holds for hostile reviews and for drafts a human approves later.',
      whyItMatters:
        'Steady recent reviews are what a nearby search compares. And three of the federal dental penalties on record came from what a practice wrote in a public reply.',
      value: [
        {
          label: 'Value',
          detail:
            'RESERVED — value research in flight; no number yet. Nothing gets improvised here, and the reconciliation counts this row as zero, which means the real bought-alone envelope is higher than the total below by whatever it turns out to be.',
          tier: 'reserved',
        },
      ],
    },
  ],
}

const DEMAND: Category = {
  number: '2',
  name: 'Demand',
  stages: ['CAPTURE'],
  purpose:
    'Puts the practice in front of people already searching for the work, on an account the practice owns. Also CAPTURE.',
  deliverables: [
    {
      name: 'The Google Ads foundation.',
      what: "Built in the practice's name on the practice's card: conversion tracking wired to the dashboard, first campaign, ad copy and creatives, geography, schedule, negatives. Media at cost, zero markup.",
      whyItMatters:
        'Every dollar of spend buys ads instead of markup, and the account history stays with the practice when the engagement ends.',
      value: [
        {
          label: 'Account build and management',
          detail:
            'Account build runs roughly $500–$2,500 one-time for a single location, with $1,000–$1,500 the quoted midpoint, and management runs 10–20% of spend or roughly $500–$2,000 a month flat — a three-month equivalent of roughly $1,500–$8,500 in fees, media separate.',
          source: 'all directional, all from firms selling the service',
          tier: 'directional',
        },
        {
          label: 'Traffic benchmark',
          detail:
            'The traffic benchmark is checkable: dental CPC $7.03–$8.00 and cost per lead $73–$85 across 3,542 US campaigns to September 2025 and 13,474 through March 2026.',
          source: 'LocaliQ healthcare benchmarks — one dataset, not two',
          tier: 'none',
        },
      ],
    },
    {
      name: 'Thirty articles, ten a month across the install.',
      what: "Written to get found in search, published on the practice's own site.",
      whyItMatters:
        "The articles keep earning after the ad card is turned off, and they are the practice's property.",
      value: [
        {
          label: 'Writing alone',
          figure: '$11,250–$20,250',
          detail:
            'in writing alone at 25–45 cents a word, before anyone briefs, optimizes, or publishes them.',
          source: 'Editorial Freelancers Association 2026 member survey, 1,100+ members',
          tier: 'verified',
        },
        {
          label: 'Done-for-you',
          detail: 'Done-for-you at healthcare grade is $9,000–$24,000.',
          tier: 'none',
        },
        {
          label: 'Second direction',
          detail:
            'A second direction confirms it: agency and freelance SEO retainers average $2,917 a month, or $8,751 for three.',
          source: 'Ahrefs provider survey, 439 providers, dated August 2024',
          tier: 'none',
        },
      ],
    },
  ],
}

const ANSWERING_AND_BOOKING: Category = {
  number: '3',
  name: 'Answering and booking',
  stages: ['RESPOND', 'BOOK'],
  purpose:
    'Catches what the front desk physically cannot reach, and turns it into a kept appointment. RESPOND and BOOK.',
  deliverables: [
    {
      name: 'Every call answered, chair time and after hours.',
      what: 'The line is covered when the room is occupied and when the office is closed, and the caller can always reach a person.',
      whyItMatters:
        'A first-time caller who hits voicemail books with whoever picks up next, and takes the family with them.',
      value: [
        {
          label: 'Front-desk wage',
          detail:
            "A front desk costs $37,230 a year at the national median and still can't pick up while the room is occupied.",
          source: 'Bureau of Labor Statistics, May 2024',
          tier: 'verified',
        },
        {
          label: 'Software',
          detail:
            'The software that catches those calls runs roughly $200–$800 a month, or $700–$1,400 all-in with onboarding — directional, since every real vendor quote-gates its per-plan pricing.',
          tier: 'directional',
        },
      ],
    },
    {
      name: 'Missed-call text-back in seconds.',
      what: "Any call that isn't answered gets a text back immediately.",
      whyItMatters:
        'The missed call turns into a live text thread before the caller gets to the next practice on the list.',
      value: [
        {
          label: 'Unanswered calls',
          detail:
            'Two vendor call-log studies, both dental, disagreeing by roughly 2×: 20%+ of inbound calls unanswered across 2.3 million calls at 127 practices (Patient Prism, September 2025 to January 2026) against 38% unanswered across 4,280 calls at 26 practices (Peerlogic, February 2026). Both companies sell call software, and the honest form is the range with both named.',
          tier: 'none',
        },
        {
          label: 'Phone share',
          detail:
            'The phone still carries the schedule: 88% of patient appointments are booked by phone.',
          source: 'Patient Prism, 2024',
          tier: 'none',
        },
      ],
    },
    {
      name: 'Form fills answered in under a minute.',
      what: 'Web inquiries get a reply before the tab closes.',
      whyItMatters: 'An inquiry that waits is an inquiry answered by whoever replied first.',
      value: [
        {
          label: 'Market price',
          detail:
            'No separate market price exists — it rides inside the same platform class as the answering layer, whose published floors start at roughly $199 a month.',
          tier: 'none',
        },
      ],
    },
    {
      name: 'Qualification scripts.',
      what: 'The caller who needs a consult gets routed to a consult slot rather than a message.',
      whyItMatters: 'Answering a call is not booking one, and the script is the difference.',
      value: [
        {
          label: 'Market price',
          detail:
            "Not sold standalone at any price the ledger could source. The nearest priced comparison is the front-desk training market in category 7, which sells curriculum without listening to a single one of this practice's calls.",
          tier: 'none',
        },
      ],
    },
    {
      name: 'Booking into the real schedule, with reminders.',
      what: "Appointments land in the practice's own calendar, and reminders go out so they show.",
      whyItMatters: 'No second calendar, and fewer of the booked slots go empty.',
      value: [
        {
          label: 'Platform pricing',
          figure: 'Roughly $199 a month',
          detail:
            'published floor, about $350 a month per location published, and $400–$800 a month in third-party estimates for the platforms that publish nothing.',
          tier: 'directional',
        },
        {
          label: 'No-show research',
          detail:
            'No-show research exists but not for practices like these: 14.3% of pediatric visits in an academic dental setting and 24% among adolescents (Oliveira et al., International Journal of Dentistry, 2025), and 38.8% failed or cancelled among Medicaid-enrolled patients, 432 of 1,111 visits (2024). The population caveat is mandatory, and no peer-reviewed US private-practice no-show rate exists.',
          tier: 'none',
        },
      ],
    },
    {
      name: 'Calendar write-back to Dentrix, Open Dental, or Eaglesoft.',
      what: 'Bookings write back into the practice-management software already in use.',
      whyItMatters:
        'Nothing gets switched and nothing gets migrated, which removes the usual reason a system like this dies in month two.',
      value: [
        {
          label: 'Market price',
          detail:
            'No priced market for the hookup itself; it sits inside the platform class above. The specific hookup is confirmed in the audit, before any money moves.',
          tier: 'none',
        },
      ],
    },
  ],
}

const RECOVERY: Category = {
  number: '4',
  name: 'Recovery',
  stages: ['RECOVER'],
  purpose:
    'Works the revenue already sitting in the practice: treatment presented and never scheduled, patients overdue and never called. This is RECOVER, and most of what the system brings back comes from here.',
  deliverables: [
    {
      name: 'Structured follow-up on every presented-but-unscheduled plan.',
      what: 'Each presented plan gets worked until it books or the practice hears a no.',
      whyItMatters:
        "The treatment is already diagnosed and already sitting in the practice's software, so nothing new has to be sold.",
      value: [
        {
          label: 'Market price',
          detail:
            'Not sold standalone; it rides inside patient-comms platforms or practice analytics, and the analytics vendors publish no pricing. The nearest comparable tier is roughly $300–$800 a month for analytics plus outreach.',
          tier: 'directional',
        },
        {
          label: 'Cost of inaction',
          detail:
            'Cost of inaction: average case acceptance is 45% against 75% for the top decile — a 30-point gap on treatment already diagnosed. (VC-gated: internal until the claims row signs — see ledger §4.)',
          source: 'Henry Schein One, 2026 Catalyst Index, May 2026',
          tier: 'claimReady',
          gated: true,
        },
      ],
    },
    {
      name: 'Financing on the table.',
      what: 'Monthly-payment framing built into the follow-up, not left to the moment of presentation.',
      whyItMatters:
        'Cost is the reason most plans stall, and the number a patient hears changes whether the case books.',
      value: [
        {
          label: 'Market price',
          detail: 'Priced inside the page and script work, not separately.',
          tier: 'none',
        },
        {
          label: 'Patient research',
          detail:
            'The same CareCredit/Synchrony research behind the service pages applies: 58% say care is not affordable, 67% research financing, and 49% are very or extremely likely to use financing once cost reaches $1,000.',
          tier: 'none',
        },
        {
          label: 'What does not exist',
          detail:
            "No acceptance-lift figure exists — the financing publisher doesn't publish one, and the ones circulating are unsourced.",
          tier: 'none',
        },
      ],
    },
    {
      name: 'Overdue-recall and dormant-patient win-back.',
      what: "Worked off the practice's own list, not a bought one.",
      whyItMatters: "These patients are already the practice's. They just stopped coming back.",
      value: [
        {
          label: 'Automated recall',
          figure: 'Roughly $300–$800 a month',
          detail:
            'for automated recall, with $10–$30 per patient contacted and $5–$15 per reactivation against $100–$300 to acquire someone new.',
          source: 'all vendor-blog figures, no method, directional',
          tier: 'directional',
        },
        {
          label: 'Direct mail',
          detail:
            'The one line with a real rate card is direct mail: about $0.26 a piece for USPS EDDM, roughly $0.75 all-in printed and mailed.',
          tier: 'none',
        },
        {
          label: 'Cost of inaction',
          detail:
            'Cost of inaction: patient retention fell from 72% to 64% in a year, the best-sourced proxy available for a growing dormant base. (VC-gated: internal until the claims row signs — see ledger §4.)',
          source: 'Henry Schein One, 2026 Catalyst Index, May 2026',
          tier: 'claimReady',
          gated: true,
        },
      ],
    },
  ],
}

const MEASUREMENT: Category = {
  number: '5',
  name: 'Measurement',
  stages: ['PROVE'],
  purpose:
    'Shows where calls and follow-up die, and what the system earned against everything the practice has paid. PROVE.',
  deliverables: [
    {
      name: 'Every call recorded, transcribed, and classified.',
      what: 'The full call record, sorted by what actually happened on it.',
      whyItMatters:
        "The owner hears what the phone sounds like instead of taking anyone's word for it.",
      value: [
        {
          label: 'Analysis layer',
          detail:
            'The analysis layer sits in roughly $150–$195 a month tiers with 10,000 minutes included, or $1,200–$2,400 a year at practice scale; enterprise-class tooling starts around $10,000 a year.',
          tier: 'directional',
        },
        {
          label: 'What does not exist',
          detail:
            'Said out loud rather than borrowed from a vendor case study: no credible study quantifies the revenue effect of call recording or classification at practice scale.',
          tier: 'none',
        },
      ],
    },
    {
      name: 'The monthly front-desk score.',
      what: 'One number a month on how the phones and the follow-up performed, reviewed with the practice.',
      whyItMatters: 'It is the only line in the install that tells the desk what to fix next week.',
      value: [
        {
          label: 'Market price',
          detail:
            "Priced in category 7 with the taught layer, against $170–$2,000 a month of market training that never listens to a single one of this practice's calls.",
          tier: 'none',
        },
      ],
    },
    {
      name: 'The dashboard, two revenue lines.',
      what: 'What the ads drove, and what the system drove, side by side.',
      whyItMatters: "It is what the guarantee settles against, in the practice's own numbers.",
      value: [
        {
          label: 'Comparable build',
          figure: 'Roughly $2,000–$6,000',
          detail:
            'one-time for a comparable build with 3–5 connected reports, or $5,000–$15,000 where a data pipeline is needed.',
          source: 'consultant rate card, 2026, directional',
          tier: 'directional',
        },
        {
          label: 'Call tracking',
          detail:
            'Call tracking underneath it runs roughly $50–$195 a month in published tiers, about $600–$2,340 a year at practice scale.',
          tier: 'directional',
        },
        {
          label: 'Cost of inaction',
          detail:
            "Cost of inaction: not knowing what's working is the number-one marketing frustration small-business owners report, and only 18% say they feel confident in their results, down from 27% a year earlier.",
          source:
            'Constant Contact, "The State of Small Business Marketing," September 2025, 2,500 decision-makers',
          tier: 'none',
        },
      ],
    },
  ],
}

const COMPLIANCE: Category = {
  number: '6',
  name: 'Compliance, in writing',
  stages: [],
  purpose:
    'Turns a verbal assurance into paperwork the practice holds. It runs before go-live, not after.',
  deliverables: [
    {
      name: 'A signed business-associate agreement on every tool that touches patient data.',
      what: 'The contract HIPAA requires of any vendor handling patient information, in place on each tool in the stack.',
      whyItMatters:
        '"No business-associate agreement in place" is a federal finding on its own, with no breach required.',
      value: [
        {
          label: 'Market proxy',
          detail:
            'No standalone product exists. The market proxy is a HIPAA risk analysis at roughly $1,500–$6,000 for a small practice, $3,500–$4,500 flat-fee for a credentialed single-location review, or $15,000–$40,000+ at a law firm (directional; the federal Security Risk Assessment Tool is free).',
          tier: 'directional',
        },
        {
          label: 'Cost of inaction',
          detail:
            'Cost of inaction, all public record: dental practices have paid the federal health regulator $10,000, $23,000, $25,000, $30,000, $50,000, $70,000, and $80,000 — three of those for what the practice wrote in a public review reply.',
          tier: 'none',
        },
        {
          label: 'Small-practice parable',
          detail:
            'The small-practice parable is a five-physician cardiac group that paid $100,000 in 2012 for running patient email and a web calendar with no business-associate agreements.',
          tier: 'none',
        },
        {
          label: 'Internal context',
          detail:
            'Internal context, never scare copy: civil money penalties run $145 to $73,011 per violation at Tier 1 and up to $2,190,294 at Tier 4, capped at $2,190,294 a year per tier.',
          source: 'Federal Register 2026-01688, effective January 28, 2026',
          tier: 'none',
        },
      ],
    },
    {
      name: 'A compliance-officer review of the stack during onboarding.',
      what: "The practice's own compliance officer reviews and signs off on the tools before anything goes live.",
      whyItMatters:
        'Approval before go-live is worth more than an explanation after a complaint.',
      value: [
        {
          label: 'Compliant stack',
          detail:
            'The compliant version of the stack is what gets priced here: forms with the agreement included at roughly $99–$129 a month, phone at roughly $20–$45 per user a month on a healthcare configuration, encrypted email at roughly $29–$79 a month, patient texting at roughly $300–$500 a month published, with the rest of that category quote-only.',
          tier: 'directional',
        },
        {
          label: 'Piecemeal all-in',
          detail:
            'Piecemeal all-in for one location is roughly $150–$700 a month plus the one-time assessment above.',
          tier: 'directional',
        },
        {
          label: 'Generic tools',
          detail:
            'Generic tools carry no agreement at all — a personal cell, a free form builder, and a marketing email platform are exactly the configuration the regulator has already penalized.',
          tier: 'none',
        },
      ],
    },
  ],
}

const OPERATION_AND_HANDOVER: Category = {
  number: '7',
  name: 'Operation and handover',
  stages: [],
  purpose:
    'Ninety days of someone running the system, then everything written down and handed over.',
  deliverables: [
    {
      name: 'Ninety days of operation, inside the install.',
      what: 'Months 1 through 3 are operated, not retained: the sequences run, the campaigns get managed, the score gets produced.',
      whyItMatters:
        'A system nobody operates for the first quarter is a system that gets switched off in month two.',
      value: [
        {
          label: 'Bought separately',
          figure: '$9,000–$45,000',
          detail:
            'bought separately, composite across the three ways to buy it: a fractional marketing lead at $5,000–$25,000 a month, a full-service dental agency retainer at $3,000–$15,000 a month, or in-house at the Bureau of Labor Statistics median of $76,950 plus a 30.1% benefits load, about $110,000 a year or $9,200 a month.',
          tier: 'verified',
        },
        {
          label: 'Provenance',
          detail:
            'The in-house half is primary data; the agency and fractional ranges come from firms selling those services.',
          tier: 'none',
        },
      ],
    },
    {
      name: 'The day-45 report and the re-aim note.',
      what: 'The first partial two-line report, plus a short "what I\'d re-aim next" note.',
      whyItMatters:
        'The first honest read lands before the install closes, while there is still time to change aim.',
      value: [
        {
          label: 'Market price',
          detail:
            'No market price — it costs nothing extra to produce, because the two-line report is already an install deliverable.',
          tier: 'none',
        },
      ],
    },
    {
      name: 'The day-60 punch-list walkthrough.',
      what: 'Install-complete review, checked item by item in writing.',
      whyItMatters: '"Installed" becomes a document rather than an opinion.',
      value: [
        {
          label: 'Market price',
          detail:
            'No priced market for it. What it prevents is priced elsewhere: the rebuild cost of a site alone runs $3,500–$30,000 (directional proxy).',
          tier: 'directional',
        },
      ],
    },
    {
      name: "The owner's manual.",
      what: "Every sequence, script, and setting documented, in the practice's hands.",
      whyItMatters: 'No black box, and nothing to reverse-engineer if the engagement ends.',
      value: [
        {
          label: 'Market price',
          detail:
            "No honest market price exists for handover. Nobody has published what lock-in costs, and any figure claiming to is a guess — the ledger kills every one of them. The only proxy is rebuild cost, and the real proof is in the contract terms: ad account, data, content, and profile stay in the practice's name from day one.",
          tier: 'none',
        },
      ],
    },
  ],
}

export const DENTIST_OFFER: DentistOffer = {
  title: 'The dentist offer',
  updated: '2026-07-28',
  eyebrow: 'Gated internal · Updated 2026-07-28',
  sourceNote:
    'Values trace to docs/strategy/offer-research/06-deliverable-value-ledger.md.',
  definition: 'The Revenue Engine for dental practices, live at /revenue-engine/dentists/.',
  facts: [
    { label: 'Install floor', value: '$30,000' },
    { label: 'Installed by', value: 'day 60' },
    { label: 'Guarantee settles', value: 'day 120' },
    { label: 'Retainer from', value: 'month 4' },
    { label: 'Minimum', value: '3 months' },
  ],

  whatItIs:
    "One complete system — answering, booking, follow-up, measurement — installed once in the practice's name, operated for the first 90 days, and proven against everything the practice has paid. It works the revenue already sitting in the practice: presented treatment plans that never got scheduled, and overdue recall. Then it catches the new-patient calls the front desk cannot get to.",
  promiseIntro: "The promise is the owner's own problem, said back. The live page words it this way:",
  promiseQuote:
    "The plan they said 'let me think about it' to never gets a follow-up, so it dies in your software. The call that would've booked the next case goes to voicemail during chair time. I run the whole flow that catches both — and I prove it paid.",
  stagesLine:
    'Five stages carry it, in fixed order and never renamed or merged: CAPTURE, RESPOND, BOOK, RECOVER, PROVE. They map to Bring, Convert, Retain, plus Prove. Installed by day 60, settling by day 120.',
  guaranteeIntro: 'The guarantee is one sentence, quoted verbatim and never paraphrased:',
  guarantee:
    "If the revenue the system brings back hasn't covered everything you've paid me — install and fees — by day 120, I work free until it has.",
  guaranteeRules: [
    'Two rules travel with it. It settles against everything paid, install included, not the monthly fee alone — and the clock runs 120 days from signing, not from install.',
    'The remedy is work, not money: there is no refund on the install.',
    'And there is one wording, not two: a prospect who hears two versions of it decides the whole thing is invented. Anything that still settles against the monthly fee by day 90 is the retired wording (founder decision, 2026-07-28) and is dead.',
  ],

  tiers: [
    {
      tier: 'A',
      profile:
        'Cosmetic or implant-leaning general practice, or full-arch. Roughly $1.5M+ collections, active implant or cosmetic program.',
      recovery: '$300–500K+',
      fit: 'Install priced at the floor or above. Retainer $4–8K a month from month 4.',
    },
    {
      tier: 'B',
      profile: '$1–1.5M general practice, moderate elective mix. Crowns, occasional implants.',
      recovery: '$120–220K',
      fit: 'Priced at 10% of the modeled number, often below the floor. Retainer-first is the alternative.',
    },
    {
      tier: 'C',
      profile:
        'Median general practice around $800K, hygiene and PPO case mix, roughly $1.2K average case.',
      recovery: '$60–120K',
      fit: 'No install. A $250K recovery claim would be 31% of collections, which is not credible. Retainer-only fits.',
    },
  ],
  whoDecides:
    'The owner-dentist decides. The office manager owns the phones and often steers that decision, and nobody at the desk gets replaced by any of this. A four-location dental group is still a Revenue Engine prospect, not an industrial one.',
  notFitIntro: 'Not a fit:',
  notFit: [
    "Solo or low-ticket practices. The leak pool doesn't clear the install.",
    'Aligner mills and general-derm insurance mills.',
    "An owner who won't sign a business-associate agreement, the contract HIPAA requires of any vendor that touches patient data.",
    'Franchises and dental service organizations on a locked corporate vendor stack.',
    'Buyers who want cheap shared leads or a guaranteed lead count.',
    'A committee of five. The audit still earns its 20 minutes. The close takes much longer.',
  ],

  deliverablesIntro:
    "Everything below is inside the install fee. The dental install is foundation-shaped — the practice's whole growth setup, built once — and every piece of it sits in the practice's name from day one. Site, ad account, content, patient list, dashboard. Nothing is held hostage.",
  valueNotes:
    'Two notes on the Value lines. Bought-alone prices come mostly from the firms selling that service, so the directional ones are labeled "roughly" and never quoted to a buyer as fact. And the ledger\'s CLAIM-READY rows are proposed, not signed: no figure here faces a prospect until its claims row is signed into docs/strategy/sales/_claims-library.md.',
  categories: [
    WEB_AND_PRESENCE,
    DEMAND,
    ANSWERING_AND_BOOKING,
    RECOVERY,
    MEASUREMENT,
    COMPLIANCE,
    OPERATION_AND_HANDOVER,
  ],

  timeline: [
    {
      when: 'Day 1',
      what: 'Google profile, local pages, review velocity start — longest lag, so it starts first',
    },
    {
      when: 'Week 2',
      what: 'Call answering live during chair time and after hours; missed-call text-back',
    },
    {
      when: 'Day 30',
      what: "Plan follow-up live with financing framing; recall reactivation running off the practice's own list; dashboard ships partial",
    },
    {
      when: 'Day 45',
      what: 'First partial two-line report plus a short "what I\'d re-aim next" note',
    },
    {
      when: 'Day 60',
      what: 'Install-complete walkthrough, written punch-list checked item by item, calendar write-back live to Dentrix, Open Dental, or Eaglesoft',
    },
    {
      when: 'Day 120',
      what: "Guarantee settles: the recovered line in the practice's own dashboard against everything paid, install and fees. Counted from signing",
      settles: true,
    },
  ],

  notInInstall: [
    'Deeper practice-software integrations past calendar write-back. That is retainer work.',
    'Anything chairside. Case presentation and the financing conversation belong to the practice. The install puts the system in, trains the front desk, and tracks recall, reopened plans, and booked chairs with the practice. Case acceptance stays with the practice.',
    'Patient records. The audit measures the front desk and touches no patient data — it does not look at charts.',
  ],

  pricing: {
    publicLineIntro: 'The only price line that faces a prospect:',
    publicLine:
      'Installs start at $30,000. The exact number comes from the audit — in writing, same day.',
    publicLineNote:
      'That line is on the live page, and it is the whole public position. Everything below is internal and appears nowhere in outreach.',
    internalLabel: 'Internal — never in outreach',
    fee: {
      label: 'The fee.',
      body: 'The greater of $30,000 or about 10% of the 12-month recovered revenue the audit models. The floor is only honest when the audit models at least $250–300K a year of conservative recovery; below that the install is priced at 10% of the real number, or the account is declined. Never discounted to fit. Internal tier math sits against practice scale: the average private-practice general dentist runs $942,290 in gross billings and $207,980 in net income (ADA Health Policy Institute 2024, reached through secondary aggregators — directional, verify against the source before it informs a price).',
    },
    terms: {
      label: 'Terms.',
      body: "One-time install fee, install by day 60. Three-month minimum, no annual lock-in, month-to-month after. Ad accounts are funded by the practice, in the practice's name, media at cost with zero markup. Leaving after the minimum takes 30 days' notice; the automations switch off and the practice keeps the ad account, the data, and the Google profile.",
    },
    month4: {
      label: 'Month 4 onward.',
      body: "The retainer starts at month 4, because months 1 through 3 of operation are inside the install. It covers operating the sequences, the score reviewed each month with the practice, re-aim notes, and campaigns managed on the practice's own account at cost. Tier A is $4–8K a month, Tier B $3–4K, with an internal floor around $4K. The exact retainer number appears nowhere public. It exists only in the same-day written rate.",
    },
    optionNames: {
      label: 'The three signed option names.',
      names: [
        '"The cases you already earned"',
        '"Earned, plus new patients" (the default)',
        '"The whole practice, run for you."',
      ],
    },
    paymentTerms: {
      label: 'Payment terms, verbatim.',
      body: '"50% at signature, 25% at day-30 dashboard-live, 25% at the day-60 punch-list walkthrough — or 100% at signature minus 5%." Anything longer is a founder decision and is described as a payment schedule, never as financing.',
    },
    orderRule: {
      label: 'The order is fixed.',
      body: 'Objectives, then measures, then value, then fee. If the buyer will not stipulate a value, no proposal goes out.',
    },
  },

  valueStack: {
    proposalLine:
      'The proposal itemizes six foundations with what each one costs bought alone: $55,000 to $120,000 against the install fee. It is proposal-call material, after the audit. It is not outreach material and it does not go in an email.',
    corroboration:
      "The research corroborates the range. The sourced bought-alone rows in docs/strategy/offer-research/06-deliverable-value-ledger.md §5 sum to $36,747–$133,985, so the proposal's range sits inside what the sourcing supports, clear of both edges.",
    honesty:
      'Two things keep that honest: the review engine counts as zero while its research is in flight, so the real envelope is higher; and the low edge leans on directional vendor pricing while the high edge leans on the verified half (wage data, writing rates, build costs).',
    ledgerLine:
      'Per-deliverable sources, sourcing tiers, and the binding kill list live in the ledger.',
    scaleMax: 134000,
    bars: [
      {
        label: "Proposal's six-foundation frame",
        amount: '$55,000 to $120,000',
        low: 55000,
        high: 120000,
      },
      {
        label: 'Researched bought-alone envelope',
        amount: '$36,747–$133,985',
        low: 36747,
        high: 133985,
      },
    ],
  },

  proposedAdditions: {
    heading: 'Proposed additions',
    gate: 'GATE:HUMAN, unsigned',
    intro:
      'Three additions are drafted and unsigned. None of them is promised, on a call or in writing.',
    items: [
      {
        name: 'The monthly read-your-numbers call.',
        what: 'About 20 minutes a month walking the owner through their own two revenue lines and the front-desk score, until they read it unaided.',
      },
      {
        name: 'Front-desk coaching against the score.',
        what: 'A monthly working session training the desk to the number it is already measured on.',
      },
      {
        name: 'The quarterly re-aim note.',
        what: 'One paragraph a quarter on what the report says is weakest, extending the day-45 note past the install.',
      },
    ],
    signOff:
      'Sign-off rows: docs/strategy/offer-research/05-dental-fd7-tier2-draft.md. Unsigned means not promised.',
  },

  footer: {
    lead: 'Related: the outreach manual (cadence, approved copy, compliance rails, objections) lives at',
    outreachHref: '/strategy/offers/dentist/outreach/',
    outreachTail: '.',
    ledgerLabel: 'Value sourcing:',
    ledgerPath: 'docs/strategy/offer-research/06-deliverable-value-ledger.md.',
  },
}

/** Total deliverables across every category — used for the section note. */
export const DELIVERABLE_COUNT = DENTIST_OFFER.categories.reduce(
  (n, c) => n + c.deliverables.length,
  0,
)

/** The eight sections, in render order. Drives the "On this page" rail. */
export const SECTIONS: SectionMeta[] = [
  { id: 'what-it-is', number: '01', title: 'What it is', note: 'definition · promise · guarantee' },
  { id: 'who-its-for', number: '02', title: "Who it's for", note: 'tiers A–C · not a fit' },
  {
    id: 'deliverables',
    number: '03',
    title: 'The deliverables',
    note: `${DENTIST_OFFER.categories.length} categories · ${DELIVERABLE_COUNT} deliverables`,
  },
  {
    id: 'timeline',
    number: '04',
    title: 'Timeline',
    // carries the retired table's column heads ("When" / "What goes live")
    note: 'what goes live · day 1 → day 120',
  },
  {
    id: 'not-in-the-install',
    number: '05',
    title: 'Not in the install',
    note: `${DENTIST_OFFER.notInInstall.length} exclusions`,
  },
  { id: 'pricing', number: '06', title: 'Pricing and terms', note: 'public line · internal' },
  { id: 'value-stack', number: '07', title: 'The value stack', note: 'bought-alone envelope' },
  {
    id: 'proposed-additions',
    number: '08',
    title: 'Proposed additions',
    note: 'GATE:HUMAN · unsigned',
  },
]
