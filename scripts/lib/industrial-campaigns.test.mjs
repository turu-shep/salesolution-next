import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { parseCampaignFile, toSequencePayload, wordCount } from './industrial-campaigns.mjs'

const ROOT = resolve(import.meta.dirname, '..', '..')
const C1 = resolve(ROOT, 'emails/handoff/campaigns/01-c1-catalog-ai.md')
const C2 = resolve(ROOT, 'emails/handoff/campaigns/02-c2-industrial-growth.md')

const FOOTER =
  'Artur Shepel · Sale Solution · salesolution.net<br>17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160<br>Reply "stop" or use the unsubscribe link and you won\'t hear from me again.'

/** Write a mutated copy of a real handoff file and return its path. */
function mutate(file, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'ind-campaigns-'))
  const out = join(dir, 'campaign.md')
  writeFileSync(out, fn(readFileSync(file, 'utf8')))
  return out
}

test('C1 parses to the staged shape: 5 steps, 12/4/4/4/4 variants, delays 0/3/5/5/5', () => {
  const plan = parseCampaignFile(C1, 'c1')
  assert.equal(plan.steps.length, 5)
  assert.deepEqual(plan.steps.map((s) => s.variants.length), [12, 4, 4, 4, 4])
  assert.deepEqual(plan.steps.map((s) => s.delayInDays), [0, 3, 5, 5, 5])
  assert.deepEqual(
    plan.steps[0].variants.map((v) => v.variant_label),
    ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'CE1', 'CE2', 'CE3', 'CE4'],
  )
  assert.deepEqual(plan.steps[1].variants.map((v) => v.variant_label), ['E2-1', 'E2-2', 'E2-3', 'E2-4'])
})

test('C2 parses to 4 steps with the Cohort-E completion: 8/4/4/4 variants, delays 0/4/5/5', () => {
  const plan = parseCampaignFile(C2, 'c2')
  assert.equal(plan.steps.length, 4)
  assert.deepEqual(plan.steps.map((s) => s.variants.length), [8, 4, 4, 4])
  assert.deepEqual(plan.steps.map((s) => s.delayInDays), [0, 4, 5, 5])
  assert.deepEqual(
    plan.steps[0].variants.map((v) => v.variant_label),
    ['E1-1', 'E1-2', 'E1-3', 'E1-4', 'CE1', 'CE2', 'CE3', 'CE4'],
  )
})

test('every body carries the §4 footer appended after the sign-off', () => {
  for (const [file, kind] of [[C1, 'c1'], [C2, 'c2']]) {
    const plan = parseCampaignFile(file, kind)
    for (const v of plan.steps.flatMap((s) => s.variants)) {
      assert.ok(v.email_body.endsWith('<br><br>' + FOOTER), `${v.variant_label} missing footer`)
      assert.ok(v.email_body.includes('— Artur<br><br>Artur Shepel'), `${v.variant_label} footer not under the sign-off`)
    }
  }
})

test('{{declaration}} appears only in C1 E1-A variants and nowhere in C2', () => {
  const c1 = parseCampaignFile(C1, 'c1')
  for (const s of c1.steps) {
    for (const v of s.variants) {
      const has = v.email_body.includes('{{declaration}}')
      assert.equal(has, s.number === 1 && v.variant_label.startsWith('A'), `${v.variant_label} declaration presence wrong`)
    }
  }
  const c2 = parseCampaignFile(C2, 'c2')
  for (const v of c2.steps.flatMap((s) => s.variants))
    assert.ok(!v.email_body.includes('{{declaration}}'), `${v.variant_label} carries the declaration`)
})

test('C2 Cohort-E body is the base body with only the first line replaced', () => {
  const plan = parseCampaignFile(C2, 'c2')
  const base = plan.steps[0].variants.find((v) => v.variant_label === 'E1-1').email_body
  const ce = plan.steps[0].variants.find((v) => v.variant_label === 'CE1').email_body
  assert.ok(ce.startsWith('{{hello}}I wrote last month to this address, which I got off your listing in a manufacturer\'s distributor locator. Different subject today.'))
  const baseTail = base.slice(base.indexOf('<br><br>'))
  const ceTail = ce.slice(ce.indexOf('<br><br>'))
  assert.equal(baseTail, ceTail, 'everything after the first paragraph must be identical')
  // The doc's prose says the CE body "runs 72 words"; the counting rule that
  // reproduces the other stated counts lands on 73 — the doc is off by one.
  const raw = ce.slice(0, ce.indexOf('<br><br>' + FOOTER)).split('<br><br>').join('\n\n').split('<br>').join('\n')
  assert.equal(wordCount(raw), 73)
})

test('exactly one link in each campaign, in E2, with the five UTM params', () => {
  for (const [file, kind, path] of [[C1, 'c1', '/catalog-snapshot/'], [C2, 'c2', '/book-growth-call/']]) {
    const plan = parseCampaignFile(file, kind)
    for (const s of plan.steps) {
      for (const v of s.variants) {
        const urls = v.email_body.match(/https?:\/\/\S+?(?=<br|$)/g) || []
        if (s.number === 2) {
          assert.equal(urls.length, 1, `${kind} step 2 [${v.variant_label}]`)
          assert.ok(urls[0].includes(path) && urls[0].includes('utm_content=e2'), urls[0])
        } else {
          assert.equal(urls.length, 0, `${kind} step ${s.number} [${v.variant_label}] carries a link`)
        }
      }
    }
  }
})

test('toSequencePayload writes snake_case delays, empty step-level content, seq_variants', () => {
  const plan = parseCampaignFile(C2, 'c2')
  const payload = toSequencePayload(plan.steps)
  assert.equal(payload.length, 4)
  for (const [i, p] of payload.entries()) {
    assert.equal(p.seq_number, i + 1)
    assert.equal(typeof p.seq_delay_details.delay_in_days, 'number')
    assert.equal(p.subject, '')
    assert.equal(p.email_body, '')
    assert.ok(Array.isArray(p.seq_variants) && p.seq_variants.length >= 4)
    for (const v of p.seq_variants) {
      assert.deepEqual(Object.keys(v).sort(), ['email_body', 'subject', 'variant_label'])
    }
  }
})

test('wordCount: bare punctuation drops, URL and merge tags count as one token each', () => {
  assert.equal(wordCount('— Artur'), 1)
  assert.equal(wordCount('{{hello}}I work with a URL https://example.com/x?a=b here'), 7)
})

// ── the parser refuses copy whose contract broke ─────────────────────────────

test('deleting the §7 send-blockers section fails the parse', () => {
  const p = mutate(C1, (t) => t.replace(/^## 7\. Nothing sends until these clear$/m, '## 7. All clear'))
  assert.throws(() => parseCampaignFile(p, 'c1'), /Nothing sends until these clear/)
})

test('a body that starts "Your…" after {{hello}} fails the capitalization rule', () => {
  const p = mutate(C1, (t) => t.replace('{{hello}}I work with industrial distributors', '{{hello}}Your buyers work with distributors'))
  assert.throws(() => parseCampaignFile(p, 'c1'), /capitalization rule/)
})

test('a link outside E2 fails the one-link rule', () => {
  const p = mutate(C1, (t) => t.replace("{{hello}}I'll tell you why this happens, and it's boring.", "{{hello}}I'll tell you why: https://example.com/why happens."))
  assert.throws(() => parseCampaignFile(p, 'c1'), /carries a link/)
})

test('a manufacturer brand name in a body fails the G3 ban', () => {
  const p = mutate(C1, (t) => t.replace('I work with industrial distributors on one narrow problem.', 'I work with Parker distributors on one narrow problem.'))
  assert.throws(() => parseCampaignFile(p, 'c1'), /manufacturer brand "parker"/)
})

test('a bare {{company}} tag fails — the join key must never merge', () => {
  const p = mutate(C1, (t) => t.replace('Has anyone checked whether it names {{company_display}}?', 'Has anyone checked whether it names {{company}}?'))
  assert.throws(() => parseCampaignFile(p, 'c1'), /\{\{company\}\}|Merge/)
})

test('numerals in a body outside the URL fail (SKU / dollar ban, structurally)', () => {
  const p = mutate(C1, (t) => t.replace('Five of your real products', '5 of your real products'))
  assert.throws(() => parseCampaignFile(p, 'c1'), /numerals/)
})

test('an uppercase subject fails the subject rules', () => {
  const p = mutate(C1, (t) => t.replace('`your product pages` · `the ai answer`', '`Your Product Pages` · `the ai answer`'))
  assert.throws(() => parseCampaignFile(p, 'c1'), /not all-lowercase/)
})

test('removing the C2 FIRST-LINE-ONLY rule fails — the Cohort-E inflection is load-bearing', () => {
  const p = mutate(C2, (t) => t.replace('**FIRST LINE ONLY — replace**', '**first line only, replace**'))
  assert.throws(() => parseCampaignFile(p, 'c2'), /FIRST LINE ONLY/)
})

test('a body drifting more than 3 words from its stated count fails as a mangled fence', () => {
  const p = mutate(C1, (t) =>
    t.replace(
      'Has anyone checked whether it names you?',
      'Has anyone anywhere at any point in time actually checked whether it really names you?',
    ),
  )
  assert.throws(() => parseCampaignFile(p, 'c1'), /mangled/)
})

test('ERP/PIM never appear in any body', () => {
  const p = mutate(C2, (t) => t.replace("I don't rebuild the system you run the business on.", "I don't rebuild the ERP you run the business on."))
  assert.throws(() => parseCampaignFile(p, 'c2'), /ERP\/PIM/)
})
