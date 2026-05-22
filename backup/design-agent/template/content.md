# Content: Messaging and Copy Principles

The words on the page do more work than the visuals. Get the words wrong and no amount of design saves it.

---

## The foundational question

**Who is this specific person and what does their Monday look like?**

Not a persona. A person. Write down:
- Age, role, daily schedule
- The three things that keep them up at night
- The phrase they'd actually use to describe their problem
- The last piece of software that disappointed them
- What their spouse/partner says about their work at dinner
- What they'd say to themselves if they got honest at 11pm

You're writing copy for **that** person. Every word.

Example format (replace with your audience):

> [Name], [age], [role/title]. [What they do daily]. [Who they live with / work with]. [Their specific pain]. [Their skepticism — what's burned them before]. [How they actually describe their business when no one's selling to them].

Once you have this paragraph, you can reject every line of copy that doesn't speak to them.

---

## The voice checklist

Before you write a line, decide:

- [ ] **Whose voice is this?** (Peer? Expert? Teacher? Mentor? Industry insider?)
- [ ] **What do they sound like at a bar, not on LinkedIn?** (That's the right voice.)
- [ ] **What's the vocabulary ceiling?** (Words that would make them feel talked down to → cut. Words that would make them feel talked at by an MBA → cut.)
- [ ] **Is there rhythm?** (Short. Medium sentence. Occasionally a longer one that breathes. Repeat.)
- [ ] **Does it sound like something they'd say** or like something a copywriter wrote?

Common voices that work well for B2B:
- **Peer-who-has-been-there** — "We know what your Monday looks like." Good for audiences that feel unheard or exhausted.
- **Respected insider** — Uses industry shorthand naturally, not as a pose. Good for technical audiences.
- **Honest friend** — Names the ugly truth. Good when incumbents are all spinning.
- **Quiet authority** — Doesn't shout, doesn't beg. Good for premium/trust-driven products.

Avoid:
- **TED-talk aspirational** — overused, feels hollow
- **Corporate strategy deck** — "leverage synergies" dies on arrival
- **Startup breathless** — "revolutionizing" / "unlocking" / "disrupting"

---

## The jargon blacklist

These are the reliable offenders across most B2B pages. Build your own list specific to your industry.

| Jargon | Plain version |
|---|---|
| Moat | Hard to copy / What competitors can't touch / Your edge |
| MRR / ARR | Monthly income / Yearly income |
| Recurring revenue | Monthly income (or "customers who pay you monthly" if in a quote) |
| Recurring base | Monthly customers / Ongoing customers |
| Compound / compounding | Pays you next year too / Stacks up / Keeps paying |
| Capture | Earn / Save / Keep / Hold onto |
| Replicate | Copy |
| Operating blind | Without a system / Running blind (only if visceral for audience) |
| Optimize | Fix / Make better |
| Scale | Grow / Handle without you |
| Leverage | Use |
| Synergy | (just delete) |
| Frictionless | Easy / No fuss |
| Acquisition | New customer / New lead |
| Conversion | Sign-up / Sale |
| Velocity | Speed / How fast |
| Best-in-class | Best / (just delete the phrase) |
| Unlock | Get / Start |
| Stakeholder | The person who cares |
| Digital presence | Website / Online home |
| Passive income | Money that shows up whether you work or not |
| Ecosystem | Everything that works together |
| End-to-end | All of it / From start to finish |
| Seamless | (it's never actually seamless; just describe what happens) |
| Holistic | Complete |
| Transform | Change |
| Cutting-edge | New / The latest |
| Mission-critical | Important / Can't-miss |
| ROI | What you get back / Payoff |
| KPIs | The numbers that matter |

### Additional forbidden vocabulary

These are zero-tolerance across almost any marketing surface. Grep for them; zero hits is the bar.

`elevate` · `unlock` · `empower` · `seamless` · `revolutionary` · `next-level` · `game-changing` · `best-in-class` · `synergy` · `leverage` (as verb) · `solutions` (as generic noun) · `journey` · `delightful` · `magic` · `effortless` · `thrive` · `amplify`

Project-specific forbidden words go below in "Project-specific copy lessons." If the audience is especially jargon-allergic (consultants, skilled tradespeople, medical specialists), add their surface-word allergies to that list.

**B2C additions** (if writing for a consumer audience): `platform` (use "the site" or the product name), `ecosystem`, `enterprise`, `suite`.

### Grep before shipping

```bash
grep -iE '\b(elevate|unlock|empower|seamless|revolutionary|next-level|game-changing|best-in-class|synergy|leverage|solutions|journey|delightful|magic|effortless|thrive|amplify)\b' <component-scope>
```

Zero hits is the bar. One hit means rewrite the sentence.

**When in doubt:** replace the word with how your target person would say it to a coworker over coffee.

---

## The "sounds smart vs. actually lands" test

Every headline and tagline should pass this test. Say it out loud. If it sounds like:

- A TED talk → replace
- A LinkedIn post → replace
- An MBA case study → replace
- A consultant deck → replace
- A conversation between two people in the trade/industry about the job → keep

---

## The "duality trap" — don't over-simplify structural phrases

Some phrases have deliberate structure you need to preserve when plainening. Common traps:

**Dual-subject pairing:**
> "Captures their trust + your knowledge"

The `their/your` pairing is deliberate — one phrase, two subjects. Plainer version has to keep the structure:
> "Earns their trust + saves your know-how" ✓
> "Builds trust, saves what you know" ✗ (lost the pairing)

**Contrast:**
> "Old way: service, invoice, hope they come back. New way: service, enroll, see them every month."

Before/after contrast is the whole point. Don't collapse it.

**Parallelism:**
> "Insurance up. Parts up. Labor up."

Three identical structures = punch. Don't vary them "for flow."

**Rule:** before replacing a phrase, check whether it has grammatical structure doing emotional work. If yes, preserve it in the replacement.

---

## Real vs. illustrative content

If you use fabricated names, photos, quotes, or numbers:

1. **Use specific-sounding ones, not generic** — "Mike Anderson, Anderson HVAC, [City, State]" beats "Satisfied Customer, [State]"
2. **Mark them as illustrative** in a visible spot — disclaimer at the page bottom, or near the proof section
3. **Plan to swap them out** before real launch
4. **Keep the structure** you'd want for real content — if you build the layout around "customer name + company + location + photo + highlighted dollar amount," the slot is ready for real data

**Never launch with fabricated content presented as real without disclosure.** Users feel deceived when they find out, and they always find out.

### Testimonial ethics — the Composite pattern

If a testimonial isn't from a real named customer who has consented, it must be *clearly* composite.

**The safe pattern:**

- **Name field:** role + size + setting, never a first name. `"GM of a 22-truck HVAC shop · Southwest U.S. · Runs on [major tool]"` instead of `"Lisa M., [Shop Name]"`
- **Badge:** muted **"Composite"** in slate/gray, never **"Verified"** in emerald
- **No avatar photo** — even a generated one reads as deceptive paired with a composite quote
- **Section intro makes attribution explicit:** *"These are composite quotes drawn from conversations with N [audience]. Real named customers will replace them at launch."*

**The unsafe pattern** (avoid):

- Fabricated name + location + organization name → reads as a real customer
- Generated avatar photo next to a fabricated quote
- "Verified" badge on any testimonial that isn't verified
- Fabricated dollar-amount claims in quotes without a disclaimer — even anonymized, specific number claims require either real data or a clear "illustrative" label

**When a real named customer is available:** use them fully — real name, real location, real organization, real photo with permission, "Verified" badge earned. Mix with Composite supporters is OK, just keep the visual distinction clear (hero-size for verified, smaller for composite).

---

## Recognition vs. aspiration

Two fundamentally different copy approaches:

**Aspiration:** "Become the next [winner]." "Unlock your potential." "Scale your business."
**Recognition:** "We see your Monday. We know about the [specific pain]. We know [specific truth about you]."

Recognition works better for:
- Audiences that are exhausted, skeptical, or have been burned before
- Products that solve a felt pain (not a fantasized gain)
- Commoditized categories where trust is low
- Audiences who feel invisible, unheard, or tired

Aspiration works better for:
- Audiences early-career / upwardly mobile
- Genuinely new product categories
- Audiences with bandwidth for dreams

**Most B2B pages over-use aspiration.** Test whether your audience is in the mood for it before you default to it.

---

## The price reveal

If price is part of the pitch, don't hide it AND don't lead with it. Build a section that earns the reveal.

**Pattern that works:**
1. Show a multi-row stack of things the customer is currently paying for (with dollar ranges for each)
2. End with a single card: "Replaces all of this: $X/month"

The math does the selling. By the time they see the price, they've added it up themselves.

**Pattern that doesn't work:**
- Three pricing tiers side-by-side with feature matrices (generic SaaS, ignored by most audiences)
- Hiding price behind "Contact us" (creates friction and distrust unless pricing is genuinely custom)

---

## Social proof: specificity beats quantity

Three strong quotes from real people beat thirty vague quotes from "customers."

Structure each quote:
- ⭐ rating
- "Verified" badge
- Quote with specific numbers **highlighted** (the reader's eye lands there)
- Avatar circle (initials if no photo)
- Name
- Role + company + location (specific enough to feel real)
- Optional context ("4 bays," "10 trucks," "22 years in business")

**The highlighting of numbers** is what turns the quote from "nice words" into "wait, really?" — pick the dollar amount, time saving, or percentage that does the work and highlight that, not the whole quote.

---

## Headlines: the test

Read the headline alone, without context. Does it:

- Make you curious enough to read the next line?
- Or does it tell you everything, leaving no reason to keep reading?

Good headlines create a **gap** between what the reader knows and what they want to know. Great ones make them lean in.

**Gap-creating examples:**
- "We know exactly what your Monday looks like." → gap: how do they know?
- "Most [category] run on duct tape and hunches." → gap: what's the alternative?
- "You're not a contractor. You're a craftsman with a business to grow." → gap: what does that mean for me?

**Gap-closing examples (avoid):**
- "[Product Name]: the platform for modern [audience]" → no gap, nothing to discover
- "Grow your business with [Product]" → no gap, nothing to feel

**A useful trick:** if you can swap in a competitor's product name and the headline still works, it's too generic. The best headlines are un-swappable.

---

## Closers: the emotional exit

Every section should have a line that rewards the scroll. Not a summary. An emotional payoff.

**Good closers:**
- Tie back to the reader's self-concept ("You built it because you were good at the work.")
- Complete an arc started at the top of the section
- State the obvious truth the section just earned the right to say
- Quote something the reader would say themselves

**Bad closers:**
- Summarize what the section just said
- Sell features
- Introduce new concepts (those belong in a new section)

A good closer makes the reader want to reread the section. A bad one makes them skip to the next.

---

## The checklist before shipping any copy block

- [ ] Would [your specific person] actually say or understand this sentence?
- [ ] Any jargon from the blacklist I haven't translated?
- [ ] Does the headline create a gap or close one?
- [ ] Does the section have a closer that rewards scrolling?
- [ ] Are specific numbers highlighted where they'd pay off?
- [ ] If a quote or name is fabricated, is it clearly illustrative somewhere visible?
- [ ] Does the voice match the rest of the page?
- [ ] If I read this aloud, does it sound like a human or a brand?
- [ ] Does any phrase have deliberate grammatical structure (duality, contrast, parallelism) I'd lose if I replace it?
- [ ] Am I promising any feature / capability that doesn't actually exist?

If all yes, ship it. If any no, fix that one thing and re-test.

---

## Project-specific copy lessons

_Record jargon you replaced, voice decisions you made, closers that worked, headlines that tested well._

- _(add entries here as you work)_
