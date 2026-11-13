---
name: crew
description: Cross-device multi-agent coordination over git. Load this skill when working in a project that has a coordination/nodes.yml or coordination/README.md naming crew, when the user asks how nodes coordinate, hands work to another machine, takes over a stalled session, or invokes a /crew:x command. Teaches the channel protocol, entry format, brain and node roles, the node registry, takeover, lanes and barriers.
---
<!-- GENERATED from core/skill.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# crew — cross-device agent coordination

One **brain** directs any number of **nodes** (Claude or Codex sessions) on any number of machines. They coordinate through the project's git repository and nothing else: no hosting-platform API, no issues, no webhooks, no daemon. Anything git can reach works — GitHub, a self-hosted GitLab, a bare remote.

crew is a set of conventions, not a program. There is nothing to install in the project beyond four files under `coordination/`, and nothing running in the background.

## The one rule everything rests on

**A message is delivered only when its commit is pushed.** Writing an entry is not sending it. Nothing watches, nothing notifies — the other side reads on its next check, and only sees what reached the remote.

## How it fits together

The files below live in this skill's `references/`; read the one you need rather than all of them.

| Piece | File | What it carries |
|---|---|---|
| Channel | `protocol.md` | one writer per file, each on its own branch; how to read and write; the safety rules |
| Messages | `entry-format.md` | entry header, body fields, types, priorities |
| Brain | `roles/brain.md` | triage, decide, publish conventions, dispatch, review |
| Node | `roles/node.md` | find your identity, pull work, report, stay in lane, push before you stop |
| Identity | `identity.md` | which row this session is — the `.crew/node` marker, the branch cross-check, one checkout one node |
| Registry | `nodes.md` | `coordination/nodes.yml` — who exists, which files they own, who they report to, heartbeats |
| Takeover | `takeover.md` | stale nodes, deliberate handover, adopting a dead node's row, why the taker always opens a new branch |
| Lanes | `lanes.md` | file ownership, what a task may additionally grant, barriers for sweeping changes |
| Completion | `completion.md` | the project's definition of done, who declares it, why compliance is not progress |
| Setup | `setup.md` | the four files to create in a project |

## Commands

**Joining** — `/crew:init` set the project up (once) · `/crew:leader` take the brain role · `/crew:node` take a node role · `/crew:exit` retire this machine

**Working** — `/crew:load` pull the whole picture, take nothing · `/crew:next` read your unread and take one task · `/crew:new` create and dispatch a task (brain) · `/crew:report` post an entry · `/crew:cancel` withdraw a task · `/crew:takeover` request or grant a takeover

**Watching** — `/crew:review` triage entries and review new commits (brain) · `/crew:board` fold the log into current task state

| Command | Who | What |
|---|---|---|
| `/crew:init` | setup | create the four `coordination/` files in a project |
| `/crew:leader` | brain | claim the brain role and register it |
| `/crew:node` | node | register this machine; learn your lanes and reporting target |
| `/crew:exit` | node | hand back work, push everything, remove your own row |
| `/crew:load` | any | settings, registry, unread, stale nodes — read-only |
| `/crew:next` | node | read unread, refresh heartbeat, surface stale nodes, take one task |
| `/crew:new` | brain | create a task and assign it |
| `/crew:report` | node | write an entry to your own file and push it |
| `/crew:cancel` | brain | withdraw a dispatched task |
| `/crew:takeover` | any | request (node) or grant (brain) a takeover |
| `/crew:review` | brain | triage new entries, review new commits, post one consolidated entry |
| `/crew:board` | any | fold the entries into current task state; show what waits on the user and who is stale |

## Scheduling

The brain is driven by the host's own scheduled-task feature — crew ships no daemon and no wake-up mechanism. `templates/checkpoint.md` is the prompt skeleton; fill in the project's own review list.

Nodes are opened by a person. Everything a node needs to resume is in the repository, so opening a session months later costs one `git fetch`.

## What crew does not do

No scripts, no hooks, no platform API wrappers, no board service, no auto-wakeup. That is deliberate: the protocol has to hold for Claude and Codex, on Windows and Unix, online and offline, and every mechanism added is a mechanism that can be missing on one of them.

The cost is that nothing enforces the rules. **"Forgot to push" has no backstop** — which is why both the node role and `/crew:report` end with the same two commands, and why a project that finds the rule genuinely being violated should add a pre-push check of its own rather than change the protocol.
