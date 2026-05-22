#!/usr/bin/env node
/**
 * Backfill cover + inline images for posts and guides that were imported from
 * the WordPress site by migrate-posts.mjs / migrate-guides.mjs.
 *
 * Those scripts intentionally skipped image upload — covers were left empty
 * and inline `<img>` tags became placeholder text blocks of the form
 *   [image to re-upload: <src>]
 * This script refetches each doc's original URL on salesolution.net, uploads
 * the og:image as the cover and every placeholder's source as an inline image
 * asset, then patches the Sanity doc to point at the uploaded assets.
 *
 * Usage (from the repo root):
 *   node --env-file=.env.local "docs/strategy/initial migration/scripts/backfill-images.mjs" --dry
 *   node --env-file=.env.local "docs/strategy/initial migration/scripts/backfill-images.mjs"
 *   node --env-file=.env.local "…/backfill-images.mjs" --type=post
 *   node --env-file=.env.local "…/backfill-images.mjs" --slug=content-marketing-101
 *
 * Idempotent: a doc with coverImage set AND no remaining placeholder blocks
 * is a no-op. Re-running after a partial failure picks up where it left off.
 */

import { createClient } from '@sanity/client'
import { parse } from 'node-html-parser'
import { randomUUID } from 'node:crypto'

const DRY_RUN = process.argv.includes('--dry')
const ONLY_TYPE = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1]
const ONLY_SLUG = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1]

const BASE = 'https://salesolution.net'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Set it in .env.local.')
  process.exit(1)
}
if (!DRY_RUN && !token) {
  console.error('Missing SANITY_API_WRITE_TOKEN. Set it in .env.local, or pass --dry.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  // 'raw' returns both drafts.X and X so we can patch whichever exists.
  perspective: 'raw',
})

function key() { return randomUUID().slice(0, 12) }

// ── HTML extraction ─────────────────────────────────────────────────────────

// WordPress theme chrome we never want as content: site logo, favicons,
// the in-article share buttons and the author chip image. Anything served
// from `/themes/` is template furniture, not editorial content.
const SKIP_URL_PATTERNS = [
  /\/themes\//i,
  /cropped-logo-mini-draft-blue/i,
  /cropped-android-chrome/i,
  /\bfavicon\b/i,
  /\bicon-\d/i,
  /guide-autor/i,
  /guide-sharing/i,
]

function shouldSkipImage(src) {
  return SKIP_URL_PATTERNS.some((p) => p.test(src))
}

/** Resolve the actual image URL, preferring lazy-loaded data-src over a data: URI placeholder. */
function imgSrc(img) {
  const src = img.getAttribute('src') ?? ''
  if (src.startsWith('data:')) {
    return (
      img.getAttribute('data-src') ??
      img.getAttribute('data-lazy-src') ??
      img.getAttribute('data-orig-file') ??
      null
    )
  }
  return src || null
}

async function fetchHtml(url) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'SaleSolution-Backfill/1.0' },
    redirect: 'follow',
  })
  if (!r.ok) throw new Error(`fetch ${url} → ${r.status}`)
  return r.text()
}

function getArticleRoot(root) {
  return (
    root.querySelector('article') ??
    root.querySelector('.entry-content') ??
    root.querySelector('main') ??
    root
  )
}

function getCoverSrc(root) {
  const og = root.querySelector('meta[property="og:image"]')?.getAttribute('content')
  return og || null
}

function collectInlineImages(article) {
  const out = []
  const seen = new Set()
  for (const img of article.querySelectorAll('img')) {
    const src = imgSrc(img)
    if (!src || src.startsWith('data:')) continue
    if (shouldSkipImage(src)) continue
    if (seen.has(src)) continue
    seen.add(src)
    out.push({ src, alt: img.getAttribute('alt') ?? '' })
  }
  return out
}

// ── Sanity upload + patch ───────────────────────────────────────────────────

const assetCache = new Map() // src → assetId, reused across docs

async function uploadAsset(src) {
  if (assetCache.has(src)) return assetCache.get(src)
  const r = await fetch(src, { redirect: 'follow' })
  if (!r.ok) throw new Error(`image ${src} → ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  const contentType = r.headers.get('content-type') ?? 'application/octet-stream'
  const filename = decodeURIComponent(new URL(src).pathname.split('/').pop() || 'image')
  const asset = await client.assets.upload('image', buf, { filename, contentType })
  assetCache.set(src, asset._id)
  return asset._id
}

function imageBlock(assetId, alt) {
  return {
    _type: 'image',
    _key: key(),
    alt,
    asset: { _type: 'reference', _ref: assetId },
  }
}

function placeholderSrcOf(block) {
  if (block?._type !== 'block') return null
  const text = block.children?.map((c) => c.text ?? '').join('') ?? ''
  return text.match(/^\[image to re-upload: (.+)\]$/)?.[1] ?? null
}

/**
 * Walk the body, rewriting placeholder text blocks:
 *   - if the src is the cover image → drop the block (hero already shows it)
 *   - if the src is junk (theme chrome) → drop the block
 *   - if the src was uploaded as an inline asset → replace with image block
 *   - otherwise → leave as-is for editors to investigate in Studio
 */
function rebuildBody(body, srcToAssetId, srcToAlt, coverSrc) {
  const out = []
  for (const b of body) {
    const src = placeholderSrcOf(b)
    if (!src) { out.push(b); continue }
    if (coverSrc && src === coverSrc) continue
    if (shouldSkipImage(src)) continue
    const assetId = srcToAssetId.get(src)
    if (assetId) {
      out.push(imageBlock(assetId, srcToAlt.get(src) ?? ''))
    } else {
      out.push(b)
    }
  }
  return out
}

// ── Per-doc processing ──────────────────────────────────────────────────────

function sourceUrl(type, slug) {
  if (type === 'guide') {
    // Both `/guide/<slug>/` and `/guides/<slug>/` exist on the live site;
    // the non-canonical one 301s to the canonical and fetch follows redirects.
    return `${BASE}/guides/${slug}/`
  }
  return `${BASE}/${slug}/`
}

async function processDoc(doc) {
  const slug = doc.slug
  console.log(`\n→ [${doc._type}] ${doc._id}  (${slug})`)

  const allPlaceholders = (doc.body ?? []).map(placeholderSrcOf).filter(Boolean)
  // Skip uploading theme chrome — those placeholders will be deleted, not
  // replaced. Skip the cover too; it's handled separately and shown by the hero.
  const placeholderSrcs = new Set(allPlaceholders.filter((s) => !shouldSkipImage(s)))
  const droppablePlaceholders = allPlaceholders.length - placeholderSrcs.size
  const needsCover = !doc.coverImage?.asset?._ref
  if (!needsCover && placeholderSrcs.size === 0 && droppablePlaceholders === 0) {
    console.log('   (already backfilled — nothing to do)')
    return { ok: true, slug, noop: true }
  }

  const url = sourceUrl(doc._type, slug)
  console.log(`   source: ${url}`)
  const html = await fetchHtml(url)
  const root = parse(html)

  const coverSrc = needsCover ? getCoverSrc(root) : null
  const inline = collectInlineImages(getArticleRoot(root))
  const inlineAltBySrc = new Map(inline.map((i) => [i.src, i.alt]))

  console.log(
    `   needs cover: ${needsCover}` +
      `${coverSrc ? ' (og:image found)' : needsCover ? ' (no og:image!)' : ''}` +
      `   placeholders: ${placeholderSrcs.size} content + ${droppablePlaceholders} chrome (drop)`,
  )

  if (DRY_RUN) return { ok: true, slug, dryRun: true }

  const srcToAssetId = new Map()
  let coverAssetId = null

  if (needsCover && coverSrc) {
    try {
      coverAssetId = await uploadAsset(coverSrc)
      srcToAssetId.set(coverSrc, coverAssetId)
      console.log(`   ✓ cover  → ${coverAssetId}`)
    } catch (err) {
      console.log(`   ✗ cover  ${err.message}`)
    }
  }

  for (const src of placeholderSrcs) {
    try {
      const id = await uploadAsset(src)
      srcToAssetId.set(src, id)
      console.log(`   ✓ inline ${src.split('/').pop()} → ${id}`)
    } catch (err) {
      console.log(`   ✗ inline ${src.split('/').pop()}  ${err.message}`)
    }
  }

  const patch = {}
  if (coverAssetId) {
    patch.coverImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: coverAssetId },
      alt: doc.title ?? '',
    }
  }
  if (doc.body) {
    const newBody = rebuildBody(doc.body, srcToAssetId, inlineAltBySrc, coverSrc)
    if (newBody.length !== doc.body.length || newBody.some((b, i) => b !== doc.body[i])) {
      patch.body = newBody
    }
  }

  if (Object.keys(patch).length === 0) {
    console.log('   (nothing patched — no uploads succeeded)')
    return { ok: true, slug, noop: true }
  }

  await client.patch(doc._id).set(patch).commit({ visibility: 'async' })
  console.log(`   ✓ patched ${doc._id}`)
  return { ok: true, slug }
}

// ── Driver ──────────────────────────────────────────────────────────────────

const typeFilter = ONLY_TYPE
  ? `_type == "${ONLY_TYPE}"`
  : `_type in ["post", "guide"]`
const slugFilter = ONLY_SLUG ? `&& slug.current == "${ONLY_SLUG}"` : ''

const docs = await client.fetch(
  `*[${typeFilter} && defined(slug.current) ${slugFilter}]{
    _id, _type, title, "slug": slug.current, coverImage, body
  }`,
)

console.log(
  `Backfill — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n` +
    `Target: ${projectId}/${dataset}\n` +
    `Docs:   ${docs.length} (type=${ONLY_TYPE ?? 'post,guide'}${ONLY_SLUG ? `, slug=${ONLY_SLUG}` : ''})`,
)

const results = []
for (const doc of docs) {
  try {
    results.push(await processDoc(doc))
  } catch (err) {
    console.error(`   ✗ ${err.message}`)
    results.push({ ok: false, slug: doc.slug, error: err.message })
  }
}

const ok = results.filter((r) => r.ok && !r.noop).length
const noop = results.filter((r) => r.noop).length
const failed = results.filter((r) => !r.ok).length
console.log(`\n────────────────────────────────────────`)
console.log(`Done. patched=${ok}  noop=${noop}  failed=${failed}`)
if (failed) {
  console.log('Failed:')
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  - ${r.slug}: ${r.error}`)
  }
}
if (!DRY_RUN) {
  console.log('\nNext: open Sanity Studio to spot-check covers and inline images.')
}
