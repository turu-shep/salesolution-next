import { DEFAULT_VIEW } from '@/lib/columns.mjs'
import type { SheetParams } from '@/lib/contacts'

/**
 * A plain GET form, so filter state lives in the URL and the export can be
 * handed the same query string. The hidden `view` input keeps the current lens
 * through a filter apply — a GET submit replaces the whole query string.
 */
export function Filters({
  params,
  facets,
}: {
  params: SheetParams
  facets: { states: string[]; sources: string[] }
}) {
  return (
    <form method="get" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', margin: '0 0 14px' }}>
      {params.view !== DEFAULT_VIEW ? <input type="hidden" name="view" value={params.view} /> : null}
      <label>
        <div className="muted">Source / brand</div>
        <select name="source" multiple size={5} defaultValue={params.sources}>
          {facets.sources.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <div className="muted">State</div>
        <select name="state" multiple size={5} defaultValue={params.states}>
          {facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>
        <div className="muted">Country</div>
        <select name="country" defaultValue={params.country ?? ''}>
          <option value="">Any</option>
          <option value="us">United States</option>
          <option value="non-us">Non-US</option>
        </select>
        <div className="muted" style={{ maxWidth: 210 }}>Derived — the source data carries no country column.</div>
      </label>
      <label>
        <div className="muted">Core-category score</div>
        <input type="number" step="0.5" name="catMin" placeholder="min" defaultValue={params.catMin ?? ''} style={{ width: 70 }} />
        <input type="number" step="0.5" name="catMax" placeholder="max" defaultValue={params.catMax ?? ''} style={{ width: 70 }} />
        <div className="muted" style={{ maxWidth: 240 }}>
          Weighted count of core industrial codes — not a category name. A category-label column does not exist yet.
        </div>
      </label>
      <label>
        <div className="muted">Name or domain</div>
        <input type="search" name="q" defaultValue={params.q} />
      </label>
      <button type="submit">Apply</button>
    </form>
  )
}
