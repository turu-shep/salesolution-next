import assert from 'node:assert/strict'
import test from 'node:test'

import { LOGIN_POLICY, rateLimit } from './rate-limit.mjs'

test('LOGIN_POLICY is 5 tries per 15 minutes', () => {
  assert.equal(LOGIN_POLICY.max, 5)
  assert.equal(LOGIN_POLICY.windowMs, 15 * 60 * 1000)
})

test('F-002: the sixth attempt in a window is refused with a reset time', () => {
  const ip = `test-${Math.random()}`
  for (let i = 0; i < LOGIN_POLICY.max; i++) {
    assert.equal(rateLimit(ip, LOGIN_POLICY).success, true, `attempt ${i + 1}`)
  }
  const blocked = rateLimit(ip, LOGIN_POLICY)
  assert.equal(blocked.success, false)
  assert.equal(blocked.remaining, 0)
  assert.ok(blocked.reset > Date.now())
})

test('one IP being throttled does not throttle another', () => {
  const a = `a-${Math.random()}`
  const b = `b-${Math.random()}`
  for (let i = 0; i < LOGIN_POLICY.max + 2; i++) rateLimit(a, LOGIN_POLICY)
  assert.equal(rateLimit(b, LOGIN_POLICY).success, true)
})
