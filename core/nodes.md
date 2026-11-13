# Node registry — `coordination/nodes.yml`

One row per node, in the project repository, on the brain's branch. It answers the three questions a node has when a session opens: who am I, which files are mine, who do I report to — without asking a human.

It is also where heartbeats live, which is what makes "that session died" a visible fact instead of something only the user remembers.

A row is an identity, not a machine: one machine often runs many checkouts, so what binds a session to its row is the `.crew/node` marker in that checkout, cross-checked against `branch`. See `identity.md`.

## Format

```yaml
# coordination/nodes.yml
timezone: UTC+8          # how timestamps in this file and in entries are read

nodes:
  - id: brain            # entry prefix and the name dispatches address
    host: desktop-win    # which machine — a label, never a path
    agent: claude        # claude | codex | other
    role: brain          # brain | node
    skills: [review, architecture, scheduling]
    lanes: ["coordination/**", "docs/architecture/**"]
    branch: jw/lead
    reports_to: owner    # the user
    heartbeat: 2026-11-13 18:35

  - id: be-codex
    host: workstation-01
    agent: codex
    role: node
    skills: [java, spring, mysql]
    lanes: ["backend/**", "deploy/**"]
    branch: codex/backend-implementation
    reports_to: brain
    heartbeat: 2026-11-13 18:28
```

| Field | Meaning |
|---|---|
| `id` | entry-ID prefix and dispatch address; unique, never reused |
| `host` | which machine, as a label — not a filesystem path (`protocol.md` § Safety) |
| `agent` | `claude`, `codex`, or whatever runs there |
| `role` | `brain` or `node` |
| `skills` | what it can be given — the brain reads this when choosing a node |
| `lanes` | glob patterns of the files this node owns (`lanes.md`) |
| `branch` | the branch it pushes; its channel file lives here too |
| `reports_to` | the id it sends entries to; `owner` means the user |
| `heartbeat` | local time of its last session open or close |

## Who writes it

**Every node edits its own row and nothing else.** This is the one file with more than one writer, so the rule is what keeps it mergeable: two nodes touching two different rows produce either a clean merge or a plain text conflict you resolve by keeping both rows. A node that edits someone else's row can silently change who owns a lane.

Adding a row (`join`) and removing one are the same operation — one row, your own.

Changing another node's `lanes` or `reports_to` is the brain's call: post a `task` entry asking for it.

## Heartbeat

Update your own `heartbeat` when a session opens and again before it ends. That is the whole mechanism — there is no daemon and nothing polls.

A heartbeat older than the project's timeout means the node is not working; see `takeover.md` for what anyone may then do. The timeout belongs in `coordination/README.md`, and should be longer than the node's longest single step — set it too short and a node doing slow work gets declared dead while it is still typing.

A stale heartbeat is evidence, not proof. It says nobody has reported in; it cannot say the machine is off.
