// ── Timeline View — the day on a time axis ────────────────────────────────
// A third view alongside the list board and Match Mode. The board answers
// "what needs doing"; the timeline answers "when does it happen".
//
// Scheduling is a hybrid on purpose. Objectives auto-flow onto the day from
// the current time using their learned Pomodoro estimates, so the view is
// useful the moment it opens with zero data entry. Dragging a block pins it
// to an explicit time, and a pin survives reload. Auto-fill is the default,
// the pin is the override.
//
// Why the schedule lives in its own localStorage key rather than on the
// mission records: pins are a property of *today's plan*, not of the
// objective. A task deferred to tomorrow should arrive unpinned rather than
// carrying a stale 09:15 from a day that already ended, so the key is
// day-scoped and the plan resets itself at rollover. It also keeps the
// shipped `missions` record shape untouched.
//
// This view never deletes and never re-implements XP. Completion is handed
// to the board's own click handler so the whole gamification lifecycle —
// XP, sound, streak, session progress, undo — fires exactly once, through
// the one path that already knows how to do it.

const TimelineView = (function () {
  // ── Geometry ───────────────────────────────────────────────────────────
  // Scale is set by the 25-minute pomodoro, this app's default task size: at
  // 112px/hour one pomodoro is ~44px, which is exactly enough for the
  // two-line block (time meta over title). Anything tighter squeezed the
  // canonical task into the compact one-line layout, making the common case
  // look like the exception.
  var HOUR_PX = 112;    // vertical pixels per hour
  var DAY_START_H = 6;  // first hour drawn
  var DAY_END_H = 24;   // last hour drawn (exclusive)
  var SNAP_MIN = 5;     // drag lands on 5-minute marks
  var COMPACT_MIN = 20; // under this, a block lays out on one line instead of two

  // Time-slot tags ([AM]/[PM]/[EVE]) are implementation intentions — the
  // operator already said *when*. The timeline honours that as a hard window
  // rather than a hint, otherwise auto-flow would quietly overwrite a
  // decision the operator made deliberately.
  var SLOT_WINDOWS = {
    AM:  [5 * 60, 12 * 60],
    PM:  [12 * 60, 17 * 60],
    EVE: [17 * 60, 23 * 60],
  };

  var _root = null;
  var _open = false;
  var _entries = [];
  var _overflow = [];
  var _gesture = null;
  var _nowTimer = null;

  // ── Persistence — day-scoped pin store ─────────────────────────────────
  function todayKey() {
    if (typeof getTodayKey === "function") return getTodayKey();
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function storeKey() { return "timelineSchedule_" + todayKey(); }

  function loadPins() {
    try { return JSON.parse(localStorage.getItem(storeKey())) || {}; }
    catch (e) { return {}; }
  }

  function savePins(pins) {
    try { localStorage.setItem(storeKey(), JSON.stringify(pins)); }
    catch (e) { /* quota or private mode — the plan degrades to auto-flow */ }
  }

  // Yesterday's plans are dead weight; drop them so the key set stays bounded
  // rather than growing one entry per day the app is ever used.
  function prunePins() {
    var keep = storeKey();
    for (var i = localStorage.length - 1; i >= 0; i--) {
      var k = localStorage.key(i);
      if (k && k.indexOf("timelineSchedule_") === 0 && k !== keep) {
        localStorage.removeItem(k);
      }
    }
  }

  // ── Reading the board ──────────────────────────────────────────────────
  function missionText(li) {
    var desc = li.querySelector(".mission-desc");
    if (desc) return (desc.textContent || "").trim();
    return (li.textContent || "").split(" — ")[0].trim();
  }

  function categoryKey(li) {
    var prefix = li.querySelector("span[class^='prefix']");
    var cls = prefix ? prefix.className : "";
    var m = cls.match(/prefix-(\d)/);
    return m ? m[1] : "general";
  }

  function categoryMeta(key) {
    var fallback = { color: "rgba(255,255,255,0.6)", emoji: "✦", shortName: "General" };
    if (typeof CATEGORY_CONFIG === "undefined") return fallback;
    return CATEGORY_CONFIG[key] || CATEGORY_CONFIG.general || fallback;
  }

  // Duration comes from the same learned estimator the board's badge shows,
  // so a block's height and its "~25m" badge can never disagree. Deliberately
  // NOT floored to a legible minimum: inflating a 12-minute estimate to make
  // its block easier to read would put a number on screen the operator never
  // agreed to and would desync this view from the board. Short blocks stay
  // short and switch to a one-line layout instead (see COMPACT_MIN).
  function durationMin(li) {
    var key = categoryKey(li);
    if (typeof PomodoroEstimator === "undefined") return 25;
    var est = PomodoroEstimator.getEstimate(key);
    return Math.max(5, Math.round(est * 25));
  }

  function slotOf(li) {
    return li.dataset.timeSlot || null;
  }

  // ── The scheduling pass ────────────────────────────────────────────────
  function nowMinutes() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  // Auto-flow rounds up — it is looking for the next free moment, and the
  // next free moment is never earlier than where the cursor already is.
  function roundUp(min, step) { return Math.ceil(min / step) * step; }

  // A drag rounds to the nearest mark instead: under the hand, always-up
  // snapping reads as the block lagging behind the finger.
  function roundNear(min, step) { return Math.round(min / step) * step; }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  // Finds the earliest free run of `dur` minutes at or after `from` that also
  // sits inside `window`, treating everything already in `placed` as solid.
  function findGap(from, dur, placed, win) {
    var lo = Math.max(from, win ? win[0] : DAY_START_H * 60);
    var hi = win ? win[1] : DAY_END_H * 60;
    var cursor = roundUp(lo, SNAP_MIN);

    // Walk forward, jumping past each collision rather than scanning minute
    // by minute — the placed list is short and already time-ordered.
    var guard = 0;
    while (cursor + dur <= hi && guard++ < 400) {
      var hit = null;
      for (var i = 0; i < placed.length; i++) {
        if (overlaps(cursor, cursor + dur, placed[i].start, placed[i].end)) {
          hit = placed[i];
          break;
        }
      }
      if (!hit) return cursor;
      cursor = roundUp(hit.end, SNAP_MIN);
    }
    return null; // does not fit inside its window today
  }

  function buildSchedule() {
    var lis = Array.from(document.querySelectorAll("#missionList .mission"));
    var pins = loadPins();
    var placed = [];
    var overflow = [];

    // Pinned objectives claim their ground first — an explicit decision
    // outranks anything the auto-flow would prefer.
    var pinned = [];
    var floating = [];
    lis.forEach(function (li) {
      var id = li.dataset.id;
      if (id && typeof pins[id] === "number") pinned.push(li);
      else floating.push(li);
    });

    pinned.forEach(function (li) {
      var dur = durationMin(li);
      var start = pins[li.dataset.id];
      placed.push({ li: li, start: start, end: start + dur, pinned: true });
    });
    placed.sort(function (a, b) { return a.start - b.start; });

    // Auto-flow the rest from now, in board order — the board is already
    // ranked, so the timeline inherits that priority for free.
    var cursor = Math.max(roundUp(nowMinutes(), SNAP_MIN), DAY_START_H * 60);
    floating.forEach(function (li) {
      var dur = durationMin(li);
      var win = SLOT_WINDOWS[slotOf(li)] || null;
      var start = findGap(win ? Math.max(cursor, win[0]) : cursor, dur, placed, win);
      if (start === null) {
        overflow.push({ li: li, dur: dur });
        return;
      }
      placed.push({ li: li, start: start, end: start + dur, pinned: false });
      placed.sort(function (a, b) { return a.start - b.start; });
      cursor = start + dur;
    });

    placed.sort(function (a, b) { return a.start - b.start; });
    _entries = placed;
    _overflow = overflow;
  }

  // ── Formatting ─────────────────────────────────────────────────────────
  function fmtTime(min) {
    var h = Math.floor(min / 60) % 24;
    var m = Math.round(min % 60);
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  function fmtDur(min) {
    if (min < 60) return min + "m";
    var h = Math.floor(min / 60), m = min % 60;
    return m ? h + "h " + m + "m" : h + "h";
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function yFor(min) { return (min - DAY_START_H * 60) / 60 * HOUR_PX; }
  function minFor(y) { return y / HOUR_PX * 60 + DAY_START_H * 60; }

  // ── Render ─────────────────────────────────────────────────────────────
  function renderRuler() {
    var out = "";
    for (var h = DAY_START_H; h < DAY_END_H; h++) {
      var y = yFor(h * 60);
      out += '<div class="tl-hourline" style="top:' + y + 'px"></div>' +
             '<div class="tl-hourlabel" style="top:' + (y - 6) + 'px">' +
               (h < 10 ? "0" : "") + h + ":00" +
             "</div>";
    }
    return out;
  }

  function blockHtml(entry, index) {
    var li = entry.li;
    var key = categoryKey(li);
    var meta = categoryMeta(key);
    var dur = entry.end - entry.start;
    var live = nowMinutes() >= entry.start && nowMinutes() < entry.end;
    var past = nowMinutes() >= entry.end;

    var remaining = live ? Math.max(1, entry.end - nowMinutes()) : 0;
    var timeLine = live
      ? fmtDur(remaining) + " remaining"
      : fmtTime(entry.start) + "–" + fmtTime(entry.end) + " · " + fmtDur(dur);

    // Height is exact time-to-pixels, never clamped up to a legible minimum:
    // a floor would make a short block overlap the one after it, since the
    // scheduler only guarantees separation in minutes. Short blocks get the
    // compact one-line layout rather than extra height.
    return '<div class="tl-block' + (live ? " tl-block-live" : "") +
             (past ? " tl-block-past" : "") + (entry.pinned ? " tl-block-pinned" : "") +
             (dur < COMPACT_MIN ? " tl-block-compact" : "") +
             '" data-idx="' + index + '" style="top:' + yFor(entry.start) +
             "px;height:" + (dur / 60 * HOUR_PX - 3) + "px;" +
             "--tl-accent:" + meta.color + '">' +
             '<span class="tl-rail"></span>' +
             '<span class="tl-icon">' + (meta.emoji || "✦") + "</span>" +
             '<div class="tl-block-body">' +
               '<div class="tl-block-meta">' + timeLine +
                 (entry.pinned ? ' <span class="tl-pin-dot" title="Pinned">◆</span>' : "") +
               "</div>" +
               '<div class="tl-block-title">' + esc(missionText(li)) + "</div>" +
             "</div>" +
             '<button class="tl-check" type="button" aria-label="Complete objective">' +
               '<span class="tl-check-ring"></span>' +
             "</button>" +
           "</div>";
  }

  function renderOverflow() {
    if (!_overflow.length) return "";
    // Stated as a capacity fact, never as a failure — the operator did not
    // do anything wrong by having more objectives than daylight.
    var rows = _overflow.map(function (o) {
      return '<div class="tl-overflow-row">' +
               '<span class="tl-overflow-dur">' + fmtDur(o.dur) + "</span>" +
               '<span class="tl-overflow-title">' + esc(missionText(o.li)) + "</span>" +
             "</div>";
    }).join("");
    return '<div class="tl-overflow">' +
             '<div class="tl-overflow-head">BEYOND TODAY · ' + _overflow.length + "</div>" +
             rows +
           "</div>";
  }

  function renderNowLine() {
    var min = nowMinutes();
    if (min < DAY_START_H * 60 || min > DAY_END_H * 60) return "";
    return '<div class="tl-now" style="top:' + yFor(min) + 'px">' +
             '<span class="tl-now-dot"></span>' +
             '<span class="tl-now-label">' + fmtTime(min) + "</span>" +
           "</div>";
  }

  function render() {
    buildSchedule();
    var track = _root.querySelector(".tl-track");
    track.style.height = (DAY_END_H - DAY_START_H) * HOUR_PX + "px";
    track.innerHTML =
      renderRuler() +
      _entries.map(blockHtml).join("") +
      renderNowLine();

    _root.querySelector(".tl-overflow-mount").innerHTML = renderOverflow();

    var booked = _entries.reduce(function (s, e) { return s + (e.end - e.start); }, 0);
    _root.querySelector(".tl-summary").textContent =
      _entries.length + " scheduled · " + fmtDur(booked) + " booked";

    // Entrance stagger — blocks settle in sequence with a soft overshoot.
    // Capped so a long board does not turn the open into a slow cascade.
    Array.from(track.querySelectorAll(".tl-block")).forEach(function (b, i) {
      b.style.animationDelay = Math.min(i * 26, 320) + "ms";
    });

    wireBlocks();
  }

  // ── Interaction ────────────────────────────────────────────────────────
  function wireBlocks() {
    var track = _root.querySelector(".tl-track");

    Array.from(track.querySelectorAll(".tl-block")).forEach(function (block) {
      var idx = parseInt(block.dataset.idx);

      block.querySelector(".tl-check").addEventListener("click", function (e) {
        e.stopPropagation();
        completeEntry(idx, block);
      });

      block.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".tl-check")) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        _gesture = {
          block: block, idx: idx, id: e.pointerId,
          y0: e.clientY, dy: 0, active: false,
          start: _entries[idx].start,
        };
        block.setPointerCapture(e.pointerId);
      });

      block.addEventListener("pointermove", function (e) {
        if (!_gesture || e.pointerId !== _gesture.id) return;
        var dy = e.clientY - _gesture.y0;
        if (!_gesture.active) {
          if (Math.abs(dy) < 6) return;
          _gesture.active = true;
          block.classList.add("tl-block-dragging");
        }
        e.preventDefault();
        _gesture.dy = dy;

        // Live time readout follows the finger, snapped — the operator sees
        // the landing time before committing to it.
        var snapped = clampStart(roundNear(_gesture.start + minFor(dy) - minFor(0), SNAP_MIN), _entries[_gesture.idx]);
        block.style.transform = "translateY(" + (yFor(snapped) - yFor(_gesture.start)) + "px)";
        var meta = block.querySelector(".tl-block-meta");
        var dur = _entries[_gesture.idx].end - _entries[_gesture.idx].start;
        meta.textContent = fmtTime(snapped) + "–" + fmtTime(snapped + dur) + " · " + fmtDur(dur);
        _gesture.snapped = snapped;
      });

      function release(e) {
        if (!_gesture || e.pointerId !== _gesture.id) return;
        var g = _gesture;
        _gesture = null;
        block.classList.remove("tl-block-dragging");
        if (!g.active) return;

        var entry = _entries[g.idx];
        var target = typeof g.snapped === "number" ? g.snapped : entry.start;
        if (target !== entry.start) {
          var pins = loadPins();
          if (entry.li.dataset.id) {
            pins[entry.li.dataset.id] = target;
            savePins(pins);
          }
          playTick();
        }
        block.style.transform = "";
        render();
      }
      block.addEventListener("pointerup", release);
      block.addEventListener("pointercancel", release);
    });
  }

  function clampStart(min, entry) {
    var dur = entry.end - entry.start;
    return Math.max(DAY_START_H * 60, Math.min(min, DAY_END_H * 60 - dur));
  }

  // Completion is delegated to the board row's own click handler. Calling it
  // rather than re-deriving XP here is deliberate: that handler owns the
  // duplicate guard, the undo record, the sound and the streak update, and a
  // second implementation would drift from it the first time either changed.
  function completeEntry(idx, block) {
    var entry = _entries[idx];
    if (!entry || !entry.li) return;
    block.classList.add("tl-block-completing");
    var li = entry.li;
    setTimeout(function () {
      if (li && li.parentNode) li.click();
      var pins = loadPins();
      if (li.dataset.id && pins[li.dataset.id] !== undefined) {
        delete pins[li.dataset.id];
        savePins(pins);
      }
      render();
    }, 260);
  }

  function playTick() {
    // Reuses the board's own gated swipe sound rather than minting a new
    // audio element — silence when soundEnabled is off comes for free.
    try {
      if (typeof AppSettings !== "undefined" && !AppSettings.get().soundEnabled) return;
      var s = document.getElementById("swipeSound");
      if (s) { s.currentTime = 0; s.volume = 0.22; s.play().catch(function () {}); }
    } catch (e) { /* audio is a nicety, never a failure path */ }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  function open() {
    if (_open) return;
    _open = true;
    prunePins();

    var d = new Date();
    var dateLabel = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

    _root = document.createElement("div");
    _root.id = "timeline-view";
    _root.innerHTML =
      '<div class="tl-header">' +
        '<div class="tl-header-left">' +
          '<div class="tl-date">' + esc(dateLabel) + "</div>" +
          '<div class="tl-summary"></div>' +
        "</div>" +
        '<button class="tl-close" type="button" aria-label="Close timeline">ESC</button>' +
      "</div>" +
      '<div class="tl-scroll">' +
        '<div class="tl-track"></div>' +
        '<div class="tl-overflow-mount"></div>' +
      "</div>";
    document.body.appendChild(_root);
    requestAnimationFrame(function () { _root.classList.add("tl-visible"); });

    _root.querySelector(".tl-close").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    render();
    scrollToNow();

    // The now-line is the only live element here; a minute cadence is enough
    // and keeps the view idle-cheap while it sits open.
    _nowTimer = setInterval(render, 60000);
  }

  function scrollToNow() {
    var scroller = _root.querySelector(".tl-scroll");
    var y = yFor(nowMinutes()) - scroller.clientHeight * 0.32;
    scroller.scrollTop = Math.max(0, y);
  }

  function close() {
    if (!_open) return;
    _open = false;
    document.removeEventListener("keydown", onKey);
    if (_nowTimer) { clearInterval(_nowTimer); _nowTimer = null; }
    if (_root) {
      _root.classList.remove("tl-visible");
      var r = _root;
      setTimeout(function () { if (r.parentNode) r.remove(); }, 260);
      _root = null;
    }
  }

  function toggle() { _open ? close() : open(); }

  function onKey(e) {
    if (!_open) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
  }

  // ── Launcher ───────────────────────────────────────────────────────────
  // Wires the header's own #timelineViewButton (sibling to #matchModeButton /
  // #focusModeButton — see index.html) rather than self-mounting a floating
  // button. A floating corner button collided with the Pomodoro PIP's
  // minimized badge, which sits in the same corner at a higher z-index and
  // would have hidden it entirely; grouping with the other view launchers
  // also reads as one system instead of three unrelated entry points.
  function wireLauncher() {
    var btn = document.getElementById("timelineViewButton");
    if (!btn || btn.dataset.tlWired) return;
    btn.dataset.tlWired = "true";
    btn.addEventListener("click", toggle);
  }

  // Wire now *and* on DOMContentLoaded rather than branching on readyState.
  // Branching loses the listener entirely whenever the observed state and the
  // event disagree — the script sits at the end of <body>, so readyState is
  // still "loading" while the button already exists in the DOM, and a
  // listener registered a tick after the event has fired never runs.
  // wireLauncher is idempotent (dataset guard), so running it twice costs
  // nothing and running it early costs nothing either.
  wireLauncher();
  document.addEventListener("DOMContentLoaded", wireLauncher);

  return {
    open: open,
    close: close,
    toggle: toggle,
    isOpen: function () { return _open; },
  };
})();

window.TimelineView = TimelineView;
