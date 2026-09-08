// ── Focus Mode — one objective, no board ──────────────────────────────────
// The single-task counterpart to the list board. The board is a ranked list;
// a ranked list of twelve objectives is still twelve decisions, and choosing
// is the expensive part for this operator. Focus mode removes the choice
// entirely: rank the board, show position one, hide the rest.
//
// The cost of removing choice is that the surface can start to feel like a
// cell. So every screen carries a visible exit and a no-penalty skip, and the
// mode never deletes — the operator can always leave with the board intact.
//
// Skips are not free-floating: a skip increments deferCount and saves, the
// same avoidance signal Match mode collects, so passing over an objective here
// still pushes it back up the next ranking pass. See rankMissions() in
// mission.js.

const FocusMode = (function () {
  var _current = null;   // the live .mission <li> currently on screen
  var _root = null;
  var _open = false;

  function _todayKey() {
    return (typeof getTodayKey === "function")
      ? getTodayKey()
      : new Date().toISOString().split("T")[0];
  }

  // Reuse the XP selector's own difficulty ladder (xp-selector-react.js) so
  // the label the operator picked when filing the objective is the label they
  // read back here, rather than a second private scale.
  var DIFFICULTY = [
    [10, "EASY"],
    [15, "MEDIUM-EASY"],
    [20, "NORMAL"],
    [25, "HARD"],
    [30, "VERY HARD"],
  ];

  function difficultyLabel(xp) {
    for (var i = 0; i < DIFFICULTY.length; i++) {
      if (xp <= DIFFICULTY[i][0]) return DIFFICULTY[i][1];
    }
    return "SEVERE";
  }

  function missionText(li) {
    var desc = li.querySelector(".mission-desc");
    if (desc) return (desc.textContent || "").trim();
    return (li.textContent || "").split(" — ")[0].trim();
  }

  function missionCategoryLabel(li) {
    var prefix = li.querySelector("span[class^='prefix']");
    var cls = prefix ? prefix.className : "";
    if (cls.indexOf("prefix-1") !== -1) return "FINANCIAL";
    if (cls.indexOf("prefix-2") !== -1) return "ACADEMIC";
    if (cls.indexOf("prefix-3") !== -1) return "LIFE";
    return "GENERAL";
  }

  // ── Why this one ──────────────────────────────────────────────────────
  // The reason always comes from explainMissionRank() — never invented here,
  // because a fabricated justification would make the whole ordering
  // untrustworthy. The one edit: the ranker's deferral term is phrased about
  // the operator ("passed over 3×"), and read alone on an otherwise empty
  // screen that lands as an accusation. Restated as a property of the
  // objective. Same signal, same source, no reproach. See DESIGN.md 9.9.
  function reasonText(li) {
    var raw = typeof explainMissionRank === "function" ? explainMissionRank(li) : "";
    if (!raw) return "";
    return raw.split(" · ").map(function (part) {
      return /^passed over/.test(part) ? "high resistance" : part;
    }).join(" · ");
  }

  // ── Render ────────────────────────────────────────────────────────────
  function render() {
    var body = _root.querySelector(".focus-body");
    var actions = _root.querySelector(".focus-actions");
    var hint = _root.querySelector(".focus-hint");

    // Draw from today's slate first — the objectives the operator actually
    // committed to in Match mode. Only when the slate is empty (or spent)
    // does Focus fall back to the top of the ranked board, so the mode never
    // dead-ends just because no triage session has happened yet.
    _current = document.querySelector("#missionList .mission[data-matched-for='" + _todayKey() + "']")
            || document.querySelector("#missionList .mission");

    if (!_current) {
      body.innerHTML =
        '<div class="focus-empty">' +
          '<div class="focus-empty-title">Board clear.</div>' +
          '<div class="focus-empty-sub">No objective queued. File one on the board when ready.</div>' +
        "</div>";
      actions.classList.add("focus-actions-hidden");
      hint.textContent = "space  timer   ·   esc  exit";
      _root.querySelector(".focus-remaining").textContent = "";
      return;
    }

    actions.classList.remove("focus-actions-hidden");
    hint.textContent = "enter  complete   ·   →  next   ·   space  timer   ·   esc  exit";

    var remaining = document.querySelectorAll("#missionList .mission").length;
    _root.querySelector(".focus-remaining").textContent =
      remaining > 1 ? remaining - 1 + " held back" : "last on board";

    var xp = parseInt(_current.dataset.xp) || 0;
    var reason = reasonText(_current);

    body.innerHTML =
      '<div class="focus-card">' +
        '<div class="focus-card-top">' +
          '<span class="focus-cat">' + missionCategoryLabel(_current) + "</span>" +
          '<span class="focus-xp">' + xp + " XP</span>" +
        "</div>" +
        '<div class="focus-title">' + missionText(_current).replace(/</g, "&lt;") + "</div>" +
        '<div class="focus-meta">' +
          '<div class="focus-difficulty">DIFFICULTY · ' + difficultyLabel(xp) + "</div>" +
          '<div class="focus-reason">' +
            (reason
              ? "Surfaced first: " + reason
              : '<span class="focus-reason-quiet">Surfaced first: top of the ranked board.</span>') +
          "</div>" +
        "</div>" +
      "</div>";
  }

  // ── The three decisions ───────────────────────────────────────────────
  function complete() {
    if (!_current) return;
    // Completion is the board's own click handler — XP, streaks, undo toast,
    // achievements and persistence all hang off it. Reimplementing any of
    // that here would fork the reward path, so the mode drives the real
    // control instead. The handler removes the <li> synchronously, which is
    // why render() can simply re-read position one afterwards.
    var li = _current;
    _current = null;
    li.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    advance("done");
  }

  function skip() {
    if (!_current) return;
    // Not a rejection — the operator looked and said not now. Counted the same
    // way Match mode counts a deferral, so it resurfaces rather than sinks.
    _current.dataset.deferCount = String((parseInt(_current.dataset.deferCount) || 0) + 1);
    _current.dataset.lastDeferredAt = new Date().toISOString();
    if (_current.parentNode) _current.parentNode.appendChild(_current); // out of the way for this pass
    if (typeof saveMissions === "function") saveMissions();
    _current = null;
    advance("skip");
  }

  // verdict is "done" or "skip". The two decisions leave differently — see
  // .focus-card-done / .focus-card-leaving in mission.css — because a mode
  // that renders them identically teaches that they are interchangeable.
  // The entrance is the .focus-card animation itself: render() replaces the
  // node, so it re-fires per objective without being asked to.
  function advance(verdict) {
    // Re-rank before showing the next one: the skip just changed the scores,
    // and the operator should get the genuinely top-ranked objective, not the
    // one that happened to be second a moment ago.
    if (typeof rankMissions === "function") rankMissions();
    var card = _root.querySelector(".focus-card");
    if (card) {
      card.classList.add(verdict === "done" ? "focus-card-done" : "focus-card-leaving");
    }
    // Just past the 160ms exit, so the card is gone before its replacement is
    // drawn rather than being cut off mid-flight.
    setTimeout(function () {
      if (!_open) return;
      render();
    }, 170);
  }

  // ── The timer ─────────────────────────────────────────────────────────
  // Flow needs two things at once: a clear goal and continuous feedback
  // (Csikszentmihalyi, 1990). This view already supplies the goal — one
  // objective, no comparison set — but until now the feedback channel lived in
  // a corner widget, so reading it cost an attention switch away from the
  // objective. Docking the ring under the objective puts both conditions on one
  // surface.
  //
  // The widget is not reimplemented here. Its mount node is moved into this
  // view and moved back on close, so the timer keeps its own state, its own
  // React root, and — critically — its own payout path: banked units, the XP
  // reel and the session-complete ritual all still run in exactly one place.
  // Same reasoning as complete() driving the board's own click handler.
  var _pipHome = null;         // { parent, next } — where the mount node came from
  var _pipWasMinimised = false;

  function dockTimer() {
    var mount = document.getElementById("pomodoro-mount");
    var slot = _root.querySelector(".focus-timer");
    // An operator who has turned the timer off in settings has made a choice;
    // focus mode does not overrule it by conjuring the widget back.
    if (!mount || !slot || !mount.firstElementChild) return;

    _pipHome = { parent: mount.parentNode, next: mount.nextSibling };

    // Open it if it was minimised, and remember that it was, so closing the
    // mode hands back the widget state the operator actually chose.
    _pipWasMinimised = !!mount.querySelector(".pomodoro-minimized");
    if (_pipWasMinimised && typeof window.togglePomodoroTimer === "function") {
      window.togglePomodoroTimer();
    }

    mount.classList.add("pip-docked");
    slot.appendChild(mount);
  }

  function undockTimer() {
    var mount = document.getElementById("pomodoro-mount");
    if (!mount || !_pipHome) return;
    mount.classList.remove("pip-docked");
    // insertBefore with a stale sibling would throw; fall back to appending.
    if (_pipHome.next && _pipHome.next.parentNode === _pipHome.parent) {
      _pipHome.parent.insertBefore(mount, _pipHome.next);
    } else {
      _pipHome.parent.appendChild(mount);
    }
    _pipHome = null;
    if (_pipWasMinimised && typeof window.togglePomodoroTimer === "function") {
      window.togglePomodoroTimer();
    }
    _pipWasMinimised = false;
  }

  // ── Mode lifecycle ────────────────────────────────────────────────────
  function open() {
    if (_open) return;
    _open = true;
    if (typeof rankMissions === "function") rankMissions();

    _root = document.createElement("div");
    _root.id = "focus-mode";
    _root.innerHTML =
      '<div class="focus-header">' +
        '<span class="focus-title-label">FOCUS</span>' +
        '<span class="focus-remaining"></span>' +
        '<button class="focus-close" type="button" aria-label="Exit focus mode">ESC</button>' +
      "</div>" +
      '<div class="focus-body"></div>' +
      // The timer sits below the objective, never above it: the objective stays
      // the only large thing on screen and the ring reads as ambient state
      // rather than as the subject. A countdown given top billing becomes a
      // monitoring task competing with the work it is supposed to support.
      '<div class="focus-timer"></div>' +
      '<div class="focus-actions">' +
        '<button class="focus-btn focus-btn-skip" type="button">Not this one</button>' +
        '<button class="focus-btn focus-btn-done" type="button">Complete</button>' +
      "</div>" +
      '<div class="focus-hint"></div>';
    // One exit, not three. The header ESC control and the Escape key are the
    // way out; a third button competed with Complete for attention in the
    // one view whose entire purpose is having nothing to choose between.
    document.body.appendChild(_root);
    requestAnimationFrame(function () { _root.classList.add("focus-mode-visible"); });

    _root.querySelector(".focus-close").addEventListener("click", close);
    _root.querySelector(".focus-btn-skip").addEventListener("click", skip);
    _root.querySelector(".focus-btn-done").addEventListener("click", complete);
    document.addEventListener("keydown", onKey);
    dockTimer();
    render();
  }

  function close() {
    if (!_open) return;
    _open = false;
    _current = null;
    // Before the root is torn down — the mount node has to survive this view.
    undockTimer();
    document.removeEventListener("keydown", onKey);
    if (typeof rankMissions === "function") rankMissions();
    if (_root) {
      _root.classList.remove("focus-mode-visible");
      var r = _root;
      setTimeout(function () { if (r.parentNode) r.remove(); }, 220);
      _root = null;
    }
  }

  function onKey(e) {
    if (!_open) return;
    // A focused button already turns Enter/Space into a click; letting the
    // shortcut through as well would fire the decision twice.
    if (e.key !== "Escape" && e.target && e.target.tagName === "BUTTON") return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Enter") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowRight" || e.key === "s" || e.key === "S") { e.preventDefault(); skip(); }
    else if (e.key === " " || e.code === "Space") {
      // Space is the transport key everywhere else on a computer, so it drives
      // the docked timer. Starting and pausing is the one thing an operator does
      // repeatedly mid-session, and it should never cost a trip to the pointer.
      var play = _root.querySelector(".pip-btn-play");
      if (play) { e.preventDefault(); play.click(); }
    }
  }

  return { open: open, close: close, isOpen: function () { return _open; } };
})();

window.FocusMode = FocusMode;

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("focusModeButton");
  if (btn) btn.addEventListener("click", function () { FocusMode.open(); });
});
