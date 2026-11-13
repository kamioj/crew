---
name: crew-new
description: Brain only — create a task and assign it to a node, as an entry in the brain's channel file. Use when handing work out.
---
<!-- GENERATED from core/commands/new.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# $crew-new

Creates a task and dispatches it. Only the brain writes `coordination/brain-to-nodes.md`.

## 1 · Pick the node

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

Match the work to a node's `skills` and `lanes`.

**Check its heartbeat first.** Dispatching to a stale node buries the task — nothing will read it, and you will be waiting on work that never started.

The task needs files outside the node's lanes → **name them in the entry**. That grant is scoped to
the task and expires with it (`lanes.md`), which is how a dispatch reaches into your own lane without
a standing permission. You can only grant reach into lanes you own; files owned by a third node go
to that node as its own entry, or wait for a barrier.

## 2 · Write it

```
## <ID> · <time> · type: task · priority: <P0-P3>
**Subject:** one line
**Context:** why — spec section, file, commit SHA
**Ask:** exactly what to do, and which node
**Acceptance:** the observable thing you will check
**Refs:** paths or entry IDs
```

**Acceptance is not optional.** Without it the node guesses when it is finished, and you re-open the thread to find out.

Priorities: P0 interrupts current work at the next safe point; P1 next up; P2 normal queue; P3 when convenient. Marking everything P0 teaches nodes to ignore P0.

## 3 · Push

```bash
git add coordination/brain-to-nodes.md
git commit -m "coord: <ID> <subject>"
git push origin <brain-branch>
git log origin/<brain-branch>..HEAD    # empty = dispatched
```

An unpushed dispatch has dispatched nothing.

## 4 · Expect an ack

The node acknowledges on its next check. No `ack` well past that, and a fresh heartbeat on its row, means it read and did not take it — ask; do not silently reassign.
