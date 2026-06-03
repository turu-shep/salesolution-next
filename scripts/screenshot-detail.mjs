#!/usr/bin/env node
/**
 * Section screenshots — scroll-and-shoot viewport approach.
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3001'
const outDir = path.resolve('screenshots/details-r1')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const SHOTS = [
  { name: 'services-index_top',     url: '/services/',                                      scrollY: 0 },
  { name: 'services-index_grid',    url: '/services/',                                      scrollY: 700 },
  { name: 'services-index_grid2',   url: '/services/',                                      scrollY: 1400 },
  { name: 'services-index_shapes',  url: '/services/',                                      scrollY: 2200 },
  { name: 'services-index_pick',    url: '/services/',                                      scrollY: 3100 },
  { name: 'services-index_combine', url: '/services/',                                      scrollY: 3900 },
  { name: 'catalog-ai_hero',        url: '/services/catalog-ai/',                           scrollY: 0 },
  { name: 'catalog-ai_tiers',       url: '/services/catalog-ai/',                           scrollY: 1400 },
  { name: 'catalog-ai_beyond_where',url: '/services/catalog-ai/',                           scrollY: 2300 },
  { name: 'catalog-ai_delivers',    url: '/services/catalog-ai/',                           scrollY: 3300 },
  { name: 'editorial_hero',         url: '/services/editorial-authority/',                  scrollY: 0 },
  { name: 'editorial_formats',      url: '/services/editorial-authority/',                  scrollY: 1100 },
  { name: 'editorial_pricing',      url: '/services/editorial-authority/',                  scrollY: 3300 },
  { name: 'ai-seo_hero',            url: '/services/ai-seo/',                               scrollY: 0 },
  { name: 'ai-seo_pricing',         url: '/services/ai-seo/',                               scrollY: 3500 },
  { name: 'webdev_pricing',         url: '/services/website-development-design-services/',  scrollY: 3800 },
  { name: 'outbound_pricing',       url: '/services/outbound-email-marketing-services/',    scrollY: 3000 },
  { name: 'fgo_hero',               url: '/services/full-growth-ownership/',                scrollY: 0 },
  { name: 'fgo_shapes',             url: '/services/full-growth-ownership/',                scrollY: 1100 },
  { name: 'fgo_included',           url: '/services/full-growth-ownership/',                scrollY: 2000 },
]

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})

let lastUrl = null
let page = null
for (const shot of SHOTS) {
  try {
    if (shot.url !== lastUrl) {
      if (page) await page.close()
      page = await ctx.newPage()
      await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(400)
      lastUrl = shot.url
    }
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), shot.scrollY)
    await page.waitForTimeout(200)
    const file = path.join(outDir, `${shot.name}.png`)
    await page.screenshot({ path: file })
    console.log(`✓ ${shot.name}`)
  } catch (err) {
    console.log(`✗ ${shot.name} — ${err.message.split('\n')[0]}`)
  }
}
if (page) await page.close()
await ctx.close()
await browser.close()
