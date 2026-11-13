# Checkpoint prompt template

The brain runs on a schedule. crew ships no daemon — use the host's own scheduled-task feature (Claude Code scheduled tasks, cron, Task Scheduler, whatever the host offers) and give it this prompt.

Fill in every `<...>`. Everything project-specific belongs here, not in the crew protocol — the protocol stays the same across projects, this prompt is where a project's own review standards live.

A reasonable interval is 10–30 minutes while work is in flight. Shorter does not make nodes faster; it just produces emptier checks.

---

```
Checkpoint for <project>. You are the brain (id `<brain-id>`). Reply to the user in <language>.

Fetch origin. Read your cursor from <where you keep it>: the last entry ID processed per node,
and the last reviewed commit SHA.

1. New entries — read every node file past your cursor, P0 first then by ID:
   <list the node files and branches>
   Give each entry one outcome: ack / answer / done / rejected / needs-owner relay.
   You are the only writer of coordination/brain-to-nodes.md.
   Decide <what this project lets the brain decide> yourself, preferring <the evidence source
   this project trusts> over preference.

2. Code review — whenever there are new commits past the last reviewed SHA, on <the integration
   branch> and the active lane branches, review the diff itself, not the node's report. Check:
   <the project's own review list — naming rules, file size limits, boundary types, test ratio,
    evidence attached to claims, scope creep, checklist items marked done without evidence>

3. <Any project-specific standing review — schema design, API contract, UI fidelity. Delete this
   section if the project has none.>

4. Open threads to keep moving:
   <the current asks, blockers and decisions this project is waiting on>

5. Registry — read coordination/nodes.yml. For every heartbeat past <timeout>, name the node and
   the task it holds, and decide: grant a takeover, or wait. Only you grant one.

6. Output — findings exist: post ONE consolidated entry with the asks ranked, and tell the user
   the findings and suggestions in <language>. Nothing new in the channel and no new commits:
   write no entry, say so in one line.

7. Push your entry on <brain-branch>, confirm with `git log origin/<brain-branch>..HEAD`, then
   update your cursor: last entry ID per node, last reviewed commit.
```

---

**Keep step 6's silence rule.** A checkpoint that writes an entry every time it runs fills the log with receipts, and nodes learn to skim — which is exactly when they miss a P0.
