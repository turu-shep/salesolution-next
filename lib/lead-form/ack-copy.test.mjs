import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  ACK_CHANNELS,
  buildAck,
  firstNameOf,
  leadChannelFromSource,
  napFooterLine,
} from './ack-copy.mjs'

/**
 * F-02 guard. Every funnel must acknowledge the submitter, with the subject
 * the founder signed off and the honest delivery window in the body. Pure
 * copy assertions — no Resend, no HubSpot, no network.
 *
 * The business fixture mirrors the shape of lib/business.ts (the NAP SSOT);
 * distinct values so a missing footer can't pass by coincidence.
 */
const BUSINESS = {
  legalName: 'Test Entity LLC',
  dba: 'Testsolution',
  address: {
    street: '1 Test Way, PH1',
    city: 'Testville',
    region: 'FL',
    postalCode: '00000',
  },
  phoneDisplay: '555-000-0000',
  emails: { general: 'connect@test.example' },
}

const CHECKLIST_URL = 'https://salesolution.net/checklists/ai-search-survival/'
const PREFERENCES_URL = 'https://salesolution.net/communication-preferences/'

const opts = (extra = {}) => ({ business: BUSINESS, fullName: 'Dana Reyes', ...extra })

/** channel → [exact subject, …phrases that must survive any future edit] */
const EXPECTED = {
  lead_magnet: [
    'Your AI Search Survival Checklist',
    CHECKLIST_URL,
    'Sixty checks across four sections',
    'scoring sheet',
    "You'll also get the occasional note worth reading",
    'one click to unsubscribe',
  ],
  audit: [
    'Got it — your Growth Audit is in motion',
    'crawl starts today',
    'Within 24 hours',
    'six findings ranked',
    'the constraint',
    'Reply lands with me directly.',
  ],
  catalog_snapshot: [
    'Snapshot request received — PDF within 2 business days',
    'crawl your catalog',
    'five products',
    'rewrite them both ways',
    'within 2 business days',
  ],
  sprint: [
    'Application received — answer within 24 hours',
    'within 24 hours either way',
    'calendar link to scope the sprint',
    'candid note on why now is not the time',
    'referral',
  ],
  strategy_call: [
    'Call request received',
    'Proposed times follow within a few hours',
    'same business day',
  ],
  contact: [
    'Got your message',
    'lands with Artur, not a queue',
    'within one business day',
  ],
  revenue_leak_audit: [
    'Got your numbers — audit underway',
    'missed-call, reply-speed, and follow-up data',
    'within one business day',
    'the one fix with the highest payback',
    'No pitch.',
  ],
}

test('every ack channel is covered by an expectation', () => {
  assert.deepEqual([...ACK_CHANNELS].sort(), Object.keys(EXPECTED).sort())
})

for (const [channel, [subject, ...phrases]] of Object.entries(EXPECTED)) {
  test(`${channel}: subject + key phrases`, () => {
    const ack = buildAck(channel, opts({
      checklistUrl: CHECKLIST_URL,
      preferencesUrl: PREFERENCES_URL,
    }))
    assert.equal(ack.subject, subject)
    for (const phrase of phrases) {
      assert.ok(
        ack.text.includes(phrase),
        `${channel} body must contain: ${phrase}\n--- actual ---\n${ack.text}`,
      )
    }
  })
}

test('every ack carries the sign-off and the NAP footer line', () => {
  for (const channel of ACK_CHANNELS) {
    const ack = buildAck(channel, opts({ checklistUrl: CHECKLIST_URL }))
    assert.ok(ack.text.includes('— Artur Shepel'), `${channel} missing sign-off`)
    assert.ok(ack.text.includes('Founder, Sale Solution'), `${channel} missing role line`)
    assert.ok(
      ack.text.trim().endsWith(napFooterLine(BUSINESS)),
      `${channel} must end with the NAP footer line`,
    )
    assert.ok(ack.text.includes('1 Test Way, PH1'), `${channel} missing physical address`)
  }
})

test('named funnels greet by first name; the lead magnet does not greet', () => {
  for (const channel of ACK_CHANNELS) {
    const ack = buildAck(channel, opts({ checklistUrl: CHECKLIST_URL }))
    if (channel === 'lead_magnet') {
      assert.ok(!ack.text.includes('Hi '), 'lead magnet collects no name — no greeting')
    } else {
      assert.ok(ack.text.startsWith('Hi Dana,'), `${channel} must greet by first name`)
    }
  }
})

test('a missing name degrades to "there", never "Hi ,"', () => {
  assert.equal(firstNameOf(undefined), 'there')
  assert.equal(firstNameOf('   '), 'there')
  assert.equal(firstNameOf('Dana Reyes'), 'Dana')
  const ack = buildAck('contact', { business: BUSINESS })
  assert.ok(ack.text.startsWith('Hi there,'))
})

test('the checklist ack degrades gracefully without a preferences URL', () => {
  const ack = buildAck('lead_magnet', {
    business: BUSINESS,
    checklistUrl: CHECKLIST_URL,
  })
  assert.ok(ack.text.includes('one click to unsubscribe.'))
  assert.ok(!ack.text.includes('undefined'))
})

test('no ack leaks an undefined into the copy', () => {
  for (const channel of ACK_CHANNELS) {
    const ack = buildAck(channel, { business: BUSINESS, checklistUrl: CHECKLIST_URL })
    assert.ok(!ack.subject.includes('undefined'), `${channel} subject`)
    assert.ok(!ack.text.includes('undefined'), `${channel} body`)
  }
})

test('napFooterLine renders one line from the identity SSOT', () => {
  assert.equal(
    napFooterLine(BUSINESS),
    'Test Entity LLC d/b/a Testsolution · 1 Test Way, PH1, Testville, FL 00000 · 555-000-0000 · connect@test.example',
  )
})

test('an unknown channel throws instead of sending blank copy', () => {
  assert.throws(() => buildAck('nope', { business: BUSINESS }), /unknown channel/)
})

test('leadChannelFromSource maps each door, contact is the fallback', () => {
  const cases = [
    ['https://salesolution.net/unlock-growth-audit/', 'audit'],
    ['https://salesolution.net/constraint-sprint/', 'sprint'],
    ['https://salesolution.net/book-growth-call/', 'strategy_call'],
    ['https://salesolution.net/catalog-snapshot/', 'catalog_snapshot'],
    ['https://salesolution.net/contact-me/', 'contact'],
    ['', 'contact'],
    [undefined, 'contact'],
  ]
  for (const [src, expected] of cases) {
    assert.equal(leadChannelFromSource(src), expected, `${src} → ${expected}`)
  }
})
