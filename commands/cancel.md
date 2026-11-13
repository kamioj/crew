---
description: Withdraw a task that was dispatched — stop work on it and close the thread. Use when a task is obsolete, superseded, or was sent to the wrong node.
allowed-tools: Read, Edit, Bash(git:*)
---
<!-- GENERATED from core/commands/cancel.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# /crew:cancel

Withdraws a task. The entries stay — append-only means nothing is ever deleted — so cancelling is a new entry that closes the thread.

## 1 · Check whether it has started

```bash
git fetch origin
git show origin/<node-branch>:coordination/<node-file>.md
```

Already `in-progress` or `done` → say so in the cancel entry and state explicitly what happens to the work already written: keep the branch, or abandon it. A cancel that leaves a half-finished branch unaddressed leaves the node holding something nobody owns.

## 2 · Write the cancel

```
## <ID> · <time> · type: cancel · re: <the task's ID>
**Result:** withdrawn — <why in one line>
**Work already done:** <branch + commit, and whether to keep or abandon it; "none" if untouched>
**Replaces:** <the entry ID that supersedes it, or "nothing">
```

**Say why.** A cancel with no reason reads as a mistake, and the node has no way to tell whether the next similar task is also about to be withdrawn.

Superseding rather than dropping → post the replacement task first, then reference it here. The node then has somewhere to go.

## 3 · Push

```bash
git add coordination/<your-file>.md
git commit -m "coord: <ID> cancel <task-ID>"
git push origin <your-branch>
git log origin/<your-branch>..HEAD    # empty = sent
```

## Who may cancel

The brain cancels a task it dispatched. A node may only cancel a request **it** opened — it cannot cancel work assigned to it, because dropping assigned work is the brain's call; post a `rejected` reply with the reason instead.
