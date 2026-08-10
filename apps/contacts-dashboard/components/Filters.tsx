import { BUSINESS_TYPES, DEFAULT_VIEW, businessTypeLabel } from '@/lib/columns.mjs'
import type { Facets, SheetParams } from '@/lib/contacts'

/**
 * A plain GET form, so filter state lives in the URL and the export can be
 * handed the same query string. The hidden `view` input keeps the current lens
 * through a filter apply — a GET submit replaces the whole query string. The
 * Clear link is the same mechanism in reverse: a bare navigation to the
 * current lens with every filter dropped — the new brands/sizes/btype params
 * included, since nothing survives a bare href.
 *
 * Two different questions, two filters (Task 13 B): "Brands / lines carried"
 * is what the company stocks (brand_tokens, from its line card); "Captured
 * from" is which list WE found the row in (provenance). The old "Source /
 * brand" label conflated them and misled the founder — never merge them back.
 */
export function Filters({
  params,
  facets,
}: {
  params: SheetParams
  facets: Facets
}) {
  const clearHref = params.view === DEFAULT_VIEW ? '/' : `/?view=${params.view}`
  return (
    <form method="get" className="toolbar">
      {params.view !== DEFAULT_VIEW ? <input type="hidden" name="view" value={params.view} /> : null}
      <div className="field">
        <label htmlFor="f-brands">Brands / lines carried</label>
        <select id="f-brands" name="brands" multiple size={5} defaultValue={params.brands}>
          {facets.brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <p className="hint">What the company stocks, from its line-card data.</p>
      </div>
      <div className="field">
        <label htmlFor="f-source">Captured from</label>
        <select id="f-source" name="source" multiple size={5} defaultValue={params.sources}>
          {facets.sources.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <p className="hint">Provenance — the public list we captured the row from.</p>
      </div>
      <div className="field">
        <label htmlFor="f-state">State</label>
        <select id="f-state" name="state" multiple size={5} defaultValue={params.states}>
          {facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-sizes">Est. size</label>
        <select id="f-sizes" name="sizes" multiple size={5} defaultValue={params.sizes}>
          {facets.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="hint">Our estimate from public signals, not the company&rsquo;s figure.</p>
      </div>
      <div className="field">
        <label htmlFor="f-btype">Type (est.)</label>
        <select id="f-btype" name="btype" defaultValue={params.btype ?? ''}>
          <option value="">Any</option>
          {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{businessTypeLabel(t)}</option>)}
        </select>
        <p className="hint">Estimated from the company&rsquo;s own listings and declarations.</p>
      </div>
      <div className="field">
        <label htmlFor="f-hide-small">Small shops</label>
        <label className="check">
          <input id="f-hide-small" type="checkbox" name="hideSmall" value="1" defaultChecked={params.hideSmall} />
          {' '}Hide small shops
        </label>
        <p className="hint">Excludes the smallest single-location shops (our size estimate).</p>
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
