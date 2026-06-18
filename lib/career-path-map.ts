/**
 * Builders for the open, downloadable AI-search role-map artifact, shared by the
 * JSON route (/career-paths/roles-map) and the Markdown route
 * (/career-paths/roles-map/md). A permissively-licensed data file is a low-DR
 * citation/link magnet — the "repo effect" without a repo. Built from the same
 * Sanity data the pages render.
 *
 * (URLs avoid a dot in the route-segment folder name on purpose: a folder like
 * `map.json/` next to `[slug]` corrupts the sibling route bundle under Turbopack.)
 */
import { business } from './business'
import { orderModules, type CareerPathMapEntry } from '@/sanity/lib/career-paths'

const LICENSE =
  'CC BY 4.0 — free to reuse with attribution and a link back to the source URL.'

export function buildRoleMapJson(paths: CareerPathMapEntry[]) {
  return {
    name: 'Sale Solution — AI-search role map',
    description:
      'Career paths for the AI-search disciplines (SEO, GEO, AEO, AI search, citation engineering, AI visibility), as a dependency graph of skill modules by seniority. Multi-vertical: industrial e-commerce, home services, dental.',
    source: `${business.url}/career-paths/`,
    license: LICENSE,
    paths: paths.map((p) => ({
      slug: p.slug,
      title: p.title,
      kind: p.kind ?? 'role',
      level: p.level ?? null,
      url: `${business.url}/career-paths/${p.slug}/`,
      prerequisites: p.prerequisites ?? [],
      leadsTo: p.leadsTo ?? [],
      modules: orderModules(p.modules ?? []).map((m) => ({
        n: m.n,
        level: m.level ?? null,
        title: m.title ?? null,
        skill: m.skill ?? null,
        weight: m.weight ?? 'core',
      })),
    })),
  }
}

export function buildRoleMapMarkdown(paths: CareerPathMapEntry[]): string {
  const roles = paths.filter((p) => (p.kind ?? 'role') === 'role')
  const specs = paths.filter((p) => p.kind === 'specialization')
  const lines: string[] = []
  lines.push('# Sale Solution — AI-search role map')
  lines.push('')
  lines.push(
    'Career paths for the AI-search disciplines, as skill modules by seniority. Multi-vertical: industrial e-commerce, home services, dental.',
  )
  lines.push('')
  lines.push(`Source: ${business.url}/career-paths/`)
  lines.push(`License: ${LICENSE}`)
  lines.push('')

  const section = (label: string, group: CareerPathMapEntry[]) => {
    if (!group.length) return
    lines.push(`## ${label}`)
    lines.push('')
    for (const p of group) {
      lines.push(`### ${p.title}`)
      lines.push(`- URL: ${business.url}/career-paths/${p.slug}/`)
      if (p.level) lines.push(`- Level: ${p.level}`)
      if (p.prerequisites?.length) lines.push(`- Prerequisites: ${p.prerequisites.join(', ')}`)
      if (p.leadsTo?.length) lines.push(`- Leads to: ${p.leadsTo.join(', ')}`)
      lines.push('')
      lines.push('Skills:')
      for (const m of orderModules(p.modules ?? [])) {
        const tag = m.weight && m.weight !== 'core' ? ` _(${m.weight})_` : ''
        lines.push(`${m.n}. (${m.level}) ${m.title}${tag}`)
      }
      lines.push('')
    }
  }

  section('Roles', roles)
  section('Specializations', specs)
  return lines.join('\n')
}
