/**
 * industrial-smartlead-setup — stage the C1/C2 industrial sequences in Smartlead.
 *
 * Rebuilds, verifies, or re-stages the two industrial draft campaigns from the
 * handoff files (the copy SSOT):
 *
 *   emails/handoff/campaigns/01-c1-catalog-ai.md        → IND-C1, 5 steps
 *   emails/handoff/campaigns/02-c2-industrial-growth.md → IND-C2, 4 steps
 *
 *   node scripts/industrial-smartlead-setup.mjs             # dry-run: print the plan
 *   node scripts/industrial-smartlead-setup.mjs --apply     # create/update in place
 *   node scripts/industrial-smartlead-setup.mjs --verify    # read-back assertions only
 *
 * Secrets (.env.local — auto-loaded): SMARTLEAD_API_KEY.
 *
 * The campaigns were first staged 2026-08-02 (ids 3751334 / 3751335 — see
 * emails/data/_smartlead-upload-2026-08-02.md) by a script that lived in that
 * session's scratchpad. This file is the durable replacement, plus one
 * completion: the C2 Cohort-E first-line inflection (02-c2 §3), which the
 * first pass recorded as "not uploaded", is staged here as CE1–CE4 variants
 * on C2 step 1 — same shape as C1's cohort variants.
 *
 * What --apply sets, deliberately:
 *   - sequences (all steps, all variants), settings (plain text, no open pixel,
 *     no click rewriting, stop on reply), and the campaign name.
 *   - NO schedule. "Working days, 4–7pm local" is prospect-local, and a single
 *     campaign has one timezone — the window is a launch decision per
 *     micro-campaign. `scheduler_cron_value: null` is the most parked state.
 *   - NO unsubscribe tag change. The §4 footer promises "the unsubscribe link";
 *     wiring Smartlead's tag on (or cutting the clause) is Artur's open call —
 *     see the launch blockers this prints.
 *
 * NO-GO — enforced by omission, same as the dental script. This file does not
 * import setCampaignStatus, addLeads, addEmailAccountsToCampaign, or
 * upsertWebhook. Do not add them. Campaigns 3750571 / 3750618 (dental) and
 * 2796251 (Transformation) are never matched, read, or written.
 */
import {
  createCampaign,
  getCampaign,
  getSequences,
  listCampaignEmailAccounts,
  listCampaignLeads,
  listCampaigns,
  saveSequences,
  updateCampaignSettings,
} from './lib/smartlead.mjs'
import { parseCampaignFile, toSequencePayload } from './lib/industrial-campaigns.mjs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CAMPAIGNS = [
  {
    key: 'C1',
    kind: 'c1',
    file: resolve(REPO_ROOT, 'emails/handoff/campaigns/01-c1-catalog-ai.md'),
    name: 'IND-C1 Catalog AI — GATED DRAFT (do not start)',
    aliases: ['IND-C1 Catalog AI (draft 2026-08-02)'],
    blurb: 'Angle 1 · seated-v4 · A/B split on declaration_approved · Cohort E isolated at send time',
  },
  {
    key: 'C2',
    kind: 'c2',
    file: resolve(REPO_ROOT, 'emails/handoff/campaigns/02-c2-industrial-growth.md'),
    name: 'IND-C2 Industrial Growth — GATED DRAFT (do not start)',
    aliases: ['IND-C2 Industrial Growth (draft 2026-08-02)'],
    blurb: 'services book · C1 non-responders only, ~1 month after C1 · Book a Growth Call',
  },
]

// Only what the source docs state outright (00-sequence-brief; 01-c1 §3 link
// discipline). Open/click tracking off keeps the E2 URL raw and pixel-free;
// stop-on-reply because a reply is the CTA on every touch. Nothing else is
// touched — no add_unsubscribe_tag, no schedule, no follow_up_percentage.
const settingsFor = (name) => ({
  name,
  track_settings: ['DONT_TRACK_EMAIL_OPEN', 'DONT_TRACK_LINK_CLICK'],
  stop_lead_settings: 'REPLY_TO_AN_EMAIL',
  send_as_plain_text: true,
})

function parseArgs(argv) {
  const a = {}
  for (const k of argv) {
    if (k === '--apply') a.apply = true
    else if (k === '--verify') a.verify = true
  }
  return a
}
const args = parseArgs(process.argv.slice(2))

// ── printing ─────────────────────────────────────────────────────────────────
const rule = (label) => console.log(`\n── ${label} ${'─'.repeat(Math.max(0, 74 - label.length))}`)
const asText = (html) => html.split('<br><br>').join('\n\n').split('<br>').join('\n')

function printCampaign(cfg, plan, existing) {
  rule(`campaign — ${cfg.key}`)
  console.log(`  name      ${cfg.name}`)
  const mode = existing
    ? `UPDATE existing id ${existing.id} (status ${existing.status}${existing.name === cfg.name ? '' : `, renaming from ${JSON.stringify(existing.name)}`})`
    : 'CREATE new'
  console.log(`  mode      ${mode}`)
  console.log(`  source    ${cfg.file.replace(REPO_ROOT + '/', '')} §3 + §4 (send-gated drafts)`)
  console.log(`  blurb     ${cfg.blurb}`)

  for (const s of plan.steps) {
    const when = s.number === 1 ? 'on add' : `+${s.delayInDays}d`
    console.log(`\n  step ${s.number}  ${when.padEnd(7)} day ${String(s.day).padEnd(3)} ${s.variants.length} variants  ${s.note}`)
    const byBody = new Map()
    for (const v of s.variants) {
      const k = v.email_body
      if (!byBody.has(k)) byBody.set(k, [])
      byBody.get(k).push(v)
    }
    for (const [body, vars] of byBody) {
      console.log(`    bodies [${vars.map((v) => v.variant_label).join(' ')}]  subjects: ${vars.map((v) => JSON.stringify(v.subject)).join(' · ')}`)
      for (const l of asText(body).split('\n')) console.log(l ? `      | ${l}` : '      |')
    }
  }

  rule(`copy checks — ${cfg.key}`)
  for (const c of plan.checks)
    console.log(`  ${c.id.padEnd(22)} ${String(c.words).padStart(3)} words${c.stated !== null ? ` (doc states ${c.stated} — match)` : ' (derived body — no stated count)'}`)
}

function printBlockers() {
  rule('launch blockers — untouched by this script, in the docs')
  console.log('  1. No suppression / DNC list exists anywhere. Blocks "calls included" and every send.')
  console.log('  2. Sender warmup has never run (zero lifetime since 2024). Four weeks from zero.')
  console.log('  3. Both send domains recommended for retirement (4,899 sends, zero replies).')
  console.log('  4. G6 pre-flight (PF-2/3/4/8) gates the C1-E2 link and the footer address; G7 gates C2-E2\'s URL.')
  console.log('  5. Footer says "use the unsubscribe link" but no tag is wired — turn add_unsubscribe_tag on or cut the clause (Artur).')
  console.log('  6. declaration_approved review pass must exist before any E1-A batch.')
  console.log('  7. Variants are an A/B primitive: at send time C1 splits into E1-A / E1-B / Cohort-E campaigns; C2 splits base / Cohort-E.')
  rule('not done by this script, ever')
  console.log('  no start/resume call · no sending accounts attached · no leads added · no schedule set')
}

// ── read-back verification ───────────────────────────────────────────────────
const SENDING_STATUSES = ['ACTIVE', 'START', 'STARTED', 'RUNNING']

async function verify(cfg, id, plan) {
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
  check(steps.length === plan.steps.length, `sequence has ${plan.steps.length} steps`, `${steps.length} steps`)
  check(accountRows.length === 0, 'zero email accounts attached', `${accountRows.length} attached`)
  check(leads.length === 0, 'zero leads', `${leads.length} leads`)
  check(campaign.scheduler_cron_value == null, 'no sending window (schedule unset)', JSON.stringify(campaign.scheduler_cron_value))

  for (const p of plan.steps) {
    const step = steps.find((s) => s.seq_number === p.number)
    const delay = step?.seq_delay_details?.delayInDays ?? step?.seq_delay_details?.delay_in_days
    check(delay === p.delayInDays, `step ${p.number} delay is ${p.delayInDays}d`, String(delay ?? '(missing)'))
    // With variants present, the step-level subject/body are empty BY DESIGN —
    // asserting that explicitly so emptiness never reads as a blanking bug.
    check(!(step?.subject || '').trim() && !(step?.email_body || '').length, `step ${p.number} step-level subject/body empty (content on variants)`, step ? 'empty' : '(missing)')

    const live = step?.sequence_variants || []
    check(live.length === p.variants.length, `step ${p.number} has ${p.variants.length} variants`, `${live.length} live`)
    for (const v of p.variants) {
      const lv = live.find((x) => x.variant_label === v.variant_label)
      if (!lv) { check(false, `step ${p.number} [${v.variant_label}] exists`, '(missing)'); continue }
      check((lv.subject ?? '') === v.subject, `step ${p.number} [${v.variant_label}] subject exact`, (lv.subject ?? '') === v.subject ? 'exact' : JSON.stringify(lv.subject))
      check((lv.email_body ?? '') === v.email_body, `step ${p.number} [${v.variant_label}] body byte-exact`, (lv.email_body ?? '') === v.email_body ? `${v.email_body.length}B` : `DIFFERS (${(lv.email_body ?? '').length}B vs ${v.email_body.length}B)`)
    }
  }

  const track = (campaign.track_settings || []).map((t) => t.replace('DONT_TRACK_', 'DONT_'))
  check(track.includes('DONT_EMAIL_OPEN'), 'open tracking OFF', JSON.stringify(campaign.track_settings))
  check(track.includes('DONT_LINK_CLICK'), 'click tracking OFF', JSON.stringify(campaign.track_settings))
  check(campaign.stop_lead_settings === 'REPLY_TO_AN_EMAIL', 'stop on reply', String(campaign.stop_lead_settings))
  check(campaign.send_as_plain_text === true, 'send as plain text', String(campaign.send_as_plain_text))

  rule(`read-back verification — ${cfg.key}`)
  console.log(`  campaign  ${campaign.id}  ${campaign.status}  ${campaign.name}`)
  const failed = checks.filter((c) => !c.ok)
  for (const c of checks) if (!c.ok) console.log(`  ✗ ${c.label.padEnd(48)} ${c.detail}`)
  console.log(`  ${checks.length - failed.length}/${checks.length} checks passed${failed.length ? '' : ' (all green)'}`)
  return { campaign, failed }
}

// ── main ─────────────────────────────────────────────────────────────────────
function findCampaign(cfg, rows) {
  const hits = rows.filter((c) => c.name === cfg.name || cfg.aliases.includes(c.name))
  if (hits.length > 1) throw new Error(`${cfg.key}: ${hits.length} campaigns match the name/aliases — resolve manually, refusing to guess`)
  return hits[0] || null
}

;(async () => {
  try {
    const plans = CAMPAIGNS.map((cfg) => ({ cfg, plan: parseCampaignFile(cfg.file, cfg.kind) }))
    const rows = await listCampaigns()
    const all = Array.isArray(rows) ? rows : []
    const found = Object.fromEntries(plans.map(({ cfg }) => [cfg.key, findCampaign(cfg, all)]))

    if (args.verify) {
      let bad = 0
      for (const { cfg, plan } of plans) {
        const existing = found[cfg.key]
        if (!existing) throw new Error(`--verify: no campaign named ${JSON.stringify(cfg.name)} (or an alias) on this account`)
        const { failed } = await verify(cfg, existing.id, plan)
        bad += failed.length
      }
      process.exit(bad ? 1 : 0)
    }

    for (const { cfg, plan } of plans) printCampaign(cfg, plan, found[cfg.key])
    printBlockers()

    if (!args.apply) {
      console.log('\nDry run. Nothing was written. Re-run with --apply to stage it in Smartlead.')
      return
    }

    let bad = 0
    for (const { cfg, plan } of plans) {
      rule(`applying — ${cfg.key}`)
      const existing = found[cfg.key]
      let id = existing?.id
      if (id) {
        const rename = existing.name === cfg.name ? '' : ` (renaming from ${JSON.stringify(existing.name)})`
        console.log(`  reusing campaign ${id}${rename} — updating settings + sequences in place`)
      } else {
        const created = await createCampaign({ name: cfg.name })
        id = created?.id ?? created?.campaign_id ?? created?.data?.id
        if (!id) throw new Error(`createCampaign returned no id: ${JSON.stringify(created).slice(0, 200)}`)
        console.log(`  created campaign ${id} (DRAFTED)`)
      }

      await updateCampaignSettings(id, settingsFor(cfg.name))
      console.log('  settings saved (name, plain text, no tracking, stop on reply)')
      await saveSequences(id, toSequencePayload(plan.steps))
      console.log(`  ${plan.steps.length} steps / ${plan.steps.reduce((n, s) => n + s.variants.length, 0)} variants saved`)

      const { failed } = await verify(cfg, id, plan)
      bad += failed.length
      if (failed.length) break // first write failure stops the run — do not push through
    }

    if (bad) {
      console.error(`\n${bad} check(s) failed — staged but not as specified. Fix before handing off.`)
      process.exit(1)
    }
    console.log('\nBoth staged and parked (DRAFTED, no senders, no leads, no schedule).')
    console.log('Nothing sends until the blockers above clear and a human presses Start in the UI.')
  } catch (e) {
    console.error('ERROR:', e.message)
    process.exit(1)
  }
})()
