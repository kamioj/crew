<!-- GENERATED from core/identity.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# Which node am I?

A machine is not a node. One machine commonly hosts many checkouts — a real project was found running 19 worktrees of the same repository at once — and the directory name is no help either, because a worktree directory and the branch it holds often have unrelated names.

**The unit of identity is the checkout, and the name of that identity is the `id` in `coordination/nodes.yml`.** Everything else — host, directory, agent — is a label.

## The marker

`$crew-node` and `$crew-leader` write a marker in the checkout they ran in:

```
.crew/node
```
```yaml
id: be-codex
registered: 2026-11-13
```

It is **git-ignored**: it describes this checkout, not the project, and pushing it would hand every other checkout the same identity.

Add it to the project's `.gitignore` during `$crew-init`:

```gitignore
.crew/
```

## Resolving identity at the start of a session

1. Read `.crew/node`. Missing → this checkout has not joined; run `$crew-node` (or `$crew-leader`) and stop.
2. Look the `id` up in `coordination/nodes.yml`. Not there → the row was removed, by an `$crew-exit` or an adoption; **stop and ask** rather than recreating it, because recreating a row someone deliberately retired resurrects a lane that has since moved.
3. Cross-check the branch:

```bash
git branch --show-current
```

| Current branch | Meaning |
|---|---|
| equals the row's `branch` | normal — proceed |
| a branch you created from it for a task (e.g. `be-codex/wp7-r2`) | normal — proceed, and say which task branch you are on |
| anything else | **stop** |

The third case is the one worth having. It fires when you opened the wrong worktree, and — more usefully — when **another session has adopted your id** and moved the row's `branch` on: the marker still says `be-codex`, the registry no longer points where you are, and you find out before writing anything. See `takeover.md` § Row adoption.

## Reporting it

Say it out loud at the start of the session, in one line, before doing anything else:

```
node be-codex · branch codex/backend-implementation · lanes backend/**, deploy/** · reports to lead
```

A session that never states which node it is leaves the user guessing which of four machines they are talking to.

## Picking a different identity

`$crew-node <id>` sets the marker to an existing row explicitly — use it when one checkout changes hands, or when `$crew-load` showed you the roster and you want a specific row.

`$crew-load` lists every row with what it holds, so "which node should I be" is answerable before you choose.

## The limit

**One checkout, one node, one session at a time.** Two sessions open in the same checkout read the same marker, so both believe they are the same node — they will both write that node's entries and both edit its row, and nothing in the registry can tell them apart. Give each node its own checkout or worktree; that is cheap, and it is what makes the rest of the protocol hold.
