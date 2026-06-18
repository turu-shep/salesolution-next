/**
 * Pure layout for the career-path role map (doc 11 §T7) — a static, build-time
 * dependency graph. No client JS, no measurement: positions are computed here
 * from the `leadsTo` edges and the renderer (RoleMap) just draws them.
 *
 * Layering: longest-path on the `leadsTo` DAG, so every drawn edge points
 * strictly downward (a path sits below everything that leads to it). Within a
 * tier, nodes are ordered by the average position of their parents (a barycenter
 * pass) to cut edge crossings. Kept simple and deterministic for ~7 nodes.
 */
import type { CareerPathMapEntry } from '@/sanity/lib/career-paths'

export type GraphNode = {
  slug: string
  title: string
  kind: string
  tier: number
  x: number
  y: number
  w: number
  h: number
}
export type GraphEdge = { from: string; to: string; x1: number; y1: number; x2: number; y2: number }
export type RoleGraph = { width: number; height: number; nodes: GraphNode[]; edges: GraphEdge[] }

const BOX_W = 168
const BOX_H = 50
const GAP_X = 26
const GAP_Y = 52
const PAD = 12

export function buildRoleGraph(entries: CareerPathMapEntry[]): RoleGraph {
  const bySlug = new Map(entries.map((e) => [e.slug, e]))
  const titleOf = (s: string) => bySlug.get(s)?.title ?? s

  // Directed edges from leadsTo, restricted to nodes present in the set.
  const out = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()
  for (const e of entries) {
    const targets = (e.leadsTo ?? []).filter((t) => bySlug.has(t) && t !== e.slug)
    out.set(e.slug, targets)
    for (const t of targets) incoming.set(t, [...(incoming.get(t) ?? []), e.slug])
  }

  // Longest-path layering (depth = 1 + max depth of any node that leads to it).
  const depth = new Map<string, number>()
  const calc = (slug: string, seen: Set<string>): number => {
    if (depth.has(slug)) return depth.get(slug)!
    if (seen.has(slug)) return 0
    seen.add(slug)
    const parents = incoming.get(slug) ?? []
    const d = parents.length ? 1 + Math.max(...parents.map((p) => calc(p, seen))) : 0
    depth.set(slug, d)
    return d
  }
  for (const e of entries) calc(e.slug, new Set())

  const maxTier = Math.max(0, ...entries.map((e) => depth.get(e.slug) ?? 0))
  const tiers: string[][] = Array.from({ length: maxTier + 1 }, () => [])
  for (const e of entries) tiers[depth.get(e.slug) ?? 0].push(e.slug)

  // Order each tier: tier 0 by title; deeper tiers by parent barycenter.
  const idx = new Map<string, number>()
  tiers.forEach((tier, t) => {
    if (t === 0) {
      tier.sort((a, b) => titleOf(a).localeCompare(titleOf(b)))
    } else {
      const bary = (s: string) => {
        const ps = (incoming.get(s) ?? []).filter((p) => idx.has(p))
        return ps.length ? ps.reduce((acc, p) => acc + (idx.get(p) ?? 0), 0) / ps.length : 999
      }
      tier.sort((a, b) => bary(a) - bary(b) || titleOf(a).localeCompare(titleOf(b)))
    }
    tier.forEach((s, i) => idx.set(s, i))
  })

  const tierWidth = (n: number) => n * BOX_W + Math.max(0, n - 1) * GAP_X
  const maxWidth = Math.max(...tiers.map((t) => tierWidth(t.length)), BOX_W)

  const nodes: GraphNode[] = []
  tiers.forEach((tier, t) => {
    const startX = PAD + (maxWidth - tierWidth(tier.length)) / 2
    tier.forEach((slug, i) => {
      const e = bySlug.get(slug)!
      nodes.push({
        slug,
        title: e.title,
        kind: e.kind ?? 'role',
        tier: t,
        x: startX + i * (BOX_W + GAP_X),
        y: PAD + t * (BOX_H + GAP_Y),
        w: BOX_W,
        h: BOX_H,
      })
    })
  })

  const pos = new Map(nodes.map((n) => [n.slug, n]))
  const edges: GraphEdge[] = []
  for (const [from, targets] of out) {
    const a = pos.get(from)
    if (!a) continue
    for (const to of targets) {
      const b = pos.get(to)
      if (!b) continue
      edges.push({ from, to, x1: a.x + a.w / 2, y1: a.y + a.h, x2: b.x + b.w / 2, y2: b.y })
    }
  }

  return {
    width: PAD * 2 + maxWidth,
    height: PAD * 2 + (maxTier + 1) * BOX_H + maxTier * GAP_Y,
    nodes,
    edges,
  }
}

/** Split a title into at most two balanced lines for the SVG box. */
export function wrapTitle(title: string, maxChars = 18): string[] {
  if (title.length <= maxChars) return [title]
  const words = title.split(' ')
  let best = words.length - 1
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length
    const b = words.slice(i).join(' ').length
    const diff = Math.abs(a - b)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}
