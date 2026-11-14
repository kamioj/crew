---
name: crew-load
description: Pull the whole coordination picture into this session — settings, registry, unread entries, stale nodes — without taking a task. Use when returning after a break, or to catch up before deciding anything.
---
<!-- GENERATED from core/commands/load.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# $crew-load

Everything the channel knows, in one read. Takes nothing and writes nothing — use `$crew-next` when you want work.

## 1 · Know who you are

Resolve identity first (`identity.md`): `.crew/node` → the matching registry row → branch
cross-check. No marker means this checkout has not joined — `$crew-load` still works, it just
reports the roster rather than "your" unread.

## 2 · Fetch

```bash
git fetch origin
```

## 3 · Read, in this order

```bash
git show origin/<brain-branch>:coordination/README.md       # settings: branches, timezone, timeout
git show origin/<brain-branch>:coordination/nodes.yml       # who exists, lanes, holding, eta
git show origin/<brain-branch>:coordination/brain-to-nodes.md
git show origin/<node-branch>:coordination/<node-file>.md   # one per counterpart
```

Entries past your cursor are what is new. Everything before it you have already handled — re-reading the whole file every session is how a long log becomes unreadable.

## 4 · Report four things

- **Mine** — unread entries addressed to this session's id, P0 first
- **In flight** — tasks with a holder and no `done` yet, per `$crew-board`'s folding rules
- **Waiting on the user** — unanswered `needs-owner` entries, oldest first
- **Quiet** — nodes holding a task and past their `eta`, with when their work last arrived

The last two exist nowhere else. Nothing surfaces them until someone folds the log, which is the whole reason to run this.

## 5 · Stop

No `ack`, no registry write, no task taken. Loading is not acknowledging — an `ack` you did not mean tells the brain the work is picked up when nobody is doing it.
