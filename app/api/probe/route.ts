/**
 * POST /api/probe
 *
 * Server-side "AI-Readiness Probe" — fetches a URL, parses its HTML, and
 * returns three deterministic 0–100 scores plus an `overall` average:
 *   { schema, readable, authority, overall }
 *
 * Status codes:
 *   200 — analysis complete
 *   400 — invalid input (bad URL, private host, blocked scheme, etc.)
 *   502 — upstream fetch / parse failed
 *
 * Notes:
 *   - Node runtime required (uses `dns.lookup` for basic SSRF defense).
 *   - Manual redirect loop, max 3 hops, 5s timeout, 2MB body cap.
 *   - Deterministic by design — same URL → same scores.
 */
import type { LookupAddress } from 'node:dns'
import dns from 'node:dns/promises'
import net from 'node:net'

import { type HTMLElement, parse } from 'node-html-parser'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const FETCH_TIMEOUT_MS = 5000
const MAX_REDIRECTS = 3
const MAX_BYTES = 2 * 1024 * 1024 // 2MB
const USER_AGENT = 'SalesolutionProbe/0.1 (+https://salesolution.net/bots)'

type ProbeResult = {
  schema: number
  readable: number
  authority: number
  overall: number
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip)
  if (family === 4) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a >= 224) return true // multicast / reserved
    return false
  }
  if (family === 6) {
    const lower = ip.toLowerCase()
    if (lower === '::1' || lower === '::') return true
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true // ULA
    if (lower.startsWith('fe80')) return true // link-local
    if (lower.startsWith('::ffff:')) {
      // IPv4-mapped IPv6
      return isPrivateIp(lower.slice(7))
    }
    return false
  }
  return false
}

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h === 'ip6-localhost' || h === 'ip6-loopback') return true
  // Direct IP literals
  if (net.isIP(h)) return isPrivateIp(h)
  // IPv6 in brackets won't reach here — URL parser strips them.
  return false
}

async function assertHostnameIsPublic(hostname: string): Promise<void> {
  // If hostname is already a literal IP, the earlier check handled it.
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('blocked-private-ip')
    return
  }
  let addrs: LookupAddress[]
  try {
    addrs = await dns.lookup(hostname, { all: true })
  } catch {
    throw new Error('dns-failed')
  }
  for (const a of addrs) {
    if (isPrivateIp(a.address)) throw new Error('blocked-private-ip')
  }
}

type FetchResult = { html: string; contentType: string }

async function fetchHtml(initialUrl: string): Promise<FetchResult> {
  let current = initialUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = new URL(current)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('bad-redirect-scheme')
    }
    if (isBlockedHostname(parsed.hostname)) throw new Error('blocked-host')
    await assertHostnameIsPublic(parsed.hostname)

    const res = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': USER_AGENT,
      },
    })

    // Manual redirect handling
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      // Drain to release the connection.
      try {
        await res.body?.cancel()
      } catch {
        /* noop */
      }
      if (!location) throw new Error('redirect-without-location')
      if (hop === MAX_REDIRECTS) throw new Error('too-many-redirects')
      current = new URL(location, current).toString()
      continue
    }

    if (!res.ok) throw new Error(`upstream-${res.status}`)

    const contentType = res.headers.get('content-type') ?? ''
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error('not-html')
    }

    // Stream body and cap at MAX_BYTES.
    const reader = res.body?.getReader()
    if (!reader) throw new Error('no-body')
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) {
        total += value.byteLength
        if (total > MAX_BYTES) {
          try {
            await reader.cancel()
          } catch {
            /* noop */
          }
          throw new Error('body-too-large')
        }
        chunks.push(value)
      }
    }

    // Decode (default to utf-8; charset sniffing is overkill for scoring).
    const buf = new Uint8Array(total)
    let offset = 0
    for (const c of chunks) {
      buf.set(c, offset)
      offset += c.byteLength
    }
    const html = new TextDecoder('utf-8', { fatal: false }).decode(buf)
    return { html, contentType }
  }
  throw new Error('too-many-redirects')
}

// ---------- Scoring helpers ----------

const REQUIRED_PROPS: Record<string, string[]> = {
  Product: ['name', 'image', 'description', 'offers'],
  Article: ['headline', 'author', 'datePublished'],
  Organization: ['name', 'url', 'logo'],
  WebSite: ['name', 'url'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
}

const RECOGNIZED_TYPES = new Set(Object.keys(REQUIRED_PROPS))

type ParsedJsonLd = { ok: boolean; data: unknown }

function collectJsonLdBlocks(root: HTMLElement): ParsedJsonLd[] {
  const scripts = root.querySelectorAll('script[type="application/ld+json"]')
  return scripts.map((s) => {
    const raw = s.text?.trim() ?? ''
    if (!raw) return { ok: false, data: null }
    try {
      return { ok: true, data: JSON.parse(raw) }
    } catch {
      return { ok: false, data: null }
    }
  })
}

function flattenLd(data: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const walk = (node: unknown) => {
    if (!node) return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (typeof node === 'object') {
      const obj = node as Record<string, unknown>
      // @graph nesting
      if (Array.isArray(obj['@graph'])) {
        (obj['@graph'] as unknown[]).forEach(walk)
      }
      if ('@type' in obj) out.push(obj)
    }
  }
  walk(data)
  return out
}

function typeMatches(at: unknown): string | null {
  const list = Array.isArray(at) ? at : [at]
  for (const t of list) {
    if (typeof t === 'string' && RECOGNIZED_TYPES.has(t)) return t
  }
  return null
}

function scoreSchema(root: HTMLElement): number {
  const blocks = collectJsonLdBlocks(root)
  if (blocks.length === 0) return 0

  let score = 0
  const anyValid = blocks.some((b) => b.ok)
  if (anyValid) score += 25

  const allValid = blocks.every((b) => b.ok)

  const entities = blocks
    .filter((b) => b.ok)
    .flatMap((b) => flattenLd(b.data))

  const matchedTypes: string[] = []
  for (const e of entities) {
    const m = typeMatches(e['@type'])
    if (m) matchedTypes.push(m)
  }

  if (matchedTypes.length > 0) score += 25

  // Required-prop completeness for FIRST recognized @type.
  if (matchedTypes.length > 0) {
    const firstType = matchedTypes[0]
    const firstEntity = entities.find((e) => typeMatches(e['@type']) === firstType)!
    const required = REQUIRED_PROPS[firstType] ?? []
    if (required.length > 0) {
      let present = 0
      for (const prop of required) {
        const v = firstEntity[prop]
        if (v !== undefined && v !== null && v !== '') {
          // For Product 'offers' or 'price' — both count
          present++
        } else if (firstType === 'Product' && prop === 'offers') {
          const price = firstEntity['price']
          if (price !== undefined && price !== null && price !== '') present++
        }
      }
      score += Math.round((present / required.length) * 30)
    }
  }

  const distinctTypes = new Set(matchedTypes)
  if (distinctTypes.size >= 2) score += 10

  if (allValid) score += 10

  return Math.min(100, Math.max(0, score))
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function headingLevelsOk(root: HTMLElement): boolean {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let prev = 0
  for (const h of headings) {
    const lvl = Number(h.tagName?.[1])
    if (!Number.isFinite(lvl)) continue
    if (prev === 0) {
      prev = lvl
      continue
    }
    if (lvl > prev + 1) return false
    prev = lvl
  }
  return true
}

function scoreReadable(root: HTMLElement): number {
  const robotsMeta = root.querySelector('meta[name="robots"]')
  const robotsContent = robotsMeta?.getAttribute('content')?.toLowerCase() ?? ''
  if (robotsContent.includes('noindex')) return 0

  let score = 0

  const h1s = root.querySelectorAll('h1')
  if (h1s.length === 1) score += 20

  if (headingLevelsOk(root)) score += 15

  const body = root.querySelector('body') ?? root
  const wordCount = countWords(body.text || '')
  if (wordCount >= 200 && wordCount <= 4000) {
    score += 15
  } else if (wordCount > 0) {
    // graded down: closer to band → more points (cap 10)
    if (wordCount < 200) {
      score += Math.round((wordCount / 200) * 10)
    } else {
      // over 4000 — penalize gently
      const over = Math.min(wordCount - 4000, 8000)
      score += Math.max(0, 10 - Math.round((over / 8000) * 10))
    }
  }

  if (root.querySelector('main') || root.querySelector('article')) score += 15

  if (root.querySelector('header') && root.querySelector('footer')) score += 10

  const desc = root.querySelector('meta[name="description"]')
  if (desc) {
    const c = desc.getAttribute('content') ?? ''
    const len = c.length
    if (len >= 50 && len <= 300) {
      score += 15
    } else if (len > 0) {
      if (len < 50) {
        score += Math.round((len / 50) * 8)
      } else {
        const over = Math.min(len - 300, 500)
        score += Math.max(0, 8 - Math.round((over / 500) * 8))
      }
    }
  }

  // robots: not noindex → +10
  score += 10

  return Math.min(100, Math.max(0, score))
}

function scoreAuthority(root: HTMLElement, pageUrl: string): number {
  let score = 0

  const blocks = collectJsonLdBlocks(root)
  const entities = blocks
    .filter((b) => b.ok)
    .flatMap((b) => flattenLd(b.data))

  const hasAuthor =
    entities.some((e) => e['author'] !== undefined && e['author'] !== null && e['author'] !== '') ||
    !!root.querySelector('meta[property="article:author"]')
  if (hasAuthor) score += 25

  const hasPublisher =
    entities.some(
      (e) => e['publisher'] !== undefined && e['publisher'] !== null && e['publisher'] !== '',
    ) ||
    entities.some((e) => {
      const m = typeMatches(e['@type'])
      return m === 'Organization' && typeof e['name'] === 'string' && (e['name'] as string).length > 0
    })
  if (hasPublisher) score += 20

  const hasDate =
    entities.some((e) => e['datePublished'] || e['dateModified']) ||
    !!root.querySelector('time[datetime]')
  if (hasDate) score += 15

  // <cite> tags OR 3+ outbound links to different external hostnames
  const hasCite = root.querySelectorAll('cite').length > 0
  let outboundDistinct = 0
  if (!hasCite) {
    const pageHost = (() => {
      try {
        return new URL(pageUrl).hostname.toLowerCase()
      } catch {
        return ''
      }
    })()
    const externalHosts = new Set<string>()
    const anchors = root.querySelectorAll('a[href]')
    for (const a of anchors) {
      const href = a.getAttribute('href')
      if (!href) continue
      try {
        const abs = new URL(href, pageUrl)
        if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue
        const h = abs.hostname.toLowerCase()
        if (h && h !== pageHost) externalHosts.add(h)
      } catch {
        /* noop */
      }
    }
    outboundDistinct = externalHosts.size
  }
  if (hasCite || outboundDistinct >= 3) score += 15

  // /about /contact /team /authors in header/nav links
  const navAreas = [
    ...root.querySelectorAll('header a[href]'),
    ...root.querySelectorAll('nav a[href]'),
  ]
  const hasAboutLink = navAreas.some((a) => {
    const href = a.getAttribute('href') ?? ''
    return /(^|\/)(about|contact|team|authors)(\/|$|#|\?)/i.test(href)
  })
  if (hasAboutLink) score += 10

  // body images alt ratio
  const body = root.querySelector('body') ?? root
  const imgs = body.querySelectorAll('img')
  if (imgs.length > 0) {
    const withAlt = imgs.filter((i) => {
      const alt = i.getAttribute('alt')
      return typeof alt === 'string' && alt.trim().length > 0
    }).length
    const ratio = withAlt / imgs.length
    if (ratio >= 0.8) score += 10
    else score += Math.round(ratio * 10)
  } else {
    // no images → don't penalize, give full credit
    score += 10
  }

  // html lang
  const html = root.querySelector('html')
  const lang = html?.getAttribute('lang')
  if (lang && lang.trim().length > 0) score += 5

  return Math.min(100, Math.max(0, score))
}

function computeScores(html: string, pageUrl: string): ProbeResult {
  const root = parse(html, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: {
      script: true,
      noscript: true,
      style: true,
      pre: true,
    },
  })
  const schema = scoreSchema(root)
  const readable = scoreReadable(root)
  const authority = scoreAuthority(root, pageUrl)
  const overall = Math.round((schema + readable + authority) / 3)
  return { schema, readable, authority, overall }
}

// ---------- Handler ----------

export async function POST(req: NextRequest) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return badRequest('Invalid JSON body.')
  }

  const url =
    typeof raw === 'object' && raw !== null && 'url' in raw
      ? (raw as { url: unknown }).url
      : undefined
  if (typeof url !== 'string' || url.trim().length === 0) {
    return badRequest('Missing url.')
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    return badRequest('Could not parse URL.')
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return badRequest('Only http and https URLs are allowed.')
  }
  if (isBlockedHostname(parsedUrl.hostname)) {
    return badRequest('Private and loopback addresses are not allowed.')
  }
  try {
    await assertHostnameIsPublic(parsedUrl.hostname)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    if (msg === 'blocked-private-ip') {
      return badRequest('Hostname resolves to a private address.')
    }
    return badRequest('Could not resolve hostname.')
  }

  try {
    const { html } = await fetchHtml(parsedUrl.toString())
    const scores = computeScores(html, parsedUrl.toString())
    return NextResponse.json(scores)
  } catch {
    return NextResponse.json({ error: 'Could not analyze that URL.' }, { status: 502 })
  }
}
