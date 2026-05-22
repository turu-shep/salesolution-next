#!/usr/bin/env node
/**
 * Migrate the 9 existing WordPress guides → Sanity drafts.
 *
 * Mirrors docs/strategy/scripts/migrate-posts.mjs but writes `guide`
 * documents and detects series membership from the URL slug.
 *
 * Usage (from the repo root):
 *   node --env-file=.env.local docs/strategy/scripts/migrate-guides.mjs
 *   node --env-file=.env.local docs/strategy/scripts/migrate-guides.mjs --dry
 */

import { createClient } from '@sanity/client'
import { parse } from 'node-html-parser'
import { randomUUID } from 'node:crypto'

const DRY_RUN = process.argv.includes('--dry')

const GUIDE_URLS = [
  '/guide/website-launch-checklist-series-part-1-seo-and-crawling/',
  '/guide/website-performance-optimization-guide/',
  '/guides/wordpress-website-plugins-launch-checklist-part-3/',
  '/guides/website-legal-compliance-checklist-part-4/',
  '/guides/website-security-practices-website-launch-checklist-part-5/',
  '/guides/website-launch-checklist-part6-ui-ux-optimization/',
  '/guides/e-commerce-must-dos-website-launch-checklist-part-8/',
  '/guides/website-launch-checklist-part-7-analytics-outreach-ads/',
  '/guides/b2b-marketing-strategy-framework-with-example-7-step/',
]

const BASE = 'https://salesolution.net'
const SERIES_NAME = 'Website Launch Checklist'
const SERIES_TOTAL_PARTS = 8

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!DRY_RUN && (!projectId || !token)) {
  console.error('Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN.')
  console.error('Either set .env.local and run with `node --env-file=.env.local …`')
  console.error('or pass --dry to preview parsed payloads.')
  process.exit(1)
}

const client = DRY_RUN
  ? null
  : createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function key() { return randomUUID().slice(0, 12) }

const CATEGORY_HINTS = [
  ['security', 'website-development-and-design-guides'],
  ['ui-ux', 'website-development-and-design-guides'],
  ['plugins', 'website-development-and-design-guides'],
  ['performance', 'website-development-and-design-guides'],
  ['legal', 'website-development-and-design-guides'],
  ['analytics', 'seo-guides'],
  ['seo', 'seo-guides'],
  ['e-commerce', 'website-development-and-design-guides'],
  ['email', 'email-marketing-guides'],
  ['b2b-marketing', 'seo-guides'],
]

function inferCategory(slug) {
  for (const [hint, value] of CATEGORY_HINTS) {
    if (slug.includes(hint)) return value
  }
  return 'website-development-and-design-guides'
}

function inferSeries(slug) {
  // Look for "part-N", "partN", or "part #N" patterns.
  const m =
    slug.match(/part-(\d+)/i) ||
    slug.match(/part(\d+)/i)
  if (!m) return null
  return {
    name: SERIES_NAME,
    part: parseInt(m[1], 10),
    totalParts: SERIES_TOTAL_PARTS,
  }
}

function fetchPage(url) {
  return fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 SaleSolution-Migration/1.0' },
  }).then((r) => {
    if (!r.ok) throw new Error(`fetch ${url} → ${r.status}`)
    return r.text()
  })
}

function textBlock(text, style) {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

function listItem(text, listType) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem: listType,
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

function htmlToPortableText(root) {
  const blocks = []
  const article =
    root.querySelector('article') ??
    root.querySelector('.entry-content') ??
    root.querySelector('main') ??
    root

  function walk(node) {
    if (!node) return
    const tag = (node.tagName ?? '').toLowerCase()
    if (['script', 'style', 'noscript', 'iframe', 'aside', 'nav', 'footer'].includes(tag)) return

    if (['h2', 'h3', 'h4'].includes(tag)) {
      const t = node.text.trim()
      if (t) blocks.push(textBlock(t, tag))
      return
    }
    if (tag === 'p') {
      const t = node.text.trim()
      if (t) blocks.push(textBlock(t, 'normal'))
      return
    }
    if (tag === 'blockquote') {
      const t = node.text.trim()
      if (t) blocks.push(textBlock(t, 'blockquote'))
      return
    }
    if (tag === 'ul' || tag === 'ol') {
      const listType = tag === 'ul' ? 'bullet' : 'number'
      for (const li of node.querySelectorAll('li')) {
        const t = li.text.trim()
        if (t) blocks.push(listItem(t, listType))
      }
      return
    }
    if (tag === 'img') {
      const src = node.getAttribute('src')
      if (src) blocks.push(textBlock(`[image to re-upload: ${src}]`, 'normal'))
      return
    }

    for (const child of node.childNodes ?? []) walk(child)
  }
  walk(article)
  return blocks.length ? blocks : [textBlock('(body could not be extracted)', 'normal')]
}

function extractTitle(root) {
  const t = root.querySelector('title')?.text?.trim() ?? ''
  return t.replace(/\s*-\s*SaleSolution\s*$/, '').trim()
}

function extractDescription(root) {
  return root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()
}

function extractPublishedAt(root, html) {
  const meta = root.querySelector('meta[property="article:published_time"]')
  if (meta) return meta.getAttribute('content')
  const m = html.match(/"datePublished":"([^"]+)"/)
  return m?.[1]
}

function extractReadMinutes(root) {
  const m = root.text.match(/(\d+)\s*min(?:ute)?s?\s*read/i)
  return m ? parseInt(m[1], 10) : undefined
}

async function migrateOne(pathname) {
  const url = BASE + pathname
  console.log(`\n→ ${pathname}`)
  const html = await fetchPage(url)
  const root = parse(html)

  // Strip both `/guide/` and `/guides/` prefixes so the Sanity slug
  // standardises on the plural form. The redirect map already 301s the
  // singular URL to the plural one.
  const slug = pathname.replace(/^\/guides?\//, '').replace(/\/$/, '')
  const title = extractTitle(root)
  const description = extractDescription(root)
  const publishedAt = extractPublishedAt(root, html)
  const readTimeMinutes = extractReadMinutes(root)
  const body = htmlToPortableText(root)
  const series = inferSeries(slug)

  const doc = {
    _id: `drafts.guide-${slug}`,
    _type: 'guide',
    title,
    slug: { _type: 'slug', current: slug },
    description: description?.slice(0, 220) ?? undefined,
    publishedAt,
    readTimeMinutes,
    category: inferCategory(slug),
    series: series ?? undefined,
    body,
    seo: {
      metaTitle: title?.slice(0, 70),
      metaDescription: description?.slice(0, 180),
    },
  }

  console.log(`   title: ${doc.title?.slice(0, 70)}`)
  console.log(`   blocks: ${body.length}, category: ${doc.category}${series ? `, series: ${series.name} #${series.part}` : ''}`)

  if (DRY_RUN) return { ok: true, slug, dryRun: true }

  try {
    await client.createIfNotExists(doc)
    return { ok: true, slug }
  } catch (err) {
    return { ok: false, slug, error: err.message }
  }
}

console.log(`Sanity guide migration — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
console.log(`Target: ${projectId ?? '(no projectId set)'} / ${dataset}`)
console.log(`Guides: ${GUIDE_URLS.length}`)

const results = []
for (const url of GUIDE_URLS) {
  try {
    results.push(await migrateOne(url))
  } catch (err) {
    console.error(`   ✗ ${err.message}`)
    results.push({ ok: false, url, error: err.message })
  }
}

const ok = results.filter((r) => r.ok).length
const failed = results.length - ok
console.log(`\n────────────────────────────────────────`)
console.log(`Done. ok=${ok}  failed=${failed}`)
if (failed) {
  console.log('Failed:')
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  - ${r.slug ?? r.url}: ${r.error}`)
  }
}
if (!DRY_RUN) {
  console.log('\nNext: open Sanity Studio (/studio), assign cover images, publish.')
}
