/**
 * Home § 02 instrument — the Seam Diagram.
 *
 * A forensic wiring schematic for ProblemShift. Top ("SOLD PIECES"): three
 * hairline nodes — WEBSITE · ADS · CRM — wired in a row by a conduit that is
 * SEVERED at each seam (offset cut ends, orange fault-caps), with a LEAD dot
 * falling through the first gap and dying in the void below. Bottom ("WHOLE
 * FLOW"): the same three carried by one unbroken blue line to a delivered node.
 *
 * Orange = the fault/leak, and ONLY there. Blue = the whole, connected state.
 * No glows, no gridlines, no numbers, no axes — a schematic, never a plot.
 * Labels use only nouns already in the signed copy.
 */

const ARIA =
  'Three pieces — a website, ads, and a CRM — wired in a row but severed at each seam; a lead falls through the gap and is lost. Below, one continuous whole-flow line carries all three to a delivered end.'

export function SeamSchematic({ className = '' }: { className?: string }) {
  return (
    <figure
      className={`overflow-hidden rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 ${className}`}
    >
      {/* ── Desktop: broken row above, whole line below ────────────────── */}
      <svg viewBox="0 0 560 380" className="hidden w-full lg:block" role="img" aria-label={ARIA}>
        <defs>
          <linearGradient id="ps-fall-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* state tag — the problem */}
        <text x="24" y="30" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2" fill="var(--color-accent-500)" fillOpacity="0.9">
          SOLD PIECES
        </text>

        {/* severed conduit — track on both sides of each cut */}
        <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.5">
          <line x1="156" y1="74" x2="182" y2="74" />
          <line x1="214" y1="74" x2="196" y2="74" />
          <line x1="346" y1="74" x2="372" y2="74" />
          <line x1="404" y1="74" x2="388" y2="74" />
        </g>
        {/* orange fault-caps at each cut end (offset, so they visibly don't meet) */}
        <g stroke="var(--color-accent-500)" strokeWidth="2.5">
          <line x1="182" y1="66" x2="182" y2="82" />
          <line x1="196" y1="66" x2="196" y2="82" />
          <line x1="372" y1="66" x2="372" y2="82" />
          <line x1="388" y1="66" x2="388" y2="82" />
        </g>

        {/* hairline nodes — a straight row of three that should connect */}
        <g fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.25">
          <rect x="24" y="44" width="132" height="60" rx="8" />
          <rect x="214" y="44" width="132" height="60" rx="8" />
          <rect x="404" y="44" width="132" height="60" rx="8" />
        </g>
        <g fontFamily="var(--font-mono)" fontSize="14" letterSpacing="1.5" fill="var(--color-ink-200)" textAnchor="middle">
          <text x="90" y="79">WEBSITE</text>
          <text x="280" y="79">ADS</text>
          <text x="470" y="79">CRM</text>
        </g>

        {/* the lead falling through seam 1, dying in the void */}
        <line x1="189" y1="100" x2="189" y2="296" stroke="url(#ps-fall-d)" strokeWidth="1.75" strokeDasharray="1 6" strokeLinecap="round" />
        <circle cx="189" cy="150" r="4.2" fill="var(--color-accent-500)" fillOpacity="0.55" />
        <circle cx="189" cy="205" r="3.3" fill="var(--color-accent-500)" fillOpacity="0.4" />
        <circle cx="189" cy="255" r="2.5" fill="var(--color-accent-500)" fillOpacity="0.26" />
        <circle cx="189" cy="92" r="5.5" fill="#ffffff" />
        <text x="203" y="128" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.2" fill="var(--color-ink-200)" textAnchor="start">
          LEAD
        </text>
        {/* second seam — a fainter drop, no dot */}
        <line x1="380" y1="92" x2="380" y2="152" stroke="url(#ps-fall-d)" strokeWidth="1.25" strokeDasharray="1 6" strokeLinecap="round" />

        {/* state tag — the fix */}
        <text x="24" y="300" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2" fill="#7d97f5">
          WHOLE FLOW
        </text>

        {/* one unbroken line threading through three stations, flowing onward */}
        <line x1="40" y1="332" x2="498" y2="332" stroke="var(--color-brand-600)" strokeWidth="2.5" strokeLinecap="round" />
        <g fill="var(--color-surface-dark)" stroke="var(--color-brand-600)" strokeWidth="1.5">
          <rect x="84" y="326" width="12" height="12" rx="3" />
          <rect x="274" y="326" width="12" height="12" rx="3" />
          <rect x="464" y="326" width="12" height="12" rx="3" />
        </g>
        {/* flow direction into a delivered destination — not a slider thumb */}
        <path d="M498 325 L512 332 L498 339 Z" fill="var(--color-brand-600)" />
        <rect x="517" y="326" width="12" height="12" rx="3" fill="var(--color-brand-600)" />
        <g fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill="rgba(255,255,255,0.72)" textAnchor="middle">
          <text x="90" y="357">WEBSITE</text>
          <text x="280" y="357">ADS</text>
          <text x="470" y="357">CRM</text>
        </g>
      </svg>

      {/* ── Mobile: broken stack above, whole line below ──────────────── */}
      <svg viewBox="0 0 360 430" className="block w-full lg:hidden" role="img" aria-label={ARIA}>
        <defs>
          <linearGradient id="ps-fall-m" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <text x="24" y="24" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" fill="var(--color-accent-500)" fillOpacity="0.9">
          SOLD PIECES
        </text>

        {/* three offset nodes — clearly not aligned */}
        <g fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.25">
          <rect x="24" y="36" width="176" height="56" rx="8" />
          <rect x="160" y="126" width="176" height="56" rx="8" />
          <rect x="24" y="216" width="176" height="56" rx="8" />
        </g>
        <g fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill="var(--color-ink-200)" textAnchor="middle">
          <text x="112" y="69">WEBSITE</text>
          <text x="248" y="159">ADS</text>
          <text x="112" y="249">CRM</text>
        </g>

        {/* severed handoffs between consecutive pieces (stubs + offset caps) */}
        <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.5">
          <line x1="150" y1="92" x2="150" y2="106" />
          <line x1="220" y1="126" x2="220" y2="116" />
          <line x1="248" y1="182" x2="248" y2="196" />
          <line x1="150" y1="216" x2="150" y2="206" />
        </g>
        <g stroke="var(--color-accent-500)" strokeWidth="2.5">
          <line x1="142" y1="106" x2="158" y2="106" />
          <line x1="212" y1="116" x2="228" y2="116" />
          <line x1="240" y1="196" x2="256" y2="196" />
          <line x1="142" y1="206" x2="158" y2="206" />
        </g>

        {/* the lead — from ADS ("the ad bought a lead") — falling into the right gutter */}
        <line x1="248" y1="206" x2="248" y2="300" stroke="url(#ps-fall-m)" strokeWidth="1.75" strokeDasharray="1 6" strokeLinecap="round" />
        <circle cx="248" cy="240" r="3.6" fill="var(--color-accent-500)" fillOpacity="0.45" />
        <circle cx="248" cy="272" r="2.6" fill="var(--color-accent-500)" fillOpacity="0.25" />
        <circle cx="248" cy="200" r="5.5" fill="#ffffff" />
        <text x="262" y="198" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.2" fill="var(--color-ink-200)" textAnchor="start">
          LEAD
        </text>

        {/* whole flow */}
        <text x="24" y="336" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" fill="#7d97f5">
          WHOLE FLOW
        </text>
        <line x1="40" y1="368" x2="300" y2="368" stroke="var(--color-brand-600)" strokeWidth="2.5" strokeLinecap="round" />
        <g fill="var(--color-surface-dark)" stroke="var(--color-brand-600)" strokeWidth="1.5">
          <rect x="70" y="362" width="11" height="11" rx="3" />
          <rect x="174" y="362" width="11" height="11" rx="3" />
          <rect x="278" y="362" width="11" height="11" rx="3" />
        </g>
        <path d="M300 361.5 L313 368 L300 374.5 Z" fill="var(--color-brand-600)" />
        <rect x="318" y="362" width="11" height="11" rx="3" fill="var(--color-brand-600)" />
        <g fontFamily="var(--font-mono)" fontSize="12" letterSpacing="1.2" fill="rgba(255,255,255,0.72)" textAnchor="middle">
          <text x="76" y="392">WEBSITE</text>
          <text x="180" y="392">ADS</text>
          <text x="284" y="392">CRM</text>
        </g>
      </svg>
    </figure>
  )
}
