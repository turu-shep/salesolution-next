import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3001'
const outDir = path.resolve('screenshots/homepage-detail')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const page = await ctx.newPage()
await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(800)

// Scroll the ServicesTabs heading into view via selector
const heading = page.getByText(/Six services\./i).first()
await heading.scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(outDir, 'home-services-tabs-top.png') })
console.log('✓ home-services-tabs-top')

// Scroll down ~700 to show tab content
await page.evaluate(() => window.scrollBy({ top: 700, behavior: 'instant' }))
await page.waitForTimeout(200)
await page.screenshot({ path: path.join(outDir, 'home-services-tabs-content.png') })
console.log('✓ home-services-tabs-content')

// Scroll to the FGO callout
const fgoCallout = page.getByText(/Need all five coordinated under one operator/i).first()
await fgoCallout.scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(outDir, 'home-fgo-callout.png') })
console.log('✓ home-fgo-callout')

// Click each tab and screenshot
const TAB_LABELS = ['Catalog AI', 'Editorial Authority', 'Website Development', 'Outbound Email', 'AI Search & GEO']
for (const label of TAB_LABELS) {
  try {
    await heading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await page.getByRole('tab', { name: new RegExp(label, 'i') }).first().click()
    await page.waitForTimeout(250)
    // Scroll down a touch so tab content + artifact are visible
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'instant' }))
    await page.waitForTimeout(150)
    await page.screenshot({ path: path.join(outDir, `tab-${label.toLowerCase().replace(/\W+/g,'-')}.png`) })
    console.log(`✓ tab-${label}`)
  } catch (e) {
    console.log(`✗ tab-${label} — ${e.message.split('\n')[0]}`)
  }
}

await page.close()
await ctx.close()
await browser.close()
