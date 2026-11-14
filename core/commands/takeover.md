---
description: Request or grant a takeover of a task held by another node — for a node that went stale, or a deliberate handover. Use when a session died, or work needs to move machines.
allowed-tools: Read, Edit, Bash(git:*)
---

# /crew:takeover

Moves work from one node to another. Nodes request; **only the brain grants** — see `roles/brain.md`. The full sequence and its reasoning are in the `takeover` reference.

Two different things can move, and the request has to say which:

- **the task** — it goes to another live node, which does it under its own id. For work that must continue now.
- **the row** — a new session adopts the node identity itself: same id, same lanes, same channel file, same entry numbering, only the machine and branch change. For a node that is a post rather than a person.

## As a node — request it

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

`holding` names a task, its `eta` is well past, and nothing new has arrived on its branch
(`git log -1 --format=%ci origin/<their-branch>`) → post a request naming the node, its last push
time, its `eta` and the task. Nothing held, or still within `eta`, is not a case at all.

What you post is a **question**. Silence looks identical whether the node is gone, mid-way through a
long step, or simply offline — and an offline node cannot receive the takeover either.

```
## <ID> · <time> · type: takeover · priority: P1
**Subject:** request takeover of <task-ID> from <node-id>
**Context:** eta was <time>, last push <time> (<sha>); nothing since
**Ask:** grant the task to <my-id>; I own <lanes>
**Acceptance:** a takeover entry from the brain naming me as holder
```

Do not start. Silence is not proof: the node may be gone, mid-way through a long step, or simply offline — and an offline node cannot receive the takeover either. That is why one role decides, after asking, and it is not the one that noticed.

## As the brain — grant it

**Confirm out of band first.** Ask the owner to look at that session: running, waiting on the
network, or gone? That question is the only thing that separates the three causes of silence, and
takeover is the one irreversible action in crew. Owner unreachable → the honest state is "unknown,
not taken over": post that and wait.

Then post a `takeover` entry naming the task, the node losing it, the node taking it, and — when the losing node may still be alive — **the deadline for its handover entry**.

State both rules in the entry so neither side improvises:

- the outgoing node finishes its current step, pushes work-in-progress to **its own** branch, posts a handover entry, and stops; it does **not** resolve conflicts
- the taker opens a **new** branch `<taker-id>/<task>-r2` from the last pushed commit and never continues the outgoing branch

Deadline passes with no handover → the taker proceeds from the last pushed commit. Move the lane in `nodes.yml` if it travels with the task.

## As the outgoing node

You find the takeover on your next read. Finish the step you are on, then: commit and push work-in-progress to your own branch, post the handover entry (shape in the `takeover` reference), set `holding: none` and `eta: -`, stop.

Fill in **Notes** — what you were about to do and which approaches you already discarded. The code shows what was written; only you know what it was for, and without it the taker repeats your dead ends.

## As the adopter (row adoption)

```bash
git fetch origin
git checkout -b <id>/r2 <their-last-pushed-sha>
```

The dead node's channel file comes with the branch, so keep its name and continue its numbering —
`BE-128` → `BE-129` — and every earlier `re:` pointer still resolves.

Then edit **that row** in `coordination/nodes.yml`: same `id`, `lanes` and `reports_to`; new `host`,
`branch`, `agent` if it differs, and your own `eta`. Write `.crew/node` in your checkout
(`identity.md`). Post your first entry under the continued numbering saying you have adopted it.

Never adopt a row whose node might still be live — a live node and an adopter sharing one id is the
one state the registry cannot represent, and that question is answered out of band, not from the file.

## As the taker (task takeover)

```bash
git fetch origin
git checkout -b <your-id>/<task>-r2 <last-pushed-sha>
```

From the recorded SHA, never from the live head of the outgoing branch — a late push from the outgoing node would otherwise slip into your base unnoticed. Conflicts are yours to resolve; you own the integration target.
