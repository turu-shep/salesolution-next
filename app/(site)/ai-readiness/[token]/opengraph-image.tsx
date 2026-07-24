/**
 * OG unfurl card for report links — the share IS the pitch, so the card must
 * carry the verdict. Sober operator styling on purpose: it reads as a tool,
 * not a red-alarm meme, and the rubric subtitle keeps a stale share honest
 * (the live page re-scores anyway).
 */
import { headers } from 'next/headers'
import { ImageResponse } from 'next/og'

import { getDomainMetrics } from '@/lib/probe/domain'
import { fetchHtml, fetchRobotsTxt, hasLlmsTxt, validateProbeUrl } from '@/lib/probe/fetch'
import { computeScores, signalCatalog } from '@/lib/probe/score.mjs'
import { incrCounter } from '@/lib/probe/gate-server'
import { consume } from '@/lib/probe/limits.mjs'
import { decodeProbeToken } from '@/lib/probe/token'

export const runtime = 'nodejs'
export const alt = 'AI-Readiness Report'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SIGNAL_COUNT = Object.values(signalCatalog()).reduce((n, arr) => n + arr.length, 0)

const INK = '#101623'
const PAPER = '#f7f5f0'
const MUTED = '#8a93a6'
const GREEN = '#1f7a4d'
const AMBER = '#d97706'
const RED = '#b42318'

type CardData = {
  host: string
  overall: number | null
  tierLabel: string
  tierColor: string
  bars: { label: string; value: number }[]
}

async function loadCard(token: string): Promise<CardData> {
  const fallback: CardData = {
    host: 'ai-readiness report',
    overall: null,
    tierLabel: 'SCORED LIVE',
    tierColor: MUTED,
    bars: [],
  }
  const url = decodeProbeToken(token)
  if (!url) return fallback
  try {
    // Unfurl bots fetch once per share; a token mill burning DataForSEO
    // credits does not. Over the cap → branded fallback card, never an error.
    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? '0.0.0.0'
    const allowed = await consume('og', ip, incrCounter)
    if (!allowed.ok) {
      const host = new URL(url).hostname.replace(/^www\./, '')
      return { ...fallback, host }
    }
    const validated = await validateProbeUrl(url)
    if (!validated.ok) return fallback
    const host = validated.url.hostname.replace(/^www\./, '')
    const [{ html }, robotsTxt, llmsTxt, domainMetrics] = await Promise.all([
      fetchHtml(validated.url.toString()),
      fetchRobotsTxt(validated.url.origin),
      hasLlmsTxt(validated.url.origin),
      getDomainMetrics(validated.url.hostname),
    ])
    const s = computeScores(html, validated.url.toString(), { robotsTxt, llmsTxt, domainMetrics })
    const tier =
      s.overall >= 85
        ? { label: 'ON TRACK', color: GREEN }
        : s.overall >= 55
          ? { label: 'GAPS', color: AMBER }
          : { label: 'AT RISK', color: RED }
    const bars = [
      { label: 'SCHEMA', value: s.schema },
      { label: 'AI-READABLE', value: s.readable },
      { label: 'AUTHORITY', value: s.authority },
      ...(typeof s.domain === 'number' ? [{ label: 'DOMAIN', value: s.domain }] : []),
    ]
    return { host, overall: s.overall, tierLabel: tier.label, tierColor: tier.color, bars }
  } catch {
    let host = 'ai-readiness report'
    try {
      host = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      /* keep fallback */
    }
    return { ...fallback, host }
  }
}

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const card = await loadCard(token)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: INK,
          color: PAPER,
          padding: 64,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 4, color: MUTED }}>
            AI-READINESS REPORT
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>salesolution.net</div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: card.host.length > 26 ? 52 : 72,
            fontWeight: 700,
            marginTop: 40,
            color: PAPER,
          }}
        >
          {card.host}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 28 }}>
          <div style={{ display: 'flex', fontSize: 132, fontWeight: 700, lineHeight: 1 }}>
            {card.overall === null ? '—' : card.overall}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 3,
              color: card.tierColor,
              border: `2px solid ${card.tierColor}`,
              padding: '10px 18px',
            }}
          >
            {card.tierLabel}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 44 }}>
          {card.bars.map((b) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ display: 'flex', width: 240, fontSize: 22, letterSpacing: 2, color: MUTED }}>
                {b.label}
              </div>
              <div
                style={{
                  display: 'flex',
                  width: 620,
                  height: 14,
                  backgroundColor: '#232c3d',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: `${Math.max(2, (b.value / 100) * 620)}px`,
                    height: 14,
                    backgroundColor: b.value >= 70 ? GREEN : b.value >= 50 ? '#2953c4' : RED,
                  }}
                />
              </div>
              <div style={{ display: 'flex', fontSize: 24, width: 60, justifyContent: 'flex-end' }}>
                {b.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 21, color: MUTED }}>
          {`Scored live on our ${SIGNAL_COUNT}-signal AI-readiness rubric · schema · readability · authority · domain`}
        </div>
      </div>
    ),
    size,
  )
}
