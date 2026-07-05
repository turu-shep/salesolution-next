# Prompt 4 — Medical & aesthetics pillar + dentists niche: offer + wording

Paste below the line into a fresh Claude Code session. Prefix with `ultracode` for depth.
Run after the offer-architecture prompt (read its output if it exists).

---

You are researching the highest-converting offer and wording for Sale Solution's medical
vertical: `/industries/medical-aesthetics/` (pillar) and `/revenue-engine/dentists/` (the
one live niche — and the best conversion page on the site; improve it, don't flatten it).
I'm the founder. Deliverable: an offer spec + wording kit.

**Read first:** `prompts/offer-research/01-offer-audit-2026-07-05.md`,
`docs/strategy/offer-research/00-offer-architecture.md` (if present — it wins on prices),
`.agents/product-marketing-context.md`, the live pages
`app/(site)/industries/medical-aesthetics/page.tsx` and
`app/(site)/revenue-engine/dentists/page.tsx`, and — critically —
`lib/strategy/niches/briefs.generated.ts` (slug `dental`): it holds VERIFIED stats that
never made it onto the page (~32% of dental calls unanswered / 14% leave voicemail —
Reach; a missed new-patient call worth up to ~$8K lifetime — Peerlogic/Dandy; case
acceptance ~45% avg vs 75% top; 25–40% of active base overdue; implant $3–6K, All-on-4
~$15K). Your first job is deciding which of these go on-page and where.

**The buyer:** practice owner. Front desk is chairside when the phone rings; treatment
plans presented once and never chased; recall overdue. HIPAA is a hard requirement (BAAs
on every tool). Book-jobs rules: day-90 guarantee, "I" voice, Revenue Leak Audit CTA,
exact rate in the audit. Anti-persona: won't sign BAAs.

**Research:**
1. **Which sub-niches support the $30K+ install.** Cosmetic/implant-leaning dental
   (avg case $5K, All-on-4 $15K) plausibly clears a 10x model on 2–6 recovered cases;
   general/hygiene practices may not. Same analysis for med spa, ortho, plastic surgery,
   derm (avg treatment values, patient LTV, no-show and recall economics — sourced from
   2024–26 industry data: ADA HPI, Dental Intelligence, AAO, AmSpa for med spa). Output a
   qualification tier: which practice profiles get the $30K concentrated install pitched,
   which get the standard install, which we decline.
2. **The install, concentrated.** For a practice, what's live by week 2 / day 30 / day 60
   (call answering during chair time, plan-follow-up sequences with financing framing,
   recall reactivation off their own list, PMS write-back scoping)? Design the 2-month
   version and its guarantee interaction.
3. **The 10x join on the dentists page.** It already has the fee slider + "clears the fee
   in the first N cases" + do-nothing chart — the site's best pattern. Sharpen it: should
   the fee slider become the real install+monthly numbers? Where do the verified brief
   stats slot in (the $8K missed-call LTV belongs beside the calculator's missed-call
   input)? The calculator presets are GATE:HUMAN illustrative — propose sourced
   replacements I can sign off.
4. **Pillar-specific fixes.** The medical pillar's calculator defaults ($1,200 first-year
   value) undersell its own $6,000-case timeline — reconcile. NOTE ALSO a live bug you
   should flag in the deliverable (fix separately): the pillar renders `<AuditCTA />`
   without `vertical="dental"`, so the close reads contractor wording and the form
   submits the wrong vertical.
5. **Trust for a $30K medical ask.** HIPAA proof (already strong), financing framing
   (practices think in monthly payments — does the install price itself get a financed
   presentation?), the front-desk-replacement fear (answered additively), and what
   dental-marketing incumbents (SMC-type programs at $30–60K/yr) do that we should
   counter-position against — without naming them in copy.
6. **Claims expansion.** 3–5 new sourced stats for the claims library (no-show costs,
   unscheduled-treatment pool sizes, recall lapse rates). URL + date + GATE:HUMAN. C-06
   (treatment-plan acceptance %) stays qualitative until you source it properly — try.
7. **The improved condition (Weiss value anchor — governs the fee, see the architecture
   doc).** Practices are valued on collections/EBITDA multiples in an active DSO
   acquisition market (source 2024–26 practice-transition data): recovered recall, higher
   case acceptance, and answered phones lift the practice's sale value directly, not just
   this year's production. The fee is a fraction of that condition — floor $30K+, scaled
   to practice size and case mix. Draft the three-options proposal for this vertical
   (options named by the condition they buy), and note where the financing framing
   presents the install itself as a monthly figure without commoditizing it.

**Wording kit (voice: "I", plain language, HIPAA woven not shouted, financing framing,
kill-list enforced; humanizer pass on every block):**
- Pillar: 3 hero options, joined leak-math block, guarantee-against-price restatement,
  5 objection rewrites (front desk, HIPAA, PMS, "we tried an answering service",
  "$30K vs my current marketing budget" — use the 5–8%-of-gross guidance as the frame).
- Dentists page: surgical edits only — where each verified stat lands, the sharpened
  payback line, the close ("That guarantee has my name on it" stays), and the
  install-price presentation if architecture says show it.

**Deliverable → `docs/strategy/offer-research/medical-dental-offer-spec.md`:** qualification
tiers + offer table, sourced number bank (GATE:HUMAN), wording kits for both pages,
page-maps, and the med-spa niche brief outline (next niche candidate). Constraints: no
fabricated proof; HIPAA claims stay plain-language and legally conservative; the day-90
guarantee wording changes only with my sign-off.
