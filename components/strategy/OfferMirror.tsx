import {
  getDrift,
  getMirror,
  getPerception,
  type Confidence,
  type CoverageRow,
  type DoorAuditRow,
  type EvidenceRef,
  type Finding,
  type FindingSeverity,
  type FunnelStage,
  type Grade,
  type MismatchClass,
  type MismatchRow,
  type PerceptionRecord,
  type RouteRecord,
  type VoiceViolation,
} from '@/lib/strategy/offers/data'
import { STATUS, type ItemStatus } from '@/lib/strategy/offers/status'

/**
 * The offer dashboard at /strategy/offers.
 *
 * Stage 1 (mirror) is a frozen blind scan of what the site itself says it
 * sells. Stages 2 (drift vs canon) and 3 (outside-in perception) render only
 * once their generated files stop being null — the header title switches to
 * "Offer dashboard" at that point.
 *
 * Internal/gated — readability over polish, same idiom as NicheBrief.
 */

const STAGES: FunnelStage[] = ['attract', 'educate', 'prove', 'convert']

const SEVERITIES: FindingSeverity[] = ['P1', 'P2', 'P3', 'P4']

const GROUP_ORDER: { key: string; label: string }[] = [
  { key: 'home-chrome-machine', label: 'Home, chrome & machine layer' },
  { key: 'services-growth', label: 'Services hub + growth & authority book' },
  { key: 'services-leak-stack', label: 'Leak-stack service pages' },
  { key: 'revenue-engine-industries', label: 'Revenue Engine + industries' },
  { key: 'conversion-campaign', label: 'Conversion pages, campaign LP & lead APIs' },
  { key: 'probe-tools', label: 'AI-readiness probe + tools' },
  { key: 'learning-hub', label: 'Learning hub + published Sanity content' },
  { key: 'legal-misc', label: 'About, legal, preferences & misc' },
]

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  H: 'bg-accent-500/15 text-accent-700',
  M: 'bg-brand-100 text-brand-700',
  L: 'bg-surface text-ink-400',
}

const SEVERITY_STYLE: Record<FindingSeverity, string> = {
  P1: 'bg-danger-500/15 text-danger-500',
  P2: 'bg-brand-100 text-brand-700',
  P3: 'bg-surface text-ink-700',
  P4: 'bg-surface text-ink-400',
}

const GRADE_STYLE: Record<Grade, string> = {
  G1: 'bg-accent-500/15 text-accent-700',
  G2: 'bg-brand-100 text-brand-700',
  G3: 'bg-danger-500/15 text-danger-500',
  ungraded: 'bg-surface text-ink-400',
}

const DOOR_STATUS_STYLE: Record<DoorAuditRow['status'], string> = {
  ok: 'bg-accent-500/15 text-accent-700',
  'wrong-door': 'bg-danger-500/15 text-danger-500',
  'missing-door': 'bg-danger-500 text-white',
}

/** Mismatches read in triage order: canon moves, then copy, then the misreads. */
const MISMATCH_ORDER: { key: MismatchClass; label: string }[] = [
  { key: 'docs-stale', label: 'Docs stale' },
  { key: 'true-contradiction', label: 'True contradiction' },
  { key: 'copy-stale', label: 'Copy stale' },
  { key: 'mirror-misread', label: 'Mirror misread' },
]

/** Perception records grouped by the query family that produced them. */
const PERCEPTION_GROUPS: { label: string; note: string; ids: string[] }[] = [
  {
    label: 'Brand queries',
    note: 'who we are, what we sell, what it costs',
    ids: ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07'],
  },
  {
    label: 'Category queries',
    note: 'the buyer question per vertical',
    ids: ['P-08', 'P-09', 'P-10', 'P-11', 'P-12'],
  },
  { label: 'Datasets', note: 'LLM-mentions at dataset scale', ids: ['P-13', 'P-14'] },
  { label: 'Live scraper', note: 'answer engines, live', ids: ['P-15', 'P-16'] },
  { label: 'SERPs', note: 'Google, live', ids: ['P-17', 'P-18', 'P-19'] },
]

/**
 * PRESENTATION ONLY — not data. The lead session's blind, pre-grade judgment of
 * what to fix first, layered over the frozen mirror.generated.ts (which stays
 * severity-classified and untouched; severity chips still show P1–P4).
 * Superseded by the Drift section's canon-informed ranking once drift data
 * exists. Ids present in the data but absent here still render, under
 * "Unranked" — the ranking never drops a finding.
 */
const FIX_PRIORITY: { tier: string; label: string; ids: string[] }[] = [
  {
    tier: 'Tier 1',
    label: 'Actively broken or risky — fix first',
    ids: ['F-02', 'F-01', 'F-06', 'F-10'],
  },
  {
    tier: 'Tier 2',
    label: 'Contradictions a diligent buyer will hit',
    ids: ['F-04', 'F-03', 'F-07', 'F-05', 'F-23'],
  },
  {
    tier: 'Tier 3',
    label: 'What the outside world learns',
    ids: ['F-08', 'F-12', 'F-09', 'F-11', 'F-14'],
  },
  {
    tier: 'Tier 4',
    label: 'Coherence sweep — batch these',
    ids: [
      'F-25',
      'F-15',
      'F-16',
      'F-18',
      'F-17',
      'F-22',
      'F-19',
      'F-26',
      'F-21',
      'F-13',
      'F-20',
      'F-24',
    ],
  },
]

/** Tiers in fix order, each finding tagged with its global rank (1..n). */
function rankFindings(findings: Finding[]) {
  const byId = new Map(findings.map((f) => [f.id, f]))
  const ranked = new Set(FIX_PRIORITY.flatMap((t) => t.ids))
  const leftovers = findings
    .filter((f) => !ranked.has(f.id))
    .sort(
      (a, b) =>
        SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.id.localeCompare(b.id),
    )

  const groups: { tier: string; label?: string; rows: Finding[] }[] = [
    ...FIX_PRIORITY.map((t) => ({
      tier: t.tier,
      label: t.label,
      rows: t.ids.map((id) => byId.get(id)).filter((f): f is Finding => Boolean(f)),
    })),
    { tier: 'Unranked', rows: leftovers },
  ].filter((g) => g.rows.length > 0)

  let rank = 0
  return groups.map((g) => ({
    ...g,
    rows: g.rows.map((finding) => ({ finding, rank: ++rank })),
  }))
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">{children}</p>
  )
}

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-rule pt-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
          <span className="mr-2 font-mono text-sm text-ink-300">{n}</span>
          {title}
        </h2>
        {note ? (
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">{note}</span>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Chip({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${tone}`}
    >
      {children}
    </span>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11px] text-ink-400">{children}</span>
}

/**
 * Hand-maintained status layer (lib/strategy/offers/status.ts) — presentation
 * only, never data. Ids with no entry render exactly as they did before.
 */
function statusOf(id: string): ItemStatus | undefined {
  return STATUS[id]
}

/** Half-grays a closed item's body without dimming its id or its chips. */
function doneDim(status: ItemStatus | undefined): string {
  return status?.state === 'done' ? 'opacity-50' : ''
}

function StatusChip({ status }: { status: ItemStatus | undefined }) {
  if (!status) return null
  return status.state === 'done' ? (
    <Chip tone="bg-data-up/10 text-data-up">✓ done</Chip>
  ) : (
    <Chip tone="bg-warning-50 text-accent-700">in progress</Chip>
  )
}

/** The annotation itself: muted amber while open, plain muted once closed. */
function StatusNote({ status }: { status: ItemStatus | undefined }) {
  if (!status) return null
  return (
    <span
      className={`mt-1.5 block text-[11px] leading-snug ${
        status.state === 'done' ? 'text-ink-400' : 'italic text-accent-700'
      }`}
    >
      {status.note}
    </span>
  )
}

function Quote({ evidence }: { evidence: EvidenceRef }) {
  return (
    <li className="border-l-2 border-rule pl-3">
      <p className="text-sm leading-relaxed text-ink-700">{evidence.quote}</p>
      <Mono>
        {evidence.file}
        {evidence.route ? ` · ${evidence.route}` : ''}
      </Mono>
    </li>
  )
}

function Scroller({ children }: { children: React.ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1 pb-1">{children}</div>
}

/** Long cell text: clamped for density, full text on hover. */
function Clamp({ text, lines = 2 }: { text: string; lines?: number }) {
  return (
    <span
      title={text}
      className="block overflow-hidden text-ink-700"
      style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical' }}
    >
      {text}
    </span>
  )
}

function CoverageCell({ routes }: { routes: string[] }) {
  if (routes.length === 0) {
    return (
      <td className="border-t border-rule px-3 py-2 align-top">
        <span className="rounded bg-danger-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-danger-500">
          none
        </span>
      </td>
    )
  }
  return (
    <td className="border-t border-rule px-3 py-2 align-top">
      <details>
        <summary
          className="cursor-pointer font-mono text-[12px] text-ink-800"
          title={routes.join('\n')}
        >
          {routes.length}
        </summary>
        <ul className="mt-1.5 space-y-0.5">
          {routes.map((r, i) => (
            <li key={i} className="font-mono text-[10px] leading-snug text-ink-500">
              {r}
            </li>
          ))}
        </ul>
      </details>
    </td>
  )
}

function InventoryTable({ rows }: { rows: RouteRecord[] }) {
  return (
    <Scroller>
      <table className="w-full min-w-[1000px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            <th className="px-3 py-2 font-normal">Route</th>
            <th className="px-3 py-2 font-normal">Page type</th>
            <th className="px-3 py-2 font-normal">Vertical</th>
            <th className="px-3 py-2 font-normal">Price signals</th>
            <th className="px-3 py-2 font-normal">Primary door</th>
            <th className="px-3 py-2 font-normal">Flags</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.route} className="align-top">
              <td className="w-[15%] border-t border-rule px-3 py-2">
                <span className="font-mono text-[11px] text-ink-900">{r.route}</span>
              </td>
              <td className="w-[13%] border-t border-rule px-3 py-2">
                <Clamp text={r.pageType} />
              </td>
              <td className="w-[20%] border-t border-rule px-3 py-2">
                <Clamp text={r.vertical} />
              </td>
              <td className="w-[22%] border-t border-rule px-3 py-2">
                <Clamp text={r.priceSignals} lines={3} />
              </td>
              <td className="w-[15%] border-t border-rule px-3 py-2">
                {r.primaryCta ? (
                  <span className="text-ink-700">
                    {r.primaryCta.label}
                    <span className="mt-0.5 block font-mono text-[10px] text-ink-400">
                      → {r.primaryCta.href}
                    </span>
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-ink-400">none</span>
                )}
              </td>
              <td className="w-[15%] border-t border-rule px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {r.flags.length === 0 ? (
                    <span className="font-mono text-[10px] text-ink-300">—</span>
                  ) : (
                    r.flags.map((f, i) => (
                      <span
                        key={i}
                        className="rounded border border-rule bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-500"
                      >
                        {f}
                      </span>
                    ))
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroller>
  )
}

function FindingCard({ finding, rank }: { finding: Finding; rank: number }) {
  const status = statusOf(finding.id)
  const dim = doneDim(status)
  return (
    <div className="rounded-md border border-rule bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-rule bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-900">
          {rank}
        </span>
        <Chip tone={SEVERITY_STYLE[finding.severity]}>{finding.severity}</Chip>
        <span className="font-mono text-[11px] text-ink-400">{finding.id}</span>
        <StatusChip status={status} />
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
          {finding.kind}
        </span>
      </div>
      <p className={`mt-2 font-semibold leading-snug text-ink-900 ${dim}`}>{finding.title}</p>
      <StatusNote status={status} />
      <div className={dim}>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{finding.whyItMatters}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-800">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            Direction{' '}
          </span>
          {finding.direction}
        </p>
        {finding.quotes.length ? (
          <ul className="mt-3 space-y-2">
            {finding.quotes.map((q, i) => (
              <Quote key={i} evidence={q} />
            ))}
          </ul>
        ) : null}
        <div className="mt-3">
          <Eyebrow>Surfaces</Eyebrow>
          <ul className="mt-1 space-y-0.5">
            {finding.surfaces.map((s, i) => (
              <li key={i} className="font-mono text-[10px] leading-snug text-ink-400">
                {s.route} · {s.file}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function MismatchTable({ rows }: { rows: MismatchRow[] }) {
  return (
    <Scroller>
      <table className="w-full min-w-[900px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            <th className="px-3 py-2 font-normal">ID</th>
            <th className="px-3 py-2 font-normal">Mirror ref · canon source</th>
            <th className="px-3 py-2 font-normal">What drifted</th>
            <th className="px-3 py-2 font-normal">Resolution</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const status = statusOf(m.id)
            const dim = doneDim(status)
            return (
              <tr key={m.id} className="align-top">
                <td className="w-[6%] border-t border-rule px-3 py-2 font-mono text-[11px] font-semibold text-ink-900">
                  {m.id}
                  {status ? (
                    <span className="mt-1 block">
                      <StatusChip status={status} />
                    </span>
                  ) : null}
                </td>
                <td className={`w-[24%] border-t border-rule px-3 py-2 ${dim}`}>
                  <span className="font-mono text-[11px] text-ink-700">{m.mirrorRef}</span>
                  <span className="mt-1 block font-mono text-[10px] leading-snug text-ink-400">
                    {m.canonSource}
                  </span>
                </td>
                <td className="w-[35%] border-t border-rule px-3 py-2 leading-relaxed text-ink-800">
                  <span className={`block ${dim}`}>{m.summary}</span>
                  <StatusNote status={status} />
                </td>
                <td
                  className={`w-[35%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700 ${dim}`}
                >
                  {m.resolution}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Scroller>
  )
}

function DoorAuditTable({ rows }: { rows: DoorAuditRow[] }) {
  return (
    <Scroller>
      <table className="w-full min-w-[980px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            <th className="px-3 py-2 font-normal">Route</th>
            <th className="px-3 py-2 font-normal">Current door</th>
            <th className="px-3 py-2 font-normal">Intended</th>
            <th className="px-3 py-2 font-normal">Status</th>
            <th className="px-3 py-2 font-normal">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d, i) => (
            <tr key={i} className="align-top">
              <td className="w-[22%] border-t border-rule px-3 py-2 font-mono text-[11px] leading-snug text-ink-900">
                {d.route}
              </td>
              <td className="w-[18%] border-t border-rule px-3 py-2">
                {d.currentDoor ? (
                  <span className="text-ink-700">
                    {d.currentDoor.label}
                    <span className="mt-0.5 block font-mono text-[10px] text-ink-400">
                      → {d.currentDoor.href}
                    </span>
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-ink-400">none</span>
                )}
              </td>
              <td className="w-[20%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                {d.intendedDoor}
              </td>
              <td className="w-[9%] border-t border-rule px-3 py-2">
                <Chip tone={DOOR_STATUS_STYLE[d.status]}>{d.status}</Chip>
              </td>
              <td className="w-[31%] border-t border-rule px-3 py-2 leading-relaxed text-ink-500">
                {d.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroller>
  )
}

function VoiceTable({
  violations,
  banned,
}: {
  violations: VoiceViolation[]
  banned: VoiceViolation[]
}) {
  return (
    <Scroller>
      <table className="w-full min-w-[900px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            <th className="px-3 py-2 font-normal">Route</th>
            <th className="px-3 py-2 font-normal">Term</th>
            <th className="px-3 py-2 font-normal">Count</th>
            <th className="px-3 py-2 font-normal">Example</th>
          </tr>
        </thead>
        <tbody>
          {banned.map((v, i) => (
            <tr key={`banned-${i}`} className="align-top bg-danger-500/10">
              <td className="w-[24%] border-t-2 border-danger-500 px-3 py-2">
                <Chip tone="bg-danger-500 text-white">banned competitor</Chip>
                <span className="mt-1 block font-mono text-[11px] leading-snug text-ink-900">
                  {v.route}
                </span>
              </td>
              <td className="w-[26%] border-t-2 border-danger-500 px-3 py-2 font-semibold leading-relaxed text-danger-500">
                {v.term}
              </td>
              <td className="w-[6%] border-t-2 border-danger-500 px-3 py-2 font-mono text-[11px] font-semibold text-danger-500">
                {v.count}
              </td>
              <td className="w-[44%] border-t-2 border-danger-500 px-3 py-2 leading-relaxed text-ink-900">
                {v.example}
              </td>
            </tr>
          ))}
          {violations.map((v, i) => (
            <tr key={i} className="align-top">
              <td className="w-[24%] border-t border-rule px-3 py-2 font-mono text-[11px] leading-snug text-ink-900">
                {v.route}
              </td>
              <td className="w-[26%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                {v.term}
              </td>
              <td className="w-[6%] border-t border-rule px-3 py-2 font-mono text-[11px] text-ink-800">
                {v.count}
              </td>
              <td className="w-[44%] border-t border-rule px-3 py-2 leading-relaxed text-ink-500">
                {v.example}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroller>
  )
}

function PerceptionTable({ rows }: { rows: PerceptionRecord[] }) {
  return (
    <Scroller>
      <table className="w-full min-w-[1040px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            <th className="px-3 py-2 font-normal">ID</th>
            <th className="px-3 py-2 font-normal">Source</th>
            <th className="px-3 py-2 font-normal">Query</th>
            <th className="px-3 py-2 font-normal">What it says we do</th>
            <th className="px-3 py-2 font-normal">Errors · omissions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="align-top">
              <td className="w-[6%] border-t border-rule px-3 py-2 font-mono text-[11px] font-semibold text-ink-900">
                {r.id}
              </td>
              <td className="w-[13%] border-t border-rule px-3 py-2 font-mono text-[10px] leading-snug text-ink-500">
                {r.source}
              </td>
              <td className="w-[17%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                {r.query}
              </td>
              <td className="w-[36%] border-t border-rule px-3 py-2">
                <p className="leading-relaxed text-ink-800">{r.saysWeDo}</p>
                {r.quotes.length ? (
                  <ul className="mt-2 space-y-1">
                    {r.quotes.map((q, i) => (
                      <li
                        key={i}
                        className="border-l-2 border-rule pl-2 text-[11px] leading-snug text-ink-500"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </td>
              <td className="w-[28%] border-t border-rule px-3 py-2">
                {r.errors.length ? (
                  <ul className="space-y-0.5">
                    {r.errors.map((e, i) => (
                      <li key={i} className="text-[11px] leading-snug text-danger-500">
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {r.omissions.length ? (
                  <ul className={`space-y-0.5 ${r.errors.length ? 'mt-1.5' : ''}`}>
                    {r.omissions.map((o, i) => (
                      <li key={i} className="text-[11px] leading-snug text-ink-400">
                        {o}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {!r.errors.length && !r.omissions.length ? (
                  <span className="font-mono text-[10px] text-ink-300">—</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroller>
  )
}

export function OfferMirror() {
  const mirror = getMirror()
  const drift = getDrift()
  const perception = getPerception()

  const title = drift && perception ? 'Offer dashboard' : 'Offer Mirror'
  const claimsById = new Map(mirror.claims.map((c) => [c.id, c]))
  const verticalLabel = new Map(mirror.verticals.map((v) => [v.key, v.label]))
  const questionScopes = [...new Set(mirror.openQuestions.map((q) => q.scope))]
  const groups = GROUP_ORDER.map((g) => ({
    ...g,
    rows: mirror.inventory.filter((r) => r.group === g.key),
  })).filter((g) => g.rows.length > 0)
  const findingTiers = rankFindings(mirror.findings)

  const gradedRows = drift ? drift.grades.filter((g) => g.grade !== 'ungraded') : []
  const ungradedCount = drift ? drift.grades.length - gradedRows.length : 0
  const mismatchGroups = drift
    ? [
        ...MISMATCH_ORDER.map((c) => ({
          key: c.key as string,
          label: c.label,
          rows: drift.mismatches.filter((m) => m.classification === c.key),
        })),
        {
          key: 'other',
          label: 'Other',
          rows: drift.mismatches.filter(
            (m) => !MISMATCH_ORDER.some((c) => c.key === m.classification),
          ),
        },
      ].filter((g) => g.rows.length > 0)
    : []

  const perceptionGroups = perception
    ? [
        ...PERCEPTION_GROUPS.map((g) => ({
          label: g.label,
          note: g.note,
          rows: g.ids
            .map((id) => perception.records.find((r) => r.id === id))
            .filter((r): r is PerceptionRecord => Boolean(r)),
        })),
        {
          label: 'Ungrouped',
          note: '',
          rows: perception.records.filter(
            (r) => !PERCEPTION_GROUPS.some((g) => g.ids.includes(r.id)),
          ),
        },
      ].filter((g) => g.rows.length > 0)
    : []

  return (
    <article className="max-w-5xl">
      {/* Header */}
      <Eyebrow>Blind offer scan · stage 1 of 3</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900">
        {title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-rule bg-surface px-3 py-1 text-ink-500">
          Generated <span className="font-mono text-ink-800">{mirror.generatedAt}</span>
        </span>
        <span className="rounded-full border border-rule bg-surface px-3 py-1 text-ink-500">
          <span className="font-mono text-ink-800">{mirror.corpus.routeCount}</span> routes ·{' '}
          <span className="font-mono text-ink-800">{mirror.corpus.fileCount}</span> files ·{' '}
          <span className="font-mono text-ink-800">{mirror.corpus.sanityDocCount}</span> Sanity docs
        </span>
        <span className="rounded-full border border-rule bg-surface px-3 py-1 text-ink-500">
          {mirror.claims.length} claims · {mirror.findings.length} findings
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-500">{mirror.method}</p>
      <p className="mt-3 rounded-md border-l-2 border-accent-500 bg-accent-500/5 px-4 py-3 font-mono text-[12px] text-ink-800">
        Grade in chat: U-xx → G1 right / G2 partial / G3 wrong + notes.
      </p>

      <div className="mt-10 space-y-10">
        {/* 1 — TL;DR */}
        <section>
          <Eyebrow>TL;DR</Eyebrow>
          <p className="mt-3 font-display text-lg leading-relaxed text-ink-900">{mirror.tldr}</p>
        </section>

        {/* 2 — Vertical briefs */}
        <Section n="01" title="What the copy sells, by vertical" note="claims are gradeable">
          <div className="space-y-8">
            {mirror.verticals.map((v) => (
              <div key={v.key}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-display text-lg font-semibold text-ink-900">{v.label}</h3>
                  <Mono>{v.key}</Mono>
                </div>
                <p className="mt-1.5 leading-relaxed text-ink-700">{v.summary}</p>
                <ul className="mt-4 space-y-4">
                  {v.claimIds.map((id) => {
                    const c = claimsById.get(id)
                    if (!c) return null
                    const status = statusOf(c.id)
                    const dim = doneDim(status)
                    return (
                      <li key={id} className="rounded-md border border-rule bg-surface p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded border border-rule bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-900">
                            {c.id}
                          </span>
                          <StatusChip status={status} />
                          <span className="font-mono text-[10px] uppercase tracking-wide text-accent-600">
                            {c.element}
                          </span>
                          <Chip tone={CONFIDENCE_STYLE[c.confidence]}>{c.confidence}</Chip>
                        </div>
                        <p className={`mt-2 leading-relaxed text-ink-900 ${dim}`}>{c.claim}</p>
                        <StatusNote status={status} />
                        <ul className={`mt-3 space-y-2 ${dim}`}>
                          {c.evidence.map((e, i) => (
                            <Quote key={i} evidence={e} />
                          ))}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* 3 — Coverage matrix */}
        <Section n="02" title="Funnel coverage" note="routes per stage · empty cells flagged">
          <Scroller>
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                  <th className="px-3 py-2 font-normal">Vertical</th>
                  {STAGES.map((s) => (
                    <th key={s} className="px-3 py-2 font-normal">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mirror.coverage.map((row: CoverageRow) => (
                  <tr key={row.vertical}>
                    <td className="border-t border-rule px-3 py-2 align-top">
                      <span className="text-sm font-medium text-ink-900">
                        {verticalLabel.get(row.vertical) ?? row.vertical}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-ink-400">
                        {row.vertical}
                      </span>
                    </td>
                    {STAGES.map((s) => (
                      <CoverageCell key={s} routes={row.cells[s]} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroller>
        </Section>

        {/* 4 — Findings */}
        <Section n="03" title="Findings" note="fix order">
          <p className="text-sm leading-relaxed text-ink-500">
            Ordered by fix priority (blind, pre-grade judgment) — severity chips show the P1–P4
            classification. The canon-informed re-rank lands in the Drift section after grading.
          </p>
          <div className="mt-6 space-y-8">
            {findingTiers.map((t) => (
              <div key={t.tier}>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="bg-brand-100 text-brand-700">{t.tier}</Chip>
                  {t.label ? (
                    <span className="text-sm font-semibold text-ink-900">{t.label}</span>
                  ) : null}
                  <Mono>{t.rows.length}</Mono>
                </div>
                <div className="mt-3 space-y-4">
                  {t.rows.map(({ finding, rank }) => (
                    <FindingCard key={finding.id} finding={finding} rank={rank} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 5 — Briefed, but the site never says it */}
        <Section n="04" title="Briefed, but the site never says it" note="ambient context, quarantined">
          <ul className="space-y-3">
            {mirror.briefedNotOnPage.map((b, i) => (
              <li key={i} className="rounded-md border border-rule bg-surface p-4">
                <p className="leading-relaxed text-ink-900">{b.fact}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{b.note}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* 6 — Open questions */}
        <Section n="05" title="Open questions" note="only the founder can settle these">
          <div className="space-y-5">
            {questionScopes.map((scope) => (
              <div key={scope}>
                <Eyebrow>{scope}</Eyebrow>
                <ul className="mt-2 space-y-2">
                  {mirror.openQuestions
                    .filter((q) => q.scope === scope)
                    .map((q, i) => (
                      <li key={i} className="border-l-2 border-rule pl-3 text-sm leading-relaxed text-ink-700">
                        {q.question}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* 7 — Self-assessment */}
        <Section n="06" title="Self-assessment" note="what the scan trusts, and what it does not">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-accent-500/30 bg-accent-500/5 p-4">
              <Eyebrow>Solid</Eyebrow>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {mirror.selfAssessment.solid}
              </p>
            </div>
            <div className="rounded-md border border-danger-500/30 bg-danger-500/5 p-4">
              <Eyebrow>Shaky</Eyebrow>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {mirror.selfAssessment.shaky}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-md border-l-2 border-ink-900 bg-surface px-4 py-3">
            <Eyebrow>Most helpful change</Eyebrow>
            <p className="mt-1.5 leading-relaxed text-ink-800">
              {mirror.selfAssessment.mostHelpfulChange}
            </p>
          </div>
        </Section>

        {/* 8 — Corpus gaps */}
        <Section n="07" title="What the scan could not see" note="corpus gaps">
          <ul className="space-y-2">
            {mirror.corpus.gaps.map((g, i) => (
              <li key={i} className="border-l-2 border-rule pl-3 text-sm leading-relaxed text-ink-500">
                {g}
              </li>
            ))}
          </ul>
        </Section>

        {/* 9 — Inventory appendix */}
        <Section n="08" title="Route inventory" note={`${mirror.corpus.routeCount} records`}>
          <div className="space-y-8">
            {groups.map((g) => (
              <div key={g.key}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-display text-base font-semibold text-ink-900">{g.label}</h3>
                  <Mono>
                    {g.key} · {g.rows.length}
                  </Mono>
                </div>
                <div className="mt-3 rounded-md border border-rule bg-surface p-1">
                  <InventoryTable rows={g.rows} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 10 — Drift (stage 2) */}
        {drift ? (
          <Section n="09" title="Drift vs canon" note={`graded ${drift.gradedAt}`}>
            <div className="space-y-8">
              {/* a — grades */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>Grades</Eyebrow>
                  <Mono>
                    {gradedRows.length} graded · {drift.grades.length} claims
                  </Mono>
                </div>
                <div className="mt-2 rounded-md border border-rule bg-surface p-1">
                  <Scroller>
                    <table className="w-full min-w-[680px] border-collapse text-left text-[12px]">
                      <tbody>
                        {gradedRows.map((g) => {
                          const status = statusOf(g.claimId)
                          const dim = doneDim(status)
                          return (
                            <tr key={g.claimId} className="align-top">
                              <td className="w-[8%] border-t border-rule px-3 py-2 font-mono text-[11px] font-semibold text-ink-900">
                                {g.claimId}
                                {status ? (
                                  <span className="mt-1 block">
                                    <StatusChip status={status} />
                                  </span>
                                ) : null}
                              </td>
                              <td className={`w-[8%] border-t border-rule px-3 py-2 ${dim}`}>
                                <Chip tone={GRADE_STYLE[g.grade]}>{g.grade}</Chip>
                              </td>
                              <td className="w-[84%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                                <span className={`block ${dim}`}>{g.notes}</span>
                                <StatusNote status={status} />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </Scroller>
                </div>
                <p className="mt-2 font-mono text-[11px] text-ink-400">{`${ungradedCount} ungraded`}</p>
              </div>

              {/* b — mismatches */}
              {mismatchGroups.length ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Eyebrow>Mismatches</Eyebrow>
                    <Mono>{drift.mismatches.length}</Mono>
                  </div>
                  <div className="mt-3 space-y-6">
                    {mismatchGroups.map((g) => (
                      <div key={g.key}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip tone="bg-brand-100 text-brand-700">{g.key}</Chip>
                          <span className="text-sm font-semibold text-ink-900">{g.label}</span>
                          <Mono>{g.rows.length}</Mono>
                        </div>
                        <div className="mt-2 rounded-md border border-rule bg-surface p-1">
                          <MismatchTable rows={g.rows} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* c — door audit */}
              {drift.doorAudit.length ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Eyebrow>Door audit</Eyebrow>
                    <Mono>{drift.doorAudit.length} surfaces</Mono>
                  </div>
                  <div className="mt-2 rounded-md border border-rule bg-surface p-1">
                    <DoorAuditTable rows={drift.doorAudit} />
                  </div>
                </div>
              ) : null}

              {/* d — voice pass */}
              <div>
                <Eyebrow>Voice pass</Eyebrow>
                <p className="mt-2 leading-relaxed text-ink-700">{drift.voicePass.summary}</p>
                <div className="mt-3 rounded-md border border-rule bg-surface p-1">
                  <VoiceTable
                    violations={drift.voicePass.violations}
                    banned={drift.voicePass.bannedCompetitorHits}
                  />
                </div>
              </div>

              {/* e — deploy divergences */}
              {drift.deployDivergences.length ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Eyebrow>Deploy divergences</Eyebrow>
                    <Mono>repo vs live · {drift.deployDivergences.length}</Mono>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {drift.deployDivergences.map((d) => {
                      const status = statusOf(d.id)
                      const dim = doneDim(status)
                      return (
                        <li key={d.id} className="rounded-md border border-rule bg-surface p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold text-ink-900">
                              {d.id}
                            </span>
                            <StatusChip status={status} />
                            <Chip tone="bg-danger-500/15 text-danger-500">{d.classification}</Chip>
                            <Mono>
                              {d.mirrorRef} · {d.canonSource}
                            </Mono>
                          </div>
                          <p className={`mt-2 text-sm leading-relaxed text-ink-800 ${dim}`}>
                            {d.summary}
                          </p>
                          <StatusNote status={status} />
                          <p className={`mt-1.5 text-sm leading-relaxed text-ink-700 ${dim}`}>
                            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                              Resolution{' '}
                            </span>
                            {d.resolution}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {/* 11 — Outside-in (stage 3) */}
        {perception ? (
          <Section n="10" title="Outside-in" note={`queried ${perception.queriedAt}`}>
            <div className="space-y-8">
              {/* a — patterns */}
              <div>
                <Eyebrow>Patterns</Eyebrow>
                <ul className="mt-2 space-y-2">
                  {perception.patterns.map((p, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-accent-500/40 pl-3 leading-relaxed text-ink-800"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* b — records */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>Records</Eyebrow>
                  <Mono>{perception.records.length} queries</Mono>
                </div>
                <div className="mt-3 space-y-6">
                  {perceptionGroups.map((g) => (
                    <div key={g.label}>
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="font-display text-base font-semibold text-ink-900">
                          {g.label}
                        </h3>
                        <Mono>
                          {g.note ? `${g.note} · ` : ''}
                          {g.rows.length}
                        </Mono>
                      </div>
                      <div className="mt-2 rounded-md border border-rule bg-surface p-1">
                        <PerceptionTable rows={g.rows} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* c — three-way alignment */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>Alignment</Eyebrow>
                  <Mono>copy vs canon vs world</Mono>
                </div>
                <div className="mt-2 rounded-md border border-rule bg-surface p-1">
                  <Scroller>
                    <table className="w-full min-w-[1280px] border-collapse text-left text-[12px]">
                      <thead>
                        <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                          <th className="px-3 py-2 font-normal">Vertical</th>
                          <th className="px-3 py-2 font-normal">Copy says</th>
                          <th className="px-3 py-2 font-normal">Canon says</th>
                          <th className="px-3 py-2 font-normal">World hears</th>
                          <th className="px-3 py-2 font-normal">Verdict</th>
                          <th className="px-3 py-2 font-normal">Likely cause</th>
                        </tr>
                      </thead>
                      <tbody>
                        {perception.alignment.map((a, i) => (
                          <tr key={i} className="align-top">
                            <td className="w-[8%] border-t border-rule px-3 py-2 font-mono text-[11px] font-semibold text-ink-900">
                              {a.vertical}
                            </td>
                            <td className="w-[18%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                              {a.copySays}
                            </td>
                            <td className="w-[18%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                              {a.canonSays}
                            </td>
                            <td className="w-[22%] border-t border-rule px-3 py-2 leading-relaxed text-ink-700">
                              {a.worldHears}
                            </td>
                            <td className="w-[17%] border-t border-rule px-3 py-2 leading-relaxed text-ink-900">
                              {a.verdict}
                            </td>
                            <td className="w-[17%] border-t border-rule px-3 py-2 leading-relaxed text-ink-500">
                              {a.likelyCause}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Scroller>
                </div>
              </div>

              {/* d — fix list */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>Fix list</Eyebrow>
                  <Mono>ranked 1–{perception.fixList.length}</Mono>
                </div>
                <ol className="mt-3 space-y-3">
                  {perception.fixList.map((f) => {
                    const status = statusOf(`PF-${f.rank}`)
                    const dim = doneDim(status)
                    return (
                      <li
                        key={f.rank}
                        className="flex gap-3 rounded-md border border-rule bg-surface p-4"
                      >
                        <span className="h-6 w-6 shrink-0 rounded border border-rule bg-surface text-center font-mono text-[11px] font-semibold leading-6 text-ink-900">
                          {f.rank}
                        </span>
                        <span>
                          {status ? (
                            <span className="mb-1.5 block">
                              <StatusChip status={status} />
                            </span>
                          ) : null}
                          <span className={`block text-sm leading-relaxed text-ink-800 ${dim}`}>
                            {f.fix}
                          </span>
                          <StatusNote status={status} />
                          <span className={`mt-1 block font-mono text-[10px] text-ink-400 ${dim}`}>
                            {f.seededBy}
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </Section>
        ) : null}
      </div>
    </article>
  )
}
