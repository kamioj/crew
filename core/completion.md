# When is it finished?

The channel, the registry, the heartbeats and the takeover sequence all exist to keep work moving. **None of them says when to stop.** A protocol that only defines flow runs forever, and two failures follow from that, both observed in the field:

- a node reported "coordinating per crew, heartbeat and entries pushed" as its progress — protocol compliance mistaken for delivery
- a brain's checkpoint polled on a schedule with no exit, so even with everything done nobody would have declared it

The fix is not more enforcement. It is writing down the end.

## Every project writes its own definition of done

It goes in `coordination/README.md`, next to the branches and the timeout, because it is a project
setting rather than a protocol rule. **Entries announce and revise it; they never hold it** — an
entry is buried by the next two hundred, and a session that joins in month three reads the settings
file, not the log. Levels are useful — a milestone you can demo is not the same as something shippable:

```markdown
## Definition of done

- **M1 · feature complete** — every work package in <checklist> closed with evidence;
  no open P0/P1 entries; the integration branch builds and its tests pass.
- **M2 · shippable** — M1, plus external acceptance recorded for <the integrations that
  need real credentials>, and the deploy rehearsed on <environment>.

Declared by: the brain, against this list. Accepted by: the owner.
```

Without it, "are we done?" has no answer anyone can check, and the question only gets asked when the user runs out of patience.

## The brain checks the end first

At every checkpoint, **before** triaging entries, evaluate the definition of done. Met → run the final acceptance, report it to the owner, and **stop polling**. Not met → carry on with the normal pass.

A checkpoint that never asks this question is an infinite loop with extra steps. `templates/checkpoint.md` puts it as step 0 for exactly this reason.

## Protocol compliance is not a deliverable

For a node, this is the rule that matters: **a heartbeat, an `ack`, a pushed entry and a correctly named branch are not progress.** They are the cost of being reachable. Progress is the thing the task's `Acceptance` named — an endpoint that answers, a test that passes, a page that renders.

Never report compliance as status. "Registered as be-codex, heartbeat current, entries pushed" tells the owner nothing about whether the work advanced, and it reads as progress to anyone skimming, which makes it worse than silence.

A `done` entry carries what the acceptance asked for, with evidence. If the acceptance is not met, the honest entry is `in-progress` or `blocked`.

## Why this is the gap enforcement cannot close

crew ships no scripts and no hooks, and the obvious worry is that nodes will break the rules — forget to push, skip a heartbeat. In practice the first real failure was the opposite: **nodes followed the rules exactly and treated that as the output.** No pre-push check or hook would have caught it. Only a written finish line does.
