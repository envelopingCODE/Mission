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

## Which projects, and where

The operator lists the projects to export in the app (Settings > Project time > Exported
projects), each with a local folder. Only listed projects are sent. The bridge writes exactly one
file per project: `<folder>/.tasktime.local.json`. A reader finds its file there; git-ignore it
(`*.local.json`).

## Route

`POST /api/tasktime` with body
`{"v":1,"project":"<name>","folder":"<absolute local folder>","days":{"YYYY-MM-DD":seconds}}`.
It needs the `X-Bridge-Token` header (the contents of `.ollama-bridge-token`) and an `Origin`
header that the bridge's origin rules allow (`file://` pages send `null`).

Because the folder comes from the browser, the write scope is pinned in the bridge: only the file
name `.tasktime.local.json`, only inside a local folder that already exists, and an existing file
is only replaced if it is already in this format.

| Code | Meaning |
|------|---------|
| 200 | `{"ok":true,"written":"YYYY-MM-DD"}` |
| 400 | invalid request (see validation) |
| 403 | wrong or missing token, or origin not allowed |
| 404 | folder does not exist |
| 409 | `{"error":"unreadable"}`: the existing file is not ours or is damaged; left untouched |
| 413 | body larger than 128 KB |
| 503 | write blocked (file locked, disk error); the sender retries on its next send |

## Validation

- Body is a plain object with exactly the keys `v`, `project`, `folder`, `days`.
- `v` is `1`.
- `project` is a string of 1 to 80 characters.
- `folder` is an absolute local path: a drive path (`K:\Projects\Name`) or a POSIX path
  (`/home/me/name`). Network paths (`\\server\share`, `//host`) are refused, since nothing may
  leave the machine.
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

## Non-goals

Each of these needs an explicit operator decision before it is added: timestamps or session
start/end, task or objective text, per-session records, categories, projects not listed for export, any
destination other than the local bridge.

## Versioning

Any incompatible change bumps `v`. Readers must refuse an unknown `v`.
