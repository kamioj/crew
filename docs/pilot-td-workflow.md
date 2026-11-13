# Pilot: adopting crew in td-workflow

td-workflow already coordinates through git files and has done so since 2026-11-11 — two append-only channel files, one writer each, on separate branches. **That is crew's channel, already running.** Adoption is therefore additive: keep every existing file and entry, add the registry, and name the settings that were previously only in people's heads.

Nothing in `coordination/frontend-to-backend.md` or `coordination/backend-to-frontend.md` changes. They are append-only; rewriting them would destroy the record of what each side knew at the time, and every `re:` pointer with it.

## What already matches

| crew concept | td-workflow today |
|---|---|
| channel | `coordination/frontend-to-backend.md` + `coordination/backend-to-frontend.md` |
| one writer per file | the lead writes one, the backend writes the other |
| each on its own branch | `jw/frontend-system-alignment-ed147e` · `codex/backend-implementation` |
| entry format | `## FE-058 · 2026-11-13 18:00 · type: answer · re: BE-126 · priority: P1` + Subject/Context/Ask/Acceptance/Refs |
| delivery rule | "a message is delivered only when its commit is pushed" |
| cursor | last-read BE number and last-reviewed commit, in the lead's memory |
| checkpoint | the lead's scheduled checkpoint prompt |
| barrier | the table and package renames held for the WP-0.6 barrier |
| safety | credentials handled out of band; no local absolute paths in entries |

## What is new

1. **`coordination/nodes.yml`** — who exists, which files they own, who they report to, heartbeats. Today this lives only in the lead's memory file, so a new session cannot find out who it is without asking.
2. **Heartbeats** — each session writes its own timestamp on open and close, which turns "that session died" into something anyone can see by fetching.
3. **Takeover** — a written sequence for moving a task off a stale node. There is currently no takeover type in 59 FE entries; it is handled by the user remembering.

## Steps

### 1 · Settings file

Add `coordination/README.md` (or extend the existing one) with the branch table, the timezone (UTC+8), and the heartbeat timeout. **Pick a timeout longer than a node's longest single step** — a backend package can run far longer than the ~10-minute check interval, and a timeout under that would declare a working node dead.

### 2 · Registry

Add `coordination/nodes.yml` on the lead's branch with four rows. Two are evidenced by the repository today; fill in the rest from what the machines actually are:

```yaml
timezone: UTC+8

nodes:
  - id: lead
    host: <machine>
    agent: claude
    role: brain
    skills: [architecture, review, frontend, schema]
    lanes: ["coordination/**", "frontend/**", "docs/architecture/**"]
    branch: jw/frontend-system-alignment-ed147e
    reports_to: owner
    heartbeat: <YYYY-MM-DD HH:MM>

  - id: be-codex
    host: <machine>
    agent: codex
    role: node
    skills: [java, spring, mysql, deploy]
    lanes: ["backend/**", "deploy/**", "scripts/**"]
    branch: codex/backend-implementation
    reports_to: lead
    heartbeat: <YYYY-MM-DD HH:MM>

  - id: liaison
    host: <machine>
    agent: claude
    role: node
    skills: [frontend, api-switch]
    lanes: ["frontend/src/**"]
    branch: jw/backend-liaison
    reports_to: lead
    heartbeat: <YYYY-MM-DD HH:MM>

  - id: <business-assistant>
    host: <machine>
    agent: <claude|codex>
    role: node
    skills: [<...>]
    lanes: [<...>]
    branch: <branch>
    reports_to: lead
    heartbeat: <YYYY-MM-DD HH:MM>
```

The fourth row is left blank deliberately: the repository shows no branch or lane for it, and inventing one would hand a node a lane it does not own. Fill it in from the machine itself, or let it run `/crew:node`.

**Lanes must not overlap.** The backend works `backend/**`, the lead `frontend/**` and the architecture docs, the liaison a narrower slice inside the frontend — confirm that slice with the lead before writing it, since the lead and the liaison both touch frontend files today and the current split is an understanding rather than a written one.

### 3 · Keep the existing ID prefixes

`FE-###` and `BE-###` continue from where they are. Entry IDs are never reused and never renumbered, so the registry's `id` field is what carries the node name; the prefix stays as it is.

### 4 · Point sessions at the protocol

One line in the project's `CLAUDE.md` / `AGENTS.md`:

```markdown
Cross-machine coordination runs on crew: read `coordination/README.md` before posting anything.
```

### 5 · Add heartbeats to the existing routine

The lead's checkpoint prompt gains one step: read `nodes.yml`, and for every heartbeat past the timeout name the node and the task it holds, then decide — grant a takeover, or wait. `templates/checkpoint.md` has the shape.

Each node adds the same two lines to its own routine: refresh the heartbeat when the session opens, and again before it ends.

## Interaction with `docs/git-collaboration.md`

That file already says: each side commits and pushes on its own branch, no force-pushing, never reset the other side's branch, integrate through a PR or an explicit merge. crew agrees with all of it, and the takeover rule depends on it — a taker opens a **new** branch precisely so that nobody ever has to rewrite the outgoing node's.

Keep `docs/git-collaboration.md` as the repository's git policy; `coordination/README.md` covers the channel. Where both mention branches, the git policy wins.

## What to watch during the pilot

The honest open question is whether rules without enforcement hold. crew ships no scripts and no hooks, so three things are on trust:

- entries written but not pushed
- heartbeats not refreshed
- a taker continuing the outgoing node's branch instead of opening a new one

If any of these happens repeatedly in practice, the answer is a pre-push check **in td-workflow**, not a change to the protocol — the protocol has to stay runnable on hosts where no hook mechanism exists.
