import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://salesolution.net'
const OUT_ROOT = path.resolve(import.meta.dirname, '..', 'screenshots')

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
  { name: 'tablet-768',   width: 768,  height: 1024, isMobile: false, deviceScaleFactor: 2 },
  { name: 'mobile-375',   width: 375,  height: 812, isMobile: true,  deviceScaleFactor: 2 },
]

const URLS = [
  '/',
  '/services/',
  '/services/ai-seo/',
  '/services/content-writing-services/',
  '/services/website-content-writing-packages/',
  '/services/website-development-design-services/',
  '/services/outbound-email-marketing-services/',
  '/contact-me/',
  '/unlock-growth-audit/',
  '/future-proof-your-seo/',
  '/book-growth-call/',
  '/constraint-sprint/',
  '/category/blog/',
  '/generative-engine-optimization-basic-to-advanced/',
  '/guides/',
  '/guide/website-launch-checklist-series-part-1-seo-and-crawling/',
  '/career-paths/',
  '/service-areas/',
]

function urlToFilename(url) {
  if (url === '/') return 'home'
  return url.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '--')
}

async function dismissCookieBanner(page) {
  const candidates = [
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("Agree")',
    'button:has-text("I agree")',
    'button:has-text("Got it")',
    'button:has-text("OK")',
    '#cmplz-cookybox-allow-all',
    '.cmplz-btn.cmplz-accept',
    'button.cmplz-accept',
    '[data-cmplz="accept"]',
  ]
  for (const sel of candidates) {
    try {
      const btn = page.locator(sel).first()
      if (await btn.isVisible({ timeout: 500 })) {
        await btn.click({ timeout: 1500 })
        await page.waitForTimeout(400)
        return true
      }
    } catch {}
  }
  return false
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0
      const step = 400
      const timer = setInterval(() => {
        const before = window.scrollY
        window.scrollBy(0, step)
        total += step
        if (window.scrollY === before || total >= document.body.scrollHeight + 2000) {
          clearInterval(timer)
          window.scrollTo(0, 0)
          resolve()
        }
      }, 100)
    })
  })
  await page.waitForTimeout(600)
}

const results = { ok: [], failed: [] }

const browser = await chromium.launch()
try {
  for (const vp of VIEWPORTS) {
    const outDir = path.join(OUT_ROOT, vp.name)
    await fs.mkdir(outDir, { recursive: true })

    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile,
      userAgent:
        vp.isMobile
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    })

    const page = await ctx.newPage()
    page.setDefaultNavigationTimeout(60000)
    page.setDefaultTimeout(10000)

    for (const url of URLS) {
      const full = BASE + url
      const file = path.join(outDir, urlToFilename(url) + '.png')
      const tag = `[${vp.name}] ${url}`
      try {
        await page.goto(full, { waitUntil: 'domcontentloaded', timeout: 60000 })
        try { await page.waitForLoadState('networkidle', { timeout: 8000 }) } catch {}
        await dismissCookieBanner(page)
        await autoScroll(page)
        await page.screenshot({ path: file, fullPage: true, animations: 'disabled' })
        const stat = await fs.stat(file)
        console.log(`✓ ${tag}  ${(stat.size / 1024).toFixed(0)} KB`)
        results.ok.push({ viewport: vp.name, url, file, bytes: stat.size })
      } catch (err) {
        console.log(`✗ ${tag}  ${err.message}`)
        results.failed.push({ viewport: vp.name, url, error: err.message })
      }
    }

    await ctx.close()
  }
} finally {
  await browser.close()
}

await fs.writeFile(
  path.join(OUT_ROOT, '_capture-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, viewports: VIEWPORTS.map(v => v.name), results }, null, 2)
)

console.log(`\nDone. ok=${results.ok.length} failed=${results.failed.length}`)
console.log(`Report: ${path.join(OUT_ROOT, '_capture-report.json')}`)
