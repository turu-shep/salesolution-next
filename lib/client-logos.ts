/**
 * Trust-strip client logos. URLs point at the WordPress media CDN during
 * the transition window — narrow `next.config.ts` remotePatterns + re-host
 * to /public or R2 before launch (see migration plan).
 */
const WP_CDN = 'https://salesolution.net/wp-content/themes/salesolution/images/logo'

export type ClientLogo = {
  name: string
  src: string
  alt: string
  width: number
  height: number
}

export const clientLogos: ClientLogo[] = [
  { name: 'Deventor',             src: `${WP_CDN}/deventor_logo.png`,            alt: 'Deventor',             width: 140, height: 40 },
  { name: 'Modern Wood Flooring', src: `${WP_CDN}/mwf-logo-green-transparent.png`, alt: 'Modern Wood Flooring', width: 140, height: 40 },
  { name: 'Northern Hydraulics',  src: `${WP_CDN}/nh-logo.png`,                  alt: 'Northern Hydraulics',  width: 140, height: 40 },
  { name: 'Hosebox',              src: `${WP_CDN}/hosebox-bogo.webp`,            alt: 'Hosebox',              width: 140, height: 40 },
  { name: 'Longhorn',             src: `${WP_CDN}/LONGHORN-logo.png`,            alt: 'Longhorn',             width: 140, height: 40 },
]
