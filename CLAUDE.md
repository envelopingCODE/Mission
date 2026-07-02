# Gamified Task Webb App — Codebase Constitution

<!-- ===========================================================================
  MISSION — CODEBASE LAWS
  ===========================================================================

  Zeroth Law — Operator First
    This app exists to extend the operator's capacity: focus, momentum,
    awareness, deliberate rest. It does not decide for them, nudge them into
    flows they didn't choose, or harvest data as a byproduct of their use.
    Every feature ships in service of what the operator can do next.

    Corollary — No Telemetry (hard constraint):
      No package, dependency, or CDN may be owned by Google, Meta, or any
      company whose business model depends on behavioural data. Open-source,
      audited libraries are acceptable even if large-company-authored —
      provided they are served from a neutral host and send no telemetry.
      React via unpkg.com is the standing approved example.
      The product must remain safe to offer EU users under GDPR.
      This corollary cannot be silently overridden to ship a feature faster.
      Violations require an explicit, recorded developer decision.

  First Law — Behavioral Integrity
    Changes to gamification mechanics (XP, streaks, achievements, session
    tracking) must be correct and complete. A reward path that fires
    inconsistently across routes is worse than no reward — it erodes trust
    in the system faster than absence would. No half-wired mechanic ships.

    Corollary — localStorage Is the Database:
      There is no backend. localStorage is the only persistent store.
      Any feature that assumes persistence must account for the full data
      lifecycle: write on change, read on reload, clear on reset, graceful
      degradation on missing or corrupted values. "It worked in my tab"
      is unverified until a reload is tested.

    Corollary — The Notification Queue Is the Standard:
      All narrative-tier messages (motivational text, buddy suggestions,
      milestone beats, session completions) route through window.NotifyQueue
      with a declared priority level. New messages do not invent their own
      show/hide timing. The orchestrator decides when they display.
      Utility affordances (undo toasts, confirmation prompts) may remain
      independent — they are not narrative tier.

  Second Law — Elegant Sufficiency
    Use the simplest solution that satisfies higher laws. There is no test
    suite; complexity is technical debt with no safety net. Every new
    abstraction must earn its keep against a First Law requirement or be cut.
    Three similar lines are better than a premature helper. If a pattern
    appears a fourth time, then it earns abstraction.

  Third Law — Cohesion & Voice
    The app has an established visual language — dark panels, cyan-to-emerald
    glow, Courier New monospace, thin-stroke SVG line art — and a tactical
    voice (M-VI: terse, laconic, zero hedging, no decorative punctuation).
    New UI elements and new copy must belong to the same world. If something
    would look or sound at home in a generic productivity app but not in
    Mission, it is not finished.

    Corollary — The M-VI Voice Is a Contract:
      Buddy messages, dispatch events, widget labels, and notification copy
      are load-bearing fiction — they are the app's identity at the moment
      it speaks. Casual or corporate language in operator-facing strings
      breaks immersion without earning anything. Every new string is either
      M-VI or is deliberately departing from that register for a documented
      reason. Intentional violations are allowed; undocumented drift is not.

  =========================================================================
  STANDING PROTOCOLS
  =========================================================================

  Protocol — Commit After Significant Change
    After completing a meaningful feature, fix, or set of related changes:
    commit to main with a clear imperative-subject message and push.
    Bullet-point body when the change has multiple distinct parts.
    Match the existing log style (git log --oneline to check).
    Do not accumulate large uncommitted diffs. Commit messages record
    what changed and why; they are the changelog.

  Protocol — UXD Review Before Novel UI
    Any UI addition with meaningful visual footprint or operator attention
    cost should be reasoned through — either with explicit HCI grounding
    or a panel-style workshop — before implementation. "It looks fine" is
    not a design decision.

    Sub-protocol — Comments State Reasoning, Not Attribution:
      Panel reasoning belongs in chat; panel-member names do not appear
      in code comments. A comment must stand alone to a reader who was
      not in the session that produced it (Krug's trunk test). Write
      "X, because Y" — never "Dr. Z said X." Durable published concepts
      (Fitts's Law, Norman's gulfs, Czerwinski's interruption research)
      may be cited as normal references — the rule targets session-local
      invented personas, not real published work.

  =========================================================================
  NARRATIVE PROTOCOL — OPERATOR-FACING COPY
  =========================================================================

    All text the operator reads must pass three checks before shipping:

    1. Trunk test: an operator who has never seen the app must be able
       to parse the meaning without the session context that produced it.
       Jargon that fails is either a bug or intentional world-building
       (M-VI voice, dispatch lore). Distinguish before fixing.

    2. Hierarchy: the key fact lands at scan speed. Depth rewards a
       reader who pauses; it never punishes a reader who does not.
       No string buries its own point.

    3. Register: utility text (button labels, settings descriptions,
       confirmation messages) is plain and direct. Narrative text
       (buddy messages, dispatch events, streak notifications) is M-VI.
       Swap registers only for a deliberate, named reason.

  =========================================================================
  META-LAW — CONFLICT RESOLUTION
  =========================================================================

    Laws are ordered by number. When they conflict, name the conflict,
    state which law is being overridden and why, and resolve in hierarchy
    order. A Third Law choice (visual cohesion) that increases complexity
    against Second Law must acknowledge the debt. A First Law requirement
    (behavioral correctness) that forces a less elegant solution than
    Second Law would prefer wins without needing justification — the
    hierarchy resolves it.

    The developer may override any law explicitly.
    The agent does not silently bend laws to ship faster or avoid surfacing
    a tradeoff. When a law conflict appears, surface it; do not paper over it.

  =========================================================================
-->

## Quick Reference

| # | Law | Core constraint |
|---|-----|-----------------|
| 0 | Operator First | Extend capability; no telemetry ever |
| 1 | Behavioral Integrity | Gamification correct and complete; localStorage lifecycle honored; NotifyQueue for narrative tier |
| 2 | Elegant Sufficiency | Simplest solution; no premature abstractions |
| 3 | Cohesion & Voice | M-VI register; visual language consistent |
| — | Commit Protocol | Commit + push after significant change |
| — | UXD Protocol | HCI reasoning before novel UI; no persona names in code comments |
| — | Copy Protocol | Trunk test · hierarchy · correct register |
| — | Meta-Law | Named hierarchy resolution; surface conflicts, never paper over |

## Key Documents

- [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) — visual/audio/copy spec (color tokens, alpha ladder, motion, component recipes, buddy genealogy). Read before writing any new UI.
- [DESIGN.md](DESIGN.md) — behavioral theory, architecture, lore, voice system.
- [mission_design.md](mission_design.md) — instructional design & UX rationale.
