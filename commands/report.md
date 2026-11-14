---
description: Write an entry to this node's own channel file and push it — done, blocked, question, handover or any other type. Use when finishing work, hitting a blocker, or handing a task over.
allowed-tools: Read, Bash(git:*), Edit
---
<!-- GENERATED from core/commands/report.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->

# /crew:report

Sends a message. Writing it is not sending it — the push is.

## 1 · Write the entry

Append to **your own** file only (`coordination/<your-id>-to-<target>.md`), never anyone else's. Format and types: `entry-format.md`.

The ID is your prefix plus the next number. Never reuse one, never rewrite an earlier entry — a correction is a new entry that references the old ID.

A `done` entry carries the commit SHA and the checks you actually ran, with their output. "Tests pass" with no command and no count is a claim the brain has to re-run.

Handing a task over → use the handover shape in the `takeover` reference, and fill in **Notes**: what you were about to do and which approaches you already discarded. The diff cannot show that, and without it the taker repeats your dead ends.

## 2 · Clear your holding

Posting `done`, `blocked` or a handover → set `holding: none` on your registry row in the same push.
A row still claiming a finished task makes the next person reason it out by hand, and makes a later
later silence look like a mid-task failure.

## 3 · Commit and push

```bash
git add coordination/<your-file>.md
git commit -m "coord: <ID> <one-line subject>"
git push origin <your-branch>
```

Unrelated work in progress → commit only the coordination file:

```bash
git commit -- coordination/<your-file>.md
```

## 4 · Confirm it left

```bash
git log origin/<your-branch>..HEAD
```

Empty means it is delivered. Anything listed is still only on your machine, and nobody will ever see it.

Push failed because you are offline → say so in your next session's first entry. Do not assume it went out.
