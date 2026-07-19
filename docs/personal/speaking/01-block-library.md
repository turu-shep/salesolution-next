# Block library v1

**How to read a block:** the **Landing** is the pre-decided final sentence — fixed before the take starts; the route can wobble, the destination can't. **Beats** are a sequence, not a script (except blocks marked *verbatim* — those are word-for-word, always). Speak in short sentences; complexity lives in the sequence. A take counts only if it had a planned landing and obeyed forward-only.

**Tags:** `[we]` industrial voice · `[I]` Revenue Engine voice · `[we→I]` the firm is "we" in writing and warm storytelling, but this spoken cold-call block follows the script's first person — "it's me on your account" (guardrail 9) · `[verbatim]` never paraphrase · `[verbatim-adjacent]` structure and key phrases fixed by the script; small connective variation allowed · `[warm-only]` never on a cold call · `[VERIFY]` confirm before live use.

Saturation: a block is done at ~30–40 reps — it becomes warm-up/benchmark, new material takes the load. Track reps in the calendar file.

---

## A — Identity pieces (Tue/Thu rotation)

### A1 · Social spine — "what do you do?" (party version)
**Landing:** "…where their competitors are usually terrible."
**Beats:** one sentence, whole block: "I help unsexy businesses — hydraulics, HVAC, distribution — win online, where their competitors are usually terrible."
**Note:** deliberately a hook, not a category. The follow-up question is the point.

### A2 · Business spine — "what do you do?" (buyer version)
**Landing:** "…from a brochure into their best salesperson."
**Beats:** "We take companies doing five million and up and turn their website from a brochure into their best salesperson."
**Note:** `[we]`. "Five million and up" is the real floor (cards S1/S3) — "a few million" invited the exact prospects canon disqualifies. For local-service listeners, swap voice and object — the Revenue Engine side speaks as "I" (guardrail 9): "I take busy shops and make sure the calls they've already paid for actually book." *(No "every" — canon quantifies answering with "every," never booking; card RE1.)*

### A3 · The three-vertical identity (30s)
**Landing:** "Parts, jobs, chairs — same machine, three trades."
**Beats:**
1. Two kinds of clients. Industrial distributors and manufacturers — the people who sell parts.
2. And local operators — roofers who book jobs, dentists who fill chairs.
3. Different businesses, same problem: buyers ask AI first now, and calls they already paid for slip away.
4. I build the system that fixes both ends.
**Source:** tagline (`lib/business.ts`), operating concept.

### A4 · "How are you different from any other agency?" — the requested landing
**Landing:** "Everyone sells you one piece. I run the whole flow."
**Beats:**
1. Agencies sell activity. Posts, clicks, reports.
2. Each vendor proves their slice fired. None of them owns whether you made money.
3. The leak isn't in any one slice. It's in the seams between them — the lead the ads guy bought that nobody called back.
4. I sell installed systems. I build the machine; it keeps selling after I leave.
**Note:** landing is site canon (`Concept2OnePiece.tsx`) — consistency with what prospects later read is deliberate. One pronoun per take: the version above is the spoken "I" voice; the industrial warm/written version is "We" end to end — "Everyone sells you one piece. We run the whole flow." / "We sell installed systems. We build the machine; it keeps selling after we leave." Never mix inside a take.
**Source:** operating concept, FlowBlock, handoff differentiation beat.

### A5 · The boundary — "what I don't do" (trust block)
Two versions, one per motion — T1's two branches end on different lines. Never both sets in one take.

**A5-RE `[I]`:**
**Landing:** "If any of that sounds like the last guy, tell me and I'll let you go."
**Beats:**
1. No markup on your ads — they run on your account, at cost.
2. I don't resell your leads. No shared pool. Every call recorded and logged to you.
3. *Pause — let the don't-list land (card T1 note).* Then the terms — C8, word for word.
4. Then the guarantee — C7, word for word.
*(Beats 3–4 inherit the C6–C8 [VERIFY] gate — until the terms are confirmed, drill A5-RE as beats 1–2 → pause → landing.)*

**A5-IND `[we→I]`:**
**Landing:** "If it's vague, you walk."
**Beats:**
1. No guaranteed rankings — nobody honest can.
2. Not a big agency that hands you off to a 24-year-old. It's me on your account.
3. If your category's too small or your catalog's a lost cause, I'll say so instead of taking the money.
**Source:** objection library T1 (both branches), industrial script Stage 4 boundary.

### A6 · "Who's this for?" — the honest qualifier `[we→I]`
**Landing:** "Under that, I'll tell you straight it's too early."
**Beats:**
1. Built for owners between five and seventy-five million. You're probably not Caterpillar — you don't need to be.
2. North of five million, a few extra quotes a month pays for the work.
3. Under that, the math doesn't come back fast enough, and I'll say so instead of taking the money.
**Source:** cards S1/S3, ICP doc.

---

## B — Client stories (Tue/Thu rotation) — all `[warm-only]`

### B1 · The long-form Sale Solution story (~25 sentences, 5 beats)
Trained from beats, never memorized verbatim. This replaces the handoff's placeholder version — facts corrected against the ledger.

**Beat 1 — Origin.** Fourteen years building the systems — search, catalogs, content — for technical businesses. The person who builds the machine, not the person who talks about it. *(The number is the published bio: /about/ and `lib/business.ts` both say 14 — a prospect can check.)*
**Beat 2 — The pattern.** Kept meeting great businesses that were invisible online. The work was excellent; the internet had no idea.
**Beat 3 — The niche, with pride.** Boring industries, modern marketing. Deadly combination. Distributors, contractors, industrial — where the competition online is usually terrible.
**Beat 4 — Differentiation.** Agencies sell activity — posts, clicks, reports. We sell installed systems. We build the machine; it keeps selling after we leave.
**Beat 5 — Proof.** A hydraulics distributor. About eight and a half thousand SKUs. Their catalog was built for a web that's gone — the AI couldn't read it, so it credited the manufacturers instead. Their own suppliers. We rebuilt it so the AI could. Qualified leads went from about eighteen hundred a month to about twenty-six hundred in six months. Eight hundred more a month. No new ad spend.

**Landing options (pick before the take):**
- Curiosity hook: "So now the AI's answer cites them — not their suppliers."
- Business version: "Eight hundred more qualified leads a month, and the ad budget never moved."
- Floor handback: "So — who fixes your Google problem?"

**Fact gates:**
- Name stays "a hydraulics distributor" — never "Northern Hydraulics" aloud (naming block, fact ledger).
- Numbers pending CRM confirm (ledger §1) — speak only if they match your records; confirm before recording/publishing.
- The handoff's "AI advisor — a technical salesperson that never sleeps" beat is **not in the ledger** — cut until sourced. The verifiable story is the catalog rebuild and the lead lift.
- The citation outcome (the curiosity hook) is ⚠ in the ledger — the client quote awaits approval, and the source narrative says AI Overviews, not ChatGPT. Speak it as "cited," never "named as who to buy from," and confirm before any recorded telling.
- Don't claim the replatform → catalog sequence as one arc; ordering is unconfirmed (ledger §3).

### B2 · Same story, 30 seconds (the proof beat alone)
**Landing:** "No new ad spend."
**Beats:** hydraulics distributor → catalog AI couldn't read → rebuilt it → ~1,800 to ~2,600 qualified leads a month in six months → landing.

### B3 · The greenfield story (second proof) `[VERIFY]`
**Landing:** "Cited by the AI inside twelve weeks — from a standing start."
**Beats:** a fluid-power manufacturer launching from zero → twenty-two thousand SKUs, built AI-readable from day one → first AI-answer citation inside twelve weeks.
**Gate:** window and citation date unconfirmed (ledger §4). Practice allowed; confirm before telling to prospects.

---

## C — Explanations (Mon/Wed/Fri rotation)

### C1 · Why the AI skips an industrial catalog `[we]`
**Landing:** "All three are fixable. That's the work."
**Beats:**
1. Three reasons, and they stack.
2. Your pages read like everyone's — same manufacturer copy.
3. So the manufacturer looks like the expert, and the AI credits them.
4. And it can't read your catalog anyway — quote-only pricing, scattered data.
**Source:** ICP doc mechanism.

### C2 · The leak, in his words `[I]`
**Landing:** "The money was already spent making your phone ring. The job still walked."
**Beats:**
1. You're not short on leads. You're losing the ones you've already got.
2. The call that rings out while you're on a roof — that homeowner just called the next guy.
**Source:** roofing script Stage 2 hook.

### C3 · How industrial buyers buy now (the villain) `[we]`
**Landing:** "Because they are — across your whole category."
**Beats:**
1. Your buyers — engineers, maintenance, procurement — a lot of them don't start on Google anymore. *(the hedge is canon — script Stage 2)*
2. They ask ChatGPT, or that AI box at the top of Google, "who sells this part." They go with the name it gives.
3. So the phone's quieter and the quotes are thinner.
4. And it feels like Amazon and the manufacturers are eating business that used to be yours.
**Source:** industrial script Stage 2.

### C4 · Bring, Convert, Retain — the whole flow in owner words
**Landing:** "Get found. Win the sale. Keep them coming back."
**Beats:**
1. Three jobs, one machine.
2. Bring the right buyers in — without just spending more on ads.
3. Convert the demand you already have — the calls, the quotes, the carts.
4. Keep and re-sell the customers you already won. Most owners sit on that one.
**Note:** the landing is the site's hero line — say it as the summary, not the opener.

### C5 · Engine vs fuel — "keep your ads guy" `[I]`
**Landing:** "Keep your ads guy. I make his leads actually book."
**Beats:**
1. Ads are fuel. They make the phone ring — and they run on your account, at cost.
2. The engine is everything after the ring: answer in seconds, book it, chase it when it goes cold.
3. Most owners buy more fuel to fix an engine problem.
**Source:** EngineVsFuel, operating concept.

### C6 · The audit offer `[verbatim]` `[I]` `[VERIFY before live]`
> "Free, about 20 minutes. I show you your own numbers — missed calls, how fast you reply, your Google profile, where follow-up drops. Yours to keep whether you hire me or not."

### C7 · The guarantee `[verbatim]` `[I]` `[VERIFY before live]`
> "Here's the guarantee. If the system doesn't bring in more money than it costs you by day 90, I work for free until it does."

### C8 · The terms `[verbatim]` `[I]` `[VERIFY before live]`
> "No 12-month contract. Ninety days to build it, three months minimum so it gets a fair shot, then month to month — leave anytime with 30 days' notice. When you leave, you keep your ad account, your data, and your Google profile. I don't hold any of it."

**C6–C8 rule:** same words every time, practice and live. Never read guarantee and terms as one breath — pause between.

**Wording resolved (2026-07-17):** all three match the objection library's verbatim blocks word for word — the library is their verbatim home. The guarantee core sentence is also verbatim in both call scripts, and the terms verbatim in roofing Stage 4; the scripts phrase the audit offer situationally. "System-attributed revenue" is the written/internal phrasing only; the site deliberately de-jargoned it for clients (`revenue-engine-site-injection-spec.md` §1.6: "Live wording, de-jargoned"), so the plain wording here is correct, not drift. In full pitches the roofing script extends C7 with a tail — *"That's measured on your own dashboard — the calls we caught, the quotes we recovered — not my say-so. On me, not you."* — allowed after the core sentence, which never changes. What the `[VERIFY]` gate still needs is business, not wording: Artur confirms these are the live offer terms before the Wed Jul 29 drill.

---

## D — Sales-call blocks (Mon/Wed/Fri rotation)

### D1 · Industrial cold open `[verbatim-adjacent]` `[we→I]`
> "[Owner], it's Artur — cold call, I'll be 20 seconds and you can hang up on me. I asked ChatGPT who sells [product class] in [region], and it named [competitor], not you. That's the whole reason I called. Want the 20 seconds?"
**Gate:** honesty guard — no Stage 0 research on the account, no leak line. Twenty seconds is the only cold time-promise; don't pad it.
**Source:** industrial script 1D.

### D2 · Revenue Engine cold opens (three variants) `[I]`
Leak first, name second, ask third — every variant. Reject-line once per call, not per sentence.
- **A (voicemail):** "…I called your main line about twenty minutes ago. Rang four times, went to voicemail. I'm Artur. You don't know me. I help roofers stop losing the calls they're already paying to win. Give me ten seconds on why that matters, then you can tell me to get lost."
- **B (dead quote form):** checked the form the way a homeowner would → nothing came back → "that gap is the thing I fix. Ten seconds?"
- **C (after-hours):** "Your Google page says you close at 5. I'd bet the phone still rings after that…"
**Source:** roofing script Stage 1.

### D3 · The industrial three-line pitch `[we→I]`
**Landing:** "One operator, one system."
**Beats (three lines, then the landing):**
1. I make you the company the AI names when buyers ask for your parts — found before they find a competitor or Amazon.
2. I fix your site so it answers them — searchable by part number and spec, pages the AI can read. You stop losing quotes you already earned.
3. One team builds it and runs it. Not ten vendors you have to herd.
**Follow with:** A5-IND boundary block. Then stop.
**Source:** industrial script Stage 4.

### D4 · The Revenue Engine five-part pitch `[I]`
**Landing:** "Your numbers, not my say-so."
**Beats:** answered day or night, a real person → text back in seconds ("whoever replies first usually books the job") → books the estimate, no phone tag → cold quotes chased automatically → the dashboard: calls caught, jobs booked, revenue pulled back.
**Gate:** the answering system "walks them toward booking" — never claim the booking is automatic (card RE1 note). "47 hours" only as industry average, cited LeadSync 2026.
**Source:** roofing script Stage 4.

### D5 · The close + the silence `[we→I]`
**Landing:** "…Which is easier?" *— then nothing.*
**Beats:** "Not a sales meeting — a Growth Call. Thirty minutes. I'll walk you through what the AI says about your category, where you're leaking quotes, and the two or three things I'd fix first. I've got Thursday morning or Friday afternoon. Which is easier?"
**Drill note:** this block trains the pause directly. The take fails if you speak after the ask. First to speak names the time. RE version closes on the audit + two slots, same rule.
**Source:** industrial script 5A, roofing Stage 5.

### D6 · The 90-second phone pitch — Revenue Engine `[I]`
The assembled set-piece. Doubles as the VSL script rehearsal (storyboard: hook → stakes → mechanism → plan → risk reversal → one ask). Marked pauses like sheet music.
**Sequence:** C2 hook (two beats) → *pause* → mechanism: "You've been sold pieces — a website, an ad, a CRM, each by someone who never saw the other two. The leak's in the seams. I run the whole flow." → C5 one-liner → *pause* → D4 plan in one breath → *pause* → C7 guarantee verbatim → C6 audit offer verbatim.
**Landing:** "Yours to keep whether you hire me or not."

### D7 · The 90-second phone pitch — industrial `[we→I]`
**Sequence:** C3 villain (compressed) → "I ran it for your category this morning — it named [competitor], not you" *(only if true)* → D3 three lines → A5 boundary (compressed: no guaranteed rankings, no junior handoff, it's me on the account) → D5 ask.
**Landing:** "Thursday morning or Friday afternoon — which is easier?"

### D8 · Voicemail, 20 seconds `[verbatim-adjacent]` `[we→I]`
One concrete hook, no pitch. The number rule splits by motion: industrial (1B) says your number twice — "I'm at [number]. That's [number again]." — the RE voicemail (H3, roofing branch) gives it once at most; "I'll text them to this number" does the work. Drill for compression: the take fails past 20 seconds.

---

## E — The verbal audit rep (15 min; the consulting-content engine)

Format per handoff: 2 min setup → 5 min diagnosis with narrated reasoning → 5 min PREP recommendation → 2 min what-working-together-looks-like. Best re-records become publishable content — public-content rules apply (no names, hedged claims only).

### E1 · Revenue Engine variant `[I]`
**Setup:** state a real-shaped business aloud (trade, size, lead sources). Invented-but-typical is fine — say so on any published cut ("a typical two-crew roofer").
**Diagnosis (narrate the reasoning):** walk the real audit surface — the phone test ("I'm checking the phone first because speed decides who books the job"), callback timer, Google profile (hours, reviews answered?), the quote-form path. Name what drops where.
**Recommendation (PREP):** point → reason → example → point, built from the five-part plan.
**Landing:** "Plug those two and the rest is bookkeeping."
**Claim gates:** "as many as one in three calls" keeps its hedge; estimate close rates stay qualitative ("a large share of estimates are never followed up"); 47 hours cited as industry average.

### E2 · Industrial variant `[we→I]`
**Setup:** a distributor category + region. *(Spoken reps narrate as "I" — it's you diagnosing live. Any published industrial cut re-voices firm references to "we" per guardrail 9.)*
**Diagnosis:** narrate Stage 0 live — run the buyer query ("I'm asking the AI first because that's where his buyers start"), read who it names, then the catalog check: quote-only pricing? part-number search? manufacturer copy?
**Recommendation (PREP):** the three fixes in plain stakes.
**Landing:** "The AI has one answer. The work is being it."

---

## F — Connective tissue (transitions & repairs — drill inside every take)

- **F1 · Repairs (forward-only):** "Let me put that more simply." · "Simpler version:" · "The short version is this." · "Scratch the setup — here's the point." Never restart the sentence; repair in the next one.
- **F2 · Floor handbacks:** "So — who fixes your Google problem?" · "When's the last time you typed your own parts into ChatGPT?" · hand the floor by name.
- **F3 · Synthesis move (group rooms):** "So really we're all debating X versus Y." Name what's happening; that's the directing move.
- **F4 · The bridge-ask:** "Want me to tell you in three lines what I'd actually do about it?" — permission before the pitch, always.
- **F5 · Honest deflection (price):** "I won't make up a number on the phone — you'd know I was guessing." Routes to the door.

---

## G — Opinions & personal (weekend rotation)

Seed takes — one PREP rep each, landing first. Personal stories: source from the unsaid log, per the handoff.

- **G1:** "Volume SEO is dead for small sites. Authority isn't." *(the DR-10 thesis: on a low-authority site the play is being cited in the AI answer, not out-publishing anyone)*
- **G2:** "Ads are fuel. Owners keep buying fuel to fix an engine problem."
- **G3:** "The dormant customer list is the cheapest revenue a business owns, and almost nobody works it."
- **G4:** "Boring industries are the best clients in the world." *(the niche-with-pride case)*
- **G5:** "A clear accent beats fast native mumbling." *(prosody over perfection — also self-referential practice)*
