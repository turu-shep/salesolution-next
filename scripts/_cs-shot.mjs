// Serial screenshot helper — ONE browser, desktop+mobile serially, then closes.
// Usage: node scripts/_cs-shot.mjs <label> [path]
import { chromium } from 'playwright'

const label = process.argv[2] || 'shot'
const urlPath = process.argv[3] || '/case-studies/'
const base = 'http://localhost:3000'

const browser = await chromium.launch({ headless: true })
try {
  for (const vp of [
    { n: 'desktop', w: 1440, h: 900 },
    { n: 'mobile', w: 390, h: 844 },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await page.goto(`${base}${urlPath}`, { waitUntil: 'networkidle' })
    // Dismiss the cookie banner if present so it doesn't obscure content.
    try {
      await page.getByRole('button', { name: /accept all/i }).click({ timeout: 1500 })
      await page.waitForTimeout(300)
    } catch {}
    await page.waitForTimeout(500)
    await page.screenshot({ path: `/tmp/${label}-${vp.n}.png`, fullPage: true })
    await ctx.close()
    console.log(`shot /tmp/${label}-${vp.n}.png`)
  }
} finally {
  await browser.close()
}
