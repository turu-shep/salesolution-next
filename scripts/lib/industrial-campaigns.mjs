/**
 * industrial-campaigns — parse the C1/C2 handoff files into Smartlead sequences.
 *
 * The handoff markdown is the source of truth for the copy:
 *
 *   emails/handoff/campaigns/01-c1-catalog-ai.md        → IND-C1 (5 steps)
 *   emails/handoff/campaigns/02-c2-industrial-growth.md → IND-C2 (4 steps)
 *
 * Nothing here retypes an email. §3's fenced blocks are the bodies, §3's
 * **Subjects:** lines are the variants, §4's fenced block is the footer, and a
 * doc edit that breaks the shape fails the parse instead of staging stale or
 * mangled copy. The same file also carries the copy contract as executable
 * checks: the capitalization rule, the one-link rule, the merge-field
 * declarations, the stated word counts, and the G3 brand ban.
 *
 * Wire shape (verified live 2026-08-02 against campaigns 3751334/3751335):
 * each step is uploaded with an EMPTY step-level subject/body and a
 * `seq_variants` array of { variant_label, subject, email_body }. Smartlead
 * returns them under `sequence_variants` — a write/read asymmetry in the same
 * family as delay_in_days → delayInDays. When a step carries variants, the
 * step-level subject and email_body legitimately read back empty; a verifier
 * that does not know this reports 84 blank fields and cries data loss.
 *
 * Variants are an A/B primitive, not a router: Smartlead distributes them
 * RANDOMLY. The A/B/CE bodies on C1 step 1 (and CE on C2 step 1) are list
 * splits at export time — the master drafts hold all copy side by side for
 * review, and the send-time micro-campaigns get exactly one body each
 * (00-sequence-brief "Sequence shape"; 01-c1 §3; 02-c2 §3).
 */
import { readFileSync } from 'node:fs'

// Word-boundary brand screen, G3 unsigned: no manufacturer name may appear in
// any subject or body (00-sequence-brief; 01-c1 §2 ban 4). The list is every
// manufacturer the handoff itself names as a source or blocked brand.
const BRAND_BAN = [
  'enerpac', 'spx', 'dorner', 'kennametal', 'ballymore', 'quincy', 'nord',
  'banjo', 'lovejoy', 'timken', 'parker', 'gates', 'dixon', 'weg', 'esab',
  'norton', 'regal rexnord', 'ifm',
]

/** Tokens that carry at least one word character count; bare punctuation ("—")
 * does not; the URL is one word. The doc's own stated counts drift ±2 from any
 * single counting rule (they were hand-counted), so counts are recorded and a
 * mismatch is only fatal past MAX_WORD_DRIFT — a mangled fence, not a stylistic
 * disagreement. Byte-exactness of the copy is the normative check, not this. */
export function wordCount(text) {
  return text.split(/\s+/).filter((t) => /[A-Za-z0-9{]/.test(t)).length
}
const MAX_WORD_DRIFT = 3

const section = (text, n, label) => {
  const re = new RegExp(`^## ${n}\\. ${label}[^\\n]*$`, 'm')
  const m = text.match(re)
  if (!m) throw new Error(`campaign file: section "## ${n}. ${label}" not found — restructured?`)
  const start = m.index + m[0].length
  const next = text.slice(start).search(/^## /m)
  return text.slice(start, next >= 0 ? start + next : undefined)
}

const fences = (text) => [...text.matchAll(/^```\n([\s\S]*?)\n```/gm)].map((m) => m[1])

/** `**Subjects:** \`a\` · \`b\` · \`c\` · \`d\`` → ['a','b','c','d'] */
function parseSubjects(chunk, id) {
  const m = chunk.match(/^\*\*Subjects:\*\* (.+)$/m)
  if (!m) throw new Error(`${id}: no **Subjects:** line`)
  const subjects = [...m[1].matchAll(/`([^`]+)`/g)].map((x) => x[1])
  if (subjects.length !== 4) throw new Error(`${id}: expected 4 subjects, got ${subjects.length}`)
  for (const s of subjects) {
    const words = s.split(' ').length
    if (words < 2 || words > 4) throw new Error(`${id}: subject "${s}" is ${words} words; rule is 2–4`)
    if (s !== s.toLowerCase()) throw new Error(`${id}: subject "${s}" is not all-lowercase`)
    if (/[0-9%[\]()]/.test(s)) throw new Error(`${id}: subject "${s}" carries numerals/percent/brackets`)
    if (/\bre:/i.test(s)) throw new Error(`${id}: subject "${s}" fakes a reply`)
  }
  return subjects
}

/** `**44 words.**` or `**45 words** (the URL counts as one).` after a body. */
const statedWords = (chunk, afterIdx) => {
  const m = chunk.slice(afterIdx).match(/\*\*(\d+) words\.?\*\*/)
  return m ? Number(m[1]) : null
}

function lintBody(id, body, { link, footer }) {
  if (!body.startsWith('{{hello}}'))
    throw new Error(`${id}: body does not start with {{hello}}`)
  const rest = body.slice('{{hello}}'.length)
  if (!(rest.startsWith('I') || rest.startsWith('{{company_display}}')))
    throw new Error(`${id}: capitalization rule — after {{hello}} the body must start "I" or "{{company_display}}" (got ${JSON.stringify(rest.slice(0, 24))})`)

  const urls = body.match(/https?:\/\/\S+/g) || []
  if (!link && urls.length) throw new Error(`${id}: carries a link; only E2 may (${urls[0]})`)
  if (link) {
    if (urls.length !== 1) throw new Error(`${id}: expected exactly 1 link, found ${urls.length}`)
    if (!urls[0].startsWith(link.prefix)) throw new Error(`${id}: link is not ${link.prefix}: ${urls[0]}`)
    for (const p of link.params)
      if (!urls[0].includes(p)) throw new Error(`${id}: link is missing ${p}`)
  }

  // No numerals reach a prospect outside the URL and the footer address —
  // covers the SKU-count and award-dollar bans structurally.
  const noUrl = body.replace(/https?:\/\/\S+/g, '')
  if (/[0-9$%]/.test(noUrl)) throw new Error(`${id}: body carries numerals/$/% outside the URL`)

  if (/\{\{company\}\}/.test(body)) throw new Error(`${id}: bare {{company}} tag — the join key must never merge`)
  if (/\{\{company_display\}\}'/.test(body)) throw new Error(`${id}: {{company_display}} used in the possessive`)
  if (/\b(ERP|PIM)\b/.test(body)) throw new Error(`${id}: ERP/PIM must never appear (ICP language rule)`)
  for (const b of BRAND_BAN) {
    const re = new RegExp(`\\b${b.replace(/ /g, '\\s+')}\\b`, 'i')
    if (re.test(body) || (footer && re.test(footer))) throw new Error(`${id}: manufacturer brand "${b}" appears — G3 is unsigned`)
  }
}

/** Cross-check the doc's own `Merge: \`{{a}} {{b}}\`` declaration against the
 * tags the body actually uses — both directions, like the dental slot check. */
function checkMerge(id, chunk, afterIdx, body) {
  const m = chunk.slice(afterIdx).match(/Merge: (.+?)(?:\.|\n)/)
  if (!m) throw new Error(`${id}: no "Merge:" declaration after the body`)
  const declared = new Set([...m[1].matchAll(/\{\{([a-z_]+)\}\}/g)].map((x) => x[1]))
  const used = new Set([...body.matchAll(/\{\{([a-z_]+)\}\}/g)].map((x) => x[1]))
  for (const t of used) if (!declared.has(t)) throw new Error(`${id}: body uses {{${t}}} but the Merge: line does not declare it`)
  for (const t of declared) if (!used.has(t)) throw new Error(`${id}: Merge: declares {{${t}}} but the body never uses it`)
  return used
}

/** One `### C{n}-E{m} · day X[–Y] — note` touch section. */
function parseTouches(seq) {
  const heads = [...seq.matchAll(/^### (C[12]-E\d(?:-COHORT-E)?) · day (\d+)(?:[–-](\d+))?([^\n]*)$/gm)]
  if (!heads.length) throw new Error('campaign file: no ### touch headings under §3')
  return heads.map((h, i) => {
    const start = h.index + h[0].length
    const end = i + 1 < heads.length ? heads[i + 1].index : seq.length
    return { id: h[1], day: Number(h[2]), dayHigh: h[3] ? Number(h[3]) : null, note: h[4].trim(), chunk: seq.slice(start, end) }
  })
}

/** All `**BODY**` / `**BODY — E1-A**` blocks in one touch chunk, in order. */
function parseBodies(touch) {
  const out = []
  const markers = [...touch.chunk.matchAll(/^\*\*BODY(?: — (E1-[AB]))?\*\*[^\n]*$/gm)]
  for (const m of markers) {
    const rest = touch.chunk.slice(m.index)
    const fence = rest.match(/```\n([\s\S]*?)\n```/)
    if (!fence) throw new Error(`${touch.id}: **BODY** marker without a fenced block`)
    const afterFence = m.index + rest.indexOf(fence[0]) + fence[0].length
    out.push({ variant: m[1] || null, raw: fence[1], stated: statedWords(touch.chunk, afterFence), afterFence })
  }
  if (!out.length) throw new Error(`${touch.id}: no **BODY** block`)
  return out
}

const toHtml = (raw) =>
  raw
    .split(/\n\s*\n/)
    .map((p) => p.split('\n').map((l) => l.trim()).filter(Boolean).join('<br>'))
    .filter(Boolean)
    .join('<br><br>')

/**
 * Parse one campaign handoff file into { steps, footer, checks }.
 *
 * kind 'c1': touches E1 (bodies A+B) + E1-COHORT-E (own subjects/body) fold
 * into step 1 as variants A1-4 / B1-4 / CE1-4; E2–E5 are steps 2–5.
 * kind 'c2': E1–E4 are steps 1–4; the "FIRST LINE ONLY — replace" rule under
 * E1 derives the Cohort-E body, staged as CE1-4 on step 1 with E1's subjects.
 */
export function parseCampaignFile(path, kind) {
  const text = readFileSync(path, 'utf8')

  // The gate equivalent of dental's GATE:HUMAN line: refuse to stage a file
  // whose send-blocker section was deleted.
  section(text, 7, 'Nothing sends until these clear')

  const footerRaw = fences(section(text, 4, 'Footer'))[0]
  if (!footerRaw || !/salesolution\.net/.test(footerRaw) || !/unsubscribe/.test(footerRaw))
    throw new Error('campaign file: §4 footer fence missing or not the CAN-SPAM footer')
  const footer = footerRaw.split('\n').map((l) => l.trim()).filter(Boolean).join('<br>')

  const seq = section(text, 3, 'The sequence')
  const touches = parseTouches(seq)
  const expected = kind === 'c1' ? ['C1-E1', 'C1-E1-COHORT-E', 'C1-E2', 'C1-E3', 'C1-E4', 'C1-E5'] : ['C2-E1', 'C2-E2', 'C2-E3', 'C2-E4']
  const ids = touches.map((t) => t.id)
  if (ids.join(',') !== expected.join(','))
    throw new Error(`campaign file: touches are [${ids}], expected [${expected}]`)

  const checks = []
  const build = (touch, body, label) => {
    const id = `${touch.id}${body.variant ? ` ${body.variant}` : ''}`
    const link =
      /E2$/.test(touch.id) && kind === 'c1'
        ? { prefix: 'https://salesolution.net/catalog-snapshot/', params: ['utm_source=coldemail', 'utm_medium=email', 'utm_campaign=catalog-{{segment}}', 'utm_content=e2'] }
        : /E2$/.test(touch.id)
          ? { prefix: 'https://salesolution.net/book-growth-call/', params: ['utm_source=coldemail', 'utm_medium=email', 'utm_campaign=growth-{{segment}}', 'utm_content=e2'] }
          : null
    lintBody(id, body.raw, { link, footer: footerRaw })
    checkMerge(id, touch.chunk, body.afterFence, body.raw)
    const words = wordCount(body.raw)
    const drift = body.stated === null ? 0 : Math.abs(words - body.stated)
    if (drift > MAX_WORD_DRIFT)
      throw new Error(`${id}: body counts ${words} words against a stated ${body.stated} — a body fence looks mangled`)
    checks.push({ id, label, words, stated: body.stated })
    return toHtml(body.raw) + '<br><br>' + footer
  }

  // Steps assemble as: [{ number, delayInDays, variants: [{variant_label, subject, email_body}] }]
  const steps = []
  const days = []
  const mainTouches = touches.filter((t) => !t.id.includes('COHORT'))

  for (const [i, touch] of mainTouches.entries()) {
    const subjects = parseSubjects(touch.chunk, touch.id)
    const bodies = parseBodies(touch)
    const num = i + 1
    days.push(touch.day)
    const variants = []

    if (kind === 'c1' && num === 1) {
      if (bodies.map((b) => b.variant).join(',') !== 'E1-A,E1-B')
        throw new Error(`C1-E1: expected bodies E1-A and E1-B, got ${bodies.map((b) => b.variant)}`)
      const [a, b] = bodies
      const htmlA = build(touch, a, 'A')
      const htmlB = build(touch, b, 'B')
      if (!/"\{\{declaration\}\}/.test(a.raw)) throw new Error('C1-E1 E1-A: the quoted {{declaration}} is gone')
      if (/\{\{declaration\}\}/.test(b.raw)) throw new Error('C1-E1 E1-B: {{declaration}} must not appear in the no-declaration body')
      subjects.forEach((s, j) => variants.push({ variant_label: `A${j + 1}`, subject: s, email_body: htmlA }))
      subjects.forEach((s, j) => variants.push({ variant_label: `B${j + 1}`, subject: s, email_body: htmlB }))

      const cohort = touches.find((t) => t.id === 'C1-E1-COHORT-E')
      if (cohort.day !== touch.day) throw new Error('C1-E1-COHORT-E: must share day 0 with E1')
      const ceSubjects = parseSubjects(cohort.chunk, cohort.id)
      const ceBody = parseBodies(cohort)[0]
      const htmlCE = build(cohort, ceBody, 'CE')
      ceSubjects.forEach((s, j) => variants.push({ variant_label: `CE${j + 1}`, subject: s, email_body: htmlCE }))
    } else if (kind === 'c2' && num === 1) {
      const html = build(touch, bodies[0], 'main')
      subjects.forEach((s, j) => variants.push({ variant_label: `E1-${j + 1}`, subject: s, email_body: html }))

      // The Cohort-E inflection: not a separate body block — a byte-exact
      // first-line replacement declared in prose (02-c2 §3). Same subjects.
      const rule = seq.match(/\*\*FIRST LINE ONLY — replace\*\* `([^`]+)`\s*\n\*\*with\*\* `([^`]+)`/)
      if (!rule) throw new Error('C2-E1: the "FIRST LINE ONLY — replace" Cohort-E rule is missing')
      const [, from, to] = rule
      if (!bodies[0].raw.startsWith(from))
        throw new Error(`C2-E1: body no longer starts with the line the Cohort-E rule replaces (${JSON.stringify(from.slice(0, 40))}…)`)
      const ceRaw = to + bodies[0].raw.slice(from.length)
      lintBody('C2-E1 CE', ceRaw, { link: null, footer: footerRaw })
      const htmlCE = toHtml(ceRaw) + '<br><br>' + footer
      checks.push({ id: 'C2-E1 CE', label: 'CE', words: wordCount(ceRaw), stated: null })
      subjects.forEach((s, j) => variants.push({ variant_label: `CE${j + 1}`, subject: s, email_body: htmlCE }))
    } else {
      const html = build(touch, bodies[0], 'main')
      const prefix = touch.id.replace(/^C[12]-/, '')
      subjects.forEach((s, j) => variants.push({ variant_label: `${prefix}-${j + 1}`, subject: s, email_body: html }))
    }

    steps.push({ number: num, day: touch.day, note: touch.note, variants })
  }

  // Delays are gaps from the previous step, taken at the LOWER bound of each
  // day range — C1 (0/3–5/8–10/13–15/18) → 0,3,5,5,5 which sums to the doc's
  // own "five touches over 18 days"; C2 (0/4/9/14) → 0,4,5,5.
  steps.forEach((s, i) => {
    s.delayInDays = i === 0 ? 0 : days[i] - days[i - 1]
    if (i > 0 && s.delayInDays < 1)
      throw new Error(`step ${s.number}: nonsensical delay ${s.delayInDays} from day ${days[i - 1]} → ${days[i]}`)
  })

  const total = days[days.length - 1]
  const span = kind === 'c1' ? 18 : 14
  if (total !== span) throw new Error(`campaign spans ${total} days, the doc promises ${span}`)

  // {{declaration}} appears in exactly one body across the whole campaign (C1
  // E1-A) and nowhere in C2 — "C1 spends that asset; C2 does not."
  const declBodies = steps.flatMap((s) => s.variants).filter((v) => v.email_body.includes('{{declaration}}'))
  if (kind === 'c1' && !declBodies.every((v) => v.variant_label.startsWith('A')))
    throw new Error('{{declaration}} leaked outside the E1-A variants')
  if (kind === 'c2' && declBodies.length) throw new Error('{{declaration}} must not appear anywhere in C2')

  return { steps, footer, checks }
}

/** Plan → the exact write payload for saveSequences (seq_variants on write,
 * sequence_variants on read — do not "fix" the asymmetry). */
export const toSequencePayload = (steps) =>
  steps.map((s) => ({
    seq_number: s.number,
    seq_delay_details: { delay_in_days: s.delayInDays },
    subject: '',
    email_body: '',
    seq_variants: s.variants.map((v) => ({ variant_label: v.variant_label, subject: v.subject, email_body: v.email_body })),
  }))
