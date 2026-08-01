# Dentist partner brief — `/strategy/offers/dentist/` — design spec

**Date:** 2026-07-25 · **Approved:** Artur, in-session (design approved; partner-voiced draft sequences approved as GATE:HUMAN drafts)
**Goal:** one gated internal page that gives the marketing partner everything needed to outreach US dental offices with the Revenue Engine offer — what we give, sell, and implement; who to target; what to say; what never to say; how the handoff to Artur works.

## Access model

- URL: `/strategy/offers/dentist/` (trailing slash — `next.config.ts` has `trailingSlash: true`).
- Gate, noindex, and robots-disallow are all inherited from `app/strategy/layout.tsx` (env: `SALES_ENABLED`, `SALES_PASSWORD`, `SALES_SESSION_SECRET`; cookie `strategy_auth`). The page contains **zero gate code** and does **not** re-declare `robots`.
- Sitemap inclusion is opt-in only (`lib/sitemap/registry.ts`); no exclusion work needed.

## Files

1. **`lib/strategy/docs/dentist-partner-brief.ts`** — `export const DENTIST_PARTNER_BRIEF_MD` markdown const, matching the nine existing `lib/strategy/docs/*.ts` modules.
2. **`app/strategy/offers/dentist/page.tsx`** — breadcrumb (`Strategy / Dentist partner brief`) + `<MarkdownDoc markdown={DENTIST_PARTNER_BRIEF_MD} />`; `export const metadata = { title: 'Dentist partner brief' }`. Pattern: `app/strategy/ceo/speach/blocks/page.tsx`.
3. **`app/strategy/page.tsx`** — append ONE `docs[]` card row (`href: '/strategy/offers/dentist/'`). File is git-modified by another workstream: **append-only**, no reordering or reformatting of existing rows.

**Frozen — must not be read as dependencies, imported, or modified:** `app/strategy/offers/page.tsx`, `components/strategy/OfferMirror.tsx`, `lib/strategy/offers/**`, `docs/handoff/offers/**`.

## Content — 12 sections

Every fact comes from the facts pack (recon 2026-07-25, saved in session scratchpad as `dentist-offer-facts-pack.md`), which carries repo `file:line` refs. Nothing invented; canonical numbers verbatim.

1. **How to use this / role split** — partner starts conversations and books the 20-minute Revenue Leak Audit; Artur runs the audit, writes the same-day rate in writing, closes, installs. "Booking, not closing."
2. **The offer** — five-stage dental install map (stage → concrete deliverable → tooling → outcome), installed by day 60 / proving by day 90, terms (3-month minimum, month-to-month after, client-owned ad accounts, zero markup), and the guarantee quoted verbatim exactly once with the never-paraphrase rule.
3. **Pricing** — explicit **public vs internal** split. Public/citable: the live "Installs start at $30,000. The exact number comes from the audit — in writing, same day." Internal context (never quoted in outreach): fee = max($30K, ~10% of audit-modeled 12-month recovery), never discount to fit, retainer $4–8K/mo starting month 4, the three signed option names. Rule: price talk beyond the published line is Artur's.
4. **Targeting** — Tier A (pitch: ≥~$1.5M collections, implant/cosmetic program) / Tier B (borderline) / Tier C (decline) with signals; decision-maker (owner decides, office manager steers phones); buy triggers; disqualifiers.
5. **Language** — the six verbatim pain lines; dental say/never-say lists ("new patients" not "leads", "patients" not "consumers"; kill-list words); no unexplained acronyms; no competitor names (banned list exists).
6. **Assets & claims** — live URL table (`/revenue-engine/dentists/#audit` = the conversion point; `/revenue-engine/`; `/industries/medical-aesthetics/`); what the WholeFlowLeak calculator computes; approved claims C-01, C-04, C-05, F-01 with their exact hedges. **NEVER list (binding):** no dental case study/testimonial exists — nothing may imply one; no `lib/stats.ts` numbers ($378M / 91% / ROI figures) on any Revenue Engine surface; no lead-count or ranking promises; the treatment-plan-acceptance stat (Henry Schein) is live on the page but NOT cleared for outreach; never name the active dental deal or the Plantation FL practice; never say "you can't get sued"; no fake deadlines.
7. **Motion & cadence** — 7-stage funnel (Dial → … → Won); 8 touches over ~15 working days (3 calls each with voicemail, 4 emails, 1 LinkedIn); the observed-leak honesty rule: only cite what you personally observed about *that* practice; the audit-pitch close verbatim.
8. **Copy bank (approved)** — founder-voiced opener, owner-direct leak line, hook, close, voicemail RE-VM1, email #1, breakup email — verbatim, labeled "written in Artur's first person; adapt attribution when sending as yourself."
9. **Partner-voiced sequences (DRAFTS — GATE:HUMAN)** — header states: not approved for sending until Artur signs off. Partner speaks as himself, names Artur as the operator who runs the audit. Derived from the approved copy + cadence; every prospect-specific fact is a `[SLOT: …]` (no pre-filled plausible data anywhere); obeys the honesty rule, compliance rails, and kill-list; humanizer-passed; person-to-person register; no link in email 1, audit link UTM'd in email 2 or 3.
10. **Compliance rails (non-negotiable)** — hand-dial only (no auto/power dialer, no AI-voice or prerecorded outbound, no ringless voicemail); 9am–7pm prospect local time; real caller ID, never spoof; DNC scrub for personal cells + internal DNC honored forever; do not record cold calls (FL is all-party); SMS only off written form consent + A2P 10DLC; admit it's a sales call if asked; exposure $500–$1,500 per violation. BAA wording gate: never assert "every tool has a BAA" until Artur confirms the list — use the documented fallback line.
11. **Objection quick sheet** — the nine dental objection/answer pairs (faithful, abbreviated).
12. **Status & open items** — no dental proof yet (first cohort candidate in pipeline, unnamed); BAA coverage list unconfirmed; C-06 pending claims-library row; pre-call scanner awaiting API keys; GHL not wired (form → HubSpot + Resend); June cold-call scripts predate the July pricing architecture — their "no setup cost, flat monthly" lines are superseded and must not be used.

### Adjudications (approved by Artur)

- **July pricing regime is current**; June script pricing lines marked dead in the brief.
- **Beautiful Smiles never named** anywhere in the brief.
- **C-06 marked not-for-outreach** despite being live on the public page.

## Voice

- Brief prose: operator register — terse, declarative, concrete, "X, not Y". Internal doc, light-mode design system.
- Outreach drafts (section 9): humanizer-passed, plain, outcome-first, zero kill-list words.

## Out of scope

- No edits to sales scripts, `.agents/product-marketing-context.md`, `AGENTS.md`, or any frozen mirror file.
- No git commits (branch carries unrelated in-flight work).
- No Sanity publishing. No re-scoping of compliance ownership for the partner motion — documented as an open item instead.

## Verification (definition of done)

- `npx tsc --noEmit` exits 0 with **zero** errors (baseline verified clean 2026-07-25 — the AGENTS.md note about pre-existing `lib/lead-form` Zod errors is stale).
- `pnpm lint` clean on changed files; `pnpm build` compiles; `pnpm test` passes (sitemap reconcile test walks `app/(site)/` only — unaffected).
- **Tables check:** verify `MarkdownDoc` (marked + `.article-body`) renders GFM tables acceptably; if not, restructure to lists. Check visually.
- Screenshot of the rendered page from the local dev server (webpack-pinned; recovery: `pkill -f "next dev"; rm -rf .next; pnpm dev`) — best effort via `npm i --no-save playwright` + `scripts/_visual-check.mjs`.
- Term capture: queue genuinely new domain terms via `node scripts/glossary-queue.mjs` per `prompts/_CONTEXT.md`; skip with a note if none qualify.

## Risks

- `app/strategy/page.tsx` is concurrently modified — append-only edit mitigates.
- Facts-pack transcription drift — implementer must re-verify every verbatim quote it embeds (guarantee, pain lines, claims, terms) against the source files before finalizing.
