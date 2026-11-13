<!-- GENERATED from core/lanes.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# Lanes and barriers

## One task, one node

A task has exactly one holder at a time. The holder is recorded where the task was dispatched — the brain's `task` entry — and changes only through `takeover.md`.

## Lanes are file ownership

A lane is a set of glob patterns in a node's `nodes.yml` row, drawn along module boundaries because that is where work actually separates — `backend/**` and `frontend/**` can both be in flight without either node reading the other's diff.

```yaml
lanes: ["backend/**", "deploy/**"]
```

**A lane is what you may change on your own initiative — not the limit of what a task can ask of
you.** Dispatches cross that line constantly: a node owning `frontend/src/**` gets a task that also
needs `frontend/mocks/**`, which the brain owns.

So a `task` entry may name files outside the holder's lanes, and that grant is **scoped to the
task** — read from the entry, expiring when the task closes, never written into the registry where
it would rot as a standing permission. A dispatcher can only grant reach into lanes it owns itself;
files owned by a third node go to that node as its own entry.

Outside a task that names them, those files are not yours. Ask.

### Telling the two cases apart — this is the hard part

| What you observe | What it means | What to do |
|---|---|---|
| The same kind of file keeps appearing in this node's tasks | **the lane is drawn wrong** | widen the lane (a registry change, the brain's call) |
| This one task happens to need a file, for reasons particular to it | genuine one-off reach | name it in the task entry |

The failure mode is reading the first as the second. A node whose job is "change the behaviour,
update its mocks, add the tests" owns the mocks — they are part of the work, not an exception to
it — and a node that asks permission for them every time is paying a toll on its own lane.
Granting it per task, or worse writing a standing exception into the registry, hides a mis-drawn
lane behind a permission that then rots.

Rule of thumb: **if you are about to grant the same file twice, fix the lane instead.**

**Lanes must not overlap.** Two nodes owning the same file is the one situation git cannot resolve for you: both branches edit it, both are "right", and the merge is manual every time. When a new task needs a file that belongs to someone else:

- ask its owner with a `task` entry, or
- ask the brain to move the file between lanes (a `nodes.yml` change, which is the brain's call), or
- wait for a barrier if the change is large.

An unowned file — matched by nobody's lanes — belongs to the brain by default. Claim it explicitly before working on it rather than assuming.

## Barriers

Some changes cannot be made inside a lane: a rename that touches every module, a package move, a schema migration that invalidates everyone's working copy. Done piecemeal, each node rebases onto a tree that no longer matches what it started from.

A **barrier** is a point where in-flight work stops, one node executes the sweeping change alone, and everyone resumes from the result.

Declaring one:

```
## <ID> · <time> · type: task · priority: P1
**Subject:** Barrier — table rename, executed at WP-0.6
**Context:** 114 tables renamed; every mapper and migration is affected
**Ask:** no node merges to the integration branch between <start condition> and <end condition>;
         <node-id> executes the rename as one commit; everyone rebases after
**Acceptance:** rename commit on <branch>; each node confirms its lane builds after rebasing
```

What a barrier declaration must state:

1. **The entry condition** — what must land first. "After the in-flight packages close", not "soon".
2. **Who executes it** — one node. A barrier run by two nodes is not a barrier.
3. **The release condition** — what everyone does afterwards, and how they confirm it worked.

Nodes approaching a declared barrier push what they have and hold. They do not start work that the barrier would invalidate.

**Barriers are expensive — every node idles through one.** Batch sweeping changes into as few as possible rather than declaring one per rename.
