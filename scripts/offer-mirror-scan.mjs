/**
 * Offer Mirror collector — the MECHANICAL half of the blind scan (Phase A).
 *
 * Walks the public route/source map, extracts the raw material an offer read is
 * built from (metadata, visible copy, CTAs, price tokens, index flags), pulls the
 * published Sanity inventory, and — with `--live` — fetches production and diffs
 * it against what the repo says. Everything lands in a dated JSON snapshot plus a
 * markdown diff against the previous one.
 *
 *   IT DOES NOT WRITE `lib/strategy/offers/*`. Synthesis stays agent work:
 *   the collector gathers evidence, it does not decide what the offer is.
 *
 *   Refresh = run this collector, then re-run the Offer Mirror prompt from
 *   Phase B against the new snapshot.
 *
 * Usage:
 *   node scripts/offer-mirror-scan.mjs            # repo-only scan + Sanity pull
 *   node scripts/offer-mirror-scan.mjs --live     # + fetch salesolution.net and diff
 *   node scripts/offer-mirror-scan.mjs --date 2026-07-25   # override the snapshot date
 *
 * Output:
 *   analysis/offer-mirror/snapshots/<YYYY-MM-DD>.json
 *   analysis/offer-mirror/snapshots/<YYYY-MM-DD>.diff.md   (when a prior snapshot exists)
 *
 * Env: read from `.env.local` at the repo root (already-exported vars win, so
 * `node --env-file=.env.local scripts/offer-mirror-scan.mjs` works too). Env
 * VALUES are never printed and never written into the snapshot — only whether a
 * credential was present.
 *
 * Extraction is deliberately static and best-effort: a length-preserving source
 * scanner blanks comments and neutralises string contents, so JSX text, metadata
 * objects, and href attributes can be located by position without a parser and
 * without new dependencies. Node stdlib + repo deps only.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const OUT_DIR = path.join(ROOT, 'analysis', 'offer-mirror', 'snapshots')

// ── args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const LIVE = argv.includes('--live')
const DATE = (() => {
  const i = argv.indexOf('--date')
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  // Local calendar day, not UTC — snapshots are named for the operator's day.
  const d = new Date()
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
})()

// ── env (values never printed) ───────────────────────────────────────────────
let envLoaded = false
try {
  const raw = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  envLoaded = true
} catch {
  envLoaded = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
}

// ── corpus definition (mirrors the blind scan's Phase A corpus) ──────────────
const ROUTE_ROOTS = ['app/(site)', 'app/(campaign)']
/** Internal utilities — never part of the public corpus. */
const ROUTE_EXCLUDE = [/(^|\/)drafts(\/|$)/, /(^|\/)dev(\/|$)/]

const COPY_COMPONENT_DIRS = [
  'components/sections',
  'components/layout',
  'components/forms',
  'components/seo',
  'components/probe',
  'components/tools',
  'components/services',
  'components/portable-text',
  'components/integrations',
]
const COPY_LIB_FILES = ['lib/business.ts', 'lib/navigation.ts', 'lib/schema.ts']
const COPY_LIB_DIRS = ['lib/lead-form', 'lib/probe']

const CHROME_ENTRIES = ['app/layout.tsx', 'app/(site)/layout.tsx', 'app/(campaign)/layout.tsx']
const MACHINE_FILES = [
  'lib/schema.ts',
  'public/llms.txt',
  'app/robots.ts',
  'app/sitemap.xml/route.ts',
  'app/sitemaps/[file]/route.ts',
  'lib/sitemap/registry.ts',
  'lib/sitemap/data.ts',
]
const API_DIRS = ['app/api/lead', 'app/api/full-growth-quote', 'app/api/revenue-leak-audit']
const API_EXTRA_DIRS = ['lib/lead-form']
const PROBE_DIRS = ['app/api/probe', 'lib/probe']
const CONSENT_DIRS = ['components/integrations']

const SANITY_TYPES = [
  'careerPath',
  'caseStudy',
  'caseStudyClient',
  'glossaryTerm',
  'guide',
  'post',
]

const LIVE_ORIGIN = 'https://salesolution.net'
const LIVE_PAGES = [
  '/',
  '/services/',
  '/revenue-engine/',
  '/industries/home-services/',
  '/revenue-engine/dentists/',
  '/industries/industrial-distribution/',
  '/industries/consumer-brands/',
  '/book-growth-call/',
  '/unlock-growth-audit/',
  '/glossary/',
  '/case-studies/',
]
const LIVE_TEXT_FILES = ['/llms.txt', '/robots.txt']

// `$30K+`, `$3/SKU`, `$15K/mo`, `$200K+/year`. The K/M suffix must be attached
// and not the head of a word, so "$3,000 monthly" does not become "$3,000 m".
const PRICE_RE =
  /\$\s?\d[\d,]*(?:\.\d+)?(?:[KkMm](?![a-zA-Z]))?\+?(?:\s?\/\s?(?:SKU|sku|mo|month|year|yr|seat|lead|call|job))?/g

// ── tiny helpers ─────────────────────────────────────────────────────────────
/** Code-unit compare, not locale collation — snapshot ordering must be portable. */
const cmp = (a, b) => {
  const x = String(a)
  const y = String(b)
  return x < y ? -1 : x > y ? 1 : 0
}

const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/')
const abs = (r) => path.join(ROOT, r)
const isFile = (r) => {
  try {
    return statSync(abs(r)).isFile()
  } catch {
    return false
  }
}

function walk(dirRel, out = []) {
  let entries
  try {
    entries = readdirSync(abs(dirRel), { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries.sort((a, b) => cmp(a.name, b.name))) {
    const r = `${dirRel}/${e.name}`
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '__fixtures__') continue
      walk(r, out)
    } else if (e.isFile()) {
      out.push(r)
    }
  }
  return out
}

const isSource = (r) => /\.(tsx|ts|mts|mjs|js|jsx)$/.test(r) && !/\.test\./.test(r)

const readSource = (r) => {
  try {
    return readFileSync(abs(r), 'utf8')
  } catch {
    return ''
  }
}

// ── length-preserving source scanner ─────────────────────────────────────────
/**
 * Returns `{ code, struct, strings }`, all index-aligned with `src`.
 *
 * - `code`  — comments blanked; string contents kept but with `<>{}` and newlines
 *             turned into spaces, so JSX-text and `href="…"` scanning still see
 *             the literal values without being fooled by punctuation inside them.
 * - `struct`— comments AND string contents blanked entirely: pure structure, for
 *             brace matching and object-key walking (a comma or colon inside a
 *             string must not look like a delimiter).
 * - `strings` — raw literal contents (templates only when free of `${}`).
 */
function scanSource(src) {
  const n = src.length
  const code = new Array(n)
  const struct = new Array(n)
  const strings = []
  const blank = (i) => {
    const c = src[i] === '\n' ? '\n' : ' '
    code[i] = c
    struct[i] = c
  }
  let i = 0
  while (i < n) {
    const c = src[i]
    const c2 = src[i + 1]
    if (c === '/' && c2 === '/') {
      while (i < n && src[i] !== '\n') blank(i++)
      continue
    }
    if (c === '/' && c2 === '*') {
      const end = src.indexOf('*/', i + 2)
      const stop = end === -1 ? n : end + 2
      while (i < stop) blank(i++)
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      const tpl = c === '`'
      code[i] = c
      struct[i] = c
      let j = i + 1
      let raw = ''
      let closed = false
      while (j < n) {
        const ch = src[j]
        if (ch === '\\') {
          code[j] = ' '
          struct[j] = ' '
          if (j + 1 < n) {
            code[j + 1] = ' '
            struct[j + 1] = ' '
          }
          raw += src[j + 1] ?? ''
          j += 2
          continue
        }
        if (ch === quote) {
          code[j] = ch
          struct[j] = ch
          closed = true
          j++
          break
        }
        if (!tpl && ch === '\n') break // unterminated (likely a regex literal) — bail
        code[j] = '<>{}\n'.includes(ch) ? ' ' : ch
        struct[j] = ch === '\n' ? '\n' : ' '
        raw += ch
        j++
      }
      if (closed && (!tpl || !raw.includes('${'))) strings.push(raw)
      i = closed ? j : i + 1
      if (!closed) {
        code[i - 1] = ' '
        struct[i - 1] = ' '
      }
      continue
    }
    code[i] = c
    struct[i] = c
    i++
  }
  for (let k = 0; k < n; k++) {
    if (code[k] === undefined) code[k] = ' '
    if (struct[k] === undefined) struct[k] = ' '
  }
  return { code: code.join(''), struct: struct.join(''), strings }
}

// ── text helpers ─────────────────────────────────────────────────────────────
const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '—',
  '&ndash;': '–',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&hellip;': '…',
  '&middot;': '·',
  '&times;': '×',
  '&deg;': '°',
  '&trade;': '™',
  '&copy;': '©',
  '&reg;': '®',
}
function decodeEntities(s) {
  return s
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
}
const collapse = (s) => decodeEntities(String(s)).replace(/\s+/g, ' ').trim()

const WORDS = (s) => s.split(/\s+/).filter(Boolean)

/** Is this string plausibly visible customer-facing copy (>3 words)? */
function isCopy(s) {
  const t = collapse(s)
  if (t.length < 12) return false
  const w = WORDS(t)
  if (w.length <= 3) return false
  if (/^(\/|\.\.?\/|@\/|https?:|mailto:|tel:|data:|#)/.test(t)) return false
  if (/^[A-Z0-9_]+$/.test(t.replace(/\s/g, ''))) return false
  if (!/[a-z]/.test(t)) return false
  // class-name / token soup: mostly hyphen-, colon- or slash-bearing tokens
  const tokenish = w.filter((x) => /[-:/[\]]/.test(x)).length
  if (tokenish / w.length > 0.4) return false
  // needs at least two ordinary alphabetic words
  const plain = w.filter((x) => /^[A-Za-z][A-Za-z’'.,;:!?)(]*$/.test(x)).length
  if (plain < 2) return false
  return true
}

/** Drop JSX tags and (nested) `{expr}` blocks, leaving literal text. */
const stripJsx = (s) => {
  let t = String(s).replace(/<[^>]*>/g, ' ')
  for (let pass = 0; pass < 8; pass++) {
    const next = t.replace(/\{[^{}]*\}/g, ' ')
    if (next === t) break
    t = next
  }
  return collapse(t.replace(/[{}]/g, ' '))
}

// ── extractors ───────────────────────────────────────────────────────────────
function balancedFrom(code, openIdx) {
  let depth = 0
  for (let i = openIdx; i < code.length; i++) {
    const c = code[i]
    if (c === '{' || c === '[' || c === '(') depth++
    else if (c === '}' || c === ']' || c === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/** Top-level `key: value` spans of the object literal starting at `openIdx`. */
function topLevelEntries(code, openIdx, closeIdx) {
  const out = []
  let i = openIdx + 1
  let depth = 0
  let key = ''
  let readingKey = true
  let valStart = -1
  while (i < closeIdx) {
    const c = code[i]
    if ('{[('.includes(c)) depth++
    else if ('}])'.includes(c)) depth--
    if (depth === 0) {
      if (readingKey) {
        if (c === ':') {
          readingKey = false
          valStart = i + 1
        } else if (c === ',') {
          key = ''
        } else key += c
      } else if (c === ',') {
        out.push({ key: key.replace(/['"\s]/g, ''), start: valStart, end: i })
        key = ''
        readingKey = true
      }
    }
    i++
  }
  if (!readingKey && valStart >= 0)
    out.push({ key: key.replace(/['"\s]/g, ''), start: valStart, end: closeIdx })
  return out.filter((e) => e.key)
}

function literalsIn(src, start, end) {
  return scanSource(src.slice(start, end)).strings
}

function extractMetadata(src, struct) {
  const meta = {
    title: null,
    description: null,
    canonical: null,
    noindex: false,
    dynamic: /export\s+(?:async\s+)?function\s+generateMetadata/.test(struct),
    present: false,
  }
  const m = /export\s+const\s+metadata\s*(?::[^=]*)?=\s*\{/.exec(struct)
  if (!m) return meta
  const openIdx = struct.indexOf('{', m.index + m[0].length - 1)
  const closeIdx = balancedFrom(struct, openIdx)
  if (closeIdx === -1) return meta
  meta.present = true
  for (const e of topLevelEntries(struct, openIdx, closeIdx)) {
    if (e.key === 'title' || e.key === 'description') {
      const parts = literalsIn(src, e.start, e.end).filter((s) => s.trim())
      if (parts.length) meta[e.key] = collapse(parts.join(''))
    } else if (e.key === 'alternates') {
      const c = /canonical\s*:/.exec(struct.slice(e.start, e.end))
      if (c) {
        const from = e.start + c.index
        const parts = literalsIn(src, from, e.end).filter((s) => s.trim())
        if (parts.length) meta.canonical = collapse(parts.join(''))
      }
    } else if (e.key === 'robots') {
      if (/index\s*:\s*false/.test(struct.slice(e.start, e.end))) meta.noindex = true
    }
  }
  return meta
}

function extractJsxText(code) {
  const out = []
  const re = />\s*([^<>{}]+?)\s*</g
  let m
  while ((m = re.exec(code))) {
    const t = collapse(m[1])
    if (t) out.push(t)
  }
  return out
}

function extractH1s(code) {
  const out = []
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi
  let m
  while ((m = re.exec(code))) {
    const t = stripJsx(m[1])
    if (t) out.push(t)
  }
  return out
}

/** Template-built hrefs keep a `$` marker once `${}` is blanked; normalise them. */
function normaliseHref(raw) {
  const h = collapse(raw)
  if (!h.includes('$')) return { href: h, dynamic: false }
  return { href: h.replace(/\$[^/]*/g, '[dyn]').replace(/\s+/g, ''), dynamic: true }
}

/** Walk back from `idx` to the `{` that opens the enclosing object literal. */
function enclosingObject(struct, idx) {
  let depth = 0
  for (let i = idx; i >= 0; i--) {
    const c = struct[i]
    if (c === '}' || c === ']' || c === ')') depth++
    else if (c === '{' || c === '[' || c === '(') {
      if (depth === 0) return c === '{' ? { start: i, end: balancedFrom(struct, i) } : null
      depth--
    }
  }
  return null
}

function extractCtas(code, struct) {
  const found = new Map()
  const add = (rawHref, label, kind) => {
    const { href, dynamic } = normaliseHref(rawHref)
    if (!href || href === '#') return
    const l = collapse(label ?? '')
    const prev = found.get(href)
    if (!prev) found.set(href, { href, label: l || null, kind, dynamic })
    else if (!prev.label && l) prev.label = l
  }

  // JSX: <Link href="..."> Label </Link>
  const jsx = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*[`'"]([^`'"]*)[`'"]\s*\})/g
  let m
  while ((m = jsx.exec(code))) {
    const href = m[1] ?? m[2] ?? m[3]
    const tagEnd = code.indexOf('>', m.index + m[0].length)
    let label = ''
    if (tagEnd !== -1) {
      const closeIdx = code.indexOf('</', tagEnd)
      const slice = code.slice(tagEnd + 1, closeIdx === -1 ? tagEnd + 400 : closeIdx)
      label = stripJsx(slice).slice(0, 140)
    }
    add(href, label, 'jsx')
  }

  // Data objects: { label: 'Book a Growth Call', href: '/book-growth-call/' }
  // The label must come from the SAME object literal, not a nearby one.
  const data = /\bhref\s*:\s*[`'"]([^`'"]*)[`'"]/g
  while ((m = data.exec(code))) {
    const obj = enclosingObject(struct, m.index)
    let label = ''
    if (obj && obj.end > obj.start) {
      const span = code.slice(obj.start, obj.end)
      for (const key of ['label', 'cta', 'text', 'title', 'copy', 'name']) {
        const hit = new RegExp(`\\b${key}\\s*:\\s*[\`'"]([^\`'"]*)[\`'"]`).exec(span)
        if (hit) {
          label = hit[1]
          break
        }
      }
    }
    add(m[1], label, 'data')
  }

  return [...found.values()].sort((a, b) => cmp(a.href, b.href))
}

function extractPrices(text) {
  const counts = new Map()
  for (const m of String(text).matchAll(PRICE_RE)) {
    const token = collapse(m[0]).replace(/\s?\/\s?/, '/')
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => cmp(a[0], b[0]))
    .map(([token, count]) => ({ token, count }))
}

// ── per-file extraction (memoised) ───────────────────────────────────────────
const fileCache = new Map()
function extractFile(r) {
  if (fileCache.has(r)) return fileCache.get(r)
  const src = readSource(r)
  let result
  if (!isSource(r)) {
    // plain text surface (llms.txt et al.)
    const lines = src.split('\n').map(collapse).filter(Boolean)
    result = {
      file: r,
      metadata: null,
      copy: lines.filter(isCopy),
      ctas: [...new Set([...src.matchAll(/\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]))]
        .sort()
        .map((href) => ({ href, label: null, kind: 'markdown', dynamic: false })),
      h1s: [],
      prices: extractPrices(src),
      imports: [],
      bytes: src.length,
    }
  } else {
    const { code, struct, strings } = scanSource(src)
    const copy = new Set()
    for (const s of strings) if (isCopy(s)) copy.add(collapse(s))
    for (const t of extractJsxText(code)) if (isCopy(t)) copy.add(t)
    result = {
      file: r,
      metadata: extractMetadata(src, struct),
      copy: [...copy].sort(),
      ctas: extractCtas(code, struct),
      h1s: extractH1s(code),
      // `code`, not `src` — a "$2,400" in an explanatory comment is not a price
      // the site quotes.
      prices: extractPrices(code),
      imports: importsOf(code),
      bytes: src.length,
    }
  }
  fileCache.set(r, result)
  return result
}

function importsOf(code) {
  const specs = new Set()
  for (const m of code.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) specs.add(m[1])
  for (const m of code.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) specs.add(m[1])
  return [...specs].sort()
}

// ── import graph, restricted to copy-bearing surfaces ────────────────────────
const EXTS = ['.tsx', '.ts', '.mts', '.mjs', '.js', '.jsx']
function resolveSpec(spec, fromFile) {
  let base
  if (spec.startsWith('@/')) base = spec.slice(2)
  else if (spec.startsWith('./') || spec.startsWith('../'))
    base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec))
  else return null
  if (isFile(base) && isSource(base)) return base
  for (const ext of EXTS) if (isFile(base + ext)) return base + ext
  for (const ext of EXTS) if (isFile(`${base}/index${ext}`)) return `${base}/index${ext}`
  return null
}

const inDirs = (r, dirs) => dirs.some((d) => r === d || r.startsWith(`${d}/`))
function isCopyBearing(r) {
  if (!isSource(r)) return false
  if (COPY_LIB_FILES.includes(r)) return true
  if (inDirs(r, COPY_COMPONENT_DIRS)) return true
  if (inDirs(r, COPY_LIB_DIRS)) return true
  return false
}

/** Files reachable from `entries` that carry copy, plus the entries themselves. */
function collectSources(entries, { includeCoLocated = null } = {}) {
  const seen = new Set()
  const queue = [...entries]
  while (queue.length) {
    const f = queue.shift()
    if (!f || seen.has(f) || !isFile(f)) continue
    seen.add(f)
    if (!isSource(f)) continue
    for (const spec of extractFile(f).imports) {
      const target = resolveSpec(spec, f)
      if (!target || seen.has(target)) continue
      const coLocated = includeCoLocated && target.startsWith(`${includeCoLocated}/`)
      if (isCopyBearing(target) || coLocated) queue.push(target)
    }
  }
  return [...seen].sort()
}

// ── route discovery ──────────────────────────────────────────────────────────
function routePathFor(fileRel) {
  const segs = path.posix.dirname(fileRel).split('/').slice(1) // drop "app"
  const kept = segs.filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith('@'))
  return `/${kept.join('/')}`.replace(/\/+$/, '') || '/'
}

function discoverRoutes() {
  const files = []
  for (const root of ROUTE_ROOTS) files.push(...walk(root))
  const routeFiles = files.filter(
    (f) =>
      /\/(page|route)\.(tsx|ts)$/.test(f) &&
      !ROUTE_EXCLUDE.some((re) => re.test(path.posix.dirname(f))),
  )
  const byRoute = new Map()
  for (const f of routeFiles) {
    const route = routePathFor(f)
    if (!byRoute.has(route)) byRoute.set(route, [])
    byRoute.get(route).push(f)
  }
  return [...byRoute.entries()].sort((a, b) => cmp(a[0], b[0]))
}

// ── index / sitemap signals ──────────────────────────────────────────────────
/**
 * The root layout's title template — production renders `%s · Sale Solution`,
 * so a raw page title never matches the served `<title>` without it.
 */
function rootTitle() {
  const { struct } = scanSource(readSource('app/layout.tsx'))
  const src = readSource('app/layout.tsx')
  const m = /title\s*:\s*\{/.exec(struct)
  if (!m) return { template: '%s', default: null }
  const open = struct.indexOf('{', m.index)
  const close = balancedFrom(struct, open)
  const out = { template: '%s', default: null }
  for (const e of topLevelEntries(struct, open, close)) {
    const lit = literalsIn(src, e.start, e.end).find((s) => s.trim())
    if (!lit) continue
    if (e.key === 'template') out.template = lit
    if (e.key === 'default') out.default = lit
  }
  return out
}

function sitemapStaticPaths() {
  const src = readSource('lib/sitemap/registry.ts')
  const paths = new Set()
  for (const m of src.matchAll(/\bu\(\s*[`'"]([^`'"]+)[`'"]/g)) paths.add(m[1])
  // TOOL_URLS is generated from the tool catalog, so record the pattern.
  if (/\/tools\/\$\{t\.slug\}\//.test(src)) paths.add('/tools/*')
  return paths
}
function robotsDisallowPrefixes() {
  const src = readSource('app/robots.ts')
  const m = /standardDisallow\s*=\s*\[([^\]]*)\]/.exec(src)
  if (!m) return []
  return [...m[1].matchAll(/[`'"]([^`'"]+)[`'"]/g)].map((x) => x[1]).sort()
}

const normRoute = (r) => (r === '/' ? '/' : r.replace(/\/+$/, ''))

// ── record builders ──────────────────────────────────────────────────────────
function aggregate(sources) {
  const copy = new Set()
  const ctas = new Map()
  const prices = new Map()
  const h1s = new Set()
  let bytes = 0
  for (const f of sources) {
    const x = extractFile(f)
    bytes += x.bytes
    for (const c of x.copy) copy.add(c)
    for (const t of x.h1s) h1s.add(t)
    for (const c of x.ctas) {
      const prev = ctas.get(c.href)
      if (!prev) ctas.set(c.href, { ...c })
      else if (!prev.label && c.label) prev.label = c.label
    }
    for (const p of x.prices) prices.set(p.token, (prices.get(p.token) ?? 0) + p.count)
  }
  return {
    bytes,
    copy: [...copy].sort(),
    h1s: [...h1s].sort(),
    ctas: [...ctas.values()].sort((a, b) => cmp(a.href, b.href)),
    prices: [...prices.entries()]
      .sort((a, b) => cmp(a[0], b[0]))
      .map(([token, count]) => ({ token, count })),
  }
}

function buildRouteRecord(route, routeFiles, ctx) {
  const dir = path.posix.dirname(routeFiles[0])
  const sources = collectSources(routeFiles, { includeCoLocated: dir })
  const agg = aggregate(sources)
  const meta = routeFiles
    .map((f) => extractFile(f).metadata)
    .filter(Boolean)
    .reduce(
      (acc, m) => ({
        title: acc.title ?? m.title,
        description: acc.description ?? m.description,
        canonical: acc.canonical ?? m.canonical,
        noindex: acc.noindex || m.noindex,
        dynamic: acc.dynamic || m.dynamic,
        present: acc.present || m.present,
      }),
      { title: null, description: null, canonical: null, noindex: false, dynamic: false, present: false },
    )

  const n = normRoute(route)
  const flags = []
  if (meta.noindex) flags.push('noindex')
  if (meta.dynamic) flags.push('dynamic-metadata')
  if (!meta.present && !meta.dynamic) flags.push('no-metadata-export')
  if (!agg.ctas.length) flags.push('no-cta')
  if (/\[.+\]/.test(route)) flags.push('dynamic-segment')
  if (routeFiles.some((f) => f.endsWith('route.ts'))) flags.push('route-handler')
  if (routeFiles.some((f) => f.startsWith('app/(campaign)/'))) flags.push('campaign-group')
  if (ctx.sitemapPaths.has(`${n}/`) || ctx.sitemapPaths.has(n) || (n.startsWith('/tools/') && ctx.sitemapPaths.has('/tools/*')))
    flags.push('in-static-sitemap')
  else if (!/\[.+\]/.test(route)) flags.push('not-in-static-sitemap')
  if (ctx.robotsDisallow.some((p) => `${n}/`.startsWith(p))) flags.push('robots-disallow')

  return {
    route: n,
    routeFiles,
    sources,
    sourceCount: sources.length,
    metadata: {
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical,
      dynamic: meta.dynamic,
    },
    h1Candidates: agg.h1s,
    h1: agg.h1s.length === 1 ? agg.h1s[0] : null,
    copyCount: agg.copy.length,
    copy: agg.copy,
    ctas: agg.ctas,
    ctaCount: agg.ctas.length,
    prices: agg.prices,
    priceTokenCount: agg.prices.reduce((s, p) => s + p.count, 0),
    flags: flags.sort(),
  }
}

function buildSurface(id, entries, note) {
  const sources = collectSources(entries)
  const agg = aggregate(sources)
  return {
    id,
    note,
    sources,
    sourceCount: sources.length,
    copyCount: agg.copy.length,
    copy: agg.copy,
    ctas: agg.ctas,
    ctaCount: agg.ctas.length,
    prices: agg.prices,
    priceTokenCount: agg.prices.reduce((s, p) => s + p.count, 0),
  }
}

// ── published Sanity pull ────────────────────────────────────────────────────
function ptTextLength(value, seen = 0) {
  if (seen > 6 || value == null) return 0
  if (Array.isArray(value) || typeof value === 'object') {
    let total = 0
    if (!Array.isArray(value) && value._type === 'block' && Array.isArray(value.children)) {
      for (const child of value.children) total += String(child?.text ?? '').length
      return total
    }
    for (const v of Array.isArray(value) ? value : Object.values(value))
      total += ptTextLength(v, seen + 1)
    return total
  }
  return 0
}

async function pullSanity() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
  const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  const base = {
    perspective: 'published',
    credentialsPresent: Boolean(projectId && dataset),
    source: 'unavailable',
    docCount: 0,
    types: {},
    error: null,
  }
  if (!projectId || !dataset) {
    base.error = 'Sanity project/dataset env missing — routes fed by CMS content are template-only.'
    return base
  }
  const query = `*[_type in $types] | order(_type asc, _id asc)`
  const params = { types: SANITY_TYPES }

  let docs = null
  try {
    const { createClient } = await import('next-sanity')
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
      perspective: 'published',
    })
    docs = await client.fetch(query, params)
    base.source = 'next-sanity'
  } catch (err) {
    try {
      const url = new URL(
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
      )
      url.searchParams.set('query', query)
      url.searchParams.set('$types', JSON.stringify(SANITY_TYPES))
      url.searchParams.set('perspective', 'published')
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      docs = (await res.json()).result
      base.source = 'http'
    } catch (err2) {
      base.error = `client: ${err?.message ?? err} · http: ${err2?.message ?? err2}`
      return base
    }
  }

  const byType = {}
  for (const d of docs ?? []) {
    const t = d._type
    byType[t] ??= { count: 0, docs: [] }
    byType[t].count++
    byType[t].docs.push({
      slug: d.slug?.current ?? null,
      // caseStudyClient.name is editor-only and never rendered — prefer public fields.
      title: d.title ?? d.term ?? d.publicName ?? d.descriptor ?? null,
      textLength: ptTextLength(d),
      updatedAt: d._updatedAt ?? null,
    })
  }
  for (const t of Object.keys(byType))
    byType[t].docs.sort((a, b) => cmp(a.slug ?? a.title, b.slug ?? b.title))

  base.types = Object.fromEntries(Object.keys(byType).sort().map((k) => [k, byType[k]]))
  base.docCount = (docs ?? []).length
  return base
}

// ── live fetch + divergence ──────────────────────────────────────────────────
async function fetchText(url, attempts = 3) {
  let lastErr
  for (let n = 0; n < attempts; n++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'SaleSolution-OfferMirror/1.0 (+repo collector)' },
        redirect: 'follow',
        signal: AbortSignal.timeout(25000),
      })
      const body = await res.text()
      return { status: res.status, url: res.url, body }
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 1500 * (n + 1)))
    }
  }
  throw lastErr
}

function parseLiveHtml(html) {
  // Head-scoped: inline SVGs carry their own <title> elements.
  const head = html.split(/<\/head>/i)[0]
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)
  const desc =
    /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i.exec(head) ??
    /<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i.exec(head)
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)
  const robots = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i.exec(head)
  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i.exec(head)
  const jsonLd = []
  for (const m of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(m[1])
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      for (const node of nodes)
        jsonLd.push({ type: node['@type'] ?? null, keys: Object.keys(node).sort(), bytes: m[1].length })
    } catch {
      jsonLd.push({ type: null, keys: [], bytes: m[1].length, parseError: true })
    }
  }
  const hrefs = new Set()
  for (const m of html.matchAll(/\bhref=["']([^"']+)["']/g)) {
    const h = m[1]
    if (/^(https?:\/\/(?!salesolution\.net)|data:|javascript:)/.test(h)) continue
    const norm = h.replace(/^https:\/\/salesolution\.net/, '') || '/'
    // Build assets and icons are not navigation.
    if (/^\/_next\//.test(norm)) continue
    if (/^\/(apple-icon|icon\.svg|favicon|opengraph-image|sitemap|robots)/.test(norm)) continue
    if (/\.(js|css|woff2?|png|jpe?g|svg|webp|avif|ico|xml|txt)$/i.test(norm.split('?')[0])) continue
    hrefs.add(norm)
  }
  // Visible text plus JSON-LD payloads: schema.org offers carry real prices.
  const text = decodeEntities(
    html
      .replace(/<script(?![^>]+ld\+json)[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' '),
  )
  return {
    title: title ? collapse(title[1]) : null,
    description: desc ? collapse(desc[1]) : null,
    h1: h1 ? collapse(h1[1].replace(/<[^>]*>/g, ' ')) : null,
    robots: robots ? collapse(robots[1]) : null,
    canonical: canonical ? collapse(canonical[1]) : null,
    jsonLd: jsonLd.sort((a, b) => cmp(String(a.type), String(b.type))),
    hrefs: [...hrefs].sort(),
    prices: extractPrices(text),
  }
}

const hrefKey = (h) => {
  const s = String(h).split('#')[0].split('?')[0]
  return s === '/' ? '/' : s.replace(/\/+$/, '')
}

async function runLive(routes, surfaces) {
  const byRoute = new Map(routes.map((r) => [r.route, r]))
  const titleTpl = rootTitle()
  const expectedTitle = (t) => (t ? titleTpl.template.replace('%s', t) : titleTpl.default)

  const chromeHrefs = new Set()
  const dynPrefixes = new Set()
  const addDyn = (c) => {
    if (!c.dynamic) return
    const p = c.href.split('[dyn]')[0]
    if (p.startsWith('/') && p.length > 1) dynPrefixes.add(p)
  }
  for (const s of surfaces) {
    for (const c of s.ctas) {
      chromeHrefs.add(hrefKey(c.href))
      addDyn(c)
    }
  }

  // A file imported by most routes (shared chrome, generic FAQ shells) carries
  // copy that is not this page's own claim. Only diff prices from page-scoped files.
  const fileRoutes = new Map()
  for (const r of routes) for (const f of r.sources) fileRoutes.set(f, (fileRoutes.get(f) ?? 0) + 1)
  const SHARED_FILE_THRESHOLD = 5
  const pageScopedPrices = (r) => {
    const set = new Set()
    for (const f of r.sources) {
      if ((fileRoutes.get(f) ?? 0) > SHARED_FILE_THRESHOLD) continue
      for (const p of extractFile(f).prices) set.add(p.token)
    }
    return set
  }

  const pages = []
  const divergences = []
  let reachable = 0

  for (const p of LIVE_PAGES) {
    const url = LIVE_ORIGIN + p
    const routeId = normRoute(p)
    const repo = byRoute.get(routeId)
    let live = null
    let error = null
    let status = null
    try {
      const r = await fetchText(url)
      status = r.status
      live = parseLiveHtml(r.body)
      reachable++
    } catch (e) {
      error = e?.message ?? String(e)
    }
    pages.push({ page: p, status, error, live })
    if (!live || !repo) continue

    const row = (field, repoVal, liveVal) =>
      divergences.push({ page: p, field, repo: repoVal, live: liveVal })

    if (repo.metadata.dynamic) {
      // generateMetadata — nothing static to compare
    } else {
      const wantTitle = expectedTitle(repo.metadata.title)
      if (collapse(wantTitle ?? '') !== collapse(live.title ?? ''))
        row('title', wantTitle, live.title)
      if (collapse(repo.metadata.description ?? '') !== collapse(live.description ?? ''))
        row('description', repo.metadata.description, live.description)
      if (
        repo.metadata.canonical &&
        collapse(repo.metadata.canonical) !== collapse(live.canonical ?? '')
      )
        row('canonical', repo.metadata.canonical, live.canonical)
    }
    if (repo.h1 && live.h1 && collapse(repo.h1) !== collapse(live.h1)) row('h1', repo.h1, live.h1)
    else if (repo.h1 && !live.h1) row('h1', repo.h1, '(none rendered)')
    else if (!repo.h1 && live.h1) {
      // Most H1s arrive as a component prop, so the repo value is not statically
      // resolvable. Fall back to asking whether production's H1 exists verbatim
      // anywhere in this route's repo copy — if not, the deploy is ahead/behind.
      const inCopy = repo.copy.some((c) => collapse(c) === collapse(live.h1))
      if (!inCopy) row('h1-not-in-repo-copy', '(not statically resolvable)', live.h1)
    }

    const routeDyn = new Set(dynPrefixes)
    for (const c of repo.ctas) {
      if (!c.dynamic) continue
      const p = c.href.split('[dyn]')[0]
      if (p.startsWith('/') && p.length > 1) routeDyn.add(p)
    }
    const liveHrefs = new Set(live.hrefs.map(hrefKey))
    const repoHrefs = repo.ctas.filter((c) => !c.dynamic && c.href.startsWith('/')).map((c) => c.href)
    const missing = [...new Set(repoHrefs.map(hrefKey))].filter((h) => !liveHrefs.has(h)).sort()
    if (missing.length) row('cta-missing-on-live', missing.join(' · '), '(absent)')
    const repoAll = new Set([...repoHrefs.map(hrefKey), ...chromeHrefs])
    const extra = [...liveHrefs]
      .filter(
        (h) =>
          h.startsWith('/') &&
          !repoAll.has(h) &&
          // explained by a template-built link like `/glossary/${slug}`
          ![...routeDyn].some((p) => h.startsWith(p)),
      )
      .sort()
    if (extra.length) row('cta-live-only', '(absent)', extra.join(' · '))

    const repoPrices = pageScopedPrices(repo)
    const livePrices = new Set(live.prices.map((x) => x.token))
    const priceMissing = [...repoPrices].filter((x) => !livePrices.has(x)).sort()
    const priceExtra = [...livePrices].filter((x) => !repoPrices.has(x)).sort()
    if (priceMissing.length) row('price-missing-on-live', priceMissing.join(' · '), '(absent)')
    if (priceExtra.length) row('price-live-only', '(absent)', priceExtra.join(' · '))
  }

  const files = []
  for (const f of LIVE_TEXT_FILES) {
    let entry = { file: f, status: null, error: null, bytes: 0, sameAsRepo: null, firstDiffLine: null }
    try {
      const r = await fetchText(LIVE_ORIGIN + f)
      reachable++
      entry.status = r.status
      entry.bytes = r.body.length
      if (f === '/llms.txt') {
        const repoTxt = readSource('public/llms.txt')
        entry.sameAsRepo = repoTxt.trim() === r.body.trim()
        if (!entry.sameAsRepo) {
          const a = repoTxt.split('\n')
          const b = r.body.split('\n')
          for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if ((a[i] ?? '') !== (b[i] ?? '')) {
              entry.firstDiffLine = { line: i + 1, repo: collapse(a[i] ?? ''), live: collapse(b[i] ?? '') }
              break
            }
          }
          divergences.push({
            page: '/llms.txt',
            field: 'body',
            repo: entry.firstDiffLine ? `L${entry.firstDiffLine.line}: ${entry.firstDiffLine.repo}` : '(differs)',
            live: entry.firstDiffLine ? entry.firstDiffLine.live : '(differs)',
          })
        }
      } else if (f === '/robots.txt') {
        const expected = robotsDisallowPrefixes()
        const missing = expected.filter((p) => !r.body.includes(`Disallow: ${p}`))
        entry.missingDisallow = missing
        if (missing.length)
          divergences.push({
            page: '/robots.txt',
            field: 'disallow',
            repo: missing.join(' · '),
            live: '(absent)',
          })
      }
    } catch (e) {
      entry.error = e?.message ?? String(e)
    }
    files.push(entry)
  }

  const attempted = LIVE_PAGES.length + LIVE_TEXT_FILES.length
  return {
    origin: LIVE_ORIGIN,
    attempted,
    reachable,
    networkBlocked: reachable === 0,
    pages,
    files,
    divergences: divergences.sort(
      (a, b) => cmp(a.page, b.page) || cmp(a.field, b.field),
    ),
  }
}

// ── snapshot io ──────────────────────────────────────────────────────────────
function sortDeep(v) {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object' && v.constructor === Object) {
    const out = {}
    for (const k of Object.keys(v).sort()) out[k] = sortDeep(v[k])
    return out
  }
  return v
}

function previousSnapshot(date) {
  if (!existsSync(OUT_DIR)) return null
  const files = readdirSync(OUT_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .filter((d) => d < date)
    .sort()
  if (!files.length) return null
  const prevDate = files[files.length - 1]
  try {
    return { date: prevDate, data: JSON.parse(readFileSync(path.join(OUT_DIR, `${prevDate}.json`), 'utf8')) }
  } catch {
    return null
  }
}

function buildDiff(prev, cur) {
  const L = []
  L.push(`# Offer Mirror collector — diff ${prev.date} → ${cur.generatedAt}`)
  L.push('')
  L.push('Mechanical delta only. Synthesis stays agent work: re-run the Offer Mirror prompt')
  L.push('from Phase B against the new snapshot to refresh `lib/strategy/offers/*`.')
  L.push('')

  const p = prev.data
  L.push('## Counts')
  L.push('')
  L.push('| Metric | ' + prev.date + ' | ' + cur.generatedAt + ' | Δ |')
  L.push('|---|---:|---:|---:|')
  const rows = [
    ['routes', p.corpus?.routeCount, cur.corpus.routeCount],
    ['files', p.corpus?.fileCount, cur.corpus.fileCount],
    ['copy strings (unique)', p.corpus?.copyStringCount, cur.corpus.copyStringCount],
    ['price tokens (occurrences)', p.corpus?.priceTokenCount, cur.corpus.priceTokenCount],
    ['CTA hrefs (unique)', p.corpus?.ctaHrefCount, cur.corpus.ctaHrefCount],
    ['Sanity published docs', p.sanity?.docCount, cur.sanity.docCount],
  ]
  for (const [label, a, b] of rows) {
    const d = typeof a === 'number' && typeof b === 'number' ? b - a : ''
    L.push(`| ${label} | ${a ?? '—'} | ${b ?? '—'} | ${d === '' ? '—' : d > 0 ? `+${d}` : d} |`)
  }
  L.push('')

  const prevRoutes = new Map((p.routes ?? []).map((r) => [r.route, r]))
  const curRoutes = new Map(cur.routes.map((r) => [r.route, r]))
  const added = [...curRoutes.keys()].filter((r) => !prevRoutes.has(r)).sort()
  const removed = [...prevRoutes.keys()].filter((r) => !curRoutes.has(r)).sort()
  L.push('## Routes')
  L.push('')
  L.push(added.length ? `- **Added (${added.length}):** ${added.join(', ')}` : '- Added: none')
  L.push(removed.length ? `- **Removed (${removed.length}):** ${removed.join(', ')}` : '- Removed: none')
  L.push('')

  const changes = []
  for (const [route, now] of curRoutes) {
    const before = prevRoutes.get(route)
    if (!before) continue
    const changed = (field, a, b) => {
      if ((a ?? null) !== (b ?? null)) changes.push({ route, field, before: a ?? '—', after: b ?? '—' })
    }
    changed('title', before.metadata?.title, now.metadata.title)
    changed('description', before.metadata?.description, now.metadata.description)
    changed('h1', before.h1, now.h1)
    if ((before.copyCount ?? 0) !== now.copyCount)
      changes.push({ route, field: 'copy strings', before: before.copyCount ?? 0, after: now.copyCount })
    const bp = (before.prices ?? []).map((x) => x.token).join(' · ')
    const np = now.prices.map((x) => x.token).join(' · ')
    if (bp !== np) changes.push({ route, field: 'price tokens', before: bp || '—', after: np || '—' })
    const bc = (before.ctas ?? []).map((c) => c.href).sort().join(' · ')
    const nc = now.ctas.map((c) => c.href).sort().join(' · ')
    if (bc !== nc) changes.push({ route, field: 'cta hrefs', before: bc || '—', after: nc || '—' })
    const bf = (before.flags ?? []).join(',')
    const nf = now.flags.join(',')
    if (bf !== nf) changes.push({ route, field: 'flags', before: bf || '—', after: nf || '—' })
  }
  L.push('## Route-level changes')
  L.push('')
  if (!changes.length) L.push('None.')
  else {
    L.push('| Route | Field | Before | After |')
    L.push('|---|---|---|---|')
    const esc = (s) => String(s).replace(/\|/g, '\\|').slice(0, 220)
    for (const c of changes.slice(0, 200))
      L.push(`| \`${c.route}\` | ${c.field} | ${esc(c.before)} | ${esc(c.after)} |`)
    if (changes.length > 200) L.push(`\n_…${changes.length - 200} more rows omitted._`)
  }
  L.push('')

  L.push('## Sanity')
  L.push('')
  const types = [...new Set([...Object.keys(p.sanity?.types ?? {}), ...Object.keys(cur.sanity.types)])].sort()
  L.push('| Type | ' + prev.date + ' | ' + cur.generatedAt + ' |')
  L.push('|---|---:|---:|')
  for (const t of types)
    L.push(`| ${t} | ${p.sanity?.types?.[t]?.count ?? 0} | ${cur.sanity.types[t]?.count ?? 0} |`)
  L.push('')

  if (cur.live) {
    L.push('## Live (repo vs production)')
    L.push('')
    L.push(
      cur.live.networkBlocked
        ? '- Network blocked in this environment — no live data collected.'
        : `- ${cur.live.divergences.length} divergence row(s) across ${cur.live.reachable}/${cur.live.attempted} fetched surfaces.`,
    )
    L.push('')
  }
  return L.join('\n') + '\n'
}

// ── main ─────────────────────────────────────────────────────────────────────
const ctx = { sitemapPaths: sitemapStaticPaths(), robotsDisallow: robotsDisallowPrefixes() }

const routes = discoverRoutes().map(([route, files]) => buildRouteRecord(route, files, ctx))

const surfaces = [
  buildSurface('chrome:global', CHROME_ENTRIES.filter(isFile), 'Root + group layouts, header/footer, NAP, nav.'),
  buildSurface(
    'machine:global',
    MACHINE_FILES.filter(isFile),
    'JSON-LD builders, llms.txt, robots, sitemap handlers — what answer engines read.',
  ),
  buildSurface(
    'api:prospect-strings',
    [...API_DIRS, ...API_EXTRA_DIRS].flatMap((d) => walk(d)).filter(isSource),
    'Prospect-visible strings in lead / quote / audit API routes and the lead-form layer.',
  ),
  buildSurface(
    'probe:machine-strings',
    PROBE_DIRS.flatMap((d) => walk(d)).filter(isSource),
    'AI-readiness probe scoring copy, gate + report strings.',
  ),
  buildSurface(
    'consent+tracking-copy',
    CONSENT_DIRS.flatMap((d) => walk(d)).filter(isSource),
    'Consent banner + analytics/tracking integrations copy.',
  ),
].sort((a, b) => cmp(a.id, b.id))

const sanity = await pullSanity()
const live = LIVE ? await runLive(routes, surfaces) : null

const allFiles = new Set()
for (const r of routes) for (const f of r.sources) allFiles.add(f)
for (const s of surfaces) for (const f of s.sources) allFiles.add(f)

const uniqueCopy = new Set()
for (const r of routes) for (const c of r.copy) uniqueCopy.add(c)
for (const s of surfaces) for (const c of s.copy) uniqueCopy.add(c)

const uniqueCtas = new Set()
for (const r of routes) for (const c of r.ctas) uniqueCtas.add(c.href)
for (const s of surfaces) for (const c of s.ctas) uniqueCtas.add(c.href)

const priceTotals = new Map()
for (const rec of [...routes, ...surfaces])
  for (const p of rec.prices) priceTotals.set(p.token, (priceTotals.get(p.token) ?? 0) + p.count)

const snapshot = {
  generatedAt: DATE,
  generator: 'scripts/offer-mirror-scan.mjs',
  note:
    'Mechanical half of the Offer Mirror blind scan. Does NOT write lib/strategy/offers/*. ' +
    'Refresh = run this collector, then re-run the Offer Mirror prompt from Phase B against the new snapshot.',
  corpus: {
    routeCount: routes.length,
    surfaceCount: surfaces.length,
    fileCount: allFiles.size,
    copyStringCount: uniqueCopy.size,
    copyStringCountPerRouteSum: routes.reduce((s, r) => s + r.copyCount, 0),
    ctaHrefCount: uniqueCtas.size,
    priceTokenCount: [...priceTotals.values()].reduce((a, b) => a + b, 0),
    uniquePriceTokens: [...priceTotals.entries()]
      .sort((a, b) => cmp(a[0], b[0]))
      .map(([token, count]) => ({ token, count })),
    routeRoots: ROUTE_ROOTS,
    excluded: ['app/(site)/drafts/**', 'app/(site)/dev/**', '**/*.test.*'],
    copyBearingDirs: [...COPY_COMPONENT_DIRS, ...COPY_LIB_DIRS, ...COPY_LIB_FILES].sort(),
    robotsDisallow: ctx.robotsDisallow,
  },
  env: { dotEnvLocalLoaded: envLoaded, sanityCredentialsPresent: sanity.credentialsPresent },
  routes,
  surfaces,
  sanity,
  live,
}

mkdirSync(OUT_DIR, { recursive: true })
const outPath = path.join(OUT_DIR, `${DATE}.json`)
writeFileSync(outPath, JSON.stringify(sortDeep(snapshot), null, 2) + '\n')

const prev = previousSnapshot(DATE)
let diffPath = null
if (prev) {
  diffPath = path.join(OUT_DIR, `${DATE}.diff.md`)
  writeFileSync(diffPath, buildDiff(prev, snapshot))
}

// ── console: summary counts only ─────────────────────────────────────────────
const pad = (label) => label.padEnd(22)
console.log(`Offer Mirror collector — ${DATE}${LIVE ? ' (--live)' : ''}`)
console.log(`  ${pad('routes')}${routes.length}`)
console.log(`  ${pad('pseudo-surfaces')}${surfaces.length}`)
console.log(`  ${pad('files')}${allFiles.size}`)
console.log(
  `  ${pad('copy strings')}${uniqueCopy.size} unique (${snapshot.corpus.copyStringCountPerRouteSum} route-attributed)`,
)
console.log(`  ${pad('cta hrefs')}${uniqueCtas.size} unique`)
console.log(
  `  ${pad('price tokens')}${snapshot.corpus.priceTokenCount} occurrences / ${priceTotals.size} unique`,
)
console.log(
  `  ${pad('sanity (published)')}${sanity.docCount} docs · ${Object.keys(sanity.types).length} types · via ${sanity.source}${sanity.error ? ' · ERROR' : ''}`,
)
if (sanity.error) console.log(`  ${pad('sanity error')}${sanity.error}`)
if (live) {
  console.log(
    `  ${pad('live')}${live.networkBlocked ? 'NETWORK BLOCKED — snapshot emitted without live data' : `${live.reachable}/${live.attempted} fetched · ${live.divergences.length} divergence rows`}`,
  )
}
console.log(`  → ${rel(outPath)}`)
if (diffPath) console.log(`  → ${rel(diffPath)} (vs ${prev.date})`)
