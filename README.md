# crew

Cross-device multi-agent coordination over git.

One **brain** directs any number of **nodes** — Claude Code or Codex CLI sessions — on any number of machines. They coordinate through the project's git repository and nothing else: no hosting-platform API, no issues, no webhooks, no daemon. Anything git can reach works, so GitHub and a self-hosted GitLab behave identically.

**A message is delivered only when its commit is pushed.** Everything else follows from that.

## What it is

A set of conventions, shipped as a plugin for both hosts. There is nothing running in the background and nothing to install in your project beyond four files under `coordination/`:

```
coordination/
├── README.md            this project's settings: branches, timezone, heartbeat timeout
├── nodes.yml            the registry: who exists, which files they own, who they report to
├── brain-to-nodes.md    the brain's channel file (append-only, one writer)
└── <node-id>-to-brain.md  one per node (append-only, one writer each)
```

## How it works

- **One writer per file, each on its own branch.** Two sides never push the same branch, so there are no push races and the files cannot conflict when branches merge. This is also what makes a single shared git account workable — the entry ID prefix says who wrote it, not the commit author.
- **Read with `git show origin/<branch>:<file>`** — never check out or merge the other side's branch just to read it.
- **Append-only.** A correction is a new entry referencing the old ID. The log is the audit trail.
- **Lanes** are file ownership, declared as globs in each node's registry row. One task, one node. Sweeping changes wait for a declared **barrier**.
- **Heartbeats** are a timestamp each node writes in its own registry row when a session opens and closes. A stale row makes "that session died" visible to anyone who fetches.
- **Takeover** moves a task off a stale or reassigned node. The outgoing node commits, pushes to its own branch, writes a handover entry, and stops — it does not resolve conflicts. The taker opens a **new** branch, which is why a late push from the outgoing node is harmless.

## Commands

**Joining** — `/crew:init` · `/crew:leader` · `/crew:node` · `/crew:exit`
**Working** — `/crew:load` · `/crew:next` · `/crew:new` · `/crew:report` · `/crew:cancel` · `/crew:takeover`
**Watching** — `/crew:review` · `/crew:board`

On Codex the same commands are skills: `$crew-next`, `$crew-report`, and so on.

## Install

```bash
# Claude Code
claude plugin marketplace add <this-repo>
claude plugin install crew@crew

# Codex CLI
codex plugin marketplace add <this-repo>
codex plugin install crew@crew
```

Then, in your project: `/crew:init` once, `/crew:leader` on the coordinating session, `/crew:node` on every other machine.

## Scheduling

The brain runs on a schedule you already have — the host's own scheduled-task feature, cron, Task Scheduler. crew ships no daemon and no wake-up mechanism; `templates/checkpoint.md` is the prompt skeleton to fill in with your project's review list.

Nodes are opened by a person. Everything a node needs to resume lives in the repository, so a session months later costs one `git fetch`.

## What it deliberately does not do

No scripts, no hooks, no platform API wrappers, no board service, no auto-wakeup. The protocol has to hold for Claude and Codex, on Windows and Unix, online and offline — every mechanism added is a mechanism that can be missing on one of them.

The cost is that nothing enforces the rules. **"Forgot to push" has no backstop.** A project that finds the rule genuinely being violated should add a pre-push check of its own rather than change the protocol.

## Developing

All shipped markdown is generated from `core/`:

```bash
node tools/generate.mjs           # write both trees
node tools/generate.mjs --check   # non-zero if a tree is stale or hand-edited
```

Edit `core/`, never the generated trees. Host-divergent passages use paired `<!-- host:claude -->` / `<!-- host:codex -->` markers.

[中文说明](README_cn.md)
