---
name: crew-init
description: Set up a project for crew — create the coordination/ files, settings and registry. Use once per project, before anyone joins.
---
<!-- GENERATED from core/commands/init.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# $crew-init

Creates the four files crew needs in this project. Run it once, on the branch that will belong to the brain.

Already have `coordination/` with hand-written channel files? Do not recreate them — see `setup.md` § Already coordinating by hand.

## 1 · Settings

Write `coordination/README.md` from `templates/channel-readme.md`. Fill in the brain's branch, each node's file and branch, the timezone, the quiet period, and the project's definition of done.

**Make the timeout longer than a node's longest single step.** Too short and a node doing slow work is declared dead while it is still typing.

## 2 · Registry

Write `coordination/nodes.yml` from `templates/nodes.yml`. Keep the brain's row, delete the examples. Other rows arrive when machines run `$crew-node`.

## 3 · The decisions file

`coordination/decisions.md` — standing rulings, so a ruling made two hundred entries ago is still
findable (`protocol.md`). Nodes read it before starting a round.

```markdown
# Decisions

Append-only. Written only by the brain, on branch `<brain-branch>`.
Standing rulings that outlive the entry that announced them.

---
```

## 4 · The brain's channel file

```markdown
# Brain → nodes

Append-only. Written only by the brain, on branch `<brain-branch>`.
Protocol: `coordination/README.md`.

---
```

Node files are created by their own nodes, on their own branches.

## 5 · Point the agents at it

Add one line to the project's `CLAUDE.md` / `AGENTS.md`:

```markdown
Cross-machine coordination runs on crew: read `coordination/README.md` before posting anything.
```

Without it a fresh session edits whatever file looks relevant, and one-writer-per-file cannot survive that.

## 6 · Ignore the identity marker

Add one line to the project's `.gitignore`:

```gitignore
.crew/
```

Each checkout writes its own `.crew/node` at join (`identity.md`). Committing it would hand every
other checkout the same identity.

## 7 · Commit and push

```bash
git add coordination/
git commit -m "crew: init coordination channel"
git push origin <brain-branch>
```

Then run `$crew-leader` to register yourself.
