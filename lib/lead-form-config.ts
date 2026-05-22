/**
 * Shared field config for every lead form on the site.
 * Centralizing here means revenue ranges + platform options + the
 * frustration list stay consistent across funnels — which the WordPress
 * site failed at (small wording drift across pages).
 */

export const REVENUE_RANGES = [
  { value: 'under-100k', label: 'Under $100k / month' },
  { value: '100k-250k',  label: '$100k – $250k / month' },
  { value: '250k-500k',  label: '$250k – $500k / month' },
  { value: '500k-1m',    label: '$500k – $1M / month' },
  { value: '1m-2m',      label: '$1M – $2M / month' },
  { value: '2m-5m',      label: '$2M – $5M / month' },
  { value: '5m-plus',    label: 'Over $5M / month' },
] as const

export type RevenueRange = (typeof REVENUE_RANGES)[number]['value']

export const PLATFORMS = [
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'shopify',     label: 'Shopify' },
  { value: 'magento',     label: 'Magento / Adobe Commerce' },
  { value: 'custom',      label: 'Custom / headless' },
  { value: 'other',       label: 'Other' },
] as const

export type Platform = (typeof PLATFORMS)[number]['value']

export const FRUSTRATIONS = [
  { value: 'declining-organic',  label: 'Organic traffic is declining' },
  { value: 'ai-overviews',       label: 'AI Overviews are eating clicks' },
  { value: 'plateaued',          label: 'Growth has plateaued' },
  { value: 'low-conversions',    label: 'Traffic is fine, conversions aren’t' },
  { value: 'ppc-rising',         label: 'PPC costs keep rising' },
  { value: 'content-not-ranking',label: 'Content output isn’t ranking' },
  { value: 'agency-attribution', label: 'Multiple agencies, no attribution' },
  { value: 'technical-debt',     label: 'Site speed / technical debt' },
  { value: 'launching',          label: 'Launching a new store' },
  { value: 'other',              label: 'Other / not sure yet' },
] as const

export type Frustration = (typeof FRUSTRATIONS)[number]['value']

/**
 * Lead-magnet form fields for the AI Search Survival Checklist page.
 * Separate config because the field set is different (no name/phone — email
 * + risk-quiz inputs).
 */
export const ORGANIC_PERCENTAGES = [
  { value: 'under-25', label: 'Under 25%' },
  { value: '25-50',    label: '25 – 50%' },
  { value: '50-75',    label: '50 – 75%' },
  { value: 'over-75',  label: 'Over 75%' },
] as const

export const TRAFFIC_TYPES = [
  { value: 'informational', label: 'Mostly informational (blogs, guides)' },
  { value: 'transactional', label: 'Mostly transactional (product, category)' },
  { value: 'mixed',         label: 'Mixed' },
] as const

export const TIMELINES = [
  { value: '0-6',   label: 'Within 6 months' },
  { value: '6-12',  label: '6 – 12 months' },
  { value: '12-24', label: '12 – 24 months' },
] as const
