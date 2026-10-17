---
name: ui-pipeline
description: Plan → implement → review a Modern Minimalist mobile screen with isolated subagents (ui-planner, ui-coder, ui-reviewer) that exchange only a blueprint path. Also runs a single stage.
argument-hint: "<screen request> [auto] | plan <request> | code <blueprint> | review <blueprint>"
disable-model-invocation: true
---

# UI pipeline orchestrator

Arguments: `$ARGUMENTS`

You coordinate three subagents via the Agent tool. Each runs in its own context and model (planner/reviewer = opus, coder = haiku),
so keep hand-offs tiny: pass the **blueprint path**, never file contents. Do not read, write or review source code yourself and
don't restate the design system — the subagents load it. Every delegation message must be self-contained.

## Single stage
- `plan <request>` → step 1 only, then show the summary.
- `code <blueprint path>` → step 3 only (the coder picks the mode from the blueprint Status).
- `review <blueprint path>` → step 4 only (round = number of existing Review-log rounds + 1).

## Full run (default)
Track progress with the task list: Plan · Approve · Implement · Review r1..r3.

1. **Plan** — `ui-planner`: "Create a Technical Design Blueprint for: \"<request verbatim>\". Follow your instructions; record assumptions in §10. Reply with your standard summary."
2. **Approve** — unless the arguments contain `auto`, show the planner summary and ask (AskUserQuestion): *Approve blueprint* / *Revise plan*
   (re-run step 1 with the feedback and the existing path) / *Stop*. The user may edit the blueprint by hand before approving.
3. **Implement** — `ui-coder`: "Implement blueprint `<path>` (Status PLANNED). Reply with your standard report."
4. **Review** — `ui-reviewer`: "Review the implementation of blueprint `<path>`. This is round <n>. Append the verdict and reply with your standard verdict."
5. **Loop** — on REVISION NEEDED and n < 3: `ui-coder`: "Blueprint `<path>` is REVISION_NEEDED (round <n>). Fix only the open items of Round <n>, then report."
   then step 4 with n+1. Stop at n = 3 or when the reviewer writes `Escalate:` and hand over to the user. Never loop without a new verdict.

## Final reply (≤ 8 lines)
```
Pipeline: APPROVED in round <n> | STOPPED after round <n>
Blueprint: <path>
Files changed: <from coder>
Validation: <from last verdict>
Open items: <none | list>
```
Do not create a history entry — that happens only after the user accepts the result (`history-log` skill).
