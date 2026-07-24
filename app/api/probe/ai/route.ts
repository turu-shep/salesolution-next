/**
 * POST /api/probe/ai — the gated AI read.
 *
 * Flow: gate cookie (1 free run, email unlocks 6 total) → per-IP + global
 * rate limits → re-fetch and re-score the page server-side (never trust
 * client-sent scores) → Claude reads it → structured verdict + fixes.
 *
 * Status codes:
 *   200 — { read, runsLeft }
 *   400 — invalid input
 *   403 — { error: 'email_required' | 'exhausted' }
 *   429 — { error: 'rate_limited', scope }
 *   502 — target site unreachable / bot-walled
 *   503 — { error: 'ai_unavailable' } (no key configured, or the model call failed)
 */
import { NextRequest, NextResponse } from 'next/server'

import { aiConfigured, extractPageText, runAiRead } from '@/lib/probe/ai'
import { getDomainMetrics } from '@/lib/probe/domain'
import { fetchHtml, fetchRobotsTxt, hasLlmsTxt, validateProbeUrl } from '@/lib/probe/fetch'
import { UNLOCKED_RUNS, gateVerdict } from '@/lib/probe/gate.mjs'
import { clientIp, incrCounter, readGate, writeGate } from '@/lib/probe/gate-server'
import { consume } from '@/lib/probe/limits.mjs'
import { computeScores } from '@/lib/probe/score.mjs'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }
  const url =
    typeof raw === 'object' && raw !== null && 'url' in raw ? (raw as { url: unknown }).url : undefined
  if (typeof url !== 'string' || url.trim().length === 0) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!aiConfigured()) {
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })
  }

  const validated = await validateProbeUrl(url)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  // Gate before limits: a blocked user shouldn't burn rate-limit budget.
  const gate = readGate(req)
  const verdict = gateVerdict(gate)
  if (verdict !== 'run') {
    return NextResponse.json({ error: verdict }, { status: 403 })
  }

  const limit = await consume('ai', clientIp(req), incrCounter)
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited', scope: limit.scope }, { status: 429 })
  }

  try {
    const [{ html }, robotsTxt, llmsTxt, domainMetrics] = await Promise.all([
      fetchHtml(validated.url.toString()),
      fetchRobotsTxt(validated.url.origin),
      hasLlmsTxt(validated.url.origin),
      getDomainMetrics(validated.url.hostname),
    ])
    const scores = computeScores(html, validated.url.toString(), { robotsTxt, llmsTxt, domainMetrics })

    const weakestSignals = (['schema', 'readable', 'authority', 'domain'] as const)
      .flatMap((cat) => scores.details[cat] ?? [])
      .filter((s) => s.earned < s.points)
      .sort((a, b) => b.points - b.earned - (a.points - a.earned))
      .slice(0, 5)
      .map((s) => s.label)

    const read = await runAiRead({
      pageUrl: validated.url.toString(),
      pageType: scores.pageType,
      weakestSignals,
      pageText: extractPageText(html),
    })

    const nextState = { runs: gate.runs + 1, unlocked: gate.unlocked }
    const res = NextResponse.json({
      read,
      runsLeft: Math.max(0, (nextState.unlocked ? UNLOCKED_RUNS : 1) - nextState.runs),
    })
    writeGate(res, nextState)
    return res
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (/^upstream-|^blocked-|too-many-redirects|not-html|dns-failed|body-too-large|no-body|redirect-without-location|bad-redirect-scheme/.test(msg)) {
      return NextResponse.json({ error: 'unreachable' }, { status: 502 })
    }
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })
  }
}
