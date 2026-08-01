// GATE:HUMAN — founder QA before deploy.
//
// The AI Search Survival Checklist: the asset /future-proof-your-seo/ has been
// promising since launch and never had (F-02). Delivered by /api/lead-magnet
// as a link, so it ships the instant someone submits the form.
//
// Constraints this file honors — don't break them without re-reading F-02:
//   - Sixty checks, one point each, split 18 / 14 / 12 / 16 across the four
//     sections the landing page publishes. The counts ARE the point totals.
//   - Content is derived from the framework already public on that page plus
//     the 42-signal probe rubric (lib/probe/score.mjs) — same rubric family.
//     No invented statistics; the thresholds that appear (title 15–60 chars,
//     meta 70–160, 300+ words, 5+ cited domains) come straight from it.
//   - noindex, and deliberately absent from lib/sitemap/registry.ts. It's a
//     gated asset, not a ranking page.
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Search Survival Checklist — 60 checks',
  description:
    'The 60-point self-audit for AI search: schema, content structuring, citation engineering, authority and monitoring, with a scoring sheet.',
  robots: { index: false, follow: false },
}

type Section = {
  num: string
  title: string
  points: number
  blurb: string
  items: string[]
}

const SECTIONS: Section[] = [
  {
    num: '01',
    title: 'Schema & structured data',
    points: 18,
    blurb:
      'The JSON-LD an engine parses before it decides what your page is about. One point per check.',
    items: [
      'Every template renders at least one JSON-LD block — product, category, article, home. View source and search for application/ld+json.',
      'Every JSON-LD block parses as valid JSON. One trailing comma silences the whole block, and nothing warns you.',
      'The main entity on each template declares a type engines recognize: Product, Article, Organization, FAQPage, HowTo.',
      'Product nodes carry name, image, description, and offers — the four that are required, not the ones your plugin happened to fill.',
      'Offers carry price, priceCurrency, and availability, and they match the price the page actually shows.',
      'Product nodes name a brand and carry an sku or mpn.',
      'AggregateRating or Review appears wherever real ratings exist — and nowhere they do not.',
      'Article and BlogPosting nodes carry headline, author, and datePublished.',
      'Those same nodes carry dateModified, image, and publisher.',
      'One Organization (or LocalBusiness) node states name, url, and logo.',
      'That Organization node also carries address, telephone, and a contactPoint.',
      'sameAs lists the profiles you actually control, and the business name on each one matches the site character for character.',
      'BreadcrumbList markup places every deep page in the hierarchy — category pages included, not just products.',
      'Category and listing pages expose ItemList or CollectionPage markup.',
      'FAQ blocks visible on the page are marked up as FAQPage, and nothing marked up is hidden from the reader.',
      'Two or more distinct entity types describe each page that matters — Product plus Organization plus BreadcrumbList, say.',
      'Every page declares a canonical URL, self-referencing unless the duplicate is deliberate.',
      'Open Graph title, description, and image are set. Several engines fall back to them when the JSON-LD is thin.',
    ],
  },
  {
    num: '02',
    title: 'Content structuring',
    points: 14,
    blurb:
      'Whether a machine can find the answer in your page without guessing. One point per check.',
    items: [
      'Exactly one H1 per page, and it states what the page is in words a buyer would use.',
      'Heading levels descend without skips. No H2 followed by an H4.',
      'Every block of copy sits under an H2 or H3. No unbroken walls of text.',
      'The first 40 words under each H2 answer the question that heading asks.',
      'At least one heading on the page is phrased the way a buyer would type it.',
      'The title tag runs 15–60 characters and leads with the thing, not the brand.',
      'The meta description runs 70–160 characters and states the outcome, not the category.',
      'Pages meant to rank carry enough substance to be worth quoting — roughly 300 words and up.',
      'Specs live in a real table or list, not a paragraph of comma-separated values.',
      'Long pages carry anchored subheadings and a table of contents that links to them.',
      'The visible text is in the HTML. View source, search for a sentence from the page, find it.',
      'A main or article landmark wraps the content, with a real header and footer around it.',
      'The document declares its language and a mobile viewport.',
      'Images carry alt text that describes the part, not the file name.',
    ],
  },
  {
    num: '03',
    title: 'Citation engineering',
    points: 12,
    blurb:
      'What makes a page quotable rather than merely findable. One point per check.',
    items: [
      'Each category page stands alone as a reference. Someone landing cold can use it without clicking further.',
      'Every term of art is named and defined once on the page, in one sentence an engine can lift whole.',
      'Comparison tables put your option beside the alternative, with units in the header row.',
      'Every number on the page carries a unit, a date, and a source.',
      'Claims that carry weight link out to the standard or the study. Across the site, five or more distinct domains.',
      'Definitions and spec answers are complete sentences that still make sense pulled out of context.',
      'Spec pages state what the part is not for. Engines quote constraints as readily as features.',
      'Every page says who published it and when it was last updated, in machine-readable form.',
      'robots.txt lets the AI crawlers in — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot — or blocks them knowingly, as a decision.',
      'Nothing you want quoted sits behind noindex, a login, or a cookie wall.',
      'An llms.txt at the root points crawlers at the pages you want quoted (llmstxt.org).',
      'Load-bearing facts read identically everywhere they appear. One number, one spelling, one address.',
    ],
  },
  {
    num: '04',
    title: 'Authority & monitoring',
    points: 16,
    blurb:
      'Why an engine trusts you, and how you would know if that changed. One point per check.',
    items: [
      'A named organization stands behind every page, in the footer and in the markup.',
      'Real contact detail is on the page: a phone number, plus an email or a postal address.',
      'About, contact, and team pages are reachable from the header or footer of every page.',
      'Named people with roles appear on the site, not a faceless "our team".',
      'Articles credit a named author with a bio and a link to their profile.',
      'Published and updated dates are visible to a reader and machine-readable to a crawler.',
      'Ratings and reviews, where they exist, are marked up and traceable to real customers.',
      'Privacy policy and terms are linked and current.',
      'Your profiles elsewhere point back, and the name, address, and phone match the site exactly.',
      'You track referring domains monthly and know which pages earned them.',
      'You track unlinked brand mentions and whether they are trending up over the last 90 days.',
      'You keep a query list — fifty or more — written the way buyers actually ask, not the way you would phrase it.',
      'You run that list through the AI answers on a fixed schedule, not when someone remembers.',
      'You record citation share against your three closest competitors, not just your own presence.',
      'You know which pages the AI crawlers fetch, from server logs rather than guesswork.',
      'One person owns the number: one monthly review, one written note on what changed and why.',
    ],
  },
]

const BANDS = [
  {
    range: '45 – 60',
    label: 'Manageable',
    body: 'Engines can read you. What is left is maintenance, not rescue. Clear the stragglers in the weakest section and move on to earning citations.',
  },
  {
    range: '30 – 44',
    label: 'Material risk',
    body: 'Enough is missing that engines have to guess, and they guess in favor of whoever guessed less. Fix the weakest section before you publish anything new.',
  },
  {
    range: 'Under 30',
    label: 'Severe risk',
    body: 'Anything you publish now gets read badly. Start with schema and structuring — nothing downstream pays back until a machine can parse the page.',
  },
]

/**
 * Print rules. Scoped to this route: the style element only exists while this
 * page is mounted, so hiding the site chrome here doesn't leak anywhere else.
 * Kept as raw CSS because the site header/footer sit outside this subtree and
 * no Tailwind variant can reach them.
 */
const PRINT_CSS = `
@media print {
  header, footer, nav { display: none !important; }
  .checklist-doc { padding: 0 !important; max-width: none !important; }
  .checklist-doc a { text-decoration: none; color: inherit; }
  .checklist-doc li, .checklist-doc section { break-inside: avoid; }
  .checklist-doc h2 { break-after: avoid; }
  .checklist-no-print { display: none !important; }
  @page { margin: 14mm; }
}
`

export default function AiSearchSurvivalChecklistPage() {
  const total = SECTIONS.reduce((sum, s) => sum + s.points, 0)

  return (
    <div className="bg-paper">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="checklist-doc mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 md:pt-20 lg:px-8">
        {/* ── Masthead ── */}
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Sale Solution · Self-audit
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-5xl">
          The AI Search Survival Checklist
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-700">
          Sixty checks across four sections. One point each, {total} points in
          total. An hour is enough for one site, and you finish with a number
          instead of a feeling.
        </p>

        {/* ── How to run it ── */}
        <div className="mt-10 border-t border-rule pt-8">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            How to run it
          </h2>
          <ol className="mt-4 space-y-2.5 text-ink-700">
            <li className="flex gap-3">
              <span className="font-mono text-[11px] tabular-nums text-ink-400">1</span>
              <span>
                Pick three pages that carry the money: your best category page,
                your best product or service page, and one article.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[11px] tabular-nums text-ink-400">2</span>
              <span>
                Score a point only when the check holds on all three. Partial
                credit is how sites talk themselves into a good number.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[11px] tabular-nums text-ink-400">3</span>
              <span>
                Tally each section in the scoring sheet at the end, then fix the
                weakest section first. Not the easiest one.
              </span>
            </li>
          </ol>
          <p className="mt-4 text-sm text-ink-500 checklist-no-print">
            Print this page or save it as a PDF (⌘P / Ctrl-P) — it lays out
            clean, one section per block.
          </p>
        </div>

        {/* ── The checks ── */}
        {SECTIONS.map((section) => (
          <section key={section.num} className="mt-14 border-t border-rule pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="font-display text-2xl font-semibold text-ink-900">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                  {section.num}
                </span>{' '}
                {section.title}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
                {`${section.points} points`}
              </span>
            </div>
            <p className="mt-2 text-ink-500">{section.blurb}</p>

            <ul className="mt-6 space-y-3">
              {section.items.map((item, i) => (
                <li key={item} className="flex items-start gap-3 border-t border-rule/60 pt-3">
                  <span
                    className="mt-1 h-3.5 w-3.5 shrink-0 border border-ink-400"
                    aria-hidden
                  />
                  <span className="font-mono text-[11px] tabular-nums leading-6 text-ink-400">
                    {`${section.num}.${String(i + 1).padStart(2, '0')}`}
                  </span>
                  <span className="flex-1 leading-relaxed text-ink-800">{item}</span>
                  <span className="font-mono text-[11px] tabular-nums leading-6 text-ink-400">
                    1 pt
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* ── Scoring sheet ── */}
        <section className="mt-14 border-t-2 border-ink-900 pt-8">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Scoring sheet
          </h2>
          <p className="mt-2 text-ink-500">
            One point per check that holds on all three pages. Write the section
            totals here.
          </p>

          <table className="mt-6 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule-strong">
                <th className="py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  Section
                </th>
                <th className="py-2 text-right font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  Available
                </th>
                <th className="py-2 text-right font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  Your score
                </th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((s) => (
                <tr key={s.num} className="border-b border-rule">
                  <td className="py-3 text-ink-800">
                    <span className="font-mono text-[11px] tabular-nums text-ink-400">
                      {s.num}
                    </span>{' '}
                    {s.title}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-ink-700">
                    {s.points}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-block h-6 w-16 border-b border-ink-400" aria-hidden />
                  </td>
                </tr>
              ))}
              <tr className="border-b-2 border-ink-900">
                <td className="py-3 font-display font-semibold text-ink-900">Total</td>
                <td className="py-3 text-right font-mono font-semibold tabular-nums text-ink-900">
                  {total}
                </td>
                <td className="py-3 text-right">
                  <span className="inline-block h-6 w-16 border-b border-ink-400" aria-hidden />
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="mt-10 font-display text-lg font-semibold text-ink-900">
            What your number means
          </h3>
          <ul className="mt-4 space-y-4">
            {BANDS.map((band) => (
              <li key={band.label} className="border-t border-rule pt-4">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink-900">
                    {band.range}
                  </span>
                  <span className="font-display text-base font-semibold text-ink-900">
                    {band.label}
                  </span>
                </div>
                <p className="mt-1.5 leading-relaxed text-ink-700">{band.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 leading-relaxed text-ink-700">
            One more read of the same number: any single section under half its
            points is your weakest link, whatever the total says. Fix that
            section before you add pages, because everything you publish
            inherits the gap.
          </p>
        </section>

        {/* ── Next step (soft, and only after the work) ── */}
        <section className="mt-14 border-t border-rule pt-8 checklist-no-print">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            If the number is worse than you expected
          </h2>
          <p className="mt-3 leading-relaxed text-ink-700">
            The checklist tells you what is missing. It will not tell you which
            gap is costing you the most — that depends on your catalog, your
            traffic mix, and what your competitors already fixed. That ranking
            is what the{' '}
            <Link
              href="/unlock-growth-audit/"
              className="font-medium text-brand-600 underline underline-offset-4"
            >
              Growth Audit
            </Link>{' '}
            does: six findings in order, one flagged as the constraint.
          </p>
          <p className="mt-4 text-sm text-ink-500">
            Questions about a specific check? Reply to the email that sent you
            here, or write to{' '}
            <a
              href="mailto:connect@salesolution.net"
              className="font-medium text-brand-600 underline underline-offset-4"
            >
              connect@salesolution.net
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
