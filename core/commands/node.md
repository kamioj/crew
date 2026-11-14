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

**Already have one** (same `id`) → you are resuming an identity: confirm `host`, `branch` and `lanes` still match reality, and set `eta` when you start a step.

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

## 4 · Environment precheck

Run every check before taking any work. In the field, eight parallel lanes all failed their first
round on environment, not on coordination — the shell named in the project's instructions resolved
to a stub, a deny-ACL on the worktree's `.git` rejected commits, the build tool's local cache sat
in a directory the sandbox could not traverse, and temp directories were shared between lanes.

**Run every one of them as the identity the agent actually runs as** — not as you. A sandboxed or
service account can lack traverse permission on one component of a path that reads perfectly for a
human, and that is not a permissions error you will reproduce by checking it yourself.

```bash
whoami                                                     # the identity everything below runs as
git ls-remote origin -h >/dev/null && echo "remote: OK"    # the push IS the delivery
git -C . commit --allow-empty -m "crew: precheck" && git reset --soft HEAD~1 && echo "git write: OK"
<the shell your project's instructions name> --version     # resolves to the real thing, not a stub
<your build tool> --version                                # and its cache is reachable from here
ls <the build tool's local cache path> >/dev/null && echo "cache: traversable"
touch <your agent's own state dir>/.crew-probe && rm "$_" && echo "state dir: writable"
echo "$TMPDIR / %TEMP%"                                    # not shared with another node
```

| Check | Why this one |
|---|---|
| remote reachable | a node that cannot push cannot send anything |
| **a commit actually succeeds** | directory ACLs reject writes while every read looks fine, and tools report success without changing anything |
| the named shell resolves | an alias or stub passes `which` and fails on use |
| build tool + its cache | an unreachable cache turns every task into a download that a sandbox then blocks |
| **the cache path is traversable** | the failure is a missing `+x` on one parent directory, not an unreadable cache — it reads fine as you and not as the agent |
| **the agent's own state dir is writable** | a runtime that cannot record its own state reports stale or invented status, and that status is what others plan against |
| temp directory is yours | two nodes sharing one temp path corrupt each other's runs |

**A failed check means do not take work** — report it as a `blocked` entry naming the check. A node
that joins and then fails on first contact costs a full dispatch round plus the diagnosis; the
precheck costs a minute.

## 5 · Report

Four lines to the user: your `id` and `agent`; your lanes; what you may decide and who answers the rest; who you report to. Then `/crew:next` picks up work.

What the role commits you to is in `roles/node.md`.
