<!-- GENERATED from core/roles/brain.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
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

Before dispatching, check `coordination/nodes.yml`: a node whose heartbeat is stale cannot pick anything up, so dispatching to it buries the task. Reassign per `takeover.md` instead.

## 5 · Review

Whenever there are new commits past your last-reviewed SHA, review the diff itself — not the node's report of it. A node's `done` entry is a claim; the diff is the evidence.

Record what you reviewed (the SHA) in your cursor so the next check starts where this one stopped.

## Periodic checkpoint

The brain is driven by the host's own scheduled-task feature — crew ships no daemon. `templates/checkpoint.md` is the skeleton to fill in with the project's own review list.

Nothing new in the channel and no new commits → say so in one line and stop. An empty checkpoint that writes an entry anyway trains every node to skim the log.
