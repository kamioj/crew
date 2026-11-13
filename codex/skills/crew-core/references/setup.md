<!-- GENERATED from core/setup.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# Setting up a project for crew

crew is generic; everything specific to your project lives in your project's repository. Setup creates four files there, all under `coordination/`.

Do this once, on the brain's branch.

## Prerequisites — check these before adopting

1. **Every node can push to one shared remote.** The push *is* the delivery, so a session that
   never pushes cannot participate at all — not partially, at all. A node under a constraint that
   forbids pushing (a sandbox, a review-only machine, a policy against publishing work in progress)
   has to coordinate some other way; crew has nothing to offer it. Find this out now rather than
   half-way through adoption.
2. **Every node has its own checkout or worktree.** One checkout is one node (`identity.md`); two
   sessions sharing a checkout both resolve to the same row and nothing can tell them apart.
3. **A definition of done exists, or the owner will write one.** Without it the brain's checkpoint
   never terminates (`completion.md`).

## 1 · `coordination/README.md` — the project's own channel settings

Copy `templates/channel-readme.md` and fill in: the brain's branch, each node's file and branch, the timezone, and the heartbeat timeout. This is the file every node reads first, so the values that differ per project live here rather than in the protocol.

**Set the heartbeat timeout longer than a node's longest single step.** Too short and a node doing slow work gets declared dead while it is still typing.

## 2 · `coordination/nodes.yml` — the registry

Copy `templates/nodes.yml`, keep the brain's row, delete the examples. Each node adds its own row with `$crew-join`; you do not pre-create rows for machines that have not joined.

## 3 · `coordination/brain-to-nodes.md` — the brain's channel file

```markdown
# Brain → nodes

Append-only. Written only by the brain, on branch `<brain-branch>`.
Protocol: `coordination/README.md`.

---
```

## 4 · One file per node

Each node's file is created by that node, on its own branch, with the same header naming itself as the only writer. A node that has not joined has no file — that is fine.

## 5 · Ignore the identity marker

```gitignore
.crew/
```

Each checkout writes its own `.crew/node` at join (`identity.md`); committing it would hand every
other checkout the same identity.

## 6 · Point the agents at the protocol

Add a line to the project's `CLAUDE.md` / `AGENTS.md`:

```markdown
Cross-machine coordination runs on crew: read `coordination/README.md` before posting anything.
```

Without it, a fresh session edits whatever file looks relevant, and one-writer-per-file is the rule that cannot survive that.

## Already coordinating by hand?

Projects that already pass entries through git files keep them. Point `coordination/README.md` at the existing files and branches, keep the existing ID prefixes, and add `nodes.yml` — the registry and takeover are the parts crew adds. Do not renumber or rewrite existing entries: they are append-only, and rewriting them destroys the record of what each side knew at the time.
