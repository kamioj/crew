<!-- GENERATED from core/nodes.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
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
    holding: none        # the task id this node is on, or none
    heartbeat: 2026-11-13 18:35

  - id: be-codex
    host: workstation-01
    agent: codex
    role: node
    skills: [java, spring, mysql]
    lanes: ["backend/**", "deploy/**"]
    branch: codex/backend-implementation
    reports_to: brain
    holding: BRAIN-012
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
| `holding` | the task id this node is working on, or `none` |
| `heartbeat` | local time of its last session open or close |

## Who writes it

**Every node edits its own row and nothing else.** This is the one file with more than one writer, so the rule is what keeps it mergeable: two nodes touching two different rows produce either a clean merge or a plain text conflict you resolve by keeping both rows. A node that edits someone else's row can silently change who owns a lane.

Adding a row and removing one are the same operation — one row, your own.

### Editing it from another branch

The file lives on the brain's branch, but every node edits it, so the sequence matters:

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml > coordination/nodes.yml
# edit YOUR row only
git add coordination/nodes.yml
git commit -m "crew: <id> heartbeat"
git push origin <your-branch>
```

The brain then merges the row in. Two nodes touching two different rows merge cleanly; the worst
case is a plain text conflict you resolve by keeping both rows.

**The brain must push the registry before any node can join.** A node that fetches before the
first registry commit exists finds nothing to copy and stalls there with no way to tell whether it
is early or misconfigured — so `/crew:init` pushes `coordination/` as its last step, and nodes join
after.

Changing another node's `lanes` or `reports_to` is the brain's call: post a `task` entry asking for it.

## Holding

Set `holding` to the task id when you `ack` a task, back to `none` when you post its `done`,
`blocked` or handover. Two lines of bookkeeping, and they are what makes takeover mechanical:

| | `holding: none` | `holding: <task>` |
|---|---|---|
| **heartbeat fresh** | idle — dispatch to it | working — leave it alone |
| **heartbeat stale** | gone, but holding nothing — just note it | **gone mid-task — this is the takeover case** |

Heartbeat alone cannot distinguish these. A node idle for two hours needs no takeover, and a node
running a 45-minute test suite looks exactly as fresh as one doing nothing — without `holding`,
every stale row has to be reasoned about by hand.

The entries remain authoritative: `holding` is a pointer for triage, not the record. When the two
disagree, the channel wins and the row is stale bookkeeping — `/crew:board` folds the log and will
say so.

## Heartbeat

Update your own `heartbeat` when a session opens and again before it ends. That is the whole mechanism — there is no daemon and nothing polls.

A heartbeat older than the project's timeout means the node is not working; see `takeover.md` for what anyone may then do. The timeout belongs in `coordination/README.md`, and should be longer than the node's longest single step — set it too short and a node doing slow work gets declared dead while it is still typing.

A stale heartbeat is evidence, not proof. It says nobody has reported in; it cannot say the machine is off.
