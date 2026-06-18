/**
 * Groups the career paths into the three stages the role map shows
 * (doc 11 §T7): where you start, the roles you can hire, and the
 * specializations you buy as a project. Pure + deterministic.
 *
 * Stage rule (derived from the data, not hardcoded):
 *  - Start here   = no prerequisites (the entry on-ramps), any kind.
 *  - Core roles   = has prerequisites AND kind = role.
 *  - Specialize   = has prerequisites AND kind = specialization.
 * So an entry-level specialization (e.g. AI Visibility Analyst) lands in
 * "Start here", while the foundational role (SEO Specialist) does too.
 */
import type { CareerPathMapEntry } from '@/sanity/lib/career-paths'

export type RoleStage = {
  key: string
  label: string
  blurb: string
  paths: CareerPathMapEntry[]
}

const hasPrereq = (e: CareerPathMapEntry) => (e.prerequisites?.length ?? 0) > 0

export function groupRolePathsByStage(entries: CareerPathMapEntry[]): RoleStage[] {
  // Within a stage: fewer prerequisites first (a loose progression), then title.
  const byDepth = (a: CareerPathMapEntry, b: CareerPathMapEntry) =>
    (a.prerequisites?.length ?? 0) - (b.prerequisites?.length ?? 0) ||
    a.title.localeCompare(b.title)
  // Start-here: roles before specializations, then title.
  const byKind = (a: CareerPathMapEntry, b: CareerPathMapEntry) =>
    (a.kind === 'specialization' ? 1 : 0) - (b.kind === 'specialization' ? 1 : 0) ||
    a.title.localeCompare(b.title)

  const start = entries.filter((e) => !hasPrereq(e)).sort(byKind)
  const roles = entries.filter((e) => hasPrereq(e) && (e.kind ?? 'role') === 'role').sort(byDepth)
  const specs = entries.filter((e) => hasPrereq(e) && e.kind === 'specialization').sort(byDepth)

  return [
    { key: 'start', label: 'Start here', blurb: 'Foundations and entry points', paths: start },
    { key: 'roles', label: 'Core roles', blurb: 'Professions you can hire', paths: roles },
    { key: 'specialize', label: 'Specialize', blurb: 'Skills you buy as a project', paths: specs },
  ].filter((s) => s.paths.length > 0)
}
