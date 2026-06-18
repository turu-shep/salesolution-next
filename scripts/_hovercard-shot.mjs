// Temp visual-QA helper for the glossary hovercard (gitignored dep).
// ONE browser, serial. Captures: desktop body (affordance), desktop hovercard,
// mobile bottom sheet. Usage: node scripts/_hovercard-shot.mjs [slug] [outDir]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const slug = process.argv[2] || 'ai-share-of-voice'
const outDir = process.argv[3] || '/tmp/glossary-shots'
const url = `http://localhost:3000/glossary/${slug}/`
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const log = (m) => console.log(m)

// Strip dev-only chrome (Next dev-tools indicators) + dismiss the consent banner
// so screenshots show the real component, not dev/first-visit furniture.
async function dismissChrome(page) {
  await page.addStyleTag({
    content:
      'nextjs-portal,[data-nextjs-toast],[data-next-badge-root],[data-next-badge],#__next-build-watcher{display:none!important}',
  }).catch(() => {})
  for (const label of ['Accept all', 'Accept non-essential']) {
    const btn = page.getByRole('button', { name: label })
    if (await btn.count().then((c) => c > 0).catch(() => false)) {
      await btn.first().click({ timeout: 1000 }).catch(() => {})
      break
    }
  }
  await page.waitForTimeout(150)
}

// ── Desktop ──────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await dismissChrome(page)

  const term = page.locator('a.gloss-term').first()
  const count = await page.locator('a.gloss-term').count()
  log(`desktop: ${count} gloss-term link(s) found`)
  await term.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${outDir}/desktop-body.png` })
  log(`  saved desktop-body.png`)

  try {
    await term.hover()
    await page.waitForSelector('[role="tooltip"]', { timeout: 3000 })
    await page.waitForTimeout(250)
    await page.screenshot({ path: `${outDir}/desktop-hover.png` })
    log(`  saved desktop-hover.png`)
  } catch (e) {
    log(`  ! desktop hovercard did not appear: ${e.message}`)
  }
  await ctx.close()
}

// ── Mobile (coarse pointer → bottom sheet) ──────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await dismissChrome(page)

  const term = page.locator('a.gloss-term').first()
  await term.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  try {
    await term.tap()
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 })
    await page.waitForTimeout(250)
    await page.screenshot({ path: `${outDir}/mobile-sheet.png` })
    log(`  saved mobile-sheet.png`)
  } catch (e) {
    log(`  ! mobile sheet did not appear: ${e.message}`)
  }
  await ctx.close()
}

await browser.close()
log('done')
