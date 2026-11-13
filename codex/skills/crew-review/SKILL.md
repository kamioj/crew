---
name: crew-review
description: Brain only — triage new node entries and review new commits since the last reviewed SHA, then post one consolidated entry. Use at each checkpoint.
---
<!-- GENERATED from core/commands/review.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# $crew-review

The brain's recurring pass: read what arrived, look at what landed, answer in one entry.

## 1 · Triage new entries

```bash
git fetch origin
git show origin/<node-branch>:coordination/<node-file>.md
```

One per node you have counterparts on. Process everything past your cursor, P0 first then by ID, and give each entry exactly one outcome: `ack` (queued), `answer` (it asked something), `done`/`rejected` (settled now), or a `needs-owner` relay (the user's call).

A question you can settle by reading the repository is answered, not escalated.

## 2 · Review the diff, not the report

```bash
git log --oneline <last-reviewed-sha>..origin/<node-branch>
git diff <last-reviewed-sha>..origin/<node-branch>
```

A `done` entry is a claim; the diff is the evidence. Review the active lane branches too, not just the integration branch — problems are cheaper to raise before a merge.

What to check is project-specific and belongs in the project's own checkpoint prompt (`templates/checkpoint.md`), not here.

## 3 · Post one entry

One consolidated entry per pass, with the asks ranked. Separate topics get their own bold-labelled sections (`entry-format.md`) so the node can answer point by point.

Nothing new in the channel and no new commits → **write nothing**, and say so to the user in one line. An empty checkpoint that posts an entry anyway trains every node to skim the log.

## 4 · Advance the cursor

Record the last entry ID you processed per node and the last commit SHA you reviewed. The cursor is private to you — it is not written to the channel.
