#!/usr/bin/env node
/**
 * E4 observation render — ONE page load per target, zero interaction.
 *
 * Purpose (Step 0 evidence, `e4-headless-locators/01-prompt.md`): the gate
 * question is "what does robots.txt say about the specific path the render
 * would hit?" — which requires knowing the path. This script loads the locator
 * page exactly once in plain headless Chromium (no stealth patches, default
 * HeadlessChrome UA — §7.1 bans detection evasion, not browsers), records every
 * network request the page makes, and evaluates each against that host's
 * robots.txt rules offline. It performs NO searches, fills NO forms, clicks
 * nothing — if the dealer-data endpoint only fires on a user search, that fact
 * is the finding and the endpoint is identified from static bundle text
 * instead where possible.
 *
 * A 403/challenge on the page itself stops that target (recorded, no retry).
 * Output: emails/data/raw/e4-observe-<key>-2026-08-03.json
 */
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const RAW = resolve(HERE, '..', '..', 'data', 'raw')
const CAPTURED = '2026-08-03'

const TARGETS = {
  banner: 'https://www.bannerengineering.com/us/en/where-to-buy.html',
  skf: 'https://www.skf.com/us/support/find-a-distributor',
  festo: 'https://distributorlocator.festo.com/?locale=us-en',
  lincolnelectric:
    'https://mylincoln.lincolnelectric.com/northamerica/s/store-locator?language=en_US',
  boschrexroth: 'https://www.boschrexroth.com/en/us/contact/contact-locator/',
  pepperlfuchs:
    'https://www.pepperl-fuchs.com/en-us/support/customer-service/where-to-buy-gp62134',
  continental:
    'https://www.continental-industry.com/global/en/about-us/tools-services/distributor-locator',
  waltersurface: 'https://www.walter.com/us/where-to-buy',
  // Routed here from `linecard-locators` 2026-08-03: the two "empty list
  // containers" are `.ps-widget` mounts filled by PriceSpider (third-party
  // SaaS). `ps-key` / `ps-country` / `ps-config` ship in indsci's own meta —
  // public widget identifiers, not credentials. The wtb4 recipe assembles the
  // data request at runtime, so it is NOT statically derivable from the 6 KB
  // loader; this is the one target in the tier that genuinely needs a render.
  indsci: 'https://www.indsci.com/en/where-to-buy',
}

/** Parse robots.txt into user-agent:* rules. Mirror of _e4_evidence.py. */
function parseRobotsStar(text) {
  const rules = []
  let agents = []
  let inBlock = false
  let blockRules = []
  const flush = () => {
    if (agents.some((a) => a.includes('*')) && blockRules.length)
      rules.push(...blockRules)
    agents = []
    blockRules = []
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim()
    if (!line) continue
    const ua = line.match(/^user-agent\s*:\s*(.+)$/i)
    if (ua) {
      if (inBlock) {
        flush()
        inBlock = false
      }
      agents.push(ua[1].trim())
      continue
    }
    const rule = line.match(/^(dis)?allow\s*:\s*(.*)$/i)
    if (rule) {
      inBlock = true
      blockRules.push({ kind: rule[1] ? 'Disallow' : 'Allow', path: rule[2].trim() })
    }
  }
  flush()
  return rules
}

function ruleMatches(rulePath, urlPath) {
  if (!rulePath) return false
  let pat = rulePath.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  if (pat.endsWith('\\$')) pat = pat.slice(0, -2) + '$'
  return new RegExp('^' + pat).test(urlPath)
}

/** Longest-match RFC 9309 verdict for a URL against its own host's star rules. */
function robotsVerdict(rules, urlPath) {
  let best = null
  for (const r of rules) {
    if (!ruleMatches(r.path, urlPath)) continue
    if (!best || r.path.length > best.path.length) best = r
  }
  if (!best) return 'allowed'
  return best.kind === 'Disallow' ? `DISALLOWED by ${best.path}` : 'allowed'
}

async function fetchRobots(origin, cacheDirKey) {
  // reuse the python sweep's cached robots.txt when present — zero extra requests
  const cachePath = resolve(RAW, '_cache', `e4evidence-${cacheDirKey}`, 'robots.txt')
  if (existsSync(cachePath)) return readFileSync(cachePath, 'utf8')
  const res = await fetch(origin + '/robots.txt')
  if (!res.ok) return ''
  return await res.text()
}

async function observe(key, url) {
  const origin = new URL(url).origin
  const requests = []
  const browser = await chromium.launch({ headless: true })
  // Default context: honest HeadlessChrome UA, no stealth, no fingerprint games.
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('response', async (resp) => {
    const req = resp.request()
    requests.push({
      method: req.method(),
      url: req.url(),
      resource_type: req.resourceType(),
      status: resp.status(),
    })
  })
  page.on('requestfailed', (req) => {
    requests.push({
      method: req.method(),
      url: req.url(),
      resource_type: req.resourceType(),
      status: 'FAILED ' + (req.failure()?.errorText || ''),
    })
  })

  const out = { key, locator_url: url, captured: CAPTURED, mode: 'load-only, no interaction' }
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    out.page_status = resp ? resp.status() : null
    // settle: give SPAs time to hydrate, without interacting
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(4000)
    out.title = await page.title().catch(() => null)
    out.rendered_text_chars = await page
      .evaluate(() => document.body?.innerText?.length || 0)
      .catch(() => 0)
  } catch (e) {
    out.page_error = String(e).slice(0, 300)
  }
  await browser.close()

  // classify requests: same-site XHR/fetch are the data-path candidates
  const apex = new URL(url).host.replace(/^www\./, '')
  const hostOf = (u) => {
    try {
      return new URL(u).host
    } catch {
      return ''
    }
  }
  const sameSiteData = requests.filter(
    (r) => ['xhr', 'fetch'].includes(r.resource_type) && hostOf(r.url).endsWith(apex)
  )
  const thirdParty = [
    ...new Set(requests.map((r) => hostOf(r.url)).filter((h) => h && !h.endsWith(apex))),
  ].sort()

  // robots evaluation for every same-origin request this load actually made
  let robotsRules = []
  try {
    robotsRules = parseRobotsStar(await fetchRobots(origin, key))
  } catch {
    /* robots unreadable → treated as no star rules; recorded via robots_rules_read */
  }
  out.robots_rules_read = robotsRules.length
  const sameOrigin = requests.filter((r) => r.url.startsWith(origin))
  out.same_origin_requests = sameOrigin.map((r) => {
    const p = r.url.slice(origin.length).split('#')[0]
    return {
      method: r.method,
      path: p.length > 180 ? p.slice(0, 180) + '…' : p,
      resource_type: r.resource_type,
      status: r.status,
      robots: robotsVerdict(robotsRules, p),
    }
  })
  out.robots_violations_this_load = out.same_origin_requests.filter((r) =>
    String(r.robots).startsWith('DISALLOWED')
  )
  out.data_path_candidates = sameSiteData.map((r) => ({
    method: r.method,
    url: r.url.length > 200 ? r.url.slice(0, 200) + '…' : r.url,
    status: r.status,
  }))
  out.third_party_hosts = thirdParty
  out.total_requests = requests.length

  const outPath = join(RAW, `e4-observe-${key}-${CAPTURED}.json`)
  writeFileSync(outPath, JSON.stringify(out, null, 1))
  console.log(`\n=== ${key} page_status=${out.page_status} requests=${requests.length}`)
  console.log(`  data-path candidates (same-site xhr/fetch): ${out.data_path_candidates.length}`)
  for (const c of out.data_path_candidates.slice(0, 10))
    console.log(`    ${c.method} ${c.status} ${c.url}`)
  console.log(`  robots violations in this load: ${out.robots_violations_this_load.length}`)
  for (const v of out.robots_violations_this_load.slice(0, 10))
    console.log(`    ${v.robots} ← ${v.method} ${v.path}`)
  console.log(`  -> ${outPath}`)
  return out
}

const keys = process.argv.slice(2)
if (!keys.length) {
  console.error(`usage: node _e4_observe.mjs <key...>  (${Object.keys(TARGETS).join(' ')})`)
  process.exit(1)
}
mkdirSync(RAW, { recursive: true })
for (const key of keys) {
  if (!TARGETS[key]) {
    console.error(`unknown target ${key}`)
    continue
  }
  await observe(key, TARGETS[key])
}
