import { DEFAULT_VIEW } from '@/lib/columns.mjs'
import type { SheetParams } from '@/lib/contacts'

/**
 * A plain GET form, so filter state lives in the URL and the export can be
 * handed the same query string. The hidden `view` input keeps the current lens
 * through a filter apply — a GET submit replaces the whole query string. The
 * Clear link is the same mechanism in reverse: a bare navigation to the
 * current lens with every filter dropped.
 */
export function Filters({
  params,
  facets,
}: {
  params: SheetParams
  facets: { states: string[]; sources: string[] }
}) {
  const clearHref = params.view === DEFAULT_VIEW ? '/' : `/?view=${params.view}`
  return (
    <form method="get" className="toolbar">
      {params.view !== DEFAULT_VIEW ? <input type="hidden" name="view" value={params.view} /> : null}
      <div className="field">
        <label htmlFor="f-source">Source / brand</label>
        <select id="f-source" name="source" multiple size={5} defaultValue={params.sources}>
          {facets.sources.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-state">State</label>
        <select id="f-state" name="state" multiple size={5} defaultValue={params.states}>
          {facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-country">Country</label>
        <select id="f-country" name="country" defaultValue={params.country ?? ''}>
          <option value="">Any</option>
          <option value="us">United States</option>
          <option value="non-us">Non-US</option>
        </select>
        <p className="hint">Derived — the source data carries no country column.</p>
      </div>
      <div className="field">
        <label htmlFor="f-cat-min">Core-category score</label>
        <span className="range">
          <input id="f-cat-min" type="number" step="0.5" name="catMin" placeholder="min" defaultValue={params.catMin ?? ''} />
          <span className="range-sep" aria-hidden="true">–</span>
          <input type="number" step="0.5" name="catMax" placeholder="max" aria-label="max" defaultValue={params.catMax ?? ''} />
        </span>
        <p className="hint">
          Weighted count of core industrial codes — not a category name. A category-label column does not exist yet.
        </p>
      </div>
      <div className="field">
        <label htmlFor="f-q">Name or domain</label>
        <input id="f-q" type="search" name="q" defaultValue={params.q} />
      </div>
      <div className="toolbar-actions">
        <button type="submit" className="btn btn-primary">Apply</button>
        <a href={clearHref}>Clear</a>
      </div>
    </form>
  )
}
