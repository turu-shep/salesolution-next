# Session runner — how a training session actually runs

This is the executable layer. The library holds the material, the calendar holds the schedule — this file is the hour itself. Two modes: **with Claude live** (preferred — open a session in this project) or **solo** (dice + the topic bank). Same session either way.

## The daily shape (~2–2.5h total, 30 takes)

| When | What | Takes |
|---|---|---|
| Morning (15–20 min) | Warm-up — full routine, exercise by exercise: [07-how-and-why.md](./07-how-and-why.md) | — |
| Evening session (19:45–20:45) | New block · maintenance · roulette · cold drills | 8 + 8 + 6 + 4 |
| Evening (~20 min) | Re-record the day's 4 worst moments · review best + worst take only · write ONE fix · unsaid log (1 thought → the 30s version) | 4 |

**Quality gate, every take:** landing pre-decided before speaking, forward-only obeyed. No landing, no count. Phone-material blocks (D-series): audio-only, standing. Video everywhere it's frictionless.

**Voice stop-signal:** tight, scratchy, throat-clearing urge → end the block. Hoarseness >2 weeks → SLP, per `10-learning-and-skills.md`.

---

## Mode 1 — with Claude (open a session in this project and type these)

| You type | Claude does |
|---|---|
| `run today` (or `train Mon Jul 20`) | Serves the day's sheet from [05-week3-sessions.md](./05-week3-sessions.md) section by section. Roulette draws and cold topics stay hidden until you ask. |
| `draw` | One roulette card from today's pool, delivered **in the prospect's voice** with a one-line scenario ("Mike, roofer, two crews, you woke him from a nap: *'Not interested.'*"). You answer out loud, recorded. Draws are blind — Claude never previews the pool order. |
| `canon` | Reveals the card you just drew: canon ID, the word-for-word line, the door. You read it aloud twice, re-record once. |
| `spar` (or `spar T1`) | Full text sparring: Claude plays the prospect, pushes back **twice**, then holds the line. Then a debrief against the canon card — where you drifted, whether you hit the door. |
| `cold` | One zero-prep topic (never from a list you've seen). 60–90s take, landing-first: 5 seconds to pick the final sentence, then speak. |
| `score:` + pasted Whisper transcript | Fixed format, no praise inflation: restarts/min → completion rate → fillers/min → landing hit y/n → open/close strength & dead-ends. Then **exactly ONE drill for tomorrow.** Never a list. |
| `log` | Walks the group-session post-event log (reacting vs directing minutes, one directed moment, one yielded moment, names used). |
| `week done` | Sunday: compares the week's scores, names the week's ONE theme, generates next week's session sheets. |

**Claude's standing rules in this project** (from the methodology handoff — not re-litigated):
- Score hard. One drill, not a list. Direct correction, no praise inflation.
- As the prospect: two pushbacks, then hold the line. Stay in character until the door or the hang-up. Debrief only after.
- Never feed a line mid-take. Repairs are Artur's job (F1), forward-only.
- Any new line drilled must pass the README guardrails — no client names aloud, claims per the claims library, never a cold price, no jargon cold.
- From month 2: flag when cold takes converge with rehearsed takes — that's the skill generalizing, say so once.

## Mode 2 — solo (no Claude open)

- **Roulette draws:** number five index cards (or use the week's pool size), shuffle face-down, draw. Six draws from a five-card pool means one repeat — fine, saturation is the point. Answer cold, *then* open the card in [02-objection-roulette.md](./02-objection-roulette.md), read the canon line twice, re-record once.
- **Cold topics:** roll/RNG a number **first**, then open [06-cold-topic-bank.md](./06-cold-topic-bank.md) and read only that line. Never browse the bank.
- **Scoring:** run Whisper verbatim (fillers on), score yourself against the template in [03-training-calendar.md](./03-training-calendar.md), or paste the transcript into a session later with `score:`.

---

## The take, anatomized (same every time)

1. **Pick the landing.** Say the final sentence in your head. That's the only pre-planning allowed.
2. **Speak.** Short sentences. Complexity lives in the sequence. A structural flaw mid-sentence → finish ugly, repair forward ("Simpler version:"). Never restart.
3. **Silence over fillers.** A deliberate 1–2s pause where the "e-e-e" wants to go. Awkward is correct.
4. **Stop on the landing.** If you talked past it, the take failed — log why, don't redo immediately.

## Failure modes → the counter-drill

| You notice | Tomorrow's drill |
|---|---|
| Restarted a sentence | 8-word sentence cap on every take tomorrow |
| Landed somewhere else | Say the landing OUT LOUD before each take tomorrow |
| Fillers clustering at transitions | F1 repair phrases as the warm-up PREP reps |
| Talked past the landing | D5 silence drill: one take, stop dead at the ask, hold 5s |
| Cold takes much worse than rehearsed | Double the cold slot tomorrow (8 cold, 0 maintenance) |
