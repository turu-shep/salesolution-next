#!/usr/bin/env node
/** Mobile full-page screenshots for responsive review. */
import { chromium, devices } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3001'
const outDir = path.resolve('screenshots/mobile-r1')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const PAGES = [
  { name: 'services-index',        url: '/services/' },
  { name: 'ai-seo',                url: '/services/ai-seo/' },
  { name: 'catalog-ai',            url: '/services/catalog-ai/' },
  { name: 'editorial-authority',   url: '/services/editorial-authority/' },
  { name: 'website-dev',           url: '/services/website-development-design-services/' },
  { name: 'outbound-email',        url: '/services/outbound-email-marketing-services/' },
  { name: 'full-growth-ownership', url: '/services/full-growth-ownership/' },
]

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  ...devices['iPhone 14'],
  reducedMotion: 'reduce',
})

for (const p of PAGES) {
  const page = await ctx.newPage()
  try {
    await page.goto(`${baseUrl}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true })
    console.log(`✓ ${p.name}`)
  } catch (err) {
    console.log(`✗ ${p.name} — ${err.message.split('\n')[0]}`)
  } finally {
    await page.close()
  }
}
await ctx.close()
await browser.close()
