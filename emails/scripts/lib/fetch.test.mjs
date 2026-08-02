/**
 * fetch.mjs — the pacing and provenance rules are compliance commitments
 * (00-sourcing-strategy.md §7), so they get tests rather than trust.
 * globalThis.fetch is stubbed; nothing here touches the network.
 *   node --test emails/scripts/lib/
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { rmSync, existsSync } from 'node:fs'
import { politeFetch, fetchJson, CACHE_DIR } from './fetch.mjs'

process.env.EMAILS_QUIET = '1'

const realFetch = globalThis.fetch
function stub(handler) {
  globalThis.fetch = handler
  return () => {
    globalThis.fetch = realFetch
  }
}
const ok = (body, headers = {}) =>
  new Response(body, { status: 200, headers: { 'content-type': 'application/json', ...headers } })

// Unique per run so tests never collide with a real cached payload.
const uniq = () => `https://example.invalid/${Date.now()}-${Math.random().toString(36).slice(2)}`

test('records source_url + captured on every response', async () => {
  const restore = stub(async () => ok('{"a":1}'))
  try {
    const url = uniq()
    const res = await politeFetch(url, { cache: false })
    assert.equal(res.source_url, url)
    assert.match(res.captured, /^\d{4}-\d{2}-\d{2}$/)
    assert.match(res.captured_at, /^\d{4}-\d{2}-\d{2}T/)
  } finally {
    restore()
  }
})

test('sends an honest desktop User-Agent, not a rotating disguise', async () => {
  const seen = []
  const restore = stub(async (_u, init) => {
    seen.push(init.headers['User-Agent'])
    return ok('{}')
  })
  try {
    await politeFetch(uniq(), { cache: false })
    assert.match(seen[0], /^Mozilla\/5\.0 \(Macintosh/)
  } finally {
    restore()
  }
})

test('two requests to the same host are spaced ≥3s (§7 pacing)', async () => {
  const at = []
  const restore = stub(async () => {
    at.push(Date.now())
    return ok('{}')
  })
  try {
    // Same host, fired concurrently — the per-host queue must serialize them.
    await Promise.all([
      politeFetch('https://paced.invalid/a', { cache: false }),
      politeFetch('https://paced.invalid/b', { cache: false }),
    ])
    assert.equal(at.length, 2)
    assert.ok(at[1] - at[0] >= 2900, `gap was ${at[1] - at[0]}ms, expected ≥3000`)
  } finally {
    restore()
  }
})

test('429 backs off and retries rather than giving up or speeding up', async () => {
  let calls = 0
  const restore = stub(async () => {
    calls++
    // Retry-After: 1 keeps the test quick while proving the header is honoured.
    return calls === 1 ? new Response('slow down', { status: 429, headers: { 'retry-after': '1' } }) : ok('{"ok":true}')
  })
  try {
    const res = await fetchJson(uniq(), { cache: false })
    assert.equal(calls, 2)
    assert.deepEqual(res.data, { ok: true })
  } finally {
    restore()
  }
})

test('403 is an access control, never retried with a different disguise', async () => {
  let calls = 0
  const restore = stub(async () => {
    calls++
    return new Response('forbidden', { status: 403 })
  })
  try {
    await assert.rejects(() => politeFetch(uniq(), { cache: false }), /HTTP 403/)
    assert.equal(calls, 1) // one attempt, no retry, no UA rotation
  } finally {
    restore()
  }
})

test('the disk cache stops a re-run re-hitting the origin', async () => {
  let calls = 0
  const restore = stub(async () => {
    calls++
    return ok('{"v":42}')
  })
  const url = uniq()
  try {
    const first = await fetchJson(url)
    const second = await fetchJson(url)
    assert.equal(calls, 1, 'second call should have been served from disk')
    assert.equal(first.fromCache, false)
    assert.equal(second.fromCache, true)
    assert.deepEqual(second.data, { v: 42 })
    assert.equal(second.source_url, url) // provenance survives the cache
  } finally {
    restore()
    // Leave no test payloads behind in the cache dir.
    if (existsSync(CACHE_DIR)) {
      const { readdirSync, readFileSync } = await import('node:fs')
      for (const f of readdirSync(CACHE_DIR)) {
        try {
          if (JSON.parse(readFileSync(`${CACHE_DIR}/${f}`, 'utf8')).source_url?.includes('example.invalid'))
            rmSync(`${CACHE_DIR}/${f}`)
        } catch {
          /* ignore */
        }
      }
    }
  }
})

test('a non-JSON body fails loudly instead of returning junk', async () => {
  const restore = stub(async () => ok('<html>maintenance</html>'))
  try {
    await assert.rejects(() => fetchJson(uniq(), { cache: false }), /not JSON/)
  } finally {
    restore()
  }
})
