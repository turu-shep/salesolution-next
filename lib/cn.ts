/**
 * Minimal class-name combiner. No clsx/tailwind-merge for v1 — string concat
 * is fine for a marketing site. Add tailwind-merge later if class conflicts
 * become a real problem (so far they haven't).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
