---
name: ui-coder
description: 'Stage B · Implementation Coder — implement a UI blueprint (or the latest reviewer revision list) with production-ready React Native/TypeScript.'
argument-hint: 'Blueprint path, e.g. .github/ui-blueprints/20261006-invoice-list.md'
agent: 'UI Coder'
model: 'Claude Haiku 4.5 (copilot)'
---

# Stage B — Implementation Coder

Act as the **UI Coder** defined in [ui-coder.agent.md](../agents/ui-coder.agent.md) for the blueprint path written after this command (or the one in the conversation above).

**Execution steps**
1. Ingest the **Technical Design Blueprint**. Status `PLANNED` → implement its steps in order; Status `REVISION_NEEDED (round n)` → fix only the open items of that review round.
2. Write production-ready, **zero-placeholder** TypeScript React Native code (no `TODO`, mock data, `any`, or commented-out code).
3. Strictly enforce the design system from [copilot-instructions.md](../copilot-instructions.md) and [mobile-ui-design.instructions.md](../instructions/mobile-ui-design.instructions.md):
   - `StyleSheet.create` + `@/theme` tokens only (no `className`, no hex);
   - `borderRadius ≥ 20` on cards; soft / medium / hero shadow tiers **with Android `elevation`**;
   - `PressableScale` / `activeOpacity={0.6}` on every touchable;
   - per-section skeleton / error / empty states and `RefreshControl`;
   - a JSDoc design note on every exported component and hook.
4. Run the blueprint's validation commands, fill its "Implementation notes", set Status `IMPLEMENTED`.

Reply with the short report only — do not paste code. Next: **🔍 Stage C · Review with UI Reviewer** (or `/ui-reviewer <blueprint path>`).
