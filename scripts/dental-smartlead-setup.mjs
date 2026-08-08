/**
 * dental-smartlead-setup — stage the dentist outreach sequences in Smartlead.
 *
 * Builds TWO campaigns from section 12 of lib/strategy/docs/dentist-outreach-manual.ts
 * — the Artur-voiced, hybrid-evidence drafts — and leaves both parked. Neither
 * is ever started, no sending account is attached, no lead is added. Those are
 * the launch steps, and they are Artur's (docs/handoff/dental-smartlead/).
 *
 *   base  four emails, whole list. Email 1 leads with an observed leak (slot_1).
 *   hot   same four, except email 1 leads with a real website form test.
 *
 * Emails 2, 3 and 4 are byte-identical across the two.
 *
 *   node scripts/dental-smartlead-setup.mjs             # dry-run: print the plan
 *   node scripts/dental-smartlead-setup.mjs --apply     # create/update them live
 *   node scripts/dental-smartlead-setup.mjs --verify    # read-back assertions only
 *
 * Secrets (.env.local — auto-loaded; or run with node --env-file=.env.local):
 *   SMARTLEAD_API_KEY   Smartlead → Settings → API Key.
 *
 * Four things to know before editing this file:
 *
 *   - The manual is the source of truth for the copy. Nothing here hand-copies
 *     an email body: extractSection12() parses the markdown out of the .ts file,
 *     so editing the manual changes what this stages, and a manual edit that
 *     breaks the shape fails loudly here instead of shipping stale copy.
 *   - Section 12 is GATE:HUMAN. It is drafts. The gate is the reason this script
 *     has no start path — see the NO-GO block below.
 *   - Merge fields are declared by the manual's own slot-contract table and
 *     cross-checked against what the emails actually use, per track. A hot-tier
 *     field that leaks into the base sequence fails the run. None is pre-filled,
 *     none has a fallback, none is auto-generated.
 *   - The callback number is NOT a merge field. It is a constant Artur fills
 *     once, and it stays in the staged body as a literal [NUMBER: …] marker so
 *     it is impossible to miss in the Smartlead editor. Every run prints it as
 *     a launch blocker.
 *
 * NO-GO — enforced by omission. This file deliberately does not import
 * setCampaignStatus, addEmailAccountsToCampaign, or addLeads. Do not add them.
 */
import {
  createCampaign,
  getCampaign,
  getSequences,
  listCampaignEmailAccounts,
  listCampaignLeads,
  listCampaigns,
  saveSequences,
  updateCampaignSchedule,
  updateCampaignSettings,
} from './lib/smartlead.mjs'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MANUAL = resolve(REPO_ROOT, 'lib/strategy/docs/dentist-outreach-manual.ts')

// ── the plan ─────────────────────────────────────────────────────────────────
// Two campaigns, one per evidence track. `aliases` are previous names this
// campaign has answered to — matching them is what makes a rename idempotent
// instead of a duplicate. The base row was staged 2026-08-01 as campaign
// 3750571 under the partner-voiced name; the founder killed that persona on
// 2026-08-01 and this renames it in place.
const CAMPAIGNS = [
  {
    key: 'base',
    track: 'base',
    name: 'Dental — Artur Voice v1 — GATED DRAFT (do not start)',
    aliases: ['Dental — Partner Voice v1 — GATED DRAFT (do not start)'],
    blurb: 'whole list · email 1 leads with an observed leak',
  },
  {
    key: 'hot',
    track: 'hot tier',
    name: 'Dental — Artur Voice v1 HOT (form test) — GATED DRAFT (do not start)',
    aliases: [],
    blurb: 'hot tier only · email 1 leads with a real website form test',
  },
]

// Section 12 runs the cadence on WORKING days 1 / 4 / 9 / 15. Smartlead counts
// delays in calendar days and then waits for the next open slot in the sending
// window, so these are the working-day gaps (3, 5, 6) used as calendar days —
// an approximation. Held strictly, working days 1/4/9/15 on a Mon-start are
// calendar +0/+3/+10/+18. The short version lands the sequence in ~2 weeks
// instead of ~3; §11 flags cadence tuning as open either way.
const STEP_DELAY_DAYS = { 1: 0, 2: 3, 3: 5, 4: 6 }

// Mon–Fri. Adjust per list geography: this is the tz the list lives in, not
// ours. §9 is the binding constraint — 9am-7pm in the PROSPECT's local time —
// so a West Coast list needs its own campaign or a shifted window.
// The last two are REQUIRED by the API even though the docs list them as
// optional (two live 400s on 2026-08-01). Neither is specified by the manual,
// so both are placeholders a human re-decides at launch alongside the sender
// count — throughput scales with mailboxes, and there are none attached yet.
//   min_time_btw_emails  minutes between two sends from the SAME mailbox.
//                        10 over an 08:00–11:00 window caps one at ~18/day.
//   max_new_leads_per_day  new leads entering the sequence per day.
const SCHEDULE = {
  timezone: 'America/New_York',
  days_of_the_week: [1, 2, 3, 4, 5],
  start_hour: '08:00',
  end_hour: '11:00',
  min_time_btw_emails: 10,
  max_new_leads_per_day: 20,
}

// Channel rules, section 12 and section 9: reply-first, no pixel, no click
// rewriting, stop the moment they reply. DONT_TRACK_EMAIL_OPEN kills the open
// pixel; DONT_TRACK_LINK_CLICK stops the audit link being rewritten through a
// redirector, which both breaks the UTM string and looks like an agency.
// No footer and no injected opt-out line: §12 is transcribed verbatim and the
// manual adds neither. Opt-outs are handled by hand (§9 rules 5, 9, 10).
const settingsFor = (name) => ({
  name,
  track_settings: ['DONT_TRACK_EMAIL_OPEN', 'DONT_TRACK_LINK_CLICK'],
  stop_lead_settings: 'REPLY_TO_AN_EMAIL',
  send_as_plain_text: true,
  add_unsubscribe_tag: false,
  enable_ai_esp_matching: false,
})

// ── CLI ──────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = {}
  for (const k of argv) {
    if (k === '--apply') a.apply = true
    else if (k === '--verify') a.verify = true
    else if (k === '--json') a.json = true
  }
  return a
}
const args = parseArgs(process.argv.slice(2))

// ── extract section 12 from the manual ───────────────────────────────────────
// Shape being parsed (see the manual):
//
//   | Field | Track | What fills it | Where it comes from |
//   |---|---|---|---|
//   | slot_1 | base | The primary leak, written as … | Scan output |
//
//   **Email 1 — base — day 1. The whole list. No link.**
//
//   > Subject: one thing I saw looking up [Company]
//   >
//   > [Name] — I went looking for your practice the way a new patient would. …
//
// Bracketed tokens the manual uses for people, mapped to Smartlead merge syntax.
// [SLOT: …] names its own field and is checked against the table; [NUMBER: …]
// is the sender's own callback number and is deliberately NOT a merge field.
const TOKENS = [
  ['[Name]', 'first_name'],
  ['[Company]', 'company_name'],
]

const TRACKS = ['base', 'hot tier']
const AUDIT_LINK_PREFIX = 'https://salesolution.net/revenue-engine/dentists/'

function sliceSection(text) {
  const start = text.search(/^## 12\. Artur-voiced sequences/m)
  if (start < 0)
    throw new Error('manual: could not locate section 12 (## 12. Artur-voiced sequences …) — did the outreach manual get restructured?')
  const rest = text.slice(start)
  // Next ## heading if there is one, otherwise the end of the template literal.
  const nextHeading = rest.slice(3).search(/^## /m)
  const end = nextHeading >= 0 ? nextHeading + 3 : rest.lastIndexOf('`')
  const section = rest.slice(0, end > 0 ? end : undefined)
  if (!section.includes('GATE:HUMAN'))
    throw new Error('manual §12: the GATE:HUMAN line is gone. Refusing to stage copy whose gate was removed.')
  return section
}

/** The slot-contract table → Map(field → { track, description, source }). */
function parseSlotContract(section) {
  const from = section.indexOf('### Slot contract')
  const to = section.indexOf('**Email 1')
  if (from < 0 || to < 0 || to <= from)
    throw new Error('manual §12: could not locate the slot-contract table above the emails')

  const declared = new Map()
  const rows = [...section.slice(from, to).matchAll(/^\|\s*([a-z][a-z0-9_]*)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/gm)]
  for (const [, field, track, description, source] of rows) {
    if (!TRACKS.includes(track) && track !== 'both')
      throw new Error(`manual §12: slot ${field} has track ${JSON.stringify(track)}; expected one of both / ${TRACKS.join(' / ')}`)
    if (declared.has(field)) throw new Error(`manual §12: slot ${field} is declared twice`)
    declared.set(field, { field, track, description, source })
  }
  if (!declared.size) throw new Error('manual §12: the slot-contract table parsed to zero fields')
  return declared
}

function extractSection12(text) {
  const section = sliceSection(text)
  const declared = parseSlotContract(section)
  const constants = []

  // Header line, then a blank line, then one contiguous run of `>` quote lines.
  const blocks = [...section.matchAll(/^\*\*Email (\d+)(?: — (base|hot tier))? — day (\d+)\.([^\n]*)\*\*\n\n((?:^>.*\n)+)/gm)]

  const emails = blocks.map((m) => {
    const number = Number(m[1])
    const variant = m[2] || null
    const day = Number(m[3])
    const note = m[4].trim()
    const lines = m[5].trimEnd().split('\n').map((l) => l.replace(/^>\s?/, ''))
    const fields = new Set()

    const subjectLine = lines.shift() || ''
    const sm = subjectLine.match(/^Subject:\s*(.+)$/)
    if (!sm) throw new Error(`manual §12: email ${number} does not open with a "Subject:" line (got ${JSON.stringify(subjectLine)})`)

    // "(same thread — …)" means no subject at all: Smartlead threads a step with
    // an empty subject as a reply to the one before it. That is what lets the
    // two tracks share steps 2–4 behind two different first emails.
    const threaded = /^\(same thread\b/i.test(sm[1].trim())

    // Blank lines separate paragraphs; the manual writes one sentence-group per
    // paragraph and never wraps mid-paragraph, but join defensively anyway.
    const paragraphs = lines
      .join('\n')
      .split(/\n\s*\n/)
      .map((p) => p.split('\n').map((l) => l.trim()).filter(Boolean).join('<br>'))
      .filter(Boolean)

    return {
      number,
      variant,
      day,
      note,
      threaded,
      fields,
      delayInDays: STEP_DELAY_DAYS[number],
      subject: threaded ? '' : convert(sm[1], declared, fields, constants),
      body: paragraphs.map((p) => convert(p, declared, fields, constants)).join('<br><br>'),
    }
  })

  const shape = emails.map((e) => `${e.number}${e.variant ? `/${e.variant}` : ''}`).join(', ')
  const expectedShape = '1/base, 1/hot tier, 2, 3, 4'
  if (shape !== expectedShape)
    throw new Error(`manual §12: email blocks are [${shape}], expected [${expectedShape}]`)
  for (const e of emails) {
    if (e.delayInDays === undefined) throw new Error(`no step delay configured for email ${e.number}`)
  }

  const shared = emails.filter((e) => !e.variant)
  const sequences = Object.fromEntries(
    TRACKS.map((track) => [track, [emails.find((e) => e.variant === track), ...shared]]),
  )

  checkFieldTracks(declared, sequences)
  checkLinkPolicy(sequences)
  if (constants.length !== 1)
    throw new Error(`manual §12: expected exactly one [NUMBER: …] constant (the sign-off), found ${constants.length}`)

  return { emails, sequences, declared, constants }
}

/**
 * Bidirectional check between the slot-contract table and what the copy uses.
 * A field declared "hot tier" that shows up in the base sequence is the failure
 * this exists to catch: it would mean the whole-list campaign is asking for a
 * form-test observation nobody ran.
 */
function checkFieldTracks(declared, sequences) {
  const used = Object.fromEntries(
    TRACKS.map((track) => [track, new Set(sequences[track].flatMap((e) => [...e.fields]))]),
  )
  for (const [field, { track }] of declared) {
    for (const t of TRACKS) {
      const shouldUse = track === 'both' || track === t
      if (shouldUse && !used[t].has(field))
        throw new Error(`manual §12: slot ${field} is declared for ${track} but never appears in the ${t} emails`)
      if (!shouldUse && used[t].has(field))
        throw new Error(`manual §12: slot ${field} is declared ${track} but appears in the ${t} emails`)
    }
  }
}

/** §12 rule 1: one link, in email 2, nowhere else, not rewritten. */
function checkLinkPolicy(sequences) {
  for (const track of TRACKS) {
    for (const step of sequences[track]) {
      const urls = `${step.subject} ${step.body}`.match(/https?:\/\/\S+/g) || []
      if (step.number !== 2 && urls.length)
        throw new Error(`manual §12: email ${step.number} (${track}) carries a link; only email 2 may (${urls[0]})`)
      if (step.number === 2) {
        if (urls.length !== 1) throw new Error(`manual §12: email 2 carries ${urls.length} links, expected exactly 1`)
        if (!urls[0].startsWith(AUDIT_LINK_PREFIX) || !urls[0].includes('#audit'))
          throw new Error(`manual §12: email 2's link is not the dental audit anchor: ${urls[0]}`)
      }
    }
  }
}

/**
 * One line of manual markdown → one line of Smartlead body.
 *
 * [SLOT: field] → {{field}}, checked against the slot-contract table. [Name] /
 * [Company] → the merge fields in TOKENS, checked the same way. [NUMBER: …] is
 * left alone on purpose — it is the one bracket that survives into the staged
 * body, so the unfilled callback number is visible in the Smartlead editor
 * rather than hiding behind an empty merge field. Nothing else is touched: no
 * rewording, no footer, no escaping, and the audit URL stays bare text so it
 * remains verbatim and client-autolinked rather than wrapped in an anchor.
 */
function convert(line, declared, fields, constants) {
  const mergeField = (field, token) => {
    if (!declared.has(field))
      throw new Error(`manual §12: ${token} is not declared in the slot-contract table (add a ${field} row)`)
    fields.add(field)
    return `{{${field}}}`
  }

  let out = line.replace(/\[SLOT:\s*([^\]]+)\]/g, (token, raw) => mergeField(raw.trim(), token))
  for (const [token, field] of TOKENS) {
    if (out.includes(token)) out = out.split(token).join(mergeField(field, token))
  }
  for (const c of out.match(/\[NUMBER:[^\]]*\]/g) || []) constants.push(c)

  // Anything still in brackets is a token nobody mapped — refuse to stage it
  // rather than mail a literal "[…]" to a dentist.
  const stray = out.replace(/\[NUMBER:[^\]]*\]/g, '').match(/\[[^\]]*\]/)
  if (stray) throw new Error(`unmapped bracket token ${JSON.stringify(stray[0])} in: ${line.slice(0, 90)}`)
  return out
}

// ── plan → wire format ───────────────────────────────────────────────────────
// Flat subject + email_body per step (no A/B variants), which is the shape GET
// /campaigns/:id/sequences hands back. The delay key is NOT symmetric: the API
// requires snake_case `delay_in_days` on write and returns camelCase
// `delayInDays` on read. Confirmed live 2026-08-01 — writing the camel form is
// a 400. readDelay() below reads whichever it finds.
const toSequences = (emails) =>
  emails.map((e) => ({
    seq_number: e.number,
    seq_delay_details: { delay_in_days: e.delayInDays },
    subject: e.subject,
    email_body: e.body,
  }))

const readDelay = (step) => step?.seq_delay_details?.delayInDays ?? step?.seq_delay_details?.delay_in_days
const norm = (s) => (s ?? '').trim()

// ── printing ─────────────────────────────────────────────────────────────────
const rule = (label) => console.log(`\n── ${label} ${'─'.repeat(Math.max(0, 74 - label.length))}`)
const asText = (html) => html.split('<br><br>').join('\n\n').split('<br>').join('\n')

function printCampaign(cfg, steps, existing) {
  rule(`campaign — ${cfg.key}`)
  console.log(`  name      ${cfg.name}`)
  const mode = existing
    ? `UPDATE existing id ${existing.id} (status ${existing.status}${existing.name === cfg.name ? '' : `, renaming from ${JSON.stringify(existing.name)}`})`
    : 'CREATE new'
  console.log(`  mode      ${mode}`)
  console.log(`  track     ${cfg.track} — ${cfg.blurb}`)
  console.log(`  source    ${MANUAL.replace(REPO_ROOT + '/', '')} §12 (GATE:HUMAN drafts)`)

  for (const e of steps) {
    const when = e.number === 1 ? 'on add' : `+${e.delayInDays}d`
    console.log(`\n  step ${e.number}  ${when.padEnd(7)} manual day ${String(e.day).padEnd(2)}  ${e.note}`)
    console.log(`  subject  ${e.threaded ? '(blank — replies in the thread above)' : e.subject}`)
    for (const l of asText(e.body).split('\n')) console.log(l ? `    | ${l}` : '    |')
  }
}

function printPlan(plan, found) {
  for (const cfg of CAMPAIGNS) printCampaign(cfg, plan.sequences[cfg.track], found[cfg.key])

  rule('schedule — both campaigns')
  for (const [k, v] of Object.entries(SCHEDULE)) console.log(`  ${k.padEnd(18)} ${JSON.stringify(v)}`)
  console.log('  (Mon–Fri. Adjustable per list geography — §9 requires the PROSPECT\'s local 9am–7pm.)')

  rule('settings — both campaigns')
  for (const [k, v] of Object.entries(settingsFor('<campaign name>'))) console.log(`  ${k.padEnd(18)} ${JSON.stringify(v)}`)

  rule('merge-field contract — every field REQUIRED per lead on its track, no fallbacks')
  for (const s of plan.declared.values())
    console.log(`  {{${s.field}}}`.padEnd(20) + `${s.track.padEnd(9)} ${s.source.padEnd(14)} ${s.description}`)
  console.log('\n  Nothing above is auto-generated. §12 slot rule: fill each from something')
  console.log('  actually observed. If you cannot, cut the line — do not guess it.')

  rule('launch blockers left in the copy on purpose')
  for (const c of plan.constants) console.log(`  ${c}  — a constant, not a merge field. Artur fills it once, in email 4.`)

  rule('not done by this script, ever')
  console.log('  no start/resume call · no sending accounts attached · no leads added · no slot pre-filled')
}

// ── read-back verification ───────────────────────────────────────────────────
const SENDING_STATUSES = ['ACTIVE', 'START', 'STARTED', 'RUNNING']

async function verify(cfg, id, emails) {
  const campaign = await getCampaign(id)
  const raw = await getSequences(id)
  const steps = (Array.isArray(raw) ? raw : raw?.data || []).slice().sort((a, b) => a.seq_number - b.seq_number)
  const accounts = await listCampaignEmailAccounts(id)
  const accountRows = Array.isArray(accounts) ? accounts : accounts?.data || []
  const leads = await listCampaignLeads(id)

  const checks = []
  const check = (ok, label, detail) => checks.push({ ok: !!ok, label, detail })

  check(campaign.name === cfg.name, 'campaign name matches the plan', campaign.name)
  check(!SENDING_STATUSES.includes(String(campaign.status).toUpperCase()), 'status is a non-sending state', campaign.status)
  check(steps.length === 4, 'sequence has 4 steps', `${steps.length} steps`)
  check(accountRows.length === 0, 'zero email accounts attached', `${accountRows.length} attached`)
  check(leads.length === 0, 'zero leads', `${leads.length} leads`)

  for (const e of emails) {
    const step = steps.find((s) => s.seq_number === e.number)
    const label = e.threaded ? 'blank (threads as a reply)' : e.subject
    check(norm(step?.subject) === e.subject, `step ${e.number} subject matches the manual`, step ? `${JSON.stringify(norm(step.subject))} want ${JSON.stringify(label)}` : '(missing)')
    check(readDelay(step) === e.delayInDays, `step ${e.number} delay is ${e.delayInDays}d`, String(readDelay(step) ?? '(missing)'))
    check(step?.email_body === e.body, `step ${e.number} body round-tripped verbatim`, step?.email_body === e.body ? 'exact' : 'DIFFERS')
  }

  const cron = campaign.scheduler_cron_value || {}
  check(cron.tz === SCHEDULE.timezone, 'schedule timezone', cron.tz)
  check(String(cron.days) === String(SCHEDULE.days_of_the_week), 'schedule days Mon–Fri', JSON.stringify(cron.days))
  check(cron.startHour === SCHEDULE.start_hour && cron.endHour === SCHEDULE.end_hour, 'schedule window', `${cron.startHour}–${cron.endHour}`)

  // Written as DONT_TRACK_EMAIL_OPEN / DONT_TRACK_LINK_CLICK (the documented
  // spelling), stored and returned as DONT_EMAIL_OPEN / DONT_LINK_CLICK. Accept
  // either so this passes against what the API actually keeps.
  const track = (campaign.track_settings || []).map((t) => t.replace('DONT_TRACK_', 'DONT_'))
  check(track.includes('DONT_EMAIL_OPEN'), 'open tracking OFF', JSON.stringify(campaign.track_settings))
  check(track.includes('DONT_LINK_CLICK'), 'click tracking OFF', JSON.stringify(campaign.track_settings))
  check(campaign.stop_lead_settings === 'REPLY_TO_AN_EMAIL', 'stop on reply', String(campaign.stop_lead_settings))
  check(campaign.send_as_plain_text === true, 'send as plain text', String(campaign.send_as_plain_text))
  check(!campaign.unsubscribe_text, 'no unsubscribe footer text', JSON.stringify(campaign.unsubscribe_text))

  rule(`read-back verification — ${cfg.key}`)
  console.log(`  campaign  ${campaign.id}  ${campaign.status}  ${campaign.name}`)
  for (const c of checks) console.log(`  ${c.ok ? '✓' : '✗'} ${c.label.padEnd(42)} ${c.detail}`)

  const failed = checks.filter((c) => !c.ok)
  console.log(`\n  ${checks.length - failed.length}/${checks.length} checks passed`)
  return { campaign, steps, failed }
}

// ── main ─────────────────────────────────────────────────────────────────────
/** Match on the current name first, then on any name this campaign used to have. */
function findCampaign(cfg, rows) {
  return rows.find((c) => c.name === cfg.name) || rows.find((c) => cfg.aliases.includes(c.name)) || null
}

;(async () => {
  try {
    const plan = extractSection12(readFileSync(MANUAL, 'utf8'))
    const rows = await listCampaigns()
    const all = Array.isArray(rows) ? rows : []
    const found = Object.fromEntries(CAMPAIGNS.map((c) => [c.key, findCampaign(c, all)]))

    if (args.verify) {
      let bad = 0
      for (const cfg of CAMPAIGNS) {
        const existing = found[cfg.key]
        if (!existing) throw new Error(`--verify: no campaign named ${JSON.stringify(cfg.name)} on this account`)
        const { failed } = await verify(cfg, existing.id, plan.sequences[cfg.track])
        bad += failed.length
      }
      process.exit(bad ? 1 : 0)
    }

    printPlan(plan, found)

    if (!args.apply) {
      console.log('\nDry run. Nothing was written. Re-run with --apply to stage it in Smartlead.')
      return
    }

    let bad = 0
    for (const cfg of CAMPAIGNS) {
      rule(`applying — ${cfg.key}`)
      const existing = found[cfg.key]
      let id = existing?.id
      if (id) {
        const rename = existing.name === cfg.name ? '' : ` (renaming from ${JSON.stringify(existing.name)})`
        console.log(`  reusing campaign ${id}${rename} — updating sequence, schedule, settings in place`)
      } else {
        const created = await createCampaign({ name: cfg.name })
        id = created?.id ?? created?.campaign_id ?? created?.data?.id
        if (!id) throw new Error(`createCampaign returned no id: ${JSON.stringify(created).slice(0, 200)}`)
        console.log(`  created campaign ${id}`)
      }

      // Schedule before sequences: a campaign with steps but no window is the one
      // state where a stray UI click could send something.
      await updateCampaignSchedule(id, SCHEDULE)
      console.log('  schedule saved')
      await updateCampaignSettings(id, settingsFor(cfg.name))
      console.log('  settings saved')
      const steps = plan.sequences[cfg.track]
      await saveSequences(id, toSequences(steps))
      console.log(`  ${steps.length} sequence steps saved`)

      const { failed } = await verify(cfg, id, steps)
      bad += failed.length
    }

    if (bad) {
      console.error(`\n${bad} check(s) failed — the campaigns are staged but not as specified. Fix before handing off.`)
      process.exit(1)
    }
    console.log('\nBoth staged and parked. Neither sends until a human attaches senders, adds leads, and presses Start.')
  } catch (e) {
    console.error('ERROR:', e.message)
    process.exit(1)
  }
})()
