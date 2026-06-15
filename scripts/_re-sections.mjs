import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

// Full-res per-section element captures (desktop). One browser, serial.
const baseUrl = process.argv[2] || 'http://localhost:3000'
const tag = process.argv[3] || 'r2'
const outDir = path.resolve('screenshots/revenue-engine', `${tag}-sections`)
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const ids = ['leak', 'engine', 'system', 'prove', 'pricing', 'guarantee', 'audit']

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const p = await ctx.newPage()
await p.goto(`${baseUrl}/revenue-engine/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(600)

for (const id of ids) {
  try {
    const el = p.locator(`#${id}`)
    await el.scrollIntoViewIfNeeded()
    await p.waitForTimeout(150)
    await el.screenshot({ path: path.join(outDir, `${id}.png`) })
    console.log(`✓ ${id}`)
  } catch (e) {
    console.log(`✗ ${id} — ${e.message.split('\n')[0]}`)
  }
}

await p.close(); await ctx.close()
await browser.close()
console.log('done →', outDir)
