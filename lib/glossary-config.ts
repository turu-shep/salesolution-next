/**
 * Glossary indexing policy. Kept in its own dependency-free module so both the
 * glossary hub route and app/sitemap.ts can import it.
 *
 * The sitemap is built to fail soft (a Sanity outage or unconfigured env still
 * yields a valid sitemap), so it must NOT statically import anything that pulls
 * the Sanity client — sanity/env.ts throws at module load when env vars are
 * missing. This file imports nothing, so it's safe everywhere.
 */

/**
 * Below this many published terms the /glossary/ hub stays out of the index AND
 * out of the sitemap — a thin, mostly-empty glossary is a quality-signal cost.
 * Per-term pages are always indexable on their own. Shared by the hub route
 * (its noindex gate) and the sitemap (hub inclusion) so the two never disagree.
 */
export const GLOSSARY_INDEX_THRESHOLD = 15
