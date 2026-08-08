/**
 * precall-scan — automated pre-call leak scanner.
 *
 * Seeds local-service prospects, then on a daily cron scans the next N (default
 * 100) for the leaks you open a cold call on — no website, slow site, not in the
 * map pack, skipped by AI, thin/neglected Google profile — and writes a ready
 * opener back into Sanity (`precallLead` docs). The /sales cockpit reads
 * `status == "scanned"` to fill the pre-call card.
 *
 *   node scripts/precall-scan.mjs --status
 *   node scripts/precall-scan.mjs --seed-search scripts/precall.targets.json
 *   node scripts/precall-scan.mjs --seed-csv leads.csv --vertical dental --source csv
 *   node scripts/precall-scan.mjs --scan --limit 100          # ← the daily cron
 *   node scripts/precall-scan.mjs --export --today --out precall-cards.json
 *
 * Secrets (.env.local — auto-loaded; or run with node --env-file=.env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN  (already set)
 *   DATAFORSEO_USERNAME, DATAFORSEO_PASSWORD  — DataForSEO REST basic-auth → required for --scan / --seed-search
 *                             (legacy DFS_LOGIN / DFS_PASSWORD still accepted)
 *   APOLLO_API_KEY            — optional → adds the owner's direct cell + email
 *
 * NOTE: the scan calls live DataForSEO + Apollo REST endpoints. It has not been
 * run end-to-end yet (keys pending). Per-prospect failures are caught and the
 * lead is marked `status:error` (with the reason) so the batch always finishes;
 * re-running --scan retries errored leads. The one endpoint to confirm on the
 * first live run is the AI-presence one (DFS_AI_PATH below) — it is best-effort
 * and a failure there never blocks the rest of a scan.
 */
import { readFileSync, existsSync } from 'node:fs'
import { writeFileSync } from 'node:fs'
import { parseCsv } from './lib/csv.mjs'

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const env = process.env
// DataForSEO REST basic-auth (PF-6). `.env.local` carries DATAFORSEO_USERNAME /
// DATAFORSEO_PASSWORD; this script and .env.local.example originally used
// DFS_LOGIN / DFS_PASSWORD, so every DFS call here failed. Accept both names,
// prefer DATAFORSEO_*. `||` not `??` — a declared-but-blank var must fall back.
const DFS_LOGIN = env.DATAFORSEO_USERNAME || env.DFS_LOGIN || ''
const DFS_PASSWORD = env.DATAFORSEO_PASSWORD || env.DFS_PASSWORD || ''
const DFS_AUTH =
  DFS_LOGIN && DFS_PASSWORD
    ? 'Basic ' + Buffer.from(`${DFS_LOGIN}:${DFS_PASSWORD}`).toString('base64')
    : null
const APOLLO_KEY = env.APOLLO_API_KEY || null
// Confirm against DataForSEO docs on first live run; best-effort either way.
const DFS_AI_PATH = env.DFS_AI_PATH || 'ai_optimization/chat_gpt/llm_responses/live/advanced'

// ── CLI ──────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { limit: 100, source: 'auto', out: 'precall-cards.json' }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    if (k === '--status') a.status = true
    else if (k === '--seed-search') a.seedSearch = argv[++i]
    else if (k === '--seed-csv') a.seedCsv = argv[++i]
    else if (k === '--scan') a.scan = true
    else if (k === '--export') a.export = true
    else if (k === '--today') a.today = true
    else if (k === '--limit') a.limit = Number(argv[++i])
    else if (k === '--vertical') a.vertical = argv[++i]
    else if (k === '--source') a.source = argv[++i]
    else if (k === '--out') a.out = argv[++i]
    else if (k === '--dry-run') a.dryRun = true
  }
  return a
}
const args = parseArgs(process.argv.slice(2))

// ── clients ──────────────────────────────────────────────────────────────────
async function sanityClient() {
  const { createClient } = await import('next-sanity')
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET
  const token = env.SANITY_API_WRITE_TOKEN
  if (!projectId || !dataset || !token) {
    throw new Error('Missing Sanity env (NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET / SANITY_API_WRITE_TOKEN).')
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-05-19',
    token,
    useCdn: false,
  })
}

const DFS_BASE = 'https://api.dataforseo.com/v3'
async function dfs(path, task) {
  if (!DFS_AUTH)
    throw new Error(
      'Missing DataForSEO credentials — set DATAFORSEO_USERNAME / DATAFORSEO_PASSWORD (or legacy DFS_LOGIN / DFS_PASSWORD) in .env.local',
    )
  const res = await fetch(`${DFS_BASE}/${path}`, {
    method: 'POST',
    headers: { Authorization: DFS_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify([task]),
  })
  if (!res.ok) throw new Error(`DFS ${path} HTTP ${res.status}`)
  const j = await res.json()
  const t = j.tasks && j.tasks[0]
  if (!t) throw new Error(`DFS ${path} returned no task`)
  if (t.status_code !== 20000) throw new Error(`DFS ${path} ${t.status_code}: ${t.status_message}`)
  return (t.result && t.result[0]) || null
}

async function apollo(path, body) {
  if (!APOLLO_KEY) return null
  const res = await fetch(`https://api.apollo.io/api/v1/${path}`, {
    method: 'POST',
    headers: { 'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  return res.json()
}

// ── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
const leadId = (it) => 'precallLead.' + (it.cid ? String(it.cid) : slug(`${it.name}-${it.city || ''}`))

function mapItemToLead(it, { vertical, source }) {
  return {
    name: it.title,
    cid: it.cid ? String(it.cid) : undefined,
    placeId: it.place_id,
    vertical: vertical || 'other',
    category: it.category,
    city: it.address_info?.city,
    region: it.address_info?.region,
    address: it.address,
    phone: it.phone,
    website: it.url || undefined,
    competitors: (it.people_also_search || [])
      .filter((c) => c.rating?.votes_count)
      .slice(0, 4)
      .map((c) => ({ _key: slug(c.title) || c.cid, name: c.title, rating: c.rating?.value, reviews: c.rating?.votes_count })),
    source: source || 'auto',
    status: 'queued',
  }
}

// ── seed: auto-pull from the GBP database ────────────────────────────────────
async function seedSearch(configPath) {
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  const client = await sanityClient()
  let created = 0
  for (const target of config) {
    const { vertical, categories, cities, limit = 30, is_claimed = true } = target
    for (const city of cities) {
      const result = await dfs('business_data/business_listings/search/live', {
        categories,
        location_coordinate: city.coordinate, // "lat,lng,radius_km"
        limit,
        is_claimed,
        order_by: target.order_by, // e.g. ["rating.votes_count,asc"]
        filters: target.filters, // e.g. [["rating.votes_count","<",130]]
      })
      const items = (result && result.items) || []
      for (const it of items) {
        if (!it.title) continue
        const lead = mapItemToLead({ ...it, city: city.name }, { vertical, source: 'auto' })
        const doc = { _id: leadId(it), _type: 'precallLead', ...lead }
        if (args.dryRun) console.log('would seed', doc.name, `(${doc.city})`)
        else { await client.createIfNotExists(doc); created++ }
      }
      await sleep(400)
    }
  }
  console.log(args.dryRun ? 'dry-run complete' : `seeded up to ${created} new leads (existing cids skipped)`) // createIfNotExists dedups
}

// ── seed: from a CSV ─────────────────────────────────────────────────────────
// parseCsv now lives in scripts/lib/csv.mjs — RFC 4180, quote-aware (PF-7).
// The old inline split(',') shifted every column right of a comma inside a
// field, and company names are full of commas.
async function seedCsv(path, { vertical }) {
  const client = await sanityClient()
  const rows = parseCsv(readFileSync(path, 'utf8'))
  let created = 0
  for (const r of rows) {
    const it = { name: r.name || r.business, city: r.city, region: r.region || r.state, phone: r.phone, url: r.website || r.site, address: r.address }
    if (!it.name) continue
    const doc = { _id: leadId(it), _type: 'precallLead', ...mapItemToLead(it, { vertical, source: 'csv' }), source: 'csv' }
    if (args.dryRun) console.log('would seed', doc.name)
    else { await client.createIfNotExists(doc); created++ }
  }
  console.log(args.dryRun ? 'dry-run complete' : `seeded up to ${created} CSV leads`)
}

// ── scan one prospect ────────────────────────────────────────────────────────
const VERTICAL_WORD = { dental: 'dentist', medical: 'practice', 'home-services': 'roofer', 'local-retail': 'shop', other: 'business' }

async function scanGbp(lead) {
  // CSV leads (or any without a cid) need a GBP lookup by name + city.
  if (lead.cid && lead.website !== undefined) {
    return { rating: null, reviews: null, photos: null, hasWebsite: !!lead.website, claimed: true, ratingTrusted: false }
  }
  const result = await dfs('business_data/business_listings/search/live', {
    title: lead.name,
    location_coordinate: lead.coordinate || undefined,
    limit: 1,
  })
  const it = result && result.items && result.items[0]
  if (!it) return { hasWebsite: !!lead.website, ratingTrusted: false }
  // A uniform "1 star / 1 review" is a known DataForSEO placeholder — don't trust it.
  const votes = it.rating?.votes_count
  const ratingTrusted = !(it.rating?.value === 1 && votes === 1)
  return {
    rating: it.rating?.value,
    reviews: votes,
    photos: it.total_photos,
    hasWebsite: !!(it.url || lead.website),
    claimed: it.is_claimed !== false,
    hoursStatus: it.work_time?.work_hours?.current_status,
    ratingTrusted,
    _url: it.url,
    _competitors: (it.people_also_search || []).filter((c) => c.rating?.votes_count).slice(0, 4)
      .map((c) => ({ _key: slug(c.title), name: c.title, rating: c.rating?.value, reviews: c.rating?.votes_count })),
  }
}

async function scanMapPack(lead) {
  const kw = `${VERTICAL_WORD[lead.vertical] || lead.category || 'business'} near me`
  const loc = lead.city ? `${lead.city},${lead.region || 'United States'}` : lead.region || 'United States'
  const result = await dfs('serp/google/organic/live/advanced', {
    keyword: kw,
    location_name: loc.includes('United States') ? loc : `${loc},United States`,
    language_code: 'en',
    device: 'mobile',
    depth: 20,
  })
  const items = (result && result.items) || []
  const pack = items.find((x) => x.type === 'local_pack')
  let rank = null
  const packItems = (pack && pack.items) || items.filter((x) => x.type === 'local_pack')
  packItems.forEach((p, i) => {
    if (p.title && lead.name && p.title.toLowerCase().includes(lead.name.toLowerCase().split(' ')[0])) rank = i + 1
  })
  return { keyword: kw, rank }
}

async function scanSite(url) {
  const result = await dfs('on_page/lighthouse/live/json', { url, for_mobile: true, enable_javascript: true })
  const it = result && result.items && result.items[0]
  if (!it) return null
  const A = it.audits || {}
  return {
    perfScore: it.categories?.performance?.score,
    lcpMs: A['largest-contentful-paint']?.numericValue,
    ttfbMs: A['server-response-time']?.numericValue,
    totalBytes: A['total-byte-weight']?.numericValue,
    cms: it.stackPacks?.[0]?.title,
  }
}

async function scanAi(lead) {
  // Best-effort. Wrapped by the caller — a failure here never blocks the scan.
  const word = VERTICAL_WORD[lead.vertical] || lead.category || 'business'
  const prompt = `Who are the best ${word}s in ${lead.city || lead.region || 'the area'}? List a few by name.`
  const result = await dfs(DFS_AI_PATH, { user_prompt: prompt })
  const text = JSON.stringify(result || '').toLowerCase()
  const first = (lead.name || '').toLowerCase().split(' ')[0]
  const named = first ? text.includes(first) : null
  const competitorsNamed = (lead.competitors || []).filter((c) => text.includes((c.name || '').toLowerCase().split(' ')[0])).map((c) => c.name)
  return { keyword: prompt, named, competitorsNamed }
}

async function scanOwner(lead) {
  if (!APOLLO_KEY || !lead.website) return null
  let domain
  try { domain = new URL(lead.website).hostname.replace(/^www\./, '') } catch { return null }
  const org = await apollo('organizations/enrich', { domain })
  const people = await apollo('mixed_people/search', {
    q_organization_domains: domain,
    person_seniorities: ['owner', 'founder', 'partner'],
    page: 1,
    per_page: 1,
  })
  const p = people?.people?.[0]
  if (!p && !org?.organization) return null
  return { name: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : undefined, title: p?.title, email: p?.email, phone: p?.organization?.phone || org?.organization?.phone }
}

// ── synthesis: signals → leaks → opener ──────────────────────────────────────
const SEV = { high: 3, med: 2, low: 1 }
function lastNameOf(lead) {
  if (lead.owner?.name) return lead.owner.name.split(' ').slice(-1)[0]
  const m = (lead.name || '').match(/(?:Dr\.?\s+)?([A-Z][a-z]+)/)
  return m ? m[1] : lead.name
}
function topCompetitor(lead) {
  return (lead.competitors || []).slice().sort((a, b) => (b.reviews || 0) - (a.reviews || 0))[0]
}

function synthesize(lead) {
  const { gbp = {}, mapPack, site, ai } = lead
  const leaks = []
  if (gbp.hasWebsite === false)
    leaks.push({ type: 'no-website', severity: 'high', finding: 'No website behind the Google listing — a found patient has nowhere to book.' })
  if (site && (site.lcpMs > 3000 || (site.perfScore != null && site.perfScore < 0.7)))
    leaks.push({ type: 'slow-site', severity: site.lcpMs > 4000 ? 'high' : 'med', finding: `Site loads in ~${(site.lcpMs / 1000).toFixed(1)}s (server response ~${Math.round(site.ttfbMs)}ms${site.cms ? `, ${site.cms}` : ''}).` })
  if (mapPack && mapPack.rank == null)
    leaks.push({ type: 'not-in-map-pack', severity: 'high', finding: `Not in the top-3 map pack for "${mapPack.keyword}" — the pack takes most of the local clicks.` })
  if (ai && ai.named === false)
    leaks.push({ type: 'ai-skip', severity: 'med', finding: `AI didn't name them for "best ${VERTICAL_WORD[lead.vertical] || 'business'}"${ai.competitorsNamed?.length ? ` — it named ${ai.competitorsNamed.slice(0, 2).join(', ')}` : ''}.` })
  const topComp = topCompetitor(lead)
  if (gbp.ratingTrusted && gbp.reviews != null && gbp.reviews < 20 && topComp && topComp.reviews > 100)
    leaks.push({ type: 'few-reviews', severity: 'med', finding: `${gbp.reviews} reviews while ${topComp.name} nearby has ${topComp.reviews}.` })
  if (gbp.photos != null && gbp.photos <= 1)
    leaks.push({ type: 'thin-gbp', severity: 'low', finding: `Only ${gbp.photos} photo on the Google listing — a neglected profile.` })

  leaks.sort((a, b) => SEV[b.severity] - SEV[a.severity])
  const primary = leaks[0]
  return { leaks, primaryLeak: primary?.type, opener: primary ? buildOpener(primary.type, lead) : undefined }
}

function buildOpener(type, lead) {
  const last = lastNameOf(lead)
  const hi = lead.vertical === 'dental' || lead.vertical === 'medical' ? `Dr. ${last}?` : `Is this ${last}?`
  const word = VERTICAL_WORD[lead.vertical] || lead.category || 'business'
  const cityPhrase = lead.city ? `in ${lead.city}` : 'near you'
  const topComp = topCompetitor(lead)
  const compPhrase = topComp ? `${topComp.name} comes up right next to you with a full one. ` : ''
  switch (type) {
    case 'no-website':
      return `${hi} I looked you up the way a new patient ${cityPhrase} would — found your Google listing, but there's no site behind it, no way to book. ${compPhrase}That's actually why I'm calling.`
    case 'slow-site':
      return `${hi} I pulled up your site the way someone deciding fast would — about ${(lead.site.lcpMs / 1000).toFixed(0)} seconds to load. People comparing two or three ${word}s don't wait that long; they tap the next one. That's why I'm calling.`
    case 'not-in-map-pack':
      return `${hi} I searched "${lead.mapPack.keyword}" the way a customer would — you're not in the top three that show on the map, and those take most of the calls. That's the gap I'm calling about.`
    case 'ai-skip':
      return `${hi} I asked ChatGPT for the best ${word} ${cityPhrase} — it named ${(lead.ai.competitorsNamed || ['a couple of others']).slice(0, 2).join(' and ') || 'a couple of others'}, not you. More people start there than you'd think. That's why I'm calling.`
    case 'few-reviews':
      return `${hi} I noticed ${topComp ? `${topComp.name} nearby is sitting on ${topComp.reviews} reviews` : 'the shops near you have hundreds of reviews'} while your listing's pretty quiet. That gap is costing you the click. That's why I'm calling.`
    default:
      return `${hi} I had a look at how you show up online and spotted something worth a quick mention. That's why I'm calling.`
  }
}

async function scanOne(lead) {
  const out = { ...lead }
  const gbp = await scanGbp(lead)
  out.gbp = { rating: gbp.rating, reviews: gbp.reviews, photos: gbp.photos, hasWebsite: gbp.hasWebsite, claimed: gbp.claimed, hoursStatus: gbp.hoursStatus, ratingTrusted: gbp.ratingTrusted }
  if (gbp._competitors?.length && !(out.competitors?.length)) out.competitors = gbp._competitors
  const website = lead.website || gbp._url
  if (website) out.website = website

  try { out.mapPack = await scanMapPack(out) } catch (e) { out._warn = (out._warn || '') + `mapPack:${e.message}; ` }
  if (website) { try { out.site = await scanSite(website) } catch (e) { out._warn = (out._warn || '') + `site:${e.message}; ` } }
  try { out.ai = await scanAi(out) } catch (e) { out._warn = (out._warn || '') + `ai:${e.message}; ` }
  try { const o = await scanOwner(out); if (o) out.owner = o } catch { /* optional */ }

  const synth = synthesize(out)
  return { ...out, ...synth }
}

// ── commands ─────────────────────────────────────────────────────────────────
async function runScan() {
  const client = await sanityClient()
  const queued = await client.fetch(
    `*[_type=="precallLead" && status in ["queued","error"]] | order(_createdAt asc) [0...$n]{ _id, name, cid, vertical, category, city, region, phone, website, competitors }`,
    { n: args.limit },
  )
  console.log(`scanning ${queued.length} leads…`)
  let ok = 0, err = 0
  for (const lead of queued) {
    try {
      const r = await scanOne(lead)
      const notes = r.gbp && r.gbp.ratingTrusted === false ? 'Rating came back as a placeholder and was not used.' : undefined
      await client
        .patch(lead._id)
        .set({
          status: 'scanned',
          scannedAt: new Date().toISOString(),
          scanError: null,
          website: r.website,
          competitors: r.competitors,
          gbp: r.gbp,
          mapPack: r.mapPack,
          site: r.site,
          ai: r.ai,
          owner: r.owner,
          leaks: (r.leaks || []).map((l) => ({ _key: l.type, ...l })),
          primaryLeak: r.primaryLeak,
          opener: r.opener,
          notes: r._warn ? `${notes ? notes + ' ' : ''}Partial: ${r._warn}` : notes,
        })
        .commit()
      ok++
      console.log(`  ✓ ${lead.name} → ${r.primaryLeak || 'no leak found'}`)
    } catch (e) {
      err++
      await client.patch(lead._id).set({ status: 'error', scanError: String(e.message).slice(0, 300) }).commit()
      console.log(`  ✗ ${lead.name} → ${e.message}`)
    }
    await sleep(500)
  }
  console.log(`done. scanned ${ok}, errored ${err}.`)
}

async function runStatus() {
  const client = await sanityClient()
  const c = await client.fetch(`{
    "queued": count(*[_type=="precallLead" && status=="queued"]),
    "scanned": count(*[_type=="precallLead" && status=="scanned"]),
    "error": count(*[_type=="precallLead" && status=="error"]),
    "withLeak": count(*[_type=="precallLead" && status=="scanned" && defined(primaryLeak)])
  }`)
  console.log(`pre-call leads — queued:${c.queued}  scanned:${c.scanned}  error:${c.error}  (with a leak found:${c.withLeak})`)
}

async function runExport() {
  const client = await sanityClient()
  const since = args.today ? new Date(Date.now() - 24 * 3600 * 1000).toISOString() : '1970-01-01T00:00:00Z'
  const docs = await client.fetch(
    `*[_type=="precallLead" && status=="scanned" && scannedAt >= $since] | order(scannedAt desc){ name, vertical, city, phone, website, primaryLeak, opener, "leaks": leaks[]{type,severity,finding}, owner }`,
    { since },
  )
  // cockpit precall.items shape: { action (the leak), detail (evidence), openerFuel }
  const cards = docs.map((d) => ({
    prospect: d.name,
    phone: d.owner?.phone || d.phone,
    vertical: d.vertical,
    items: (d.leaks || []).map((l) => ({ action: `${l.type} — ${d.name}`, detail: l.finding, openerFuel: l.type === d.primaryLeak ? d.opener : undefined })),
  }))
  writeFileSync(args.out, JSON.stringify(cards, null, 2))
  console.log(`exported ${cards.length} cards → ${args.out}`)
}

// ── main ─────────────────────────────────────────────────────────────────────
;(async () => {
  try {
    if (args.status) await runStatus()
    else if (args.seedSearch) await seedSearch(args.seedSearch)
    else if (args.seedCsv) await seedCsv(args.seedCsv, args)
    else if (args.scan) await runScan()
    else if (args.export) await runExport()
    else console.log('Specify one of: --status | --seed-search <cfg.json> | --seed-csv <file> | --scan | --export')
  } catch (e) {
    console.error('ERROR:', e.message)
    process.exit(1)
  }
})()
