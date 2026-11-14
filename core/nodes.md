# Node registry — `coordination/nodes.yml`

One row per node, in the project repository, on the brain's branch. It answers the three questions a node has when a session opens: who am I, which files are mine, who do I report to — without asking a human.

It is also where each node records what it expects next (`eta`) and what it is on (`holding`) — the two things nobody else can derive from git.

A row is an identity, not a machine: one machine often runs many checkouts, so what binds a session to its row is the `.crew/node` marker in that checkout, cross-checked against `branch`. See `identity.md`.

## Format

```yaml
# coordination/nodes.yml
timezone: UTC+8          # how timestamps in this file and in entries are read

nodes:
  - id: brain            # entry prefix and the name dispatches address
    holding: none        # volatile fields first - see "Reading one field" below
    eta: -                # when the current step is expected to land
    host: desktop-win    # which machine — a label, never a path
    agent: claude        # claude | codex | other
    role: brain          # brain | node
    skills: [review, architecture, scheduling]
    lanes: ["coordination/**", "docs/architecture/**"]
    branch: jw/lead
    decides: [conventions, scope, interfaces between lanes]
    escalates_to: owner  # who answers what this node cannot decide
    reports_to: owner    # the user

  - id: be-codex
    holding: BRAIN-012
    eta: 2026-11-14 16:40
    host: workstation-01
    agent: codex
    role: node
    skills: [java, spring, mysql]
    lanes: ["backend/**", "deploy/**"]
    branch: codex/backend-implementation
    decides: [internal design within its lanes, test strategy]
    escalates_to: owner  # not necessarily the same as reports_to
    reports_to: brain
```

| Field | Meaning |
|---|---|
| `id` | entry-ID prefix and dispatch address; unique, never reused |
| `holding` | the task id this node is working on, or `none` |
| `eta` | when this node expects its current step to land, or `-` |
| `host` | which machine, as a label — not a filesystem path (`protocol.md` § Safety) |
| `agent` | `claude`, `codex`, or whatever runs there |
| `role` | `brain` or `node` |
| `skills` | what it can be given — the brain reads this when choosing a node |
| `lanes` | glob patterns of the files this node owns (`lanes.md`) |
| `branch` | the branch it pushes; its channel file lives here too |
| `decides` | what this node settles on its own, without asking |
| `escalates_to` | who answers what it cannot decide — not necessarily `reports_to` |
| `reports_to` | the id it sends entries to; `owner` means the user |

## Who writes it

**Every node edits its own row and nothing else.** This is the one file with more than one writer, so the rule is what keeps it mergeable: two nodes touching two different rows produce either a clean merge or a plain text conflict you resolve by keeping both rows. A node that edits someone else's row can silently change who owns a lane.

Adding a row and removing one are the same operation — one row, your own.

### Reading one field

`holding` and `eta` are the two fields that change constantly, so they sit directly under
`id`: the churn stays in one predictable place in every diff, and the fields you reach for most
are the first ones you meet.

**Do not pull a single field out with a line range.** A range ending at a field name silently
returns nothing for anything ordered after that delimiter — in the field this produced an empty
field value that was pushed empty before anyone noticed. Read the whole row and take the value from it, or
parse the file as YAML. Key order carries no meaning in YAML, so a row written in any order is
still valid; the order here is for the humans and the diffs.

### Editing it from another branch

The file lives on the brain's branch, but every node edits it, so the sequence matters:

```bash
git fetch origin
git show origin/<brain-branch>:coordination/nodes.yml > coordination/nodes.yml
# edit YOUR row only
git add coordination/nodes.yml
git commit -m "crew: <id> eta"
git push origin <your-branch>
```

The brain then merges the row in. Two nodes touching two different rows merge cleanly; the worst
case is a plain text conflict you resolve by keeping both rows.

**The brain must push the registry before any node can join.** A node that fetches before the
first registry commit exists finds nothing to copy and stalls there with no way to tell whether it
is early or misconfigured — so `/crew:init` pushes `coordination/` as its last step, and nodes join
after.

Changing another node's `lanes` or `reports_to` is the brain's call: post a `task` entry asking for it.

## Decides

`lanes` says which files you may change. `decides` says **which questions you may answer** — they
are different, and leaving the second one unwritten has a predictable failure: a node that does not
know what it may settle escalates everything, including decisions entirely inside its own module.
In the field a node sent an in-module design choice to a peer for approval, which neither needed nor
had the authority to give.

Write it as the kind of question, not a list of cases: `internal design within its lanes`,
`test strategy`, `conventions`, `scope`. A node reads its row and knows whether a question is its
own to close.

Anything in `protocol.md` § Safety stays the owner's regardless of what this field says — scope
changes, spending, destructive operations, product semantics. `decides` cannot grant those, and a
row claiming them does not make them granted.

### And who answers the rest

`escalates_to` is the other half, and leaving it unwritten fails quietly: **a node that does not
know who its approver is will pick one, and it tends to pick whoever wrote the standards.** In the
field a node sent an in-module design decision to the session that authored the repository's
conventions — the most authoritative-looking party, and not its approver, which was the owner.

It is often the same id as `reports_to`, and it is written anyway, because the case where they
differ is exactly the case nobody notices: your work is reported to the brain, while the decision
you are stuck on belongs to the owner.

## Reconcile your own row

Before anything else in a session, check your **own** row against what is actually happening on
this machine. You are standing on it — this needs no inference and no permission:

- `holding` names a task you are not working on → a previous session ended without clearing it.
  Clear it, or pick the task up deliberately.
- `eta` is in the past and nothing is running → set it to `-`.
- `branch` does not match where you are → stop; see `identity.md`.

**A record and a process on the same machine are checkable, so check them.** In the field a job
board showed four lanes `running` whose processes were long dead, and the operator correcting it by
hand marked a live lane cancelled and had to restore it — all on one machine, all verifiable, none
verified. A row left claiming a task after a crash is the most common case, and it is the one that
makes someone else reason remotely about something you could have settled by looking.

This is the half of liveness that works. The other half — is some *other* node still working —
cannot be settled this way at all (`takeover.md`).

## Holding

Set `holding` to the task id when you `ack` a task, back to `none` when you post its `done`,
`blocked` or handover. Two lines of bookkeeping, and they are what makes takeover mechanical:

| | `holding: none` | `holding: <task>` |
|---|---|---|
| **before `eta`** | idle — dispatch to it | working — leave it alone |
| **past `eta`** | nothing is waiting on it — note it | **ask the node; see `takeover.md`** |

Without `holding`, every quiet row has to be reasoned about by hand: a node idle for two hours needs
no takeover, and one grinding through a 45-minute suite is indistinguishable from one doing nothing.

The entries remain authoritative: `holding` is a pointer for triage, not the record. When the two
disagree, the channel wins and the row is stale bookkeeping — `/crew:board` folds the log and will
say so.

## ETA

Set `eta` before starting a step that will take a while; set it to `-` when you are not mid-step.
It is a forward declaration, and it is the one liveness-related fact git cannot derive: the branch
tip already says when your work last arrived, but only you know when the next piece is due.

Silence before your `eta` needs no explanation. Silence after it is what invites a question — so an
`eta` you do not update is how you get asked about work that is going fine.

**It is not a deadline and it is not a promise.** Overrunning it is normal; what matters is that
someone then asks rather than guesses. If a step is going to run far past, update the field — that
is cheaper than answering the question later.

Liveness itself is never read from this file (`takeover.md`): the evidence is
`git log -1 --format=%ci origin/<their-branch>`, and even that only proves a push once succeeded.
crew carried a written `heartbeat` until 0.3.0 and dropped it: it duplicated the branch tip, and
each refresh left a commit on the node's own branch that forked the tip and read as work.
