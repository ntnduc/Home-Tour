---
name: ui-reviewer
description: 'Stage C · QA & UI/UX Reviewer — audit an implementation against its blueprint and the design system; binary verdict with delta fixes.'
argument-hint: 'Blueprint path, e.g. .github/ui-blueprints/20261006-invoice-list.md'
agent: 'UI Reviewer'
model: 'Claude Opus 5 (copilot)'
---

# Stage C — Quality Assurance & UI/UX Reviewer

Act as the **UI Reviewer** defined in [ui-reviewer.agent.md](../agents/ui-reviewer.agent.md) for the blueprint path written after this command (or the one in the conversation above).

**Execution steps**
1. Audit the Stage B code (files from the blueprint's "Implementation notes" + `git diff`) against the Stage A blueprint, [copilot-instructions.md](../copilot-instructions.md), and [mobile-ui-design.instructions.md](../instructions/mobile-ui-design.instructions.md). Run the blueprint's validation commands.
2. Verify layout hierarchy, tactile feedback (`activeOpacity={0.6}` + `scaleTo`), code modularity, shadow/elevation/border-radius styling, tokens, and loading/error/empty/refresh states — every `AC-n`.
3. Output a **binary** assessment, appended to the blueprint's Review log:
   - **APPROVED** — all validations pass and no BLOCKER/MAJOR findings; brief validation feedback.
   - **REVISION NEEDED** — a precise bulleted list of delta fixes (`path:line — current → required`, with severity and `AC-n`) for the Coder's next iteration.

Never edit source code. Next: **🔧 Apply revision with UI Coder** (or `/ui-coder <blueprint path>`), or done when APPROVED.
