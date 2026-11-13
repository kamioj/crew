<!-- GENERATED from core/takeover.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# Heartbeat, takeover and handover

A node holds a task until it finishes, hands it back, or stops reporting. This file covers the last case — and the deliberate case, where the brain moves a task while its holder is still working.

## Heartbeat

Each node writes its own `heartbeat` in `coordination/nodes.yml` when a session opens and before it ends (`nodes.md`). Anyone who fetches can see who is current and who is stale; the timeout is stated in `coordination/README.md`.

There is no watcher. A stale row is discovered by whoever looks — and looking is one `git show`.

## Two things you can take over

**A task** moves to another live node, which does the work under its own id. Use it when the work has to continue now and somebody else can carry it.

**A row** — the node identity itself — is taken by a new session, which continues that id, its lanes, its channel file and its entry numbering, changing only the machine and the branch. Use it when the node is a post rather than a person: the backend node must keep existing, and a different machine is now staffing it.

Both are granted by the brain and never self-assigned.

## Is this even a takeover case?

Read both fields in the row, not just the heartbeat:

- stale heartbeat **and** `holding: <task>` → the takeover case below
- stale heartbeat **and** `holding: none` → nobody is waiting on anything; note it and move on
- fresh heartbeat → not a takeover case, whatever the node appears to be doing

A heartbeat answers "has anyone reported in", never "is anyone blocked" — a node idle for hours and
a node mid-way through a 45-minute test suite are indistinguishable by heartbeat alone.

## Case 1 — the node is gone (lease expired)

Its heartbeat is older than the timeout, `holding` names a task, and nothing new has arrived from it.

1. Any node may notice and ask: post a `takeover` request to the brain naming the id, its last heartbeat and the task, and say which kind you are asking for.
2. **The brain grants it.** Only the brain revokes a task — see `brain.md`. It posts a `takeover` entry naming the task, the node losing it, and the node taking it.
3. The taker starts from the stale node's **last pushed commit**, on a **new branch**. Anything that node never pushed is gone; that is the cost of the push boundary and the reason nodes push work-in-progress.
4. The taker updates its own row's `lanes` if the lane moves with the task.

There is no grace period here. The node is not answering, so there is nothing to wait for.

## Row adoption

A session takes over the identity, not just the work.

1. The brain grants it with a `takeover` entry marked as an adoption, naming the id and the adopter's machine.
2. The adopter branches from the dead node's **last pushed commit** — a new branch, as always — and its channel file comes along with the branch, so the entry numbering continues where it stopped (`BE-128` → `BE-129`) and every earlier `re:` pointer still resolves.
3. The adopter edits that row in `coordination/nodes.yml`: same `id`, same `lanes`, same `reports_to`; new `host`, new `branch`, new `agent` if it differs, fresh `heartbeat`.
4. The adopter writes `.crew/node` in its own checkout (`identity.md`) and posts its first entry under the continued numbering, stating that it has adopted the row.

Readers follow automatically: everyone resolves a node's file through the registry's `branch` field, so updating the row redirects them without anyone being told.

**This is also what protects you if the old node wakes up.** Its marker still claims the id, but the registry's `branch` no longer matches where it is standing, so its start-of-session cross-check stops it before it writes anything (`identity.md`). Adoption without that check would give you two sessions writing the same channel file from two branches.

Do not adopt a row whose heartbeat is fresh. A live node and an adopter sharing one id is the one state the registry cannot represent.

## Case 2 — the brain moves a task while its holder is working (pre-takeover)

The holder does **not** stop mid-step. It finishes the step it is on, then checks the channel — this is the normal read every node does — and finds the `takeover` entry.

What the outgoing node then does, and nothing more:

1. Commit the work in progress, in whatever state it is, and push it to **its own branch**.
2. Post one `done`-shaped handover entry: what it was doing, where it stopped, the branch and commit SHA, what is left, and anything it knows that the diff does not show.
3. Stop. Update its heartbeat and leave the task.

**It does not resolve merge conflicts, rebase, or keep improving the branch.** It no longer holds the task, and work it does now races the taker's. The conflicts are the taker's to resolve, because the taker owns the integration target.

The brain sets a deadline when it posts the takeover. If the handover entry has not arrived by then, the case becomes Case 1: the brain grants from the last pushed commit and the taker proceeds.

## The taker always opens a new branch

Never continue the outgoing node's branch. This is the whole isolation mechanism and it replaces any locking: if the outgoing node pushes again after handing over — slow to read the channel, a retried push, a session that was never really closed — the commit lands on its own, now-abandoned branch, where it affects nothing.

Continuing that branch instead puts the late commits straight into the integration target, with two heads and no clean way to tell them apart.

Name the new branch so the lineage is readable: `<taker-id>/<task>-r2`.

## Handover entry

```
## <ID> · <time> · type: done · re: <takeover entry ID>
**Result:** handed over — <what was being done>; stopped at <where>; branch <branch>, commit <sha>
**Remaining:** <what is left, in the order it should be done>
**Notes:** <intent the diff does not show — why an approach was chosen, what was already tried and rejected>
**Deviations:** <anything differing from the original ask, or "none">
```

**Notes is the field that matters.** The code shows what was written; only the outgoing node knows what it was about to do and which approaches it already discarded. Without it the taker repeats the dead ends.

## Limits

This is a protocol, not a lock. Nothing prevents a node from continuing after handing over — the design makes such a push harmless rather than impossible. If a project finds nodes violating it in practice, the fix is a pre-push check in that project, not a change to this protocol.
