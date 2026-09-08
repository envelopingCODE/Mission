// ── Match Mode — swipe-to-triage card deck ────────────────────────────────
// A third view alongside the list board. One objective at a time, as a card:
// swipe right to MATCH (commit — the objective jumps to the top of the board),
// swipe left to LATER (defer — the objective drops down the board *now*, but
// the deferral is counted and pushes it back up on the next ranking pass).
//
// Why deferral raises priority rather than burying it: the operator gets
// immediate relief from a task they aren't ready for, without the guilt of
// deleting it — and the system quietly records that avoidance. Repeated
// deferral is the strongest avoidance signal the app can collect, stronger
// than passive dwell, because the operator actively looked at the objective
// and chose not to take it. See rankMissions() in mission.js.
//
// This mode never deletes. Deletion stays on the board's own affordances.

const MatchMode = (function () {
  var SWIPE_COMMIT_PX = 96;
  var _deck = [];        // live .mission <li> elements, in triage order
  var _index = 0;
  var _gesture = null;
  var _root = null;
  var _open = false;
  var _cards = null;     // <li> → its live card element, so a card survives a re-render

  // ── Auto-tagging — surface topic tags on the card ──────────────────────
  // Keyword → tag. First match per tag wins; a card can carry several.
  // Deliberately finer-grained than the 1./2./3. category prefixes: the
  // prefix says which life-domain goal it serves, a tag says what it *is*.
  var TAG_RULES = [
    ["fitness",  ["trx", "gym", "run", "workout", "lift", "yoga", "swim", "walk", "stretch", "cardio", "training"]],
    ["health",   ["doctor", "dentist", "medic", "therapy", "sleep", "meal", "vitamin", "appointment", "prescription"]],
    ["finance",  ["bank", "invoice", "tax", "budget", "bill", "payment", "salary", "invest", "insurance", "rent", "loan"]],
    ["study",    ["study", "read", "course", "lecture", "exam", "paper", "thesis", "revise", "research", "learn"]],
    ["code",     ["code", "bug", "deploy", "refactor", "commit", "repo", "api", "test", "build", "ship", "debug"]],
    ["admin",    ["email", "form", "renew", "book", "call", "schedule", "submit", "register", "paperwork", "reply"]],
    ["home",     ["clean", "laundry", "dishes", "tidy", "grocer", "shop", "cook", "repair", "trash", "organize"]],
    ["creative", ["write", "design", "draw", "sketch", "edit", "record", "compose", "film", "photo"]],
    ["social",   ["meet", "friend", "family", "birthday", "visit", "message", "coffee", "dinner"]],
  ];

  function deriveTags(text) {
    var lower = (text || "").toLowerCase();
    var tags = [];
    TAG_RULES.forEach(function (rule) {
      var tag = rule[0], words = rule[1];
      for (var i = 0; i < words.length; i++) {
        if (lower.indexOf(words[i]) !== -1) { tags.push(tag); return; }
      }
    });
    return tags.slice(0, 3);
  }

  function missionText(li) {
    var desc = li.querySelector(".mission-desc");
    var prefix = li.querySelector("span[class^='prefix']");
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

  // ── Card construction ──────────────────────────────────────────────────
  function buildCard(li, depth) {
    var card = document.createElement("div");
    card.className = "match-card match-card-depth-" + depth;

    var text = missionText(li);
    var xp = parseInt(li.dataset.xp) || 0;
    var defers = parseInt(li.dataset.deferCount) || 0;
    var dwell = parseInt(li.dataset.dwell) || 0;
    var tags = deriveTags(text);

    var tagHtml = tags.map(function (t) {
      return '<span class="match-tag match-tag-' + t + '">#' + t + '</span>';
    }).join("");

    // Deferral is stated plainly, never as a reproach — it names the
    // objective's resistance, not the operator's failure. See DESIGN.md 9.9.
    var historyHtml = "";
    if (defers > 0) {
      historyHtml = '<div class="match-history">High-resistance · passed over ' +
        defers + (defers === 1 ? " time" : " times") + "</div>";
    } else if (dwell > 2) {
      historyHtml = '<div class="match-history">On the board ' + dwell + " days</div>";
    }

    card.innerHTML =
      '<div class="match-card-inner">' +
        '<div class="match-stamp match-stamp-yes">MATCH</div>' +
        '<div class="match-stamp match-stamp-no">LATER</div>' +
        '<div class="match-card-top">' +
          '<span class="match-cat">' + missionCategoryLabel(li) + "</span>" +
          '<span class="match-xp">' + xp + " XP</span>" +
        "</div>" +
        '<div class="match-card-body">' +
          '<div class="match-title">' + text.replace(/</g, "&lt;") + "</div>" +
          (tagHtml ? '<div class="match-tags">' + tagHtml + "</div>" : "") +
        "</div>" +
        historyHtml +
      "</div>";
    return card;
  }

  // Depth is the card's whole position in the stack, so moving up the deck is
  // a class swap and nothing more. Rebuilding the stack instead — which is what
  // clearing the container would do — makes the promotion a hard cut, and the
  // deck stops reading as a physical stack.
  function setDepth(card, depth) {
    card.classList.remove("match-card-depth-0", "match-card-depth-1",
                          "match-card-depth-2", "match-card-depth-3");
    card.classList.add("match-card-depth-" + depth);
  }

  function renderDeck() {
    var stack = _root.querySelector(".match-stack");
    var visible = _deck.slice(_index, _index + 3);

    // Retire cards that have left the visible window. A card in mid-flight is
    // no longer in _cards and owns its own removal — see commit().
    _cards.forEach(function (card, li) {
      if (visible.indexOf(li) === -1) {
        _cards.delete(li);
        card.remove();
      }
    });

    var empty = stack.querySelector(".match-empty");
    if (!visible.length) {
      if (!empty) {
        empty = document.createElement("div");
        empty.className = "match-empty";
        empty.innerHTML =
          '<div class="match-empty-title">Deck clear.</div>' +
          '<div class="match-empty-sub">Board re-ranked. Deferred objectives moved up.</div>';
        stack.appendChild(empty);
      }
      _root.querySelector(".match-actions").classList.add("match-actions-hidden");
      _root.querySelector(".match-progress").textContent = "";
      return;
    }
    if (empty) empty.remove();

    _root.querySelector(".match-actions").classList.remove("match-actions-hidden");
    _root.querySelector(".match-progress").textContent =
      (_index + 1) + " / " + _deck.length;

    visible.forEach(function (li, depth) {
      var card = _cards.get(li);
      if (card) {
        card.dataset.depth = depth;
        setDepth(card, depth);
        return;
      }

      // A card new to the window is born at depth 3 — behind the deck and
      // invisible — and only then promoted, so it rises into the stack instead
      // of appearing inside it. Two frames, because the browser has to have
      // laid the card out at depth 3 before the class change can read as a
      // transition rather than a jump. The callback re-reads dataset.depth
      // rather than closing over it, so a commit landing inside those two
      // frames still promotes the card to where it now belongs.
      card = buildCard(li, 3);
      _cards.set(li, card);
      card.dataset.depth = depth;
      stack.insertBefore(card, stack.firstChild);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (_cards && _cards.get(li) === card) setDepth(card, card.dataset.depth);
        });
      });
    });

    var top = _cards.get(visible[0]);
    if (top) attachCardGesture(top);
  }

  // ── Gesture — live follow with rotation, iOS-style ─────────────────────
  function attachCardGesture(card) {
    if (card.dataset.gestured) return;   // a promoted card keeps the handlers it was given
    card.dataset.gestured = "1";

    card.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (!card.classList.contains("match-card-depth-0")) return;
      _gesture = { card: card, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, active: false };
      card.setPointerCapture(e.pointerId);
    });

    card.addEventListener("pointermove", function (e) {
      if (!_gesture || e.pointerId !== _gesture.id) return;
      var dx = e.clientX - _gesture.x0;
      var dy = e.clientY - _gesture.y0;
      if (!_gesture.active) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        _gesture.active = true;
        card.style.transition = "none";
        card.classList.add("match-card-dragging");
        _root.querySelector(".match-stack").classList.add("match-stack-dragging");
      }
      e.preventDefault();
      _gesture.dx = dx;
      var rot = dx / 18;
      card.style.transform = "translate(" + dx + "px," + dy * 0.25 + "px) rotate(" + rot + "deg)";
      // One disclosed number carries everything downstream of the drag: how far
      // the stamp has bloomed and how far the card behind has already risen, so
      // the whole deck answers the hand rather than only the card under it.
      // Same house pattern as the payout intensity ramp (DESIGN_LANGUAGE §5).
      var p = Math.min(1, Math.abs(dx) / SWIPE_COMMIT_PX);
      _root.querySelector(".match-stack").style.setProperty("--mm-p", p.toFixed(3));
      card.querySelector(".match-stamp-yes").style.opacity = dx > 0 ? p : 0;
      card.querySelector(".match-stamp-no").style.opacity = dx < 0 ? p : 0;
    });

    function release(e) {
      if (!_gesture || e.pointerId !== _gesture.id) return;
      var dx = _gesture.dx;
      var wasActive = _gesture.active;
      _gesture = null;
      if (!wasActive) return;
      var stack = _root.querySelector(".match-stack");
      card.classList.remove("match-card-dragging");
      stack.classList.remove("match-stack-dragging");
      card.style.transition = "";   // hand the settle back to the stylesheet
      if (dx >= SWIPE_COMMIT_PX) commit(card, "match");
      else if (dx <= -SWIPE_COMMIT_PX) commit(card, "defer");
      else {
        // Short of the threshold: the card falls back to the deck and the
        // cards behind sink with it, all off the one property.
        stack.style.setProperty("--mm-p", "0");
        card.style.transform = "";
        card.querySelector(".match-stamp-yes").style.opacity = 0;
        card.querySelector(".match-stamp-no").style.opacity = 0;
      }
    }
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
  }

  // ── Commit — the two decisions ─────────────────────────────────────────
  function commit(card, verdict) {
    var li = _deck[_index];
    var stack = _root.querySelector(".match-stack");

    // The card leaves the deck's bookkeeping first: from here it owns the rest
    // of its own life, flies out on its own transition and removes itself.
    // Nothing else in the mode waits on it.
    _cards.delete(li);
    card.classList.add("match-card-gone");
    card.style.setProperty("--mm-p", "1");   // hold the stamp at full while it flies
    card.querySelector(".match-stamp-yes").style.opacity = verdict === "match" ? "1" : "0";
    card.querySelector(".match-stamp-no").style.opacity = verdict === "match" ? "0" : "1";
    card.style.transform = verdict === "match"
      ? "translate(140%, -40px) rotate(18deg)"
      : "translate(-140%, -40px) rotate(-18deg)";
    card.style.opacity = "0";

    // transitionend bubbles, and the stamp above is transitioning too — without
    // the target check the stamp's 0.2s fade would retire the card halfway
    // through its flight. The timer is the backstop: if the flight is cut short
    // (reduced motion, a hidden tab) the node still goes.
    var retireTimer;
    function retire(e) {
      if (e && e.target !== card) return;
      card.removeEventListener("transitionend", retire);
      clearTimeout(retireTimer);
      if (card.parentNode) card.remove();
    }
    card.addEventListener("transitionend", retire);
    retireTimer = setTimeout(retire, 700);

    // The deck's own drag state resets now, so the card rising into the top
    // slot lands where the drag had already carried it — no second jump.
    stack.classList.remove("match-stack-dragging");
    stack.style.setProperty("--mm-p", "0");

    if (li && li.parentNode) {
      if (verdict === "match") {
        // A match is a commitment, not just a re-order: the objective joins
        // today's slate, which is the set Focus mode executes from. Stamped
        // with the day so yesterday's slate expires on its own rather than
        // silently carrying forward as an obligation the operator never made.
        li.dataset.matchedFor = (typeof getTodayKey === "function")
          ? getTodayKey()
          : new Date().toISOString().split("T")[0];
        if (typeof promoteMissionToTop === "function") promoteMissionToTop(li);
      } else {
        // Deferred — count it, and move it out of the way for now. The count
        // is what pulls it back up the board on the next ranking pass.
        li.dataset.deferCount = String((parseInt(li.dataset.deferCount) || 0) + 1);
        li.dataset.lastDeferredAt = new Date().toISOString();
        if (li.parentNode) li.parentNode.appendChild(li); // drop to the bottom for this session
      }
      if (typeof saveMissions === "function") saveMissions();
    }

    _index++;
    // Promote now, not after the flight. The card behind rises while the
    // committed one is still leaving; overlapping the two motions is what makes
    // the deck read as a stack rather than a slideshow.
    renderDeck();
    if (_index >= _deck.length && typeof rankMissions === "function") rankMissions();
  }

  function actionButton(verdict) {
    var top = _cards.get(_deck[_index]);
    if (!top) return;
    commit(top, verdict);
  }

  // ── Mode lifecycle ─────────────────────────────────────────────────────
  function open() {
    if (_open) return;
    _open = true;
    _deck = Array.from(document.querySelectorAll("#missionList .mission"));
    _index = 0;
    _cards = new Map();

    _root = document.createElement("div");
    _root.id = "match-mode";
    _root.innerHTML =
      '<div class="match-header">' +
        '<span class="match-title-label">MATCH</span>' +
        '<span class="match-progress"></span>' +
        '<button class="match-close" type="button" aria-label="Close match mode">ESC</button>' +
      "</div>" +
      '<div class="match-stack"></div>' +
      '<div class="match-actions">' +
        '<button class="match-btn match-btn-no" type="button" aria-label="Later">✕</button>' +
        '<span class="match-hint">swipe · or ← →</span>' +
        '<button class="match-btn match-btn-yes" type="button" aria-label="Match">✓</button>' +
      "</div>";
    document.body.appendChild(_root);
    requestAnimationFrame(function () { _root.classList.add("match-mode-visible"); });

    _root.querySelector(".match-close").addEventListener("click", close);
    _root.querySelector(".match-btn-no").addEventListener("click", function () { actionButton("defer"); });
    _root.querySelector(".match-btn-yes").addEventListener("click", function () { actionButton("match"); });
    document.addEventListener("keydown", onKey);
    renderDeck();
  }

  function close() {
    if (!_open) return;
    _open = false;
    _gesture = null;
    _cards = null;
    document.removeEventListener("keydown", onKey);
    if (typeof rankMissions === "function") rankMissions();
    if (_root) {
      _root.classList.remove("match-mode-visible");
      var r = _root;
      setTimeout(function () { if (r.parentNode) r.remove(); }, 220);
      _root = null;
    }
  }

  function onKey(e) {
    if (!_open) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); actionButton("match"); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); actionButton("defer"); }
  }

  return { open: open, close: close, deriveTags: deriveTags, isOpen: function () { return _open; } };
})();

window.MatchMode = MatchMode;

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("matchModeButton");
  if (btn) btn.addEventListener("click", function () { MatchMode.open(); });
});
