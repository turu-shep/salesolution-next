#!/usr/bin/env node
/**
 * Crawl every URL in sitemap.xml + the link graph one hop deep. Report any
 * internal hrefs that don't return 200.
 *
 * Usage:
 *   node docs/strategy/scripts/broken-link-check.mjs
 *   node docs/strategy/scripts/broken-link-check.mjs --base=http://localhost:3010
 */

import { parse } from 'node-html-parser'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const BASE = args.base ?? 'http://localhost:3010'

async function fetchOk(url) {
  try {
    const r = await fetch(url, { redirect: 'manual' })
    return r.status
  } catch (err) {
    return -1
  }
}

async function fetchHtml(url) {
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    return await r.text()
  } catch {
    return null
  }
}

// 1. Pull sitemap.
const sitemapXml = await fetchHtml(`${BASE}/sitemap.xml`)
const seedUrls = [...(sitemapXml ?? '').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .map((u) => u.replace(/^https?:\/\/[^/]+/, ''))

console.log(`Crawling ${seedUrls.length} URLs from sitemap…\n`)

// 2. Visit each, harvest every internal href.
const allInternalHrefs = new Set()
for (const path of seedUrls) {
  const html = await fetchHtml(BASE + path)
  if (!html) continue
  const root = parse(html)
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? ''
    // Strip fragments + query params for the parity check.
    const clean = href.split('#')[0].split('?')[0]
    if (!clean || clean.startsWith('mailto:') || clean.startsWith('tel:')) continue
    if (clean.startsWith('/')) {
      allInternalHrefs.add(clean)
    } else if (clean.startsWith(BASE) || clean.startsWith('https://salesolution.net')) {
      const stripped = clean.replace(/^https?:\/\/[^/]+/, '')
      allInternalHrefs.add(stripped)
    }
  }
}

console.log(`Found ${allInternalHrefs.size} unique internal hrefs. Checking…\n`)

// 3. Probe each.
const broken = []
const redirected = []
let okCount = 0
const sorted = [...allInternalHrefs].sort()
for (const href of sorted) {
  const status = await fetchOk(BASE + href)
  if (status === 200) {
    okCount++
  } else if (status === 301 || status === 308) {
    redirected.push({ href, status })
  } else {
    broken.push({ href, status })
  }
}

console.log(`OK (200):       ${okCount}`)
console.log(`Redirects:      ${redirected.length}`)
console.log(`Broken:         ${broken.length}`)

if (redirected.length) {
  console.log('\nRedirects (expected — most of these are configured 308s):')
  for (const r of redirected) console.log(`  ${r.status}  ${r.href}`)
}

if (broken.length) {
  console.log('\nBroken links — fix before launch:')
  for (const b of broken) console.log(`  ${b.status}  ${b.href}`)
  process.exit(1)
}
