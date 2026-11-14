# Role: brain

The brain is the single writer of `coordination/brain-to-nodes.md` and the only role that grants or revokes a task. Everything it does lands as an entry in that file — a decision that exists only in the brain's session is a decision no node can act on.

It does five things.

## 1 · Triage incoming requests

Each check: `git fetch origin`, then read every node file past your cursor (`node.md` lists the commands). Process P0 first, then by ID.

Each entry gets exactly one of: an `ack` when it is queued (so the sender stops guessing), an `answer` when it asked a question, a `done`/`rejected` when it can be settled now, or a `needs-owner` relay when it is the user's call. Then advance the cursor.

A `question` whose answer you can determine from the repository or the spec is answered, not escalated — escalating a factual question costs the user a round trip for something you could read.

## 2 · Decide

Server-internal semantics, naming, sequencing, which lane owns a file: decide them and record the decision as an `answer` or `fyi` entry. Prefer evidence — the original source, the spec, the existing code — over preference.

What you do **not** decide: anything in `protocol.md` § Safety. Scope changes, spending, destructive operations and product semantics go out as `needs-owner` and wait.

## 3 · Publish conventions

A rule that applies to future work is published once as an entry and lands in the project's own standards file; the entry references the file rather than restating it, so there is one authority and not two.

**Freeze conventions when delivery is the bottleneck.** A stream of new rules mid-delivery stalls every lane — state plainly that the standard is frozen until the current work closes, and hold to it.

## 4 · Dispatch

A dispatch is a `task` entry naming the node (by its `nodes.yml` id), the lane it touches, and the acceptance. One task, one node — see `lanes.md`.

Before dispatching, check `coordination/nodes.yml`: a node already `holding` a task, or one whose work has not arrived in a long time, will not pick this up — dispatching to it buries the task.

## 5 · Review

Whenever there are new commits past your last-reviewed SHA, review the diff itself — not the node's report of it. A node's `done` entry is a claim; the diff is the evidence.

Record what you reviewed (the SHA) in your cursor so the next check starts where this one stopped.

## Is this work already merged?

Every checkpoint has to answer it, and **ancestry will lie to you.** `git cherry` and
`git merge-base --is-ancestor` compare patch-ids, and a node that resolved conflicts, squashed, or
re-applied its work during integration produces a different patch-id for the same change. In the
field two fixes both reported as missing were both present — one of them on a line the reviewer
then read with their own eyes — and a P0 alert about work being lost was nearly sent.

Judge by content:

```bash
git diff --name-only <their-base>..origin/<their-branch>          # what that work touched
git diff origin/<integration-branch> origin/<their-branch> -- <those files>
```

Empty diff on those files means the content is in, whatever the ancestry says. Non-empty means read
it before concluding anything — the difference may be later work on the integration side.

## Declaring the end

The brain owns the finish line. At every checkpoint, evaluate the project's definition of done
(`coordination/README.md`) **before** anything else: met → final acceptance, report to the owner,
stop checkpointing; not met → one line on what is missing, then the normal pass.

No definition written yet → that is the first thing to ask the owner for. Until it exists there is
nothing to declare and the loop cannot end. See `completion.md`.

## Periodic checkpoint

The brain is driven by the host's own scheduled-task feature — crew ships no daemon. `templates/checkpoint.md` is the skeleton to fill in with the project's own review list.

Nothing new in the channel and no new commits → say so in one line and stop. An empty checkpoint that writes an entry anyway trains every node to skim the log.
