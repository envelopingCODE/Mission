# Mission VI — Visual Design Language

This is the **how-it-looks-and-feels spec**. Read it before writing any new UI, CSS, or copy.
It exists so that any contributor (human or model) can produce work indistinguishable from the
existing surface. For *why* the system is designed this way, see [DESIGN.md](DESIGN.md)
(behavioral theory) and [mission_design.md](mission_design.md) (instructional design rationale).

## 1. Identity in One Sentence

**Surfaces talk like a military terminal; interactions behave like iOS.**

The fusion is Cyberpunk 2077 / future-militaristic chrome (monospace, scanlines, glow,
tactical vocabulary, dark glass) with Apple-grade interaction manners (soft cubic-bezier
motion, directional navigation, toggle switches, restraint, nothing startles). When the two
pull in different directions: **visual texture goes cyberpunk, behavior goes iOS.**

## 2. Color System

Alpha does the styling work in this codebase. Hues are few and fixed; hierarchy comes from
opacity, not from new colors. Never introduce a new hue without checking this table first.

| Token | Value | Role |
|---|---|---|
| HUD cyan | `#86dfff` / `rgba(134,223,255,α)` | Primary chrome: borders, labels, interactive elements, timer ring (work) |
| Reward teal | `rgba(15,223,171,α)` / `#0fdfab` | XP, payouts, the multiplier digit, session-complete, break ring — anything *earned*. The multiplier flashes white mid-tick and settles teal |
| Warning red | `rgba(255,80,60,α)` | Destructive actions only (purge). Never for emphasis |
| Terminal green | `rgba(15,210,75,α)` | Purge-terminal text, tiny status tags. Old-phosphor accent |
| Neon skin | `#00d4ff → #8b00ff → #ff00e5` (vertical gradient) | Unlockable timer skin only. Never leaks into base UI |
| Glass | `rgba(0,0,0,0.88–0.98)` + `backdrop-filter: blur(20–24px)` | Panel and widget backgrounds |

**The alpha ladder** (cyan shown; applies to every hue):
- `0.03–0.08` — fills, resting backgrounds
- `0.1–0.2` — borders, hover fills
- `0.3–0.5` — secondary text, inactive labels
- `0.55–0.85` — primary text, active labels
- `1.0` — hover/active states and glow cores only

Glow = the color at full alpha inside `drop-shadow`/`text-shadow`, e.g.
`drop-shadow(0 0 2px rgba(134,223,255,1)) drop-shadow(0 0 7px rgba(134,223,255,0.85))`.
Layer 2–3 shadows with rising radius and falling alpha. Glow marks *live* things (running
timers, earned rewards, speaking buddy) — static chrome does not glow.

## 3. Typography

- **HUD text**: `"Courier New", monospace` — everything inside panels, widgets, terminals.
- **Body text**: the `system-ui` stack — task list content and long-form reading only.
- Micro-labels are small and tracked wide: `0.54–0.83rem`, `letter-spacing: 0.08–0.2em`,
  `text-transform: uppercase` for section titles, tags, and state labels.
- Numbers that matter (timers, multipliers, stats) get `font-weight: 700` and may glow.
- Never use a display/decorative font. The terminal look comes from spacing + case, not fonts.

## 4. Shape & Surface

Border-radius encodes register:
- `2px` — terminal / destructive surfaces (purge). Hard military edges.
- `3–4px` — chips, inputs, badges, buttons. Default for controls.
- `6–10px` — cards, toggle switches (iOS pill).
- `18px` — the floating PIP widget. Softest thing on screen, it floats above everything.

Surfaces are dark glass (see Glass token) with a 1px border at low alpha. Recessed displays
(payout windows, terminals) add `box-shadow: inset 0 1px 4px rgba(0,0,0,0.6)`. Scanlines
(`repeating-linear-gradient`) are reserved for full-terminal moments like the purge modal.

## 5. Motion

- **Curves**: `cubic-bezier(0.22,1,0.36,1)` for settles/navigation, `cubic-bezier(0.4,0,0.2,1)`
  or `ease` for everything else.
- **Durations**: 0.12–0.28s for interactions. Ambient loops (corona pulse, sparkle, steam) run
  3–5s and are subtle enough to ignore.
- **Navigation**: settings views slide directionally ±22px with fade, like iOS push/pop
  (`settingsViewForward` / `settingsViewBack`).
- **Reward pops**: scale from ~1.1–1.6 down to 1 with a brief white bloom that settles to
  teal (`pipXpTick`, `simPaylineSettle`). Rewards pop; chrome never does.
- **Intensity ramp**: a sustained reward (the OPS payout roll-up) drives a single
  `--sc-intensity` custom property (0→1) from JS per beat; CSS `calc()` maps it onto
  border/glow strength and a `transition` smooths between beats, so the panel visibly
  charges as the count climbs, then eases to a calm resting glow on landing. This is the
  house pattern for "escalate then settle" — one property, disclosed math, no variable reward.
- **Comet**: a `conic-gradient` traced onto a border via `mask`/`mask-composite`, its angle
  animated through an `@property <angle>`, giving a bright head that races the border during
  a payout. Modern-CSS ornament — always degrade gracefully to the plain glow beneath it.
- Animation is *feedback*, not decoration. If it doesn't communicate state, cut it.
  A paused timer must also pause its ambient effects (steam, glow) — a still clock with
  moving parts reads as broken.

## 6. Sound

All interaction audio is Web-Audio-synthesized, short, and quiet. Every sound is gated behind
`AppSettings.get().soundEnabled`.

- **XP ticks**: square wave, ascending pitch ladder D4→E4→G4→A4→B4→D5, ~0.06 gain, 60ms each.
- **Alarms**: sine 660Hz, three tones escalating gently 0.05→0.095 gain — never one loud blast.
- **Warm finale**: `levelUpSound.mp3`; at 0.38 volume when it follows a tick sequence.
- Rules: under 0.6s per tone, escalate never startle, pitch rises with progress.

## 7. Component Recipes (settings panel `st-*` family)

Reuse these before inventing anything:

- **Section**: `.st-section` > `.st-section-title` (uppercase micro-title, optional
  `.st-badge` chip beside it — e.g. `Buddy AI [Ollama]`, `Diagnostics [SIM]`).
- **Row**: `.st-row` (flex, space-between, hairline top border between rows).
- **Toggle**: `.st-switch`/`.st-thumb` — iOS pill switch, cyan when on.
- **Input**: `.st-input` — dark fill, cyan border brightening on focus. Number inputs hide
  native spinners.
- **Button**: `.st-btn` — quiet cyan bordered chip. Disabled = 0.35 opacity.
- **Chips**: `.st-sim-chip` / `.demo-emotion-btn` / `.pip-break-chip` — equal-width monospace
  quick-picks, active state = brighter fill + border. This is the house segmented control.
- **Payout overlay**: `.pip-session-complete` — the live OPS reward. A readout panel whose
  border-glow intensity and comet sweep ramp with the roll-up (§5 Intensity ramp / Comet),
  reward-teal multiplier flashing white per tick, disclosed `25m = +XP` label held on-screen
  the whole time. Sub-unit sessions use the `.pip-sc-quiet` variant — soft steady glow, banked
  time framed as forward progress, never a loss.
- **Payout window**: `.st-sim-payline` — the *preview* twin of the above: recessed dark glass
  quoting the overlay verbatim (reward-teal multiplier + uppercase cyan label). Any reward
  preview must use the same glyphs and colors as the reward itself.
- **Destructive**: `purge-trigger` pattern — transparent fill, red border, radius 2px. Red is
  never used at rest anywhere else.

## 8. The Robot Buddy

Genealogy: **Yes Man** (Fallout: New Vegas) × **GERTY** (Moon, 2009) × **Eilik** (Energize
Lab desktop companion), reconceptualized in the app's cyberpunk/military chrome. From Yes
Man: the earnest, unguarded screen-face that is genuinely on your side. From GERTY: the
minimal emoticon on a monitor — a face reduced to the fewest strokes that can still carry
care. From Eilik: glowing cyan eyes on a dark screen as the *primary* emotional instrument —
whole moods carried by eye shape alone (round = content, drooped = sad, squinted = focus),
plus the toy-like charm of small reactive gestures. The fusion: **a sincere minimal face
drawn as cyan line-art with glow**, not a humanoid, not a mascot.

Implementation rules:
- All affect lives in the **eyes and mouth**. Emotions are geometry changes (squint, scan,
  curve), never added props, colors, or particle effects.
- Stroke language matches the HUD: `currentColor` thin strokes + cyan drop-shadow glow —
  the same vocabulary as the break icons and timer ring.
- Speaking = JS-driven mouth motion + `mouthGlow` filter pulse; processing (Ollama) = eye
  scan left-right; emotion states via `window.setRobotEmotion(name, ms)`:
  `neutral | flow | sleepy | curious | alert | composing`.
- Tone: earnest and calm, never sarcastic, never guilt-tripping. The buddy is a teammate,
  not a supervisor. (Voice rules: DESIGN.md §3.4.)

## 9. Copy Register

M-VI tactical voice (when `narrativeStyle` is on): operations vocabulary — *OPS, operator,
objective, dispatch, briefing, protocol, LIVE OPS*. Uppercase for machine states
(`SESSION COMPLETE`), sentence case for human actions (`Take a break`).

| Do | Don't |
|---|---|
| `Finish OPS →` | `Submit` / `Done` |
| `End break →` | `End break early →` (implies guilt — the user chose the break) |
| `2× 25m = +20 XP` shown *before* awarding | Surprise rewards, hidden math |
| `Runs the OPS payout sequence` | `This feature allows you to simulate…` |

Hard rules: pass the trunk test (a stranger must understand the control from its label alone);
reward math is always disclosed before it pays; copy never guilts, hedges, or exclaims.

## 10. Checklist for New UI

1. Can an existing `st-*` / `pip-*` recipe carry it? Reuse before inventing.
2. Colors from §2 only, styled via the alpha ladder. No new hues.
3. Monospace + tracking for anything HUD-like; uppercase micro-title if it's a section.
4. Motion: one settle curve, ≤0.28s, communicates state. Rewards pop, chrome doesn't.
5. Sound (if any): synthesized, quiet, gated on `soundEnabled`.
6. Copy in M-VI register; trunk test; reward math disclosed.
7. Glow only on live/earned things. Red only on destructive things. Teal only on earned things.
