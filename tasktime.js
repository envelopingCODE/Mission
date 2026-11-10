// Task-time rules: one source for the page (plain <script>), the local bridge
// and the tests. ES5 only, no DOM, no fs. Format is documented in
// TASKTIME_CONTRACT.md.
(function (root) {
  var V = 1;
  var GAP_MS = 300000;
  var MAX_DAY = 86400;
  var SOURCE = "gamified-task-app";

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function localDateKey(ms) {
    var d = new Date(ms);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function isDateKey(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var y = Number(s.slice(0, 4));
    var m = Number(s.slice(5, 7));
    var d = Number(s.slice(8, 10));
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }

  function isDaySeconds(v) {
    return typeof v === "number" && v % 1 === 0 && v >= 0 && v <= MAX_DAY;
  }

  function isPlain(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function has(o, k) {
    return Object.prototype.hasOwnProperty.call(o, k);
  }

  function parseTotals(text) {
    var out = {};
    var raw;
    try { raw = JSON.parse(text); } catch (e) { return out; }
    if (!isPlain(raw)) return out;
    Object.keys(raw).forEach(function (project) {
      if (project === "__proto__" || !isPlain(raw[project])) return;
      var days = {};
      var any = false;
      Object.keys(raw[project]).forEach(function (date) {
        if (isDateKey(date) && isDaySeconds(raw[project][date])) {
          days[date] = raw[project][date];
          any = true;
        }
      });
      if (any) out[project] = days;
    });
    return out;
  }

  function copyTotals(totals) {
    var out = {};
    Object.keys(totals || {}).forEach(function (p) {
      if (p === "__proto__") return;
      var days = {};
      Object.keys(totals[p]).forEach(function (d) { days[d] = totals[p][d]; });
      out[p] = days;
    });
    return out;
  }

  function creditSpan(totals, project, fromMs, toMs) {
    var out = copyTotals(totals);
    if (!project || project === "__proto__" || !(toMs > fromMs)) return out;
    var days = has(out, project) ? out[project] : {};
    var cur = fromMs;
    while (cur < toMs) {
      var c = new Date(cur);
      var next = new Date(c.getFullYear(), c.getMonth(), c.getDate() + 1).getTime();
      var end = next > cur && next < toMs ? next : toMs;
      var secs = Math.floor(end / 1000) - Math.floor(cur / 1000);
      if (secs > 0) {
        var key = localDateKey(cur);
        var prev = has(days, key) && isDaySeconds(days[key]) ? days[key] : 0;
        days[key] = Math.min(prev + secs, MAX_DAY);
      }
      cur = end;
    }
    if (Object.keys(days).length) out[project] = days;
    return out;
  }

  function spanSeconds(fromMs, toMs) {
    return Math.max(0, Math.floor(toMs / 1000) - Math.floor(fromMs / 1000));
  }

  function isGap(lastMs, nowMs) {
    return nowMs - lastMs > GAP_MS;
  }

  function lowerDay(totals, project, date, seconds) {
    if (!totals || !has(totals, project) || !has(totals[project], date)) return totals;
    if (!isDaySeconds(seconds) || seconds >= totals[project][date]) return totals;
    var out = copyTotals(totals);
    out[project][date] = seconds;
    return out;
  }

  // A local absolute folder: a drive path (K:\...) or a POSIX path (/...).
  // Network paths (\\server\share, //host) are refused: nothing leaves the
  // machine.
  function isLocalFolder(s) {
    if (typeof s !== "string" || s.length < 1 || s.length > 260 || s.indexOf("\0") !== -1) return false;
    if (/^[\\\/]{2}/.test(s)) return false;
    return /^[A-Za-z]:[\\\/]/.test(s) || /^\//.test(s);
  }

  function validateRequest(body) {
    if (!isPlain(body)) return { status: 400, error: "invalid body" };
    var keys = Object.keys(body);
    if (keys.length !== 4 || !has(body, "v") || !has(body, "project") || !has(body, "folder") || !has(body, "days")) {
      return { status: 400, error: "invalid keys" };
    }
    if (body.v !== V) return { status: 400, error: "unsupported version" };
    if (typeof body.project !== "string" || body.project.length < 1 || body.project.length > 80) {
      return { status: 400, error: "invalid project" };
    }
    if (!isLocalFolder(body.folder)) return { status: 400, error: "invalid folder" };
    if (!isPlain(body.days)) return { status: 400, error: "invalid days" };
    var dates = Object.keys(body.days);
    for (var i = 0; i < dates.length; i++) {
      if (!isDateKey(dates[i])) return { status: 400, error: "invalid date" };
      if (!isDaySeconds(body.days[dates[i]])) return { status: 400, error: "invalid seconds" };
    }
    return { ok: true };
  }

  function readDays(map) {
    if (!isPlain(map)) return null;
    var out = Object.create(null);
    var dates = Object.keys(map);
    for (var i = 0; i < dates.length; i++) {
      if (!isDateKey(dates[i]) || !isDaySeconds(map[dates[i]])) return null;
      out[dates[i]] = map[dates[i]];
    }
    return out;
  }

  function sortedCopy(map) {
    var out = {};
    Object.keys(map).sort().forEach(function (k) { out[k] = map[k]; });
    return out;
  }

  function mergeFile(existingText, origin, project, days, today) {
    var origins = Object.create(null);
    if (existingText !== null) {
      var parsed;
      try { parsed = JSON.parse(existingText); } catch (e) { return { error: "unreadable" }; }
      if (!isPlain(parsed) || parsed.v !== V || parsed.source !== SOURCE ||
          parsed.project !== project || parsed.unit !== "seconds" || !isPlain(parsed.origins)) {
        return { error: "unreadable" };
      }
      var names = Object.keys(parsed.origins);
      for (var i = 0; i < names.length; i++) {
        var map = readDays(parsed.origins[names[i]]);
        if (!map) return { error: "unreadable" };
        origins[names[i]] = map;
      }
    }
    var mine = origins[origin] || Object.create(null);
    Object.keys(days).forEach(function (d) { mine[d] = days[d]; });
    origins[origin] = mine;

    var sortedOrigins = {};
    Object.keys(origins).sort().forEach(function (o) {
      Object.defineProperty(sortedOrigins, o, {
        value: sortedCopy(origins[o]), enumerable: true, writable: true, configurable: true
      });
    });
    return {
      text: JSON.stringify({
        v: V, source: SOURCE, project: project, unit: "seconds", written: today, origins: sortedOrigins
      })
    };
  }

  var api = {
    V: V, GAP_MS: GAP_MS, MAX_DAY: MAX_DAY,
    localDateKey: localDateKey, isDateKey: isDateKey, isDaySeconds: isDaySeconds,
    parseTotals: parseTotals, creditSpan: creditSpan, spanSeconds: spanSeconds,
    isGap: isGap, lowerDay: lowerDay, isLocalFolder: isLocalFolder,
    validateRequest: validateRequest, mergeFile: mergeFile
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TaskTime = api;
})(this);
