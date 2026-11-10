#!/usr/bin/env node
// ── Local bridge ────────────────────────────────────────────────────────────
// A small local server with two jobs, both reachable from the GitHub Pages
// build of this app:
//
// 1. Ollama proxy. Ollama's own CORS check rejects the Pages origin outright
//    (it only trusts localhost/127.0.0.1/file: by default) — this bridge sits
//    in front of it, answers CORS for the Pages origin specifically, and
//    forwards only the two endpoints the app actually calls. Ollama itself
//    never has to be reconfigured or exposed beyond localhost.
// 2. Task-time file writer. Merges the app's per-project daily totals into
//    <folder>/.tasktime.local.json, where the folder is the one set for that
//    project in the app's Settings. Opt-in on the app side; the format and
//    rules are in TASKTIME_CONTRACT.md.
//
// Run:   node ollama-bridge.js
// Then in the app's Local bridge settings, set URL to http://localhost:11435
// (works from both the hosted Pages build and a locally served build).
//
// Every request also needs a bearer token in X-Bridge-Token, generated on
// first run and saved to .ollama-bridge-token next to this script (git-
// ignored). This is what actually keeps a stranger out — the Origin check
// alone is a browser-only courtesy that any non-browser client can spoof, so
// it's not treated as authentication on its own.
//
// Config (env vars, all optional):
//   BRIDGE_PORT      port this bridge listens on         (default 11435)
//   OLLAMA_URL       where the real Ollama server is      (default http://localhost:11434)
//   BRIDGE_TOKEN     override the auto-generated token instead of reading/
//                    writing .ollama-bridge-token
//   ALLOWED_ORIGINS  comma-separated extra origins to trust, beyond the
//                    GitHub Pages origin below and localhost/127.0.0.1/file:

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const TaskTime = require("./tasktime.js");

const BRIDGE_PORT = Number(process.env.BRIDGE_PORT) || 11435;
const OLLAMA_URL = new URL(process.env.OLLAMA_URL || "http://localhost:11434");
const GITHUB_PAGES_ORIGIN = "https://envelopingcode.github.io";
const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);

const EXPLICIT_ORIGINS = new Set([GITHUB_PAGES_ORIGIN, ...EXTRA_ORIGINS]);
const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const TOKEN_FILE = path.join(__dirname, ".ollama-bridge-token");
function loadToken() {
  if (process.env.BRIDGE_TOKEN) return process.env.BRIDGE_TOKEN;
  try { return fs.readFileSync(TOKEN_FILE, "utf8").trim(); } catch (e) {}
  const generated = crypto.randomBytes(24).toString("hex");
  fs.writeFileSync(TOKEN_FILE, generated, { mode: 0o600 });
  return generated;
}
const TOKEN = loadToken();

// Only these app-called endpoints are proxied — nothing else on Ollama's
// API surface is reachable through the bridge.
const ALLOWED_ROUTES = { "/api/tags": "GET", "/api/chat": "POST" };
const TASKTIME_ROUTES = { "/api/tasktime": "POST" };

function allowedOrigin(origin) {
  if (!origin) return null;
  if (origin === "null" || LOCAL_ORIGIN_RE.test(origin) || EXPLICIT_ORIGINS.has(origin)) {
    return origin;
  }
  return null;
}

function applyCors(req, res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Bridge-Token");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.headers["access-control-request-private-network"] === "true") {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
}

// ── Task-time file writer ───────────────────────────────────────────────────
// Rules and file format: tasktime.js and TASKTIME_CONTRACT.md. Payloads are
// never logged.
//
// The folder comes from the browser, so the write scope is pinned here: only
// a file with this exact name, only inside a local folder that already
// exists, and an existing file is only replaced if it is already ours
// (TaskTime.mergeFile refuses anything else).

const TASKTIME_FILE = ".tasktime.local.json";
const TASKTIME_MAX_BODY = 128 * 1024;

function tasktimeTarget(folder) {
  if (!path.isAbsolute(folder)) return null;
  const dir = path.resolve(folder);
  try { if (!fs.statSync(dir).isDirectory()) return null; } catch (e) { return null; }
  return path.join(dir, TASKTIME_FILE);
}

function sendJson(req, res, origin, status, body) {
  if (origin) applyCors(req, res, origin);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Write-then-rename so a reader never sees a half-written file. Windows can
// briefly lock the target while a reader has it open, hence the retries.
function writeFileAtomic(file, text) {
  const tmp = file + ".tmp";
  try {
    fs.writeFileSync(tmp, text);
    for (let attempt = 1; ; attempt++) {
      try { fs.renameSync(tmp, file); return true; } catch (e) {
        const retryable = e.code === "EPERM" || e.code === "EBUSY" || e.code === "EACCES";
        if (!retryable || attempt >= 5) throw e;
        sleepSync(50);
      }
    }
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch (e2) {}
    return false;
  }
}

function handleTasktime(req, res, origin) {
  if (!origin) {
    req.resume();
    sendJson(req, res, origin, 400, { error: "origin required" });
    return;
  }

  const chunks = [];
  let size = 0;
  let tooLarge = false;
  req.on("data", (chunk) => {
    if (tooLarge) return;
    size += chunk.length;
    if (size > TASKTIME_MAX_BODY) { tooLarge = true; chunks.length = 0; return; }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (tooLarge) return sendJson(req, res, origin, 413, { error: "too large" });

    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) {
      return sendJson(req, res, origin, 400, { error: "invalid json" });
    }
    const verdict = TaskTime.validateRequest(body);
    if (!verdict.ok) return sendJson(req, res, origin, verdict.status, { error: verdict.error });

    const file = tasktimeTarget(body.folder);
    if (!file) return sendJson(req, res, origin, 404, { error: "folder not found" });
    let existing = null;
    try { existing = fs.readFileSync(file, "utf8"); } catch (e) {
      if (e.code !== "ENOENT") return sendJson(req, res, origin, 409, { error: "unreadable" });
    }
    const today = TaskTime.localDateKey(Date.now());
    const merged = TaskTime.mergeFile(existing, origin, body.project, body.days, today);
    if (merged.error) return sendJson(req, res, origin, 409, { error: "unreadable" });

    if (!writeFileAtomic(file, merged.text)) {
      return sendJson(req, res, origin, 503, { error: "write blocked" });
    }
    sendJson(req, res, origin, 200, { ok: true, written: today });
  });
}

const server = http.createServer((req, res) => {
  const origin = allowedOrigin(req.headers.origin);

  if (req.method === "OPTIONS") {
    if (origin) applyCors(req, res, origin);
    res.writeHead(origin ? 204 : 403);
    res.end();
    return;
  }

  const expectedMethod = ALLOWED_ROUTES[req.url] || TASKTIME_ROUTES[req.url];
  if (!expectedMethod || req.method !== expectedMethod) {
    res.writeHead(404);
    res.end();
    return;
  }
  if (req.headers.origin && !origin) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (req.headers["x-bridge-token"] !== TOKEN) {
    if (origin) applyCors(req, res, origin);
    res.writeHead(403);
    res.end();
    return;
  }

  if (TASKTIME_ROUTES[req.url]) {
    handleTasktime(req, res, origin);
    return;
  }

  const upstream = http.request(
    {
      hostname: OLLAMA_URL.hostname,
      port: OLLAMA_URL.port,
      path: req.url,
      method: req.method,
      headers: { "Content-Type": "application/json" },
    },
    (upstreamRes) => {
      if (origin) applyCors(req, res, origin);
      res.writeHead(upstreamRes.statusCode, { "Content-Type": upstreamRes.headers["content-type"] || "application/json" });
      upstreamRes.pipe(res);
    }
  );
  upstream.on("error", () => {
    if (origin) applyCors(req, res, origin);
    res.writeHead(502);
    res.end();
  });
  req.pipe(upstream);
});

server.listen(BRIDGE_PORT, "127.0.0.1", () => {
  console.log(`Local bridge listening on http://localhost:${BRIDGE_PORT}`);
  console.log(`Task-time: writes ${TASKTIME_FILE} into the folders set in the app's Settings`);
  console.log(`Forwarding to Ollama at ${OLLAMA_URL.origin}`);
  console.log(`Trusted origins: ${[...EXPLICIT_ORIGINS].join(", ")}, plus localhost/127.0.0.1/file:`);
  console.log(`Token (paste into the app's Local bridge settings): ${TOKEN}`);
});
