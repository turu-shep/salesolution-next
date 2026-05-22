#!/usr/bin/env node
/**
 * Parity check: diff the new Next.js build against the live WordPress site,
 * one URL at a time. Surfaces missing or drifted SEO signals so they can be
 * fixed before cutover.
 *
 * Usage:
 *   node docs/strategy/scripts/parity-check.mjs                       # local vs prod
 *   node docs/strategy/scripts/parity-check.mjs --new=https://staging.salesolution.net
 *
 * For each URL, compares:
 *   - HTTP status
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - <meta property="og:title">
 *   - presence of JSON-LD
 *   - H1 text
 *
 * Differences are flagged but not failures by themselves — copy intentionally
 * tightens during the rebuild. Use the report as a checklist.
 */

import { parse } from 'node-html-parser'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)

const OLD_BASE = args.old ?? 'https://salesolution.net'
const NEW_BASE = args.new ?? 'http://localhost:3001'

const URLS = [
  '/',
  '/services/',
  '/services/ai-seo/',
  '/services/content-writing-services/',
  '/services/website-content-writing-packages/',
  '/services/website-development-design-services/',
  '/services/outbound-email-marketing-services/',
  '/contact-me/',
  '/unlock-growth-audit/',
  '/unlock-growth-audit/thank-you/',
  '/future-proof-your-seo/',
  '/book-growth-call/',
  '/constraint-sprint/',
  '/constraint-sprint/thank-you/',
  '/category/blog/',
  '/guides/',
  '/guides/seo-guides/',
  '/career-paths/',
  '/service-areas/',
  '/privacy-policy/',
  '/terms-of-service/',
  '/disclaimer/',
  // Sample of migrated content
  '/generative-engine-optimization-basic-to-advanced/',
  '/guides/website-launch-checklist-series-part-1-seo-and-crawling/',
]

async function fetchPage(base, path) {
  try {
    const res = await fetch(base + path, {
      headers: { 'user-agent': 'Mozilla/5.0 SaleSolution-Parity/1.0' },
      redirect: 'follow',
    })
    const html = await res.text()
    const root = parse(html)
    return {
      status: res.status,
      title: root.querySelector('title')?.text?.trim() ?? null,
      description: root.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
      canonical: root.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      ogTitle: root.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null,
      h1: root.querySelector('h1')?.text?.trim().slice(0, 120) ?? null,
      jsonLdBlocks: root.querySelectorAll('script[type="application/ld+json"]').length,
    }
  } catch (err) {
    return { status: 0, error: err.message }
  }
}

function pad(s, n) {
  s = (s ?? '').toString()
  return s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n)
}

console.log(`Parity check: ${OLD_BASE}  →  ${NEW_BASE}\n`)
console.log(pad('URL', 55), pad('PROD', 20), '→', pad('NEW', 20), 'NOTES')
console.log('─'.repeat(140))

const rows = []
for (const url of URLS) {
  const [oldPage, newPage] = await Promise.all([
    fetchPage(OLD_BASE, url),
    fetchPage(NEW_BASE, url),
  ])

  const notes = []
  if (oldPage.status !== newPage.status) {
    notes.push(`STATUS ${oldPage.status}→${newPage.status}`)
  }
  if ((oldPage.jsonLdBlocks ?? 0) > 0 && (newPage.jsonLdBlocks ?? 0) === 0) {
    notes.push('JSON-LD missing on new')
  }
  if (newPage.status === 200) {
    if (!newPage.title) notes.push('no <title>')
    if (!newPage.description) notes.push('no description')
    if (!newPage.canonical) notes.push('no canonical')
    if (!newPage.h1) notes.push('no H1')
  }

  console.log(
    pad(url, 55),
    pad(`${oldPage.status} jsonld:${oldPage.jsonLdBlocks ?? '?'}`, 20),
    '→',
    pad(`${newPage.status} jsonld:${newPage.jsonLdBlocks ?? '?'}`, 20),
    notes.length ? `⚠ ${notes.join(' · ')}` : '✓',
  )
  rows.push({ url, oldPage, newPage, notes })
}

console.log('\nSummary:')
const oks = rows.filter((r) => r.notes.length === 0).length
console.log(`  Clean parity:   ${oks} / ${rows.length}`)
console.log(`  With notes:     ${rows.length - oks} / ${rows.length}`)

const newJsonLdTotal = rows.reduce((sum, r) => sum + (r.newPage.jsonLdBlocks ?? 0), 0)
console.log(`  JSON-LD blocks emitted by new build (across all): ${newJsonLdTotal}`)
