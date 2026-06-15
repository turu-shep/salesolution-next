import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3001'
const outDir = path.resolve('screenshots/v2-1-deep')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const p = await ctx.newPage()
await p.goto(`${baseUrl}/v2-1/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(800)

const sections = [
  { name: 'activity', text: /Always-on growth function/i },
  { name: 'case', text: /Northern Hydraulics/i },
  { name: 'case-methodology', text: /Methodology/i, scrollOffset: 100 },
  { name: 'calculator-explainer', text: /How the ongoing cost is calculated/i },
  { name: 'hero-artifact', text: /BEFORE/i },
]

for (const s of sections) {
  try {
    const el = p.getByText(s.text).first()
    await el.scrollIntoViewIfNeeded()
    await p.waitForTimeout(250)
    if (s.scrollOffset) await p.evaluate((y) => window.scrollBy({ top: y, behavior: 'instant' }), s.scrollOffset)
    await p.waitForTimeout(150)
    await p.screenshot({ path: path.join(outDir, `${s.name}.png`) })
    console.log(`✓ ${s.name}`)
  } catch (e) {
    console.log(`✗ ${s.name} — ${e.message.split('\n')[0]}`)
  }
}

// Click the calculator's collapsed explainer to open it
try {
  const explainer = p.getByText(/How the ongoing cost is calculated/i).first()
  await explainer.scrollIntoViewIfNeeded()
  await p.waitForTimeout(200)
  await explainer.click()
  await p.waitForTimeout(300)
  await p.screenshot({ path: path.join(outDir, 'calculator-explainer-open.png') })
  console.log('✓ calculator-explainer-open')
} catch (e) {
  console.log('✗ explainer-open —', e.message.split('\n')[0])
}

// Click the case study methodology to open it
try {
  const meth = p.getByText(/Methodology \+ methodology disclaimer/i).first()
  await meth.scrollIntoViewIfNeeded()
  await p.waitForTimeout(200)
  await meth.click()
  await p.waitForTimeout(300)
  await p.screenshot({ path: path.join(outDir, 'case-methodology-open.png') })
  console.log('✓ case-methodology-open')
} catch (e) {
  console.log('✗ methodology-open —', e.message.split('\n')[0])
}

await p.close()
await ctx.close()
await browser.close()
