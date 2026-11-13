---
name: crew-leader
description: Register this session as the brain — the single writer of the dispatch file and the only role that grants or revokes a task. Use when taking the coordinating role on a project.
---
<!-- GENERATED from core/commands/leader.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# $crew-leader

Claims the brain role for this session and registers it.

## 1 · Check nobody else holds it

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

A row with `role: brain` and a **fresh** heartbeat means another session is already the brain. Two brains both writing the dispatch file breaks one-writer-per-file, so stop and tell the user — they decide whether the other one is finished.

The existing brain row is **stale** → you may take it over, but say so plainly to the user first: the previous brain may simply have been idle.

No `coordination/` at all → run `$crew-init` first.

## 2 · Take the row

Set `role: brain`, your `host`, `agent`, `branch`, `lanes` (the brain owns `coordination/**` and usually the architecture docs), `reports_to: owner`, and a fresh `heartbeat`.

Edit only this row.

```bash
git add coordination/nodes.yml
git commit -m "crew: leader <id>"
git push origin <brain-branch>
```

Then write `.crew/node` in this checkout with your id (`identity.md`) — it is what tells a later
session here that it is the brain rather than some other node.

## 3 · Load the picture

Read the node files past your cursor and the current registry — `$crew-load` does exactly this if you want it in one step.

## 4 · Report

Tell the user: who the nodes are, who is stale, and what is waiting. Then `$crew-review` runs the working pass.

What the role actually commits you to is in `roles/brain.md`.
