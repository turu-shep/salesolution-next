/**
 * rollup_rosters — fetch the three PE roll-up acquisition rosters.
 *
 * Workstream: emails/handoff/industrial-contact-list/rollup-rosters/ (step 2).
 * NOT a lead source — a disqualification feed. Adds zero contacts.
 *
 *   singerindustrial.com/brands                  operating-company table (name, region, categories, website)
 *   singerindustrial.com/category/press-releases/  archive walk /page/N until 404; per-article
 *                                                article:published_time meta supplies the date
 *   mceautomation.com/about/mce-companies        MCE roster by category
 *   mceautomation.com/about/news                 dated announcements (MM.DD.YYYY in the listing)
 *   sun-source.com                               ONE attempt, result recorded, never escalated.
 *                                                2026-08-03: serves a 200 JS shell (client-side
 *                                                render, no content in payload) — roster stays
 *                                                second-hand, per the workstream prompt.
 *   unitedcentral.net/our-company                the confirmed SunSource-relationship pattern
 *
 * All fetches ride lib/fetch.mjs: ≥3s/host, serial per origin, disk cache
 * (re-run = zero origin requests), honest UA, 403 stops the host.
 *
 * Writes emails/data/raw/rollup-rosters/rosters-<date>.json. Full bodies stay
 * in the polite-fetch cache; this file holds the parse + provenance.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'node-html-parser'
import { politeFetch } from '../lib/fetch.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(HERE, '..', '..', 'data', 'raw', 'rollup-rosters')
const TODAY = new Date().toISOString().slice(0, 10)

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim()
const apex = (url) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

// ── Singer ───────────────────────────────────────────────────────────────────

async function singerBrands() {
  const r = await politeFetch('https://singerindustrial.com/brands', { label: 'singer /brands' })
  const root = parse(r.body)
  const rows = root.querySelectorAll('tr').filter((tr) => tr.querySelector('.sbp-brands-col-name'))
  const brands = rows.map((tr) => {
    const img = tr.querySelector('.sbp-brands-col-image img')
    const link = tr.querySelector('.sbp-brands-col-link a')
    const site = link?.getAttribute('href') || null
    return {
      name: clean(tr.querySelector('.sbp-brands-col-name')?.text),
      alt_name: clean(img?.getAttribute('alt')).replace(/ a Singer Industrial Company logo$/i, ''),
      region: clean(tr.querySelector('.sbp-brands-col-region')?.text),
      categories: clean(tr.querySelector('.sbp-brands-col-categories')?.text),
      website: site,
      domain: site ? apex(site) : null,
    }
  })
  return { source_url: r.source_url, captured: r.captured, brands }
}

async function singerReleases() {
  const posts = new Map() // href → title
  for (let page = 1; page <= 30; page++) {
    const url =
      page === 1
        ? 'https://singerindustrial.com/category/press-releases/'
        : `https://singerindustrial.com/category/press-releases/page/${page}/`
    let r
    try {
      r = await politeFetch(url, { label: `singer PR p${page}` })
    } catch (e) {
      if (/HTTP 404/.test(e.message)) break // past the last page — the expected stop
      throw e
    }
    const root = parse(r.body)
    const arts = root.querySelectorAll('article')
    if (!arts.length) break
    let added = 0
    for (const a of arts) {
      const h = a.querySelector('h1 a, h2 a, h3 a, h4 a')
      const href = h?.getAttribute('href')
      if (href && !posts.has(href)) {
        posts.set(href, clean(h.text))
        added++
      }
    }
    if (!added) break // a page that repeats what we have = the archive looped
  }

  // Per-article fetch for the published date (the listing renders none).
  const releases = []
  for (const [url, title] of posts) {
    const r = await politeFetch(url, { label: `singer article ${url.split('/').filter(Boolean).pop().slice(0, 40)}` })
    const root = parse(r.body)
    const published = root
      .querySelectorAll('meta')
      .find((m) => m.getAttribute('property') === 'article:published_time')
      ?.getAttribute('content')
    releases.push({ title, url, published: published ? published.slice(0, 10) : null })
  }
  releases.sort((a, b) => (b.published || '').localeCompare(a.published || ''))
  return releases
}

// ── MCE ──────────────────────────────────────────────────────────────────────

async function mceCompanies() {
  const r = await politeFetch('https://mceautomation.com/about/mce-companies', { label: 'mce companies' })
  const root = parse(r.body)
  // Company entries carry an external website link; name from link text or img alt.
  const out = []
  const seen = new Set()
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || ''
    if (!/^https?:/.test(href)) continue
    const d = apex(href)
    if (!d || d.endsWith('mceautomation.com') || /linkedin|facebook|twitter|instagram|youtube|google/.test(d)) continue
    const text = clean(a.text) || clean(a.querySelector('img')?.getAttribute('alt'))
    const key = `${d}|${text}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: text || null, website: href, domain: d })
  }
  return { source_url: r.source_url, captured: r.captured, entries: out }
}

async function mceNews() {
  const r = await politeFetch('https://mceautomation.com/about/news', { label: 'mce news' })
  const root = parse(r.body)
  const items = []
  const seen = new Set()
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || ''
    if (!href.includes('/about/news/') || href.endsWith('/about/news')) continue
    const text = clean(a.text)
    const m = text.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(.*)$/)
    if (!m) continue
    if (seen.has(href)) continue
    seen.add(href)
    items.push({ date: `${m[3]}-${m[1]}-${m[2]}`, headline: m[4], url: href })
  }
  items.sort((a, b) => b.date.localeCompare(a.date))
  return { source_url: r.source_url, captured: r.captured, items }
}

// ── SunSource (one attempt, recorded; never escalated) ───────────────────────

async function sunsourceAttempt() {
  const r = await politeFetch('https://sun-source.com', { label: 'sun-source.com (single attempt)' })
  const root = parse(r.body)
  const title = clean(root.querySelector('title')?.text)
  const contentText = clean(root.querySelector('body')?.structuredText || '')
  return {
    source_url: r.source_url,
    captured: r.captured,
    status: r.status,
    bytes: r.body.length,
    title: title || null,
    script_tags: (r.body.match(/<script/g) || []).length,
    div_tags: (r.body.match(/<div/g) || []).length,
    readable_content_chars: contentText.length,
    verdict:
      'HTTP 200 with a full-size payload that is a client-side-rendered app shell (GTM bootstrap + framework scripts, no CMS content in the HTML). Not a block. Roster stays second-hand; no headless render per policy.',
  }
}

async function unitedCentral() {
  const r = await politeFetch('https://unitedcentral.net/our-company', { label: 'unitedcentral /our-company' })
  const text = clean(parse(r.body).text)
  const idx = text.toLowerCase().indexOf('sunsource')
  return {
    source_url: r.source_url,
    captured: r.captured,
    sunsource_mention: idx >= 0 ? text.slice(Math.max(0, idx - 220), idx + 220) : null,
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

const singer = await singerBrands()
const releases = await singerReleases()
const mce = await mceCompanies()
const news = await mceNews()
const sunsource = await sunsourceAttempt()
const uc = await unitedCentral()

const out = {
  captured: TODAY,
  singer: { ...singer, releases },
  mce: { companies: mce, news },
  sunsource: { attempt: sunsource, unitedcentral: uc },
}

mkdirSync(OUT_DIR, { recursive: true })
const outPath = join(OUT_DIR, `rosters-${TODAY}.json`)
writeFileSync(outPath, JSON.stringify(out, null, 2))

console.log(`singer brands: ${singer.brands.length} rows (${new Set(singer.brands.map((b) => b.domain).filter(Boolean)).size} distinct domains)`)
console.log(`singer releases: ${releases.length} (${releases.filter((x) => x.published).length} dated)`)
console.log(`mce companies page: ${mce.entries.length} external-site entries`)
console.log(`mce news: ${news.items.length} dated items (${news.items.filter((i) => /acquisition/i.test(i.headline)).length} acquisition announcements)`)
console.log(`sun-source.com: HTTP ${sunsource.status}, ${sunsource.bytes} bytes, readable content ${sunsource.readable_content_chars} chars — ${sunsource.title ? 'has title' : 'NO title'}`)
console.log(`unitedcentral mention: ${uc.sunsource_mention ? 'FOUND' : 'not found'}`)
console.log(`→ ${outPath}`)
