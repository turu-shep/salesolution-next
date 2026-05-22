# Agent Input: Project Context
> **Fill this out before running the agent.** Save as `.agent/PROJECT-CONTEXT.md` in your project root.
> The agent reads this first and uses it to calibrate every analysis decision.
> Be honest and specific — vague inputs produce generic recommendations.
> 
> **V2.0 additions:** Sections 4.5 (Revenue Context) and 5.2 (Documentation Locations) are new.
> These power business impact scoring and documentation drift detection.

---

## 1. PRODUCT

### What is this product? (2-3 sentences — what it does, not how it's built)


### Who uses it? List every distinct user type/role.
<!-- Example: "Equipment dealers (buy/list products), Field technicians (accept service jobs), End customers (book repairs)" -->


### What is the core transaction? (The one thing that must work for the product to have value)
<!-- Example: "Customer books a consultation with a provider and pays for it" -->
<!-- Example: "Buyer purchases a product from a seller, platform takes commission" -->
<!-- Example: "User uploads data, system processes it, user downloads results" -->


### Business model (how does this make money?)
<!-- Options: SaaS subscription / Marketplace commission / Per-transaction fee / Freemium+upsell / Usage-based / Ad-supported / Other -->


### Current stage
<!-- Pick one:
- Idea/design (no code yet)
- Early build (core features in progress, nothing works end-to-end)  
- Mid-build (happy path works for some flows, many gaps)
- Feature-complete (all planned features exist, quality varies)
- Live with users (real people using it, real bugs reported)
- Scaling (works but needs performance/architecture improvements)
-->


---

## 2. MARKET & ICP

### Who is the Ideal Customer Profile?
<!-- Be specific: company size, industry, role of buyer, role of user, geographic focus -->
<!-- Example: "Independent hydraulic equipment dealers, $2M-$15M revenue, owner-operator is both buyer and primary user, US-based" -->


### What problem does this solve for them? (in their words, not yours)
<!-- What would the customer say they need? Not your marketing copy — their actual pain. -->
<!-- Example: "I can't find a qualified technician to service my customer's equipment without calling 10 people" -->


### Who are the competitors or alternatives? (including "do nothing" / manual process)
<!-- List 2-5. For each: name, how they solve it, why yours is different -->
<!-- 
1. [Competitor]: [how they solve it] — [why yours is different]
2. [Manual process]: [what people do today without your product]
-->


### What is the unique advantage? (one sentence — what can you do that others can't?)


---

## 3. GOALS & MILESTONES

### What are the next 1-3 milestones? (in order of priority)
<!-- For each milestone: what does "done" look like? What is the blocker test? -->
<!--
**Milestone 1: [Name]**
- What it means: [description]
- Blocker test: [one sentence — how do you know it's done?]
- Target date: [if any]

**Milestone 2: [Name]**
- What it means: 
- Blocker test: 
- Target date: 

**Milestone 3: [Name]**
- What it means: 
- Blocker test: 
- Target date: 
-->


### What are the KPIs that matter right now? (max 5)
<!-- Only list KPIs you are actively trying to move. Not aspirational metrics. -->
<!-- Example: "Booking completion rate (currently ~30%, target 70%)" -->
<!-- Example: "Time to first provider match (currently unknown, target < 24h)" -->


### What does NOT matter right now? (things you explicitly deprioritize)
<!-- This is as important as goals. It prevents the agent from recommending work you don't care about yet. -->
<!-- Example: "SEO, performance optimization, mobile app, i18n, advanced analytics" -->


---

## 4. CURRENT STATE

### Tech stack (brief — the agent will read your code for details)
<!-- Example: "Next.js 14 App Router, Supabase, Stripe, Tailwind, deployed on Vercel" -->


### Team structure
<!-- Who builds this? Solo? Small team? Offshore contractors? -->
<!-- This affects what kind of tasks the agent recommends (small focused PRs vs. large refactors) -->


### What works today? (flows a user can actually complete end-to-end)
<!-- Be honest. "Works" means a real person could do it without you fixing things manually. -->
<!-- 
1. [Flow]: [status — works / mostly works / broken]
-->


### What is known-broken or missing?
<!-- The stuff you already know about. Saves the agent from "discovering" what you already know. -->
<!-- 
1. [Issue]: [brief description]
-->


### What are the biggest pain points in the codebase? (select all that apply)
<!-- 
- [ ] Messy component/module structure
- [ ] Poor UX (missing loading/error/empty states)  
- [ ] Incomplete core transaction flow
- [ ] Security gaps (auth, validation, permissions)
- [ ] No tests
- [ ] Performance issues
- [ ] Spaghetti state management
- [ ] Unclear data model / schema issues
- [ ] Deployment/CI issues
- [ ] Documentation gaps
- [ ] Other: [describe]
-->


### 4.5 Revenue context ★ V2.0
<!-- Needed for business impact scoring. Helps the agent estimate real dollar impact of findings. -->
<!-- If pre-revenue, that's fine — just say so. The agent adjusts to "delayed launch" framing. -->

- Average transaction value: 
<!-- e.g., "$150 per booking", "$29/mo subscription", "unknown" -->

- Current monthly transactions: 
<!-- e.g., "0 — pre-launch", "~50", "~500" -->

- Revenue model details: 
<!-- e.g., "15% commission on each booking", "$29/mo base + $0.10 per API call" -->

- Biggest revenue risk you're aware of: 
<!-- e.g., "payment flow drops users at the confirmation step", "unclear pricing page kills signups" -->


---

## 5. EXISTING PROJECT DOCS

### Does this project have a CLAUDE.md or equivalent? 
<!-- Yes / No — if yes, the agent reads it for conventions and skips re-mapping what's already documented -->


### Does this project have architecture/module documentation?
<!-- Yes / No — if yes, where? (e.g., docs/modules/, docs/architecture.md) -->


### Does this project have a task tracker?
<!-- Linear / Jira / GitHub Issues / Notion / None — and is there MCP integration? -->


### Does this project have existing tests?
<!-- None / Some / Good coverage — and what test framework? (Jest, Vitest, Playwright, etc.) -->


### 5.2 Documentation locations ★ V2.0
<!-- The agent will cross-reference these documents against the actual code to find drift. -->
<!-- List every document that describes how the code SHOULD work. -->
<!-- If a document isn't listed here, the agent won't check it for drift. -->

<!-- 
- Project constitution: [e.g., "CLAUDE.md" or "none"]
- Architecture docs: [e.g., "docs/conventions/ARCHITECTURE.md"]
- API docs: [e.g., "docs/conventions/API.md" or "auto-generated at /api-docs"]
- Database docs: [e.g., "docs/conventions/DATABASE.md"]
- Component docs: [e.g., "docs/conventions/COMPONENTS.md"]
- Module docs: [e.g., "docs/modules/*.md — one per feature area"]
- Convention/style docs: [e.g., "docs/conventions/CONVENTIONS.md", ".eslintrc"]
- README: [e.g., "README.md"]
- Other: [any doc that describes expected code behavior]
-->


---

## 6. AGENT PERMISSIONS

### What should the agent be allowed to do beyond analysis?
<!-- Select all that apply:
- [ ] Analysis only — never touch code (read-only mode)
- [ ] Can write tests for gaps it finds
- [ ] Can fix small bugs (< 20 lines of change)
- [ ] Can add missing error/loading/empty states
- [ ] Can refactor flagged components
-->

### Any files or directories the agent must NEVER modify?
<!-- Example: "/migrations/, /components/ui/, .env.*, any third-party config" -->


---

## 7. WHAT DO YOU WANT FROM THIS ANALYSIS? (pick your top 3)

<!-- Rank 1-3:
- [ ] Find and fix bugs on the critical path
- [ ] Get a prioritized task backlog for the next sprint
- [ ] Understand how close I am to my next milestone  
- [ ] Identify systemic patterns (same bug everywhere = one fix)
- [ ] Security audit
- [ ] UX quality audit (loading/error/empty states)
- [ ] Architecture health check
- [ ] Test coverage gap analysis
- [ ] Performance audit
- [ ] Code quality / refactoring opportunities
-->


---

*Save this file as `.agent/PROJECT-CONTEXT.md` and run the agent.*
*Template version: 2.0*
