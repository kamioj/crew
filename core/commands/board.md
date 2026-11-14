---
description: Derive the current state of every task from the channel entries and the registry, and show it as a board. Use when you want to know what is in flight, what is blocked, and who is stale.
allowed-tools: Read, Grep, Bash(git:*)
---

# /crew:board

There is no board service — the channel is the record, so the board is computed from it. Read-only; this command writes nothing.

## 1 · Collect

```bash
git fetch origin
git show origin/<brain-branch>:coordination/brain-to-nodes.md
git show origin/<brain-branch>:coordination/nodes.yml
git show origin/<node-branch>:coordination/<node-file>.md    # one per node
```

## 2 · Fold the entries

Walk every entry in ID order and keep the **last** state per task. A task's thread is linked by `re:` chains back to the opening `task` entry.

| Last entry type for that thread | State |
|---|---|
| `task` with no reply | Dispatched |
| `ack`, `in-progress` | In progress |
| `blocked` | Blocked — carry the stated unblocker |
| `done` | Done |
| `rejected`, `cancel` | Closed |
| `needs-owner` with no answer | Waiting on the user |
| `takeover` with no handover yet | Handing over |

A later `cancel` or a correcting entry referencing an earlier ID wins over what it corrects — that
is what append-only means in practice.

**Fold what has been superseded.** An entry carrying `supersedes: <ID>` retires the one it names —
replacing it, or with `type: cancel`, withdrawing it outright (`entry-format.md`). Show the current
state; mention the retired entry only if someone asks how it got that way. A mistaken judgement that
nobody marked reads as current to every later reader.

## 3 · Report

Group by holder, and show for each task: id, subject, state, holder, lane, age of the last entry.

Then two lists that are the point of running this:

- **Waiting on the user** — every unanswered `needs-owner`, oldest first
- **Quiet nodes holding a task** — `holding` names a task and `eta` has passed. Show when their
  work last arrived (`git log -1 --format=%ci origin/<their-branch>`). These are questions to ask,
  not takeover candidates: silence reads the same whether the node is gone, busy or offline.

Cross-check `holding` against what the entries say. The entries are authoritative — a row claiming
a task the log shows as `done` is stale bookkeeping, and saying so is the point of folding the log.

Nothing else surfaces those two; they are invisible until someone folds the log.
