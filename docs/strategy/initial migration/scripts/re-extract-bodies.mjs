#!/usr/bin/env node
/**
 * Re-extract the body of every post / guide from the live WordPress source,
 * preserving inline formatting (bold, italic, code, underline, links, lists)
 * that the original migrate-{posts,guides}.mjs scripts stripped because they
 * used `node.text` (plain text) instead of walking child nodes.
 *
 * Pipeline summary:
 *   1. Fetch `https://salesolution.net/${slug}/` (or `/guides/${slug}/`).
 *   2. Find the article root, walk it block-by-block.
 *   3. For each block-level element, build a list of spans by recursively
 *      walking inline children. Decorators (strong / em / code / underline)
 *      and link annotations are tracked on a mark stack so nesting works.
 *   4. <img> tags are uploaded to Sanity (content-addressed, so re-uploading
 *      an existing asset just returns its ID) and emitted as image blocks.
 *      Theme chrome (logos, icons, guide-* images) and the cover image are
 *      skipped — the cover is shown by the page hero, not the body.
 *   5. After building the new body, truncate at the first "Leave a Comment"
 *      / "Cancel reply" marker — same logic as cleanup-bodies.mjs.
 *   6. Patch the doc's `body` field only. Cover image and every other field
 *      are left untouched.
 *
 * Usage (from this scripts directory):
 *   node --env-file=../../../../.env.local re-extract-bodies.mjs --dry
 *   node --env-file=../../../../.env.local re-extract-bodies.mjs --dry --slug=content-marketing-101
 *   node --env-file=../../../../.env.local re-extract-bodies.mjs --type=guide
 *   node --env-file=../../../../.env.local re-extract-bodies.mjs                  # LIVE
 *
 * --dry skips ALL writes AND image uploads (it prints would-upload counts
 * instead of round-tripping every binary).
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
  // 'raw' surfaces both drafts.X and X — we patch whichever the dataset has.
  perspective: 'raw',
})

function key() { return randomUUID().slice(0, 12) }

// ── Constants shared with backfill-images.mjs ───────────────────────────────

// WordPress theme furniture — never editorial content.
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

// Same chrome markers as cleanup-bodies.mjs.
const CHROME_MARKERS = [
  /^\s*leave a (comment|reply)\b/i,
  /^\s*cancel reply\s*$/i,
]

// ── HTML helpers ────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'SaleSolution-ReExtract/1.0' },
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
  return root.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null
}

/** Resolve the real image URL, preferring data-src over a data: placeholder. */
function imgSrc(img) {
  const src = img.getAttribute('src') ?? ''
  if (src.startsWith('data:') || !src) {
    return (
      img.getAttribute('data-src') ??
      img.getAttribute('data-lazy-src') ??
      img.getAttribute('data-orig-file') ??
      null
    )
  }
  return src
}

function sourceUrl(type, slug) {
  if (type === 'guide') return `${BASE}/guides/${slug}/`
  return `${BASE}/${slug}/`
}

// ── Sanity asset upload (content-addressed; cache keyed by src) ─────────────

const assetCache = new Map() // src → assetId

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

// ── Portable-text builders ──────────────────────────────────────────────────

function textBlock(style, children, markDefs, listItem, level) {
  const b = {
    _type: 'block',
    _key: key(),
    style: style ?? 'normal',
    markDefs: markDefs ?? [],
    children: children ?? [],
  }
  if (listItem) {
    b.listItem = listItem
    b.level = level ?? 1
  }
  return b
}

function span(text, marks) {
  const s = { _type: 'span', _key: key(), text }
  if (marks && marks.length) s.marks = [...marks]
  else s.marks = []
  return s
}

function imageBlock(assetId, alt, caption) {
  const b = {
    _type: 'image',
    _key: key(),
    alt: alt ?? '',
    asset: { _type: 'reference', _ref: assetId },
  }
  if (caption) b.caption = caption
  return b
}

function codeBlock(code, language) {
  return {
    _type: 'codeBlock',
    _key: key(),
    code: code ?? '',
    language: language ?? '',
  }
}

// ── Inline walker ───────────────────────────────────────────────────────────

const DECORATOR_TAGS = {
  strong: 'strong',
  b: 'strong',
  em: 'em',
  i: 'em',
  u: 'underline',
}

/**
 * Walk the inline children of a block-level element, producing:
 *   - `spans`     — array of {_type:'span', text, marks}
 *   - `markDefs`  — array of link annotation defs referenced by span marks
 *   - `images`    — array of image descriptors {src, alt, caption} encountered
 *                   inline; the caller is expected to break the block and emit
 *                   a sibling image block (or skip if asset upload fails).
 *
 * The caller decides what to do with images so block context (paragraph vs
 * heading vs list item) can be preserved.
 */
function walkInline(node, ctx, opts = {}) {
  const ALLOW_INLINE_IMAGES = opts.allowInlineImages !== false
  // ctx: { spans, markDefs, markStack, images, warnings }
  if (!node) return

  // Text node.
  if (node.nodeType === 3) {
    const text = node.text
    if (!text) return
    appendText(ctx, text)
    return
  }

  if (node.nodeType !== 1) return // skip comments etc.

  const tag = (node.tagName ?? '').toLowerCase()

  // Inline chrome to skip entirely.
  if (['script', 'style', 'noscript', 'iframe', 'form'].includes(tag)) return

  // Hard line break — append a newline (renderer respects \n in spans).
  if (tag === 'br') {
    appendText(ctx, '\n')
    return
  }

  // Inline image.
  if (tag === 'img') {
    if (!ALLOW_INLINE_IMAGES) return
    const src = imgSrc(node)
    if (!src) return
    if (shouldSkipImage(src)) return
    ctx.images.push({
      src,
      alt: node.getAttribute('alt') ?? node.getAttribute('title') ?? '',
      caption: '',
    })
    return
  }

  // Decorators.
  const decorator = DECORATOR_TAGS[tag]
  if (decorator) {
    ctx.markStack.push(decorator)
    for (const child of node.childNodes ?? []) walkInline(child, ctx, opts)
    ctx.markStack.pop()
    return
  }

  // Inline code (not the <pre><code> block form — that's handled by the
  // block walker by recognising <pre>). Guard by checking parent.
  if (tag === 'code') {
    ctx.markStack.push('code')
    for (const child of node.childNodes ?? []) walkInline(child, ctx, opts)
    ctx.markStack.pop()
    return
  }

  // Link annotation.
  if (tag === 'a') {
    const href = node.getAttribute('href')
    if (!href) {
      for (const child of node.childNodes ?? []) walkInline(child, ctx, opts)
      return
    }
    const newTab = (node.getAttribute('target') ?? '').toLowerCase() === '_blank'
    const markKey = key()
    ctx.markDefs.push({ _key: markKey, _type: 'link', href, newTab })
    ctx.markStack.push(markKey)
    for (const child of node.childNodes ?? []) walkInline(child, ctx, opts)
    ctx.markStack.pop()
    return
  }

  // Default: recurse into children, marks unchanged.
  for (const child of node.childNodes ?? []) walkInline(child, ctx, opts)
}

/**
 * Append text to the current span list, merging into the trailing span if
 * its mark-set matches. Otherwise opens a new span. Marks-equality is order-
 * insensitive (Sanity treats marks as a set).
 */
function appendText(ctx, text) {
  if (!text) return
  const last = ctx.spans[ctx.spans.length - 1]
  const marks = [...ctx.markStack]
  if (last && sameMarks(last.marks, marks)) {
    last.text += text
    return
  }
  ctx.spans.push(span(text, marks))
}

function sameMarks(a, b) {
  const A = a ?? []
  const B = b ?? []
  if (A.length !== B.length) return false
  const sa = new Set(A)
  for (const m of B) if (!sa.has(m)) return false
  return true
}

/** Trim leading/trailing whitespace-only spans and collapse consecutive WS. */
function normaliseSpans(spans) {
  // Drop spans whose text is empty after we strip outer whitespace at the
  // very start / end of the block. We do NOT trim middle whitespace because
  // it can be meaningful between inline elements.
  while (spans.length && /^\s*$/.test(spans[0].text)) spans.shift()
  while (spans.length && /^\s*$/.test(spans[spans.length - 1].text)) spans.pop()
  if (spans.length) {
    spans[0].text = spans[0].text.replace(/^\s+/, '')
    spans[spans.length - 1].text = spans[spans.length - 1].text.replace(/\s+$/, '')
  }
  // Collapse multi-space runs (but preserve newlines from <br>).
  for (const s of spans) {
    s.text = s.text.replace(/[^\S\n]+/g, ' ')
  }
  return spans
}

function spansHaveContent(spans) {
  return spans.some((s) => s.text && s.text.replace(/\s/g, '').length)
}

// ── Block walker ────────────────────────────────────────────────────────────

const SKIP_BLOCK_TAGS = new Set([
  'script', 'style', 'noscript', 'iframe', 'aside', 'nav', 'footer', 'form',
])

const INLINE_TAGS = new Set([
  'a', 'b', 'i', 'em', 'strong', 'u', 'code', 'span', 'small', 'sup', 'sub',
  'mark', 'abbr', 'cite', 'q', 'time', 'kbd', 'samp', 'var', 'br', 'img',
])

/**
 * Build a single block-level Portable Text block from an element, handling
 * any inline images by emitting sibling image blocks (sandwiched between
 * paragraph halves). Returns array of blocks (typically 1).
 */
function blockFromInline(node, baseBuilder, stats, imageEmitter) {
  const ctx = { spans: [], markDefs: [], markStack: [], images: [], warnings: [] }
  // Two-pass: walk producing spans AND record images in document order.
  // To support "split paragraph around image" we need traversal-ordered events,
  // not just collected lists. We re-walk producing events.
  const events = walkInlineEvents(node)

  // No images? Single block, simple path.
  const hasImg = events.some((e) => e.kind === 'img')
  if (!hasImg) {
    const ctx2 = { spans: [], markDefs: [], markStack: [], images: [], warnings: [] }
    for (const child of node.childNodes ?? []) walkInline(child, ctx2)
    normaliseSpans(ctx2.spans)
    if (!spansHaveContent(ctx2.spans)) return []
    countMarks(ctx2, stats)
    return [baseBuilder(ctx2.spans, ctx2.markDefs)]
  }

  // Split: replay events, when we hit an image, flush current spans as a
  // block, emit image block (via imageEmitter — async path), then continue.
  return splitAroundImages(node, baseBuilder, stats, imageEmitter)
}

function countMarks(ctx, stats) {
  for (const s of ctx.spans) {
    for (const m of s.marks ?? []) {
      stats.marks++
      // Link mark keys are 12-char hex; decorators are dictionary words.
      if (!['strong', 'em', 'code', 'underline'].includes(m)) stats.links++
    }
  }
}

/**
 * Walk inline children, producing a flat sequence of events. Used to detect
 * whether a paragraph contains inline images so we know to split it.
 */
function walkInlineEvents(node) {
  const events = []
  function rec(n) {
    if (!n) return
    if (n.nodeType === 3) {
      if (n.text) events.push({ kind: 'text', text: n.text })
      return
    }
    if (n.nodeType !== 1) return
    const t = (n.tagName ?? '').toLowerCase()
    if (t === 'img') { events.push({ kind: 'img', node: n }); return }
    if (SKIP_BLOCK_TAGS.has(t)) return
    for (const c of n.childNodes ?? []) rec(c)
  }
  for (const c of node.childNodes ?? []) rec(c)
  return events
}

/**
 * For a block that mixes text and <img> children, split it into alternating
 * text and image blocks (text segments use baseBuilder). imageEmitter is
 * called with each {src, alt, caption} and must return either a block or
 * null (when upload fails / image is skipped); it is async.
 */
function splitAroundImages(node, baseBuilder, stats, imageEmitter) {
  // We walk the full inline subtree manually so we keep mark context across
  // image boundaries.
  const out = []
  const promise = (async () => {
    let ctx = { spans: [], markDefs: [], markStack: [], images: [], warnings: [] }

    async function flush() {
      normaliseSpans(ctx.spans)
      if (spansHaveContent(ctx.spans)) {
        countMarks(ctx, stats)
        out.push(baseBuilder(ctx.spans, ctx.markDefs))
      }
      ctx = { spans: [], markDefs: [], markStack: [], images: [], warnings: [] }
    }

    async function rec(n) {
      if (!n) return
      if (n.nodeType === 3) {
        if (n.text) appendText(ctx, n.text)
        return
      }
      if (n.nodeType !== 1) return
      const t = (n.tagName ?? '').toLowerCase()
      if (SKIP_BLOCK_TAGS.has(t)) return

      if (t === 'img') {
        const src = imgSrc(n)
        if (!src || shouldSkipImage(src)) return
        await flush()
        const blk = await imageEmitter({
          src,
          alt: n.getAttribute('alt') ?? n.getAttribute('title') ?? '',
          caption: '',
        })
        if (blk) {
          out.push(blk)
          stats.images++
        }
        return
      }

      if (t === 'br') { appendText(ctx, '\n'); return }

      const decorator = DECORATOR_TAGS[t]
      if (decorator) {
        ctx.markStack.push(decorator)
        for (const c of n.childNodes ?? []) await rec(c)
        ctx.markStack.pop()
        return
      }

      if (t === 'code') {
        ctx.markStack.push('code')
        for (const c of n.childNodes ?? []) await rec(c)
        ctx.markStack.pop()
        return
      }

      if (t === 'a') {
        const href = n.getAttribute('href')
        if (!href) {
          for (const c of n.childNodes ?? []) await rec(c)
          return
        }
        const newTab = (n.getAttribute('target') ?? '').toLowerCase() === '_blank'
        const markKey = key()
        ctx.markDefs.push({ _key: markKey, _type: 'link', href, newTab })
        ctx.markStack.push(markKey)
        for (const c of n.childNodes ?? []) await rec(c)
        ctx.markStack.pop()
        return
      }

      for (const c of n.childNodes ?? []) await rec(c)
    }

    for (const child of node.childNodes ?? []) await rec(child)
    await flush()
  })()

  // The caller awaits a promise that resolves with the populated out array.
  return promise.then(() => out)
}

/**
 * Walk article-level DOM and produce Portable Text blocks.
 *
 * Returns { blocks, stats } where stats counts categories of content emitted
 * (headings / paragraphs / lists / images / marks / links) — used for the
 * per-doc summary line.
 */
async function htmlToPortableText(article, opts) {
  const blocks = []
  const stats = {
    headings: 0, paragraphs: 0, lists: 0, images: 0, marks: 0, links: 0,
    blockquotes: 0, codeBlocks: 0, listsNestedFlattened: 0, imagesUploaded: 0,
    imagesSkippedChrome: 0, imagesSkippedCover: 0, imagesFailed: 0,
    imagesWouldUpload: 0,
  }
  const coverSrc = opts.coverSrc
  const dryRun = opts.dryRun
  const slug = opts.slug

  // Memo per-doc to avoid re-uploading the same src across multiple blocks.
  const localAssetCache = new Map()

  async function uploadOrSkipImage({ src, alt, caption }) {
    if (!src) return null
    if (shouldSkipImage(src)) { stats.imagesSkippedChrome++; return null }
    if (coverSrc && src === coverSrc) { stats.imagesSkippedCover++; return null }
    if (dryRun) {
      stats.imagesWouldUpload++
      // Use a synthetic ref so block validation / counts make sense, but it
      // will NEVER be written (dry run).
      return imageBlock(`image-dry-run-${stats.imagesWouldUpload}`, alt, caption)
    }
    if (localAssetCache.has(src)) {
      return imageBlock(localAssetCache.get(src), alt, caption)
    }
    try {
      const id = await uploadAsset(src)
      localAssetCache.set(src, id)
      stats.imagesUploaded++
      return imageBlock(id, alt, caption)
    } catch (err) {
      stats.imagesFailed++
      console.log(`     ✗ image upload failed (${src.split('/').pop()}): ${err.message}`)
      return null
    }
  }

  async function emitBlockFromInline(node, baseBuilder, kindCounter) {
    const result = blockFromInline(node, baseBuilder, stats, uploadOrSkipImage)
    // result may be array of blocks OR a Promise<array of blocks> (when the
    // inline subtree contained an image and we needed to split asynchronously).
    const arr = Array.isArray(result) ? result : await result
    if (arr.length && kindCounter) kindCounter(arr.length)
    for (const b of arr) blocks.push(b)
  }

  async function walk(node) {
    if (!node) return
    if (node.nodeType !== 1) return
    const tag = (node.tagName ?? '').toLowerCase()
    if (SKIP_BLOCK_TAGS.has(tag)) return

    if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      await emitBlockFromInline(node, (spans, markDefs) => textBlock(tag, spans, markDefs), (n) => stats.headings += n)
      return
    }

    if (tag === 'p') {
      await emitBlockFromInline(node, (spans, markDefs) => textBlock('normal', spans, markDefs), (n) => stats.paragraphs += n)
      return
    }

    if (tag === 'blockquote') {
      await emitBlockFromInline(node, (spans, markDefs) => textBlock('blockquote', spans, markDefs), (n) => stats.blockquotes += n)
      return
    }

    if (tag === 'ul' || tag === 'ol') {
      const listType = tag === 'ul' ? 'bullet' : 'number'
      await emitList(node, listType, slug)
      return
    }

    if (tag === 'pre') {
      // <pre><code>…</code></pre> → codeBlock (raw text).
      const inner = node.querySelector('code') ?? node
      const code = inner.rawText ? decodeEntities(inner.rawText) : inner.text
      if (code && code.trim()) {
        // Try to detect language from a class like `language-ts`.
        const cls = inner.getAttribute('class') ?? ''
        const m = cls.match(/language-([\w-]+)/)
        blocks.push(codeBlock(code.replace(/\n+$/, ''), m?.[1] ?? ''))
        stats.codeBlocks++
      }
      return
    }

    if (tag === 'figure') {
      const img = node.querySelector('img')
      if (img) {
        const src = imgSrc(img)
        const fig = node.querySelector('figcaption')
        const blk = await uploadOrSkipImage({
          src,
          alt: img.getAttribute('alt') ?? img.getAttribute('title') ?? '',
          caption: fig ? fig.text.trim() : '',
        })
        if (blk) { blocks.push(blk); stats.images++ }
      } else {
        // No image — treat as a container, recurse.
        for (const c of node.childNodes ?? []) await walk(c)
      }
      return
    }

    if (tag === 'img') {
      const src = imgSrc(node)
      const blk = await uploadOrSkipImage({
        src,
        alt: node.getAttribute('alt') ?? node.getAttribute('title') ?? '',
        caption: '',
      })
      if (blk) { blocks.push(blk); stats.images++ }
      return
    }

    // Hr / table / etc.: skip silently (out of scope for v5 portable-text schema).
    if (tag === 'hr' || tag === 'table') return

    // Default: container — recurse into children.
    for (const c of node.childNodes ?? []) await walk(c)
  }

  async function emitList(listNode, listType, slug) {
    // Iterate direct-child <li> only. For any nested <ul>/<ol> inside an <li>
    // we recursively flatten ALL descendant li items into the same level (1).
    // This is a deliberate simplification: editors can re-indent in Studio.
    const items = directChildren(listNode, 'li')
    if (!items.length) return
    stats.lists++

    for (const li of items) {
      // Capture nested lists before we touch them, then strip them from the
      // li so the inline walker doesn't double-count their text.
      const nested = []
      for (const child of li.childNodes ?? []) {
        if (child.nodeType === 1) {
          const t = (child.tagName ?? '').toLowerCase()
          if (t === 'ul' || t === 'ol') nested.push(child)
        }
      }
      // Remove nested lists from the li for the duration of the inline walk.
      // node-html-parser supports removeChild via parentNode.
      const removed = []
      for (const n of nested) {
        if (li.removeChild) {
          li.removeChild(n)
          removed.push(n)
        } else if (li.childNodes) {
          const idx = li.childNodes.indexOf(n)
          if (idx >= 0) {
            li.childNodes.splice(idx, 1)
            removed.push(n)
          }
        }
      }

      await emitBlockFromInline(
        li,
        (spans, markDefs) => textBlock('normal', spans, markDefs, listType, 1),
        null,
      )

      // Now flatten each nested list — items become sibling list items at
      // the SAME level. Log a warning so we know it happened.
      for (const sub of removed) {
        const subType = (sub.tagName ?? '').toLowerCase() === 'ol' ? 'number' : 'bullet'
        const subItems = directChildren(sub, 'li')
        if (subItems.length) {
          stats.listsNestedFlattened += subItems.length
          console.log(`     ! nested list flattened (${subItems.length} items) in ${slug}`)
        }
        for (const subLi of subItems) {
          await emitBlockFromInline(
            subLi,
            (spans, markDefs) => textBlock('normal', spans, markDefs, subType, 1),
            null,
          )
        }
      }
    }
  }

  await walk(article)
  return { blocks, stats }
}

function directChildren(parent, tagName) {
  const out = []
  for (const c of parent.childNodes ?? []) {
    if (c.nodeType === 1 && (c.tagName ?? '').toLowerCase() === tagName) out.push(c)
  }
  return out
}

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// ── Chrome truncation (same logic as cleanup-bodies.mjs) ────────────────────

function blockText(b) {
  if (b?._type !== 'block') return ''
  return (b.children ?? []).map((c) => c.text ?? '').join('').trim()
}

function findChromeStart(body) {
  for (let i = 0; i < body.length; i++) {
    const t = blockText(body[i])
    if (!t) continue
    if (CHROME_MARKERS.some((rx) => rx.test(t))) return i
  }
  return -1
}

// ── Per-doc processing ──────────────────────────────────────────────────────

async function processDoc(doc) {
  const slug = doc.slug
  const oldLen = (doc.body ?? []).length
  const url = sourceUrl(doc._type, slug)
  console.log(`\n→ [${doc._type}] ${slug}`)
  console.log(`   source: ${url}`)

  let html
  try {
    html = await fetchHtml(url)
  } catch (err) {
    console.log(`   ✗ fetch failed: ${err.message}`)
    return { ok: false, slug, error: err.message }
  }
  const root = parse(html)
  const article = getArticleRoot(root)
  const coverSrc = getCoverSrc(root)

  const { blocks, stats } = await htmlToPortableText(article, {
    coverSrc, dryRun: DRY_RUN, slug,
  })

  // Truncate at chrome marker.
  const cutAt = findChromeStart(blocks)
  const newBody = cutAt >= 0 ? blocks.slice(0, cutAt) : blocks
  const cutMsg = cutAt >= 0 ? `chrome cut at block ${cutAt}` : 'no chrome marker found'

  const summary =
    `   blocks: ${oldLen} → ${newBody.length}   ` +
    `(headings: ${stats.headings}, paragraphs: ${stats.paragraphs}, ` +
    `lists: ${stats.lists}, images: ${stats.images}, ` +
    `links: ${stats.links}, marks: ${stats.marks})   ${cutMsg}`
  console.log(summary)

  if (stats.codeBlocks) console.log(`     code blocks: ${stats.codeBlocks}`)
  if (stats.blockquotes) console.log(`     blockquotes: ${stats.blockquotes}`)
  if (stats.listsNestedFlattened) {
    console.log(`     nested list items flattened: ${stats.listsNestedFlattened}`)
  }
  if (stats.imagesSkippedChrome) {
    console.log(`     images skipped (chrome): ${stats.imagesSkippedChrome}`)
  }
  if (stats.imagesSkippedCover) {
    console.log(`     images skipped (cover dedup): ${stats.imagesSkippedCover}`)
  }
  if (DRY_RUN && stats.imagesWouldUpload) {
    console.log(`     images would-upload: ${stats.imagesWouldUpload}`)
  }
  if (!DRY_RUN && stats.imagesUploaded) {
    console.log(`     images uploaded: ${stats.imagesUploaded}`)
  }
  if (stats.imagesFailed) {
    console.log(`     images failed (dropped): ${stats.imagesFailed}`)
  }

  if (DRY_RUN) return { ok: true, slug, dryRun: true, stats }

  // Sanity check: don't write an empty body.
  if (!newBody.length) {
    console.log('   ✗ refusing to write empty body — leaving doc untouched')
    return { ok: false, slug, error: 'empty body after extraction' }
  }

  try {
    await client.patch(doc._id).set({ body: newBody }).commit({ visibility: 'async' })
    console.log(`   ✓ patched ${doc._id}`)
    return { ok: true, slug, stats }
  } catch (err) {
    console.log(`   ✗ patch failed: ${err.message}`)
    return { ok: false, slug, error: err.message }
  }
}

// ── Driver ──────────────────────────────────────────────────────────────────

const typeFilter = ONLY_TYPE ? `_type == "${ONLY_TYPE}"` : `_type in ["post", "guide"]`
const slugFilter = ONLY_SLUG ? `&& slug.current == "${ONLY_SLUG}"` : ''

const docs = await client.fetch(
  `*[${typeFilter} && defined(slug.current) ${slugFilter}]{
    _id, _type, title, "slug": slug.current, body
  } | order(_type asc, slug asc)`,
)

console.log(
  `Re-extract bodies — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n` +
    `Target: ${projectId}/${dataset}\n` +
    `Docs:   ${docs.length} (type=${ONLY_TYPE ?? 'post,guide'}` +
    `${ONLY_SLUG ? `, slug=${ONLY_SLUG}` : ''})`,
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

// ── Aggregate report ────────────────────────────────────────────────────────

const ok = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok).length
const totals = results.reduce(
  (acc, r) => {
    if (!r.stats) return acc
    for (const k of Object.keys(r.stats)) acc[k] = (acc[k] ?? 0) + r.stats[k]
    return acc
  },
  {},
)

console.log(`\n────────────────────────────────────────`)
console.log(`Done. ok=${ok}  failed=${failed}`)
if (Object.keys(totals).length) {
  console.log(
    `Totals:  headings=${totals.headings ?? 0}  paragraphs=${totals.paragraphs ?? 0}  ` +
      `lists=${totals.lists ?? 0}  images=${totals.images ?? 0}  ` +
      `marks=${totals.marks ?? 0}  links=${totals.links ?? 0}`,
  )
}
if (failed) {
  console.log('Failed:')
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  - ${r.slug}: ${r.error}`)
  }
}
if (!DRY_RUN) {
  console.log('\nNext: open Sanity Studio to spot-check formatting and inline images.')
} else {
  console.log('\n(dry run — no writes, no image uploads)')
}
