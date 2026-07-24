# Baseline — live page vitals (production)

**Measured:** 2026-07-24 against `https://salesolution.net` (the deployed build — note local `main` is 8 commits ahead; production does NOT yet include probe v2 / latest homepage work) · Lighthouse 13.4.0 via DataForSEO `on_page_lighthouse`, desktop, simulated throttling · **Measured by:** fable-5 (phase 0)

| Page | Perf | A11y | Best-Pract | SEO | LCP (ms) | CLS | TBT (ms) | Total weight |
|---|---|---|---|---|---|---|---|---|
| `/` | **78** | 94 | 77 | 100 | **4,194** | 0.054 | 13 | 2.06 MB |
| `/services/` | 98 | 96 | 77 | 100 | 871 | n/r | n/r | 2.19 MB |
| `/revenue-engine/` | 100 | 96 | 77 | 100 | 613 | n/r | 25 | 2.05 MB |
| `/case-studies/` | 100 | 97 | 77 | 100 | 552 | n/r | 3 | 2.05 MB |
| `/glossary/` | 99 | 96 | 77 | 100 | 740 | n/r | n/r | 2.06 MB |
| `/book-growth-call/` | 99 | 96 | 77 | 100 | 761 | 0.003 | n/r | **5.95 MB** |
| `/unlock-growth-audit/` | 97 | 97 | 77 | 100 | 1,185 | 0.048 | n/r | 2.05 MB |
| `/future-proof-your-seo/` | 100 | 96 | 77 | 100 | 621 | n/r | 4 | 2.05 MB |

n/r = not returned in the reduced API response for that run.

## Read of the numbers

- **Homepage LCP 4.19s is the single worst vital on the site** (desktop, no CPU throttle — mobile will be worse). FCP was 470ms and speed index 1,051ms, so paint starts fast; something late becomes the LCP element. Interactive also 4.2s. Lens F starts here.
- **SEO 100 on all eight pages.** The company sells search; the basics hold.
- **Best-practices pinned at 77 on every page** — uniform, so it's the shared stack, not page code: third-party cookies / console noise from GTM, HubSpot, Meta, LinkedIn, Doubleclick (all detected on every page).
- **`/book-growth-call/` weighs 5.95 MB** — the Calendly embed drags Wistia, Sentry, ZoomInfo, navattic, ketch/Optanon along. Scores stay green because it loads late, but this is the money page on a phone in a warehouse office.
- **~2.05 MB floor on every page** — shared JS + tag stack; matches the 1.3 MB first-party shared bundle in `bundle.md` plus vendors.
- A11y 94–97 per Lighthouse vs. serious axe findings in `a11y.md` — Lighthouse samples fewer rules; axe's color-contrast findings are the real list.
- Server: response time ~13ms, network-server-latency 233–850ms across runs. Fine.
- Agentic-browsing category (new in LH 13): 0.99–1.0 everywhere — AI-agent browsability is healthy, consistent with the GEO positioning.

Third-party entities detected on **every** page: Google Tag Manager, HubSpot (+ usemessages.com, hsappstatic.net), Facebook, LinkedIn Ads, Google/Doubleclick Ads. On `/book-growth-call/` additionally: Calendly, Wistia, navattic, ctfassets, ketch (consent), Optanon (consent), ZoomInfo, Sentry. Two consent providers on one page is a lens B question.
