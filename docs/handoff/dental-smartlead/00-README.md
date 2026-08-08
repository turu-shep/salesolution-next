# Dental outreach — staged in Smartlead, not started

**Two campaigns, both `DRAFTED`, both parked:**

| Track | Id | Name | Email 1 leads with |
|---|---|---|---|
| base | `3750571` | `Dental — Artur Voice v1 — GATED DRAFT (do not start)` | an observed leak from the passive scan |
| hot | `3750618` | `Dental — Artur Voice v1 HOT (form test) — GATED DRAFT (do not start)` | a real website form test |

Re-cut 2026-08-01 by `scripts/dental-smartlead-setup.mjs`. They hold copy and nothing else. No sending
account is attached to either, no lead is loaded, neither has ever been started. `3750571` is the same
campaign that was staged earlier the same day as *Partner Voice v1* — the founder killed the partner
persona for dental sending, so the script renamed it in place rather than leaving a dead draft behind.

> **No agent may start either campaign.** Not on request, not "just to test." The script that built them
> has no start path and no lead path by design. Starting is a human action in the Smartlead UI, after the
> checklist below, and the copy is still unsigned (§12 is `GATE:HUMAN`).

## Two founder decisions this encodes

1. **Artur is the sender.** The partner persona is retired for dental. First person singular, one operator
   writing to one owner, and the callback number is his.
2. **Evidence is hybrid, and nobody calls.** The whole list gets a passive-scan observation. The hot tier
   additionally gets a real form test on email 1. No dialer, no voicemail, no VA — §6's three calls and the
   LinkedIn touch are not part of this campaign.

## What is staged

Four emails per campaign, transcribed from **§12 of `lib/strategy/docs/dentist-outreach-manual.ts`** — the
Artur-voiced hybrid-evidence drafts. The manual stays the source of truth: the script parses §12 out of the
file rather than carrying its own copy, so re-running it after a manual edit restages the new text, and a
manual edit that breaks the shape fails the script instead of shipping stale copy.

| Step | Delay | Manual day | Subject | Link |
|---|---|---|---|---|
| 1 (base) | on add | day 1 | one thing I saw looking up `{{company_name}}` | none |
| 1 (hot) | on add | day 1 | I sent a question through your website form | none |
| 2 | +3d | day 4 | *blank — threads as a reply* | the UTM'd audit link, verbatim |
| 3 | +5d | day 9 | *blank — threads as a reply* | none |
| 4 | +6d | day 15 | *blank — threads as a reply* | none |

**Steps 2, 3 and 4 are byte-identical across the two campaigns** — verified by read-back, not by eye. Only
email 1 differs. That is what the blank subjects buy: a step with no subject threads as a reply to the one
before it, so the same three follow-ups sit behind two different openers.

Nothing was added: no footer, no unsubscribe line, no styling. Bodies are the manual's paragraphs joined
with `<br><br>`. The audit URL is bare text, not an anchor, so it stays character-identical to §12.

**Schedule** — Mon–Fri, 08:00–11:00, `America/New_York`, on both. Adjustable, and it probably needs
adjusting: §9 binds you to 9am–7pm in the **prospect's** local time, so a list outside Eastern needs a
shifted window or its own campaign.

**Settings** — stop on reply, open tracking off, click tracking off, send as plain text, no unsubscribe
footer text. Click tracking off matters twice over: it keeps the UTM string intact and keeps the link from
routing through a redirector domain, which is what agency mail looks like.

## Slot contract

**Every field is required on every lead on its track. No fallbacks, no defaults, nothing auto-generated.**
A lead missing one is not ready to load — Smartlead will happily mail `{{slot_2}}` as literal text. The
script cross-checks this table against what the copy actually uses and fails the run if a hot-tier field
ever shows up in the base sequence.

| Field | Track | Where | What fills it | Source |
|---|---|---|---|---|
| `{{first_name}}` | both | standard lead field | The owner-dentist's first name. | List build |
| `{{company_name}}` | base | standard lead field | The practice name the way they write it. | List build |
| `{{slot_1}}` | base | `custom_fields` | The primary leak, one finished sentence that can follow a full stop, dated where a date exists. | **Scan output** |
| `{{slot_2}}` | both | `custom_fields` | The second finding, same rules, never a restatement of `slot_1`. On a hot-tier lead the form test carried email 1, so this is the strongest thing the scan found. | **Scan output** |
| `{{form_day_time}}` | hot | `custom_fields` | When the form went in. Written to follow the word *website* with no leading preposition: "last Tuesday at 9:40am". | **Form-test log** |
| `{{form_result}}` | hot | `custom_fields` | What came back and how long it took, in one sentence. Silence counts and is usually the finding. | **Form-test log** |

§12's slot rule governs all of them: fill each from something actually observed, and if you can't, cut the
line. Don't guess it. §6's honesty rule says the same thing harder — the observed leak is the entire edge,
and a bluffed one burns the name.

**The callback number is not a slot.** Artur sends every one of these, so it is the same digits on every
lead. It sits in email 4 as the literal marker `[NUMBER: the line that rings Artur, filled in before
launch]`, visible in the Smartlead editor, and every run of the script prints it under *launch blockers*.
Fill it once, in both campaigns, before anything sends. §11 still has "does the published number ring him
directly" as an open verify item.

**The form-test log is a launch artifact, not an afterthought.** One row per hot-tier practice: submission
timestamp, what was asked, reply timestamp (or none), what the reply said. `{{form_day_time}}` and
`{{form_result}}` are copied out of it, and it is the only defence if a practice ever asks what was sent.
§12 sets the rules for the test itself — a real question, a real name, no invented patient.

## Launch checklist — in order

1. **Artur signs §12.** It is `GATE:HUMAN`, marked "Not approved for sending until Artur signs off." That
   sign-off now covers the Artur-voiced section, not §8 — §8 is superseded for sending and stays on the
   page only in case a partner motion is ever revived. Everything below is blocked until this clears. If
   the copy changes, re-run `node scripts/dental-smartlead-setup.mjs --apply` — it updates both campaigns
   in place, it does not duplicate.
2. **Fill the callback number** in email 4 on both campaigns, after settling the §11 verify item on which
   line it should be.
3. **Senders decision.** Six mailboxes sit on the workspace, all `INACTIVE`, all on `salesolution.co` and
   `salesolution.io`. The standing recommendation is to retire both for outbound and buy fresh domains,
   then warm from zero for **four weeks minimum** before the first cold send. Nothing here shortcuts that.
   Both campaigns draw on the same mailboxes, so plan the throughput across both, not per campaign.
4. **Build the dental list and split it.** Base track needs `slot_1` and `slot_2` per lead; hot track needs
   `slot_2`, `form_day_time` and `form_result`. This is the slow part: every one of those comes from a real
   check per practice, not from a scrape. Hot tier is the smaller list by definition — a form test costs
   real time per practice and creates a record you have to stand behind.
5. **Run and log the form tests** for every hot-tier lead before that campaign gets a single lead loaded.
6. **Suppression / DNC pass.** National DNC scrub, plus the internal do-not-call list, applied across every
   channel. §9 rules 4, 5, and 9. §11 also flags that compliance ownership was never scoped — settle who
   holds the list before volume, not after.
7. **Attach senders** to each campaign.
8. **Add leads** to each campaign, and check no practice is on both lists.
9. **Artur presses Start in the Smartlead UI.** Not the API. Not an agent.

## Known gaps and approximations

- **Cadence is approximate.** §12 runs on *working* days 1/4/9/15. Smartlead counts delays in calendar
  days, so the working-day gaps (3, 5, 6) are used as calendar days. Held strictly, working days 1/4/9/15
  from a Monday are calendar +0/+3/+10/+18. The staged version lands in about two weeks instead of three.
  Change `STEP_DELAY_DAYS` in the script if the longer tail is wanted.
- **`utm_source=partner` in the audit link is now stale.** The link is transcribed verbatim from the
  manual, and the manual kept the string it has always had. It is a one-word edit in §12 followed by
  `--apply` if the attribution should say something else; it is visible to the prospect in the URL either
  way. Left alone deliberately rather than changed under Artur.
- **Two throughput numbers are placeholders.** `min_time_btw_emails: 10` and `max_new_leads_per_day: 20`,
  on both campaigns. The API rejects the schedule without them and the manual specifies neither. Both
  should be re-decided at step 3, alongside the sender count, and they now have to cover two campaigns
  sharing one set of mailboxes.
- **`add_unsubscribe_tag: false` cannot be verified by read-back.** The API accepts it but does not return
  it on `GET /campaigns/:id`. Confirm in the UI that no unsubscribe footer is being appended — §12 has no
  opt-out line and one must not be injected. Opt-outs are handled by hand per §9 rules 5, 9, and 10.
- **§9 was written for phones, not for email at volume.** It covers DNC, quiet hours, recording and
  opt-outs; it says nothing about what a commercial email has to carry (a real postal address, a working
  opt-out). Nothing was invented here to fill that gap. Settle it before the first send.

*Resolved since the last cut:* follow-up threading. §8's literal "Re:" subjects were transcribed verbatim
and started fresh threads that only *read* as replies. §12 writes steps 2–4 with no subject, which is what
Smartlead uses to thread a step as a true reply — confirmed by read-back, the API stores and returns `""`.

## Commands

```
node scripts/dental-smartlead-setup.mjs            # dry-run: print both plans, write nothing
node scripts/dental-smartlead-setup.mjs --apply    # create or update both in place, then verify
node scripts/dental-smartlead-setup.mjs --verify   # read-back assertions only (exit 1 on drift)
node scripts/lib/smartlead.mjs campaigns           # id + status of everything on the account
```

`--verify` asserts, per campaign, that the name matches, the campaign is in a non-sending state, it has
exactly 4 steps, every subject, body and delay matches the manual, and **zero senders and zero leads** are
attached. It is the check to run before and after anyone touches either campaign in the UI. 25/25 passing
on both as of 2026-08-01.

The dry run also fails loudly on manual drift, which is the point of parsing §12 instead of copying it:
an undeclared slot, a hot-tier field leaking into the base emails, a link anywhere but email 2, a missing
email block, or a deleted `GATE:HUMAN` line each stop the run before anything is written.
