import Image from 'next/image'

import { getTool } from '@/components/tools/registry'
import type { Enrichment, EnrichmentPlacement } from '@/sanity/lib/career-paths'

/**
 * Renders a path's optional enrichments (doc 11 §T6) for a given placement slot.
 * Static types (formula, table, checklist, diagram) render server-side; the
 * interactive tool is a client island looked up by `toolKey` in the shared
 * components/tools/registry. Renders nothing when no enrichment targets the slot,
 * so the page falls through cleanly.
 */
export function PathEnrichments({
  enrichments,
  placement,
}: {
  enrichments?: Enrichment[]
  placement: EnrichmentPlacement
}) {
  const items = (enrichments ?? []).filter(
    (e) => (e.placement ?? 'after-modules') === placement,
  )
  if (items.length === 0) return null

  return (
    <div className="mt-12 space-y-10">
      {items.map((e, i) => (
        <EnrichmentBlock key={e._key ?? i} e={e} />
      ))}
    </div>
  )
}

function EnrichmentBlock({ e }: { e: Enrichment }) {
  const body = renderBody(e)
  if (!body) return null

  return (
    <section className="max-w-prose">
      {e.title && (
        <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-2xl">
          {e.title}
        </h3>
      )}
      {e.intro && (
        <p className="mt-2 leading-relaxed text-ink-700 text-pretty">{e.intro}</p>
      )}
      <div className="mt-4">{body}</div>
      {e.source && (
        <p className="mt-3 text-xs text-ink-500">Source: {e.source}</p>
      )}
    </section>
  )
}

function renderBody(e: Enrichment): React.ReactNode {
  switch (e._type) {
    case 'enrichmentTool': {
      const Tool = getTool(e.toolKey)
      return Tool ? <Tool /> : null
    }
    case 'enrichmentFormula':
      return (
        <div>
          {e.expression && (
            <p className="border border-rule bg-surface px-4 py-3 font-mono text-sm text-ink-900">
              {e.expression}
            </p>
          )}
          {e.plainExplanation && (
            <p className="mt-3 leading-relaxed text-ink-700 text-pretty">
              {e.plainExplanation}
            </p>
          )}
          {e.variables && e.variables.length > 0 && (
            <dl className="mt-3 space-y-1.5">
              {e.variables.map((v, i) => (
                <div key={i} className="flex gap-2 text-sm text-ink-700">
                  <dt className="font-mono text-ink-900">{v.symbol}</dt>
                  <dd>— {v.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )
    case 'enrichmentTable':
      if (!e.columns?.length) return null
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-900 text-left">
                {e.columns.map((c, i) => (
                  <th
                    key={i}
                    className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(e.rows ?? []).map((row, ri) => (
                <tr key={ri} className="border-b border-rule">
                  {(row.cells ?? []).map((cell, ci) => (
                    <td key={ci} className="py-2 pr-4 align-top text-ink-800 tabular-nums">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'enrichmentChecklist':
      if (!e.items?.length) return null
      return (
        <ul className="space-y-2.5">
          {e.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-ink-700 text-pretty">
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-600"
              />
              <span>
                {it.text}
                {it.note && <span className="text-ink-500"> — {it.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      )
    case 'enrichmentDiagram':
      if (!e.image?.url) return null
      return (
        <figure>
          <Image
            src={e.image.url}
            alt={e.image.alt ?? ''}
            width={e.image.width ?? 1200}
            height={e.image.height ?? 800}
            className="h-auto w-full border border-rule"
          />
          {e.caption && (
            <figcaption className="mt-2 text-xs text-ink-500">{e.caption}</figcaption>
          )}
        </figure>
      )
    default:
      return null
  }
}
