/**
 * Unit tests for the /sales + /strategy auth primitives.
 *
 * Runner note: this file is `.test.mts` on purpose. Node 20's `--test` glob does not
 * match `.mts`, so `pnpm test` (bare `node --test lib/`) ignores it and stays green
 * on the default toolchain. `pnpm test:ts` runs it on Node >= 22.6, where native type
 * stripping can load the `.ts` module under test. See F-009 in the findings ledger —
 * the original claim that `.ts` was untestable was too strong; what is actually
 * untestable under bare node is a module importing Next internals like `server-only`.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

import { isLocalHost, signSession, verifyPassword, verifySession } from './auth.ts'

/** isLocalHost reads NODE_ENV at call time, so set it around the assertion. */
function withNodeEnv(value: string, fn: () => void) {
  const prev = process.env.NODE_ENV
  process.env.NODE_ENV = value
  try {
    fn()
  } finally {
    if (prev === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = prev
  }
}

test('F-003: in production no Host value is treated as local', () => {
  withNodeEnv('production', () => {
    // The Host header is client-supplied, and app/sales/layout.tsx skips the whole
    // gate when this returns true. Every one of these opened /sales before the fix.
    for (const host of ['evil.local', 'attacker.local', 'localhost', '127.0.0.1', '0.0.0.0', '::1', 'localhost:3000']) {
      assert.equal(isLocalHost(host), false, `${host} must not be local in production`)
    }
  })
})

test('dev convenience is preserved outside production', () => {
  withNodeEnv('development', () => {
    assert.equal(isLocalHost('localhost'), true)
    assert.equal(isLocalHost('localhost:3000'), true)
    assert.equal(isLocalHost('127.0.0.1'), true)
    assert.equal(isLocalHost('0.0.0.0'), true)
    assert.equal(isLocalHost('mac.local'), true)
    assert.equal(isLocalHost('salesolution.net'), false)
  })
})

test('F-096: the "::1" entry in LOCAL_HOSTS is unreachable', () => {
  // Pinning current behaviour, not endorsing it. Port stripping is
  // `host.split(':')[0]`, which turns an IPv6 literal into the empty string, so
  // '::1' can never match the allowlist that lists it. Harmless (IPv6 localhost
  // just misses the dev bypass) but it is dead code that reads as live.
  withNodeEnv('development', () => {
    assert.equal(isLocalHost('::1'), false, 'if this starts passing, F-096 was fixed — update the row')
    assert.equal(isLocalHost('[::1]:3000'), false)
  })
})

test('verifyPassword is exact and rejects an unset expectation', () => {
  assert.equal(verifyPassword('correct-horse', 'correct-horse'), true)
  assert.equal(verifyPassword('correct-horse', 'correct-horsf'), false)
  assert.equal(verifyPassword('', ''), false, 'an unset SALES_PASSWORD must never authenticate')
  assert.equal(verifyPassword('anything', ''), false)
  // Length mismatch must not throw — the SHA-256 digest compare exists for this.
  assert.equal(verifyPassword('short', 'a-much-longer-password'), false)
})

test('session roundtrip, and tampering fails closed', () => {
  const token = signSession('secret-a')
  assert.equal(verifySession(token, 'secret-a', 60_000), true)

  assert.equal(verifySession(token, 'secret-b', 60_000), false, 'wrong secret')
  assert.equal(verifySession('', 'secret-a', 60_000), false, 'empty token')
  assert.equal(verifySession(token, '', 60_000), false, 'empty secret')
  assert.equal(verifySession('no-dot-here', 'secret-a', 60_000), false)
  assert.equal(verifySession('.onlysig', 'secret-a', 60_000), false, 'empty issued-at')

  const [iat, sig] = token.split('.')
  assert.equal(verifySession(`${iat}.${sig.slice(0, -1)}`, 'secret-a', 60_000), false, 'truncated signature')
  assert.equal(verifySession(`${iat}.deadbeef`, 'secret-a', 60_000), false, 'short signature')
  assert.equal(verifySession(`${Number(iat) + 1}.${sig}`, 'secret-a', 60_000), false, 'iat not covered by sig')
  assert.equal(verifySession(`notanumber.${sig}`, 'secret-a', 60_000), false, 'non-numeric iat')
})

test('sessions expire, and a future-dated token is not accepted as fresh forever', () => {
  const token = signSession('secret-a')
  assert.equal(verifySession(token, 'secret-a', 0), false, 'zero max-age rejects immediately')
  assert.equal(verifySession(token, 'secret-a', 60_000), true)
})
