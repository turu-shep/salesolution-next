/**
 * Server glue for the probe gate: secret resolution, cookie read/write on
 * NextRequest/NextResponse, client IP, and the rate-limit store (Upstash
 * REST when configured, per-instance memory otherwise).
 */
import type { NextRequest, NextResponse } from 'next/server'

import { GATE_COOKIE, GATE_MAX_AGE_S, decodeGate, encodeGate } from '@/lib/probe/gate.mjs'
import { MemoryCounter } from '@/lib/probe/limits.mjs'

type GateState = { runs: number; unlocked: boolean }

let warned = false

function gateSecret(): string {
  const secret = process.env.PROBE_GATE_SECRET
  if (secret) return secret
  if (!warned && process.env.NODE_ENV === 'production') {
    warned = true
    console.warn('[probe] PROBE_GATE_SECRET is not set — gate cookies use the insecure default.')
  }
  return 'dev-insecure-probe-gate-secret'
}

export function readGate(req: NextRequest): GateState {
  return decodeGate(req.cookies.get(GATE_COOKIE)?.value, gateSecret())
}

export function writeGate(res: NextResponse, state: GateState): void {
  res.cookies.set(GATE_COOKIE, encodeGate(state, gateSecret()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GATE_MAX_AGE_S,
  })
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '0.0.0.0'
}

// ---- rate-limit store ----

// Module-scope so warm serverless instances (and dev HMR via globalThis)
// share one counter.
const globalStore = globalThis as unknown as { __probeCounter?: MemoryCounter }
const memory = (globalStore.__probeCounter ??= new MemoryCounter())

let fallbackWarned = false
function warnMemoryFallback(): void {
  if (fallbackWarned || process.env.NODE_ENV !== 'production') return
  fallbackWarned = true
  // Per-instance counters mean the global spend caps multiply by instance
  // count — visible in Vercel logs so the degradation is never silent.
  console.warn(
    '[probe] Rate limiting is on per-instance memory (no UPSTASH_REDIS_REST_URL/TOKEN). Global spend caps are per-instance, not fleet-wide.',
  )
}

/**
 * INCR-with-TTL against Upstash REST when configured; per-instance memory
 * otherwise. Upstash errors fall back to memory so limiting never breaks
 * the feature.
 */
export async function incrCounter(key: string, ttlS: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    try {
      const res = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, String(ttlS), 'NX'],
        ]),
        signal: AbortSignal.timeout(2000),
      })
      if (res.ok) {
        const rows = (await res.json()) as Array<{ result?: number }>
        const count = rows?.[0]?.result
        if (typeof count === 'number') return count
      }
    } catch {
      /* fall through to memory */
    }
  }
  warnMemoryFallback()
  return memory.incr(key, ttlS)
}
