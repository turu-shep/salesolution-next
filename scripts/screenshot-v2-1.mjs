import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3001'
const outDir = path.resolve('screenshots/v2-1')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

// Desktop full page
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
let p = await ctx.newPage()
await p.goto(`${baseUrl}/v2-1/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(800)
await p.screenshot({ path: path.join(outDir, 'v2-1-desktop-full.png'), fullPage: true })
console.log('✓ v2-1-desktop-full')

// Desktop sections (scroll positions)
const sections = ['v2-1-hero', 'v2-1-calculator', 'v2-1-grid', 'v2-1-activity', 'v2-1-case', 'v2-1-compare-faq', 'v2-1-final']
const ys = [0, 900, 1700, 2400, 3000, 3600, 4400]
for (let i = 0; i < sections.length; i++) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), ys[i])
  await p.waitForTimeout(250)
  await p.screenshot({ path: path.join(outDir, `${sections[i]}.png`) })
  console.log(`✓ ${sections[i]}`)
}

// Calculator interaction - try changing SKU count
await p.evaluate((y) => window.scrollTo({ top: 900, behavior: 'instant' }), 900)
await p.waitForTimeout(250)
try {
  const input = p.locator('input[type="number"]').first()
  await input.fill('25000')
  await p.waitForTimeout(400)
  await p.screenshot({ path: path.join(outDir, 'v2-1-calculator-25k.png') })
  console.log('✓ calculator-25k')

  await input.fill('75000')
  await p.waitForTimeout(400)
  await p.screenshot({ path: path.join(outDir, 'v2-1-calculator-75k.png') })
  console.log('✓ calculator-75k (enterprise active)')
} catch (e) {
  console.log('✗ calculator interaction —', e.message.split('\n')[0])
}

await p.close(); await ctx.close()

// Mobile full page
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
p = await ctx.newPage()
await p.goto(`${baseUrl}/v2-1/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(800)
await p.screenshot({ path: path.join(outDir, 'v2-1-mobile-full.png'), fullPage: true })
console.log('✓ v2-1-mobile-full')
await p.close(); await ctx.close()

await browser.close()
