# Known-deliberate — do not report these as findings

Every one of these looks like a defect to a fresh reader and is a decision that was already made. Reporting them wastes a verify cycle and, worse, drags down the precision number that this program treats as the model signal.

Each entry has an escape hatch. The rule isn't "never mention this" — it's "clear this bar before you do."

---

**No Content-Security-Policy.** Documented trade-off with the reasoning in the code at [next.config.ts:60-68](../../../next.config.ts#L60-L68): gtag, GTM, Meta Pixel, HubSpot, and Calendly all inject inline and cross-origin scripts that would need per-vendor nonces, and a CSP that breaks tracking costs more than it buys on a marketing site.
*Report only if* you bring a concrete working policy — the actual directive list, the nonce strategy for each vendor, and what breaks. "Add a CSP" is not a finding.

**`X-XSS-Protection: 0`.** Correct and intentional. The header is deprecated and the legacy auditor it disables introduced its own vulnerabilities. Setting it to `0` is current best practice, not a missing value.

**Probe tokens are unsigned.** `lib/probe/token.ts` encodes the URL as base64url, and `HeroProbe.tsx` computes it client-side. Anyone can craft `/ai-readiness/<token>/` for any domain. That's what makes reports shareable, which is the growth mechanic. The controls are the IP and global caps, not the token.
*Report only if* you find a way to turn it into unbounded spend or a way to make it scan something the SSRF layer should have blocked.

**`/studio` has no app-level auth.** Sanity Studio authenticates against Sanity's own project membership. An extra gate in front would be redundant.

**No CTAs on `/glossary/` and `/career-paths/`.** Deliberate. Those are authority assets measured on referring domains and AI citations, not leads, and the traffic isn't expected to convert. "This page doesn't drive conversions" describes the strategy working.
*Never report* conversion-optimization findings on the learning hub.

**Career paths aren't recruiting.** No hiring framing, no rates page — "we don't hire from these paths." Absence of recruiting content is the policy.

**Manual Sanity publishing.** There is no HTML → Portable Text converter, so the content engine authors and QAs while publishing happens by hand in `/studio`. Known gap, deliberately unclosed. Don't propose writing the converter as an audit finding, and definitely don't write one.

**`pnpm dev` pinned to `--webpack`.** Not a stale config. Next 16 dev is flaky under load with Turbopack; the pin is the workaround.

**Rate limiting degrades to per-instance memory.** When `UPSTASH_REDIS_REST_URL`/`TOKEN` are unset, `lib/probe/gate-server.ts` falls back to in-memory counters and warns to the console once. Chosen so limiting never breaks the feature, and the warning keeps the degradation visible in Vercel logs.
*Report only if* you can show the fallback triggering in a configured production environment, or that global spend caps multiply by instance count in a way the warning doesn't cover.

**`seo-project/` is legacy but `seo-project/data/` is live.** The pre-engine SEO template is superseded; the `data/` directory is still the GSC baseline-comparison CSV location. Not dead code.

**Industrial-only copy on some pages.** The business is mid-pivot from industrial-only to multi-vertical, started 2026-06-14, and some pages and the tagline still read industrial-only. Tracked in `docs/strategy/multi-vertical-pivot/00-phase-plan.md`.
*Report only if* a specific page contradicts a shipped positioning decision — not as general "copy is inconsistent" observations.

**Sanity house rules** (`prompts/_CONTEXT.md`): default query perspective hides drafts, interlinked drafts need weak refs, new doc types must register in both `sanity/schemas/index.ts` and `sanity/structure.ts`, `createClient` imports from `next-sanity`. Report *violations* of these; the rules themselves aren't findings.

---

---

## Added by wave 1 triage (2026-07-24)

Seven of the ten wave-1 refutations died because the behaviour was already a recorded decision. Each one below cost a verify cycle; writing them down is what stops wave 2 paying again.

**CTA routing is per *motion*, not per page theme.** Three separate findings (F-081, F-083, F-086) all reported the same shape: a CTA whose label implies one destination and whose href goes somewhere else. In every case the routing is signed.
- `/industries/consumer-brands/` is a **sell-product** motion, and the sell-product door is `/book-growth-call/` — not the Revenue Leak Audit. The rebrand doc explicitly instructs scrubbing "Revenue Leak Audit" and the Guarantee from that page (`docs/strategy/multi-vertical-pivot/04-revenue-engine-rebrand.md`, "sell-product → Book a Growth Call").
- "Start with a Sprint" on the industrial pillar routes to `/book-growth-call/` by approved mock (§11 of the same doc ships the block verbatim, bridge line included), even though `/constraint-sprint/` exists and is sitemap-registered.
- The `?tier=standard|pro` links from `CatalogTiers` are specified verbatim in `docs/superpowers/specs/2026-05-24-catalog-ai-services-page-design.md:71-72`; the same spec's lead-form section deliberately asks for nothing but `showSkuCount`, so the unread param is spec-conformant.
*Report only if* you can point to a shipped positioning decision the routing now contradicts — never on the basis that the label and the href "feel" mismatched.

**`/industries/medical-aesthetics/` mounts the dental form on purpose.** `vertical="dental"` there is the shipped *fix* for a logged bug, not the bug: `medical-dental-offer-spec.md:301` records the real defect as the page rendering `<AuditCTA />` with no vertical at all (contractor wording, home-services submission) and prescribes the dental mount as the remedy.
*Report only if* the med-spa lead record is provably unusable downstream — not because the two verticals share a form.

**BAA / HIPAA language on `/revenue-engine/dentists/` is deliberate.** `docs/handoff/2026-06/23/revenue-engine-elevation.md:115` — "BAA/HIPAA language is intentionally KEPT here — that buyer expects it (per the claims library)" — and the pillar-elevation strategy strips it everywhere else on purpose.
*Report only if* a specific claim on the page is one the business cannot actually honour; the presence of the language is not itself the finding.

**The probe gate cookie is a UX nudge, not a security boundary.** `lib/probe/gate.mjs:7-8` says so in the code: "incognito evades it, which is fine because the per-IP limits in limits.mjs are the backstop." So read-then-write races on the run counter (F-061) are out of scope by design — same posture as the unsigned-token entry above.
*Report only if* you can turn the race into unbounded **spend**, i.e. past the per-IP and global caps, not merely into extra free runs.

**AI crawlers are allowed site-wide on purpose, including the report space.** `app/robots.ts` opens the site to the named AI crawlers, and `/ai-readiness/[token]/` re-scores on every open so a shared link never expires (`page.tsx:16-22`). Crawlers wandering that token space is the cost of the growth mechanic (F-080).
*Report only if* you can show it converts into unbounded spend or an indexing problem that outweighs the citation upside — note that **F-094** is the row where unbounded probe spend actually landed, and it cleared this bar.

---

## Adding to this list

When phase 2 refutes a finding because the behavior turned out to be intentional, add it here with the reason and the escape hatch. The list gets more valuable every wave, and it's the main lever for improving precision — a model can't avoid reporting a deliberate decision it was never told about.

**Pattern worth naming after wave 1:** the recurring refutation shape was *"CTA label disagrees with its destination."* Four of ten refutations were that. The lenses had `baseline/funnels.md` (which lists those mismatches as flags) but not the signed decisions behind them. If a future wave audits funnel routing, give it `docs/strategy/multi-vertical-pivot/04-revenue-engine-rebrand.md` up front.
