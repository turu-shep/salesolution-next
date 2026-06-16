# Prompt: Research which career path to add next (and emit an authoring prompt)

**Read `prompts/_CONTEXT.md` first.** Then `docs/strategy/career-path/03-roles.md` (the full role
inventory with P0/P1/P2 priority, responsibilities by seniority, buyer framing, salary evidence)
and `02-scope-and-positioning.md` (what's in/out of scope).

## Goal
Choose the next career-path role to author, then **generate a ready-to-run authoring prompt** by
filling `prompts/career-paths/author-path.TEMPLATE.md` for that role.

## Do this
1. **Inventory what's published.** Query `*[_type=="careerPath"]{title, "slug": slug.current,
   role, level, status}` (`perspective:'raw'` to also see drafts). Currently live: GEO Specialist,
   Citation Engineer.
2. **Pull candidates** from `03-roles.md`. The originally-promised next two are **SEO Specialist
   (industrial)** and **Content Strategy Specialist (industrial)** (P1). Other candidates: AEO
   Specialist, AI Visibility Analyst, Technical SEO (catalog scale), and the P2 adjacent roles
   (PIM/Product Data Manager, Searchandising, etc.).
3. **Apply scope rules** from `02-scope-and-positioning.md`: P0 AI-search lane leads; P1 established
   roles only in their **industrial flavor** (never generic "how to become an SEO" — those SERPs
   are owned); NO sales/general-marketing paths; talent stance "we don't hire."
4. **Pick the next role** (default: the highest-priority not-yet-built one — usually SEO Specialist
   industrial, then Content Strategy Specialist). Note the glossary terms it should link to.
5. **Optionally re-check** any role-title demand with Ahrefs (expect near-zero — these are
   citation/entity plays, not traffic; that's fine and expected).
6. **Emit the authoring prompt.** Fill every `{{PLACEHOLDER}}` in
   `prompts/career-paths/author-path.TEMPLATE.md` for the chosen role — pulling the role's
   responsibilities-by-seniority, skills, industrial angle, and buyer framing straight from
   `03-roles.md`. Write it to `prompts/career-paths/_generated/author-<slug>.md` and print it.

## Output
- One-line rationale for the chosen role + its priority.
- The generated authoring prompt (file + inline).

## Rules
- One role per run unless told otherwise (paths are substantial).
- Don't relitigate locked decisions in `_CONTEXT.md`.
- This prompt researches + generates only; it does not create Sanity content.
