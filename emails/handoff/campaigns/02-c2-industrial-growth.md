# C2 — industrial growth · the services book → Book a Growth Call

**Written 2026-08-02.** Second campaign against the same list. Spec:
`emails/handoff/campaigns/00-sequence-brief.md`. Voice SSOT:
`.agents/product-marketing-context.md`. Source pack:
`docs/strategy/industrial-email-campaign/03-angles-and-copy.md`.

**Sends ~1 month after C1 finishes, to C1 non-responders only.** Anyone who
replied, booked, asked to stop, bounced, or opted out is out. So is anyone who
clicked the C1 snapshot link — they go to reply handling, not to a second cold
sequence.

**Four touches over 14 days.** Plain text. No images, no pixels, no attachments.
One link in the whole sequence (E2). A reply works everywhere.

**Why four and not five.** These addresses will already have taken five emails
from us and answered none. A second five-touch run on the same inbox is the
twelve-email shape in disguise, and that shape is exactly what produced 4,899
sends and zero replies on these domains. Four is the concession.

**Register:** first-person "I", signed `— Artur`. Same as C1.

**Angle 2 ("you're authorized on lines you barely list") does not appear here
either.** It is unsigned at G3. No manufacturer brand name appears in any body.

---

## 1. Merge fields

Three variables. Fewer than C1 on purpose: C2 is positioning, and positioning
copy that leans on personalization reads like it's hiding something.

| Variable | Built from | Fill | When empty |
|---|---|---|---|
| `{{company_display}}` | `company_display` **only**, never the `company` join key | 100% | Never empty. A row without it does not send. |
| `{{hello}}` | `contact_first_name` | 11 rows (0.4%) | Renders as the empty string. |
| `{{segment}}` | `segment` | 100% | Never empty. UTM only, not a copy slot. |

**`{{declaration}}` is deliberately absent.** Quoting a dealer's own sentence back
at them lands once. Doing it twice, a month apart, reads as a script rather than
a person. C1 spends that asset; C2 does not.

**`{{category_region}}` is absent too.** C2's subject is the business, not the
parts. A category slot would make it read like C1 with a different coat of paint,
which is the failure mode this campaign exists to avoid.

**Capitalization rule carries over from C1.** `{{hello}}` renders as `Brian — ` or
as nothing, so every body starts with "I" or with `{{company_display}}`. A body
that starts "Your…" renders as `Brian — Your…`, which is wrong. Any future edit
has to hold this.

**The 11 named rows still belong on Track 1** — hand-sent by Artur, name typed
rather than merged. Nine of the eleven are President, GM, or President/CEO; four
of them sit in `first-send-200` and all four are sitting Presidents.

---

## 2. Bans, carried forward unchanged

1. **No SKU count, ever.** `sku_estimate` is 53.6% filled at 0.60 precision. It
   ranks the queue and never reaches a prospect.
2. **No federal award dollar figure.** 16% of matched rows inherit a parent
   company's total.
3. **No `self_declaration` quote a human hasn't read.** Not used in C2 at all.
4. **No manufacturer brand names.** G3(b) is unsigned. `brand_authorized` ranks
   the queue; it does not appear in copy.

**One more, specific to C2:** the industrial side of the business carries a
**no-guarantee stance**, unlike the Revenue Engine. No guarantee, no ranking
promise, no forecast, no case-study statistic, no client name. E3 leans on that
explicitly and it is the strongest touch in the sequence because of it.

**And a routing rule:** no contact in this campaign ever sees a Revenue Engine
door. Industrial only. The CTA is `/book-growth-call/`.

---

## 3. The sequence

### C2-E1 · day 0 — the honest re-contact and the two-sided question · no link

**Subjects:** `two sides` · `which one is it` · `different subject` · `the other problem`

**BODY**

```
{{hello}}I wrote last month about product pages and AI answers. Different subject today.

Almost every owner I talk to is stuck on one of two sides. Not enough coming in: quieter phone, fewer quotes, Amazon taking work that used to be yours. Or too messed up to handle what does come in. Quotes nobody chased. A site nobody can search.

Which one is {{company_display}}?

— Artur
```

**65 words.** Merge: `{{hello}} {{company_display}}`.

Naming the earlier campaign in the first line is the point. These people are
being mailed twice by the same stranger; saying so costs one sentence and buys
the only thing a second cold sequence can trade on. The two sides are Artur's own
framing, verbatim from the locked ICP doc, in the owner's words rather than a
marketer's.

**Cohort E inflection.** Not a separate body. Cohort E stays isolated in C2 as it
was in C1 — its own campaign, its own bounce accounting. Their C1 touch already
flagged the address provenance, so this touch changes one line and nothing else.

**FIRST LINE ONLY — replace** `{{hello}}I wrote last month about product pages and AI answers. Different subject today.`
**with** `{{hello}}I wrote last month to this address, which I got off your listing in a manufacturer's distributor locator. Different subject today.`

The rest of the body is unchanged; the Cohort E version runs **72 words**. Still
no manufacturer named. If that cohort's C1 bounce rate came in over 2%, C2 does
not run to Cohort E at all.

---

### C2-E2 · day 4 — what I actually do · the sequence's only link

**Subjects:** `six things` · `what i actually do` · `one operator` · `no deck`

**BODY**

```
{{hello}}I do six things for industrial distributors. Getting named in the AI answer. Product pages an AI can read. Articles that get you cited. A site people can search. Cold email that gets answered, which is what you're reading. And running all of it, when you'd rather not hire five vendors.

Twenty minutes on a call: https://salesolution.net/book-growth-call/?utm_source=coldemail&utm_medium=email&utm_campaign=growth-{{segment}}&utm_content=e2

Or just reply with the one you'd need first.

— Artur
```

**67 words** (the URL counts as one). Merge: `{{hello}} {{segment}}`.

The six map one-to-one onto the services book, translated out of the jargon the
ICP treats as friction:

| In the email | The service |
|---|---|
| Getting named in the AI answer | AI Search & GEO |
| Product pages an AI can read | Catalog AI |
| Articles that get you cited | Editorial Authority |
| A site people can search | Website Development |
| Cold email that gets answered | Outbound Email |
| Running all of it | Full Growth Ownership |

"Which is what you're reading" is the whole touch. A cold email that admits it's
a cold email, from someone who sells cold email, is the only demo available in a
plain text message. It also pre-empts the obvious objection instead of waiting to
answer it on a call.

**Blocked on G7.** The booking destination is unconfirmed —
`NEXT_PUBLIC_CALENDLY_URL` vs `/book-growth-call/`. This body uses
`/book-growth-call/`. If Artur picks the Calendly URL, swap it here and in the
reply templates, and keep the same five UTM parameters.

**Link discipline.** One link in the sequence, raw, no shortener, no redirect
domain, no tracked-link wrapper. `{{segment}}` is the only variable inside it and
it is never blank.

---

### C2-E3 · day 9 — what I don't do · no links

**Subjects:** `what i don't do` · `saving you a call` · `the short list` · `before you ask`

**BODY**

```
{{hello}}I'll save you a discovery call. What I don't do:

No guaranteed rankings. No promise about lead counts. I don't rebuild the system you run the business on. And I don't take the work if the catalog is too small to pay for it.

If you've been burned before, that list is the useful part. Worth twenty minutes?

— Artur
```

**59 words.** Merge: `{{hello}}` only. No data dependency, so this touch always
sends.

> **Do not "fix" the phrase "No guaranteed rankings."** A slop-lint run flags it
> as a kill-list hit. The kill-list bans *promising* guaranteed rankings; this
> line refuses them, which is the touch's whole job. Same for "No promise about
> lead counts."

Every line is a published position, not a new one. No guaranteed rankings and no
forecast is the industrial no-guarantee stance. "I don't rebuild the system you
run the business on" is the plain-stakes version of the delivery promise — we
hand over Shopify CSV, Magento XML, BigCommerce, or a mapping built against their
export. **The words ERP and PIM never appear**, in either direction; if the
prospect says PIM first, mirror their word, don't introduce it. The last line is
the real disqualifier from the offer: under the SKU floor, the minimum doesn't
amortize and they're better served by a tool.

Naming what you don't do is the fastest trust signal available to a burned buyer,
which is most of this list.

---

### C2-E4 · day 14 — three answers and the exit · no links

**Subjects:** `three answers` · `off your list` · `last one from me` · `timing or never`

**BODY**

```
{{hello}}I'll make this easy and then leave you alone.

If the timing is wrong, tell me when and I'll write it down. If it's never, say stop and you're off my list today, calls included. And if you're curious but not ready, reply with the one number you'd want moved and I'll tell you straight whether I can move it.

Any of the three is a good answer.

— Artur
```

**69 words.** Merge: `{{hello}}` only.

C1's fork and C1's breakup are one touch here. A contact who has taken nine
emails from us across two campaigns and answered none has earned a single
message that asks for a decision and hands back the permission in the same
breath, not two more.

**"Calls included" is a promise in writing.** Same condition as C1-E5: a negative
has to suppress globally and same-day across email, the dialer, and LinkedIn.
**There is no suppression list in the repo** — the join is built, the data does
not exist. Build it or cut the clause. This is the last email these addresses get
from us, which makes it the one most likely to draw a "stop", which makes the
mechanism behind the promise matter more here than anywhere else in either
sequence.

---

## 4. Footer

Under the sign-off on every send. Excluded from the word count. Identical to C1.

```
Artur Shepel · Sale Solution · salesolution.net
17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160
Reply "stop" or use the unsubscribe link and you won't hear from me again.
```

Address pending the NAP sweep (PF-8, gated at G6).

---

## 5. Send shape

- **Micro-campaigns of ≤50 contacts**, grouped by segment.
- **1–2 contacts per company, hard cap.** Same contacts as C1 — C2 is not an
  excuse to add a second reader at a company that already ignored one.
- **Cohort E in its own campaign**, and only if its C1 bounce rate stayed under 2%.
- **T4 ($2–5M, 154 rows) reported separately.**
- **Working days, 4–7pm local. Never two touches in the same hour.**
- **Suppression from C1 applies first**, before any list is cut.

---

## 6. Rationale

E1 says out loud that this is the second time we've written, because the reader
already knows and pretending otherwise is the tell; then it drops the catalog
subject entirely and asks the one question the ICP doc says every owner can
answer about themselves, which makes a reply cheap. E2 answers "who are you" with
six plain-language services and one self-aware line — the email is itself an
example of one of them — and spends the sequence's single link on a call rather
than an artifact, because C2 sells a relationship and C1 already spent the
artifact. E3 escalates by giving something up instead of asking for more: four
things we won't do, which is the fastest way past an agency-burned buyer's guard
and the only touch where the industrial no-guarantee stance is an advantage. E4
collapses C1's fork and breakup into one message, because a contact who has taken
nine emails across two campaigns without answering has earned a decision request
and an exit in the same breath, not two more sends. Four touches over 14 days
against a prior twelve-step sequence that produced zero replies on these domains.

---

## 7. Nothing sends until these clear

1. **C1 has to finish and be measured first.** C2's audience is defined as C1
   non-responders. There is no C2 list until there is a C1 result.
2. **No suppression / DNC list exists.** Blocks E4's "calls included" and blocks
   building the non-responder cut cleanly.
3. **Sender warmup has never run** — not "is off", never, since the mailboxes
   were created in 2024.
4. **Both current domains should be retired.** 4,899 prior sends, 204 opens,
   zero replies, flat 3–5% open rate across all twelve steps. That is mail that
   never reached an inbox, and no copy fixes it.
5. **G7** — confirm the booking link in E2.
6. **G6 / PF-8** — the footer address.
