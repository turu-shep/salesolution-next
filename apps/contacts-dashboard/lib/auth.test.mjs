import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'

import { CONTACTS_COOKIE, MAX_AGE_S, generatePassword, hashPassword, isLocalHost, readSession, signSession, verifyPassword } from './auth.mjs'

function withNodeEnv(value, fn) {
  const prev = process.env.NODE_ENV
  process.env.NODE_ENV = value
  try { fn() } finally {
    if (prev === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = prev
  }
}

const UUID = '6f1a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8'
const OTHER_UUID = '00000000-0000-4000-8000-000000000000'
const SECRET = 's3cr3t'
const MAX_AGE_MS = MAX_AGE_S * 1000

// ── F-003: the Host header is client-supplied ───────────────────────────────

test('F-003: in production no Host value is ever treated as local', () => {
  withNodeEnv('production', () => {
    for (const host of ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]:3000', 'anything.local', 'evil.local:3000']) {
      assert.equal(isLocalHost(host), false, host)
    }
  })
})

test('outside production the local hosts are open, and nothing else is', () => {
  withNodeEnv('development', () => {
    assert.equal(isLocalHost('localhost:3000'), true)
    assert.equal(isLocalHost('127.0.0.1'), true)
    assert.equal(isLocalHost('::1'), true)
    assert.equal(isLocalHost('[::1]:3000'), true)
    assert.equal(isLocalHost('my-box.local'), true)
    assert.equal(isLocalHost('contacts.salesolution.net'), false)
    assert.equal(isLocalHost('salesolution.net:443'), false)
    assert.equal(isLocalHost(''), false)
    assert.equal(isLocalHost(undefined), false)
  })
})

// ── constants ───────────────────────────────────────────────────────────────

test("the cookie name is this app's own, not the house one", () => {
  assert.equal(CONTACTS_COOKIE, 'contacts_auth')
  assert.equal(MAX_AGE_S, 60 * 60 * 24 * 30)
})

// ── generatePassword ────────────────────────────────────────────────────────

test('generatePassword: exactly 20 chars of the base64url alphabet, every call', () => {
  // 20 chars off 32 random bytes ≈ 119 bits of entropy — the out-of-band
  // deliverable shape the CLI has always printed; the invite route mints
  // through the same function.
  for (let i = 0; i < 200; i += 1) {
    assert.match(generatePassword(), /^[A-Za-z0-9_-]{20}$/)
  }
})

test('generatePassword never repeats and round-trips through the scrypt pair', () => {
  const seen = new Set()
  for (let i = 0; i < 1000; i += 1) seen.add(generatePassword())
  assert.equal(seen.size, 1000)
  const pw = generatePassword()
  assert.equal(verifyPassword(pw, hashPassword(pw)), true)
})

// ── scrypt password hashing ─────────────────────────────────────────────────

test('hashPassword emits the pinned format: scrypt$16384$8$1$<salt b64>$<hash b64>, salt 16 B, key 64 B', () => {
  const stored = hashPassword('correct horse battery staple')
  const parts = stored.split('$')
  assert.equal(parts.length, 6)
  assert.equal(parts[0], 'scrypt')
  assert.equal(parts[1], '16384')
  assert.equal(parts[2], '8')
  assert.equal(parts[3], '1')
  assert.equal(Buffer.from(parts[4], 'base64').length, 16)
  assert.equal(Buffer.from(parts[5], 'base64').length, 64)
  // Random salt: hashing the same password twice never yields the same string.
  assert.notEqual(stored, hashPassword('correct horse battery staple'))
})

test('a hashed password round-trips, and a wrong one does not', () => {
  const stored = hashPassword('pässwörd-with-ünicode-🔑')
  assert.equal(verifyPassword('pässwörd-with-ünicode-🔑', stored), true)
  assert.equal(verifyPassword('password-with-unicode', stored), false)
  assert.equal(verifyPassword('', stored), false)
  assert.equal(verifyPassword(undefined, stored), false)
})

test('a tampered stored hash verifies nothing', () => {
  const stored = hashPassword('hunter2hunter2hunter2')
  // Flip a DATA character of the hash section (the trailing '=' is base64
  // padding, which a lenient decoder ignores — flipping it proves nothing).
  const parts = stored.split('$')
  parts[5] = (parts[5][0] === 'A' ? 'B' : 'A') + parts[5].slice(1)
  assert.equal(verifyPassword('hunter2hunter2hunter2', parts.join('$')), false)
})

test('verifyPassword is false on ANY malformed stored value, and never throws', () => {
  const salt = Buffer.alloc(16, 1).toString('base64')
  const hash = Buffer.alloc(64, 2).toString('base64')
  const malformed = [
    '',                                          // empty
    null,                                        // not a string
    undefined,
    42,
    'plain-text-password',                       // no scheme at all
    `bcrypt$16384$8$1$${salt}$${hash}`,          // unknown scheme tag
    `scrypt$16384$8$1$${salt}`,                  // wrong part count (5)
    `scrypt$16384$8$1$${salt}$${hash}$extra`,    // wrong part count (7)
    `scrypt$16384$8$1$!!!$${hash}`,              // bad base64 salt
    `scrypt$16384$8$1$${salt}$!!!`,              // bad base64 hash
    `scrypt$16384$8$1$${salt}$`,                 // empty hash — must NOT match everything
    `scrypt$16384$8$1$$${hash}`,                 // empty salt
    `scrypt$16000$8$1$${salt}$${hash}`,          // N not a power of two
    `scrypt$1073741824$8$1$${salt}$${hash}`,     // absurd N — no throw, no hang
    `scrypt$16384$0$1$${salt}$${hash}`,          // zero r
    `scrypt$16384$8$0$${salt}$${hash}`,          // zero p
    `scrypt$abc$8$1$${salt}$${hash}`,            // non-numeric N
  ]
  for (const stored of malformed) {
    assert.equal(verifyPassword('anything', stored), false, String(stored))
    assert.equal(verifyPassword('', stored), false, String(stored))
  }
})

// ── HMAC sessions carrying the account id ───────────────────────────────────

test('a signed session round-trips and carries the accountId', () => {
  const token = signSession(UUID, SECRET)
  assert.match(token, new RegExp(`^${UUID}\\.\\d+\\.[0-9a-f]{64}$`))
  assert.deepEqual(readSession(token, SECRET, MAX_AGE_MS), { accountId: UUID })
})

test('a tampered session is null: signature, accountId, or timestamp', () => {
  const token = signSession(UUID, SECRET)
  const [id, iat, sig] = token.split('.')
  const flippedSig = sig.slice(0, -1) + (sig.endsWith('0') ? '1' : '0')
  assert.equal(readSession(`${id}.${iat}.${flippedSig}`, SECRET, MAX_AGE_MS), null)
  assert.equal(readSession(`${OTHER_UUID}.${iat}.${sig}`, SECRET, MAX_AGE_MS), null)
  assert.equal(readSession(`${id}.${Number(iat) - 1000}.${sig}`, SECRET, MAX_AGE_MS), null)
})

test('an expired session and a wrong secret are both null', () => {
  const token = signSession(UUID, SECRET)
  assert.equal(readSession(token, SECRET, -1), null)
  assert.equal(readSession(token, 'other-secret', MAX_AGE_MS), null)
})

test('an empty or unset secret never opens the gate — sign and read both refuse', () => {
  assert.throws(() => signSession(UUID, ''))
  assert.throws(() => signSession(UUID, undefined))
  assert.throws(() => signSession('', SECRET)) // no anonymous sessions either
  // A forged token HMAC'd with the empty string must not verify against an
  // empty configured secret — emptiness itself is the refusal.
  const iat = String(Date.now())
  const forged = `${UUID}.${iat}.${createHmac('sha256', '').update(`${UUID}.${iat}`).digest('hex')}`
  assert.equal(readSession(forged, '', MAX_AGE_MS), null)
  assert.equal(readSession(forged, undefined, MAX_AGE_MS), null)
})

test('malformed token shapes are null, never a throw', () => {
  const token = signSession(UUID, SECRET)
  const [, iat] = token.split('.')
  for (const bad of [
    '',                              // empty
    null,
    undefined,
    'nodot',
    `${UUID}.${iat}`,                // 2 parts
    `${token}.extra`,                // 4 parts
    '..',                            // 3 empty parts
    `.${iat}.${'0'.repeat(64)}`,     // empty accountId
    `${UUID}..${'0'.repeat(64)}`,    // empty timestamp
    `${UUID}.${iat}.`,               // empty signature
    `${UUID}.${iat}.${'0'.repeat(63)}`,   // short signature
    `${UUID}.${iat}.${'é'.repeat(64)}`,   // 64 chars but not hex — must not throw
    `${UUID}.notanumber.${'0'.repeat(64)}`,
  ]) {
    assert.equal(readSession(bad, SECRET, MAX_AGE_MS), null, String(bad))
  }
})
