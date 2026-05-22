#!/usr/bin/env node
/**
 * Publish every draft in the dataset. Optional follow-up after the migration
 * scripts when you trust the auto-converted bodies and want them live.
 *
 *   node --env-file=.env.local docs/strategy/scripts/publish-all-drafts.mjs --dry
 *   node --env-file=.env.local docs/strategy/scripts/publish-all-drafts.mjs --confirm
 *
 * Filter to specific types with --type=post,guide.
 *
 * Implementation: for each draft `drafts.X`, we duplicate to `X` (the
 * published copy) and delete the draft. This is the standard Sanity
 * "publish" mutation expressed as raw API calls.
 */

import { createClient } from '@sanity/client'

const DRY_RUN = process.argv.includes('--dry')
const CONFIRMED = process.argv.includes('--confirm')
const typeArg = process.argv.find((a) => a.startsWith('--type='))
const TYPES = typeArg
  ? typeArg.replace('--type=', '').split(',')
  : ['post', 'guide', 'careerPath']

if (!DRY_RUN && !CONFIRMED) {
  console.error('This script PUBLISHES every draft for the given types.')
  console.error('Re-run with --dry to preview, or --confirm to proceed for real.')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

const typeFilter = TYPES.map((t) => `'${t}'`).join(',')
const drafts = await client.fetch(
  `*[_type in [${typeFilter}] && _id in path('drafts.**')]{ _id, _type, title, "slug": slug.current }`,
)

console.log(`Found ${drafts.length} draft(s) across types: ${TYPES.join(', ')}`)
if (DRY_RUN) {
  for (const d of drafts) console.log(`  • ${d._type.padEnd(12)} ${d.slug}`)
  console.log('\n(dry run — nothing published)')
  process.exit(0)
}

let ok = 0
let failed = 0
for (const d of drafts) {
  const publishedId = d._id.replace(/^drafts\./, '')
  try {
    // Fetch the draft body, build a published version with the same fields,
    // then delete the draft in a single transaction.
    const fullDraft = await client.getDocument(d._id)
    if (!fullDraft) {
      throw new Error('draft vanished mid-publish')
    }

    const published = { ...fullDraft, _id: publishedId }
    delete published._rev
    delete published._updatedAt
    delete published._createdAt

    await client
      .transaction()
      .createOrReplace(published)
      .delete(d._id)
      .commit()

    console.log(`  ✓ ${d._type.padEnd(12)} ${d.slug}`)
    ok++
  } catch (err) {
    console.error(`  ✗ ${d._type.padEnd(12)} ${d.slug} — ${err.message}`)
    failed++
  }
}

console.log(`\nDone. published=${ok} failed=${failed}`)
