/**
 * URL ⇄ token codec for /ai-readiness/[token]/ report links.
 *
 * The token IS the report: base64url of the scored URL, nothing stored
 * server-side. The page re-runs the deterministic probe on every view, so a
 * link keeps working indefinitely and always shows the page as AI sees it
 * today. Isomorphic (no Buffer/btoa) — used by the client band and the
 * server page.
 */
const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const MAX_URL_LENGTH = 2048

export function encodeProbeToken(url: string): string {
  const bytes = new TextEncoder().encode(url)
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined
    out += B64URL[b0 >> 2]
    out += B64URL[((b0 & 0b11) << 4) | ((b1 ?? 0) >> 4)]
    if (b1 !== undefined) out += B64URL[((b1 & 0b1111) << 2) | ((b2 ?? 0) >> 6)]
    if (b2 !== undefined) out += B64URL[b2 & 0b111111]
  }
  return out
}

/** Returns the decoded URL string, or null for malformed/oversized tokens. */
export function decodeProbeToken(token: string): string | null {
  if (token.length === 0 || token.length > MAX_URL_LENGTH * 2) return null
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null
  const values: number[] = []
  for (const ch of token) values.push(B64URL.indexOf(ch))
  const bytes: number[] = []
  for (let i = 0; i < values.length; i += 4) {
    const [v0, v1, v2, v3] = [values[i], values[i + 1], values[i + 2], values[i + 3]]
    if (v1 === undefined) return null // a lone trailing char is invalid
    bytes.push((v0 << 2) | (v1 >> 4))
    if (v2 !== undefined) bytes.push(((v1 & 0b1111) << 4) | (v2 >> 2))
    if (v3 !== undefined) bytes.push(((v2 & 0b11) << 6) | v3)
  }
  try {
    const url = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
    return url.length > MAX_URL_LENGTH ? null : url
  } catch {
    return null
  }
}
