/**
 * Canonical numbers shown across home, services, and lead-gen funnels.
 * Locked 2026-05-19 to the services-page set (the most comprehensive).
 *
 * The current WordPress site has drift between pages — see
 * docs/strategy/10-risks-and-open-questions.md §"Stat inconsistencies".
 * Single source of truth → everywhere consistent.
 */

export type Stat = { value: string; label: string }

export const headlineStats: Stat[] = [
  { value: '$378M', label: 'Revenue driven for clients' },
  { value: '91%',   label: 'Client retention rate' },
  { value: '2.5x',  label: 'Average ROI in 12 months' },
  { value: '96',    label: 'Net Promoter Score' },
]

export const supplementaryStats: Stat[] = [
  { value: '5.2x',   label: 'Average client ROI' },
  { value: '$575k',  label: 'Annual ARR added per client' },
]

export const allStats: Stat[] = [...headlineStats, ...supplementaryStats]
