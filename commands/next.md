---
description: Pull unread entries addressed to this node, show stale nodes whose tasks can be taken over, and pick the next task. Use at the start of a working session.
allowed-tools: Read, Bash(git:*), Edit
---
<!-- GENERATED from core/commands/next.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# /crew:next

Your inbox. Reads what is new, shows what is takeable, and leaves you with one task.

## 1 · Know who you are

Resolve this session's identity before reading anything: `.crew/node` → the matching row in
`coordination/nodes.yml` → cross-check `git branch --show-current` against that row's `branch`.
A mismatch means you are in the wrong checkout, or your row has been adopted — stop there.
Full rules: `identity.md`. State the result in one line before continuing.

## 2 · Fetch and read

```bash
git fetch origin
git show origin/<brain-branch>:coordination/brain-to-nodes.md
```

Read every entry past your cursor addressed to your `id` or to everyone. **P0 first, then by ID.** Also read any node file you are waiting on.

## 3 · Acknowledge what you take

Post an `ack` for the entry you are picking up, in this same check — the brain cannot distinguish "not seen" from "seen and ignored", and an unacknowledged task gets reassigned.

Set `holding: <task-id>` on your registry row at the same time. That one field is what tells
everyone else whether your row going stale later is a takeover case or just an idle machine.

## 4 · Refresh your heartbeat

```bash
git show origin/<brain-branch>:coordination/nodes.yml
```

Update your own row's `heartbeat`, commit, push. A node that is working but looks stale gets its task taken (the `takeover` reference).

## 5 · Look for stale nodes

In the same `nodes.yml`, compare every `heartbeat` against the project's timeout (stated in `coordination/README.md`).

Read `holding` alongside it: stale **and** holding a task is the takeover case; stale and
`holding: none` means nobody is waiting on it, so note it and move on. Fresh is not a takeover case
at all, however quiet the node looks.

A stale row holding a task is a candidate for takeover. You do **not** take it yourself: post a `takeover` request to the brain naming the id, its last heartbeat, and the task. Only the brain grants a task.

A stale heartbeat is evidence, not proof — the machine may be fine and the node simply forgot to write. That is why the brain, not the noticer, decides.

## 6 · Settle on one task

One task at a time (`lanes.md`). If what you picked needs files outside your lanes, stop and ask their owner — do not widen your lane silently.

Report to the user: what you took, which lane it touches, and anything stale you surfaced.
