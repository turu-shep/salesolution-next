import type { CallLog, FunnelStage, Outcome } from './playbook'
import { FUNNEL_STAGES } from './playbook'

/**
 * Pure compute over the logged calls — the funnel + the three steering rates from
 * docs/strategy/sales/08-metrics.md. Used by /sales/metrics.
 */

const STAGE_INDEX = FUNNEL_STAGES.reduce<Record<string, number>>((acc, s, i) => {
  acc[s.id] = i
  return acc
}, {})

const BOOKED_OUTCOMES: Outcome[] = ['booked-audit', 'booked-growth-call', 'booked-diagnostic']

export interface MetricsSummary {
  dials: number
  /** How many calls reached at least each stage (cumulative funnel). */
  byStage: { id: FunnelStage; label: string; reached: number }[]
  connectRate: number | null
  reachedDmRate: number | null
  convToBookedRate: number | null
  booked: number
  dnc: number
  objections: { tag: string; count: number }[]
}

export function summarize(logs: CallLog[]): MetricsSummary {
  const dials = logs.length
  const reached = (stage: FunnelStage) =>
    logs.filter((l) => (STAGE_INDEX[l.furthestStage] ?? 0) >= STAGE_INDEX[stage]).length

  const connect = reached('connect')
  const conversation = reached('conversation')
  const booked = logs.filter((l) => BOOKED_OUTCOMES.includes(l.outcome)).length
  const dnc = logs.filter((l) => l.doNotCall).length

  const objMap = new Map<string, number>()
  for (const l of logs) {
    if (l.objectionHit) objMap.set(l.objectionHit, (objMap.get(l.objectionHit) ?? 0) + 1)
  }
  const objections = [...objMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)

  const rate = (num: number, den: number) => (den > 0 ? num / den : null)

  return {
    dials,
    byStage: FUNNEL_STAGES.map((s) => ({ id: s.id, label: s.label, reached: reached(s.id) })),
    connectRate: rate(connect, dials),
    reachedDmRate: rate(conversation, connect),
    convToBookedRate: rate(booked, conversation),
    booked,
    dnc,
    objections,
  }
}

export function pct(rate: number | null): string {
  return rate === null ? '—' : `${Math.round(rate * 100)}%`
}
