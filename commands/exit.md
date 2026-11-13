---
description: Leave the crew — hand back any task in hand, remove your own row from the registry, and push everything before you go. Use when a machine is retiring from a project.
allowed-tools: Read, Edit, Bash(git:*)
---
<!-- GENERATED from core/commands/exit.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# /crew:exit

Retires this node. This is the planned departure — for a node that vanished without doing it, see `/crew:takeover`.

## 1 · Hand back what you hold

Holding a task → post a handover entry first (`/crew:report`, shape in the `takeover` reference): where you stopped, the branch and commit, what is left, and the **Notes** field — the intent the diff cannot show.

Leaving without it strands the task: the brain sees a row disappear and has no idea how far the work got.

## 2 · Push everything

```bash
git status
git log origin/<your-branch>..HEAD
```

Both must come back clean. Anything unpushed dies with this machine — your branch is the only copy, and whoever picks the work up starts from your last push.

## 3 · Remove your row

Delete **your own row** from `coordination/nodes.yml`, nothing else.

```bash
git add coordination/nodes.yml
git commit -m "crew: exit <id>"
git push origin <your-branch>
```

Delete `.crew/node` in this checkout too, so a later session here does not resolve to a row that
no longer exists.

Your channel file stays. It is the record of what you did and other nodes still reference its entry IDs — deleting it would break every `re:` pointing at it.

## 4 · Tell the brain

A `fyi` entry naming your id, the branch you leave behind, and anything unfinished. The brain needs it to move your lanes to another node.

Stepping away temporarily rather than retiring → do not exit. Just stop; a stale heartbeat already says you are not working, and your row keeps your lanes reserved.
