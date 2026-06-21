import type { PathStep } from './types'

/**
 * The step-by-step path from zero to first booked calls, tuned for a first-time
 * caller who is a non-native English speaker with a voice that needs conditioning.
 * Each stage has concrete actions, voice + non-native notes (from clinical/coaching
 * sources), and a "ready when" gate. The learner checks off stages on /sales/learn.
 */
export const PATH: PathStep[] = [
  {
    id: 'stage-0',
    stage: 0,
    title: 'Understand the game (no dialing yet)',
    outcome: 'You know exactly what you’re doing and why, before you risk a single call.',
    doThis: [
      'Read the cockpit script for your first motion — start with Revenue Engine (roofers).',
      'Read the psychology manual’s first two sections: what it really is, and frames & status.',
      'Learn the one rule cold: you’re booking the next step, never selling.',
      'Know your offer: what the audit is, the guarantee, the terms — verbatim.',
    ],
    nonNativeNote:
      'Read everything out loud, not just with your eyes. From day one you’re training your mouth, not only your understanding.',
    readyWhen: [
      'You can explain, in one sentence, what you’re booking and why you never sell on the call.',
      'You can state the guarantee and terms verbatim.',
    ],
    buildsSkills: ['two-motions', 'know-your-offer', 'frames-status'],
  },
  {
    id: 'stage-1',
    stage: 1,
    title: 'Get the instrument working (voice & English)',
    outcome: 'Your voice lasts a block, sounds calm, and a stranger understands every word.',
    doThis: [
      'Do a 5-minute vocal warmup before every practice session: straw or "ooo" phonation, gentle hums, lip trills, easy pitch glides — all relaxed, never pushed.',
      'Drill belly breathing: hand on the belly, inhale so it pushes out, exhale slow on "sss." Five reps. Your voice should ride on breath, not throat.',
      'Slow your speaking pace down on purpose; record yourself reading the opener and listen for rushing or rising (question-y) endings.',
      'Shadow a clear, slow English speaker 10–15 minutes a day — play a line, repeat it immediately, copy the rhythm and where the stress lands.',
    ],
    voiceNote:
      'Warm up first, water within reach, keep the volume conversational — loudness should come from breath, not a squeezed throat. Take a water + 20-second silence break every 20–30 minutes, and STOP the session the moment the voice feels tight or scratchy. Pushing a tired voice is how it gets injured.',
    nonNativeNote:
      'Clarity beats sounding native — and it’s mostly about prosody, not perfect sounds. Hit the content words (nouns, verbs, numbers) hard; let the little words (the, of, to) go light. Drop your pitch on the last word of every statement (↓), and rewrite any line that makes you fight a hard sound. Clear + calm + prepared wins; you do not need a perfect accent.',
    drills: [
      'Record your opener daily; have someone mark any word they couldn’t catch; drill those words.',
      'Read the opener at half your instinct speed — it should sound natural, just calmer.',
    ],
    readyWhen: [
      'A friend understands every word of your opener on the first listen.',
      'Your voice still feels fine at the end of a 30-minute reading session.',
      'A recording of you sounds calm and unhurried, not rushed or strained.',
    ],
    buildsSkills: ['vocal-warmup', 'pace-pause', 'clarity', 'tonality'],
  },
  {
    id: 'stage-2',
    stage: 2,
    title: 'Put the words in your mouth (drill the script)',
    outcome: 'The opener and key lines come out of your mouth without you reading them.',
    doThis: [
      'Memorize the 3 opener variants for your first motion.',
      'Memorize the verbatim blocks: the guarantee, the terms, the audit offer.',
      'Drill the four comebacks every opener hits: "who is this?", "not interested", "what’s it cost?", "just email me".',
      'Cover the page and say each from memory, out loud, slowly.',
    ],
    nonNativeNote:
      'Scripting is your advantage, not a crutch. Every line you have word-perfect is one you don’t have to compose in English mid-call — that means clearer speech, fewer stumbles, and far less strain. Build your script out of words you already say cleanly.',
    drills: [
      'Cover-and-say: one card a day from memory; whatever you flub is tomorrow’s card.',
      'Say the line, then play the meanest version of the prospect against yourself, out loud, and answer it.',
    ],
    readyWhen: [
      'You can say the opener, the price branch, and the burned-buyer response from memory, cleanly.',
      'You don’t reach for the page mid-sentence on the core lines.',
    ],
    buildsSkills: ['the-open', 'know-your-offer', 'objection-handling'],
  },
  {
    id: 'stage-3',
    stage: 3,
    title: 'Simulate (role-play, zero stakes)',
    outcome: 'You can run a full mock call and handle pushback without freezing.',
    doThis: [
      'Role-play with a friend, or record both sides of the call yourself.',
      'Run the full flow: open → discovery → pitch → close.',
      'Practice the 3-second pause after the ask — count it in your head.',
      'Have your partner throw the 6 most common objections at you.',
    ],
    voiceNote:
      'Role-play is where you build stamina safely. Do a 20-minute mock block and notice exactly when your voice starts to tire — that’s your current limit, and the number you grow from week to week.',
    readyWhen: [
      'You can run a full mock call start to finish.',
      'You handle 3 objections in a row without panicking or arguing.',
    ],
    buildsSkills: ['discovery', 'the-pitch', 'the-close', 'objection-handling'],
  },
  {
    id: 'stage-4',
    stage: 4,
    title: 'First live dials (low stakes, leak-led)',
    outcome: 'You’ve had real conversations with owners — and your voice held up.',
    doThis: [
      'Build a list of 20–30 prospects and run the pre-call check on each.',
      'Start with the lowest-stakes list so early calls don’t matter much.',
      'Dial with ONE goal: deliver the leak and have a human conversation. A booking is a bonus, not the target.',
      'Log every call in the cockpit logger.',
    ],
    voiceNote:
      'Keep blocks short at first — 20–25 minutes, twice a day — and warm up before each. Water within reach, never push volume. If the voice starts to go, end the block; don’t grind through it.',
    nonNativeNote:
      'When someone says "say that again?", don’t apologize or speed up — slow down and repeat it clearly. It’s completely normal. Have a calm line ready: "Of course — let me say that more clearly."',
    readyWhen: [
      'You’ve made ~50 dials and had ~5 real decision-maker conversations.',
      'You can get through the opener live without your voice cracking or racing.',
    ],
    buildsSkills: ['pre-call-check', 'the-open', 'your-state', 'tonality'],
  },
  {
    id: 'stage-5',
    stage: 5,
    title: 'Handle pushback live (objections)',
    outcome: 'Objections stop scaring you — you agree, redirect, and let go cleanly.',
    doThis: [
      'Spend a week where the only thing you grade is objection handling.',
      'Use the cockpit objection search live — hit "/" and read the card.',
      'Agree first, then redirect. Never argue inside their frame.',
      'One re-ask, then route to email or the door. No third push.',
    ],
    readyWhen: [
      'You take the 6 most common objections live without arguing.',
      'You let a soft no go after one re-ask, calmly.',
    ],
    buildsSkills: ['objection-handling', 'frames-status', 'threat-trust', 'push-pull'],
  },
  {
    id: 'stage-6',
    stage: 6,
    title: 'Book the next step (the close)',
    outcome: 'You’re booking audits / Growth Calls and it feels natural, not pushy.',
    doThis: [
      'Focus a week on the close only.',
      'Shrink the yes: "20 minutes, free, you keep the numbers either way."',
      'Confirm the slot first, then get the contact.',
      'Drill the three soft-closes: "think about it", "just email me", "I’m slammed".',
    ],
    readyWhen: [
      'You’re booking at a steady baseline rate.',
      'The close feels like offering a small, safe yes — not asking for a decision.',
    ],
    buildsSkills: ['the-close', 'push-pull', 'authority'],
  },
  {
    id: 'stage-7',
    stage: 7,
    title: 'Refine & make it instinct (ongoing)',
    outcome: 'The skills run themselves; you keep sharpening with tape and reps.',
    doThis: [
      'Run one principle per week (the manual’s last section is the method).',
      'Record your calls and grade them against the 5-point rubric.',
      'Re-read the manual on a widening gap — day 1, 2, 4, 8, then weekly.',
      'Move skills up your dashboard as they become instinct.',
    ],
    voiceNote:
      'Keep the warmup and cool-down as permanent habits, and the water + rest rule too. An athlete never skips the warmup; neither do you. Re-check the red-flag list weekly — persistent hoarseness or strain means pause and see the ENT/SLP.',
    readyWhen: [
      'This is ongoing — you’re never "done," you’re compounding.',
      'Most of your dashboard skills sit at "Live" or "Instinct".',
    ],
    buildsSkills: ['reading-room', 'your-state'],
  },
]
