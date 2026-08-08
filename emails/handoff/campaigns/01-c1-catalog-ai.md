# C1 — Catalog AI · Angle 1, "the AI answer skips your catalog"

**Written 2026-08-02.** Send-ready copy for the first campaign against
`emails/lists/first-send-200.csv` (pilot) and `emails/lists/seated-v4.csv` (scale).
Spec: `emails/handoff/campaigns/00-sequence-brief.md`. Cleared source copy:
`docs/strategy/industrial-email-campaign/03-angles-and-copy.md`.

**Angle 1 only.** Angle 2 ("you're authorized on lines you barely list") is
unsigned at G3 and appears nowhere in this file. No manufacturer brand name
appears in any body — see "Three bans" below.

**Five touches over 18 days.** Plain text. No images, no pixels, no attachments.
Exactly one link in the whole sequence (E2). A reply is the CTA on every touch.

**Register:** first-person "I", signed `— Artur`. This is deliberate and matches
the source pack. Do not "fix" it to the site's first-person "we".

---

## 1. Merge fields — the whole contract

Only five variables. Every one has a written fallback, and no fallback leaves a
dangling clause.

| Variable | Built from | Fill | When empty |
|---|---|---|---|
| `{{company_display}}` | `company_display` **only** | 100% | Never empty. A row without it does not send. |
| `{{hello}}` | `contact_first_name` | 11 rows (0.4%) | Renders as the empty string. See the capitalization rule below. |
| `{{category_region}}` | `segment` + `city`/`state`, precomputed at export | 100% | Never empty — `segment` is never empty. |
| `{{category}}` | `segment`, precomputed at export | 100% | Never empty. |
| `{{declaration}}` | `self_declaration`, **human-approved excerpt only** | ~23% list-wide, 78% of `first-send-200` | Row routes to body **E1-B** instead of **E1-A**. The declaration appears in no other touch. |

### `{{company_display}}`, never `{{company}}`

The merge tag is named `{{company_display}}` on purpose, so a later export cannot
quietly map `{{company}}` to the lowercase, suffix-stripped join key. If the
sending tool insists on a tag called `company`, load it from the
`company_display` column and say so in the upload notes.

No body uses `{{company_display}}` in the possessive. Roughly a third of these
names end in "s" (Kenco Hydraulics, Price Engineering Co. Inc.) and the
apostrophe reads wrong either way you set it.

### `{{hello}}` and the capitalization rule

`{{hello}}` renders as `Brian — ` (name, space, em-dash, space) or as nothing at
all. **Every body below therefore starts with "I" or with `{{company_display}}`,**
which are capitalized in both states:

- with a name: `Brian — I work with industrial distributors…`
- without: `I work with industrial distributors…`

This is a hard constraint on any future edit. A body that starts "Your buyers…"
renders as `Brian — Your buyers…`, which is wrong, and a body that starts "the
reason…" renders lowercase at the top of an email, which reads as a typo.

**The 11 named rows are better sent by hand.** All 11 sit in Segment A; nine are
President, GM, or President/CEO. Four are inside `first-send-200`
(Brian Hoaglin / TCH Industries, Steve Schwasnick / Western Integrated
Technologies, Mark Garrett / Evolution Motion Solutions, Kelvin Purvis / Airline
Hydraulics), and every one of those four is a sitting President. Route them to
Track 1 (`03-angles-and-copy.md` §7) and let Artur type the name and the
observation himself. `{{hello}}` exists so the automated path never breaks, not
because eleven rows justify a merge field.

### `{{category_region}}` and `{{category}}`

Precomputed columns, built at export. `{{category}}` is the segment default;
`{{category_region}}` is that phrase plus the state, or that phrase alone when
`state` is empty (~1.9% of rows). One column, never blank, always grammatical.

| `segment` | `{{category}}` | `{{category_region}}` example | Empty-state example |
|---|---|---|---|
| A — fluid power / hydraulics | `hydraulic hose and fittings` | `hydraulic hose and fittings in Ohio` | `hydraulic hose and fittings` |
| B — bearings / power transmission | `bearings and power transmission` | `bearings and power transmission in Texas` | `bearings and power transmission` |
| C — general MRO | *their single biggest visible category, from their nav* | `cutting tools and abrasives in Michigan` | `cutting tools and abrasives` |

**Segment C has no safe default.** "Industrial supply" is too broad to read as an
observation and makes the opener sound like a blast. A Segment C row with no
category read off their own nav does not send. That is the source pack's rule
(`03-angles-and-copy.md` §4) and it still holds — Segment C is 1,317 rows of
`seated-v4` and 35 of `first-send-200`, so this is a real cull, not a footnote.

### `{{declaration}}` — approval is a task, not a checkbox

`self_declaration` is the best asset in the file and the most dangerous. Three
rules, all of them load-bearing:

1. **A human eyeballs every one before it merges.** Three negated declarations
   were already caught, including a company that publishes *"We are a
   Non-Authorized Stocking Distributor."* Merging that verbatim ends the campaign.
2. **`{{declaration}}` is an approved excerpt, not the raw column.** Only 144 of
   2,782 rows (5.2%) have `self_declaration_verbatim == true`, and **even those
   contain scraped nav junk.** Real examples from `first-send-200`, all flagged
   verbatim-true: *"0 Skip to Content Home Products About Us CONTACT US Open Menu
   Close Menu…"* · *"[endif]--> Menu Home About Employment Opportunities…"* ·
   *"Saturday, Sunday: Closed 24 Hour Emergency Service: (407) 851-3536…"*.
   Budget the review time. Expect to reject a large minority.
3. **Shape of an approved excerpt:** a contiguous substring of
   `self_declaration`, byte-exact, 4–14 words, reads as a boast in their voice,
   no navigation text, no phone numbers, no negation, no manufacturer brand name
   (see the bans). It has to survive being read back to them on a call.
4. **It must be a noun phrase that completes "calls itself ___".** Strip a
   leading "We are" or "X is" — the E1-A sentence supplies the verb. `We are a
   master distributor for many products` gets approved as `a master distributor
   for many products`. Stripping leading words is the only edit permitted; every
   word that survives is byte-exact from their page.

Good ones already in the file, quotable as-is:

- Geiger Pump & Equipment — `a large, factory authorized distributor for the entire line of John Crane products` *(cut the brand: use `a large, factory authorized distributor`)*
- Price Engineering — `a leading distributor and fabricator of industrial hoses`
- Kerr Pump & Supply — `the oldest pump distributor in Michigan`
- Hydraulic & Pneumatic Sales — `a stocking distributor`
- Great Lakes Industrial — `a full-service distributor of o-rings, seals, gaskets, hoses, fittings`

Store the approved excerpt in a new export column (`declaration_approved`) with
the reviewer's initials and the date. Anything not approved is empty, and empty
routes the row to **E1-B**. No improvising at send time.

---

## 2. Three bans, stated here so an editor can't miss them

1. **Never quote a SKU count.** `sku_estimate` is 53.6% filled and 0.60 precise.
   It orders the send queue. It never reaches a prospect. No "about 2,000 part
   numbers", no bands, no "a fraction of".
2. **Never state a federal award dollar figure.** 16% of matched rows inherit a
   parent company's total. Product-category descriptions are safe; dollars are
   not. No body in this sequence goes near either.
3. **Never quote a `self_declaration` a human hasn't read.** See §1.

**A fourth, from the source pack's Gate 3:** manufacturer brand names appear only
in Angle 2, and only after G3(b) is signed. G3 is unsigned, so `brand_authorized`
**does not appear in any body in this file** — not as a named brand, not as a
count, not as "the lines you carry". Use it to rank the send queue and to spot a
row whose declaration needs a closer look. That leaves one open decision for
Artur, filed rather than assumed: *is a purely nominative brand mention ("you're
a Parker house") allowed outside Angle 2, or does G3(b) cover every outbound
mention of a manufacturer?* Until he answers, treat it as covered.

**On `ecommerce_class`:** `catalog_no_cart` is 80.6% of `seated-v4` and 99% of
`first-send-200`, and it is the offer's thesis. It is a classifier output with no
published precision, so no body states it as a fact about their site. E3 carries
the quote-only-pricing idea as a **market claim about industrial catalogs**, the
same way the source pack carries "forty versions" — a claim about how the copy
travels, not a claim about this prospect. Do not sharpen it into an observation.

---

## 3. The sequence

### C1-E1 · day 0 — the mechanism and one question · no link

Two bodies. The row takes **E1-A** if `declaration_approved` is populated,
**E1-B** if it is empty. This is a list split at export, not a Smartlead
fallback expression — the sentence changes, not a word inside it.

**Subjects:** `your product pages` · `the ai answer` · `how buyers search now` · `catalog question`

*(All subjects in both files follow the same rule: 2–4 words, all lowercase, no
numerals, no percent signs, no brackets, no fake "Re:", no first name, no pitch.)*

> **Not** `who the ai names` or `checked your catalog`. Both imply we ran an
> AI-answer check on their company. We have no such data on this list, and a
> prospect who replies "so what did it say?" would catch us inventing it. Those
> subjects belong to the source pack's Opener A, which needs a stored scan datum.

**BODY — E1-A** (`declaration_approved` present · ~23% of `seated-v4`, ~78% of `first-send-200`)

```
{{hello}}{{company_display}} calls itself "{{declaration}}."

Your buyers still ask ChatGPT who sells {{category_region}} before they call anybody, and it names one or two distributors. Being the real thing doesn't get you into that answer. The pages do.

Has anyone checked whether it names you?

— Artur
```

**44 words.** Merge: `{{hello}} {{company_display}} {{declaration}} {{category_region}}`.

**BODY — E1-B** (no approved declaration · ~77% of `seated-v4`)

```
{{hello}}I work with industrial distributors on one narrow problem. A buyer asks ChatGPT who sells {{category_region}}, it names one or two companies, and most catalogs never make that answer. The product copy came from the manufacturer, and every distributor on that line runs the same text.

Has anyone checked whether it names {{company_display}}?

— Artur
```

**54 words.** Merge: `{{hello}} {{category_region}} {{company_display}}`.
Built on the source pack's cleared Opener B. Nothing here is an observation about
their company, which is the point — it claims nothing, so it can't claim wrong.

---

### C1-E1-COHORT-E · day 0 — the manufacturer-directory variant · no link

**Runs as its own campaign.** 232 rows in `seated-v4`, 47 in `first-send-200`.
Their email was published by a manufacturer's distributor locator, not by the
dealer, so the reader is not expecting mail at that address and may not be the
right person at all. Bounce risk is unmeasured against a 2% kill line. Isolated,
a bad batch gets killed; blended, it poisons every domain.

Provenance is real and specific: `email_source` on these rows is a manufacturer's
locator (Enerpac 63, SPX Flow 36, Dorner 36, Kennametal 17, Ballymore 16, Quincy
11, NORD 10, Banjo 6, Lovejoy 3, Timken). The body says so without naming the
manufacturer, because naming one is a brand mention and G3(b) is unsigned.

**Before this sends:** drop the 39 rows whose `email_source` starts
`voided:manufacturer-inbox:` (34 NORD, 5 DFS). Those addresses were voided as
manufacturer inboxes, and mailing a manufacturer to pitch their dealer is the
worst outcome available.

**Subjects:** `wrong inbox` · `right person there` · `who handles this` · `found your listing`

**BODY**

```
{{hello}}I got this address off the {{company_display}} listing in a manufacturer's distributor locator, so it may be the wrong inbox. Tell me and I'll fix it or drop it.

The reason I'm writing: buyers now ask ChatGPT who sells {{category_region}}, and it names one or two companies. Most distributor catalogs never make that answer.

Has anyone there checked whether it names you?

— Artur
```

**63 words.** Merge: `{{hello}} {{company_display}} {{category_region}}`.

The wrong-inbox line does two jobs. It explains why the mail arrived, which is the
thing this cohort will otherwise wonder about all the way to the spam button. And
it makes "you've got the wrong person" a reply, which routes the contact and
counts as engagement.

Cohort E takes **E1-B's** body shape from E2 onward — no declaration variant, on
the grounds that a cohort with an unverified address should carry the fewest
claims. Touches E2 through E5 are otherwise identical to the main sequence.

---

### C1-E2 · day 3–5 — the artifact · the sequence's only link

**Subjects:** `something to keep` · `sample rewrite` · `easier to show` · `five of your products`

**BODY**

```
{{hello}}I'd rather show you than argue about it. Five of your real products, rewritten two ways side by side, plus what a crawl of the whole catalog turns up. Two business days, free, yours to keep.

https://salesolution.net/catalog-snapshot/?utm_source=coldemail&utm_medium=email&utm_campaign=catalog-{{segment}}&utm_content=e2

Want me to run it on {{company_display}}?

— Artur
```

**45 words** (the URL counts as one). Merge: `{{hello}} {{segment}} {{company_display}}`.
This is the source pack's cleared E2 *fallback* body, which is the right one:
the probe-score version needs a `{{probe_score}}` this list does not carry.

**Link discipline.** This URL, with these five parameters, is the only link in the
sequence. Paste it raw. No shorteners, no redirect domains, no tracked-link
wrappers. `{{segment}}` is the only variable inside it and it is never blank.

**Blocked on G6.** `/catalog-snapshot/` has an unresolved URL-stability decision
(PF-4), its fit box says $2M–$50M against this campaign's $5M–$75M (PF-2), and it
carries two different SKU floors (PF-3). A prospect who clicks reads all of it.

---

### C1-E3 · day 8–10 — why it happens · no links

**Subjects:** `same page everywhere` · `the duplicate problem` · `why it skips you` · `boring reason`

**BODY**

```
{{hello}}I'll tell you why this happens, and it's boring.

Your {{category}} pages run the manufacturer's copy. So does every other distributor carrying that line. The AI reads forty versions of the same paragraph and keeps one. Usually the manufacturer's own site.

You get skipped for writing what they sent you.

Want me to show you yours?

— Artur
```

**57 words.** Merge: `{{hello}} {{category}}`.

The source pack's cleared E3, with two changes: the opener was rebuilt to satisfy
the capitalization rule, and "hits forty versions" became "reads forty versions".
Neither changes a claim.

*Provenance of "forty versions":* our own published line on `/services/catalog-ai/`
— "AI engines deduplicate it across the 40+ distributors who all use the same
text." It's a market claim about how the copy travels, not a count of this
prospect's competitors. Don't sharpen it.

---

### C1-E4 · day 13–15 — the fork · no links

**Subjects:** `not now or never` · `bad timing` · `where this stands` · `yes or no`

**BODY**

```
{{hello}}I'd rather have a no than a maybe. Is this a not-now, or a not-ever? Either answer is useful and I'll act on it.

The only reason I wouldn't sit on it: this work takes a few months to move an AI answer. Waiting doesn't shrink the job. It moves the payoff.

Which is it?

— Artur
```

**56 words.** Merge: `{{hello}}` only. No data dependency, so this touch always sends.

"Takes a few months to move an AI answer" is a timeline statement, not a promise
that it will move. Don't tighten it into a forecast.

---

### C1-E5 · day 18 — the exit · no links

**Subjects:** `closing the loop` · `last one from me` · `off your list` · `stop or timing`

**BODY**

```
{{hello}}I'll stop after this one.

Should I stop reaching out, or is this just bad timing? Either is fine. Say stop and you're off my list today, calls included.

If it's timing, tell me when and I'll make a note for then.

— Artur
```

**45 words.** Merge: `{{hello}}` only.

**"Calls included" is a promise in writing.** A negative here has to suppress
globally and same-day across email, the dialer, and LinkedIn. **There is no
suppression list in the repo at all** — the join is built, the data does not
exist. Either that gets built before the first send, or this clause comes out.
Shipping the promise without the mechanism is the one failure in this file that
a prospect can prove.

---

## 4. Footer

Under the sign-off on every send. Excluded from the word count.

```
Artur Shepel · Sale Solution · salesolution.net
17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160
Reply "stop" or use the unsubscribe link and you won't hear from me again.
```

Address is pending the NAP sweep (PF-8, gated at G6). CAN-SPAM needs it correct,
not just consistent. The opt-out has to work both ways — the word "stop" typed in
a reply, and the tool's unsubscribe link — honored the same business day.

---

## 5. Send shape

- **Micro-campaigns of ≤50 contacts**, grouped by segment and body variant so the
  observation slot stays consistent inside a batch.
- **1–2 contacts per company, hard cap.**
- **Cohort E in its own campaign**, always. 232 rows in `seated-v4`.
- **T4 ($2–5M, 154 rows) reported separately.** That band rarely absorbs
  $10–30K. Its silence is not a copy result and must not be read as one.
- **Working days, 4–7pm local. Never two touches in the same hour.**
- **`thehoseshop.com` is two companies in one row.** Split it or fix its NAP
  before it sends.

---

## 6. Rationale

E1 makes no claim about their company that we can't show them the source for,
because this list carries no AI-answer check and no readiness score — so the
touch trades a specific observation for a specific mechanism, and asks a question
only they can answer. E2 converts curiosity into an artifact they keep whether or
not they buy, which is the cheapest way to be worth replying to and the only
place a link is worth the deliverability cost. E3 answers the question E1 planted
("why wouldn't it name us?") with an explanation that blames the manufacturer's
copy rather than the reader, so the escalation is toward relief instead of
pressure. E4 stops selling and asks for a decision, because a distributor who has
read four emails and not replied is either busy or uninterested and both are
worth knowing. E5 hands back the permission, on the theory that the list is
finite and the domains are not — a clean opt-out costs one contact and a
complaint costs the sending domain. Five touches over 18 days, against the prior
campaign's twelve over the same addresses that produced 4,899 sends and zero
replies.

---

## 7. Nothing sends until these clear

1. **No suppression / DNC list exists.** Blocks E5's "calls included" and the
   whole campaign.
2. **Sender warmup has never run.** Not "is off" — never, since 2024. Four weeks
   from zero.
3. **Both current domains should be retired.** 4,899 sends, 204 opens, zero
   replies, a flat 3–5% open rate across all twelve steps. That is the signature
   of mail that never reached an inbox, and no copy fixes it.
4. **G6 pre-flight items** — PF-2, PF-3, PF-4, PF-8 — gate the E2 link and the
   footer.
5. **The 39 `voided:manufacturer-inbox:` rows** come out of Cohort E first.
6. **`thehoseshop.com`** splits first.
7. **`declaration_approved` review pass** must be complete for any batch that
   uses body E1-A.
