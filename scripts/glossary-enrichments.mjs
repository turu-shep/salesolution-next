/**
 * M6 — attach interactive aids (enrichments) to the glossary terms that warrant
 * one, reusing the career-path enrichment framework (enrichments[] + the shared
 * tool registry). Sets interactiveAidStatus = 'built'.
 *
 * Idempotent + non-clobbering: a term that already has enrichments is left alone
 * (so operator edits in Studio survive). Patches PUBLISHED terms.
 *
 *   node scripts/glossary-enrichments.mjs           # dry run
 *   node scripts/glossary-enrichments.mjs --write   # commit
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'published',
})

const WRITE = process.argv.includes('--write')
let _k = 0
const key = () => `enr${(_k++).toString(36)}${Date.now().toString(36).slice(-3)}`

const tool = (toolKey, title, intro) => ({
  _type: 'enrichmentTool',
  _key: key(),
  toolKey,
  title,
  intro,
  placement: 'after-modules',
})

const CALC = (title, intro) => tool('ai-visibility-calculator', title, intro)
const SCORE = (title, intro) => tool('catalog-readiness-scorecard', title, intro)

// slug → enrichments[]
const MAP = {
  'ai-share-of-voice': [
    CALC(
      'Calculate your AI share of voice',
      'Run one fixed prompt set across the engines and count how often each brand is named. Your share of voice is your mentions over the category total. Plug in your own counts.',
    ),
  ],
  'ai-citation-tracking': [
    CALC(
      'Calculate your citation rate',
      'Across the prompts you tested, your citation rate is the share of answers that link you as a source. Enter your counts to see it beside your mention rate.',
    ),
  ],
  'ai-impression-share': [
    CALC(
      'Estimate your AI impression share',
      'Impression share is how often you appear at all across a prompt set. Enter mentions and prompts for your appearance rate, and add a competitor for share of voice.',
    ),
  ],
  'mention-rate-vs-citation-rate': [
    CALC(
      'Mention rate vs citation rate, on your numbers',
      'Mention rate is how often AI names you; citation rate is how often it links you as a source. Enter both and watch the gap between being known and being cited.',
    ),
  ],
  'ai-ready-product-catalog': [
    SCORE(
      "Score your catalog's AI-readiness",
      'Check what is true of your catalog today. The score weights each item by how much it affects whether AI engines can read and cite your SKUs, and surfaces the heaviest gaps first.',
    ),
  ],
  'crawlability-for-ai-bots': [
    SCORE(
      'Is your catalog reachable by AI crawlers?',
      'The first checks are crawlability: AI bots allowed, pages server-rendered, catalog public. Score your catalog and see the gaps that keep engines from reading it.',
    ),
  ],
}

const summary = []
for (const [slug, enrichments] of Object.entries(MAP)) {
  const id = `glossary-${slug}`
  const doc = await client.getDocument(id)
  if (!doc) {
    summary.push(`SKIP ${slug} (not published)`)
    continue
  }
  if (Array.isArray(doc.enrichments) && doc.enrichments.length > 0) {
    summary.push(`SKIP ${slug} (already has enrichments — not clobbering)`)
    continue
  }
  summary.push(`SET  ${slug} → ${enrichments.map((e) => e.toolKey).join(', ')}`)
  if (WRITE) {
    await client.patch(id).set({ enrichments, interactiveAidStatus: 'built' }).commit()
  }
}

console.log(summary.join('\n'))
console.log(`\n${WRITE ? 'WROTE' : 'DRY RUN'}: ${Object.keys(MAP).length} terms` + (WRITE ? '' : '  (--write to commit)'))
