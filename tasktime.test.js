const test = require("node:test");
const assert = require("node:assert");
const TT = require("./tasktime.js");

const at = (y, m, d, h, mi, s) => new Date(y, m - 1, d, h || 0, mi || 0, s || 0).getTime();
const file = (project, origins) =>
  JSON.stringify({ v: 1, source: "gamified-task-app", project, unit: "seconds", written: "2026-01-01", origins });

test("purge then send: existing origin days are kept", () => {
  const existing = file("P", { X: { "2026-01-01": 100, "2026-01-02": 200 } });
  const r = TT.mergeFile(existing, "X", "P", { "2026-01-03": 50 }, "2026-01-03");
  assert.deepStrictEqual(JSON.parse(r.text).origins.X, {
    "2026-01-01": 100, "2026-01-02": 200, "2026-01-03": 50,
  });
});

test("two origins on the same day are kept separately", () => {
  const existing = file("P", { A: { "2026-01-01": 100 } });
  const r = TT.mergeFile(existing, "B", "P", { "2026-01-01": 70 }, "2026-01-01");
  const o = JSON.parse(r.text).origins;
  assert.strictEqual(o.A["2026-01-01"], 100);
  assert.strictEqual(o.B["2026-01-01"], 70);
});

test("downward correction lowers, never raises", () => {
  const totals = { P: { "2026-01-01": 5000 } };
  const lowered = TT.lowerDay(totals, "P", "2026-01-01", 3000);
  assert.strictEqual(lowered.P["2026-01-01"], 3000);
  assert.strictEqual(totals.P["2026-01-01"], 5000);
  const existing = file("P", { X: { "2026-01-01": 5000 } });
  const r = TT.mergeFile(existing, "X", "P", lowered.P, "2026-01-01");
  assert.strictEqual(JSON.parse(r.text).origins.X["2026-01-01"], 3000);
  assert.strictEqual(TT.lowerDay(totals, "P", "2026-01-01", 6000), totals);
  assert.strictEqual(TT.lowerDay(totals, "P", "2026-01-01", 5000), totals);
  assert.strictEqual(TT.lowerDay(totals, "P", "2026-01-09", 10), totals);
  assert.strictEqual(TT.lowerDay(totals, "Q", "2026-01-01", 10), totals);
  assert.strictEqual(TT.lowerDay(totals, "P", "2026-01-01", 1.5), totals);
});

test("session across midnight splits 1800 / 1800", () => {
  let totals = {};
  const start = at(2026, 3, 10, 23, 30, 0);
  const end = at(2026, 3, 11, 0, 30, 0);
  for (let t = start; t < end; t += 1000) totals = TT.creditSpan(totals, "P", t, t + 1000);
  assert.strictEqual(totals.P["2026-03-10"], 1800);
  assert.strictEqual(totals.P["2026-03-11"], 1800);
});

test("2-hour sleep gap is flagged; accepting it credits 7200 split correctly", () => {
  let totals = {};
  const t0 = at(2026, 3, 10, 22, 0, 0);
  let last = t0;
  for (let i = 1; i <= 60; i++) {
    const now = t0 + i * 1000;
    assert.strictEqual(TT.isGap(last, now), false);
    totals = TT.creditSpan(totals, "P", last, now);
    last = now;
  }
  const wake = last + 2 * 3600 * 1000;
  assert.strictEqual(TT.isGap(last, wake), true);
  assert.strictEqual(totals.P["2026-03-10"], 60);
  totals = TT.creditSpan(totals, "P", last, wake);
  const total = (totals.P["2026-03-10"] || 0) + (totals.P["2026-03-11"] || 0);
  assert.strictEqual(total, 60 + 7200);
  const wakeKey = TT.localDateKey(wake);
  assert.strictEqual(totals.P[wakeKey] > 0, true);
});

test("sub-5-minute throttle gaps lose no seconds", () => {
  let totals = {};
  let sw = 0;
  const start = at(2026, 3, 10, 10, 0, 0) + 123;
  let last = start;
  const step = (now) => {
    assert.strictEqual(TT.isGap(last, now), false);
    totals = TT.creditSpan(totals, "P", last, now);
    sw += TT.spanSeconds(last, now);
    last = now;
  };
  for (let i = 1; i <= 100; i++) step(start + i * 1500);
  step(last + 299000);
  const wall = Math.floor(last / 1000) - Math.floor(start / 1000);
  assert.strictEqual(totals.P["2026-03-10"], wall);
  assert.strictEqual(sw, wall);
});

test("invalid payloads are rejected", () => {
  const F = "K:\\Projects\\P";
  const ok = { v: 1, project: "P", folder: F, days: { "2026-01-01": 60 } };
  assert.deepStrictEqual(TT.validateRequest(ok), { ok: true });
  assert.deepStrictEqual(TT.validateRequest(Object.assign({}, ok, { folder: "/home/me/p" })), { ok: true });
  const bad = (body) => {
    const r = TT.validateRequest(body);
    assert.strictEqual(r.ok, undefined);
    assert.strictEqual(r.status, 400);
  };
  bad({ v: 2, project: "P", folder: F, days: {} });
  bad({ v: 1, project: "", folder: F, days: {} });
  bad({ v: 1, project: "x".repeat(81), folder: F, days: {} });
  bad({ v: 1, project: "P", days: {} });
  bad({ v: 1, project: "P", folder: F, days: {}, extra: 1 });
  bad({ v: 1, project: "P", folder: F, days: [] });
  bad({ v: 1, project: "P", folder: F, days: { "2026-13-01": 5 } });
  bad({ v: 1, project: "P", folder: F, days: { "2026-02-30": 5 } });
  bad({ v: 1, project: "P", folder: F, days: { "2026-01-01": 86401 } });
  bad({ v: 1, project: "P", folder: F, days: { "2026-01-01": -1 } });
  bad({ v: 1, project: "P", folder: F, days: { "2026-01-01": 1.5 } });
  bad({ v: 1, project: "P", folder: F, days: { "2026-01-01": "60" } });
  bad({ v: 1, folder: F, days: {} });
  bad([]);
  bad(null);
});

test("only local absolute folders are accepted", () => {
  ["K:\\Projects\\P", "c:/x", "/home/me"].forEach((f) => assert.ok(TT.isLocalFolder(f), f));
  ["\\\\server\\share", "//host/share", "\\\\?\\C:\\x", "relative\\p", "K:", "", "C:\\a\0b", 5, null]
    .forEach((f) => assert.ok(!TT.isLocalFolder(f), String(f)));
});

test("unreadable existing file is never overwritten", () => {
  const good = { "2026-01-01": 5 };
  const cases = [
    "{not json",
    "",
    JSON.stringify({ v: 2, source: "gamified-task-app", project: "P", unit: "seconds", origins: {} }),
    file("Other", { X: good }),
    file("P", { X: { "2026-01-01": -5 } }),
    file("P", { X: { "2026-02-30": 5 } }),
    file("P", { X: [1] }),
  ];
  cases.forEach((text) => {
    const r = TT.mergeFile(text, "X", "P", good, "2026-01-02");
    assert.deepStrictEqual(r, { error: "unreadable" });
  });
});

test("fresh file has sorted keys and today's date", () => {
  const r = TT.mergeFile(null, "B", "P", { "2026-01-02": 2, "2026-01-01": 1 }, "2026-01-05");
  assert.strictEqual(
    r.text,
    '{"v":1,"source":"gamified-task-app","project":"P","unit":"seconds","written":"2026-01-05",' +
      '"origins":{"B":{"2026-01-01":1,"2026-01-02":2}}}'
  );
});

test("parseTotals drops garbage and survives crafted keys", () => {
  assert.deepStrictEqual(TT.parseTotals(undefined), {});
  assert.deepStrictEqual(TT.parseTotals("{nope"), {});
  assert.deepStrictEqual(TT.parseTotals("[1]"), {});
  const t = TT.parseTotals(
    '{"P":{"2026-01-01":60,"2026-02-30":5,"2026-01-02":-1,"x":3},"Q":"s","__proto__":{"2026-01-01":9}}'
  );
  assert.deepStrictEqual(t, { P: { "2026-01-01": 60 } });
  assert.strictEqual({}.polluted, undefined);
});

test("a day clamps at 86400", () => {
  const t = TT.creditSpan({ P: { "2026-03-10": 86000 } }, "P", at(2026, 3, 10, 1), at(2026, 3, 10, 2));
  assert.strictEqual(t.P["2026-03-10"], 86400);
});

test("creditSpan no-ops and does not mutate input", () => {
  const input = { P: { "2026-03-10": 5 } };
  const t = at(2026, 3, 10, 9);
  assert.deepStrictEqual(TT.creditSpan(input, "", t, t + 5000), input);
  assert.deepStrictEqual(TT.creditSpan(input, "P", t, t), input);
  TT.creditSpan(input, "P", t, t + 5000);
  assert.strictEqual(input.P["2026-03-10"], 5);
});

test("isDateKey checks real calendar dates", () => {
  assert.strictEqual(TT.isDateKey("2026-02-28"), true);
  assert.strictEqual(TT.isDateKey("2028-02-29"), true);
  assert.strictEqual(TT.isDateKey("2026-02-29"), false);
  assert.strictEqual(TT.isDateKey("2026-1-01"), false);
});
