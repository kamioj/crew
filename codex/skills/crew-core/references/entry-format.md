<!-- GENERATED from core/entry-format.md — edit the core file and run node tools/generate.mjs; hand edits will be overwritten -->
# crew entry format

Every message in the channel is one entry. The header makes it findable and sortable; the body makes it actionable without a follow-up question.

## Header

```
## <ID> · <YYYY-MM-DD HH:MM> · type: <type> · priority: <P0-P3>
```

A reply adds `re:` naming what it answers — one ID, a range, or a short parenthetical for readers:

```
## <ID> · <YYYY-MM-DD HH:MM> · type: <type> · re: <ID or range>
## <ID> · <YYYY-MM-DD HH:MM> · type: answer · re: BE-126 (table mapping) · priority: P1
```

A reply may keep a `priority:` as well when its own asks need one — an answer that also assigns work is still work.

- **ID** — the writer's prefix plus a sequential number, never reused: `BRAIN-012`, `BE-128`, `FE-059`. The prefix identifies the writer, which is what makes a single shared git account workable.
- **Time** — local time, stated once in `coordination/README.md` for the project (e.g. UTC+8).

## Body

A **request** carries these five:

```
**Subject:** one line
**Context:** why — spec section, file, commit SHA
**Ask:** exactly what to do
**Acceptance:** how the requester will verify it — endpoint + fields, a test, a commit, a status row
**Refs:** paths or entry IDs
```

A **reply** carries:

```
**Result:** what changed — files, commit SHA(s), checks run and their outcomes
**Deviations:** anything that differs from the ask, and why (or "none") — on `done` replies
**Refs:** paths or entry IDs
```

**Acceptance is what makes an entry answerable.** An ask without it leaves the doer guessing when they are finished and the asker re-opening the thread; write the observable thing you will check.

These are the minimum, not the ceiling. A substantive entry adds its own bold-labelled sections after them — `**Name changes:**`, `**Checks:**`, `**Retirement:**`, `**Next:**` — one per topic the reader has to act on separately. Labelled topics are what let the other side answer point by point; a single wall of prose gets answered as a whole or not at all.

## Types

**Requests** — `task` (do this) · `contract-change` (an interface or behaviour differs from what was agreed) · `priority` (reorder work) · `question` (needs an answer) · `needs-owner` (the user must decide; see `protocol.md`) · `takeover` (claim or grant a task held by another node; see `takeover.md`) · `fyi` (no action) · `answer` (reply to a question) · `cancel` (withdraw an earlier entry).

**Replies** — `ack` (received and queued, with phase or ETA) · `in-progress` · `done` · `blocked` (say what unblocks it) · `rejected` (why, plus an alternative) · `question` · `answer` · `fyi`.

Any role may open a request; the ID prefix says who did.

## Priorities

- **P0** — blocks the other side right now; it interrupts the current group at the next safe point
- **P1** — next up
- **P2** — normal queue
- **P3** — when convenient

## Processing

Process every entry newer than your cursor, P0 first and then by ID. **Push an `ack` in the same check that you read it**, so the sender knows it was seen rather than inferring from silence — then `done`, `blocked` or `rejected` when the work settles.

Do not write empty receipts. No new entries means no entry.

## Example

```
## BRAIN-012 · 2026-11-13 15:20 · type: task · priority: P1
**Subject:** Add retention index to the audit log table
**Context:** the table has no time index and no retention; see design.md §9.1
**Ask:** add an index on created_at and a retention job keeping 180 days
**Acceptance:** migration committed; a query over a 30-day window uses the index (EXPLAIN output in the done entry)
**Refs:** coordination/nodes.yml row `be-codex`

## BE-131 · 2026-11-13 16:05 · type: done · re: BRAIN-012
**Result:** V61 adds idx_audit_created_at + the retention job; EXPLAIN shows the index used (ref, rows 412); 1612 tests green; commit 9a174477
**Deviations:** retention set to 180 days as asked, but the job runs daily at 03:00 rather than hourly — hourly added no value at this volume
```
