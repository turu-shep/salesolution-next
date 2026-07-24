/**
 * Server-side fetch layer for the AI-Readiness Probe. Shared by
 * POST /api/probe (the homepage band) and /ai-readiness/[token]/ (the full
 * report page) so both score a URL the exact same way.
 *
 * SSRF defenses: scheme allowlist, private/loopback host + resolved-IP
 * blocks, manual redirects (max 3 hops), 5s timeout, 2MB body cap.
 * Never import from client components — uses node:dns / node:net.
 */
import type { LookupAddress } from 'node:dns'
import dns from 'node:dns/promises'
import net from 'node:net'

const FETCH_TIMEOUT_MS = 5000
const ROBOTS_TIMEOUT_MS = 3000
const MAX_REDIRECTS = 3
const MAX_BYTES = 2 * 1024 * 1024 // 2MB
const MAX_ROBOTS_BYTES = 64 * 1024
const USER_AGENT = 'SalesolutionProbe/0.1 (+https://salesolution.net/bots)'

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
  if (net.isIP(h)) return isPrivateIp(h)
  // IPv6 in brackets won't reach here — URL parser strips them.
  return false
}

async function assertHostnameIsPublic(hostname: string): Promise<void> {
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

export type ProbeUrlValidation =
  | { ok: true; url: URL }
  | { ok: false; error: string }

/** Parse + SSRF-validate a user-supplied URL. Error strings are user-safe. */
export async function validateProbeUrl(raw: string): Promise<ProbeUrlValidation> {
  let parsed: URL
  try {
    parsed = new URL(raw.trim())
  } catch {
    return { ok: false, error: 'Could not parse URL.' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https URLs are allowed.' }
  }
  if (isBlockedHostname(parsed.hostname)) {
    return { ok: false, error: 'Private and loopback addresses are not allowed.' }
  }
  try {
    await assertHostnameIsPublic(parsed.hostname)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    if (msg === 'blocked-private-ip') {
      return { ok: false, error: 'Hostname resolves to a private address.' }
    }
    return { ok: false, error: 'Could not resolve hostname.' }
  }
  return { ok: true, url: parsed }
}

type FetchResult = { html: string; contentType: string }

export async function fetchHtml(initialUrl: string): Promise<FetchResult> {
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

/**
 * Best-effort robots.txt fetch for the AI-crawler signal. Any failure —
 * missing file, redirect, timeout, oversized body — resolves to null, which
 * the scorer treats as "blocks nobody". Same-origin as the validated page
 * URL, so the SSRF checks above already cover it.
 */
export async function fetchRobotsTxt(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(ROBOTS_TIMEOUT_MS),
      headers: { Accept: 'text/plain', 'User-Agent': USER_AGENT },
    })
    if (!res.ok) {
      try {
        await res.body?.cancel()
      } catch {
        /* noop */
      }
      return null
    }
    const text = await res.text()
    return text.length > MAX_ROBOTS_BYTES ? null : text
  } catch {
    return null
  }
}

/**
 * Does the site publish an llms.txt (llmstxt.org)? Guards against SPA
 * soft-404s that return index.html for any path: the body must not be HTML.
 */
export async function hasLlmsTxt(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/llms.txt`, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(ROBOTS_TIMEOUT_MS),
      headers: { Accept: 'text/plain', 'User-Agent': USER_AGENT },
    })
    if (!res.ok) {
      try {
        await res.body?.cancel()
      } catch {
        /* noop */
      }
      return false
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (/text\/html/i.test(contentType)) return false
    const text = await res.text()
    if (text.length === 0 || text.length > MAX_ROBOTS_BYTES) return false
    return !text.trimStart().startsWith('<')
  } catch {
    return false
  }
}

/** True when a fetch error looks like a bot wall (403/406/429 from a WAF). */
export function looksLikeBotWall(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : ''
  return /^upstream-(401|403|406|429|503)$/.test(msg)
}
