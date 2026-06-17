/**
 * engine-to-sanity — convert a content-engine HTML article into a Sanity
 * document with a valid Portable Text body, then (optionally) upsert it.
 *
 * The content engine (`.engine/skills/liori-content-pipeline`) emits a single
 * HTML file per article: a `<head>` of SEO meta + JSON-LD, and a
 * `<article class="article-main">` body built from a fixed class vocabulary
 * (`lede`, `key-takeaways`, `cmp` tables, `cta-card`, `faq-q`, …). This script
 * deserializes that HTML into the project's `portableText` contract
 * (sanity/schemas/objects/portable-text.ts) using Sanity's official
 * `@sanity/block-tools` + jsdom, with custom rules for the embedded object
 * types (image / codeBlock / callout / table).
 *
 *   node scripts/engine-to-sanity.mjs <folder-or-html> --type <post|guide|glossaryTerm> [--publish | --live] [--dry-run]
 *
 * Default is dry-run: prints the resulting document JSON (body = valid PT
 * array) and runs WITHOUT a Sanity token. `--publish` uploads local images and
 * writes a `drafts.*` document (review + publish in /studio) — needs the write
 * token. `--live` writes the published id directly instead of a draft.
 *
 * Mapping summary (see the prompt / SKILL.md Phase 2+4 for the source markup):
 *   <h1>                         -> document title (NOT body)
 *   <title>/meta/OG/canonical    -> seo{} + top-level title/description
 *   FAQ (faq-q H2s or JSON-LD)   -> faq[] (post only — the type with the field)
 *   hero <img> (first in body)   -> coverImage (upload on --publish)
 *   inline <img>                 -> PT image{} (upload on --publish, else local path)
 *   <table class="cmp">          -> PT table{} (minimal custom type, see below)
 *   .cta-card                    -> DROPPED (site renders its own CTAs)
 *   <script ld+json>             -> DROPPED for body (Next emits schema per page)
 *   glossaryRef                  -> NOT auto-resolved; left as plain link (manual step)
 *
 * Table decision: tables are deserialized into a minimal `table` object type
 * (rows -> cells). That type was added to the real schema + renderer (both
 * clearly commented as the engine-import addition). If you'd rather not ship
 * the table type, the converter is the only place that emits it.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'

import { htmlToBlocks, randomKey } from '@sanity/block-tools'
import { Schema } from '@sanity/schema'
import { JSDOM } from 'jsdom'

// ─────────────────────────────────────────────────────────────────────────────
// CLI parsing
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { _: [], type: 'post', publish: false, dryRun: true, live: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--type') args.type = argv[++i]
    else if (a === '--publish') {
      args.publish = true
      args.dryRun = false
    } else if (a === '--live') {
      // write the PUBLISHED doc id directly; default (--publish) writes a drafts.* doc
      args.publish = true
      args.dryRun = false
      args.live = true
    } else if (a === '--dry-run') args.dryRun = true
    else if (a.startsWith('--')) {
      console.warn(`[warn] unknown flag: ${a}`)
    } else args._.push(a)
  }
  return args
}

const VALID_TYPES = new Set(['post', 'guide', 'glossaryTerm'])

// ─────────────────────────────────────────────────────────────────────────────
// Compiled block-content schema (mirrors sanity/schemas/objects/portable-text.ts
// EXACTLY). We rebuild it inline so the script has no TS-build dependency. Keep
// this in lockstep with the real schema. The `table` member is the engine-import
// addition (see renderer + schema comments).
// ─────────────────────────────────────────────────────────────────────────────
const blockContentType = {
  type: 'array',
  name: 'body',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              { name: 'newTab', type: 'boolean', title: 'Open in new tab' },
            ],
          },
          // glossaryRef is a reference in the real schema; we never emit it from
          // HTML (can't resolve term -> _ref), so a stub keeps the schema valid.
          {
            name: 'glossaryRef',
            type: 'object',
            title: 'Glossary term',
            fields: [{ name: 'slug', type: 'string' }],
          },
        ],
      },
    },
    {
      type: 'image',
      name: 'image',
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text' },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    },
    {
      type: 'object',
      name: 'codeBlock',
      fields: [
        { name: 'language', type: 'string' },
        { name: 'code', type: 'text' },
      ],
    },
    {
      type: 'object',
      name: 'callout',
      fields: [
        { name: 'tone', type: 'string' },
        { name: 'body', type: 'text' },
      ],
    },
    // ── engine-import addition: minimal table type ───────────────────────────
    {
      type: 'object',
      name: 'table',
      fields: [
        { name: 'rows', type: 'array', of: [{ type: 'object' }] },
        { name: 'hasHeaderRow', type: 'boolean' },
      ],
    },
  ],
}

function compileBlockContentType() {
  const compiled = Schema.compile({
    name: 'engineImport',
    types: [{ type: 'object', name: 'doc', fields: [{ name: 'body', ...blockContentType }] }],
  })
  return compiled.get('doc').fields.find((f) => f.name === 'body').type
}

// ─────────────────────────────────────────────────────────────────────────────
// Small DOM / text helpers
// ─────────────────────────────────────────────────────────────────────────────
const collapse = (s) => (s || '').replace(/\s+/g, ' ').trim()

function slugify(text) {
  return collapse(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

function attr(el, name) {
  return el && el.getAttribute ? el.getAttribute(name) : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Read the article HTML + locate its folder (for resolving relative <img> src)
// ─────────────────────────────────────────────────────────────────────────────
function loadArticle(inputPath) {
  const abs = resolve(process.cwd(), inputPath)
  if (!existsSync(abs)) throw new Error(`Path not found: ${abs}`)
  let htmlFile
  if (statSync(abs).isDirectory()) {
    const htmls = readdirSync(abs).filter((f) => /\.html?$/i.test(f))
    if (htmls.length === 0) throw new Error(`No .html file in folder: ${abs}`)
    // Prefer an index/article*.html if present, else the first.
    htmlFile = join(
      abs,
      htmls.find((f) => /index|article/i.test(f)) ?? htmls[0],
    )
  } else {
    htmlFile = abs
  }
  return { html: readFileSync(htmlFile, 'utf8'), folder: dirname(htmlFile), htmlFile }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO / meta extraction from <head> + JSON-LD
// ─────────────────────────────────────────────────────────────────────────────
function extractMeta(doc) {
  const head = doc.head
  const meta = {}
  const getMeta = (sel) => {
    const el = head?.querySelector(sel)
    return el ? collapse(attr(el, 'content')) : null
  }
  meta.title = collapse(doc.querySelector('title')?.textContent || '')
  meta.description = getMeta('meta[name="description"]')
  meta.ogTitle = getMeta('meta[property="og:title"]')
  meta.ogDescription = getMeta('meta[property="og:description"]')
  meta.ogImage = getMeta('meta[property="og:image"]')
  const canonical = head?.querySelector('link[rel="canonical"]')
  meta.canonical = canonical ? collapse(attr(canonical, 'href')) : null
  meta.robots = getMeta('meta[name="robots"]')
  meta.noindex = meta.robots ? /noindex/i.test(meta.robots) : false
  return meta
}

// FAQ: prefer JSON-LD FAQPage (questions/answers verbatim), fall back to the
// visible `faq-q` H2 + following <p> pattern the engine emits.
function extractFaq(doc) {
  const faq = []
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    let json
    try {
      json = JSON.parse(script.textContent)
    } catch {
      continue
    }
    const graph = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json]
    for (const node of graph) {
      if (node && node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
        for (const q of node.mainEntity) {
          const question = collapse(q.name)
          const answer = collapse(q.acceptedAnswer?.text)
          if (question && answer) faq.push({ question, answer })
        }
      }
    }
  }
  if (faq.length) return faq

  // Fallback: visible faq-q H2s. Answer = text of following siblings up to the
  // next heading.
  for (const h of doc.querySelectorAll('h2.faq-q, h3.faq-q')) {
    const question = collapse(h.textContent)
    const parts = []
    let sib = h.nextElementSibling
    while (sib && !/^H[1-4]$/.test(sib.tagName)) {
      parts.push(collapse(sib.textContent))
      sib = sib.nextElementSibling
    }
    const answer = collapse(parts.join(' '))
    if (question && answer) faq.push({ question, answer })
  }
  return faq
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-process the body DOM: pull the H1 (title) and hero image (coverImage),
// strip the things that must NOT reach the block array (cta-cards, JSON-LD,
// the faq-q section once captured, nav/toc chrome, last-updated line).
// Returns { titleText, heroSrc, heroAlt, bodyHtml }.
// ─────────────────────────────────────────────────────────────────────────────
function prepareBody(doc, faqLen, warn) {
  const root =
    doc.querySelector('article.article-main') ||
    doc.querySelector('article') ||
    doc.body

  if (!root) throw new Error('No <body> / <article> to read')

  // Title from the first H1, then remove it from the body.
  const h1 = root.querySelector('h1')
  const titleText = h1 ? collapse(h1.textContent) : ''
  if (h1) h1.remove()

  // Hero image = first <img> in the body. Lift to coverImage, drop from body.
  let heroSrc = null
  let heroAlt = ''
  const firstImg = root.querySelector('img')
  if (firstImg) {
    heroSrc = attr(firstImg, 'src')
    heroAlt = collapse(attr(firstImg, 'alt')) || ''
    firstImg.remove()
  }

  // Drop site-owned / non-content chrome.
  const dropSelectors = [
    '.cta-card', // site renders its own CTAs
    'script', // JSON-LD + any inline script
    'style',
    'nav.toc', // TOC is generated by the Next app's TableOfContents
    'p.last-updated', // date/byline is doc metadata, not body prose
  ]
  for (const sel of dropSelectors) {
    for (const el of root.querySelectorAll(sel)) el.remove()
  }

  // Remove the FAQ section from the body when we captured it into faq[] — find
  // the heading whose text contains "FAQ"/"Frequently Asked" and strip it plus
  // everything after it (the engine always ends the article with the FAQ).
  if (faqLen > 0) {
    const headings = [...root.querySelectorAll('h2, h3')]
    const faqHeading = headings.find((h) =>
      /\bfaq\b|frequently asked/i.test(h.textContent || ''),
    )
    if (faqHeading) {
      let node = faqHeading
      while (node) {
        const nxt = node.nextSibling
        node.remove()
        node = nxt
      }
    } else {
      warn('FAQ captured but no visible FAQ heading found to strip from body.')
    }
  }

  return { titleText, heroSrc, heroAlt, bodyHtml: root.innerHTML }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom deserializer rules for the embedded object types. Each returns a
// PT object (with _type) or undefined to fall through to default handling.
// `imageSink` collects inline images so --publish can upload them later; in
// dry-run we keep `_localSrc` on the node so the path is visible.
// ─────────────────────────────────────────────────────────────────────────────
function buildRules(imageSink, warn) {
  const key = () => randomKey(12)

  const calloutTone = (el) => {
    const cls = (attr(el, 'class') || '').toLowerCase()
    if (/danger|error/.test(cls)) return 'danger'
    if (/warn/.test(cls)) return 'warning'
    if (/tip|key-takeaway|success/.test(cls)) return 'tip'
    return 'info'
  }

  return [
    // Inline <img> -> PT image. Hero was already removed in prepareBody.
    {
      deserialize(el) {
        if (el.nodeType !== 1 || el.tagName !== 'IMG') return undefined
        const src = attr(el, 'src') || ''
        const node = {
          _type: 'image',
          _key: key(),
          alt: collapse(attr(el, 'alt')) || '',
        }
        const caption = collapse(attr(el, 'title'))
        if (caption) node.caption = caption
        // Record for later upload / dry-run visibility.
        node._localSrc = src
        imageSink.push(node)
        return node
      },
    },

    // <pre><code> (or bare <pre>) -> PT codeBlock.
    {
      deserialize(el) {
        if (el.nodeType !== 1 || el.tagName !== 'PRE') return undefined
        const code = el.querySelector('code') || el
        const langClass = (attr(code, 'class') || '').match(/(?:language|lang)-([\w+-]+)/)
        return {
          _type: 'codeBlock',
          _key: key(),
          language: langClass ? langClass[1] : undefined,
          code: code.textContent.replace(/\n$/, ''),
        }
      },
    },

    // Engine "key-takeaways"/aside boxes -> PT callout. Matches <aside> and any
    // div carrying a callout-ish class. cta-card was already dropped upstream.
    {
      deserialize(el) {
        if (el.nodeType !== 1) return undefined
        const cls = (attr(el, 'class') || '').toLowerCase()
        const isCallout =
          el.tagName === 'ASIDE' ||
          /key-takeaways|thirty-second|opinion|callout|note|tip|warning/.test(cls)
        if (!isCallout) return undefined
        // Strip a leading heading ("Key Takeaways") — its label is redundant in
        // the callout body — then flatten the rest to text.
        const clone = el.cloneNode(true)
        for (const h of clone.querySelectorAll('h1,h2,h3,h4')) h.remove()
        const body = collapse(clone.textContent)
        if (!body) return undefined
        return { _type: 'callout', _key: key(), tone: calloutTone(el), body }
      },
    },

    // <table> -> PT table (minimal). Header row from <thead> or first <tr> of th.
    {
      deserialize(el) {
        if (el.nodeType !== 1 || el.tagName !== 'TABLE') return undefined
        const trs = [...el.querySelectorAll('tr')]
        if (!trs.length) return undefined
        const rows = trs.map((tr) => ({
          _type: 'tableRow',
          _key: key(),
          cells: [...tr.querySelectorAll('th,td')].map((c) => collapse(c.textContent)),
        }))
        const hasHeaderRow =
          !!el.querySelector('thead') ||
          [...trs[0].children].every((c) => c.tagName === 'TH')
        if (rows.every((r) => r.cells.length === 0)) {
          warn('Skipped a <table> with no cells.')
          return undefined
        }
        return { _type: 'table', _key: key(), hasHeaderRow, rows }
      },
    },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Deserialize HTML body -> PT array
// ─────────────────────────────────────────────────────────────────────────────
function htmlBodyToPortableText(bodyHtml, compiledType, imageSink, warn) {
  const rules = buildRules(imageSink, warn)
  const raw = htmlToBlocks(bodyHtml, compiledType, {
    parseHtml: (html) => new JSDOM(html).window.document,
    rules,
  })

  // Our custom object types (image / codeBlock / callout / table) are top-level
  // body members in this project's PT contract — the renderer's `types:`
  // handlers only fire on top-level array items, never on block children. But
  // block-tools can place an object returned by a rule INSIDE a text block's
  // `children` (when the source element sat among inline content). Hoist any
  // such object out to its own top-level entry, in document order.
  const OBJECT_TYPES = new Set(['image', 'codeBlock', 'callout', 'table'])
  const out = []
  for (const b of raw) {
    if (b._type === 'block' && Array.isArray(b.children)) {
      const spans = []
      for (const c of b.children) {
        if (c && c._type && OBJECT_TYPES.has(c._type)) {
          out.push(c) // hoist object to top level
        } else {
          spans.push(c)
        }
      }
      if (spans.length) out.push({ ...b, children: spans })
    } else if (b._type && OBJECT_TYPES.has(b._type)) {
      out.push(b)
    } else {
      out.push(b)
    }
  }

  // Fill any missing _key so the doc is valid PT, and drop empty text blocks
  // (e.g. a wrapper that held only a hoisted object).
  return out.filter((b) => {
    if (!b._key) b._key = randomKey(12)
    if (b._type !== 'block') return true
    if (!Array.isArray(b.children)) return true
    for (const c of b.children) if (!c._key) c._key = randomKey(12)
    if (Array.isArray(b.markDefs)) {
      for (const m of b.markDefs) if (!m._key) m._key = randomKey(12)
    }
    return b.children.some((c) => (c.text ? c.text.trim() : c._type && c._type !== 'span'))
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble the target document for each type
// ─────────────────────────────────────────────────────────────────────────────
function buildDocument({ type, meta, titleText, body, faq, slug, coverImage, live, warn }) {
  const seo = {
    _type: 'seo',
    metaTitle: meta.title || meta.ogTitle || titleText,
    metaDescription: meta.description || meta.ogDescription,
    noindex: meta.noindex,
  }
  if (meta.canonical) seo.canonicalUrl = meta.canonical
  // Strip undefined for cleaner output.
  for (const k of Object.keys(seo)) if (seo[k] === undefined) delete seo[k]

  const description = meta.description || meta.ogDescription || ''
  const now = new Date().toISOString()

  if (type === 'glossaryTerm') {
    if (faq.length) warn('glossaryTerm has no faq[] field — FAQ pairs were NOT attached.')
    const doc = {
      _type: 'glossaryTerm',
      _id: `${live ? '' : 'drafts.'}glossary-${slug}`,
      term: titleText,
      slug: { _type: 'slug', current: slug },
      shortDefinition: description.slice(0, 480) || titleText,
      body,
      seo,
      lastReviewed: now.slice(0, 10),
      publishedAt: now,
    }
    return doc
  }

  const base = {
    _type: type,
    _id: `${live ? '' : 'drafts.'}${type === 'guide' ? 'guide' : 'post'}-${slug}`,
    title: titleText,
    slug: { _type: 'slug', current: slug },
    description,
    body,
    publishedAt: now,
    seo,
  }
  if (coverImage) base.coverImage = coverImage
  if (type === 'post' && faq.length) {
    base.faq = faq.map((f) => ({ _type: 'faqItem', _key: randomKey(12), ...f }))
  } else if (type === 'guide' && faq.length) {
    warn('guide has no faq[] field — FAQ pairs were NOT attached (left in body if present).')
  }
  return base
}

// ─────────────────────────────────────────────────────────────────────────────
// --publish: upload images + createOrReplace. Lazy-imports the write client so
// dry-run never needs a token.
// ─────────────────────────────────────────────────────────────────────────────
async function publish({ doc, coverNode, inlineImages, folder, warn }) {
  const { readFileSync } = await import('node:fs')
  const { createClient } = await import('next-sanity')

  // Minimal .env.local loader (mirrors the other seed scripts).
  try {
    const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of env.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  } catch {
    /* ambient env */
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId || !dataset || !token) {
    throw new Error(
      'Missing NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET / SANITY_API_WRITE_TOKEN for --publish.',
    )
  }
  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19',
    token,
    useCdn: false,
  })

  const uploadLocal = async (src, label) => {
    if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:')) {
      warn(`${label}: non-local src "${src}" — left unresolved (upload only handles local files).`)
      return null
    }
    const filePath = resolve(folder, src)
    if (!existsSync(filePath)) {
      warn(`${label}: file not found "${filePath}" — skipped.`)
      return null
    }
    const asset = await client.assets.upload('image', readFileSync(filePath), {
      filename: basename(filePath),
    })
    return asset._id
  }

  // Cover image.
  if (coverNode?._localSrc) {
    const id = await uploadLocal(coverNode._localSrc, 'coverImage')
    if (id) {
      doc.coverImage = { _type: 'image', alt: coverNode.alt || '', asset: { _type: 'reference', _ref: id } }
    } else {
      delete doc.coverImage
    }
  }

  // Inline body images.
  for (const node of inlineImages) {
    const id = await uploadLocal(node._localSrc, `inline image "${node._localSrc}"`)
    if (id) {
      node.asset = { _type: 'reference', _ref: id }
    }
    delete node._localSrc
  }

  const result = await client.createOrReplace(doc)
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2))
  const warnings = []
  const warn = (m) => warnings.push(m)

  if (!args._.length) {
    console.error(
      'Usage: node scripts/engine-to-sanity.mjs <folder-or-html> --type <post|guide|glossaryTerm> [--publish | --live] [--dry-run]',
    )
    process.exit(1)
  }
  if (!VALID_TYPES.has(args.type)) {
    console.error(`--type must be one of: ${[...VALID_TYPES].join(', ')}`)
    process.exit(1)
  }

  const { html, folder, htmlFile } = loadArticle(args._[0])
  const dom = new JSDOM(html)
  const doc = dom.window.document

  const meta = extractMeta(doc)
  const faq = extractFaq(doc)
  const { titleText, heroSrc, heroAlt, bodyHtml } = prepareBody(doc, faq.length, warn)

  const compiledType = compileBlockContentType()
  const inlineImages = []
  const body = htmlBodyToPortableText(bodyHtml, compiledType, inlineImages, warn)

  const slug = slugify(titleText) || basename(htmlFile, extname(htmlFile))

  // Cover image node (dry-run keeps the local path; --publish resolves it).
  let coverNode = null
  let coverImage = null
  if (heroSrc) {
    coverNode = { _localSrc: heroSrc, alt: heroAlt }
    coverImage = { _type: 'image', alt: heroAlt, _localSrc: heroSrc }
  } else if (meta.ogImage) {
    coverNode = { _localSrc: meta.ogImage, alt: '' }
    coverImage = { _type: 'image', alt: '', _localSrc: meta.ogImage }
  }

  const document = buildDocument({
    type: args.type,
    meta,
    titleText,
    body,
    faq,
    slug,
    coverImage,
    live: args.live,
    warn,
  })

  // Note unmapped constructs for the operator.
  const ldCount = doc.querySelectorAll('script[type="application/ld+json"]').length
  if (ldCount) warn(`Dropped ${ldCount} JSON-LD <script> block(s) — Next emits schema per page.`)
  const ctaCount = doc.querySelectorAll('.cta-card').length
  if (ctaCount) warn(`Dropped ${ctaCount} .cta-card block(s) — site renders its own CTAs.`)
  if (faq.length) warn('glossaryRef cross-linking is a manual post step — links kept as plain <link> annotations.')

  if (args.publish) {
    const result = await publish({ doc: document, coverNode, inlineImages, folder, warn })
    console.error('\n— Warnings —')
    for (const w of warnings) console.error('  • ' + w)
    const stage = result._id.startsWith('drafts.') ? 'DRAFT (review + publish in /studio)' : 'LIVE'
    console.error(`\n✓ Wrote ${stage}: ${result._type} "${result._id}" (slug: ${slug})`)
    return
  }

  // Dry-run: print the document. Keep _localSrc on image nodes so the operator
  // sees which files would be uploaded.
  process.stdout.write(JSON.stringify(document, null, 2) + '\n')
  console.error('\n— Dry run (no token used). Pass --publish to upload + write. —')
  console.error(`  type: ${args.type}   slug: ${slug}   body blocks: ${body.length}`)
  console.error(`  faq items: ${faq.length}   inline images: ${inlineImages.length}   cover: ${coverImage ? 'yes' : 'no'}`)
  if (warnings.length) {
    console.error('— Notes / unmapped constructs —')
    for (const w of warnings) console.error('  • ' + w)
  }
}

main().catch((err) => {
  console.error('\n[error] ' + (err?.stack || err?.message || err))
  process.exit(1)
})
