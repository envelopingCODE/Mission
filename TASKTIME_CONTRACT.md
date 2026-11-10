# Task-time contract (v1)

Canonical format for the per-project time files written by `ollama-bridge.js`. Tools in other
repos that read these files should mirror this document. The rules in code live in
`tasktime.js` (shared by the page, the bridge and `tasktime.test.js`).

## Purpose and data minimization

The app credits project-mode ("OPS") timer time to a project per local day. When the operator
turns on "Send to local bridge", the bridge keeps a copy of those totals in a JSON file so other
local tools can read it.

The whole payload is **one number per project per local day**: whole seconds, floored, never
overstated. Nothing else is sent or stored. Nothing leaves the machine: the only destination is
the local bridge.

## Routes

Both need the `X-Bridge-Token` header (the contents of `.ollama-bridge-token`). Any `Origin` sent
must be allowed by the bridge's origin rules (`file://` pages send `null`).

- `GET /api/tasktime/projects` returns `{"v":1,"projects":["name", ...]}`, the usable configured names.
- `POST /api/tasktime` with body `{"v":1,"project":"<name>","days":{"YYYY-MM-DD":seconds}}`.
  An `Origin` header is required.

| Code | Meaning |
|------|---------|
| 200 | `{"ok":true,"written":"YYYY-MM-DD"}` |
| 400 | invalid request (see validation) |
| 403 | wrong or missing token, or origin not allowed |
| 404 | project not configured on the bridge |
| 409 | `{"error":"unreadable"}`: the existing file is not ours or is damaged; left untouched |
| 413 | body larger than 128 KB |
| 503 | write blocked (file locked, disk error); the sender retries on its next send |

## Validation

- Body is a plain object with exactly the keys `v`, `project`, `days`.
- `v` is `1`.
- `project` is a string equal to a configured name.
- `days` is a plain object; every key is a real calendar date `YYYY-MM-DD` (`2026-02-30` is invalid)
  and every value is an integer from 0 to 86400.

## File format

One line of JSON, keys and origins sorted:

```json
{"v":1,"source":"gamified-task-app","project":"Website","unit":"seconds","written":"2026-11-10","origins":{"http://localhost:8080":{"2026-11-09":5400,"2026-11-10":6300},"null":{"2026-11-10":900}}}
```

`written` is a date (the local day of the last write), not a timestamp. A day's total is the sum
of that day across all origins.

All `file://` builds share the origin `null`, so use only one of them.

## Merge rule

Per origin: every day present in a request is set (so a correction may lower a value); days
missing from the request are kept. Why: if the browser's data is cleared, the next send carries
fewer days, and that must not erase the file's history; and corrections made in the app's settings
must go through.

Known gap: after a purge of the browser's data, timing again on the same day restarts that day
from zero and replaces the stored value. This understates, and is correctable.

If the existing file cannot be parsed or is not exactly this shape (version, source, project,
unit, valid days), the bridge answers 409 and never overwrites it.

## Bridge config

`tasktime-projects.local.json`, next to the bridge, read on every request:

```json
{"<exact project name>": "<absolute path ending .json>"}
```

An entry is skipped unless the path is absolute, ends in `.json` and its folder exists. The file
is git-ignored (`*.local.json`).

## Non-goals

Each of these needs an explicit operator decision before it is added: timestamps or session
start/end, task or objective text, per-session records, categories, unconfigured projects, any
destination other than the local bridge.

## Versioning

Any incompatible change bumps `v`. Readers must refuse an unknown `v`.
