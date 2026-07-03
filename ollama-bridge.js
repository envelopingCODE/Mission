#!/usr/bin/env node
// ── Ollama Bridge ───────────────────────────────────────────────────────────
// Lets the GitHub Pages build of this app reach a local Ollama instance.
// Ollama's own CORS check rejects the Pages origin outright (it only trusts
// localhost/127.0.0.1/file: by default) — this bridge sits in front of it,
// answers CORS for the Pages origin specifically, and forwards only the two
// endpoints the app actually calls. Ollama itself never has to be reconfigured
// or exposed beyond localhost.
//
// Run:   node ollama-bridge.js
// Then in the app's Buddy AI settings, set URL to http://localhost:11435
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

const server = http.createServer((req, res) => {
  const origin = allowedOrigin(req.headers.origin);

  if (req.method === "OPTIONS") {
    if (origin) applyCors(req, res, origin);
    res.writeHead(origin ? 204 : 403);
    res.end();
    return;
  }

  const expectedMethod = ALLOWED_ROUTES[req.url];
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
  console.log(`Ollama bridge listening on http://localhost:${BRIDGE_PORT}`);
  console.log(`Forwarding to Ollama at ${OLLAMA_URL.origin}`);
  console.log(`Trusted origins: ${[...EXPLICIT_ORIGINS].join(", ")}, plus localhost/127.0.0.1/file:`);
  console.log(`Token (paste into Buddy AI settings): ${TOKEN}`);
});
