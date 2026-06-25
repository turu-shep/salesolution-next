import { defineField, defineType } from 'sanity'

/**
 * Pre-call lead — one local-service prospect, scanned for the leaks you open a
 * cold call on. The store for the automated pre-call scanner
 * (scripts/precall-scan.mjs): the script seeds `queued` leads (from a CSV or
 * auto-pulled from the Google Business Profile database), then on a daily cron
 * scans the next 100, writing the findings + a ready opener back here. The
 * /sales cockpit reads `status == "scanned"` docs to populate the pre-call card.
 *
 * NOT customer-facing — internal sales-ops data. `cid` (the Google listing id)
 * is the dedup key so a lead is never scanned twice.
 */
export const precallLead = defineType({
  name: 'precallLead',
  title: 'Pre-call lead',
  type: 'document',
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────
    defineField({ name: 'name', title: 'Business name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'cid',
      title: 'Google CID',
      type: 'string',
      description: 'Google Business listing id — the dedup key. A lead with the same cid is never re-seeded.',
    }),
    defineField({ name: 'placeId', title: 'Place ID', type: 'string' }),
    defineField({
      name: 'vertical',
      title: 'Vertical',
      type: 'string',
      options: {
        list: [
          { title: 'Dental', value: 'dental' },
          { title: 'Medical / aesthetics', value: 'medical' },
          { title: 'Home services', value: 'home-services' },
          { title: 'Local retail', value: 'local-retail' },
          { title: 'Other', value: 'other' },
        ],
      },
      description: 'Maps to a /sales cockpit track.',
    }),
    defineField({ name: 'category', title: 'GBP category', type: 'string' }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'region', title: 'Region/State', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'website', title: 'Website', type: 'url' }),

    // ── Scan state ────────────────────────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Queued (not yet scanned)', value: 'queued' },
          { title: 'Scanned', value: 'scanned' },
          { title: 'Error', value: 'error' },
        ],
      },
      initialValue: 'queued',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: { list: [{ title: 'CSV import', value: 'csv' }, { title: 'Auto (GBP search)', value: 'auto' }] },
    }),
    defineField({ name: 'scannedAt', title: 'Scanned at', type: 'datetime' }),
    defineField({ name: 'scanError', title: 'Scan error', type: 'string', description: 'Populated when status = error.' }),

    // ── Findings (the synthesized output the rep reads) ───────────────────
    defineField({
      name: 'primaryLeak',
      title: 'Primary leak',
      type: 'string',
      description: 'The single sharpest seam — what the opener leads with.',
    }),
    defineField({
      name: 'opener',
      title: 'Opener',
      type: 'text',
      rows: 3,
      description: 'The ready-to-say cold open, built from the primary leak + vertical.',
    }),
    defineField({
      name: 'leaks',
      title: 'Leaks found',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'leak',
          fields: [
            { name: 'type', type: 'string', title: 'Type' },
            {
              name: 'severity',
              type: 'string',
              title: 'Severity',
              options: { list: ['high', 'med', 'low'] },
            },
            { name: 'finding', type: 'text', rows: 2, title: 'Finding' },
          ],
          preview: { select: { title: 'type', subtitle: 'finding' } },
        },
      ],
    }),
    defineField({ name: 'notes', title: 'Caveats', type: 'text', rows: 2, description: 'Data caveats (e.g. a placeholder rating that should not be trusted).' }),

    // ── Raw scan signals (kept so a finding is always traceable) ──────────
    defineField({
      name: 'gbp',
      title: 'GBP snapshot',
      type: 'object',
      fields: [
        { name: 'rating', type: 'number', title: 'Rating' },
        { name: 'reviews', type: 'number', title: 'Reviews' },
        { name: 'photos', type: 'number', title: 'Photos' },
        { name: 'hasWebsite', type: 'boolean', title: 'Has website' },
        { name: 'claimed', type: 'boolean', title: 'Claimed' },
        { name: 'hoursStatus', type: 'string', title: 'Hours status' },
        { name: 'ratingTrusted', type: 'boolean', title: 'Rating trusted', description: 'False when the API returned a placeholder rating.' },
      ],
    }),
    defineField({
      name: 'competitors',
      title: 'Dominant neighbors',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'competitor',
          fields: [
            { name: 'name', type: 'string', title: 'Name' },
            { name: 'rating', type: 'number', title: 'Rating' },
            { name: 'reviews', type: 'number', title: 'Reviews' },
          ],
          preview: { select: { title: 'name', subtitle: 'reviews' } },
        },
      ],
    }),
    defineField({
      name: 'mapPack',
      title: 'Local map-pack',
      type: 'object',
      fields: [
        { name: 'keyword', type: 'string', title: 'Keyword tested' },
        { name: 'rank', type: 'number', title: 'Rank (null = not in pack)' },
      ],
    }),
    defineField({
      name: 'site',
      title: 'Website scan',
      type: 'object',
      fields: [
        { name: 'perfScore', type: 'number', title: 'Performance (0–1)' },
        { name: 'lcpMs', type: 'number', title: 'LCP (ms)' },
        { name: 'ttfbMs', type: 'number', title: 'Server response (ms)' },
        { name: 'totalBytes', type: 'number', title: 'Page weight (bytes)' },
        { name: 'cms', type: 'string', title: 'Stack/CMS' },
      ],
    }),
    defineField({
      name: 'ai',
      title: 'AI-search presence',
      type: 'object',
      fields: [
        { name: 'keyword', type: 'string', title: 'Prompt tested' },
        { name: 'named', type: 'boolean', title: 'Named by AI' },
        { name: 'competitorsNamed', type: 'array', of: [{ type: 'string' }], title: 'Competitors named instead' },
      ],
    }),
    defineField({
      name: 'owner',
      title: 'Owner (Apollo)',
      type: 'object',
      fields: [
        { name: 'name', type: 'string', title: 'Name' },
        { name: 'title', type: 'string', title: 'Title' },
        { name: 'email', type: 'string', title: 'Email' },
        { name: 'phone', type: 'string', title: 'Direct phone' },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', leak: 'primaryLeak', status: 'status', city: 'city' },
    prepare: ({ title, leak, status, city }) => ({
      title: title,
      subtitle: status === 'scanned' ? `${leak ?? 'no leak'} · ${city ?? ''}` : `[${status}] ${city ?? ''}`,
    }),
  },
})
