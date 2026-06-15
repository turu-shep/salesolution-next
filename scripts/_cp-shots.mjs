// Single-browser, serial screenshots for the career-path / glossary visual review.
// Legible crops: viewport-height hero shots + element crops of the new sections.
// Usage: node scripts/_cp-shots.mjs <round>
import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const round = process.argv[2] || 'r1'
const base = 'http://localhost:3000'
const outDir = path.resolve(`screenshots/cp-review-${round}`)
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

async function shoot({ name, url, w, h, full, viewportAt, element }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 2, reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  try {
    await page.goto(`${base}${url}`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(400)
    if (element) {
      const el = page.locator(element).first()
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      await el.screenshot({ path: path.join(outDir, `${name}.png`) })
    } else {
      if (viewportAt) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), viewportAt)
        await page.waitForTimeout(200)
      }
      await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: !!full })
    }
    console.log(`OK ${name}`)
  } catch (e) {
    console.log(`FAIL ${name} — ${e.message.split('\n')[0]}`)
  }
  await page.close()
  await ctx.close()
}

// Desktop legible crops (deviceScaleFactor 2 → crisp)
await shoot({ name: 'geo_hero',   url: '/career-paths/geo-specialist/', w: 1440, h: 980, viewportAt: 0 })
await shoot({ name: 'geo_matrix', url: '/career-paths/geo-specialist/', w: 1440, h: 980, element: 'section:has(#at-each-level)' })
await shoot({ name: 'geo_buyer',  url: '/career-paths/geo-specialist/', w: 1440, h: 980, element: 'section:has(#hiring-this-role)' })
await shoot({ name: 'geo_terms',  url: '/career-paths/geo-specialist/', w: 1440, h: 980, element: 'section:has(h3:has-text("Key terms in this path")) , section:has(p:has-text("Key terms in this path"))' })
await shoot({ name: 'geo_mobile', url: '/career-paths/geo-specialist/', w: 390, h: 844, full: true })
await shoot({ name: 'term_top',   url: '/glossary/ai-share-of-voice/', w: 1440, h: 980, viewportAt: 0 })
await shoot({ name: 'hub_top',    url: '/glossary/', w: 1440, h: 980, viewportAt: 0 })

await browser.close()
console.log('out:', outDir)
