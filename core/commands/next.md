---
description: Pull unread entries addressed to this node, show stale nodes whose tasks can be taken over, and pick the next task. Use at the start of a working session.
allowed-tools: Read, Bash(git:*), Edit
---

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
git show origin/<brain-branch>:coordination/decisions.md      # has anything been settled since?
```

Read `decisions.md` before starting, not after. Standing rulings live there precisely because the
log buries them — three lanes in the field each re-raised the same settled questions, and the
re-work was the only cost.

Read every entry past your cursor addressed to your `id` or to everyone. **P0 first, then by ID.** Also read any node file you are waiting on.

## 3 · Acknowledge what you take

Post an `ack` for the entry you are picking up, in this same check — the brain cannot distinguish "not seen" from "seen and ignored", and an unacknowledged task gets reassigned.

Set `holding: <task-id>` on your registry row at the same time. That one field is what tells
everyone else whether your row going stale later is a takeover case or just an idle machine.

## 4 · Declare your `eta`

```bash
git show origin/<brain-branch>:coordination/nodes.yml
```

Set your own row's `holding` to the task and `eta` to when you expect this step to land, then commit
and push. Silence before your `eta` needs no explanation; silence after it is what gets you asked
about work that is going fine.

## 5 · Look for stale nodes

In the same `nodes.yml`, read `holding` and `eta` together, and check when each node's work last
arrived:

```bash
git log -1 --format=%ci origin/<their-branch>
```

Holding a task and well past its `eta` is the case worth raising. Nothing held, or still within
`eta`, is not. **Silence has three causes — gone, busy, or no network — and the remote looks
identical for all three**, so what you post is a question, never a conclusion (the `takeover`
reference). You do **not** take it yourself: post a `takeover` request to the brain naming the id, its `eta`, its last push time, and the task. Only the brain grants one, and only after confirming out of band what the silence means.

You do **not** take it yourself. Only the brain grants, and only after confirming out of band what
the silence actually means.

## 6 · Settle on one task

One task at a time (`lanes.md`). If what you picked needs files outside your lanes, stop and ask their owner — do not widen your lane silently.

Report to the user: what you took, which lane it touches, and anything stale you surfaced.
