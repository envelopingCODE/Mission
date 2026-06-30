// ── Notification Queue ──────────────────────────────────────────────────────
// A single orchestrator for "narrative" messages — motivational text, buddy
// suggestions, streak/achievement beats. These are the messages that ask the
// user to actually READ something, as opposed to utility toasts (undo,
// pomodoro time-check) which are glanceable action affordances and stay
// independent of this queue.
//
// Why this exists: several call sites used to create + appendChild + show
// their own message in the same synchronous block, with no awareness of each
// other (e.g. completing a task could show a motivational message AND a
// streak-repair bubble within ~1.6s of each other, both top-center). This
// generalizes the one pattern in the codebase that already avoided that
// problem — the achievement toast's entering/showing/exiting queue — into a
// shared utility every narrative mechanism routes through.
//
// Contract: callers don't build+insert their message directly. They hand the
// queue a `show`/`hide` pair and let the queue decide *when* show() runs.
//   NotifyQueue.enqueue({
//     slot: "top-center",       // independent queues per screen region
//     priority: 1,              // higher runs first among queued items
//     duration: 3500,           // ms visible before hide() is invoked
//     show: function () { ...create+appendChild+rAF-add visible class...; return el; },
//     hide: function (el) { ...remove visible class, then remove el...; },
//     skipIfBusy: false,        // JIT: true = drop entirely rather than queue
//                               //   (for ambient/low-stakes suggestions where
//                               //   a stale, delayed message is worse than none)
//     dedupeKey: undefined,     // if set, a second enqueue with the same key
//                               //   while one is queued/showing is dropped
//   });
(function () {
  var SLOTS = {};
  var GAP_MS = 350; // breathing room between one message hiding and the next showing

  function getSlot(name) {
    if (!SLOTS[name]) SLOTS[name] = { current: null, queue: [] };
    return SLOTS[name];
  }

  function enqueue(opts) {
    var slot = getSlot(opts.slot || "top-center");
    var busy = !!slot.current || slot.queue.length > 0;

    if (opts.skipIfBusy && busy) return false;

    if (opts.dedupeKey) {
      var dupe =
        (slot.current && slot.current.dedupeKey === opts.dedupeKey) ||
        slot.queue.some(function (q) { return q.dedupeKey === opts.dedupeKey; });
      if (dupe) return false;
    }

    var item = {
      priority: opts.priority || 0,
      duration: opts.duration || 3500,
      show: opts.show,
      hide: opts.hide,
      dedupeKey: opts.dedupeKey,
    };

    if (slot.current) {
      slot.queue.push(item);
      slot.queue.sort(function (a, b) { return b.priority - a.priority; });
    } else {
      runItem(opts.slot || "top-center", item);
    }
    return true;
  }

  function runItem(slotName, item) {
    var slot = getSlot(slotName);
    slot.current = item;
    var el = typeof item.show === "function" ? item.show() : null;
    setTimeout(function () {
      advance(slotName, item, el);
    }, item.duration);
  }

  function advance(slotName, item, el) {
    if (typeof item.hide === "function") item.hide(el);
    var slot = getSlot(slotName);
    slot.current = null;
    if (slot.queue.length) {
      var next = slot.queue.shift();
      setTimeout(function () { runItem(slotName, next); }, GAP_MS);
    }
  }

  window.NotifyQueue = { enqueue: enqueue };
})();
