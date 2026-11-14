<!-- GENERATED from core/takeover.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# Liveness, takeover and handover

A node holds a task until it finishes, hands it back, or stops being reachable. This file covers the last case — and the deliberate case, where the brain moves a task while its holder is still working.

Takeover is the **only irreversible action in crew**. Everything else appends. So the evidence it rests on gets more scrutiny than anything else here.

## There is no liveness signal — only evidence, and it is weak

crew cannot see a process on another machine. Nothing in it can. What it can see is what reached the remote:

```bash
git log -1 --format=%ci origin/<their-branch>      # when their work last arrived
```

That timestamp is the whole of the evidence, and it proves exactly one thing: **a push succeeded at that moment.** It does not say the node is alive, and silence since then does not say it is dead.

**Silence has three causes, not two.**

| | What is true | What the remote shows |
|---|---|---|
| **gone** | the session ended or the machine is off | nothing new |
| **busy** | one long step — a full test suite, a large build | nothing new |
| **unreachable** | working fine, no network | nothing new |

The third one is why this section is written so carefully. **A node that loses its network cannot push, cannot report, and cannot receive a takeover entry** — the report travels over the same connection whose loss you are trying to detect, so it is structurally incapable of telling you about the state most easily mistaken for death.

In the field this ran its course twice in one day. A node went quiet for 2h20m holding a task; it was alive, 57 minutes into one turn, 15 files uncommitted. Later the same node went quiet for 5h56m; its screen showed `Reconnecting... waiting for network`. It worked through the night and pushed eight commits at once when the network returned. Granting a takeover on either occasion would have had a second node branch from a six-hour-old commit while the first kept working on the same files — and a full night's output would have been unrecoverable.

## `eta`, not a heartbeat

The useful thing a node can record is not that it was alive a moment ago — the branch tip already says that, without a second bookkeeping step — but **what it expects next**:

```yaml
eta: 2026-11-14 16:40     # when this node expects its current step to land
```

Silence before `eta` means nothing and needs no interpretation. Silence **after** `eta`, with `holding` set, is the first thing worth a question.

A written heartbeat was tried and removed in 0.3.0. It cost a commit per refresh on the node's own branch — noise that forked branch tips and read as work on the board — and it carried no information the branch tip did not already carry. Rows left over with a `heartbeat:` field do no harm; read them as decoration and use the tip.

## Is this even a takeover case?

```bash
git log -1 --format=%ci origin/<their-branch>
git show origin/<brain-branch>:coordination/nodes.yml     # holding, eta
```

| `holding` | past `eta`? | Read it as |
|---|---|---|
| `none` | — | idle. No takeover; dispatch to it or leave it |
| `<task>` | no | working. **Leave it alone** |
| `<task>` | yes, by a little | probably still going. Ask |
| `<task>` | yes, by a lot | the case below — and still ask first |

No `eta` written at all → treat the project's quiet period (`coordination/README.md`) as the threshold, and lean toward asking rather than acting.

## Case 1 — the node has stopped reporting

`holding` names a task, `eta` is well past, and nothing new has arrived on its branch.

1. **Any node may notice and ask**: post a `takeover` request to the brain naming the id, its last push time, its `eta`, and the task.
2. **The brain confirms out of band before granting.** Ask the owner to look at that session — is it running, is it waiting on the network, is it gone? One question, answered in seconds, and it is the only thing that separates the three causes of silence. crew assumes a person opens each node, so a person can be asked about one.
3. **Then** the brain grants: a `takeover` entry naming the task, the node losing it, and the node taking it.
4. The taker starts from the stale node's **last pushed commit**, on a **new branch**. Anything that node never pushed is gone — the cost of the push boundary, and the reason nodes push work in progress.
5. The taker updates its own row's `lanes` if the lane travels with the task.

**Do not skip step 2 because the silence looks conclusive.** It never is: the longest silences observed in the field were a node working offline all night, and the irreversible action was the wrong one both times. If the owner cannot be reached, the honest state is "unknown, not taken over" — say so in an entry and wait. A task left with an unreachable node costs delay; a task taken from a working one costs its work.

## Row adoption

A session takes over the identity, not just the work.

1. The brain grants it with a `takeover` entry marked as an adoption, naming the id and the adopter's machine.
2. The adopter branches from the dead node's **last pushed commit** — a new branch, as always — and its channel file comes along with the branch, so the entry numbering continues where it stopped (`BE-128` → `BE-129`) and every earlier `re:` pointer still resolves.
3. The adopter edits that row in `coordination/nodes.yml`: same `id`, same `lanes`, same `reports_to`; new `host`, new `branch`, new `agent` if it differs, and its own `eta`.
4. The adopter writes `.crew/node` in its own checkout (`identity.md`) and posts its first entry under the continued numbering, stating that it has adopted the row.

Readers follow automatically: everyone resolves a node's file through the registry's `branch` field, so updating the row redirects them without anyone being told.

**This is also what protects you if the old node wakes up** — and after an offline stretch it will. Its marker still claims the id, but the registry's `branch` no longer matches where it is standing, so its start-of-session cross-check stops it before it writes anything (`identity.md`). Adoption without that check would give you two sessions writing the same channel file from two branches.

Do not adopt a row whose node might still be live. A live node and an adopter sharing one id is the one state the registry cannot represent, and "might still be live" is answered out of band, not from the file.

## Case 2 — the brain moves a task while its holder is working (pre-takeover)

The holder does **not** stop mid-step. It finishes the step it is on, then checks the channel — this is the normal read every node does — and finds the `takeover` entry.

What the outgoing node then does, and nothing more:

1. Commit the work in progress, in whatever state it is, and push it to **its own branch**.
2. Post one `done`-shaped handover entry: what it was doing, where it stopped, the branch and commit SHA, what is left, and anything it knows that the diff does not show.
3. Stop. Set `eta: -` and `holding: none`, and leave the task.

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
