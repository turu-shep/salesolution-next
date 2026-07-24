import assert from 'node:assert/strict'
import { test } from 'node:test'

import { FREE_RUNS, UNLOCKED_RUNS, decodeGate, encodeGate, gateVerdict } from './gate.mjs'
import { CAPS, MemoryCounter, consume, windowKeys } from './limits.mjs'

const SECRET = 'test-secret'

test('gate: roundtrip, tamper resistance, fresh default', () => {
  const cookie = encodeGate({ runs: 3, unlocked: true }, SECRET)
  assert.deepEqual(decodeGate(cookie, SECRET), { runs: 3, unlocked: true })

  // missing / malformed / tampered → fresh state
  assert.deepEqual(decodeGate(null, SECRET), { runs: 0, unlocked: false })
  assert.deepEqual(decodeGate('garbage', SECRET), { runs: 0, unlocked: false })
  const bumped = cookie.replace('v1.3.1', 'v1.0.1')
  assert.deepEqual(decodeGate(bumped, SECRET), { runs: 0, unlocked: false })
  // signed with a different secret → fresh
  assert.deepEqual(decodeGate(encodeGate({ runs: 5, unlocked: true }, 'other'), SECRET), {
    runs: 0,
    unlocked: false,
  })
})

test('gate: policy — 1 free run, email unlocks to 6 total', () => {
  assert.equal(gateVerdict({ runs: 0, unlocked: false }), 'run')
  assert.equal(gateVerdict({ runs: FREE_RUNS, unlocked: false }), 'email_required')
  assert.equal(gateVerdict({ runs: FREE_RUNS, unlocked: true }), 'run')
  assert.equal(gateVerdict({ runs: UNLOCKED_RUNS - 1, unlocked: true }), 'run')
  assert.equal(gateVerdict({ runs: UNLOCKED_RUNS, unlocked: true }), 'exhausted')
})

test('limits: windows deny past cap, hour before day', async () => {
  const counter = new MemoryCounter()
  const now = 1_800_000_000_000
  const incr = (k, ttl) => counter.incr(k, ttl, now)

  for (let i = 0; i < CAPS.ai.hour; i++) {
    assert.deepEqual(await consume('ai', '1.2.3.4', incr, now), { ok: true })
  }
  const denied = await consume('ai', '1.2.3.4', incr, now)
  assert.deepEqual(denied, { ok: false, scope: 'hour' })

  // a different IP is unaffected
  assert.deepEqual(await consume('ai', '5.6.7.8', incr, now), { ok: true })
})

test('limits: hour window resets, day window persists', async () => {
  const counter = new MemoryCounter()
  let now = 1_800_000_000_000
  const incr = (k, ttl) => counter.incr(k, ttl, now)

  for (let i = 0; i < CAPS.ai.hour; i++) await consume('ai', 'ip', incr, now)
  assert.equal((await consume('ai', 'ip', incr, now)).ok, false)

  now += 3_600_000 // next hour bucket
  assert.equal((await consume('ai', 'ip', incr, now)).ok, true)
})

test('limits: daily cap catches slow drips', async () => {
  const counter = new MemoryCounter()
  let now = 1_800_000_000_000
  // set to midnight-aligned so all drips share the day bucket
  now = Math.floor(now / 86_400_000) * 86_400_000
  const incr = (k, ttl) => counter.incr(k, ttl, now)

  let allowed = 0
  for (let hour = 0; hour < 23; hour++) {
    for (let i = 0; i < CAPS.ai.hour; i++) {
      const r = await consume('ai', 'ip', incr, now + hour * 3_600_000)
      if (r.ok) allowed++
    }
  }
  assert.equal(allowed, CAPS.ai.day, `daily cap must hold, got ${allowed}`)
})

test('limits: global kill switch spans IPs', async () => {
  const counter = new MemoryCounter()
  const now = Math.floor(1_800_000_000_000 / 86_400_000) * 86_400_000
  const incr = (k, ttl) => counter.incr(k, ttl, now)

  let denied = null
  // many IPs, few runs each — only the global bucket can deny
  for (let ip = 0; ip < CAPS.ai.globalDay + 5 && !denied; ip++) {
    const r = await consume('ai', `10.0.${Math.floor(ip / 250)}.${ip % 250}`, incr, now)
    if (!r.ok) denied = r
  }
  assert.deepEqual(denied, { ok: false, scope: 'global' })
})

test('limits: dfs ledger is global-only and denies past its cap', async () => {
  const counter = new MemoryCounter()
  const now = Math.floor(1_800_000_000_000 / 86_400_000) * 86_400_000
  const incr = (k, ttl) => counter.incr(k, ttl, now)

  const keys = windowKeys('dfs', 'whoever', now)
  assert.equal(keys.length, 1)
  assert.ok(keys[0].key.includes('GLOBAL'))

  for (let i = 0; i < CAPS.dfs.globalDay; i++) {
    assert.equal((await consume('dfs', 'a', incr, now)).ok, true)
  }
  assert.deepEqual(await consume('dfs', 'b', incr, now), { ok: false, scope: 'global' })
})

test('limits: probe kind has per-IP windows but no global', () => {
  const keys = windowKeys('probe', 'ip', Date.now())
  assert.equal(keys.length, 2)
  assert.ok(!keys.some((w) => w.key.includes('GLOBAL')))
})

test('limits: memory counter expires buckets', () => {
  const c = new MemoryCounter()
  assert.equal(c.incr('k', 10, 1000), 1)
  assert.equal(c.incr('k', 10, 2000), 2)
  assert.equal(c.incr('k', 10, 12_000), 1) // past TTL → fresh bucket
})

test('windowKeys: ai and unlock both carry global spend buckets', () => {
  const ai = windowKeys('ai', 'ip', Date.now())
  const unlock = windowKeys('unlock', 'ip', Date.now())
  assert.equal(ai.length, 3)
  assert.equal(unlock.length, 3)
  assert.ok(ai.some((w) => w.key.includes('GLOBAL')))
  assert.ok(unlock.some((w) => w.key.includes('GLOBAL')))
})

test('limits: unlocked visitor can spend all runs within one hour cap', async () => {
  const { UNLOCKED_RUNS } = await import('./gate.mjs')
  assert.ok(
    CAPS.ai.hour >= UNLOCKED_RUNS,
    'hourly AI cap must not strand unlocked runs',
  )
})
