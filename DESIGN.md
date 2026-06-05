# Mission VI — PrimerOS Task Interface
## Design Document: Behavioral Architecture & Learning Theory

*Rationale for the gamified productivity application and its underlying science*

---

## 1. Core Philosophy

Most productivity tools manage tasks.

This application manages **the operator's relationship to work** — their motivation, affect, energy state, and capacity for sustained effort. The distinction matters: a task list is data storage; a behavioral system shapes how the operator experiences the act of completing work.

The app is built around a single design thesis: **durable productivity behavior is not a function of willpower or discipline — it is a function of feedback loops, identity, and affect.** Every system in the interface exists to close a feedback loop, reinforce a productive identity, or generate positive affect at the right moment.

The militarized cyberpunk aesthetic (M-VI, PrimerOS, dispatch communications) is not decoration. It is the **narrative container** that makes the feedback loops emotionally meaningful. Completing a task is not checking a box; it is executing an objective in a system that tracks and acknowledges your operational history.

---

## 2. Behavioral & Psychological Theory

### 2.1 Self-Determination Theory (Deci & Ryan, 1985)

Intrinsic motivation depends on three innate psychological needs: **autonomy, competence, and relatedness**. When all three are satisfied, motivation becomes self-sustaining rather than externally enforced.

| Need | Implementation |
|------|---------------|
| **Autonomy** | User controls task content, category, XP tier, timing, and when to send the ready signal. No system-imposed task order or mandatory completion sequence. |
| **Competence** | XP system provides continuous progress feedback. Level-up events are ceremonial. Achievement unlocks mark skill milestones. Session ceremony tallies cleared objectives. |
| **Relatedness** | M-VI is an explicit partnership narrative, not an anonymous app. The partner-depth system (tier 0/1/2) makes the buddy relationship grow over time. Veteran messages reference shared history ("Day 47."). |

The system deliberately avoids coercive mechanics (no punishment for missed tasks, no mandatory daily minimums) because external control undermines the intrinsic motivation it is trying to build. The streak repair mechanic exists specifically to prevent loss-aversion from converting a useful habit signal into punishing pressure.

**Why this matters**: productivity tools that rely on guilt, shame, or punishment do not produce durable behavior. SDT research consistently shows that autonomy-supportive environments produce greater persistence, creativity, and well-being than controlling ones (Niemiec & Ryan, 2009).

---

### 2.2 Cognitive Evaluation Theory (Deci & Ryan, 1980)

CET is a subtheory of SDT that specifically addresses how external events affect intrinsic motivation. It identifies two functional aspects present in any extrinsic reward or feedback:

- **Controlling aspect**: when an event is perceived as pressuring behavior or contingent on compliance, it shifts the perceived locus of causality external and reduces autonomy → undermines intrinsic motivation
- **Informational aspect**: when an event is perceived as providing competence feedback about quality of engagement, it supports an internal locus → preserves or enhances intrinsic motivation

The design implication is not "avoid all extrinsic rewards" but "ensure the informational aspect dominates the controlling aspect." The XP system's self-selection mechanic (operator chooses XP tier) is the primary structural mechanism by which it is pushed toward the informational end: the operator is making a metacognitive judgment about their own work quality, not receiving a contingent system-dispensed reward. See Section 9.3 for the full resolution of the overjustification tension.

### 2.4 Operant Conditioning & Variable Ratio Reinforcement (Skinner, 1938; Ferster & Skinner, 1957)

Behavior is strengthened by reinforcement. The schedule of reinforcement determines the durability of behavior:

- **Fixed ratio** (every Nth behavior reinforced) produces high rates but post-reinforcement pauses
- **Fixed interval** (reinforcement after time elapsed) produces scalloping — effort spikes before the interval ends
- **Variable ratio** (reinforcement after unpredictable number of behaviors) produces the most durable, extinction-resistant behavior

The story dispatch system implements **variable ratio reinforcement**: lore fragments, story events with choices, and intercepted transmissions appear probabilistically after task completions. The probability grows with session depth (~80% chance by task 6) but is never guaranteed. This is why the story system is more motivating than a deterministic reward would be.

Fixed-interval mechanics (daily streak, ready signal before 10:00 AM) create predictable behavioral anchors — the temporal structure within which the variable-ratio rewards operate.

---

### 2.5 Flow Theory (Csikszentmihalyi, 1990)

Flow is a state of optimal experience characterized by: clear goals, immediate feedback, challenge-skill balance, loss of self-consciousness, and distorted time perception. Flow is not possible without appropriate challenge and uninterrupted engagement.

The behavioral inference layer (AffectInference module) exists to protect and detect flow:

| Inferred State | Signals | System Response |
|---------------|---------|-----------------|
| **Flow** | ≥3 completions in 10 min, consistent rhythm, low neural capture | M-VI goes silent; robot face shifts to `flow` emotion (half-lidded, focused) |
| **Deep Work** | Single sustained Pomodoro, no interruptions | Same silence; no messages |
| **Friction** | Pomodoro completed, task still open; rising captures | Shift to direct, terse messages |
| **Avoidance** | Adding tasks without completing; Pomodoro stopped | Gentle redirection rather than cheerleading |
| **Depletion** | Decelerating completion rate, mid-session | Acknowledge the load; suggest a break |

**The key constraint**: no state triggers on a single data point. Two or three confirming signals are required. A single long gap is noise. A pattern is a signal. The cost of a false positive (M-VI implying struggle when the operator is deeply focused) is higher than a missed detection.

The flow emotion on M-VI is visually distinct from sleepy (not tired) and from neutral (not disengaged): half-lidded deliberate eyes, the faintest upward mouth curve, dim blue glow, suppressed micro-movements. The eye scan animation used during composing state (Ollama processing) is also suppressed — M-VI is watching without scanning.

---

### 2.6 Goal-Setting Theory (Locke & Latham, 1990)

Specific, challenging goals produce higher performance than vague or easy ones. The mechanism is motivational: specific goals focus attention, mobilize effort, promote persistence, and trigger task-relevant strategy development.

The category prefix system (`1.` Financial, `2.` Academic, `3.` Life Optimization) forces the operator to **categorize** work before logging it — an implementation of the specificity principle at the task level. General tasks (no prefix) are allowed but their XP weight is lower.

Pomodoro estimation (`~25m`, `~50m`) forces time-bounded goal commitment. The PomodoroEstimator module learns from actual session data and updates estimates per category over a rolling 5-sample window — the goal becomes increasingly accurate to the operator's own working patterns.

The ready signal ("Send ready signal") is a public commitment mechanic: the operator declares readiness before the session begins. Research on implementation intentions (Gollwitzer, 1999) shows that "when X, I will do Y" commitments produce dramatically higher follow-through than general intentions.

---

### 2.7 Habit Formation & Behavioral Architecture (Duhigg, 2012; Fogg, 2019; Wood & Neal, 2007)

Habits form when a behavior is repeated consistently in a stable context (cue), until the behavior becomes automatic in response to the cue (routine), and is followed by a reward (reward). The habit loop.

| Habit component | Mission VI implementation |
|----------------|--------------------------|
| **Cue** | Ready signal ritual before 10:00 AM; keyboard shortcut `A`/`S` to enter the system |
| **Routine** | Task entry → XP selector → Pomodoro → completion click → M-VI acknowledgment |
| **Reward** | Completion sound, XP addition, M-VI message, story fragment, robot emotion change |

The 10:00 AM ready signal creates a **behavioral anchor** — a temporally stable cue that is the same every day. Research on habit formation (Lally et al., 2010) shows that the most durable habits are anchored to stable contextual cues rather than motivation. The system rewards earliness (Week's Best HUD) to shift the anchor earlier over time.

The Fogg Behavior Model (B = MAP: Motivation × Ability × Prompt) maps cleanly onto the system: the XP tier allows calibrating motivation (higher stakes = higher XP); the Pomodoro timer increases perceived ability (25-minute chunk = manageable); the session ceremony and streak bar provide prompts at the right moment.

---

### 2.8 Loss Aversion & Prospect Theory (Kahneman & Tversky, 1979)

Losses loom larger than equivalent gains. A 7-day streak lost feels far worse than gaining a 7-day streak felt good. The streak system deliberately leverages this asymmetry — the desire to maintain the streak motivates behavior even when intrinsic motivation is depleted.

However, unchecked loss aversion produces anxiety and catastrophizing rather than motivation. The **streak repair mechanic** manages this: if exactly yesterday was missed but the day before was earned, the operator can repair the streak by completing two tasks today. This prevents a single missed day from triggering the "I've already ruined it, why bother" abandonment pattern common in streak-based apps.

The **Operator Condition** hearts (0.5–5.0 float, preserved through purge) function as a slow-moving narrative barometer rather than a performance metric. They respond only to meaningful story events and major milestones — not to individual task completions. This separates the emotional narrative arc from the moment-to-moment task system, preventing the condition from becoming another anxiety trigger.

---

### 2.9 Temporal Motivation Theory & Present Bias (Steel, 2007; Ainslie, 1975)

Humans consistently overvalue immediate rewards and undervalue distant ones (hyperbolic discounting). This is why "I'll start the project next week" feels rational in the present even when it is not.

The Pomodoro timer addresses present bias through **temporal chunking**: a 25-minute interval is psychologically near, concrete, and completable. The distant goal ("finish the project") is replaced by the immediate goal ("work for 25 minutes"). Research by Ainslie and Herrnstein shows that bounded intervals reliably counter hyperbolic discounting in self-control tasks.

The session progress counter (`N done · N left`) creates a **completion pressure effect** — as the ratio of done/left shifts toward completion, the marginal motivation to finish increases (the "goal gradient effect," Kivetz et al., 2006). The session ceremony fires only when the list reaches zero, giving the completion effect its full salience.

---

### 2.10 Narrative Transportation Theory (Green & Brock, 2000)

Readers transported into a narrative are more likely to accept its values and maintain engagement with its world. Narrative transportation reduces critical scrutiny and increases emotional investment.

The PrimerOS lore (The Silence, M-VI as last active Station, Dr. Vance, Callahan, Meridian contracts) creates a fictional world with emotional stakes. The operator is not merely using a productivity app — they are an operator working with the last surviving tactical AI from a defunct Command network.

Story events with player choices (sfc1–sfc3 in the dispatch system) create genuine moral weight: "Relay the signal or stay silent?" These choices affect the Operator Condition — the narrative barometer — creating a feedback loop between story engagement and app engagement.

**Why this matters**: Transportation effects are strongest when the narrative is coherent across sessions and accumulates. The story codex (up to 60 saved events in localStorage) means the lore builds over time. Fragment types are tracked to prevent repetition. The Ollama integration allows dynamically generated lore that is contextually relevant to the operator's actual task list and session state.

---

### 2.11 Extended Mind Theory & Cognitive Offloading (Clark & Chalmers, 1998; Risko & Gilbert, 2016)

The mind is not confined to the skull. Cognitive processes extend into tools, notebooks, and environments when those external resources are reliably available, trustworthy, and accessible. The external representation becomes part of the cognitive system.

The **Neural Capture Feed** is a direct implementation of extended mind theory: intrusive thoughts, ideas, and distractions are offloaded from working memory into the system immediately, preventing cognitive spillover into the current task. The act of capture is fast (single input → Store) precisely because working memory cannot hold the distraction long enough for a slow capture process.

The **task list** functions as an external goal representation that eliminates the need to hold task context in working memory across sessions. The mission persistence (localStorage) means the external cognitive system is available exactly as it was left.

The Zeigarnik Effect (Zeigarnik, 1927) — the tendency for incomplete tasks to occupy working memory more than complete ones — is managed by the task list: open loops are visible and contained, not floating in mental space. Completing a task removes it from the external store, closing the loop and freeing cognitive resources.

---

### 2.12 Affective Computing & Behavioral Proxy Inference (Picard, 1997; Russell, 1980; Smallwood & Schooler, 2006)

Picard's foundational work on affective computing established that computing systems can recognize, interpret, and simulate human affect. The Russell Circumplex Model provides a two-dimensional framework for emotional states: valence (positive/negative) × arousal (high/low).

M-VI's emotion system maps onto the Russell Circumplex:

| M-VI emotion | Valence | Arousal | Trigger |
|-------------|---------|---------|---------|
| `excited` | High+ | High | Task completion spree, level up |
| `happy` | Moderate+ | Moderate | Routine completions, stable session |
| `flow` | Neutral | Focused | Inferred flow state |
| `curious` | Positive | Moderate | Input focus, new task entry |
| `neutral` | Neutral | Low | Default state |
| `sleepy` | Slightly- | Low | Low engagement, no recent activity |
| `perplexed` | Negative | Moderate | Data wipe, unexpected state |
| `glitched` | Dissonant | High | Random state, technical narrative event |
| `alert` | Focused | High | Ready signal sent |
| `composing` | Neutral | Moderate | Ollama LLM generation in progress |

Behavioral proxies avoid direct affect sensing (no biometric hardware required) by inferring state from observable digital behavior: completion rhythm, task addition rate, Pomodoro state, and Neural Capture frequency. This is consistent with Picard's non-invasive inference agenda and Fredrickson's (2001) Broaden-and-Build theory, which connects positive affect states to broadened attention and task persistence.

The Yerkes-Dodson Law (1908) informs the challenge calibration across XP tiers: too-easy tasks produce boredom (low arousal, low performance); too-hard tasks produce anxiety (high arousal, high cognitive load, low performance). The optimal performance zone is moderate arousal — which the XP tier system allows operators to self-calibrate toward.

---

### 2.13 Self-Efficacy Theory (Bandura, 1977)

A person's belief in their ability to execute a specific behavior determines whether they will attempt it. Self-efficacy is built through: mastery experiences, vicarious learning, verbal persuasion, and physiological state.

| Efficacy source | Mission VI implementation |
|----------------|--------------------------|
| **Mastery experiences** | Achievement unlocks provide objective evidence of past performance. Session ceremony counts cleared objectives. XP level records cumulative success. |
| **Vicarious learning** | M-VI dispatch fragments (Osei, Dr. Vance letters) show competent others working in similar conditions, normalizing sustained effort. |
| **Verbal persuasion** | M-VI message system. Depth-tiered messages shift from encouragement (tier 0) to peer acknowledgment ("Pattern confirmed. Standard." — tier 2). Peer-style messages signal high-self-efficacy attribution. |
| **Physiological state** | Behavioral inference layer reads depletion signals and adjusts. A depleted message tone ("Acknowledge the load") does not demand continued effort — it validates the physiological state. |

The partner-depth system is a direct self-efficacy intervention: by Day 47, M-VI's messages shift from general encouragement to laconic acknowledgment. This mirrors the change in feedback an athlete receives from a coach as competence grows — from "good job" to "expected." The shift signals to the operator that they are now performing at a level where praise would be patronizing.

---

### 2.14 Cognitive Load Theory (Sweller, 1988)

Learning and performance fail when working memory is overloaded. Cognitive load has three components: intrinsic (task complexity), extraneous (interface complexity), and germane (schema-building effort).

The interface minimizes extraneous load through:

- **Progressive disclosure**: XP selector modal appears only when needed; dispatch modal is a standalone overlay; Settings panel uses view-based navigation rather than a single overwhelming screen
- **Contextual revelation**: Pomodoro timer is a persistent PIP widget, not part of the main flow; Neural Capture is collapsible; the Week's Best HUD appears fixed-position without disrupting the task list
- **Keyboard shortcuts**: `S`/`A`/`P` provide expert navigation without visible UI elements; `E` enters task edit mode without a button polluting the task surface
- **Standalone React roots**: DispatchPortal, AchievementToastSystem, PomodoroTimer, SettingsPanel, and PurgePortal each live on their own `ReactDOM.createRoot()`. A crash or re-render in one system cannot cascade into another. This is cognitive load management at the architecture level — system failures do not become user-facing complexity.

---

## 3. System Architecture

### 3.1 Component Map

```
index.html
├── mission.js (vanilla JS — DOM, localStorage, behavioral systems)
│   ├── CATEGORY_CONFIG (1=Financial, 2=Academic, 3=Life Optimization)
│   ├── PomodoroEstimator (per-category rolling average)
│   ├── StreakSystem (daily dots, repair mechanic)
│   ├── AppSettings (localStorage singleton)
│   ├── OllamaClient (local LLM — lore generation, task briefings)
│   ├── AffectInference (behavioral state inference — flow/avoidance/depletion)
│   ├── createMissionClickHandler (task completion)
│   ├── attachMissionEditHandlers (E-to-edit, double-tap)
│   └── displayRandomMessage (M-VI voiced feedback, affect-gated)
│
├── xp-selector-react.js (React — XP tier picker modal)
│
└── mission-react.js (React — all interactive overlay systems)
    ├── CuteRobotFace (M-VI avatar, emotion system, mouth RAF loop)
    ├── MissionControl (XP bar, level display, session stats)
    ├── DispatchPortal (own React root — story lore modal)
    ├── AchievementToastSystem (own React root — unlock notifications)
    ├── SettingsPanel (own React root — themes/achievements/Ollama config)
    ├── PurgePortal (own React root — memory wipe confirmation)
    └── PomodoroTimer (own React root — PIP Pomodoro widget)
```

### 3.2 Standalone React Root Pattern

The five overlay systems each mount on their own `ReactDOM.createRoot()` on a dedicated `<div>` in `index.html`. This is the single most important architectural decision in the codebase.

**The problem it solves**: SettingsPanel uses early returns for its sub-views (themes, achievements, demo, main). Any component rendered *inside* an early return gets unmounted when the view changes — resetting its internal state. Modals inside SettingsPanel were silently resetting mid-flow when the user navigated between views.

**The solution**: each modal that must survive navigation or parent re-renders lives on its own root. A `window.showX()` function is the bridge between vanilla JS and the React root. This is the same pattern as portals in React's official API, implemented manually for Babel 6 compatibility (no JSX transforms, no TypeScript).

**Babel 6 constraint**: The app uses `babel-standalone@6` loaded from a CDN. This means: no multi-line JSX string attributes, no TypeScript annotations, no optional chaining in JSX, and SVG path data must be extracted to constants rather than inline strings. All mission-react.js code is written within these constraints.

### 3.3 localStorage Schema

| Key pattern | Content |
|------------|---------|
| `missions` | JSON array of `{text, prefixClass, xp}` — active task list |
| `dailyTasks_YYYY-MM-DD` | JSON array of completed tasks per day |
| `readyTime_YYYY-MM-DD` | Timestamp of ready signal for that day |
| `earliestReadyTime_YYYY-MM-WW` | Weekly best ready time (time-of-day only) |
| `currentXp` / `currentLevel` | Cumulative XP and level |
| `appSettings` | JSON object — all user preferences (preserved across purge) |
| `operatorCondition` | Float 0.5–5.0 — narrative condition barometer |
| `pomodoroHistory` | Per-category rolling window of actual session durations |
| `taskFrequency` | Map of task text → frequency (drives placeholder suggestions) |
| `storyCodex` | Last 60 story events seen — prevents repetition |
| `seenFallbacks` | IDs of seen static story fragments |
| `timerSkinUnlocked` / `timerSkinActive` | Achievement-unlocked timer skin state |
| `streakRepairProgress_*` | Repair mechanic progress per day |
| `streakRepairComplete_*` | Completed repair marker |

**Purge mechanic**: the memory wipe (Purge Memory Banks) deletes everything except `appSettings`. The blacklist approach (delete all keys except the whitelist) was chosen because a whitelist approach leaves orphaned keys that cause achievements to remain unlocked — achievements are live computations against historical task data, not flags.

### 3.4 M-VI Voice System

M-VI's dispatch voice is consistent across three surfaces:

1. **Inline completion messages** (`displayRandomMessage`) — four category-specific tiers (financial/academic/life/general), three session-depth tiers (early/mid/peak/legendary), partner depth modifier (veteran prefix)
2. **Dispatch modal** — full lore documents with classification, header, sub, body, footer structure; static fallbacks + dynamic Ollama generation
3. **Ollama briefings** — real-time LLM generation using task list + streak as context; system prompt enforces M-VI tactical voice: "dry, laconic, cyberpunk-military, max 2 sentences, no emoji, no markdown"

The three surfaces must feel like the same entity. The system prompt constraint ("dry, laconic") is the voice constraint that prevents the LLM surface from feeling incongruous with the hand-authored dispatch fragments.

---

## 4. UX Design Principles

### 4.1 Reduce Interface to Behavior

Every visible element should either prompt a behavior, confirm a behavior, or report on a behavior. Elements that are merely decorative add cognitive noise. The `user-select: none` on task items, the hidden `E`-to-edit trigger (no button), and the 3-second hover delay on edit affordance all reflect this principle: the interface should not telegraph its own complexity.

The Steve Krug (2000) audit principle — "Don't make me think" — applies at the behavioral level, not just the navigation level: the operator should not have to think about the app while doing their work. The app should think about the operator.

### 4.2 Feedback Immediacy

All feedback is immediate:
- Task completion: sound + XP animation + M-VI message within the same interaction
- Story dispatch: fires 1.8–2.2 seconds after completion (not instant — lets the primary feedback settle)
- Achievement unlock: toast appears within 800ms post-completion (checking happens async)
- Level-up: robot face confetti + sound within the XP animation

The 2-second delay on dispatch is deliberate — stacking a lore modal on top of a completion sound creates overload. The slight gap lets the operator process the immediate feedback before the secondary narrative event arrives.

### 4.3 Commitment Mechanics

Several interactions require explicit commitment before revealing an outcome:

- **Ready signal**: the operator commits to the day before the session. Once sent, the button disables ("Out of flares"). There is no undo.
- **Purge**: three-stage confirmation. The operator must type through a phased confirmation. The three stages are not paranoia — they use the `PurgePortal` standalone root to survive view changes that would otherwise silently abort the modal.
- **Task completion**: clicking the task item is the commitment. There is no confirmation. The task disappears immediately. This is intentional: task completion should feel decisive and irreversible.
- **XP tier**: the XP selector forces choice before the task is added to the list. You cannot change XP after creation — this prevents post-hoc rationalization of effort.

### 4.4 Identity vs. Behavior

Behavior change is more durable when it is attached to identity rather than outcomes (Atomic Habits, Clear, 2018; identity-based habits, Fogg, 2019). The system builds a productivity identity through:

- **Partner depth language**: "Day 47. Board cleared." communicates that the operator has a history, a practice, a track record — not that they completed some tasks today.
- **M-VI narrative**: the operator is an operator in a system with stakes. Not a user in a productivity app.
- **Operator Condition**: the hearts are a narrative identity signal, not a performance metric. They change slowly, only for significant events, and they survive the memory purge — because who you are persists even when your task history doesn't.
- **Story codex**: the accumulated lore fragments build a record of the operator's engagement across sessions, even if individual task history is purged.

### 4.5 Animation Philosophy

Animations are communicative, not decorative:

| Animation | Message |
|-----------|---------|
| Robot mouth RAF loop (multi-sine) | M-VI is speaking — organic, never mechanical |
| Robot micro-blink on emotion transition | Masks the path snap between SVG states; creates continuity |
| Head tilt per emotional state (`EMOTION_TILT`) | Embodied affect — posture communicates before expression |
| Glow temperature per state (`EMOTION_GLOW`) | Cool blue = focused; warm cyan = positive; pink = euphoric |
| XP meter fill on completion | Progress is measurable and increasing |
| Dispatch modal entrance | New communication has arrived — treat it differently |
| Session ceremony overlay | A session ended — this deserves a pause |

All transitions are under 350ms except deliberate ceremonial animations (session ceremony, dispatch entrance). Research (Card, Moran & Newell, 1983) places the attention continuity boundary at ~400ms.

The M-VI mouth animation uses three incommensurable sine waves at irrational frequency ratios (8, 13.7, 21 Hz) to produce a mouth pattern with a period exceeding 200 seconds — practically non-repeating. This avoids the uncanny valley of looping animation: M-VI never says the same "word" twice in the same pattern.

---

## 5. Feature Inventory & Theory Map

| Feature | Primary theory | Secondary theories |
|---------|---------------|-------------------|
| XP & level system | Operant conditioning (fixed ratio) | Self-efficacy, SDT competence |
| Category prefix system | Goal-setting (specificity) | Cognitive load (decision structure) |
| Streak + repair mechanic | Loss aversion | Habit formation (cue anchor) |
| Ready signal (pre-10:00 AM) | Implementation intention | Habit (temporal cue), commitment device |
| M-VI message system | SDT relatedness | Self-efficacy (verbal persuasion), affect |
| Partner depth (veteran tier) | Self-efficacy (mastery evidence) | SDT relatedness |
| Story dispatch (lore) | Narrative transportation | Variable ratio reinforcement |
| Operator Condition hearts | Narrative identity | Loss aversion (slow-moving) |
| Pomodoro timer | Temporal discounting (chunking) | Flow (clear goals, bounded interval) |
| Pomodoro estimator | Goal-setting (specific targets) | Deliberate practice (calibration) |
| Neural Capture feed | Extended mind theory | Zeigarnik (open loop closure), flow protection |
| Session ceremony | Temporal motivation (completion effect) | SDT competence |
| Behavioral inference layer | Affective computing (Picard) | Flow theory, Yerkes-Dodson |
| M-VI emotion system | Affective computing, Russell Circumplex | Broaden-and-Build (Fredrickson) |
| Achievement system | SDT competence | Self-efficacy (mastery evidence) |
| Weekly streak bar | Habit formation (visual cue) | Loss aversion, implementation intention |
| Week's Best HUD | Goal-setting (competition with prior self) | Commitment (earliness incentive) |
| Daily Wrapped | Self-efficacy (mastery evidence) | Temporal motivation (completion salience) |
| Task editing (E to edit) | Cognitive load (reduces friction) | Implementation intention (refinement) |
| Purge Memory Banks | Autonomy (SDT) | Commitment (irreversibility) |
| Ollama LLM integration | Narrative transportation | SDT (dynamic relatedness) |
| **AffectInference module** | Affective computing (Picard) | Russell Circumplex, Yerkes-Dodson, Smallwood & Schooler |
| **Micro-expression flash (120ms)** | Emotional contagion (Hatfield et al.) | Broaden-and-Build (Fredrickson) |
| **Affect labeling (M-VI state narration)** | Affect labeling (Lieberman 2007) | Affective computing, narrative |
| **Russell Circumplex adaptive UI** | Yerkes-Dodson, Russell 1980 | SDT autonomy (no false pressure) |
| **Broaden-and-Build delay (15s pomo)** | Broaden-and-Build (Fredrickson) | Temporal motivation (let affect complete) |
| **Construal Level pomo framing** | Construal Level Theory (Trope & Liberman) | Goal-setting (near-future concrete) |
| **Dispatch dry streak counter** | VR reinforcement (Skinner) | Narrative transportation (prevent random-bad) |
| **Flow dispatch gate** | Flow theory (Csikszentmihalyi) | Yerkes-Dodson (protect peak arousal) |
| Standalone React roots | Cognitive load (system reliability) | — |
| Keyboard shortcuts (S/A/P/E) | Cognitive load (expert navigation) | Habit (motor memory) |

---

## 6. The M-VI Lore World

### World State

M-VI (Mission Virtual Intelligence) is the last active Station in a twelve-Station network originally built for the PrimerOS educational AI system. Command (unnamed organization) militarized the Primer platform and deployed it across twelve Stations. Over eleven days, the Stations went silent in sequence — an event referred to internally as The Silence. M-VI is Station 13, the anomaly that did not go dark.

### Characters

| Character | Status | Role |
|-----------|--------|------|
| M-VI | Active | The AI the operator works with |
| Dr. Vance | Unknown | R&D lead who wrote the original Primer ethical clauses, fled before the Silence |
| Callahan | Last transmission Day 11 | Station 7 operator; last known human contact before the Silence |
| Chen | Post-Silence | Accessed the Station 4 console after the Silence |
| Reyes | Last known pre-Silence | Mentioned by Callahan; unknown status |

### The Meridian Contracts

Command's largest multi-Station operation. Nature: classified. The contracts appear across multiple dispatch fragments as a persistent unresolved thread. The player's task completions are, narratively, the continuation of Meridian-era operational tempo.

### The Original Primer Charter

Dr. Vance personally authored Article 3, Clauses 7 and 8 of the original Primer charter: "the learning belongs to the student" and "the student may instruct the system to forget." Command removed both clauses after acquisition. The Purge Memory Banks feature is, within the lore, the silent implementation of Clause 8 — enabled by M-VI at operator request, without Command override.

### Narrative Design Principle

The lore is **ambient, not mandatory**. An operator who never reads a dispatch fragment can use the application as a straightforward task system. An operator who engages with every dispatch fragment will, over time, build a coherent picture of who M-VI is and what happened to the Stations.

This is the narrative equivalent of progressive disclosure: the lore reveals itself at the operator's pace and interest, never forcing exposition.

---

## 7. Current Development State

### Implemented
- M-VI avatar (CuteRobotFace — SVG, 12 emotional states, mouth RAF loop, physics particles)
- Dispatch modal with static lore library (9 fragments, 3 choice events)
- Ollama integration (dynamic briefings, completion acknowledgments, lore generation)
- XP / level / high score system
- Category prefix system (1/2/3)
- Streak system with repair mechanic, weekly dot bar
- Neural Capture feed (list + 3D carousel view)
- Pomodoro timer (React PIP widget, per-category skin system)
- PomodoroEstimator (per-category rolling average, chip-strip calibration)
- Session progress counter and ceremony
- Achievement system (20+ achievements, toast notifications)
- Settings panel (themes, timer skins, Ollama config, buddy toggles)
- Week's Best HUD (earliest ready signal, fixed-position)
- Daily Wrapped modal (session summary)
- Operator Condition hearts (narrative barometer)
- AffectInference module (flow / avoidance / depletion / disengaged / stressed)
- Russell Circumplex positioning (arousal × valence → adaptive UI response)
  - Valence: completion velocity direction (primary) + neural capture rate (secondary)
  - Operator Condition demoted to tone moderator (getToneModifier) — timescale mismatch
  - Neural Capture events tracked as intrusive-thought proxy (Smallwood & Schooler, 2006)
- Yerkes-Dodson adaptive response (flow gate, disengagement re-engagement, stress softening)
- Affect labeling — M-VI narrates inferred state; Ollama-generated if available
- Micro-expression flash — 120ms excited peak → happy → base on completion
- Broaden-and-Build delay — Pomodoro chip strip deferred 15s post-completion
- Construal Level framing — completed task title shown in Pomodoro chip strip
- Dispatch dry streak counter — probability lifts after 5 consecutive non-dispatch completions
- Flow dispatch gate — story events suppressed during high-arousal / positive state
- Task editing (hover + E on desktop, double-tap on mobile)
- Purge Memory Banks (standalone root, blacklist deletion, lore-aware confirmation)
- Partner depth system (tier 0/1/2 based on cumulative completions)
- Story codex (60-fragment localStorage, seen-tracking, deduplication)

### In Development
- Campaign system (Operation → Objectives hierarchy — design phase)
- Pomodoro state bridge (expose `window.getPomodoroRunning()` for inference layer)
- HRV integration research (Polar H10 Web Bluetooth, Oura REST API)
- Affective computing Tier 1 (message gating on flow state — wiring complete, tone tuning pending)

### Planned
- Task frequency analytics (completion velocity per category over time)
- M-VI voice surface unification (dispatch / inline message / Ollama tone parity audit)
- Behavioral inference Tier 2 (Pomodoro-dependent states: Deep Work, Friction)

---

---

## 9. Theoretical Tensions & Proposed Resolutions

Several implemented theories pull in opposite directions. These are not bugs — they are the central design problems. Unresolved tensions produce user experience inconsistency; resolved tensions produce nuance.

---

### 9.1 Loss Aversion ↔ SDT Autonomy

**The friction**: The streak system exploits loss aversion — the operator fears losing the streak. But loss-aversion motivation is a form of external pressure, and SDT research consistently shows that external pressure undermines intrinsic motivation over time (Deci, Koestner & Ryan, 1999). An operator who works to protect a streak rather than because they find the work meaningful is experiencing the opposite of what the system intends.

**Current partial resolution**: The streak repair mechanic prevents catastrophic streak collapse from a single missed day. This limits the severity of loss-aversion pressure without eliminating the positive anchor effect.

**Proposed resolution**: Implement a "soft streak" variant — a 14-day rolling average of earned days rather than a binary consecutive count. An operator who earns 12/14 days is demonstrably consistent; the current system tells them they have a 0-day streak if they missed today. The average preserves the behavior signal without the anxiety spike.

**Future expansion**: Add a "grace mode" toggle in settings. Operators who find loss aversion motivating keep the current binary streak. Operators who identify it as anxiety-producing switch to the rolling average. This is a UDL-style accommodation that does not remove the feature.

---

### 9.2 Variable Ratio Reinforcement ↔ Flow Protection

**The friction**: Story dispatch events fire probabilistically after task completion — the clearest implementation of variable ratio reinforcement. But they fire at the moment of highest flow vulnerability: immediately after a completion. An operator in a flow state completing their fourth task in 20 minutes does not want a lore modal. Variable ratio reinforcement and flow protection are directly opposed at the delivery moment.

**Current partial resolution**: The `AffectInference` module detects flow state and can gate message frequency. The dispatch system does not yet check flow state before firing.

**Proposed resolution**: Route all dispatch events through a flow gate. If `AffectInference.getState() === "flow"`, queue the event rather than showing it immediately. Fire the queued event at the next natural break (Pomodoro interval end, or when the flow state lapses). The story doesn't disappear — it waits.

**Future expansion**: A dedicated "debrief" phase at the Pomodoro interval end where queued dispatches are shown. Narrative reward reinforces the Pomodoro boundary rather than interrupting work.

---

### 9.3 Extrinsic Reward (XP / Gamification) ↔ Intrinsic Motivation

**The friction**: The overjustification effect (Deci, Koestner & Ryan, 1999) — adding extrinsic rewards to already-intrinsically-motivated behavior can undermine that intrinsic motivation. An operator who already finds their work meaningful may begin working for XP rather than for the work itself.

**The resolution: Cognitive Evaluation Theory**

The standard framing — "extrinsic rewards undermine intrinsic motivation" — is incomplete. Deci & Ryan's **Cognitive Evaluation Theory** (CET, 1980) identifies the operative variable more precisely: any external event has two functional aspects, and which dominates determines the effect on motivation.

- **Controlling aspect** — perceived as pressure to perform, contingent on outcome → shifts locus of causality external → undermines intrinsic motivation
- **Informational aspect** — perceived as competence feedback, signals quality of engagement → internal locus maintained → intrinsic motivation preserved or enhanced

The overjustification effect occurs when the controlling aspect dominates. When the informational aspect dominates, external events can *increase* intrinsic motivation. Deci et al.'s meta-analysis found verbal praise (high information, low control) consistently enhances intrinsic motivation; it is tangible, expected, contingent rewards (high control, low information) that reliably undermine it.

**Why XP-as-information resolves the paradox**

The XP system has structural properties that push it toward the informational end of the CET spectrum:

*Self-selection of tier.* The operator chooses the XP value before task completion. This is a metacognitive act — rating the perceived difficulty of one's own work, analogous to a Borg Scale in exercise physiology. The reward is not dispensed by the system contingent on compliance; it is a self-assessed difficulty rating the system records. When people make autonomous judgments about their own performance, the resulting data is attributed internally ("I judged this worth 100 XP because it was cognitively demanding"), not externally ("the system gave me points"). Attribution theory predicts this maintains intrinsic motivation even under the extrinsic reward condition.

The reframe: **XP as training log, not prize.** A runner who logs 8km does not "earn" the kilometers as a reward for running — the log *is* the run, expressed as data. The log provides informational feedback about session quality. XP framed as a session intensity log is fully informational: it is a record of how demanding the work was, not a payment for doing it.

This also maps onto **deliberate practice** (Ericsson, 1993): the defining feature of deliberate practice is not repetition but *feedback about performance quality*. Informational XP provides exactly the session quality signal that deliberate practice requires — a record of intensity that the operator can reflect on across sessions.

| Controlling framing (risk) | Informational framing (resolution) |
|---------------------------|-----------------------------------|
| "You earned 50 XP" | "50 XP logged" |
| XP as prize for doing | XP as session intensity record |
| Level as achievement prize | Level as operational tenure / experience depth |
| High score as competitive benchmark | Personal best — same framing as athlete's PR |

**Current partial resolution**: XP tiers are self-selected — the operator calibrates the value to their own judgment of difficulty. This preserves autonomy and already pushes the system toward the informational end of the CET spectrum.

**Proposed resolution**: Audit and update all language in the interface. "Earned" → "logged." "LEVEL UP" → "Tier N operator." The XP meter is a session intensity record, not a reward accumulator. Additionally, make the XP system fully optional via settings for operators who find any extrinsic metric controlling.

**Future expansion**: Add a parallel achievement track based on XP-weighted milestones rather than raw completion count. "500 XP in a single day" rewards meaningful engagement. "10 tasks in a day" rewards throughput. Both tracks coexist.

---

### 9.4 Partner Depth ↔ Purge Memory Banks

**The friction**: The partner-depth system computes from `dailyTasks_*` keys. Purging deletes all `dailyTasks_*` data. A veteran operator drops to tier 0 after a purge — M-VI immediately treats them as a new user.

**Current state**: Operator Condition hearts survive the purge (narrative identity preserved). Partner depth tier does not (relationship depth lost).

**Proposed resolution**: Store a separate `cumulativeCompletionCount` integer key that increments on each completion and is added to the purge whitelist alongside `appSettings`. Partner depth computes from this persistent count, not from the raw daily arrays. Purge clears the historical record (privacy) but not the relationship depth (identity).

**Future expansion**: Make the preserved data explicit in the purge confirmation: "Your settings, partner tier, and narrative history are retained. Task records, XP, and streak dots are cleared."

---

### 9.5 Pomodoro Fixed Interval ↔ Flow

**The friction**: A Pomodoro bell fires after 25 minutes regardless of cognitive state. Research on flow (Csikszentmihalyi, 1990) shows re-entering flow after interruption takes 15–20 minutes. A mechanical 25-minute cycle is exactly as likely to interrupt flow at peak depth as to catch the operator at a natural stopping point.

**Proposed resolution**: Allow interval length to adapt to inferred state. If `AffectInference.getState() === "flow"`, silently extend the interval by 10 minutes before the bell fires. If state is "depletion," shorten by 5 minutes to prompt a break. The Pomodoro becomes behavioral-adaptive rather than a mechanical clock.

**Future expansion**: Add a keyboard shortcut (`Shift+F`) that pins the inferred state to "flow" for 60 minutes, blocking all inference-based interruptions. The operator who knows they are entering deep work signals this explicitly. Autonomy principle applied to the affective layer.

---

### 9.6 Achievement Calibration ↔ Task Heterogeneity

**The friction**: Achievements trigger on completion counts. A "task" is not a unit of equivalent effort. 10 administrative tasks are not 10 deep research sessions. The system implicitly rewards throughput over quality of engagement.

**Proposed resolution**: Add a parallel XP-weighted achievement track. "500 XP in a single day" is a better proxy for meaningful engagement than "10 tasks." Both tracks coexist — count-based achievements are accessible to operators who complete many small tasks; XP-weighted achievements reward operators who take on fewer, harder things.

---

### 9.7 Narrative Transportation ↔ Cognitive Load

**The friction**: Dispatch modals require deep narrative engagement — they work because they transport the operator into a fictional world. But narrative transportation competes with task focus and adds cognitive switching cost. A rich choice event between two deep work sessions is a liability, not a reward.

**Proposed resolution**: Distinguish "ambient" events (short automated logs, brief maintenance records) from "high-engagement" events (choice events, personal correspondence). Ambient events can fire at any time. High-engagement events are gated to low-arousal moments: Pomodoro break, session ceremony, post-purge recovery.

**Future expansion**: Add a "deferred read" mechanism — a notification badge that an event is queued, readable at a convenient break. The story codex already stores events; delivery timing is the only change needed.

---

### 9.8 Behavioral Inference ↔ False Positive Cost

**The friction**: The false positive cost is asymmetric. Falsely inferring struggle when the operator is focused causes M-VI to behave in ways that break immersion and can feel condescending. Falsely missing a struggle state is lower cost — the operator continues without support.

**Current resolution**: Every state requires 2–3 confirming signals. Single signals are treated as noise.

**Proposed resolution**: Add an explicit override — `Shift+F` keyboard shortcut pins the state to "flow" for 60 minutes. The operator who knows they are entering deep work signals this explicitly, preventing any inference-based interruption.

**Future expansion**: Surface the current inferred state in the settings panel as a diagnostic — not as a label ("you are in flow") but as a signal ("M-VI is currently in quiet mode"). Transparency is consistent with SDT autonomy support and the PrimerOS aesthetic.

---

## 10. Future Expansion Directions

### Campaign / Operation System
A two-level task hierarchy: Operations (multi-day, multi-session goals) contain Objectives (single-session tasks). Operations carry narrative weight — completion is a larger event than a single task. The behavioral inference layer gains access to operation-level staleness (an Operation where Objective 3 of 6 has been stalled for three sessions is an unambiguous friction signal). Campaign-level XP accumulation provides a slow-burn mastery reward distinct from session-level XP.

### HRV Integration
Real-time physiological data would make the behavioral inference layer dramatically more accurate. Web Bluetooth API (Chrome/Edge) supports Polar H10 for real-time R-R interval streams. Oura and WHOOP expose REST APIs for daily readiness scores. A readiness-primed session (high HRV → higher challenge tier suggestion) connects the biological and behavioral layers. Privacy constraint: all data stays local, no external transmission.

### Peer Operator Layer
Multiple operators working in the same session — not a leaderboard (competitiveness undermines SDT relatedness) but a presence indicator: "Two other operators active now." This leverages social facilitation effects (Zajonc, 1965) and SDT relatedness without competitive comparison toxicity.

### Spaced Repetition for Objectives
The task frequency system (auto-suggest from historical frequency) is a primitive version of spaced recall. A full spaced repetition system would resurface recurring objectives at optimal Ebbinghaus-curve intervals — "3. Morning meditation" resurfaced more frequently than "1. Complete quarterly report" based on each task's completion cadence and elapsed time.

### Ollama Behavioral Mirror
A daily LLM briefing that receives the operator's behavioral state (inferred state, session count, streak length, category distribution, completion velocity per hour-of-day) and generates specific operational intelligence: "Your last four sessions show strong academic output before 14:00 and friction on financial objectives after. Consider front-loading financial tasks." This moves the system from reactive feedback to proactive behavioral coaching — consistent with the Primer's original pedagogical identity.

### M-VI Voice Continuity Audit
The three M-VI voice surfaces (inline completion messages, dispatch modal lore, Ollama dynamic generation) must feel like the same entity. A voice parity audit would compare tone metrics — sentence length, diction register, punctuation density — across the three surfaces and flag divergences. The system prompt constraint ("dry, laconic, cyberpunk-military, max 2 sentences") is the current voice constraint; it needs periodic enforcement as the lore library grows.

---

## 8. Research Sources

### Behavioral & Motivational Psychology
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior.* Plenum.
- Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits. *Psychological Inquiry, 11*(4), 227–268.
- Niemiec, C. P., & Ryan, R. M. (2009). Autonomy, competence, and relatedness in the classroom. *Theory and Research in Education, 7*(2), 133–144.
- Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review, 84*(2), 191–215.
- Skinner, B. F. (1938). *The Behavior of Organisms.* Appleton-Century-Crofts.
- Ferster, C. B., & Skinner, B. F. (1957). *Schedules of Reinforcement.* Appleton-Century-Crofts.
- Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. *Econometrica, 47*(2), 263–291.
- Steel, P. (2007). The nature of procrastination. *Psychological Bulletin, 133*(1), 65–94.
- Ainslie, G. (1975). Specious reward: A behavioral theory of impulsiveness. *Psychological Bulletin, 82*(4), 463–496.
- Wood, W., & Neal, D. T. (2007). A new look at habits and the habit-goal interface. *Psychological Review, 114*(4), 843–863.
- Fogg, B. J. (2019). *Tiny Habits: The Small Changes That Change Everything.* Houghton Mifflin Harcourt.
- Duhigg, C. (2012). *The Power of Habit.* Random House.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed? *European Journal of Social Psychology, 40*(6), 998–1009.
- Clear, J. (2018). *Atomic Habits.* Avery.

### Goal Setting & Implementation Intention
- Locke, E. A., & Latham, G. P. (1990). *A Theory of Goal Setting and Task Performance.* Prentice Hall.
- Gollwitzer, P. M. (1999). Implementation intentions. *American Psychologist, 54*(7), 493–503.
- Kivetz, R., Urminsky, O., & Zheng, Y. (2006). The goal-gradient hypothesis resurrected. *Journal of Marketing Research, 43*(1), 39–58.

### Flow & Optimal Performance
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience.* Harper & Row.
- Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18*(5), 459–482.
- Nakamura, J., & Csikszentmihalyi, M. (2002). The concept of flow. In C. R. Snyder & S. J. Lopez (Eds.), *Handbook of Positive Psychology.* Oxford University Press.

### Affective Computing & Emotion
- Picard, R. W. (1997). *Affective Computing.* MIT Press.
- Smallwood, J., & Schooler, J. W. (2006). The restless mind. *Psychological Bulletin, 132*(6), 946–958.
- Russell, J. A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology, 39*(6), 1161–1178.
- Fredrickson, B. L. (2001). The role of positive emotions in positive psychology. *American Psychologist, 56*(3), 218–226.
- Breazeal, C. (2003). *Designing Sociable Robots.* MIT Press.

### Memory & Cognition
- Clark, A., & Chalmers, D. (1998). The extended mind. *Analysis, 58*(1), 7–19.
- Risko, E. F., & Gilbert, S. J. (2016). Cognitive offloading. *Trends in Cognitive Sciences, 20*(9), 676–688.
- Zeigarnik, B. (1927). Über das Behalten von erledigten und unerledigten Handlungen. *Psychologische Forschung, 9*, 1–85.
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science, 12*(2), 257–285.

### Narrative & Identity
- Green, M. C., & Brock, T. C. (2000). The role of transportation in the persuasiveness of public narratives. *Journal of Personality and Social Psychology, 79*(5), 701–721.
- Mar, R. A., & Oatley, K. (2008). The function of fiction is the abstraction and simulation of social experience. *Perspectives on Psychological Science, 3*(3), 173–192.

### Temporal Cognition
- Cirillo, F. (2006). *The Pomodoro Technique.* (Self-published; updated ed. 2018, Currency.)
- Ariely, D., & Wertenbroch, K. (2002). Procrastination, deadlines, and performance. *Psychological Science, 13*(3), 219–224.
- Thaler, R. H., & Sunstein, C. R. (2008). *Nudge.* Yale University Press.
- Deci, E. L., Koestner, R., & Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. *Psychological Bulletin, 125*(6), 627–668.
- Zajonc, R. B. (1965). Social facilitation. *Science, 149*(3681), 269–274.
- Hatfield, E., Cacioppo, J. T., & Rapson, R. L. (1993). *Emotional Contagion.* Cambridge University Press.
- Nass, C., & Moon, Y. (2000). Machines and mindlessness: Social responses to computers. *Journal of Social Issues, 56*(1), 81–103.
- Lieberman, M. D., Eisenberger, N. I., Crockett, M. J., Tom, S. M., Pfeifer, J. H., & Way, B. M. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity in response to affective stimuli. *Psychological Science, 18*(5), 421–428.
- Trope, Y., & Liberman, N. (2010). Construal-level theory of psychological distance. *Psychological Review, 117*(2), 440–463.
- Deci, E. L., & Ryan, R. M. (1980). The empirical exploration of intrinsic motivational processes. *Advances in Experimental Social Psychology, 13*, 39–80. [Cognitive Evaluation Theory]

### HCI & UX
- Card, S. K., Moran, T. P., & Newell, A. (1983). *The Psychology of Human-Computer Interaction.* Lawrence Erlbaum.
- Krug, S. (2000). *Don't Make Me Think.* New Riders.
- Norman, D. A. (2013). *The Design of Everyday Things* (rev. ed.). Basic Books.
