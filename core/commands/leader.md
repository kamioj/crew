---
description: Register this session as the brain — the single writer of the dispatch file and the only role that grants or revokes a task. Use when taking the coordinating role on a project.
allowed-tools: Read, Edit, Write, Bash(git:*)
---

# /crew:leader

Claims the brain role for this session and registers it.

## 1 · Check nobody else holds it

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

A row with `role: brain` whose branch has had recent pushes means another session is already the brain. Two brains both writing the dispatch file breaks one-writer-per-file, so stop and tell the user — they decide whether the other one is finished.

The existing brain row looks abandoned → you may take it over, but say so plainly to the user first: the previous brain may simply have been idle, or offline.

No `coordination/` at all → run `/crew:init` first.

## 2 · Take the row

Set `role: brain`, your `host`, `agent`, `branch`, `lanes` (the brain owns `coordination/**` and usually the architecture docs), `decides`, and `reports_to: owner`.

Edit only this row.

```bash
git add coordination/nodes.yml
git commit -m "crew: leader <id>"
git push origin <brain-branch>
```

Then write `.crew/node` in this checkout with your id (`identity.md`) — it is what tells a later
session here that it is the brain rather than some other node.

## 3 · Load the picture

Read the node files past your cursor and the current registry — `/crew:load` does exactly this if you want it in one step.

## 4 · Report

Tell the user: who the nodes are, who is stale, and what is waiting. Then `/crew:review` runs the working pass.

What the role actually commits you to is in `roles/brain.md`.
