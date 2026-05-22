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
- What their spouse/partner says about their business at dinner
- What they'd say to themselves if they got honest at 11pm

You're writing copy for **that** person. Every word.

Once you have them written down concretely, you can reject every line of copy that doesn't speak to them. Without that anchor, every word is a guess.

---

## The voice checklist

Before you write a line, decide:

- [ ] **Whose voice is this?** (Peer? Expert? Teacher? Mentor? Industry insider?)
- [ ] **What do they sound like at a bar?** (That's usually the right voice. Not their LinkedIn voice.)
- [ ] **What's the vocabulary ceiling?** (If a word would make them feel talked down to, cut it. If it would make them feel talked at by an MBA, cut it.)
- [ ] **Is there rhythm?** (Short. Medium sentence. Occasionally a longer one that breathes. Repeat.)

Pick the voice deliberately and then test every sentence against it. "Would this voice say this?" is a faster filter than "is this good copy?"

---

## The jargon blacklist

These are reliable offenders across most B2B/SaaS landing pages. Your project will have its own additions.

| Jargon | Plain version |
|---|---|
| Moat | Hard to copy / What competitors can't touch / Your edge |
| MRR | Monthly income / Monthly $$ |
| Recurring revenue | Monthly income (or "members pay you monthly" verbally) |
| Recurring base | Monthly customers |
| Compound / compounding | Pays you next year too / Stacks up / Keeps paying |
| Capture | Earn / Save / Keep / Hold onto |
| Replicate | Copy |
| Operating blind | Without a system / Running blind (if visceral) |
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

### Universal forbidden vocabulary

Zero tolerance — every page should be grep'd for these before merge:

`elevate` · `unlock` · `empower` · `seamless` · `revolutionary` · `next-level` · `game-changing` · `best-in-class` · `synergy` · `leverage` (as verb) · `solutions` (as generic noun) · `journey` · `delightful` · `magic` · `effortless` · `thrive` · `amplify`

### Page-scoped forbidden vocabulary

Some words aren't universally wrong, just wrong on certain pages. Define a per-page list when an audience can't tolerate a category of language. Examples:

- A B2C consumer page might forbid: `platform`, `ecosystem`, `enterprise`, `lead-gen`, `MRR`, `suite`
- An expert/practitioner page might forbid: `build your brand`, `scale your practice`, `thought leader`, `expert community`

### How to grep

Before declaring a page done, run a grep against the universal list scoped to the page's component folder:
```bash
grep -iE '\b(elevate|unlock|empower|seamless|revolutionary|next-level|game-changing|best-in-class|synergy|leverage|solutions|journey|delightful|magic|effortless|thrive|amplify)\b' components/landing/<page-scope>/
```

Zero hits is the bar. One hit means rewrite the sentence.

**When in doubt:** replace the word with how your target person would say it at a diner.

---

## The "sounds smart vs. actually lands" test

Every headline/tagline should pass this test. Say it out loud. If it sounds like:

- A TED talk → replace
- A LinkedIn post → replace
- An MBA case study → replace
- A consultant deck → replace
- A conversation between two people in your audience talking about the business → keep

Example: "Start building something that compounds while you work" sounds smart. "Start building something that pays you next year too" is how they'd actually describe it.

---

## Duality and parallelism traps

Be careful when replacing phrases that have deliberate structure. Original:

> "Captures their trust + your knowledge"

The `their/your` duality matters: their = customer, your = you. One phrase captures two things. When simplified to "Builds trust, saves what you know," the pairing is lost. Better simplified version preserves the structure with plainer words:

> "Earns their trust + saves your know-how"

**Check before replacing:** does the original have deliberate parallelism, contrast, or dual-subject structure? If yes, preserve it in the replacement.

---

## Real vs. illustrative content

If you use fabricated names, photos, quotes, or numbers:

1. **Use specific-sounding ones, not generic** — a named person with a place beats "Satisfied Customer, Anywhere"
2. **Mark them as illustrative** in a visible spot — a disclaimer at the page bottom or near the proof section
3. **Plan to swap them out** before real launch
4. **Keep the structure** you'd want for real content — if you build the layout around "name + company + location + photo + highlighted dollar amount," the slot is ready for real data

Never launch with fabricated content that reads as if it were real without disclosure. Users feel deceived when they find out, and they always find out.

### Testimonial ethics — the Composite pattern

The classic pattern (full name + location + star rating + "Verified" badge on invented quotes) is deceptive-advertising territory. If a testimonial isn't from a real named customer who has consented, it must be *clearly* composite.

**The safe pattern:**

- **Name field:** role + size + setting, never a first name. Example: `"GM of a 22-truck shop · Southwest U.S. · Runs on [Tool]"` instead of `"[First] [Last], [Business Name], [City, State]"`
- **Badge:** slate or gray **"Composite"**, never emerald **"Verified"**
- **No avatar photo** (even a generated one reads as deceptive when paired with a composite quote)
- **Section intro makes attribution explicit:** *"These are composite quotes drawn from conversations with N [audience]. Real named customers will replace them at launch."*

**The unsafe pattern:**

- Fabricated name + location + business name → reads as a real customer
- Generated avatar photo paired with a fabricated quote → reads as a real person
- "Verified" badge on any testimonial that isn't verified
- Fabricated dollar-amount claims in quotes without a disclaimer — even with anonymized attribution, specific number claims need real data or a clear "illustrative" label

**When a real named customer is available:** use them fully — real name, real location, real business, real photo with permission, "Verified" badge earned. Mix with composite supporters is OK; keep the visual distinction clear (hero-size for verified, smaller for composite).

**When launching:** swap every Composite for a real customer as you land them. The layout is already structured for it.

---

## Recognition vs. aspiration

Most SaaS landing pages sell aspiration: "Become the next [winner]." "Unlock your potential." "Scale your business."

Recognition-based copy sells something different: "We see your Monday. We know about the missed calls. We know your senior person is retiring."

Recognition works better for audiences who feel invisible, unheard, or tired. It doesn't ask them to imagine a better life. It tells them someone finally understands their current one.

Use recognition when:
- The audience is exhausted, skeptical, or has been burned before
- The product solves a felt pain, not a fantasized gain
- The category is commoditized and trust is low

Use aspiration when:
- The audience is early-career / upwardly mobile
- The product is genuinely a new category
- The audience has bandwidth for dreams

---

## The $X math reveal

If price is part of the pitch, don't hide it AND don't lead with it. Build a section that earns the reveal.

A pattern that works:
1. Show a 5–6-row stack of things the customer is currently paying for, with dollar ranges for each.
2. End with a single dark card: "[Product] replaces all of this. $X/month."

The math does the selling. By the time they see the price, they've added it up themselves.

---

## Social proof: specificity beats quantity

Three strong quotes from real people beat thirty vague quotes from "customers." Structure each one:
- ⭐ rating
- Verified badge (only if actually verified — see Composite pattern)
- Quote with specific dollar amounts or numbers **highlighted in accent color** (the reader's eye lands there)
- Avatar circle (initials if no photo)
- Name
- Role + company + location (specific enough to feel real)
- Optional context (size hints — "4 bays," "10 trucks," "22 years")

The highlighting of dollars / hours / percentages turns the quote from "nice words" into "wait, really?"

---

## Headlines: the test

Read the headline alone. Without context. Does it:

- Make you curious enough to read the next line?
- Or does it tell you everything, leaving no reason to keep reading?

Good headlines make you lean in. Great ones create a gap between what you know and what you want to know.

Examples of headlines that **create a gap** (good):
- "We know exactly what your Monday looks like." → gap: how do they know?
- "Most shops run on duct tape, sticky notes, and hunches." → gap: what's the alternative?
- "Insurance up. Parts up. Labor up. Same as 2005." → gap: what's changing?

Examples that **close the gap** (bad):
- "[Product]: the platform for modern shops" → no gap, nothing to discover
- "Grow your business with [Product]" → no gap, nothing to feel

---

## Closers: the emotional exit

Every section should have a line that rewards the scroll. Not a summary. An emotional payoff.

Examples of the shape:
- A recognition section: "You didn't build your business to run it like this. You built it because you were good at the work. [Product] is how you go back to that."
- A compounding section: "Everything you built before is still working for you."
- A business-model section: "Your expertise has always been valuable. Now it's also visible."
- A final CTA: "Stop running your [thing] on duct tape."

A good closer makes the reader want to reread the section. A bad closer makes them skip to the next one.

---

## The checklist before shipping any copy block

- [ ] Would your specific person actually say or understand this sentence?
- [ ] Is there any jargon I haven't translated to plain language?
- [ ] Does the headline create a gap or close one?
- [ ] Does the section have a closer that rewards scrolling?
- [ ] Are specific numbers highlighted where they'd pay off?
- [ ] If a quote or name is fabricated, is it clearly illustrative somewhere visible?
- [ ] Does the voice match the rest of the page?
- [ ] If I read this aloud, does it sound like a human or a brand?

If all yes, ship it. If any no, fix that one thing and re-test.
