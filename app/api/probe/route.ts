/**
 * POST /api/probe
 *
 * Server-side "AI-Readiness Probe" — fetches a URL (and its robots.txt, in
 * parallel) and returns three deterministic 0–100 scores plus the average:
 *   { schema, readable, authority, overall, pageType, details }
 * The UI reads the first four; pageType + per-signal details ride along for
 * the full report page (/ai-readiness/[token]/) and future surfaces.
 *
 * Fetch + SSRF defenses live in lib/probe/fetch.ts; scoring in
 * lib/probe/score.mjs (unit-tested, page-type aware). Deterministic by
 * design — same URL → same scores.
 *
 * Status codes:
 *   200 — analysis complete
 *   400 — invalid input (bad URL, private host, blocked scheme, etc.)
 *   502 — upstream fetch / parse failed
 */
import { NextRequest, NextResponse } from 'next/server'

import { getDomainMetrics } from '@/lib/probe/domain'
import { fetchHtml, fetchRobotsTxt, hasLlmsTxt, validateProbeUrl } from '@/lib/probe/fetch'
import { clientIp, incrCounter } from '@/lib/probe/gate-server'
import { consume } from '@/lib/probe/limits.mjs'
import { computeScores } from '@/lib/probe/score.mjs'

export const runtime = 'nodejs'

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

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

  const validated = await validateProbeUrl(url)
  if (!validated.ok) {
    return badRequest(validated.error)
  }

  const limit = await consume('probe', clientIp(req), incrCounter)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many scans from your network. Try again in an hour.' },
      { status: 429 },
    )
  }

  try {
    const [{ html }, robotsTxt, llmsTxt, domainMetrics] = await Promise.all([
      fetchHtml(validated.url.toString()),
      fetchRobotsTxt(validated.url.origin),
      hasLlmsTxt(validated.url.origin),
      getDomainMetrics(validated.url.hostname),
    ])
    const scores = computeScores(html, validated.url.toString(), { robotsTxt, llmsTxt, domainMetrics })
    return NextResponse.json(scores)
  } catch {
    return NextResponse.json({ error: 'Could not analyze that URL.' }, { status: 502 })
  }
}
