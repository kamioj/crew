---
description: Register this session as a worker node — add or refresh your row in the registry and learn your lanes and reporting target. Use when joining a project from a machine, or starting a session on one you already joined.
allowed-tools: Read, Edit, Write, Bash(git:*)
---

# /crew:node

Registers this session as a node and tells you where you fit.

## 1 · Read the registry

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml
```

The brain's branch is named in `coordination/README.md`. No `coordination/` → this project is not set up for crew; run `/crew:init`.

## 2 · Your row

**Already have one** (same `id`) → you are resuming an identity: refresh `heartbeat`, confirm `host`, `branch` and `lanes` still match reality, done.

**New** → add a row. Pick an `id` that says what you are (`be-codex`, `fe-claude`, `liaison`) and fill every field in `nodes.md`.

Lanes you are not certain about: leave them out and ask the brain with `/crew:report`. Claiming a lane another node owns is the one conflict git cannot resolve for you — both branches edit the same file and every merge is manual.

**Edit only your own row.**

```bash
git add coordination/nodes.yml
git commit -m "crew: node <id>"
git push origin <your-branch>
```

## 3 · Mark this checkout

Write `.crew/node` here so later sessions in this checkout know who they are (`identity.md`):

```yaml
id: <your-id>
registered: <YYYY-MM-DD>
```

It is git-ignored on purpose — it describes this checkout, not the project. `/crew:init` adds
`.crew/` to `.gitignore`; if this project predates that, add it now.

Without the marker a new session here cannot tell which registry row is its own, and a machine
running several worktrees has no other way to distinguish them.

## 4 · Check you can actually reach the remote

```bash
git ls-remote origin -h >/dev/null && echo "remote OK"
```

The push is the delivery, so a node that cannot push cannot send anything. Fix this before taking work.

## 5 · Report

Three lines to the user: your `id` and `agent`; your lanes; who you report to. Then `/crew:next` picks up work.

What the role commits you to is in `roles/node.md`.
