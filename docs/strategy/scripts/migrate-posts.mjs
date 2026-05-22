#!/usr/bin/env node
/**
 * Migrate the 19 existing WordPress posts → Sanity drafts.
 *
 * Usage (from the repo root):
 *   node --env-file=.env.local docs/strategy/scripts/migrate-posts.mjs
 *   node --env-file=.env.local docs/strategy/scripts/migrate-posts.mjs --dry
 *
 * What it does:
 *   1. Iterates POST_URLS (the 19 indexed posts from the live sitemap)
 *   2. Fetches each page's HTML
 *   3. Extracts title, slug, description, published date, body HTML
 *   4. Converts body HTML → Sanity portable text (basic mapping; inline
 *      images and code blocks are best-effort, refine in Studio)
 *   5. Creates a DRAFT document via the Sanity write API
 *
 * What it doesn't do (refine in Studio):
 *   - Upload cover images (stays empty, user uploads in Studio)
 *   - Migrate inline images (kept as `<img>` references in plain text — Studio
 *     will surface them as warnings to address)
 *   - FAQ extraction (some posts have FAQ blocks — manual)
 *
 * Reuse: re-running with the same slug skips (Sanity rejects duplicate _id).
 *
 * Env required:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   NEXT_PUBLIC_SANITY_API_VERSION
 *   SANITY_API_WRITE_TOKEN
 */

import { createClient } from '@sanity/client'
import { parse } from 'node-html-parser'
import { randomUUID } from 'node:crypto'

const DRY_RUN = process.argv.includes('--dry')

const POST_URLS = [
  '/content-marketing-101/',
  '/generative-engine-optimization-basic-to-advanced/',
  '/the-art-of-profitable-words-mastering-b2b-content-writing/',
  '/direct-vs-organic-traffic-differences-acquisition/',
  '/seo-mastery-enhancing-visibility-customer-attraction/',
  '/on-page-seo-mastery-from-visibility-to-conversion/',
  '/technical-seo-mastering-website-optimization/',
  '/seo-strategy-template-2024-guide-goals-and-kpi/',
  '/crafting-an-effective-e-commerce-funnel-for-2024/',
  '/which-reports-indicate-how-traffic-arrived-at-a-website/',
  '/strategies-to-increase-e-commerce-conversion-rate/',
  '/mastering-e-commerce-content-writing-guide-2023/',
  '/what-is-content-writing-master-the-science-of-web-writing-in-2023/',
  '/user-intent-seo-guide-to-search-behavior-understanding/',
  '/off-page-seo-in-depth-guide/',
  '/b2b-data-driven-marketing-no-more-guesswork/',
  '/content-strategy-expert-backed-guide-2023/',
  '/ultimate-guide-mastering-keyword-research-2023/',
  '/long-tail-keywords-blueprint-2023/',
]

const BASE = 'https://salesolution.net'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
const token     = process.env.SANITY_API_WRITE_TOKEN

if (!DRY_RUN && (!projectId || !token)) {
  console.error('Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN.')
  console.error('Either set .env.local and run with `node --env-file=.env.local …`')
  console.error('or pass --dry to print parsed payloads without creating documents.')
  process.exit(1)
}

const client = DRY_RUN
  ? null
  : createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// Map WordPress-style classnames to our Sanity post category options.
const CATEGORY_HINTS = [
  ['content-writing', 'content-writing'],
  ['content-marketing', 'content-marketing'],
  ['generative-engine', 'geo'],
  ['b2b-marketing', 'b2b-marketing'],
  ['b2b-', 'b2b'],
  ['e-commerce', 'ecommerce'],
  ['ecommerce', 'ecommerce'],
  ['marketing-strategy', 'marketing-strategy'],
  ['traffic', 'traffic'],
  ['woocommerce', 'woocommerce'],
  ['seo', 'seo'],
]

function inferCategory(slug) {
  for (const [hint, value] of CATEGORY_HINTS) {
    if (slug.includes(hint)) return value
  }
  return 'seo'
}

function fetchPage(url) {
  return fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 SaleSolution-Migration/1.0' },
  }).then((r) => {
    if (!r.ok) throw new Error(`fetch ${url} → ${r.status}`)
    return r.text()
  })
}

function key() { return randomUUID().slice(0, 12) }

/** Convert a parsed DOM body into Sanity portable-text blocks. */
function htmlToPortableText(root) {
  const blocks = []

  const article = root.querySelector('article') ?? root.querySelector('.entry-content') ?? root.querySelector('main') ?? root

  function walk(node) {
    if (!node) return
    const tag = (node.tagName ?? '').toLowerCase()

    if (['script', 'style', 'noscript', 'iframe', 'aside', 'nav', 'footer'].includes(tag)) return

    if (['h2', 'h3', 'h4'].includes(tag)) {
      const text = node.text.trim()
      if (text) blocks.push(textBlock(text, tag))
      return
    }

    if (tag === 'p') {
      const text = node.text.trim()
      if (text) blocks.push(textBlock(text, 'normal'))
      return
    }

    if (tag === 'blockquote') {
      const text = node.text.trim()
      if (text) blocks.push(textBlock(text, 'blockquote'))
      return
    }

    if (tag === 'ul' || tag === 'ol') {
      const listType = tag === 'ul' ? 'bullet' : 'number'
      for (const li of node.querySelectorAll('li')) {
        const text = li.text.trim()
        if (text) blocks.push(listItem(text, listType))
      }
      return
    }

    if (tag === 'img') {
      // Skipped; user re-inserts via Studio. Note as a placeholder paragraph so
      // editor sees a marker.
      const src = node.getAttribute('src')
      if (src) {
        blocks.push(textBlock(`[image to re-upload: ${src}]`, 'normal'))
      }
      return
    }

    // Recurse for structural containers.
    for (const child of node.childNodes ?? []) walk(child)
  }

  walk(article)
  return blocks.length ? blocks : [textBlock('(body could not be extracted — see WordPress original)', 'normal')]
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

function extractPublishedAt(root, html) {
  const meta = root.querySelector('meta[property="article:published_time"]')
  if (meta) return meta.getAttribute('content')
  const m = html.match(/"datePublished":"([^"]+)"/)
  return m?.[1]
}

function extractDescription(root) {
  return root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()
}

function extractTitle(root) {
  // Page <title> includes site name; strip it.
  const t = root.querySelector('title')?.text?.trim() ?? ''
  return t.replace(/\s*-\s*SaleSolution\s*$/, '').trim()
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

  const slug = pathname.replace(/^\/|\/$/g, '')
  const title = extractTitle(root)
  const description = extractDescription(root)
  const publishedAt = extractPublishedAt(root, html)
  const readTimeMinutes = extractReadMinutes(root)
  const body = htmlToPortableText(root)

  const doc = {
    // `drafts.` prefix forces draft state. Sanity Studio shows it as
    // editable / unpublished.
    _id: `drafts.post-${slug}`,
    _type: 'post',
    title,
    slug: { _type: 'slug', current: slug },
    description: description?.slice(0, 220) ?? undefined,
    publishedAt,
    readTimeMinutes,
    category: inferCategory(slug),
    body,
    seo: {
      metaTitle: title?.slice(0, 70),
      metaDescription: description?.slice(0, 180),
    },
  }

  console.log(`   title: ${doc.title?.slice(0, 70)}`)
  console.log(`   blocks: ${body.length}, category: ${doc.category}`)

  if (DRY_RUN) return { ok: true, slug, dryRun: true }

  try {
    await client.createIfNotExists(doc)
    return { ok: true, slug }
  } catch (err) {
    return { ok: false, slug, error: err.message }
  }
}

console.log(`Sanity post migration — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
console.log(`Target: ${projectId ?? '(no projectId set)'} / ${dataset}`)
console.log(`Posts:  ${POST_URLS.length}`)

const results = []
for (const url of POST_URLS) {
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
  console.log('\nNext: open Sanity Studio (/studio) and review the imported drafts.')
}
