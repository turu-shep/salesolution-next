// Hand-maintained status annotations for the Offer dashboard.
// NOT generated — update as fixes land. 'done' renders half-gray + checkmark;
// 'in-progress' renders an amber chip + the note. Ids: F-xx findings, D-xx/DD-xx drift rows, PF-n perception fix ranks, U-xx grade rows.

export type ItemStatus = { state: 'done' | 'in-progress'; note: string }

export const STATUS: Record<string, ItemStatus> = {
  // --- Findings (stage 1) ---
  'F-01': {
    state: 'in-progress',
    note: 'Queued P0 — Task 11.1.1. Fact-ledger resolution already decided; executes on founder go.',
  },
  'F-02': {
    state: 'done',
    note: 'Fixed 2026-07-27 — checklist funnel wired end-to-end (asset staged behind GATE:HUMAN QA), instant delivery email + per-funnel acknowledgments with honest windows on all previously-silent funnels. Deploy pending; founder QA on the checklist asset before it ships.',
  },
  'F-03': {
    state: 'done',
    note: 'Fixed 2026-07-27 — founder decision: only the $30K floor + Catalog AI per-SKU stay published. All other price figures removed, published-pricing claim replaced with floor-honest framing, sprint machinery retired incl. /constraint-sprint (308 → /book-growth-call/), catalog turnaround aligned to 2 business days.',
  },
  'F-04': {
    state: 'done',
    note: 'Fixed 2026-07-26 — identity sweep (25 files, from SSOT): IT Sale Solution LLC (FL) d/b/a Salesolution, PH42 address, connect@ only; Delaware/Kings Point/Sunny Isles at zero. Ops left: deploy, forward retired inboxes to connect@, Vercel RESEND_* envs, Sunbiz DBA check.',
  },
  'F-05': {
    state: 'in-progress',
    note: 'Terms templating spec exists (03 Task 6 D/E); runs with the 11.2 copy program.',
  },
  'F-06': {
    state: 'done',
    note: 'Fixed 2026-07-27 — false absolutes removed (probe, banner, opt-out), CCPA SLAs scoped per request type (45d access/deletion · 15bd opt-out), capture copy honest-light, legal dates bumped. Old-list campaign decision recorded with FTC/CCPA note — ops, off-repo.',
  },
  'F-07': {
    state: 'done',
    note: 'Fixed 2026-07-28 — founder decision: 120-day cost-recovery guarantee (install + fees, from signing, work-free remedy), book-jobs only; sell-product keeps no-guarantee with an honest cycle/control rationale. Old day-90 line retired everywhere.',
  },
  'F-08': {
    state: 'in-progress',
    note: 'Task 11.2.7 — regenerate llms.txt + Organization JSON-LD from the registry.',
  },
  'F-09': { state: 'in-progress', note: 'Umbrella-lede re-scope adopted (D-28); confirm at 11.3.6.' },
  'F-10': {
    state: 'in-progress',
    note: 'Queued P0 — Task 11.1.3: gate/delete previews, stop rendering unsigned presets.',
  },
  'F-11': {
    state: 'in-progress',
    note: 'Stat band closed as approved (D-29); three real strays queued — 11.1.4.',
  },
  'F-12': {
    state: 'in-progress',
    note: 'Door widening rides 11.2 (FD4 floor + persona fork + metadata regen); sprint anchor removed from the door 2026-07-27.',
  },
  'F-13': { state: 'in-progress', note: 'Counsel decision — 11.3.5.' },
  'F-14': {
    state: 'in-progress',
    note: 'Proof roadmap = 03 Task 5.2; Liori consent recorded (scoped). Long lead.',
  },
  'F-15': { state: 'in-progress', note: 'FD6 signed: 12 everywhere. Taxonomy sweep 11.2.6.' },
  'F-16': {
    state: 'in-progress',
    note: 'Sell→Convert rename rides 11.2.6; moot if previews die in 11.1.3.',
  },
  'F-17': {
    state: 'in-progress',
    note: 'SSOT slogan wiring in 11.2.7; wordmark sweep with the 11.2 copy program.',
  },
  'F-18': {
    state: 'in-progress',
    note: 'Waiting on founder call 11.3.1 — G5, the canonical audit URL.',
  },
  'F-19': {
    state: 'in-progress',
    note: '7 is the attested number (D-16); single-source sweep queued.',
  },
  'F-20': { state: 'in-progress', note: 'Queued P0 — Task 11.1.8 hygiene sweep.' },
  'F-21': { state: 'in-progress', note: 'Queued P0 — Task 11.1.7, deletion list extended.' },
  'F-22': {
    state: 'in-progress',
    note: 'Queued P0 — Task 11.1.10: FooterSwitch, thank-yous, dead refs.',
  },
  'F-23': {
    state: 'done',
    note: 'Closed 2026-07-28 — the guarantee denominator is now "everything you have paid" (knowable to the buyer without a published fee); floor published, exact number in the SOW.',
  },
  'F-24': {
    state: 'in-progress',
    note: 'Blog relaunch pack ready — docs/handoff/new-blog/. Runs as its own gated program.',
  },
  'F-25': {
    state: 'in-progress',
    note: 'Queued P0 — Task 11.1.11: one vertical field across forms.',
  },
  'F-26': { state: 'in-progress', note: 'Probe door fork filed new; rides the 11.2 door pass.' },

  // --- Drift mismatches (stage 2) ---
  'D-01': { state: 'in-progress', note: 'Blocked on 11.0 ratification (FD1).' },
  'D-02': {
    state: 'done',
    note: 'Executed 2026-07-27 with founder amendment: floor stays published (11.3.2 answered). Catalog AI survives per canon.',
  },
  'D-03': {
    state: 'done',
    note: 'Sprint rung retired 2026-07-27 — route deleted + redirected, anchors removed, ladder is install-first.',
  },
  'D-04': {
    state: 'done',
    note: 'Founder call 11.3.2 ANSWERED 2026-07-27: the $30K install floor stays published; everything else goes to the SOW.',
  },
  'D-05': {
    state: 'done',
    note: 'Superseded 2026-07-28 — FD3 revised by founder: guarantee returns as 120-day cost recovery on book-jobs; enablement-only drafts moot.',
  },
  'D-06': {
    state: 'done',
    note: 'One coherent split shipped 2026-07-28: book-jobs guaranteed (120-day payback), sell-product reasoned by cycle length + counter control. The fee-hidden taunt retired.',
  },
  'D-07': { state: 'in-progress', note: 'Blocked on 11.0 (FD4); then ICP + SSOT patch.' },
  'D-08': { state: 'in-progress', note: 'Blocked on 11.0 (FD5); reopens IND-2.' },
  'D-09': { state: 'in-progress', note: 'Blocked on 11.0 (FD6); live six-stragglers listed in 05.' },
  'D-10': { state: 'in-progress', note: 'Blocked on 11.0 (FD7); homepage FLOW-1 re-check included.' },
  'D-11': {
    state: 'in-progress',
    note: 'Task 11.2.7 — machine layer becomes a build step with an owner.',
  },
  'D-12': {
    state: 'done',
    note: 'Capture-copy-first satisfied 2026-07-27 — new captures warmable post-deploy. Founder decision on pre-existing list recorded on F-06.',
  },
  'D-13': { state: 'in-progress', note: 'Ship 03 Task 6 D/E with the 11.2 program.' },
  'D-14': { state: 'in-progress', note: 'Rename in previews — or moot if 11.1.3 deletes them.' },
  'D-15': { state: 'in-progress', note: '11.2.7 slogan wiring + wordmark sweep.' },
  'D-16': { state: 'in-progress', note: 'Use 7 — queued with the credentials sweep.' },
  'D-17': { state: 'in-progress', note: 'Queued P0 — 11.1.4 (signed ARCH-3 + three new strays).' },
  'D-18': {
    state: 'in-progress',
    note: 'Fix already applied in the working tree, uncommitted — commit + deploy (11.1.6).',
  },
  'D-19': { state: 'in-progress', note: 'Queued P0 — 11.1.10.' },
  'D-20': { state: 'in-progress', note: 'Queued P0 — 11.1.7.' },
  'D-21': {
    state: 'in-progress',
    note: 'Copy fix rides 11.2 (live ~20-min + same-day written number).',
  },
  'D-22': { state: 'done', note: 'Superseded by D-02\'s removal sweep — nothing left to harmonize.' },
  'D-23': { state: 'in-progress', note: 'Queued P0 #1 — 11.1.1.' },
  'D-24': { state: 'in-progress', note: 'Founder call 11.3.4 — sign C-07/C-08 or go qualitative.' },
  'D-25': { state: 'in-progress', note: 'Founder call 11.3.1 (G5).' },
  'D-26': {
    state: 'done',
    note: 'Fixed 2026-07-26 — founder call 11.3.3 answered; identity sweep executed and verified (tsc/build/tests clean, rendered pages checked). Ops follow-ups tracked on F-04.',
  },
  'D-27': { state: 'in-progress', note: 'Counsel — 11.3.5.' },
  'D-28': { state: 'in-progress', note: 'Recommendation adopted; confirm at 11.3.6.' },
  'D-29': { state: 'done', note: 'Closed — stat band is approved canon (ARCH-4); no action.' },
  'D-30': {
    state: 'done',
    note: 'Closed — deliberate motion rule; optional explainer sentence filed in 11.2.',
  },
  'D-31': { state: 'done', note: 'Closed — minor phrasing nudge folded into 11.2.6.' },
  'D-32': { state: 'done', note: 'Closed — folded into D-05.' },
  'D-33': { state: 'done', note: 'Closed — recorded; the next Phase-B run carries 62 routes.' },

  // --- Deploy divergences (stage 2) ---
  'DD-01': { state: 'in-progress', note: 'Ready: deploy the current title + GSC recrawl (11.1.9).' },
  'DD-02': { state: 'in-progress', note: 'Rides 11.1.3 preview gating + preset sign-off.' },
  'DD-03': { state: 'done', note: 'Negative result — confirms D-11\'s routing; no action.' },
  'DD-04': { state: 'in-progress', note: 'Freshness signals + recrawl requests, with DD-01.' },
  'DD-05': { state: 'done', note: 'Noise class — collector already annotates these; no action.' },

  // --- Perception fix list (stage 3) ---
  'PF-1': {
    state: 'in-progress',
    note: 'Needs founder logins (Clutch/Crunchbase/ZoomInfo/LinkedIn); new blurbs can be drafted now.',
  },
  'PF-2': { state: 'in-progress', note: '= DD-01; executes on founder go.' },
  'PF-3': { state: 'in-progress', note: '= Task 11.2.7.' },
  'PF-4': { state: 'in-progress', note: 'Blog pack ready to run — docs/handoff/new-blog/.' },
  'PF-5': { state: 'in-progress', note: 'Queued in 11.4 — entity hardening.' },
  'PF-6': { state: 'in-progress', note: 'Long lead — rides the Task 5.2 proof roadmap.' },
  'PF-7': { state: 'in-progress', note: 'Removal request can be sent anytime.' },
  'PF-8': { state: 'in-progress', note: '= F-01 / 11.1.1 — blocks outreach scaling.' },

  // --- Grade rows (stage 2) ---
  'U-09': {
    state: 'done',
    note: 'Resolved 2026-07-28 by founder decision: 120-day cost-recovery guarantee on book-jobs; delivery-control reasoning lives on as the sell-product rationale.',
  },
  'U-42': { state: 'done', note: 'Delivered: docs/handoff/new-blog/01-prompt-blog-relaunch.md.' },
  'U-43': { state: 'done', note: 'Answered + adopted as D-28 / 11.3.6.' },
  'U-44': {
    state: 'done',
    note: 'Sprint/pilot mentions removed sitewide 2026-07-27; install-first everywhere.',
  },
}
