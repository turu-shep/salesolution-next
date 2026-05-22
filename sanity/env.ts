/**
 * Typed access to Sanity environment variables.
 * Throws at module load if a required var is missing, so we fail fast
 * during build / dev rather than at runtime when a query fires.
 */

function assert(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing env var: ${name}. ` +
        `Set it in .env.local — see .env.local.example for the full list.`,
    )
  }
  return value
}

export const projectId = assert(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
)

export const dataset = assert(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'NEXT_PUBLIC_SANITY_DATASET',
)

// Pin to a dated API version per Sanity's recommendation.
// Bump deliberately when adopting new features. Don't auto-update.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'

export const studioUrl = '/studio'

// Server-only token for write operations (AI-generated drafts, migrations).
// NEVER prefix with NEXT_PUBLIC_ — it would leak to the browser.
export const writeToken = process.env.SANITY_API_WRITE_TOKEN

// Server-only token for reading drafts in preview mode.
export const readToken = process.env.SANITY_API_READ_TOKEN

// Server-only secret used to validate `/api/draft` preview links.
export const previewSecret = process.env.SANITY_PREVIEW_SECRET
