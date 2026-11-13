---
name: crew-takeover
description: Request or grant a takeover of a task held by another node — for a node that went stale, or a deliberate handover. Use when a session died, or work needs to move machines.
---
<!-- GENERATED from core/commands/takeover.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# $crew-takeover

Moves work from one node to another. Nodes request; **only the brain grants** — see `roles/brain.md`. The full sequence and its reasoning are in the `takeover` reference.

Two different things can move, and the request has to say which:

- **the task** — it goes to another live node, which does it under its own id. For work that must continue now.
- **the row** — a new session adopts the node identity itself: same id, same lanes, same channel file, same entry numbering, only the machine and branch change. For a node that is a post rather than a person.

## As a node — request it

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

Heartbeat past the timeout (stated in `coordination/README.md`) → post a request naming the node, its last heartbeat, the task, and why you can take it (your lanes and skills).

```
## <ID> · <time> · type: takeover · priority: P1
**Subject:** request takeover of <task-ID> from <node-id>
**Context:** last heartbeat <time>, timeout <N>; last pushed commit <sha>
**Ask:** grant the task to <my-id>; I own <lanes>
**Acceptance:** a takeover entry from the brain naming me as holder
```

Do not start. A stale heartbeat is evidence, not proof — the machine may be fine and the node simply forgot to write — which is why one role decides and it is not the one that noticed.

## As the brain — grant it

Post a `takeover` entry naming the task, the node losing it, the node taking it, and — when the losing node may still be alive — **the deadline for its handover entry**.

State both rules in the entry so neither side improvises:

- the outgoing node finishes its current step, pushes work-in-progress to **its own** branch, posts a handover entry, and stops; it does **not** resolve conflicts
- the taker opens a **new** branch `<taker-id>/<task>-r2` from the last pushed commit and never continues the outgoing branch

Deadline passes with no handover → the taker proceeds from the last pushed commit. Move the lane in `nodes.yml` if it travels with the task.

## As the outgoing node

You find the takeover on your next read. Finish the step you are on, then: commit and push work-in-progress to your own branch, post the handover entry (shape in the `takeover` reference), update your heartbeat, stop.

Fill in **Notes** — what you were about to do and which approaches you already discarded. The code shows what was written; only you know what it was for, and without it the taker repeats your dead ends.

## As the adopter (row adoption)

```bash
git fetch origin
git checkout -b <id>/r2 <their-last-pushed-sha>
```

The dead node's channel file comes with the branch, so keep its name and continue its numbering —
`BE-128` → `BE-129` — and every earlier `re:` pointer still resolves.

Then edit **that row** in `coordination/nodes.yml`: same `id`, `lanes` and `reports_to`; new `host`,
`branch`, `agent` if it differs, fresh `heartbeat`. Write `.crew/node` in your checkout
(`identity.md`). Post your first entry under the continued numbering saying you have adopted it.

Never adopt a row whose heartbeat is fresh — a live node and an adopter sharing one id is the one
state the registry cannot represent.

## As the taker (task takeover)

```bash
git fetch origin
git checkout -b <your-id>/<task>-r2 <last-pushed-sha>
```

From the recorded SHA, never from the live head of the outgoing branch — a late push from the outgoing node would otherwise slip into your base unnoticed. Conflicts are yours to resolve; you own the integration target.
