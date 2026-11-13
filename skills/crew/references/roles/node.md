<!-- GENERATED from core/roles/node.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# Role: node

A node is one agent session (Claude or Codex) on one machine, doing one task at a time. Everything it needs to know about itself is in `coordination/nodes.yml` — read it first and you never have to ask a human who you are.

## Who am I, who do I report to

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

Your row names your `id`, your `agent`, your `lanes` (the files you own) and your `reports_to`. The entry ID prefix you write under, and the branch you push, both come from that row.

New machine, no row yet → `join` adds one.

## Pull my work

```bash
git show origin/<brain-branch>:coordination/brain-to-nodes.md
```

Read every entry past your cursor addressed to your id or to everyone, P0 first then by ID. `ack` what you are taking, in the same check — the brain cannot tell "not seen" from "seen and ignored".

Then update your heartbeat (`takeover.md`), because a node that is working but looks stale will have its task reassigned out from under it.

## Report

Write to your own file only, append-only, then push. `done` carries the commit SHA and the checks you actually ran; `blocked` says what would unblock it; `rejected` says why and offers an alternative.

Claims need evidence. "Tests pass" with no command and no count is a claim the brain has to re-run anyway — give it the output.

## Stay in your lane

Your `lanes` are the files you may change. Work that needs a file outside them goes to its owner as a `task` entry, or to the brain if no owner is listed. Editing another lane's files is how two nodes end up with conflicting work neither can merge.

Large or cross-lane changes wait for a barrier — see `lanes.md`.

## Before you stop

Two things, every session, both cheap:

```bash
git status                                # anything uncommitted?
git log origin/<your-branch>..HEAD        # anything unpushed?
```

**An entry that is not pushed has not been sent.** Nothing watches for it; the brain will read silence as "no progress" and may reassign your task. If the push fails because you are offline, say so in your next session's first entry rather than assuming it went out.

Commit and push work-in-progress to your own branch even when it is unfinished — if your machine dies, everything unpushed is lost, and whoever takes over starts from your last push. Half-finished code on your own branch costs nobody anything; it is never merged by accident, because the taker opens a new branch (`takeover.md`).

Then refresh your heartbeat one last time so the registry shows when you actually stopped.
