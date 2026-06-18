/**
 * Seed the industry taxonomy and backfill existing case-study clients.
 *
 * Usage: node scripts/seed-industries.mjs
 *
 * Idempotent: createOrReplace-es the three top-level industry documents with
 * stable _ids, then PATCHES each existing client to point `industryRef` at
 * industrial-distribution. The patch sets ONLY industryRef — it never touches
 * publicName / disclosure / internalNotes, so the Northern Hydraulics naming
 * hazard recorded in seed-case-studies.mjs stays frozen.
 *
 * Sub-niches (fluid power, automation, fasteners) are intentionally NOT created
 * here — Phase B is the foundation; sub-niche modelling is Phase D. The legacy
 * `industry` string on each client is the source for that later backfill.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ── Env ─────────────────────────────────────────────────────────────────
const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = env.NEXT_PUBLIC_SANITY_DATASET
const token = env.SANITY_API_WRITE_TOKEN
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'

if (!projectId || !dataset || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const slug = (s) => ({ _type: 'slug', current: s })
const ref = (id) => ({ _type: 'reference', _ref: id })

// ── Top-level industries ──────────────────────────────────────────────────
const INDUSTRIAL_ID = 'industry-industrial-distribution'

const industries = [
  {
    _id: INDUSTRIAL_ID,
    _type: 'industry',
    title: 'Industrial Distribution & Technical B2B',
    shortLabel: 'Industrial',
    slug: slug('industrial-distribution'),
    hubHref: '/services/',
    description:
      'Mid-market industrial distributors and equipment manufacturers with large SKU catalogs, losing ground in organic and AI search.',
    order: 10,
  },
  {
    _id: 'industry-home-services',
    _type: 'industry',
    title: 'Home Services',
    shortLabel: 'Home Services',
    slug: slug('home-services'),
    hubHref: '/revenue-engine/home-services/',
    description:
      'Local home-services contractors — roofing-forward, plus HVAC, plumbing and the trades — that lose revenue to missed calls and slow follow-up.',
    order: 20,
  },
  {
    _id: 'industry-dental',
    _type: 'industry',
    title: 'Dental Practices',
    shortLabel: 'Dental',
    slug: slug('dental'),
    hubHref: '/revenue-engine/dentists/',
    description:
      'Single-location and multi-location dental practices that want every call answered, booked, and followed up — with HIPAA handled.',
    order: 30,
  },
]

// ── Existing clients to backfill (all industrial today) ────────────────────
const clientIds = [
  'caseStudyClient-hydraulics',
  'caseStudyClient-automation',
  'caseStudyClient-fasteners',
  'caseStudyClient-fluid-power',
]

const isMain = process.argv[1]?.endsWith('seed-industries.mjs')
if (isMain) {
  const mutations = [
    ...industries.map((doc) => ({ createOrReplace: doc })),
    // Scoped patch — set industryRef ONLY, leave every other field untouched.
    ...clientIds.map((id) => ({
      patch: { id, set: { industryRef: ref(INDUSTRIAL_ID) } },
    })),
  ]

  const res = await fetch(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    },
  )

  const json = await res.json()
  if (!res.ok) {
    console.error('Mutation failed:', JSON.stringify(json, null, 2))
    process.exit(1)
  }
  console.log(`Seeded ${industries.length} industries + backfilled ${clientIds.length} clients:`)
  for (const r of json.results ?? []) console.log(`  ${r.operation ?? 'upsert'} ${r.id}`)
}
