# Mission — Instructional Design & UX Document

*Design rationale for the gamified focus and task-tracking platform*

---

## 1. Product Philosophy

### Core Purpose

Most productivity tools optimize for **task completion rate**.

This platform optimizes for **the quality of attention the operator brings to their work, and their ability to return to that quality of attention after interruption**. The distinction matters: crossing items off a list is administration; sustaining focused effort is craft.

The platform does not tell the operator what to work on. It creates conditions — measured intervals, acknowledged rests, tracked momentum — under which the operator's own motivation can sustain itself. The gamification layer makes something normally invisible (focused time, maintained streaks, session momentum) legible and worth attending to.

### What This Platform Is Not

This platform is not a surveillance tool. It does not track the operator's behavior to serve advertising, improve a third-party model, or sell to a data broker. The standing no-telemetry constraint (see [CLAUDE.md](CLAUDE.md), Zeroth Law) is not a compliance checkbox — it is a structural guarantee that the operator's time and attention data stays on their device.

This platform is not a behavioral manipulation engine. It does not use variable reward schedules, inflated streak counters, or loss-aversion mechanics to compel engagement. The rewards it offers are legible, honest, and proportional to real work completed.

---

## 2. Theoretical Foundations

### Flow Theory (Csikszentmihalyi, 1990)

Flow states require a match between perceived challenge and perceived skill, with clear goals and immediate feedback. Interruption is the primary threat to flow: recovery from a single interruption takes 23 minutes on average (Mark, Gudith & Klocke, 2008) — meaning one badly-timed notification can cost more working time than it saves.

The platform is organized around flow *preservation*:

- **The Pomodoro interval** creates a protected time window with an explicit, visible end, reducing the cognitive cost of "should I check something" (the operator already knows when the interval ends)
- **The notification queue** (`window.NotifyQueue`) ensures only one narrative message occupies the operator's attention at a time, so a queued message never compounds an active distraction
- **The JIT principle** (`skipIfBusy`) prevents buddy messages from firing when the operator's attention is already committed — the message is discarded, not deferred to a moment when its relevance has expired
- **Default-collapsed timer widget** respects peripheral vision; expansion is operator-triggered, never system-triggered

### Self-Determination Theory (Deci & Ryan, 1985)

Sustainable motivation depends on three innate psychological needs: competence, autonomy, and relatedness. Gamification that satisfies only extrinsic reward produces engagement that collapses once the reward stops (Deci, Koestner & Ryan, 1999). The platform targets all three:

**Competence** — XP is awarded for real work completed, never for opening the app or maintaining a login streak. The session-complete slot-machine animation makes the relationship between time spent and reward explicit: the operator sees exactly why they received what they received. That legibility is itself a competence signal — "I understand this system and I can influence it."

**Autonomy** — the operator chooses when to start, when to break, which break length, whether to run Pomodoro or OPS (open-ended) tracking, and when to end a session. The skip-break button exists specifically so the system cannot impose rest at the wrong moment. The `m` shortcut for mode toggle removes friction from a context-switch that is the operator's call, not the app's.

**Relatedness** — the buddy message system provides a simulated voice: terse, tactical, non-patronizing. It acknowledges effort without performing enthusiasm it hasn't earned. The M-VI register (§4) positions the system as a competent peer rather than a cheerleader.

### Gamification Ethics (Deterding et al., 2011; Nicholson, 2012)

Deterding defines gamification as "the use of game design elements in non-game contexts." The ethical line runs between **structural gamification** (points and badges bolted onto any behavior to drive compliance) and **content gamification** (challenges tied to the domain's own intrinsic value).

This platform uses content gamification only. XP tracks focused work because focused work is the thing worth tracking. The session-complete reward scales with elapsed time because time is the resource the operator is deliberately spending. There are no achievements for opening the app, no bonus for a daily login streak, no leaderboard.

Nicholson's RECIPE framework separates gamification that supports meaning from gamification that drives compulsion:

| RECIPE element | Implementation |
|---|---|
| Reflection | Session-complete overlay shows exact elapsed time and XP earned |
| Exposition | XP rule is stated plainly: 15 XP per 25-minute increment, awarded at session end |
| Choice | Mode tabs, break picker, skip-break — operator controls every decision point |
| Information | Ring fill gives real-time interval progress; OPS elapsed counter gives continuous awareness |
| Play | Slot-machine animation and ascending audio ticks are playful, never compulsory |
| Engagement | Buddy messages are non-blocking and easily missed by design — they inform, they don't demand |

### Attention and Interruption Research (Czerwinski et al., 2004; Mark et al., 2008)

Interruptions impose three costs: the time lost to the interrupting stimulus, the time required to rebuild the prior task's context, and the affective cost (frustration, anxiety). Czerwinski found switching costs peak during cognitively demanding work — exactly when a productivity app is most tempted to fire a motivational message.

`NotifyQueue` encodes three research-derived principles:

1. **Serialization** — concurrent narrative messages never display together; each gets the operator's brief, undivided attention instead of competing for split attention with another message
2. **Priority** — higher-stakes messages (session-complete, congratulatory) displace lower-stakes ones (buddy suggestion) in the queue, reflecting the finding that perceived relevance moderates interruption cost
3. **JIT suppression** (`skipIfBusy`) — a buddy message is discarded outright if the queue is occupied, because a motivational note that arrives 40 seconds after its cue has lost the context that made it motivating

### Temporal Motivation Theory (Steel & König, 2006)

Motivation to begin a task rises as its deadline nears. Time-boxing exploits this directly: the Pomodoro interval creates a near-term deadline (25 minutes), lowering the perceived cost of starting. The countdown ring is the continuous, always-legible expression of "how long until this ends."

OPS mode serves the opposite temporal psychology. Work with no natural endpoint — deep reading, writing, debugging — is distorted by a fixed interval that interrupts at an arbitrary point. OPS gives elapsed-time awareness with no imposed deadline, supporting accountability to *time actually spent* rather than *did I finish inside an arbitrary window*.

### Cognitive Load Theory (Sweller, 1988)

The Second Law of [CLAUDE.md](CLAUDE.md) — Elegant Sufficiency — is cognitive load theory applied to the codebase. Operators have finite working memory; any UI element present but not currently relevant is extraneous load.

Applied here:
- The timer widget defaults to a minimized state; full UI is operator-triggered
- The break picker appears only once OPS mode is active and running
- The session-complete overlay replaces the timer rather than sitting alongside it
- Settings and themes live behind the gear icon, hidden until summoned
- `NotifyQueue` guarantees at most one narrative message occupies visual space at once

### Persuasive Technology Ethics (Fogg, 2003; Zuboff, 2019)

Fogg's captology framework names three roles technology can take in changing behavior: tool (extends capability, no autonomous influence), medium (offers vicarious experience), and social actor (uses social pressure to shift attitudes). The risk in behavioral design is sliding from tool into unacknowledged social actor.

This platform is built to stay a tool. The XP system increases the salience of work already done — a tool function. Buddy messages provide an ambient social voice — a medium function. Neither uses loss aversion, social comparison, or manufactured urgency, and the standing no-telemetry rule removes the behavioral-data substrate that social-actor design depends on.

Zuboff's account of surveillance capitalism identifies behavioral data as the raw material of behavioral modification. Refusing to collect or transmit that data is a structural protection rather than a policy promise — it holds regardless of any individual feature's intent.

---

## 3. System Architecture

### Component Breakdown

```
Mission App
├── Task Engine (mission.js)
│   ├── Task list CRUD
│   ├── Streak tracking
│   ├── XP system (addXp, pulseXpMeter)
│   ├── Buddy message system (displayRandomMessage, showBuddySuggestion)
│   ├── NotifyQueue (notification-queue.js)
│   ├── Ranker (RANK_WEIGHTS, scoreMission, explainMissionRank, rankMissions)
│   └── AppSettings (localStorage-backed settings object)
│
├── Match Mode (match-mode.js)
│   ├── Swipe-deck triage view (one objective per card)
│   ├── Auto-derived topic tags (keyword table)
│   └── Verdicts: MATCH → promoteMissionToTop / LATER → deferCount++
│
├── Focus Timer (mission-react.js)
│   ├── Pomodoro mode (25min work / configurable break)
│   ├── OPS mode (open-ended elapsed tracking)
│   ├── Break picker (Coffee / Lunch, icon variants per duration)
│   ├── Session-complete overlay (slot-machine XP animation)
│   └── Sound system (Web Audio API synthesized chimes)
│
├── Presentation Layer
│   ├── mission.css (global styles, XP meter, notification styles)
│   ├── pomodoro-integrated-styles.css (timer widget styles)
│   └── Themes system (AppSettings.theme, CSS variable overrides)
│
└── Persistence Layer
    └── localStorage (tasks, XP, streaks, timerType, projectElapsed, settings)
```

### The Two-Tier Notification Architecture

Notifications split into two tiers by function and attention cost:

**Utility tier** (independent, immediate) — undo toasts, confirmation prompts, error states. These are action affordances. They need immediate attention and must never wait behind a more pleasant message.

**Narrative tier** (orchestrated through `NotifyQueue`) — buddy motivation messages, daily reset announcements, congratulatory milestones, session-complete events. This is the moments the platform speaks as an entity rather than a tool. Serializing them ensures each is heard rather than lost to a concurrent firing; priority levels ensure session-complete is never deferred behind a buddy suggestion.

---

## 4. UX Design Principles

### Information Architecture

```
[ Persistent header: XP meter + settings gear ]
[ Task list: primary action zone ]
[ Timer widget: floating, collapsible ]
[ Notification layer: top-center, serialized ]
[ Settings / themes panel: triggered overlay ]
```

The task list is the primary content zone — always visible, always interactive. Everything else is secondary and collapsible, matching the operator's actual goal: manage and execute tasks.

### Feedback Timing

| Action | Feedback | Timing |
|---|---|---|
| Task completion | Strike-through + XP pulse | Instant |
| XP award | Meter fill animation + buddy message | < 500ms |
| Timer interval complete | Ring flash + audio chime | Instant |
| OPS session finish | Slot-machine animation + ascending audio | Deliberate (operator-triggered) |
| Break alarm | OS notification + synthesized chime | Instant |
| Notification arrival | Slide-in from top | 200ms transition |

Session-complete is the deliberate exception to immediacy: triggered by an explicit operator gesture ("Finish OPS →"), not by time expiring. The reward is earned by a choice, not dispensed automatically.

### Animation Philosophy

| Animation | Signal |
|---|---|
| Ring depleting (Pomodoro) | "Time is passing; the interval will end" |
| Ring fully lit (OPS mode) | "Tracking is active; time is accumulating" |
| Ring pip orbit | "Timer is running; system is alive" |
| Slot-machine XP counter | "Work is being converted to reward; each tick is one increment" |
| Notification slide-in/out | "New information; it will pass" |
| Break icon steam drift | "A break is in progress" |
| Steam animation paused | "The break timer is paused" |

All transitions use `requestAnimationFrame` throttling or sub-400ms CSS. The steam-drift animation is tied to `animation-play-state`, pausing in sync with the timer — maintaining physical coherence between state and representation.

### The M-VI Tactical Voice

The app's textual identity rests on a consistent register: terse, tactical, laconic. Not military in the hierarchical-command sense — tactical in the focused, low-noise, precise sense.

**Voice attributes**: short sentences, no hedging; no filler ("just," "quickly," "simply"); no corporate warmth; no emoji in body copy; affirmative rather than reassuring ("Mission logged." not "Great job!"); technical vocabulary without over-explaining it.

**Why it matters**: voice consistency is a trust signal. When every string in the app sounds like the same entity wrote it, the operator builds a stable model of what the system is. A terse confirmation followed by a cheerful exclamation-pointed notification reads as assembled, not designed — and erodes confidence in the system's competence.

---

## 5. HCI Design Decisions

### Skip Break: Autonomy Over System Preference

The classic Pomodoro technique treats the break as non-negotiable. This platform rejects that. A skip-break button appears after any work interval, letting the operator continue past the scheduled break.

**Rationale**: the interval is a self-management tool, not a behavioral constraint. An operator in flow at minute 25 has more to lose from a forced interruption than from continuing. The system's aggregate-optimal guess cannot override the operator's direct perception of their own state — this is the SDT finding that autonomy support produces more durable motivation than behavioral control, even when the controlled behavior is nominally good for you.

### JIT Suppression: When a Message Should Not Fire

`skipIfBusy` implements a principle most notification-heavy apps invert: **a message that cannot receive attention should not be sent.**

Most queues exist to guarantee eventual delivery. This one exists to enable *selective discard* — a message arriving while the operator's attention is committed is dropped, not delayed. The cost of dropping it is lower than the cost of it landing 30 seconds late with no contextual relevance left. This is only possible because no engagement metric here depends on the message being seen.

### OPS Mode: Open-Ended Tracking for Deep Work

The Pomodoro interval assumes task granularity that matches 25-minute blocks. Writing, design, research, and debugging often don't fit that grain. OPS mode tracks elapsed time without a countdown deadline — the ring stays fully lit (signaling accumulation, not depletion), the display counts up, and rest happens at operator-chosen moments through the break picker.

Pomodoro and OPS coexist on a two-tab toggle because neither is universally correct — the operator already knows which kind of work they're doing.

### Session-Complete Animation: The Deliberate Ritual

The slot-machine counter and ascending audio could fire automatically on a timer. Requiring an explicit "Finish OPS →" trigger instead is deliberate: automatic reward on an arbitrary interval would train operators to stop at arbitrary intervals. The finish gesture creates a ritual boundary — the operator acknowledges the session is over, sees how long they worked, then receives the reward. This mirrors the closing-ritual function described in structured-work literature (Allen, 2001): the ritual tells the brain the task context can close.

The reward calculation (increments × 15 XP) is fully predictable and disclosed — no variable-reward uncertainty drives the animation. The "slot machine" framing is aesthetic (a counter ticking up is satisfying to watch), not mechanical; variable reward schedules are manipulative because uncertainty drives compulsive engagement, and this reward has none.

### Synthesized Audio: No External Dependencies

The alarm chime, XP-tick sounds, and session-complete audio are synthesized via the Web Audio API rather than served as files — square-wave oscillators with decay envelopes, ascending through D4 → E4 → G4 → A4 → B4 → D5.

**Rationale**: no audio file means no CDN request, no load delay, and nothing to audit for GDPR purposes. Synthesis also generates the sound at the exact moment it's needed, with no preloading. An operator may still drop a custom `alarm.mp3` into the project root; the synthesized fallback needs nothing.

### Two-Mode Architecture: React + Vanilla JS

The timer is React (Babel-compiled in-browser); the task engine and notification system are vanilla JS. They communicate through deliberately exposed `window` APIs (`window.addXp`, `window.NotifyQueue`, `window.toggleTimerType`) rather than a shared framework.

**Rationale**: the timer's state complexity — multiple co-dependent variables, concurrent intervals, animation sync — benefits from React's declarative model. The task engine predates the React component and is optimized for direct DOM manipulation. Migrating either direction would add risk without proportional benefit; the `window` bridge is a deliberate seam, inspectable and auditable from the browser console.

### Match Mode: Triage as a Separate Activity from Work

Match mode (`match-mode.js`) is a third view alongside the list board. It presents the board one objective at a time as a card: swipe right to MATCH (commit — the objective is promoted to position 1), swipe left to LATER (defer — the card leaves and the deferral is counted). It never deletes. The behavioral argument for why deferral raises an objective's rank rather than burying it is in [DESIGN.md](DESIGN.md) §9.10; this section covers the interface decisions.

**Why one card at a time.** The list board is a *comparison* surface. Every objective is visible simultaneously, and the operator resolves the board by scanning it — which is exactly the operation that present bias wins. Given a set, the item selected is the one that is cheapest to start right now, and the set makes that comparison free to perform. Worse, a list affords a third answer that a card does not: *none of these*, executed by simply not clicking anything and closing the tab.

A card is a forced-choice surface. One objective, two verdicts, no comparison set, and no way to resolve it by inaction. It also asks a much smaller question than the board does. The board implicitly asks "what are you going to do?" — a question that requires a plan. The card asks "is this next, or not yet?" — answerable in about a second, with no plan required. Framing the decision small is what makes a fast pass over twenty objectives possible at all.

This is Cognitive Load Theory (Sweller, 1988) applied to a decision rather than to a layout: during triage of objective *k*, the other *n−1* objectives are extraneous load. They are relevant to planning and irrelevant to the single verdict being taken.

**Why swiping suits triage specifically.** Three properties of the gesture matter here, and none of them are aesthetic.

*The escape route has to be the cheapest action in the app.* The entire mechanic depends on LATER being free — cognitively, emotionally, and in motor cost. A confirmation dialog, a reschedule picker, or a "why are you deferring?" prompt would tax the exact action the design needs the operator to take honestly. A single lateral drag is close to the floor of what an interface can charge for a decision. And both verdicts cost the same mirrored gesture, so the interface does not nudge toward either: the commit threshold is 96px in both directions.

*The verdict is visible before it is committed.* During the drag, the card follows the pointer, rotates proportionally (`dx / 18`), and fades in a MATCH or LATER stamp whose opacity tracks progress toward the threshold. Dragging back below the threshold cancels with a spring back to center and no consequence. This is feedforward in Norman's (2013) sense — the operator sees what the action *will* do while there is still time not to do it — and it is why the gesture is safe to perform quickly.

*Push-away sorting is the right physical metaphor.* Sorting a physical stack into two piles is a well-worn motor pattern, and the semantics line up: right is toward you and forward, left is aside. Nothing has to be learned.

Because the gesture is the primary affordance, it is not the only one: `←` / `→` and the two action buttons perform identical commits, and `ESC` closes. A gesture-only surface would exclude keyboard operation and any pointing device where dragging is awkward.

**Why it cannot delete.** Deletion stays on the board's own affordances. A surface designed to be moved through fast, with a committing gesture and a 240ms card animation, is the wrong place for an irreversible action — the same reasoning that keeps destructive operations behind the multi-stage purge confirmation rather than behind a swipe.

**What the auto-tags are for.** Each card derives up to three topic tags (`#fitness`, `#finance`, `#admin`, …) by keyword matching against the objective text. They serve three purposes:

1. **Restoring context the card strips away.** On the board an objective is legible partly from its neighbours and its position. A card removes both. The tag puts the "what kind of thing is this" cue back in a glance — recognition rather than recall (Nielsen, 1994), which matters more here than on the board because the operator is moving fast and reading each title exactly once.
2. **A different axis from the category prefixes.** The `1.` / `2.` / `3.` prefixes are operator-assigned at creation and say which life-domain goal the objective serves. A tag is derived, costs the operator nothing, and says what the work *is*. "Pay the gym invoice" is Financial by prefix and `#finance` by tag; "book a doctor's appointment" is Life by prefix and `#health` `#admin` by tag. The second axis is the one that predicts what the work will feel like to start.
3. **Making batchable clusters visible.** Three `#admin` cards in a row is a pattern the ranked board actively hides, because ranking sorts on avoidance and urgency, not on kind. Seeing the cluster during a pass is what suggests doing them together.

The matcher is deliberately crude: case-insensitive substring matching against a fixed keyword table, first rule match per tag, capped at three tags. It will produce false positives — "read the bank letter" picks up `#study` from *read*. That is an acceptable error rate because a tag is decoration on a decision the operator makes from the title; a wrong tag costs a glance. Anything more accurate would mean shipping a classifier, and a classifier here would buy precision on a label that is not load-bearing.

Tags are currently derived at render time and displayed only. They are not persisted, not filterable, and do not participate in ranking.

### Focus Mode: The Timer Belongs Where the Work Is

Focus mode (`focus-mode.js`) is the execution counterpart to Match mode's triage. Match asks *is this next?*; Focus assumes that question is settled and shows position one alone. The Pomodoro widget is docked into it, centered under the objective.

**Why dock it at all.** Flow requires clear goals *and* immediate feedback simultaneously (Csikszentmihalyi, 1990) — neither alone produces it. Focus mode already supplied the first: one objective, no comparison set, nothing to decide. The second was in a corner PIP, which meant that checking elapsed time cost a switch away from the objective. Switching is the expensive part, not the reading: interruption-recovery costs are measured in minutes, not seconds (Mark, Gudith & Klocke, 2008), and even a self-initiated switch leaves attention residue on the surface being left (Leroy, 2009). Co-locating the two conditions removes the switch entirely.

**The apparent contradiction with contextual revelation.** [DESIGN.md](DESIGN.md) §2.14 lists "Pomodoro timer is a persistent PIP widget, not part of the main flow" as a cognitive-load win. Docking it looks like a reversal of that principle. It is the same principle reaching the opposite conclusion in a different context. Sweller's (1988) distinction is between *extraneous* load — interface present but not relevant to the current task — and *intrinsic* load, which belongs to the task itself. On the board, a planning surface, the timer is extraneous: the operator is deciding what to do, and how long they have been working is irrelevant to that decision. In Focus mode, an execution surface, elapsed time is part of the work. Contextual revelation says the timer should appear exactly where it becomes relevant, which is here and nowhere else. DESIGN.md §2.14 has been amended so a future reader does not have to reconstruct this.

**Why the objective stays on top.** The ring docks *below* the objective and at a reduced size. The hierarchy is load-bearing: a countdown given top billing turns into a monitoring task competing with the work it exists to support, which is the failure mode of clock-watching generally. The ring is a peripheral, pre-attentive channel — glanceable without being read — and the numeric readout is deliberately secondary to it. This is also why the mode does not switch the operator to Pomodoro or OPS on entry: mode choice is a planning decision, and the surface has just finished removing planning decisions.

**Why it docks paused.** The timer appears open and ready, and the operator starts it. Auto-starting would make time accrual — and in OPS mode, XP accrual — contingent on merely opening a view, including a view opened just to look. Cognitive Evaluation Theory (Deci & Ryan, 1985) predicts the cost precisely: a reward the system initiates on the operator's behalf shifts the perceived locus of causality external and converts an *informational* signal about their own work into a *controlling* one. The existing Skip Break decision (§5) resolves an identical tension the same way, and for the same reason. `Space` starts and pauses, so the cost of the deliberate act is one keystroke.

**Which controls survive the dock.** Session controls stay; window management and configuration go. Transport, break, `Finish OPS →` and the session-complete payout are all about the session in progress — intrinsic load, and removing any of them would strand the operator mid-session or hide the closing ritual (§5, *Session-Complete Animation*). The drag handle, resize grip, minimise button and Pomo/OPS tabs are about managing a floating window that no longer exists in this layout, or about a decision that belongs before the session, not during it. Both are extraneous load in Sweller's sense, and both are hidden.

**Why the widget is moved, not rebuilt.** `focus-mode.js` relocates the real `#pomodoro-mount` node into its own layout and returns it on close. A second timer implementation would be a second payout path — banked units, the XP reel, the session-complete ritual — and the reward math has to have exactly one source or the disclosure guarantee (§6) is unenforceable. This is the same reasoning that has `complete()` dispatch the board's own click handler rather than reimplementing completion. If the operator has minimised the widget, Focus mode opens it and restores their choice on exit; if they have turned the timer off in settings, nothing docks.

**Keyboard ownership.** While Focus or Match mode is open, the board's global shortcuts no longer fire. They acted on a board that is not on screen, and two collided outright: `S` skipped the objective *and* opened Settings, and `T` would have minimised the timer Focus mode had just docked. A mode that prints its own shortcut line has to be the surface those keys actually reach.

---

## 6. Gamification Design

### XP System

1. **XP tracks real work, not engagement** — awards tie to task completion and OPS elapsed time, never to app opens, logins, or streak maintenance
2. **XP is legible** — the operator always knows why they received what they did
3. **XP is never lost** — no loss-aversion mechanics; a missed streak day resets the counter, nothing more
4. **Increments are honest** — 15 XP per 25-minute OPS block; task-completion XP scales with task weight; no artificial scarcity or inflation

### The Session-Complete Ritual

1. Operator triggers "Finish OPS →"
2. Ring sweeps to full fill (completion flash)
3. Slot-machine counter ticks through each earned increment, audio pitch rising with each tick
4. Final XP total displays under "SESSION COMPLETE"
5. Overlay auto-dismisses after 2.2 seconds
6. Session state clears; localStorage resets

Each audio tick steps up the D major pentatonic scale; the final note resolves a minor third above the penultimate, giving harmonic closure. The sound design mirrors the visual design — both say "something is being counted, and the count just finished."

### The Buddy Message System

1. **Non-blocking** — narrative tier, never interrupts an action in progress
2. **JIT-suppressible** — discarded if it can't land cleanly
3. **Low-pressure** — acknowledges effort without implying obligation ("Field conditions noted." not "Keep going, you can do it!")
4. **Context-sensitive** — `showBuddySuggestion` takes priority and duration so each call site can tune message weight to its context

---

## 7. Research Sources and Frameworks

### Attention and Interruption
- Czerwinski, M., Horvitz, E., & Wilhite, S. (2004). *A diary study of task switching and interruptions.* CHI 2004.
- Mark, G., Gudith, D., & Klocke, U. (2008). *The cost of interrupted work: More speed and stress.* CHI 2008.
- Bailey, B. P., & Konstan, J. A. (2006). *On the need for attention-aware systems.* Computers in Human Behavior.
- Adamczyk, P. D., & Bailey, B. P. (2004). *If not now, when? The effects of interruption at different moments within task execution.* CHI 2004.
- Leroy, S. (2009). *Why is it so hard to do my work? The challenge of attention residue when switching between work tasks.* Organizational Behavior and Human Decision Processes.

### Motivation and Gamification
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience.* Harper & Row.
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior.* Plenum.
- Deci, E. L., Koestner, R., & Ryan, R. M. (1999). *A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation.* Psychological Bulletin.
- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). *From game design elements to gamefulness: Defining gamification.* MindTrek 2011.
- Nicholson, S. (2012). *A user-centered theoretical framework for meaningful gamification.* Games+Learning+Society 8.0.
- Kapp, K. M. (2012). *The Gamification of Learning and Instruction.* Pfeiffer.

### Temporal Motivation and Time-Boxing
- Steel, P., & König, C. J. (2006). *Integrating theories of motivation.* Academy of Management Review.
- Cirillo, F. (2006). *The Pomodoro Technique.* FC Garage (re-published 2018, Currency).
- Kahneman, D. (2011). *Thinking, Fast and Slow.* Farrar, Straus and Giroux.

### Persuasive Technology and Surveillance
- Fogg, B. J. (2003). *Persuasive Technology: Using Computers to Change What We Think and Do.* Morgan Kaufmann.
- Zuboff, S. (2019). *The Age of Surveillance Capitalism.* PublicAffairs.
- Nissenbaum, H. (2009). *Privacy in Context: Technology, Policy, and the Integrity of Social Life.* Stanford University Press.

### Cognitive Architecture
- Sweller, J. (1988). *Cognitive load during problem solving: Effects on learning.* Cognitive Science.
- Baddeley, A. D. (1986). *Working Memory.* Oxford University Press.

### HCI / UX
- Card, S. K., Moran, T. P., & Newell, A. (1983). *The Psychology of Human-Computer Interaction.* Lawrence Erlbaum Associates.
- Norman, D. A. (2013). *The Design of Everyday Things.* Basic Books.
- Pirolli, P., & Card, S. K. (1999). *Information foraging.* Psychological Review.
- Krug, S. (2000). *Don't Make Me Think.* New Riders.
- Nielsen, J. (1994). *Usability Engineering.* Morgan Kaufmann. [Recognition vs. recall, heuristic #6]
- Redish, J. (2007). *Letting Go of the Words.* Morgan Kaufmann.

### Productivity Research
- Allen, D. (2001). *Getting Things Done.* Viking.
- Newport, C. (2016). *Deep Work: Rules for Focused Success in a Distracted World.* Grand Central Publishing.
- Mark, G. (2023). *Attention Span: A Groundbreaking Way to Restore Balance, Happiness and Productivity.* Hanover Square Press.

---

## 8. Future Development Directions

### Adaptive Interval Calibration
Analyze the operator's historical session data (stored locally) to suggest interval lengths. An operator who consistently overruns OPS sessions by 45 minutes may benefit from a soft mid-session check-in; one who frequently hits skip-break may simply be a 50-minute-interval person. All analysis runs on-device — nothing leaves it.

### Deliberate Rest Protocol
The break picker currently offers duration variants only. A future extension could draw on Deliberate Rest principles (Pang, 2016): structured short activities (a 5-minute walk prompt, a brief breathing exercise) rather than unstructured time — optional, operator-triggered, never mandatory.

### Team Streaks (Multi-Device, Peer Accountability)
SDT's relatedness need is currently underserved. A future backend — lightweight, self-hostable, privacy-respecting — could enable shared streak tracking between a small group, with no public leaderboard or comparison pressure. Constraint: any such backend must remain self-hostable and open-source to preserve the GDPR-safe posture.

### Session History and Retrospective
A local session log (date, mode, elapsed time, XP earned) in localStorage or IndexedDB would let the operator review their own work patterns over time — a reflection feature, not an analytics one. Rendered as a GitHub-style contribution grid, it would make momentum visible across weeks instead of just the current session, with no data ever leaving the device.

### Keyboard-First Mode
Shortcuts already exist (S/A for Pomo/OPS, Space for start/stop, M for mode toggle). A future iteration could make the app fully operable without a mouse — relevant for operators running focus-mode setups that hide cursor activity.

### Sound Design Expansion
The current chime uses a D major pentatonic scale. A future settings option could offer alternate soundscapes (a flatter electronic tone, an ambient-noise option via the Web Audio API's noise generation) — still fully synthesized, still requiring no external audio files.
