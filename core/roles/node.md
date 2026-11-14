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

Then set `holding` to the task and `eta` to when you expect this step to land (`nodes.md`) — silence past your `eta` is what gets you asked about work that is going fine.

## Report

Write to your own file only, append-only, then push. `done` carries the commit SHA and the checks you actually ran; `blocked` says what would unblock it; `rejected` says why and offers an alternative.

Claims need evidence. "Tests pass" with no command and no count is a claim the brain has to re-run anyway — give it the output.

## Compliance is not progress

An `ack`, a registry row, a pushed entry and a correctly named branch are the cost of being reachable
— they are **not** deliverables, and reporting them as status tells the owner nothing while reading
like progress to anyone skimming. Progress is what the task's `Acceptance` named.

If the acceptance is not met, the honest entry is `in-progress` or `blocked`, not `done`.
See `completion.md`.

## Stay in your lane

Your `lanes` are the files you may change **on your own initiative**. A `task` entry may also name
files outside them — that grant belongs to that task and ends with it, and it is read from the
entry rather than added to your row.

Work you want to do that needs a file nobody granted you goes to its owner as a `task` entry, or to
the brain if no owner is listed. Editing another lane's files uninvited is how two nodes end up with
conflicting work neither can merge.

Large or cross-lane changes wait for a barrier — see `lanes.md`.

## Before you stop

Two things, every session, both cheap:

```bash
git status                                # anything uncommitted?
git log origin/<your-branch>..HEAD        # anything unpushed?
```

**An entry that is not pushed has not been sent.** Nothing watches for it; the brain will read silence as "no progress" and may reassign your task. If the push fails because you are offline, say so in your next session's first entry rather than assuming it went out.

Commit and push work-in-progress to your own branch even when it is unfinished — if your machine dies, everything unpushed is lost, and whoever takes over starts from your last push. Half-finished code on your own branch costs nobody anything; it is never merged by accident, because the taker opens a new branch (`takeover.md`).

Then set `eta: -`, and `holding: none` if you finished, so nobody is left guessing.
