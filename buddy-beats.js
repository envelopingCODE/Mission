// ── Buddy Beats ─────────────────────────────────────────────────────────────
// Gesture layer for the robot buddy. Sibling to NotifyQueue: same shape of
// problem (several call sites each firing their own reaction with no awareness
// of the others), same shape of answer (one orchestrator decides *when*).
//
// The distinction this module exists to draw:
//
//   MOOD  — sustained, ambient, low-frequency. Lives in CuteRobotFace's
//           `currentEmotion`. Answers "how is the buddy right now".
//   BEAT  — brief, reactive, high-salience. Lives here. Answers "what just
//           happened".
//
// A beat plays *over* the mood on its own channels and never writes to
// `currentEmotion`. That is the whole point: a beat cannot clobber a mood, so
// there is nothing to restore when it ends — the face is already wearing the
// mood it had before. Modelling a high five as a 13th emotion would have made
// celebrating a task *replace* deep-focus state and then dump the buddy into
// neutral, which reads as amnesia.
//
// A beat is a keyframe table over six channels, borrowed from how sign
// languages decompose gestures (handshape · location · movement · orientation)
// rather than storing thousands of whole signs:
//
//   glyphL/glyphR  what each eye has become (null = the mood's own eye shape)
//   gaze           {x,y} eye offset, overriding the idle wander
//   lid            aperture, 1 = open, 0 = shut
//   mouth          explicit mouth path, overriding the mood's
//   tilt           head rotation in degrees, added on top of the mood's tilt
//   body           {x,y,scale} of the whole face — lunge, dip, squash
//
// New gestures are a row in BEATS, not a new function and not a new window
// global.
(function () {
  // ── Glyph table ───────────────────────────────────────────────────────────
  // Authored in a normalized box from -1..1, mapped at render time onto each
  // eye's measured bounding box. Hard-coding viewBox coordinates would bake in
  // assumptions about eye geometry that differ per expression; normalized
  // glyphs land correctly on whatever shape the current mood is wearing.
  //
  // `mode` follows the HUD stroke language (DESIGN_LANGUAGE §2): thin strokes
  // with the cyan glow, except where a solid silhouette reads better at the
  // ~150px the sidebar actually renders this at.
  var GLYPHS = {
    // Objective cleared.
    check: {
      d: "M-0.72,0.04 L-0.20,0.62 L0.76,-0.62",
      mode: "stroke",
      weight: 0.3,
    },
    // Level up. Four-point sparkle rather than a five-point star — the concave
    // waist survives downscaling, where a five-point star turns to mush.
    // Stroke, not fill: a filled shape this size blooms into a solid glowing
    // blob under the same blur filter that makes check/chevron read as crisp
    // line-art — confirmed by eye in-app, not just reasoned about up front.
    star: {
      d: "M0,-1 Q0.16,-0.16 1,0 Q0.16,0.16 0,1 Q-0.16,0.16 -1,0 Q-0.16,-0.16 0,-1 Z",
      mode: "stroke",
      weight: 0.22,
      fit: 0.92,
    },
    // The day is secured — streak advanced.
    chevron: {
      d: "M-0.68,0.34 L0,-0.36 L0.68,0.34",
      mode: "stroke",
      weight: 0.28,
    },
    // System-directed only: the buddy is working, not judging the operator.
    // Negative/neutral-valence glyphs describe the buddy's own state and are
    // never fired in response to the operator missing something.
    progress: {
      d: "M-0.78,-0.32 h1.56 a0.32,0.32 0 0 1 0,0.64 h-1.56 a0.32,0.32 0 0 1 0,-0.64 z",
      mode: "stroke",
      weight: 0.2,
      dash: true,
      fit: 0.86,
    },
  };

  // ── Beat table ────────────────────────────────────────────────────────────
  // Every beat follows the same three-part contour: anticipation (contract and
  // counter-move), contact (overshoot), settle. A glyph that simply appears is
  // a sticker; a glyph that arrives is a performance. Only the glyph and the
  // amplitude change between beats — the shape of the timing does not.
  //
  // `at` is ms from beat start. Channels omitted in a frame keep their value
  // from the previous frame, so frames are diffs, not full states.
  var BEATS = {
    // Every completed objective. Small on purpose — this fires often.
    taskComplete: {
      priority: 2,
      duration: 980,
      allowInFlow: true,
      frames: [
        { at: 0,   lid: 0.5, gaze: { x: 0, y: 1 }, tilt: -1.5, body: { y: 1, scale: 0.97 } },
        { at: 95,  glyph: "check", lid: 1, tilt: 2, body: { y: -2.5, scale: 1.14 } },
        { at: 270, tilt: 1, body: { y: 0, scale: 1 } },
        { at: 740, lid: 0.12 },
        { at: 830, glyph: null, lid: 1, tilt: 0 },
      ],
    },

    // Level up. Same contour, larger amplitude and a longer hold — the
    // escalation is in the numbers, not in a different set of moves.
    levelUp: {
      priority: 4,
      duration: 1200,
      allowInFlow: false,
      frames: [
        { at: 0,   lid: 0.35, gaze: { x: 0, y: 2 }, tilt: -3, body: { y: 2.5, scale: 0.94 } },
        { at: 120, glyph: "star", lid: 1, gaze: { x: 0, y: 0 }, tilt: 3.5, body: { y: -4, scale: 1.2 } },
        { at: 330, tilt: 1.5, body: { y: -1, scale: 1.03 } },
        { at: 520, tilt: 0.5, body: { y: 0, scale: 1 } },
        { at: 980, lid: 0.12 },
        { at: 1070, glyph: null, lid: 1, tilt: 0 },
      ],
    },

    // First completion of the day that puts the streak beyond doubt. Rare by
    // construction — at most once per day — so it can afford to be quiet.
    streakSecured: {
      priority: 3,
      duration: 900,
      allowInFlow: false,
      frames: [
        { at: 0,   lid: 0.5, tilt: -2, body: { y: 1.5 } },
        { at: 90,  glyph: "chevron", lid: 1, tilt: 1.5, body: { y: -2, scale: 1.1 } },
        { at: 260, tilt: 0.5, body: { y: 0, scale: 1 } },
        { at: 680, lid: 0.12 },
        { at: 770, glyph: null, lid: 1, tilt: 0 },
      ],
    },

    // System-directed: the buddy is thinking. Held open-ended by the caller
    // via hold()/release() rather than a fixed duration.
    thinking: {
      priority: 1,
      duration: 0, // held
      allowInFlow: true,
      frames: [
        { at: 0,  lid: 0.6, tilt: -1 },
        { at: 90, glyph: "progress", lid: 1 },
      ],
      exitFrames: [
        { at: 0,   lid: 0.12 },
        { at: 90,  glyph: null, lid: 1, tilt: 0 },
      ],
      exitDuration: 200,
    },
  };

  var NEUTRAL = {
    glyphL: null, glyphR: null,
    gaze: null, lid: 1, mouth: null,
    tilt: 0, bodyX: 0, bodyY: 0, scale: 1,
  };

  // ── Runtime ───────────────────────────────────────────────────────────────
  var driver   = null;   // { setChannels, getMood } registered by CuteRobotFace
  var current  = null;   // { name, def, timers[], endTimer }
  var pending  = null;   // at most one — a backlog deeper than this is noise
  var recent   = [];     // beat start timestamps, for the rolling ceiling

  var GAP_MS       = 420;  // breathing room between one beat ending and the next
  var CEILING_N    = 6;    // at most N beats...
  var CEILING_MS   = 60000; // ...per this window

  function reduceMotion() {
    return !!(window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function push(channels) {
    if (driver && typeof driver.setChannels === "function") driver.setChannels(channels);
  }

  // Frames are diffs; fold them into a full channel state as each fires.
  function applyFrame(state, frame) {
    var next = Object.assign({}, state);
    if ("glyph"  in frame) { next.glyphL = frame.glyph; next.glyphR = frame.glyph; }
    if ("glyphL" in frame) next.glyphL = frame.glyphL;
    if ("glyphR" in frame) next.glyphR = frame.glyphR;
    if ("gaze"   in frame) next.gaze   = frame.gaze;
    if ("lid"    in frame) next.lid    = frame.lid;
    if ("mouth"  in frame) next.mouth  = frame.mouth;
    if ("tilt"   in frame) next.tilt   = frame.tilt;
    if ("body"   in frame) {
      if ("x"     in frame.body) next.bodyX = frame.body.x;
      if ("y"     in frame.body) next.bodyY = frame.body.y;
      if ("scale" in frame.body) next.scale = frame.body.scale;
    }
    return next;
  }

  // Reduced motion keeps the *information* (which glyph, for how long) and
  // drops the *movement* — no lunge, no squash, no tilt, no lid flutter.
  function staticize(frames) {
    return frames
      .filter(function (f) { return "glyph" in f || "glyphL" in f || "glyphR" in f; })
      .map(function (f) {
        var g = Object.assign({}, f);
        delete g.tilt; delete g.body; delete g.gaze;
        g.lid = 1;
        return g;
      });
  }

  function clearTimers(beat) {
    if (!beat) return;
    beat.timers.forEach(clearTimeout);
    beat.timers = [];
    if (beat.endTimer) { clearTimeout(beat.endTimer); beat.endTimer = null; }
  }

  function schedule(def, frames, onDone, totalMs) {
    var state = Object.assign({}, NEUTRAL);
    var timers = [];
    var list = reduceMotion() ? staticize(frames) : frames;

    list.forEach(function (frame) {
      timers.push(setTimeout(function () {
        state = applyFrame(state, frame);
        push(state);
      }, reduceMotion() ? 0 : frame.at));
    });

    var endTimer = null;
    if (totalMs > 0) {
      endTimer = setTimeout(onDone, reduceMotion() ? Math.min(totalMs, 700) : totalMs);
    }
    return { timers: timers, endTimer: endTimer };
  }

  function finish() {
    clearTimers(current);
    current = null;
    push(Object.assign({}, NEUTRAL));
    if (pending) {
      var next = pending;
      pending = null;
      setTimeout(function () {
        // Re-check flow: next sat queued behind whatever was just playing, and
        // the mood can shift (e.g. into flow) during that wait. The ceiling
        // isn't worth re-checking here — it barely moves in a ~1-2s gap — but
        // flow suppression is a hard guarantee, not a soft cap, so it gets
        // re-validated at the moment the beat would actually start.
        var mood = driver && typeof driver.getMood === "function" ? driver.getMood() : null;
        if (mood === "flow" && !next.def.allowInFlow) return;
        start(next.name, next.def);
      }, GAP_MS);
    }
  }

  function start(name, def) {
    var handles = schedule(def, def.frames, finish, def.duration);
    current = {
      name: name,
      def: def,
      timers: handles.timers,
      endTimer: handles.endTimer,
    };
    recent.push(Date.now());
  }

  function underCeiling() {
    var cutoff = Date.now() - CEILING_MS;
    recent = recent.filter(function (t) { return t > cutoff; });
    return recent.length < CEILING_N;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  // play(name) — request a beat. Returns true if it will be performed.
  //
  // Dropping is a feature, not a failure: a buddy that reacts to everything
  // reacts to nothing, and this thing lives in peripheral vision beside a task
  // list, where every movement is an attention tax paid whether or not the
  // operator wanted to look.
  function play(name) {
    var def = BEATS[name];
    if (!def || !driver) return false;

    // Deep focus is the state the whole app exists to produce. Protect it.
    var mood = typeof driver.getMood === "function" ? driver.getMood() : null;
    if (mood === "flow" && !def.allowInFlow) return false;

    if (!underCeiling()) return false;

    if (current) {
      if (def.priority > current.def.priority) {
        clearTimers(current);
        current = null;
        start(name, def);
        return true;
      }
      // Equal or lower priority waits; a second waiter replaces the first,
      // because the freshest reaction is the only one still worth showing.
      pending = { name: name, def: def };
      return true;
    }

    start(name, def);
    return true;
  }

  // hold(name) / release(name) — for open-ended states like "thinking", where
  // the end time is known only to the caller.
  function hold(name) {
    var def = BEATS[name];
    if (!def || !driver) return false;
    if (current && current.name === name) return true;
    if (current) clearTimers(current);
    start(name, def);
    return true;
  }

  function release(name) {
    if (!current || current.name !== name) return false;
    var def = current.def;
    clearTimers(current);
    var handles = schedule(def, def.exitFrames || [{ at: 0, glyph: null, lid: 1, tilt: 0 }],
                           finish, def.exitDuration || 200);
    current = { name: name, def: def, timers: handles.timers, endTimer: handles.endTimer };
    return true;
  }

  function attach(d) {
    driver = d;
    push(Object.assign({}, NEUTRAL));
  }

  function detach() {
    clearTimers(current);
    current = null;
    pending = null;
    driver = null;
  }

  window.BuddyBeats = {
    play: play,
    hold: hold,
    release: release,
    attach: attach,
    detach: detach,
    GLYPHS: GLYPHS,
    NEUTRAL: NEUTRAL,
  };
})();
