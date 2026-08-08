# 03 · Angles and copy — the industrial Catalog AI cold-email sequences

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** Angle 1 CLEARED (ships day 1) · Angle 2 **GATE:HUMAN** (drafted, unsigned)

This is the send-ready copy layer of the campaign. Strategy lives in `00-README.md` and the phase files;
this file holds only what goes in a prospect's inbox: the variables contract, both sequences, the segment
inflections, the reply templates, the three unsigned objection counters, the Track-1 hand-send variant,
and the three lint gates a future editor re-runs after any edit.

**Register note (deliberate):** the brand's page-copy rule is first-person "we" on the industrial side.
These emails are first-person **"I"**, per the sequence architecture and the two on-file verbatim emails —
they are person-to-person notes signed by the founder, not page copy. Don't "fix" this to "we."

**Word-count convention:** counts exclude the subject, the `— Artur` sign-off, and the footer block.
Each `{{variable}}` counts as one word. A URL counts as one word. Hard cap **75**; target band **25–75**.

**Before any of this sends,** four pre-flight items bite this file directly:
- The E2 link destination `/catalog-snapshot/` has an unresolved URL-stability decision (pre-flight 4).
- That page's fit box says $2M–$50M while this campaign targets $5M–$75M (pre-flight 2), and it carries
  two different SKU floors, 200 and 1,000 (pre-flight 3). A prospect who clicks E2 reads both.
- `/services/catalog-ai/` still shows the retracted "Qualified leads doubled inside two quarters" sentence
  (pre-flight 1). We never link it, but a prospect who Googles us lands there.
- The footer address is unconfirmed until the NAP sweep closes (pre-flight 8).

---

## 1. Variables contract

Every personalized claim in this file traces to one of these. **No scan datum, no claim** — swap in the
written fallback. Never invent a brand, a count, a competitor, or a score. The prospect will check.

| Variable | What it is | Data source | Fallback behavior |
|---|---|---|---|
| `{{first_name}}` | Owner's first name | Apollo `mixed_people/search` → `first_name` | **No send.** A cold email with no name reads as a blast, and "Hi there" is worse than nothing. Route to the manual-research queue. |
| `{{company}}` | Trading name, legal suffix stripped | Apollo org enrich → `name`; strip Inc / LLC / Co. | **No send.** Mandatory field; the contact drops out of the list. |
| `{{category}}` | The product class in their words | Segment default (§4), overridden by the heading on their own top category page when the scan captured one | Segment default phrase. Never a category we didn't see on their site. |
| `{{region}}` | The metro they sell into | Apollo HQ city + state | State alone ("in Ohio"). If neither is confident, cut the phrase — the sentence still reads. |
| `{{brand}}` | One manufacturer from **their own** line card | Scan 3a: their `/line-card` or `/brands` page. Pick the brand with the widest listed gap. | **Angle 2 only.** No line-card page found → contact routes to Angle 1. Never a brand we didn't read off their site. |
| `{{sku_count}}` | Listed part numbers for that brand | Scan 3b: site-scoped query or their category pagination. Round **down** to the nearest ten, always prefixed "about". | Band phrasing ("a fraction of"). If the count can't be defended in a reply, route to Angle 1. |
| `{{competitor_named}}` | Who the AI actually named | Scan 3c: AI-answer check, answer text + date stored verbatim | E1 Opener A → **E1 Opener B**. Never guess who it named. |
| `{{probe_score}}` | Overall readiness 0–100 | `/api/probe` on three of their product URLs; use the **lowest** of the three | Cut the sentence and use the E2 fallback body. Never estimate a score. |
| `{{segment}}` | `a` / `b` / `c` | Campaign constant assigned at list build. **Not a personalization slot** — it only fills the E2 UTM. | Never empty; a contact with no segment isn't in the campaign. |

Two standing rules on top of the table:
1. The "three fixes I'd start with" in E1 comes from the probe's **Fix these first** output for that
   prospect. If the probe didn't run, say "what I saw on your product pages" instead.
2. Every number that reaches a prospect must survive them checking it on their own screen, on the day
   they reply. Store the scan date with the datum. Anything older than 14 days gets re-scanned before send.

---

## 2. Angle 1 — "The AI answer skips your catalog" · CLEARED

Five touches over 18 days. Plain text, no images, no pixels, no attachments. Exactly one link in the
whole sequence (E2). Reply is the CTA on every touch.

### E1 · day 0 — the observation and one question · no link

**Subject options** (all lowercase, 2–4 words, no numerals, no first names):
1. `who the ai names` — **Opener A only.** It implies we ran the check, so it over-promises on Opener B.
2. `checked your catalog`
3. `your product pages`

#### Opener A — the AI-answer check (needs `{{competitor_named}}`)

> {{first_name}} — I asked ChatGPT who sells {{category}} in {{region}} this morning, to see what it said about you. It named {{competitor_named}}. {{company}} wasn't in the answer.
>
> Not pitching anything. I kept the answer and the three fixes I'd start with on your product pages.
>
> Want me to send them over?
>
> — Artur

**50 words.** Slots: `{{first_name}} {{category}} {{region}} {{competitor_named}} {{company}}`.

**Fallback — the check ran, no competitor captured** (the AI named the manufacturer, named nobody, or
returned an answer we can't attribute cleanly). Still fully observed:

> {{first_name}} — I asked ChatGPT who sells {{category}} in {{region}} this morning, to see what it said about you. {{company}} wasn't in the answer.
>
> Not pitching anything. I kept what it said and the three fixes I'd start with on your product pages.
>
> Want me to send them over?

**48 words.** If the check never ran at all, this body is **off-limits** — use Opener B.

#### Opener B — the generic mechanism (unscanned prospects, no AI check)

> {{first_name}} — your buyers are asking ChatGPT who sells {{category}} before they call anybody. It names one or two distributors. Most catalogs never make that answer, because the product copy came from the manufacturer and every other distributor on that line runs the same text.
>
> Has anyone checked whether it names {{company}}?
>
> — Artur

**51 words.** Slots: `{{first_name}} {{category}} {{company}}`.
**Fallback:** `{{category}}` falls back to the segment default phrase (§4); nothing else in this body is
personalized, which is the point — Opener B claims no observation, so it can't make a false one.

---

### E2 · day 3–5 — the concrete artifact · the sequence's only link

**Subject options:** `something to keep` · `sample rewrite` · `easier to show`

> {{first_name}} — I ran three of your product pages through the AI-readiness check on my site. The worst came back {{probe_score}} out of 100.
>
> Easier to show you than argue about it: five of your real products, rewritten two ways side by side, plus what a crawl of the whole catalog turns up. Two business days, free, yours to keep.
>
> https://salesolution.net/catalog-snapshot/?utm_source=coldemail&utm_medium=email&utm_campaign=catalog-{{segment}}&utm_content=e2
>
> Want me to run it?
>
> — Artur

**65 words.** Slots: `{{first_name}} {{probe_score}} {{segment}}`. ("The worst came back" is deliberate:
the score shown is the lowest of the three pages per the variables contract, and saying so is both more
precise and harder to shrug off than an averaged-sounding "they came back.")

**Fallback — no probe score:**

> {{first_name}} — easier to show you than argue about it: five of {{company}}'s real products, rewritten two ways side by side, plus what a crawl of the whole catalog turns up. Two business days, free, yours to keep.
>
> https://salesolution.net/catalog-snapshot/?utm_source=coldemail&utm_medium=email&utm_campaign=catalog-{{segment}}&utm_content=e2
>
> Want me to run it?

**43 words.** Slots: `{{first_name}} {{company}} {{segment}}`.

**Link discipline:** this URL, with these five parameters, is the only link in either sequence. Paste it
raw — no shorteners, no redirect domains, no tracked-link wrappers. `{{segment}}` is the only variable
inside it and it is never blank.

---

### E3 · day 8–10 — the mechanism reframe · no new links

**Subject options:** `same page everywhere` · `the duplicate problem` · `why it skips you`

> {{first_name}} — the reason this happens is boring.
>
> Your {{category}} pages run the manufacturer's copy. So does every other distributor carrying that line. The AI hits forty versions of the same paragraph and keeps one. Usually the manufacturer's own site.
>
> You get skipped for writing what they sent you.
>
> Want me to show you yours?
>
> — Artur

**54 words.** Slots: `{{first_name}} {{category}}`.

**Fallback — no `{{category}}`:** replace the second sentence's opening with "Your product pages run the
manufacturer's copy." → **53 words.**

*Provenance of "forty versions":* it's our own published line — "AI engines deduplicate it across the 40+
distributors who all use the same text" (`/services/catalog-ai/`). It's a market claim about how the copy
travels, not a claim about this prospect. Don't sharpen it into a count of their competitors.

---

### E4 · day 13–15 — the fork, plus the cost of waiting · no links

**Subject options:** `not now or never` · `bad timing` · `where this stands`

> {{first_name}} — straight question: is this a not-now, or a not-ever? Either answer is useful and I'll act on it.
>
> The only reason I wouldn't sit on it: this work takes a few months to move an AI answer. Waiting doesn't shrink the job. It moves the payoff.
>
> Which is it?
>
> — Artur

**50 words.** Slots: `{{first_name}}` only — no scan dependency, so this touch always sends.
**Fallback:** none needed. If `{{first_name}}` is missing the contact was never in the sequence.

*Note:* "takes a few months to move an AI answer" is the on-file TM2 line and it is a timeline statement,
not a promise that it will move. Don't tighten it into a forecast.

---

### E5 · day 18 — breakup and permission · no links

**Subject options:** `closing the loop` · `last one from me` · `off your list`

> {{first_name}} — last one from me.
>
> Should I stop reaching out, or is this just bad timing? Either is fine. Say stop and you're off my list today, calls included.
>
> If it's timing, tell me when and I'll make a note for then.
>
> — Artur

**42 words.** Slots: `{{first_name}}` only.

A negative here suppresses globally and same-day: email, call list, and LinkedIn. "Calls included" is a
promise in writing — the suppression sync has to actually cover the dialer, or don't say it.

---

## 3. GATE:HUMAN — Angle 2, "the line-card gap"

**Present:** the five bodies below, the E2 scope problem, and the brand-naming rule.
**Stop and wait.** Nothing in this section sends until Artur signs. Four things need a decision:

- **(a) The expansion framing + the dropship language.** "Dropship" appears nowhere in the repo. Every
  sentence below about special-order economics is new positioning with no approved copy behind it.
- **(b) Naming manufacturer brands in outbound.** `{{brand}}` is nominative use, pulled only from the
  prospect's own line card, and it never implies partnership, authorization by us, or endorsement.
  There is no policy on this today — `brand/competitor-policy.yaml` covers agency competitors only.
- **(c) The three objection counters in §6.**
- **(d) A scope conflict this drafting surfaced:** Angle 2's E2 promises a **per-brand listed-SKU count**
  ("what your line card claims, what the site actually lists"). `/catalog-snapshot/` does not deliver
  that today — it delivers five rewritten products, crawl findings, and tier pricing. Either the snapshot
  scope gets extended to include the per-brand count, or that clause gets cut from E2 and the count stays
  a reply-only artifact. Shipping the promise before the deliverable exists is the fastest way to burn
  the "yours to keep" trust the snapshot is built on.

A fifth, smaller one: Angle 2's whole premise is enriching lines they already sell. Keep it there. The
offer page excludes "manual fact-checking against your internal databases (we use source data you
provide)" — the source data for added SKUs is the manufacturer product data the distributor can obtain
and hand us. If a reply turns into "so you'll go get the data," that's out of scope and has to be said.

### A2-E1 · day 0 — the line-card gap · no link

**Subject options:** `your line card` · `your brand pages` · `lines you carry`

> {{first_name}} — your line card lists {{brand}}. Your site lists about {{sku_count}} of their part numbers.
>
> The rest of that line still gets searched by part number, and today those searches land on somebody else's page. You already sell the line. The pages are the gap.
>
> Want me to send you what I counted?
>
> — Artur

**53 words.** Slots: `{{first_name}} {{brand}} {{sku_count}}`.

**Fallback — brand found, count not defensible:**

> {{first_name}} — your line card lists {{brand}}. Your site lists a fraction of their part numbers.
>
> The rest of that line still gets searched by part number, and today those searches land on somebody else's page. You already sell the line. The pages are the gap.
>
> Want me to send you what I counted?

**53 words.** No line-card page at all → the contact leaves Angle 2 and enters Angle 1.

Note the phrasing is strictly what we saw: *their line card lists the brand*, *their site lists N part
numbers*. We never write "you're authorized on {{brand}}" — that's an inference about their contract.

### A2-E2 · day 3–5 — the artifact · the sequence's only link

**Subject options:** `the count` · `line card gap` · `what i counted`

> {{first_name}} — easier to show you than describe.
>
> Five of your real products rewritten two ways, plus the per-brand count: what your line card claims, what the site actually lists. Two business days, free, yours to keep.
>
> https://salesolution.net/catalog-snapshot/?utm_source=coldemail&utm_medium=email&utm_campaign=catalog-{{segment}}&utm_content=e2
>
> Want me to run it on {{company}}?
>
> — Artur

**44 words.** Slots: `{{first_name}} {{segment}} {{company}}`.

**Fallback — gate item (d) resolves against extending the snapshot:** cut "plus the per-brand count:
what your line card claims, what the site actually lists" and use the Angle 1 E2 body verbatim. The
per-brand count then only appears in the reply, hand-built.

### A2-E3 · day 8–10 — the dropship-economics reframe · no links

**Subject options:** `stock and listings` · `special order pages` · `nothing new stocked`

> {{first_name}} — obvious objection first: you don't stock most of that line, and you're not going to.
>
> You don't have to. Those part numbers already move for you on special order when somebody asks. The page just makes them ask you instead of the distributor two states over. Nothing new on the shelf.
>
> Fair? If it is, I'll send the count.
>
> — Artur

**60 words.** Slots: `{{first_name}}` only.

The concession is load-bearing and goes first. "Nothing new on the shelf" is the whole reframe: added
SKUs are demand capture on lines that already move special-order, not inventory risk. If Artur's read is
that a segment genuinely doesn't special-order, this touch is wrong for them and Angle 1 is the fit.

### A2-E4 · day 13–15 — the fork · no links

**Subject options:** `not now or never` · `bad timing` · `where this stands`

> {{first_name}} — straight question: not-now, or not-ever? Either answer is useful.
>
> The only reason I wouldn't sit on it: new pages take a few months to start showing up in AI answers. Waiting doesn't shrink the job. It moves the payoff.
>
> Which is it?
>
> — Artur

**43 words.** Slots: `{{first_name}}` only.

### A2-E5 · day 18 — breakup and permission · no links

**Subject options:** `closing the loop` · `last one from me` · `off your list`

> {{first_name}} — last one from me.
>
> Should I stop reaching out, or is this just bad timing? Either is fine. Say stop and you're off my list today, calls included.
>
> If it's timing, tell me when and I'll make a note for then.
>
> — Artur

**42 words.** Slots: `{{first_name}}` only. Identical to Angle 1 E5 on purpose — the breakup shouldn't
carry the angle. It carries the exit.

---

## 4. Segment inflections

The sequences are shared. Only `{{category}}`, the line-card brand pool, and two nouns move.

### Segment A — fluid power and hydraulics

- **`{{category}}` phrasing:** "hydraulic hose and fittings" · "hydraulic cylinders" · "pneumatic components" ·
  "hydraulic pumps and motors". **Default when the scan captured nothing:** "hydraulic hose and fittings".
- **Line-card brands you'll actually read off their site:** Parker, Enerpac, Bosch Rexroth, Eaton, SMC,
  Norgren, Gates. Pull `{{brand}}` from *their* page — never from this list. This list is only for
  recognizing that you're on a line-card page.
- **Wording shift:** "part number" and "cross-reference" are native here and land harder than "SKU."
  In A2-E1, "searched by part number" is doing real work — keep it.
- **This is Angle 2's home.** Longest line cards, widest listed gaps, biggest deals.

### Segment B — bearings and power transmission

- **`{{category}}` phrasing:** "bearings and power transmission" · "mounted bearings" · "gearboxes and drives" ·
  "belts and sheaves". **Default:** "bearings and power transmission".
- **Line-card brands you'll see:** SKF, Timken, Dodge, Baldor, Browning, Gates, NSK.
- **Wording shift:** interchange and cross-reference language is even stronger than in A. The AI-answer
  check works well on a bare bearing number, which makes Opener A land — run the check on a real number
  from their catalog, not on a generic phrase.

### Segment C — general MRO and industrial supply

- **`{{category}}` phrasing:** never "industrial supply" — too broad to be an observation. Use their
  single biggest visible category, taken from their nav. **Default when the scan is thin:** don't send;
  a generic category makes E1 read like a blast, and Segment C is the lowest-signal list to begin with.
- **Angle 1 only** until Angle 2 clears, and probably after — MRO houses usually have a shallow line card,
  so the gap observation has nothing to bite.
- **Wording shift:** "line card" is a weak noun here. Say "your catalog" in E1 and E3.

---

## 5. Reply templates

Replies are not cold sends — the 75-word cap doesn't bind them. Everything else does: no guarantees,
no client names, no client numbers, published prices only. Senior-operator SLA on all of these is 2h
during send windows, which is our own published promise.

### Positive — "yes, send it"

> Good. Two things and I'm out of your way:
>
> 1. Your site URL and a rough SKU count, so the pricing in the snapshot is yours and not a range.
> 2. If you'd rather talk it through first, here's my calendar: [growth-call link].
>
> Either way the snapshot lands in two business days. Five of your real products rewritten both ways, side by side, plus what the crawl turns up across the catalog. It's yours to keep whether or not we ever work together.
>
> — Artur

Route: snapshot intake first, call second. Don't push the call on someone who asked for the PDF.
Confirm the `/book-growth-call/` link is the one Artur wants before this template goes live (gate G7).

### Question — "how much is this?"

The posture is **published prices, no cold quote for their catalog**. Both halves matter: refusing a
ballpark loses more deals than a wide range does, and quoting their number before the snapshot means
inventing it.

> I'm not going to price your catalog before I've seen it — you'd know the number was made up.
>
> The rates are public, though. Standard runs $3 a SKU, Pro $7, with a $3,000 and $7,000 floor, and the per-SKU rate drops at volume. Pro buys deeper work per product, not a bigger wrapper around the same work.
>
> The snapshot does the arithmetic against your actual SKU count, so what you get back is your number instead of my range. Two business days. Want me to run it?
>
> — Artur

If they push for a number anyway: *"It's not a $500 thing and it's not a $50K thing."* Then the snapshot.
The one place "money back" may appear is the day-7 pilot term — it is a **service term tied to the pilot**,
never a results guarantee, and it never appears in a cold send.

### Objection — route to the counter

| They said | Use |
|---|---|
| "SEO doesn't work for us" | IND1 |
| "Amazon's killing us anyway" | IND2 |
| "Our customers call our reps" | IND3 |
| "No time for a marketing project" | IND4 |
| "We have a marketing guy / agency" | C1 |
| "My nephew handles it" | C2 |
| "We're too small / not Caterpillar" | S1 |
| "Burned by agencies" | T1 |
| "How are you different" | T2 |
| "Send me references" | T3 — and do **not** name a client or quote a case-study number |
| "We're doing fine" | F1 |
| "Sounds too good to be true" | F2 |
| "Not looking for anything right now" | B3 |
| "Call me next quarter" | TM2 |
| **"We can't sell what we don't stock"** | **IND5 — PROPOSED, §6, unsigned** |
| **"Data entry is cheap offshore"** | **IND6 — PROPOSED, §6, unsigned** |
| **"Our system can't handle it"** | **IND7 — PROPOSED, §6, unsigned** |

Counters live in `docs/strategy/sales/05-objection-library.md`. Port them to email as-is — they were
written for the phone and they already read like a person talking.

### Negative / "stop"

One line. Gracious. Same day. No last pitch, no "before you go."

> Done — you're off my list, email and calls both. Thanks for telling me straight.
>
> — Artur

Then: suppress globally the same day (send tool blocklist, call list, LinkedIn), on whatever words they
used. "Take me off," "no thanks," and "stop" are the same instruction.

### Out of office

Not a send. Internal action only: re-queue the contact +2 weeks from their stated return date, hold the
sequence position (don't restart at E1), and never treat an auto-reply as engagement in the metrics.
If the OOO names a colleague, that's a new contact and it goes through verification like any other —
it does not inherit this contact's sequence.

---

## 6. GATE:HUMAN — the three PROPOSED objection counters

**Present:** IND5, IND6, IND7 below.
**Stop and wait.** These are unsigned. Until Artur approves them, an objection in this family gets a
plain "good question, let me come back to you on that" and a note in the ledger — not an improvised
answer. No documented counter exists today for any of the three.

### Voice reference — IND3, on file and approved, verbatim

> "Right, and most of them always will — engineers and buyers want a rep. But ask how they decide *who*
> to call. More and more, they ask Google's AI or ChatGPT 'who sells this part in [region]' first, and
> they call whoever it names. So this isn't about selling online instead of through your reps. It's about
> being the name the AI hands them, so the call comes to your reps and not a competitor's. Your reps still
> close it. They just need the phone to ring."

The shape to copy: concede the true thing in the first clause, move the question one step sideways, hand
the close back to them, end on one question.

### PROPOSED · GATE:HUMAN — IND5 · "We can't sell what we don't stock."

> "You're right, and I wouldn't ask you to stock it. Most of that line already moves for you on special
> order — somebody calls, your rep sources it, it ships next week. The only question is who they call.
> Right now the part number they're searching lands on a page that isn't yours, so the call goes somewhere
> else and you never knew it happened. Your reps still close it. They just need the phone to ring on parts
> you already sell. How much of your line moves special-order today?"

Depends on gate (a). If the dropship framing isn't approved, this counter has no ground to stand on.

### PROPOSED · GATE:HUMAN — IND6 · "Data entry is cheap offshore."

> "If the job were typing, offshore wins and it isn't close. But cheap data entry is how forty distributors
> ended up with the identical page — everyone typed in what the manufacturer sent. The AI reads all forty,
> keeps one, and the one it keeps is usually the manufacturer's own site. The job here is a page worth
> citing: the real specs in readable form, the questions your engineers actually ask answered right on the
> page, the cross-references spelled out. Ask your team this — when a buyer asks ChatGPT for that part,
> does the answer come back with your name in it?"

Never says schema. "In readable form" is the plain-stakes translation and it stays that way cold.

### PROPOSED · GATE:HUMAN — IND7 · "Our system can't handle it."

> "Fair — the last thing you need is a content project that turns into a systems project. We don't touch
> your system. We deliver in whatever format it imports: Shopify CSV, Magento XML, BigCommerce, or a
> mapping we build against your export. Your team imports it the way they import anything else. And we
> prove it on 500 products first — day seven you look at them, and nothing else moves until you approve.
> What does your site run on today?"

Never says ERP or PIM, in either direction. If the prospect says PIM first, mirror their word — don't
introduce it.

---

## 7. Track 1 — the founder-manual variant

Track 1 is 10–15 hand-written notes a day from Artur's established mailbox to the top-50 hot tier. It is
founder-led selling, not a sequence, and the copy changes accordingly. **The 75-word cap still binds** —
a hand-sent note that runs long reads like a proposal, and the whole point is that it reads like a peer.

**What changes:**

1. **No merge tags at all.** He types the name, the company, the category, the region. There is no
   fallback logic because there's no automation to fall back — if he doesn't know it, he doesn't say it.
2. **The observation gets specific in a way a template can't.** Not "your product pages" but the actual
   page he opened, the actual part number he typed, the actual query string. That specificity is Track 1's
   entire edge over Track 2.
3. **Subject can drop to two words** and reference the specific thing, since he can guarantee the body
   matches it.
4. **The screenshot question.** The on-file follow-up says *"Screenshot's attached so you can see it
   yourself"* — but the spam lint bans attachments, and an attachment in a cold first touch costs
   deliverability even from an established mailbox. **Recommended: reference it, don't attach it.**
   "I've got the screenshot" gives them a reason to reply, which is the CTA anyway. **Artur's call** —
   if he'd rather attach on Track 1 only, that's defensible at ≤15/day from a warm mailbox, but it must
   never touch Track 2, and the lint checklist below gets a Track-1 exception noted against it.
5. **Reply handling is his, not the tool's.** Track 1 replies land in his real inbox. Suppression still
   has to be logged to the shared list by hand, same day — a Track-1 "stop" that never reaches the
   blocklist will get re-mailed by Track 2 in week five, and that's the single worst failure mode here.

**E1, Track 1, worked example** (brackets are things he fills from the real check, not merge tags):

> [Name] — I typed "who sells [the exact query] " into ChatGPT this morning to see what came back about you. It named [competitor it actually named]. You weren't in it. I've got the screenshot.
>
> Not pitching. Want it, plus the three things on your product pages I'd fix first?
>
> — Artur

**48 words** as written; the brackets shrink, not grow, once he fills them. If the check named nobody
rather than a competitor, cut "It named [competitor]" and write
"Nobody local came back." — never round "no answer" up to "a competitor beat you."

---

## 8. Footer

Goes under the sign-off on **every** send, both angles, both tracks. Excluded from the word count.

```
Artur Shepel · Sale Solution · salesolution.net
17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160
Reply "stop" or use the unsubscribe link and you won't hear from me again.
```

- **The address is pending the NAP-sweep confirm (pre-flight item 8).** Three variants are still live on
  the site; the locked value in `lib/business.ts` is the one above. CAN-SPAM needs it to be correct, not
  just consistent. Don't send until the sweep closes.
- **"Sale Solution" vs "Salesolution" is undecided (F-17).** The footer uses the display brand. If legal
  review prefers the entity form, the compliant expansion is
  `IT Sale Solution LLC, a Florida limited liability company, doing business as Salesolution`.
- The opt-out sentence must work in both directions: the word "stop" typed in a reply, and the sending
  tool's unsubscribe link. Honor either within the same business day. One channel working is not enough.
- **Track-1 variant:** hand-sends from Artur's real mailbox have no unsubscribe link, so the last footer
  line becomes `Reply "stop" and you won't hear from me again.` Reply-stop is the functioning opt-out
  mechanism there — never ship the link wording on a send that has no link behind it.

---

## 9. QA — the three lint gates

This copy passed all three at the time of writing. **Re-run every checklist after any edit**, including
edits that look cosmetic. A word swap is how a banned term gets back in.

### Gate 1 · Spam and deliverability lint

- [ ] Body is **25–75 words** (variables count as one word each; sign-off and footer excluded).
- [ ] Subject is **2–4 words**, all lowercase, no numerals, no percent signs, no brackets, no "Re:" or
      "Fwd:" fakery, no first name, no pitch in the subject.
- [ ] Plain text only. No HTML, no images, no tracking pixel, no attachment. (Track-1 exception, if
      signed, is noted against the specific send.)
- [ ] **≤1 link in the entire sequence**, in E2 only, raw URL with the five campaign UTM parameters. No
      shorteners, no redirect wrappers.
- [ ] No free/guarantee/act-now/limited-time/urgency vocabulary. No countdown, no scarcity.
      ("Free, yours to keep" stays — it describes the snapshot's price, and it's our published wording.)
- [ ] No ALL CAPS, no exclamation marks, no multiple question marks.
- [ ] CAN-SPAM footer present, with the postal address and a working opt-out.
- [ ] Send window respected: working days, 4–7pm local, never two touches in the same hour.

### Gate 2 · Slop lint

- [ ] None of: leverage, utilize, seamless, robust, scalable, holistic, cutting-edge, world-class,
      unlock, supercharge, elevate, empower, game-changer.
- [ ] No "not just X but Y". No rule-of-three padding. No hedging filler ("it's worth noting", "that said").
- [ ] No "I hope this email finds you well", "I came across", "just checking in", "I never heard back",
      "circling back", "touching base".
- [ ] **At most one em-dash per email** — the one after the name. Zero elsewhere. **No semicolons.**
- [ ] Not cold, in any body: schema, GEO, citation share, ERP, PIM, faceted navigation, CTR, coverage,
      pipeline, ARR, impressions, "full-service agency", "digital marketing agency".
- [ ] Reads out loud like Artur on the phone. If a sentence needs a second pass to parse, it's wrong.
- [ ] First-person singular throughout. Signed `— Artur`.

### Gate 3 · Claims lint

- [ ] Every personalized statement traces to a **stored scan datum** with a date. No datum → the written
      fallback body, never an improvised sentence.
- [ ] No client name, no client number, no case-study statistic, anywhere. The proof is their own gap.
- [ ] No guarantee, no ranking promise, no forecast. "Takes a few months" is a timeline, not an outcome.
- [ ] Manufacturer brand names appear **only** in Angle 2, only as `{{brand}}` read off the prospect's own
      line card, nominative use, never implying partnership, authorization, or endorsement — and only
      after gate (b) is signed.
- [ ] Prices, when quoted in a reply, are the published rates only. Never a computed number for their
      catalog before the snapshot has run.
- [ ] Zero banned agency names (`brand/competitor-policy.yaml`, case-insensitive substring match).
      Amazon and "the manufacturers going direct" are fair to reference — that's how the ICP names it.
- [ ] Every scan datum older than 14 days is re-scanned before the send goes out.
